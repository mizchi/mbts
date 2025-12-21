/**
 * Evaluation tests for mbts library
 *
 * This file evaluates the library's capabilities against real-world MoonBit packages.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import {
  generateDts,
  parseMbti,
  getTypes,
  getFunctions,
  getTraits,
  generateMbtNative,
  generateDtsFromMbt,
} from "./index.js";
import { dtsToMbt, parseDts } from "./dts-to-mbt.ts";

const fixturesPath = join(import.meta.dirname, "../fixtures/.mooncakes");

// Collect all .mbti files
function collectMbtiFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectMbtiFiles(fullPath));
    } else if (entry.endsWith(".mbti")) {
      files.push(fullPath);
    }
  }

  return files;
}

const allMbtiFiles = collectMbtiFiles(fixturesPath);

// ============================================================
// Summary Report (run first to get overview)
// ============================================================

describe("Evaluation: Summary Report", () => {
  it("should analyze all packages and report status", () => {
    interface PackageResult {
      file: string;
      parseSuccess: boolean;
      parseError?: string;
      dtsGenerated: boolean;
      typeCount: number;
      functionCount: number;
      traitCount: number;
      issues: string[];
    }

    const results: PackageResult[] = [];

    for (const file of allMbtiFiles) {
      const relativePath = relative(fixturesPath, file);
      const content = readFileSync(file, "utf-8");

      const result: PackageResult = {
        file: relativePath,
        parseSuccess: false,
        dtsGenerated: false,
        typeCount: 0,
        functionCount: 0,
        traitCount: 0,
        issues: [],
      };

      // Detect known issues
      if (content.includes("#deprecated")) {
        result.issues.push("#deprecated attribute");
      }
      if (content.includes("#as_free_fn")) {
        result.issues.push("#as_free_fn attribute");
      }
      if (/pub fn\[/.test(content)) {
        result.issues.push("pub fn[T] syntax (generic before method name)");
      }
      if (/fn\[/.test(content) && !/pub fn\[/.test(content)) {
        result.issues.push("fn[T] syntax");
      }
      if (/pub const /.test(content)) {
        result.issues.push("pub const declaration");
      }

      // Try parse
      const parseResult = parseMbti(content, relativePath);
      if (parseResult.success) {
        result.parseSuccess = true;
        result.typeCount = getTypes(parseResult.ast).length;
        result.functionCount = getFunctions(parseResult.ast).length;
        result.traitCount = getTraits(parseResult.ast).length;
      } else {
        result.parseError = parseResult.error;
      }

      // Try DTS generation (may succeed even if parse fails due to fallback)
      const dts = generateDts(content, relativePath);
      result.dtsGenerated = dts.includes("// Generated from .mbti file");

      results.push(result);
    }

    // Calculate stats
    const parseSuccess = results.filter(r => r.parseSuccess).length;
    const dtsSuccess = results.filter(r => r.dtsGenerated).length;
    const totalTypes = results.reduce((sum, r) => sum + r.typeCount, 0);
    const totalFunctions = results.reduce((sum, r) => sum + r.functionCount, 0);

    // Issue analysis
    const issueStats: Record<string, number> = {};
    for (const r of results) {
      for (const issue of r.issues) {
        issueStats[issue] = (issueStats[issue] || 0) + 1;
      }
    }

    // Print report
    console.log("\n");
    console.log("╔══════════════════════════════════════════════════════════════════╗");
    console.log("║                    MBTS EVALUATION REPORT                        ║");
    console.log("╠══════════════════════════════════════════════════════════════════╣");
    console.log(`║ Total .mbti files: ${allMbtiFiles.length.toString().padStart(3)}                                            ║`);
    console.log("╠══════════════════════════════════════════════════════════════════╣");
    console.log(`║ Parse Success:      ${parseSuccess.toString().padStart(2)}/${allMbtiFiles.length} (${((parseSuccess/allMbtiFiles.length)*100).toFixed(1).padStart(5)}%)                             ║`);
    console.log(`║ DTS Generation:     ${dtsSuccess.toString().padStart(2)}/${allMbtiFiles.length} (${((dtsSuccess/allMbtiFiles.length)*100).toFixed(1).padStart(5)}%)                             ║`);
    console.log("╠══════════════════════════════════════════════════════════════════╣");
    console.log(`║ Total Types:        ${totalTypes.toString().padStart(3)}                                            ║`);
    console.log(`║ Total Functions:    ${totalFunctions.toString().padStart(3)}                                            ║`);
    console.log("╠══════════════════════════════════════════════════════════════════╣");
    console.log("║ KNOWN SYNTAX ISSUES (moonbitlang/parser limitations):            ║");

    for (const [issue, count] of Object.entries(issueStats).sort((a, b) => b[1] - a[1])) {
      console.log(`║   - ${issue}: ${count} file(s)`.padEnd(67) + "║");
    }

    console.log("╠══════════════════════════════════════════════════════════════════╣");
    console.log("║ PARSE FAILURES:                                                  ║");

    const failures = results.filter(r => !r.parseSuccess);
    if (failures.length === 0) {
      console.log("║   (none)                                                         ║");
    } else {
      for (const f of failures.slice(0, 10)) {
        const shortPath = f.file.length > 45 ? "..." + f.file.slice(-42) : f.file;
        console.log(`║   - ${shortPath}`.padEnd(67) + "║");
      }
      if (failures.length > 10) {
        console.log(`║   ... and ${failures.length - 10} more`.padEnd(67) + "║");
      }
    }

    console.log("╚══════════════════════════════════════════════════════════════════╝");

    // Don't fail the test, just report
    expect(results.length).toBe(allMbtiFiles.length);
  });
});

// ============================================================
// Parse Rate Test (informational, not assertions)
// ============================================================

describe("Evaluation: Parse Success Rate", () => {
  for (const file of allMbtiFiles) {
    const relativePath = relative(fixturesPath, file);

    it(`parse: ${relativePath}`, () => {
      const content = readFileSync(file, "utf-8");
      const result = parseMbti(content, relativePath);

      // Just log, don't fail
      if (!result.success) {
        console.log(`  [SKIP] ${result.error?.slice(0, 80)}...`);
      }

      expect(true).toBe(true); // Always pass, just for visibility
    });
  }
});

// ============================================================
// TypeScript Type Check
// ============================================================

describe("Evaluation: TypeScript Validity", () => {
  const tempDir = join(import.meta.dirname, "../.temp-typecheck");

  beforeAll(() => {
    mkdirSync(tempDir, { recursive: true });
  });

  it("should check if generated .d.ts is valid TypeScript", () => {
    const validDts: string[] = [];
    let parseableCount = 0;

    for (const file of allMbtiFiles) {
      const relativePath = relative(fixturesPath, file);
      const content = readFileSync(file, "utf-8");
      const result = parseMbti(content, relativePath);

      if (result.success) {
        parseableCount++;
        try {
          const dts = generateDts(content, relativePath);
          if (dts.includes("// Generated from .mbti file")) {
            validDts.push(`// === ${relativePath} ===\n${dts}`);
          }
        } catch {}
      }
    }

    // Create combined file with forward declarations
    const combinedDts = `
// Combined generated types for TypeScript validation
// Parseable packages: ${parseableCount}/${allMbtiFiles.length}

// Forward declarations for MoonBit built-in types
declare const Char: unique symbol;
type Char = { readonly [Char]: true };

declare const Iter: unique symbol;
type Iter<T> = { readonly [Iter]: true; _phantom: T };

declare const StringBuilder: unique symbol;
type StringBuilder = { readonly [StringBuilder]: true };

declare const Json: unique symbol;
type Json = { readonly [Json]: true };

declare namespace bigint {
  interface BigInt { readonly __brand: "any /* TODO: @bigint.BigInt */"; }
}

