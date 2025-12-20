import { describe, it, expect } from "vitest";
import {
  generateDts,
  generateDtsNamespace,
  generateDtsWithPreamble,
  parseMbti,
  parseMbtiOrThrow,
  getTypes,
  getFunctions,
  getTraits,
  getTypeName,
} from "./index.js";

describe("generateDts", () => {
  it("should generate interface from struct", () => {
    const mbti = `
package "test"

pub struct User {
  name : String
  age : Int
}
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toContain("export interface User");
    expect(result).toContain("readonly name: string");
    expect(result).toContain("readonly age: number");
  });

  it("should generate discriminated union from enum", () => {
    const mbti = `
package "test"

pub enum Status {
  Pending
  Active
  Done
}
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toContain("export interface Status_Pending");
    expect(result).toContain("export interface Status_Active");
    expect(result).toContain("export interface Status_Done");
    expect(result).toContain('readonly $tag: "Pending"');
    expect(result).toContain("export type Status = Status_Pending | Status_Active | Status_Done");
  });

  it("should generate enum with payload", () => {
    const mbti = `
package "test"

pub enum Result {
  Ok(String)
  Err(String)
}
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toContain("export interface Result_Ok");
    expect(result).toContain("readonly $0: string");
    expect(result).toContain("export function Result$Ok($0: string): Result_Ok");
  });

  it("should generate function signatures", () => {
    const mbti = `
package "test"

fn hello(String) -> String
fn add(Int, Int) -> Int
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toContain("export function hello(arg0: string): string");
    expect(result).toContain("export function add(arg0: number, arg1: number): number");
  });

  it("should convert snake_case to camelCase", () => {
    const mbti = `
package "test"

fn get_user_name(String) -> String
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toContain("export function getUserName");
  });

  it("should handle methods as Type$method", () => {
    const mbti = `
package "test"

pub struct Position {
  x : Int
  y : Int
}
fn Position::new(Int, Int) -> Self
fn Position::distance(Self) -> Int
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toContain("export function Position$new");
    expect(result).toContain("export function Position$distance");
    // Self should be replaced with Position
    expect(result).toContain("): Position");
    expect(result).toContain("arg0: Position");
  });

  it("should handle optional parameters", () => {
    const mbti = `
package "test"

fn greet(name~ : String, greeting? : String) -> String
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toContain("name: string");
    expect(result).toContain("greeting?: string");
  });

  it("should handle generic types", () => {
    const mbti = `
package "test"

fn[T] identity(T) -> T
fn[A, B] map(Array[A], (A) -> B) -> Array[B]
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toContain("export function identity<T>");
    expect(result).toContain("export function map<A, B>");
  });

  it("should skip TypeScript built-in types", () => {
    const mbti = `
package "test"

pub type Promise[T]
pub type Error
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toContain("// Using TypeScript built-in: Promise");
    expect(result).toContain("// Using TypeScript built-in: Error");
    expect(result).not.toContain("export interface Promise");
  });
});

describe("generateDtsNamespace", () => {
  it("should wrap output in namespace", () => {
    const mbti = `
package "moonbitlang/parser/basic"

pub struct Position {
  line : Int
  column : Int
}
`;
    const result = generateDtsNamespace(mbti, "basic.mbti");
    expect(result).toContain("declare namespace basic");
    expect(result).toContain("  export interface Position");
  });
});

describe("generateDtsWithPreamble", () => {
  it("should include runtime type definitions", () => {
    const mbti = `
package "test"

pub struct Config {
  value : Ref[Int]
}
`;
    const result = generateDtsWithPreamble(mbti, "test.mbti");
    expect(result).toContain("// Runtime types");
    expect(result).toContain("export interface Ref<T> { value: T }");
  });
});

describe("real world: mizchi/markdown api", () => {
  it("should generate dts from markdown api mbti", () => {
    const mbti = `
package "mizchi/markdown/api"

import(
  "mizchi/markdown"
)

pub fn md_to_html(String) -> String
pub fn md_to_markdown(String) -> String
pub fn md_parse_to_ast(String) -> Int
pub fn md_get_ast(Int) -> String
pub fn md_free(Int) -> Unit
`;
    const result = generateDts(mbti, "api.mbti");
    expect(result).toContain("export function mdToHtml(arg0: string): string");
    expect(result).toContain("export function mdToMarkdown(arg0: string): string");
    expect(result).toContain("export function mdParseToAst(arg0: string): number");
    expect(result).toContain("export function mdGetAst(arg0: number): string");
    expect(result).toContain("export function mdFree(arg0: number): void");
  });
});

// ============================================================
// Phase 3: Parser API Tests
// ============================================================

describe("parseMbti", () => {
  it("should parse struct and return AST", () => {
    const mbti = `
package "test"

pub struct User {
  name : String
  age : Int
}
`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.ast.package_name).toBe("test");
      expect(result.ast.sigs.length).toBe(1);
      expect(result.ast.sigs[0][0].$tag).toBe("Type");
    }
  });

  it("should parse enum and return AST", () => {
    const mbti = `
package "test"

pub enum Status {
  Active
  Pending
  Done
}
`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(true);
    if (result.success) {
      const types = getTypes(result.ast);
      expect(types.length).toBe(1);
      expect(types[0].name.name).toBe("Status");
      expect(types[0].components.type).toBe("TypeDesc::Variant");
    }
  });

  it("should parse functions and return AST", () => {
    const mbti = `
package "test"

fn hello(String) -> String
fn add(Int, Int) -> Int
`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(true);
    if (result.success) {
      const funcs = getFunctions(result.ast);
      expect(funcs.length).toBe(2);
      expect(funcs[0].name.name).toBe("hello");
      expect(funcs[1].name.name).toBe("add");
    }
  });

  it("should return error for invalid input", () => {
    const mbti = `invalid mbti content`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});

describe("parseMbtiOrThrow", () => {
  it("should return AST for valid input", () => {
    const mbti = `
package "test"

pub struct Point {
  x : Int
  y : Int
}
`;
    const ast = parseMbtiOrThrow(mbti, "test.mbti");
    expect(ast.package_name).toBe("test");
  });

  it("should throw for invalid input", () => {
    expect(() => {
      parseMbtiOrThrow("invalid", "test.mbti");
    }).toThrow();
  });
});

describe("AST utilities", () => {
  const mbti = `
package "test"

pub struct User {
  name : String
}

pub enum Status {
  Active
}

pub trait Show {
  to_string(Self) -> String
}

fn hello(String) -> String
`;

  it("getTypes should extract type signatures", () => {
    const ast = parseMbtiOrThrow(mbti, "test.mbti");
    const types = getTypes(ast);
    expect(types.length).toBe(2);
    expect(types.map((t) => t.name.name)).toContain("User");
    expect(types.map((t) => t.name.name)).toContain("Status");
  });

  it("getFunctions should extract function signatures", () => {
    const ast = parseMbtiOrThrow(mbti, "test.mbti");
    const funcs = getFunctions(ast);
    expect(funcs.length).toBe(1);
    expect(funcs[0].name.name).toBe("hello");
  });

  it("getTraits should extract trait signatures", () => {
    const ast = parseMbtiOrThrow(mbti, "test.mbti");
    const traits = getTraits(ast);
    expect(traits.length).toBe(1);
    expect(traits[0].name.name).toBe("Show");
  });

  it("getTypeName should extract type name from Type::Name", () => {
    const ast = parseMbtiOrThrow(mbti, "test.mbti");
    const types = getTypes(ast);
    const userType = types.find((t) => t.name.name === "User");
    expect(userType).toBeDefined();
    if (userType && userType.components.type === "TypeDesc::Record") {
      const fields = userType.components[0];
      const nameField = fields[0];
      const typeName = getTypeName(nameField.ty);
      expect(typeName).toBe("String");
    }
  });
});
