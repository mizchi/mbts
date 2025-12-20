#!/usr/bin/env node
/**
 * mbts CLI - MoonBit TypeScript Type Generator
 *
 * Commands:
 *   mbts link <moon.pkg.json>  - Update link.js.exports from .mbti
 *   mbts dts <src> --out <dir> - Generate .d.ts from .mbti
 */

import * as fs from "fs";
import * as path from "path";
import {
  extractExportSymbols,
  getExportNames,
  generateDts,
  type ExportSymbol,
} from "./index.js";

// ============================================================
// Utilities
// ============================================================

function findMbtiFile(dir: string): string | null {
  const candidates = ["pkg.generated.mbti", "lib.mbti", "main.mbti"];
  for (const name of candidates) {
    const filePath = path.join(dir, name);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  // Also check for any .mbti file
  const files = fs.readdirSync(dir);
  const mbtiFile = files.find((f) => f.endsWith(".mbti"));
  if (mbtiFile) {
    return path.join(dir, mbtiFile);
  }
  return null;
}

function getPackageName(dir: string): string {
  const moonPkgPath = path.join(dir, "moon.pkg.json");
  if (fs.existsSync(moonPkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(moonPkgPath, "utf8"));
      if (pkg.name) return pkg.name;
    } catch {
      // ignore
    }
  }
  return path.basename(dir);
}

// ============================================================
// Commands
// ============================================================

interface LinkOptions {
  includeMethods?: boolean;
  targets?: ("js" | "wasm" | "wasm-gc")[];
  dryRun?: boolean;
}

/**
 * Update moon.pkg.json with exports from .mbti
 */
async function linkCommand(
  moonPkgPath: string,
  options: LinkOptions = {}
): Promise<void> {
  const { includeMethods = true, targets = ["js"], dryRun = false } = options;

  // Resolve paths
  const resolvedPath = path.resolve(moonPkgPath);
  let pkgDir: string;
  let pkgJsonPath: string;

  if (resolvedPath.endsWith("moon.pkg.json")) {
    pkgJsonPath = resolvedPath;
    pkgDir = path.dirname(resolvedPath);
  } else {
    pkgDir = resolvedPath;
    pkgJsonPath = path.join(pkgDir, "moon.pkg.json");
  }

  // Find .mbti file
  const mbtiPath = findMbtiFile(pkgDir);
  if (!mbtiPath) {
    console.error(`Error: No .mbti file found in ${pkgDir}`);
    console.error("Run 'moon info' first to generate .mbti files.");
    process.exit(1);
  }

  // Read .mbti content
  const mbtiContent = fs.readFileSync(mbtiPath, "utf8");

  // Extract export names
  const exports = getExportNames(mbtiContent, {
    includeMethods,
    publicOnly: true,
  });

  if (exports.length === 0) {
    console.warn("Warning: No public functions found to export.");
  }

  // Read existing moon.pkg.json or create new one
  let moonPkg: Record<string, unknown> = {};
  if (fs.existsSync(pkgJsonPath)) {
    try {
      moonPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    } catch (e) {
      console.error(`Error: Failed to parse ${pkgJsonPath}`);
      process.exit(1);
    }
  }

  // Update link section
  const link = (moonPkg.link as Record<string, unknown>) || {};
  for (const target of targets) {
    const targetConfig = (link[target] as Record<string, unknown>) || {};
    targetConfig.exports = exports;
    link[target] = targetConfig;
  }
  moonPkg.link = link;

  // Output
  const output = JSON.stringify(moonPkg, null, 2);
  if (dryRun) {
    console.log("=== Would write to", pkgJsonPath, "===");
    console.log(output);
  } else {
    fs.writeFileSync(pkgJsonPath, output + "\n");
    console.log(`Updated ${pkgJsonPath}`);
    console.log(`  Exports: ${exports.length} functions`);
    console.log(`  Targets: ${targets.join(", ")}`);
  }
}

interface DtsOptions {
  out?: string;
  namespace?: boolean;
  preamble?: boolean;
  naming?: "preserve" | "camelCase";
}

/**
 * Generate .d.ts from .mbti
 */