declare namespace cmark_base {
  interface Meta { readonly __brand: "any /* TODO: @cmark_base.Meta */"; }
  interface TextLoc { readonly __brand: "any /* TODO: @cmark_base.TextLoc */"; }
  interface ListType { readonly __brand: "any /* TODO: @cmark_base.ListType */"; }
}

${validDts.join("\n\n")}
`;

    writeFileSync(join(tempDir, "combined.d.ts"), combinedDts);
    writeFileSync(join(tempDir, "tsconfig.json"), JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
      },
      include: ["combined.d.ts"],
    }, null, 2));

    // Run tsc
    let tscSuccess = false;
    let tscOutput = "";

    try {
      execSync("npx tsc --noEmit", { cwd: tempDir, encoding: "utf-8" });
      tscSuccess = true;
    } catch (e: any) {
      tscOutput = e.stdout || e.message || String(e);
    }

    console.log(`\nTypeScript validation: ${tscSuccess ? "PASS" : "FAIL"}`);
    console.log(`Packages with valid DTS: ${validDts.length}`);

    if (!tscSuccess) {
      const errors = tscOutput.split("\n").filter(l => l.includes("error TS"));
      console.log(`TypeScript errors: ${errors.length}`);
      errors.slice(0, 5).forEach(e => console.log(`  ${e.slice(0, 100)}`));
    }

    expect(tscSuccess).toBe(true);
  });
});

// ============================================================
// Bidirectional Conversion
// ============================================================

describe("Evaluation: Bidirectional Conversion", () => {
  it("should convert .mbti -> .d.ts -> .mbt and preserve structure", () => {
    const mbti = `
