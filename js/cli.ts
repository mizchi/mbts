#!/usr/bin/env node
/**
 * mbts CLI - MoonBit TypeScript Type Generator
 *
 * Commands:
 *   mbts link <moon.pkg.json>  - Update link.js.exports from .mbti
 *   mbts dts <src> --out <dir> - Generate .d.ts from .mbti
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import {
  extractExportSymbols,
  extractFunctionSignatures,
  getExportNames,
  generateDts,
  generateMbtiGlueCode,
  parseDts,
  generateMbt,
  generateMbti,
  type ExportSymbol,
  type FunctionSignature,
} from "./index.ts";

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

  // Extract function signatures for glue code generation
  const signatures = extractFunctionSignatures(mbtiContent);

  // Generate glue code for functions with type parameters
  const glueResult = generateMbtiGlueCode(signatures);
  const gluePath = path.join(pkgDir, "__jsglue.mbt");

  // Build export list with wrapper substitutions
  const wrapperMap = new Map<string, string>();
  for (const exp of glueResult.exports) {
    wrapperMap.set(exp.original, exp.wrapper);
  }

  // Get base export names
  const baseExports = getExportNames(mbtiContent, {
    includeMethods,
    publicOnly: true,
  });

  // Substitute wrapper names for generic functions
  const exports = baseExports.map((name) => {
    // Convert Type$method format back to Type::method for lookup
    const originalName = name.replace("$", "::");
    return wrapperMap.get(originalName) || name;
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
    if (glueResult.exports.length > 0) {
      console.log("\n=== Would write to", gluePath, "===");
      console.log(glueResult.code);
    }
  } else {
    fs.writeFileSync(pkgJsonPath, output + "\n");
    console.log(`Updated ${pkgJsonPath}`);
    console.log(`  Exports: ${exports.length} functions`);
    console.log(`  Targets: ${targets.join(", ")}`);

    // Write glue code if there are wrapped functions
    if (glueResult.exports.length > 0) {
      fs.writeFileSync(gluePath, glueResult.code);
      console.log(`Generated ${gluePath}`);
      console.log(`  Wrapped: ${glueResult.exports.length} generic functions`);
    } else {
      // Remove existing glue file if no longer needed
      if (fs.existsSync(gluePath)) {
        fs.unlinkSync(gluePath);
        console.log(`Removed ${gluePath} (no generic functions to wrap)`);
      }
    }
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

interface MbtOptions {
  out?: string;
  package?: string;
  mbti?: boolean;
}

interface NewOptions {
  user: string;
}

interface BuildOptions {
  out?: string;
  naming?: "preserve" | "camelCase";
}

/**
 * Create a new MoonBit project with mbts configuration
 */
