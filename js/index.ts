/**
 * mbts - MoonBit to TypeScript type generator
 *
 * Generates TypeScript type definitions (.d.ts) from MoonBit interface files (.mbti)
 */

// Import generated MoonBit functions
import {
  generate_dts_from_string,
  generate_dts_namespace_from_string,
  generate_dts_with_preamble_from_string,
  parse_mbti_to_json,
} from "../target/js/release/build/cli/cli.js";

// ============================================================
// MBTI AST Types (Phase 3)
// ============================================================

/** Location in source file */
export interface Location {
  start: { line: number; column: number } | null;
  end: { line: number; column: number } | null;
}

/** Name with location */
export interface Name {
  name: string;
  loc: Location | null;
}

/** Package import */
export interface PackageImport {
  name: string;
  alias_: string | null;
}

// Type definitions
export interface MbtiType {
  type: string;
  [key: string]: unknown;
}

export interface TypeName extends MbtiType {
  type: "Type::Name";
  constr_id: {
    type: "ConstrId";
    id: { type: "LongIdent::Ident" | "LongIdent::Dot"; 0: string; 1?: string };
  };
  tys: MbtiType[];
}

// Field declarations
export interface FieldDecl {
  type: "FieldDecl";
  name: { type: "FieldName"; label: string };
  ty: MbtiType;
  mut: boolean;
}

// Constructor declarations
export interface ConstrDecl {
  type: "ConstrDecl";
  name: { type: "ConstrName"; name: string };
  args: Array<{ label?: { name: string }; ty: MbtiType }> | null;
}

// Type descriptors
export type TypeDesc =
  | { type: "TypeDesc::Abstract" }
  | { type: "TypeDesc::Extern" }
  | { type: "TypeDesc::Record"; 0: FieldDecl[] }
  | { type: "TypeDesc::Variant"; 0: ConstrDecl[] }
  | { type: "TypeDesc::Newtype"; 0: MbtiType }
  | { type: "TypeDesc::TupleStruct"; 0: MbtiType[] }
  | { type: "TypeDesc::Alias"; 0: MbtiType };

// Signature types
export interface FuncSig {
  attr: Array<[string, string | null, string]>;
  type_name?: Name;
  name: Name;
  params: Array<{ $tag: string; 0: MbtiType | { name: string } }>;
  return_: [MbtiType, { type: string }];
  type_params: Array<{ name: Name }>;
}

export interface TypeSig {
  name: Name;
  type_params: Array<Name | { type: "Underscore" }>;
  components: TypeDesc;
  vis: { type: string };
}

export interface TraitSig {
  name: Name;
  super_traits: unknown[];
  methods: Array<{
    name: Name;
    params: unknown[];
    has_default: boolean;
    return_: [MbtiType, { type: string }];
  }>;
  vis: { type: string };
}

export type Sig =
  | { $tag: "Func"; 0: FuncSig }
  | { $tag: "Type"; 0: TypeSig }
  | { $tag: "Trait"; 0: TraitSig }
  | { $tag: "Alias"; 0: unknown }
  | { $tag: "Impl"; 0: unknown }
  | { $tag: "Const"; 0: { name: Name; type_: MbtiType; value: unknown } }
  | { $tag: "Value"; 0: { name: Name; type_: MbtiType } };

/** Parsed MBTI AST */
export interface Mbti {
  package_name: string;
  imports: PackageImport[];
  sigs: Array<[Sig, Location | null]>;
}

/** Parse result (success or error) */
export type ParseResult =
  | { success: true; ast: Mbti }
  | { success: false; error: string };

export interface GenerateOptions {
  /** Wrap output in TypeScript namespace */
  namespace?: boolean;
  /** Include runtime type definitions (Ref<T>, etc.) */
  preamble?: boolean;
}

/**
 * Generate TypeScript definitions from MBTI content
 *
 * @param content - The MBTI file content
 * @param filename - The filename (used for error messages)
 * @param options - Generation options
 * @returns Generated TypeScript definition string
 *
 * @example
 * ```ts
 * const mbti = `
 * package "test"
 * pub struct User {
 *   name : String
 *   age : Int
 * }
 * `;
 * const dts = generateDts(mbti, "test.mbti");
 * // => "export interface User { ... }"
 * ```
 */