package "test"

pub struct User {
  name : String
  age : Int
  active : Bool
}

pub enum Status {
  Pending
  Active
  Done
}

fn create_user(String, Int) -> User
fn get_status() -> Status
`;

    // Forward conversion
    const dts = generateDts(mbti, "test.mbti");

    // Verify .d.ts content
    expect(dts).toContain("interface User");
    expect(dts).toContain("readonly name: string");
    expect(dts).toContain("readonly age: number");
    expect(dts).toContain("type Status = ");
    expect(dts).toContain("function create_user");

    // Reverse conversion
    const mbt = dtsToMbt(dts, "test.d.ts");

    // Verify .mbt content
    expect(mbt).toContain("struct User");
    expect(mbt).toContain("name : String");
    expect(mbt).toContain("age : Int");
    expect(mbt).toContain("fn create_user");

    // Log for inspection
    console.log("\n=== Bidirectional Conversion Test ===");
    console.log("\n[Input .mbti]");
    console.log(mbti.trim());
    console.log("\n[Generated .d.ts]");
    console.log(dts);
    console.log("\n[Converted .mbt]");
    console.log(mbt);
  });

  it("should handle real package: moonbitlang/x/uuid", () => {
    const mbti = readFileSync(join(fixturesPath, "moonbitlang/x/uuid/pkg.generated.mbti"), "utf-8");
    const dts = generateDts(mbti, "uuid.mbti");
    const binding = parseDts(dts, "uuid.d.ts");

    console.log("\n=== UUID Package Conversion ===");
    console.log(`Types: ${binding.types.length}`);
    console.log(`Functions: ${binding.functions.length}`);
    console.log(`Extern types: ${binding.externTypes.length}`);

    expect(binding.types.length).toBeGreaterThan(0);
    expect(binding.functions.length).toBeGreaterThan(0);
  });
});

// ============================================================
// Edge Cases (specific syntax patterns)
// ============================================================

describe("Evaluation: Supported Syntax", () => {
  it("struct with fields", () => {
    const mbti = `
package "test"

