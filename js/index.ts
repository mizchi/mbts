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
// Preprocessing (handle syntax moonbitlang/parser doesn't support)
// ============================================================

/**
 * Preprocess MBTI content to handle syntax not supported by moonbitlang/parser
 *
 * Handles:
 * - #deprecated, #as_free_fn, #alias, #external attributes
 * - pub fn[T] / pub fn[T : Constraint] syntax (generic before method name)
 * - fn[T] / fn[T : Constraint] syntax
 * - pub const / pub(all) const declarations
 * - pub type alias declarations (pub type X = Y)
 * - pub(all) type declarations
 * - let declarations (module-level values)
 * - impl TypeName { ... } blocks (non-pub)
 * - pub(all) suberror declarations
 *
 * @param content - Original MBTI content
 * @returns Preprocessed content
 */
export function preprocessMbti(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let inImplBlock = false;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip attribute lines (all # prefixed lines)
    if (/^#(deprecated|as_free_fn|alias|external)/.test(trimmed)) {
      continue;
    }

    // Skip const declarations
    if (/^pub(\(all\))?\s+const\s+/.test(trimmed)) {
      continue;
    }

    // Skip type alias declarations (pub type X = Y)
    if (/^pub\s+type\s+\w+\s*=/.test(trimmed)) {
      continue;
    }

    // Skip pub(all) type declarations (they're handled elsewhere or external types)
    if (/^pub\(all\)\s+type\s+/.test(trimmed)) {
      continue;
    }

    // Skip let declarations (module-level values)
    if (/^let\s+\w+\s*:/.test(trimmed)) {
      continue;
    }

    // Skip pub(all) suberror declarations
    if (/^pub\(all\)\s+suberror\s+/.test(trimmed)) {
      continue;
    }

    // Handle impl blocks (non-pub) - need to skip the entire block
    if (/^impl\s+\w+(\[.+\])?\s*\{/.test(trimmed)) {
      inImplBlock = true;
      braceDepth = 1;
      continue;
    }

    // Handle impl X for Y (single line without block)
    if (/^impl\s+\w+(\[.+\])?\s+for\s+/.test(trimmed) && !trimmed.includes("{")) {
      continue;
    }

    // Skip pub impl[T] declarations (parser doesn't support generics in impl)
    if (/^pub\s+impl\[.+\]/.test(trimmed)) {
      continue;
    }

    // Track brace depth in impl blocks
    if (inImplBlock) {
      for (const char of trimmed) {
        if (char === "{") braceDepth++;
        else if (char === "}") braceDepth--;
      }
      if (braceDepth <= 0) {
        inImplBlock = false;
        braceDepth = 0;
      }
      continue;
    }

    // Strip generics from "pub fn[T]" or "pub fn[T : Constraint]" syntax
    // moonbitlang/parser doesn't support any generic syntax, so we remove it entirely
    // e.g., "pub fn[T : Foo] Stack::clear(Self[T]) -> Unit" -> "pub fn Stack::clear(Self[T]) -> Unit"
    const pubFnGenericMatch = trimmed.match(/^(pub\s+fn)\[([^\]]+)\]\s+(\S+)\(/);
    if (pubFnGenericMatch) {
      const [, prefix, , funcName] = pubFnGenericMatch;
      const rest = trimmed.slice(pubFnGenericMatch[0].length - 1);
      const transformed = `${prefix} ${funcName}${rest}`;
      result.push(line.replace(trimmed, transformed));
      continue;
    }

    // Strip generics from "fn[T]" (same pattern for non-pub functions)
    const fnGenericMatch = trimmed.match(/^(fn)\[([^\]]+)\]\s+(\S+)\(/);
    if (fnGenericMatch) {
      const [, prefix, , funcName] = fnGenericMatch;
      const rest = trimmed.slice(fnGenericMatch[0].length - 1);
      const transformed = `${prefix} ${funcName}${rest}`;
      result.push(line.replace(trimmed, transformed));
      continue;
    }

    // Also strip generics from method signatures like "pub fn Type::method[T](...)"
    const methodGenericMatch = trimmed.match(/^(pub\s+fn\s+\S+)\[([^\]]+)\]\s*\(/);
    if (methodGenericMatch) {
      const [, prefix] = methodGenericMatch;
      const rest = trimmed.slice(methodGenericMatch[0].length - 1);
      const transformed = `${prefix}${rest}`;
      result.push(line.replace(trimmed, transformed));
      continue;
    }

    // Strip generics from non-pub method signatures like "fn Type::method[T](...)"
    const nonPubMethodGenericMatch = trimmed.match(/^(fn\s+\S+)\[([^\]]+)\]\s*\(/);
    if (nonPubMethodGenericMatch) {
      const [, prefix] = nonPubMethodGenericMatch;
      const rest = trimmed.slice(nonPubMethodGenericMatch[0].length - 1);
      const transformed = `${prefix}${rest}`;
      result.push(line.replace(trimmed, transformed));
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

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
 * Add type parameters to function declarations in generated DTS
 *
 * The MoonBit parser strips generics, so we need to restore them
 * by extracting from the original content and patching the output.
 */
function addGenericsToFunctions(
  dts: string,
  symbols: ExportSymbol[]
): string {
  // Create a map of function name to type params
  const genericMap = new Map<string, string[]>();
  for (const sym of symbols) {
    if (sym.typeParams.length > 0) {
      const exportName = sym.isMethod && sym.typeName
        ? `${sym.typeName}$${sym.name}`
        : sym.name;
      // Convert snake_case to camelCase for matching
      const camelName = exportName.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      genericMap.set(camelName, sym.typeParams);
      // Also keep original for direct matches
      genericMap.set(exportName, sym.typeParams);
    }
  }

  // Regex to match function declarations
  // export function FuncName(... or export function FuncName<...>(...
  // Note: [\w$]+ to also match $ in function names like Stack$clear
  const funcRegex = /^(export function )([\w$]+)(<[^>]+>)?(\()/gm;

  return dts.replace(funcRegex, (match, prefix, funcName, existingGenerics, paren) => {
    // Skip if already has generics
    if (existingGenerics) return match;

    const typeParams = genericMap.get(funcName);
    if (typeParams && typeParams.length > 0) {
      return `${prefix}${funcName}<${typeParams.join(", ")}>${paren}`;
    }
    return match;
  });
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
  // Extract generic info before preprocessing (which strips generics)
  const symbols = extractExportSymbols(content);

  const preprocessed = preprocessMbti(content);
  let dts: string;

  if (options.namespace) {
    dts = generate_dts_namespace_from_string(preprocessed, filename);
  } else if (options.preamble) {
    dts = generate_dts_with_preamble_from_string(preprocessed, filename);
  } else {
    dts = generate_dts_from_string(preprocessed, filename);
  }

  // Add generics to function declarations
  return addGenericsToFunctions(dts, symbols);
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
  const symbols = extractExportSymbols(content);
  const preprocessed = preprocessMbti(content);
  const dts = generate_dts_namespace_from_string(preprocessed, filename);
  return addGenericsToFunctions(dts, symbols);
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
  const symbols = extractExportSymbols(content);
  const preprocessed = preprocessMbti(content);
  const dts = generate_dts_with_preamble_from_string(preprocessed, filename);
  return addGenericsToFunctions(dts, symbols);
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
  const preprocessed = preprocessMbti(content);
  const json = parse_mbti_to_json(preprocessed, filename);
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
// Export Symbol Extraction (for moon.pkg.json link.js.exports)
// ============================================================

/** Exported symbol information */
export interface ExportSymbol {
  /** The function name as it appears in MoonBit (snake_case) */
  name: string;
  /** The type name for methods (e.g., "Stack" for "Stack::push") */
  typeName?: string;
  /** Whether this is a method (has Type:: prefix) */
  isMethod: boolean;
  /** Generic type parameters (e.g., ["T", "U"]) */
  typeParams: string[];
  /** Whether the function is public */
  isPublic: boolean;
}

/**
 * Extract exportable symbols directly from raw .mbti content
 *
 * This function extracts function declarations before preprocessing,
 * preserving generic information that would otherwise be lost.
 *
 * @param content - The raw MBTI file content
 * @returns Array of exportable symbols with metadata
 *
 * @example
 * ```ts
 * const symbols = extractExportSymbols(mbtiContent);
 * const exports = symbols
 *   .filter(s => s.isPublic && !s.isMethod)
 *   .map(s => s.name);
 * // => ["parse", "render", "serialize"]
 * ```
 */
export function extractExportSymbols(content: string): ExportSymbol[] {
  const symbols: ExportSymbol[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Match pub fn declarations
    // Patterns:
    // - pub fn func_name(...) -> ...
    // - pub fn[T] func_name(...) -> ...
    // - pub fn Type::method_name(...) -> ...
    // - pub fn[T] Type::method_name(...) -> ...
    // - pub fn[T : Constraint] Type::method_name[U](...) -> ...

    // Skip non-function declarations
    if (!trimmed.startsWith("pub fn") && !trimmed.startsWith("fn ") && !trimmed.startsWith("fn[")) {
      continue;
    }

    const isPublic = trimmed.startsWith("pub ");
    const fnPart = isPublic ? trimmed.slice(4) : trimmed; // Remove "pub " if present

    // Extract type parameters from fn[T] or fn[T : Constraint]
    let typeParams: string[] = [];
    let rest = fnPart;

    // Check for fn[...] syntax
    const fnGenericMatch = rest.match(/^fn\[([^\]]+)\]\s*/);
    if (fnGenericMatch) {
      const params = fnGenericMatch[1];
      typeParams = params.split(",").map((p) => p.trim().split(/\s*:\s*/)[0]);
      rest = "fn " + rest.slice(fnGenericMatch[0].length);
    }

    // Now parse fn name or fn Type::name
    const fnMatch = rest.match(/^fn\s+(\w+)(?:::(\w+))?(?:\[([^\]]+)\])?\s*\(/);
    if (!fnMatch) continue;

    const [, firstPart, secondPart, methodTypeParams] = fnMatch;

    // If secondPart exists, firstPart is type name, secondPart is method name
    const typeName = secondPart ? firstPart : undefined;
    const name = secondPart || firstPart;

    // Also extract type params from method[T] syntax
    if (methodTypeParams) {
      const extraParams = methodTypeParams.split(",").map((p) => p.trim().split(/\s*:\s*/)[0]);
      typeParams = [...typeParams, ...extraParams];
    }

    symbols.push({
      name,
      typeName,
      isMethod: !!typeName,
      typeParams,
      isPublic,
    });
  }

  return symbols;
}

/**
 * Get export names for moon.pkg.json link.js.exports
 *
 * Returns function names suitable for the exports array.
 * For methods, uses the format "Type$method" which is the JS export convention.
 *
 * @param content - The raw MBTI file content
 * @param options - Options for filtering
 * @returns Array of export names
 *
 * @example
 * ```ts
 * const exports = getExportNames(mbtiContent);
 * // => ["parse", "render", "Stack$push", "Stack$pop"]
 * ```
 */
export function getExportNames(
  content: string,
  options: {
    /** Include methods (Type::method -> Type$method) */
    includeMethods?: boolean;
    /** Only include public functions */
    publicOnly?: boolean;
  } = {}
): string[] {
  const { includeMethods = true, publicOnly = true } = options;

  const symbols = extractExportSymbols(content);

  return symbols
    .filter((s) => {
      if (publicOnly && !s.isPublic) return false;
      if (!includeMethods && s.isMethod) return false;
      return true;
    })
    .map((s) => {
      if (s.isMethod && s.typeName) {
        return `${s.typeName}$${s.name}`;
      }
      return s.name;
    });
}

/**
 * Generate moon.pkg.json link configuration
 *
 * @param content - The raw MBTI file content
 * @param options - Options for generation
 * @returns The link configuration object
 *
 * @example
 * ```ts
 * const link = generateLinkConfig(mbtiContent);
 * // => { js: { exports: ["parse", "render"] } }
 * ```
 */
export function generateLinkConfig(
  content: string,
  options: {
    /** Include methods in exports */
    includeMethods?: boolean;
    /** Targets to generate for */
    targets?: ("js" | "wasm" | "wasm-gc")[];
    /** ESM format for JS */
    jsFormat?: "esm" | "cjs";
  } = {}
): Record<string, { exports: string[]; format?: string }> {
  const { includeMethods = false, targets = ["js"], jsFormat } = options;

  const exports = getExportNames(content, { includeMethods, publicOnly: true });

  const link: Record<string, { exports: string[]; format?: string }> = {};

  for (const target of targets) {
    link[target] = { exports };
    if (target === "js" && jsFormat) {
      link[target].format = jsFormat;
    }
  }

  return link;
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