export function generateDts(
  content: string,
  filename: string,
  options: GenerateOptions = {}
): string {
  if (options.namespace) {
    return generate_dts_namespace_from_string(content, filename);
  }
  if (options.preamble) {
    return generate_dts_with_preamble_from_string(content, filename);
  }
  return generate_dts_from_string(content, filename);
}

/**
 * Generate TypeScript definitions wrapped in a namespace
 *
 * @param content - The MBTI file content
 * @param filename - The filename
 * @returns Generated TypeScript definition with namespace wrapper
 */
export function generateDtsNamespace(
  content: string,
  filename: string
): string {
  return generate_dts_namespace_from_string(content, filename);
}

/**
 * Generate TypeScript definitions with runtime type preamble
 *
 * @param content - The MBTI file content
 * @param filename - The filename
 * @returns Generated TypeScript definition with preamble
 */
export function generateDtsWithPreamble(
  content: string,
  filename: string
): string {
  return generate_dts_with_preamble_from_string(content, filename);
}

// ============================================================
// Parser API (Phase 3)
// ============================================================

/**
 * Parse MBTI content and return the AST
 *
 * @param content - The MBTI file content
 * @param filename - The filename (used for error messages)
 * @returns Parsed AST or error
 *
 * @example
 * ```ts
 * const mbti = `
 * package "test"
 * pub struct User {
 *   name : String
 *   age : Int
 * }
 * `;
 * const result = parseMbti(mbti, "test.mbti");
 * if (result.success) {
 *   console.log(result.ast.package_name); // "test"
 *   console.log(result.ast.sigs.length); // 1
 * }
 * ```
 */
export function parseMbti(content: string, filename: string): ParseResult {
  const json = parse_mbti_to_json(content, filename);
  const parsed = JSON.parse(json);

  if (parsed.error) {
    return { success: false, error: parsed.error };
  }

  return { success: true, ast: parsed as Mbti };
}

/**
 * Parse MBTI content and return the AST, throwing on error
 *
 * @param content - The MBTI file content
 * @param filename - The filename (used for error messages)
 * @returns Parsed AST
 * @throws Error if parsing fails
 */
export function parseMbtiOrThrow(content: string, filename: string): Mbti {
  const result = parseMbti(content, filename);
  if (!result.success) {
    throw new Error(`Failed to parse MBTI: ${result.error}`);
  }
  return result.ast;
}

// ============================================================
// AST Utilities
// ============================================================

/**
 * Get all type signatures from an MBTI AST
 */
export function getTypes(ast: Mbti): TypeSig[] {
  return ast.sigs
    .map(([sig]) => sig)
    .filter((sig): sig is { $tag: "Type"; 0: TypeSig } => sig.$tag === "Type")
    .map((sig) => sig[0]);
}

/**
 * Get all function signatures from an MBTI AST
 */
export function getFunctions(ast: Mbti): FuncSig[] {
  return ast.sigs
    .map(([sig]) => sig)
    .filter((sig): sig is { $tag: "Func"; 0: FuncSig } => sig.$tag === "Func")
    .map((sig) => sig[0]);
}

/**
 * Get all trait signatures from an MBTI AST
 */
export function getTraits(ast: Mbti): TraitSig[] {
  return ast.sigs
    .map(([sig]) => sig)
    .filter((sig): sig is { $tag: "Trait"; 0: TraitSig } => sig.$tag === "Trait")
    .map((sig) => sig[0]);
}

/**
 * Get the type name from a MoonBit type
 */
export function getTypeName(ty: MbtiType): string | null {
  if (ty.type === "Type::Name") {
    const typeName = ty as TypeName;
    const id = typeName.constr_id.id;
    if (id.type === "LongIdent::Ident") {
      return id[0];
    } else if (id.type === "LongIdent::Dot") {
      return `${id[0]}.${id[1]}`;
    }
  }
  return null;
}

// ============================================================
// Re-export dts-to-mbt (Phase 4)
// ============================================================

export {
  parseDts,
  dtsToMbt,
  dtsToMbtWithGlue,
  generateMbt,
  generateGlueCode,
  type MbtBinding,
  type MbtClass,
  type MbtType,
  type MbtField,
  type MbtVariant,
  type MbtFunction,
  type MbtParam,
  type ConvertOptions,
} from "./dts-to-mbt.js";