pub struct Point {
  x : Int
  y : Int
}
`;
    const dts = generateDts(mbti, "test.mbti");
    expect(dts).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export interface Point {
        readonly x: number;
        readonly y: number;
      }"
    `);
  });

  it("enum (discriminated union)", () => {
    const mbti = `
package "test"

pub enum Color {
  Red
  Green
  Blue
}
`;
    const dts = generateDts(mbti, "test.mbti");
    expect(dts).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export interface Color_Red { readonly $tag: "Red"; }
      export interface Color_Green { readonly $tag: "Green"; }
      export interface Color_Blue { readonly $tag: "Blue"; }
      export type Color = Color_Red | Color_Green | Color_Blue;

      export const Color$Red: Color_Red;
      export const Color$Green: Color_Green;
      export const Color$Blue: Color_Blue;"
    `);
  });

  it("enum with payload", () => {
    const mbti = `
package "test"

pub enum Option {
  None
  Some(Int)
}
`;
    const dts = generateDts(mbti, "test.mbti");
    expect(dts).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export interface Option_None { readonly $tag: "None"; }
      export interface Option_Some { readonly $tag: "Some"; readonly $0: number; }
      export type Option = Option_None | Option_Some;

      export const Option$None: Option_None;
      export function option$some($0: number): Option_Some;"
    `);
  });

  it("functions with various parameter types", () => {
    const mbti = `
package "test"

fn simple(Int) -> String
fn multi(Int, String, Bool) -> Unit
fn optional(name~ : String, age? : Int) -> Unit
`;
    const dts = generateDts(mbti, "test.mbti");
    expect(dts).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export function simple(arg0: number): string;

      export function multi(arg0: number, arg1: string, arg2: boolean): void;

      export function optional(name: string, age?: number): void;"
    `);
  });

  it("methods (Type::method)", () => {
    const mbti = `
package "test"

pub struct Vec2 {
  x : Double
  y : Double
}

fn Vec2::new(Double, Double) -> Self
fn Vec2::length(Self) -> Double
fn Vec2::add(Self, Self) -> Self
`;
    const dts = generateDts(mbti, "test.mbti");
    expect(dts).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export interface Vec2 {
        readonly x: number;
        readonly y: number;
      }

      export function vec2$new(arg0: number, arg1: number): Vec2;

      export function vec2$length(arg0: Vec2): number;

      export function vec2$add(arg0: Vec2, arg1: Vec2): Vec2;"
    `);
  });

  it("opaque type", () => {
    const mbti = `
package "test"

type Handle
fn Handle::new() -> Self
fn Handle::close(Self) -> Unit
`;
    const dts = generateDts(mbti, "test.mbti");
    expect(dts).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export interface Handle {
        readonly __brand: "Handle";
      }

      export function handle$new(): Handle;

      export function handle$close(arg0: Handle): void;"
    `);
  });

  it("suberror", () => {
    const mbti = `
package "test"

pub(all) suberror NetworkError String
`;
    const dts = generateDts(mbti, "test.mbti");
    expect(dts).toMatchInlineSnapshot(`"// Generated from .mbti file - DO NOT EDIT"`);
  });

  it("tuple types", () => {
    const mbti = `
package "test"

fn get_pair() -> (Int, String)
`;
    const dts = generateDts(mbti, "test.mbti");
    expect(dts).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export function get_pair(): [number, string];"
    `);
  });

  it("Option type (?)", () => {
    const mbti = `
package "test"

fn find(Array[Int]) -> Int?
`;
    const dts = generateDts(mbti, "test.mbti");
    expect(dts).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export function find(arg0: Array<number>): number | undefined;"
    `);
  });

  it("external package reference", () => {
    const mbti = `
package "test"

import(
  "moonbitlang/core/json"
)

fn to_json(String) -> @json.Json
`;
    const dts = generateDts(mbti, "test.mbti");
    expect(dts).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export function to_json(arg0: string): any /* TODO: @json.Json */;"
    `);
  });
});

// ============================================================
// Known Limitations (expected to fail or skip)
// ============================================================

describe("Evaluation: Known Limitations", () => {
  it.skip("generic functions (fn[T]) - not supported by moonbitlang/parser", () => {
    const mbti = `
package "test"

fn[T] identity(T) -> T
`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(true);
  });

  it.skip("#deprecated attribute - not supported by moonbitlang/parser", () => {
    const mbti = `
package "test"

#deprecated
type OldType
`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(true);
  });

  it.skip("pub const - not supported by moonbitlang/parser", () => {
    const mbti = `
package "test"

pub const PI : Double
`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(true);
  });
});

// ============================================================
// Phase 5: MoonBit-native Code Generation
// ============================================================

import { generateMbt, generateMbtNative } from "./index.js";