async function newCommand(
  pkgName: string,
  options: NewOptions
): Promise<void> {
  let { user } = options;

  if (!user) {
    user = "username";
    console.warn("Warning: --user not specified, using 'username' as default");
  }

  // Create directory
  const projectDir = path.resolve(pkgName);
  if (fs.existsSync(projectDir)) {
    console.error(`Error: Directory '${pkgName}' already exists`);
    process.exit(1);
  }

  fs.mkdirSync(projectDir, { recursive: true });

  // Generate moon.mod.json
  const moonMod = {
    name: `${user}/${pkgName}`,
    version: "0.0.1",
    license: "MIT",
    deps: {
      "mizchi/js": "0.10.3",
    },
    "preferred-target": "js",
  };
  fs.writeFileSync(
    path.join(projectDir, "moon.mod.json"),
    JSON.stringify(moonMod, null, 2) + "\n"
  );

  // Generate moon.pkg.json
  const moonPkg = {
    import: ["mizchi/js"],
    link: {
      js: {
        exports: [],
      },
    },
  };
  fs.writeFileSync(
    path.join(projectDir, "moon.pkg.json"),
    JSON.stringify(moonPkg, null, 2) + "\n"
  );

  // Generate {pkgName}.mbt
  const libMbt = `// ${pkgName} - Generated by mbts

pub fn hello() -> String {
  "Hello from ${pkgName}!"
}
`;
  fs.writeFileSync(path.join(projectDir, `${pkgName}.mbt`), libMbt);

  // Generate .gitignore
  const gitignore = `.mooncakes
target
dist
`;
  fs.writeFileSync(path.join(projectDir, ".gitignore"), gitignore);

  // Generate README.md
  const readme = `# ${pkgName}

## Build

\`\`\`bash
moon update
mbts build .
\`\`\`

## License

MIT
`;
  fs.writeFileSync(path.join(projectDir, "README.md"), readme);

  console.log(`Created new MoonBit project: ${pkgName}/`);
  console.log(`  moon.mod.json  - Module config (${user}/${pkgName})`);
  console.log(`  moon.pkg.json  - Package config`);
  console.log(`  ${pkgName}.mbt - Source file`);
  console.log(`  .gitignore     - Git ignore`);
  console.log(`  README.md      - Documentation`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${pkgName}`);
  console.log(`  moon update`);
  console.log(`  mbts build .`);
}

/**
 * Get module name from moon.mod.json
 */
function getModuleName(dir: string): string | null {
  const moonModPath = path.join(dir, "moon.mod.json");
  if (fs.existsSync(moonModPath)) {
    try {
      const mod = JSON.parse(fs.readFileSync(moonModPath, "utf8"));
      return mod.name || null;
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Generate JS glue code that re-exports from the built module
 */
function generateJsGlue(
  exports: string[],
  moduleName: string,
  outDir: string = "dist"
): string {
  // MoonBit builds to: target/js/release/build/{pkgName}.js
  // where pkgName is the last part of the module name (after /)
  const pkgName = moduleName.includes("/")
    ? moduleName.split("/").pop()!
    : moduleName;

  // Calculate relative path from outDir to target
  const depth = outDir.split("/").filter(Boolean).length;
  const prefix = "../".repeat(depth);
  const relativePath = `${prefix}target/js/release/build/${pkgName}.js`;

  const lines = [
    "// Generated by mbts build - DO NOT EDIT",
    `export { ${exports.join(", ")} } from "${relativePath}";`,
  ];

  return lines.join("\n") + "\n";
}

/**
 * Generate package.json for distribution
 */
function generateDistPackageJson(pkgName: string, outDir: string): string {
  const pkg = {
    name: pkgName,
    type: "module",
    license: "MIT",
    exports: {
      ".": {
        types: `./${outDir}/${pkgName}.d.ts`,
        default: `./${outDir}/${pkgName}.js`,
      },
    },
    files: [
      outDir,
      "target/js/release/build",
    ],
  };
  return JSON.stringify(pkg, null, 2) + "\n";
}

/**
 * Run moon check, moon info, mbts link, moon build, and generate dist files
 */
async function buildCommand(
  targetPath: string,
  options: BuildOptions = {}
): Promise<void> {
  const { naming = "preserve" } = options;
  const outDir = options.out || "dist";

  const resolvedPath = path.resolve(targetPath);
  let pkgDir: string;

  if (fs.statSync(resolvedPath).isDirectory()) {
    pkgDir = resolvedPath;
  } else {
    pkgDir = path.dirname(resolvedPath);
  }

  const runCommand = (cmd: string, description: string): boolean => {
    console.log(`\n> ${description}`);
    console.log(`$ ${cmd}`);
    try {
      execSync(cmd, { cwd: pkgDir, stdio: "inherit" });
      return true;
    } catch (error) {
      console.error(`Error: ${description} failed`);
      return false;
    }
  };

  // Get module name for JS glue generation
  const moduleName = getModuleName(pkgDir);
  if (!moduleName) {
    console.error("Error: Could not find module name in moon.mod.json");
    process.exit(1);
  }

  const pkgName = getPackageName(pkgDir);

  // Step 1: moon check
  if (!runCommand("moon check", "Type checking")) {
    process.exit(1);
  }

  // Step 2: moon info (generates .mbti)
  if (!runCommand("moon info", "Generating .mbti")) {
    process.exit(1);
  }

  // Step 3: mbts link (generates __jsglue.mbt for generic functions)
  console.log("\n> Updating exports");
  await linkCommand(pkgDir, { includeMethods: true, targets: ["js"] });

  // Step 4: moon build --target js (now includes __jsglue.mbt)
  if (!runCommand("moon build --target js", "Building for JS target")) {
    process.exit(1);
  }

  // Create output directory
  const distPath = path.join(pkgDir, outDir);
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  // Step 5: Generate .d.ts to dist/
  console.log("\n> Generating .d.ts");
  await dtsCommand(pkgDir, { out: distPath, naming });

  // Step 6: Generate JS glue code to dist/
  console.log("\n> Generating JS glue");
  const mbtiPath = findMbtiFile(pkgDir);
  if (mbtiPath) {
    const mbtiContent = fs.readFileSync(mbtiPath, "utf8");
    const exports = getExportNames(mbtiContent, {
      includeMethods: true,
      publicOnly: true,
    });

    if (exports.length > 0) {
      const jsGluePath = path.join(distPath, `${pkgName}.js`);
      const jsGlue = generateJsGlue(exports, moduleName, outDir);
      fs.writeFileSync(jsGluePath, jsGlue);
      console.log(`Generated ${jsGluePath}`);
      console.log(`  Exports: ${exports.length} functions`);
    }
  }

  // Step 7: Generate package.json for distribution (at root)
  console.log("\n> Generating package.json");
  const rootPkgJsonPath = path.join(pkgDir, "package.json");
  const distPkgJson = generateDistPackageJson(pkgName, outDir);
  fs.writeFileSync(rootPkgJsonPath, distPkgJson);
  console.log(`Generated ${rootPkgJsonPath}`);

  console.log("\n✓ Build completed successfully");
  console.log(`  Output: ${distPath}/`);
}

/**
 * Generate .mbt (and optionally .mbti) from .d.ts
 */
async function mbtCommand(
  dtsPath: string,
  options: MbtOptions = {}
): Promise<void> {
  const { out, package: packageName, mbti: generateMbtiFile = false } = options;

  // Resolve source path
  const resolvedSrc = path.resolve(dtsPath);

  if (!fs.existsSync(resolvedSrc)) {
    console.error(`Error: File not found: ${resolvedSrc}`);
    process.exit(1);
  }

  if (!resolvedSrc.endsWith(".d.ts") && !resolvedSrc.endsWith(".ts")) {
    console.error("Error: Input file must be a .d.ts or .ts file");
    process.exit(1);
  }

  // Determine output directory
  const srcDir = path.dirname(resolvedSrc);
  const outDir = out ? path.resolve(out) : srcDir;
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Determine output file names
  const baseName = path.basename(resolvedSrc).replace(/\.d\.ts$/, "").replace(/\.ts$/, "");
  const mbtOutputPath = path.join(outDir, `${baseName}.mbt`);
  const mbtiOutputPath = path.join(outDir, `${baseName}.mbti`);

  // Read .d.ts content
  const dtsContent = fs.readFileSync(resolvedSrc, "utf8");

  // Parse and generate
  const binding = parseDts(dtsContent, path.basename(resolvedSrc), {
    packageName: packageName || "",
  });

  // Generate .mbt
  const mbtCode = generateMbt(binding);
  fs.writeFileSync(mbtOutputPath, mbtCode);
  console.log(`Generated ${mbtOutputPath}`);

  // Optionally generate .mbti
  if (generateMbtiFile) {
    const mbtiCode = generateMbti(binding);
    fs.writeFileSync(mbtiOutputPath, mbtiCode);
    console.log(`Generated ${mbtiOutputPath}`);
  }

  // Print summary
  console.log(`  Types: ${binding.types.length}`);
  console.log(`  Functions: ${binding.functions.length}`);
  console.log(`  Extern types: ${binding.externTypes.length}`);
}

// ============================================================
// CLI Parser
// ============================================================

function printUsage(): void {
  console.log(`
mbts - MoonBit TypeScript Type Generator

Usage:
  mbts new <pkgname> --user <name>  Create a new MoonBit project
  mbts build <path>                 Build project (check, build, link, dts)
  mbts link <path>                  Update moon.pkg.json with exports from .mbti
  mbts dts <src> [--out <dir>]      Generate .d.ts from .mbti
  mbts mbt <file.d.ts> [options]    Generate .mbt from .d.ts

Commands:
  new     Create a new MoonBit project with mizchi/js dependency
          <pkgname> is the project directory name
          --user <name> is required for module naming (user/pkgname)

  build   Run full build pipeline:
          moon check -> moon build --target js -> moon info -> mbts link -> mbts dts

  link    Update moon.pkg.json's link.js.exports section
          <path> can be a directory or moon.pkg.json path

  dts     Generate TypeScript definition file from .mbti
          <src> is the source directory containing .mbti

  mbt     Generate MoonBit FFI bindings from .d.ts
          <file.d.ts> is the TypeScript definition file

Options:
  --user <name>     Username for module naming (new command, required)
  --out <dir>       Output directory for generated files
  --package <name>  Package name for generated .mbt file (mbt command)
  --mbti            Also generate .mbti interface file (mbt command)
  --no-methods      Exclude methods from exports (link command)
  --targets <list>  Comma-separated targets: js,wasm,wasm-gc (default: js)
  --namespace       Wrap output in namespace (dts command)
  --preamble        Include runtime type preamble (dts command)
  --naming <type>   Function naming: preserve (default) or camelCase
  --dry-run         Show what would be done without writing files
  --help, -h        Show this help message

Examples:
  # Create a new project
  $ mbts new myapp --user myname
  $ cd myapp && moon update && moon check

  # Full build pipeline
  $ mbts build .

  # Generate .mbt from .d.ts
  $ mbts mbt lib.d.ts --out src --package myapp

  # Generate .mbt and .mbti together
  $ mbts mbt lib.d.ts --mbti

  # Update exports after running 'moon info'
  $ moon info
  $ mbts link src/moon.pkg.json

  # Generate .d.ts to js/ directory
  $ mbts dts src --out js

  # Export for multiple targets
  $ mbts link src --targets js,wasm-gc
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
    case "new": {
      const pkgName = positional[0];
      if (!pkgName) {
        console.error("Error: Missing package name argument for 'new' command");
        console.error("Usage: mbts new <pkgname> --user <username>");
        process.exit(1);
      }
      await newCommand(pkgName, {
        user: options.user as string,
      });
      break;
    }

    case "build": {
      const target = positional[0] || ".";
      const naming = options.naming === "camelCase" ? "camelCase" : "preserve";
      await buildCommand(target, {
        out: options.out as string | undefined,
        naming,
      });
      break;
    }

    case "link": {
      const target = positional[0];
      if (!target) {
        console.error("Error: Missing path argument for 'link' command");
        console.error("Usage: mbts link <path>");
        process.exit(1);
      }
      const targets: ("js" | "wasm" | "wasm-gc")[] = options.targets
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

    case "mbt": {
      const dtsFile = positional[0];
      if (!dtsFile) {
        console.error("Error: Missing .d.ts file argument for 'mbt' command");
        console.error("Usage: mbts mbt <file.d.ts> [--out <dir>] [--package <name>] [--mbti]");
        process.exit(1);
      }
      await mbtCommand(dtsFile, {
        out: options.out as string | undefined,
        package: options.package as string | undefined,
        mbti: !!options.mbti,
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