async function dtsCommand(
  srcPath: string,
  options: DtsOptions = {}
): Promise<void> {
  const { out, namespace = false, preamble = false, naming = "preserve" } = options;

  // Resolve source path
  const resolvedSrc = path.resolve(srcPath);
  let srcDir: string;

  if (fs.statSync(resolvedSrc).isDirectory()) {
    srcDir = resolvedSrc;
  } else {
    srcDir = path.dirname(resolvedSrc);
  }

  // Find .mbti file
  const mbtiPath = findMbtiFile(srcDir);
  if (!mbtiPath) {
    console.error(`Error: No .mbti file found in ${srcDir}`);
    console.error("Run 'moon info' first to generate .mbti files.");
    process.exit(1);
  }

  // Determine output directory
  const outDir = out ? path.resolve(out) : srcDir;
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Get package name for output file name
  const pkgName = getPackageName(srcDir);
  const outputFileName = `${pkgName}.d.ts`;
  const outputPath = path.join(outDir, outputFileName);

  // Read .mbti content
  const mbtiContent = fs.readFileSync(mbtiPath, "utf8");

  // Generate .d.ts
  const dts = generateDts(mbtiContent, path.basename(mbtiPath), {
    namespace,
    preamble,
    naming,
  });

  // Write output
  fs.writeFileSync(outputPath, dts);
  console.log(`Generated ${outputPath}`);

  // Also extract symbols for info
  const symbols = extractExportSymbols(mbtiContent);
  const publicFns = symbols.filter((s) => s.isPublic);
  const genericFns = publicFns.filter((s) => s.typeParams.length > 0);
  console.log(
    `  Functions: ${publicFns.length} (${genericFns.length} with generics)`
  );
}

// ============================================================
// CLI Parser
// ============================================================

function printUsage(): void {
  console.log(`
mbts - MoonBit TypeScript Type Generator

Usage:
  mbts link <path>              Update moon.pkg.json with exports from .mbti
  mbts dts <src> [--out <dir>]  Generate .d.ts from .mbti

Commands:
  link    Update moon.pkg.json's link.js.exports section
          <path> can be a directory or moon.pkg.json path

  dts     Generate TypeScript definition file
          <src> is the source directory containing .mbti

Options:
  --out <dir>       Output directory for generated files
  --no-methods      Exclude methods from exports (link command)
  --targets <list>  Comma-separated targets: js,wasm,wasm-gc (default: js)
  --namespace       Wrap output in namespace (dts command)
  --preamble        Include runtime type preamble (dts command)
  --naming <type>   Function naming: preserve (default) or camelCase
  --dry-run         Show what would be done without writing files
  --help, -h        Show this help message

Examples:
  # Update exports after running 'moon info'
  $ moon info
  $ mbts link src/moon.pkg.json

  # Generate .d.ts to js/ directory
  $ mbts dts src --out js

  # Export for multiple targets
  $ mbts link src --targets js,wasm-gc

  # Exclude methods (only top-level functions)
  $ mbts link src --no-methods
`);
}

function parseArgs(args: string[]): {
  command: string;
  positional: string[];
  options: Record<string, string | boolean>;
} {
  const positional: string[] = [];
  const options: Record<string, string | boolean> = {};
  let command = "";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith("-")) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith("-")) {
      const key = arg.slice(1);
      options[key] = true;
    } else if (!command) {
      command = arg;
    } else {
      positional.push(arg);
    }
  }

  return { command, positional, options };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { command, positional, options } = parseArgs(args);

  if (options.help || options.h || args.length === 0) {
    printUsage();
    process.exit(0);
  }

  switch (command) {
    case "link": {
      const target = positional[0];
      if (!target) {
        console.error("Error: Missing path argument for 'link' command");
        console.error("Usage: mbts link <path>");
        process.exit(1);
      }
      const targets = options.targets
        ? (options.targets as string).split(",") as ("js" | "wasm" | "wasm-gc")[]
        : ["js"];
      await linkCommand(target, {
        includeMethods: !options["no-methods"],
        targets,
        dryRun: !!options["dry-run"],
      });
      break;
    }

    case "dts": {
      const src = positional[0];
      if (!src) {
        console.error("Error: Missing source path argument for 'dts' command");
        console.error("Usage: mbts dts <src> [--out <dir>]");
        process.exit(1);
      }
      const naming = options.naming === "camelCase" ? "camelCase" : "preserve";
      await dtsCommand(src, {
        out: options.out as string | undefined,
        namespace: !!options.namespace,
        preamble: !!options.preamble,
        naming,
      });
      break;
    }

    default:
      console.error(`Error: Unknown command '${command}'`);
      printUsage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