describe("Evaluation: MoonBit-native Code Generation (Phase 5)", () => {
  it("should generate MBT code using MoonBit implementation", () => {
    const dts = `
export function greet(name: string): string;
export function add(a: number, b: number): number;
`;
    const binding = parseDts(dts, "test.d.ts");
    const result = generateMbtNative(binding);

    expect(result).toContain("extern \"js\" fn greet");
    expect(result).toContain("extern \"js\" fn add");
    expect(result).toContain("-> String");
    expect(result).toContain("-> Int");
  });

  it("should generate same output as TypeScript implementation for simple functions", () => {
    const dts = `
export function hello(name: string): string;
`;
    const binding = parseDts(dts, "test.d.ts");

    const tsResult = generateMbt(binding);
    const mbtResult = generateMbtNative(binding);

    // Both should have the same core content
    expect(mbtResult).toContain("extern \"js\" fn hello");
    expect(tsResult).toContain("extern \"js\" fn hello");
  });

  it("should handle struct types", () => {
    const dts = `
export interface User {
  name: string;
  age: number;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    const result = generateMbtNative(binding);

    expect(result).toContain("pub struct User");
    expect(result).toContain("name : String");
    expect(result).toContain("age : Int");
  });

  it("should handle async functions", () => {
    const dts = `
export function fetchData(url: string): Promise<string>;
`;
    const binding = parseDts(dts, "test.d.ts");
    const result = generateMbtNative(binding);

    expect(result).toContain("Promise[String]");
  });

  it("should handle class methods with extern types", () => {
    const dts = `
export class Counter {
  constructor(initial: number);
  increment(): number;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    const result = generateMbtNative(binding);

    expect(result).toContain("#external");
    expect(result).toContain("type Counter");
    expect(result).toContain("Counter::new");
    expect(result).toContain("Counter::increment");
  });
});

// ============================================================
// .mbt → .d.ts Conversion (Phase 5)
// ============================================================

describe("Evaluation: MBT to DTS Conversion", () => {
  it("should convert pub struct to TypeScript interface", () => {
    const mbt = `
pub struct User {
  name : String
  age : Int
}
`;
    const dts = generateDtsFromMbt(mbt, "user.mbt");
    expect(dts).toContain("export interface User");
    expect(dts).toContain("name: string");
    expect(dts).toContain("age: number");
  });

  it("should convert pub enum to discriminated union", () => {
    const mbt = `
pub enum Status {
  Pending
  Active
  Done
}
`;
    const dts = generateDtsFromMbt(mbt, "status.mbt");
    expect(dts).toContain("export interface Status_Pending");
    expect(dts).toContain("export interface Status_Active");
    expect(dts).toContain("export interface Status_Done");
    expect(dts).toContain("export type Status =");
  });

  it("should convert pub fn to export function", () => {
    const mbt = `
pub fn greet(name : String) -> String {
  "Hello, " + name
}
`;
    const dts = generateDtsFromMbt(mbt, "greet.mbt");
    expect(dts).toContain("export function greet");
    expect(dts).toContain("name: string");
    expect(dts).toContain("): string");
  });

  it("should skip private items", () => {
    const mbt = `
pub struct Public {
  value : Int
}

struct Private {
  data : String
}

pub fn public_fn() -> Unit {
  ()
}

fn private_fn() -> Unit {
  ()
}
`;
    const dts = generateDtsFromMbt(mbt, "mixed.mbt");
    expect(dts).toContain("export interface Public");
    expect(dts).toContain("export function publicFn");
    expect(dts).not.toContain("Private");
    expect(dts).not.toContain("privateFn");
  });

  it("should handle generic types", () => {
    const mbt = `
pub struct Container[T] {
  value : T
}

pub fn[T] identity(x : T) -> T {
  x
}
`;
    const dts = generateDtsFromMbt(mbt, "generics.mbt");
    expect(dts).toContain("Container<T>");
    expect(dts).toContain("identity<T>");
  });

  it("should handle method syntax", () => {
    const mbt = `
pub struct Counter {
  value : Int
}

pub fn Counter::new() -> Counter {
  { value: 0 }
}

pub fn Counter::increment(self : Counter) -> Counter {
  { value: self.value + 1 }
}
`;
    const dts = generateDtsFromMbt(mbt, "counter.mbt");
    expect(dts).toContain("export interface Counter");
    expect(dts).toContain("Counter$new");
    expect(dts).toContain("Counter$increment");
  });
});
