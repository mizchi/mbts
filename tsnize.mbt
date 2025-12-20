// tsnize - Generate TypeScript definitions from MoonBit .mbti files
//
// Uses moonbitlang/parser to correctly parse MBTI and generate TypeScript

///|
/// Preprocess MBTI content to remove unsupported syntax
/// (pub impl and pub using are not yet supported by mbti_parser)
pub fn preprocess_mbti(content : String) -> String {
  let lines = content.split("\n")
  let filtered = lines.filter(fn(line) {
    let trimmed = line.trim_space().to_string()
    // Skip unsupported syntax in mbti_parser
    not(trimmed.has_prefix("pub impl ")) &&
      not(trimmed.has_prefix("pub using ")) &&
      not(trimmed.has_prefix("pub let ")) &&
      not(is_type_alias(trimmed)) // type alias (pub type X = Y) not supported
  })
  // Convert "pub fn" to "fn" for parser compatibility
  let processed = filtered.map(fn(line) {
    let s = line.to_string()
    if s.trim_space().to_string().has_prefix("pub fn ") {
      s.replace(old="pub fn ", new="fn ")
    } else {
      s
    }
  })
  processed.collect().join("\n")
}

///|
/// Check if line is a type alias (pub type X = Y), not abstract type (pub type X)
fn is_type_alias(line : String) -> Bool {
  if line.has_prefix("pub type ") {
    line.contains(" = ")
  } else {
    false
  }
}

///|
/// Parse MBTI content and return the AST
pub fn parse_mbti(content : String, filename : String) -> @mbti_ast.Mbti raise {
  let preprocessed = preprocess_mbti(content)
  let lex_result = @lexer.tokens_from_string(
    name=filename,
    preprocessed,
    comment=false,
  )
  let tokens = lex_result.tokens.filter(fn(triple) {
    not(triple.0 is (NEWLINE | COMMENT(_)))
  })
  @mbti_parser.mbti(tokens, initial_pos=@basic.Position::{
    fname: filename,
    lnum: 1,
    bol: 0,
    cnum: 0,
  })
}

///|
/// Extract namespace name from package name
/// e.g., "moonbitlang/parser/basic" -> "basic"
pub fn package_to_namespace(package_name : String) -> String {
  let parts : Array[String] = package_name.split("/").map(fn(s) { s.to_string() }).collect()
  if parts.length() > 0 {
    parts[parts.length() - 1]
  } else {
    package_name
  }
}

///|
/// Generate preamble with runtime type definitions
fn generate_preamble() -> String {
  let buf = StringBuilder::new()
  buf.write_string("// Runtime types\n")
  buf.write_string("export interface Ref<T> { value: T }\n")
  buf.write_string("\n")
  buf.to_string()
}

///|
/// Generate TypeScript .d.ts content from MBTI AST
pub fn generate_dts(mbti : @mbti_ast.Mbti) -> String {
  generate_dts_with_preamble(mbti, include_preamble=false)
}

///|
/// Generate TypeScript .d.ts with optional preamble
pub fn generate_dts_with_preamble(
  mbti : @mbti_ast.Mbti,
  include_preamble~ : Bool,
) -> String {
  let buf = StringBuilder::new()
  buf.write_string("// Generated from .mbti file - DO NOT EDIT\n\n")
  if include_preamble {
    buf.write_string(generate_preamble())
  }

  // Generate each signature
  for item in mbti.sigs {
    let (sig, _loc) = item
    let ts = generate_sig(sig)
    if ts.length() > 0 {
      buf.write_string(ts)
      buf.write_string("\n\n")
    }
  }
  buf.to_string().trim_space().to_string()
}

///|
/// Generate TypeScript .d.ts content wrapped in a namespace
pub fn generate_dts_namespace(mbti : @mbti_ast.Mbti) -> String {
  let ns = package_to_namespace(mbti.package_name)
  let buf = StringBuilder::new()
  buf.write_string("declare namespace ")
  buf.write_string(ns)
  buf.write_string(" {\n")

  // Generate each signature with indentation
  for item in mbti.sigs {
    let (sig, _loc) = item
    let ts = generate_sig(sig)
    if ts.length() > 0 {
      // Indent each line
      for line in ts.split("\n") {
        buf.write_string("  ")
        buf.write_string(line.to_string())
        buf.write_string("\n")
      }
      buf.write_string("\n")
    }
  }
  buf.write_string("}\n")
  buf.to_string()
}

///|
/// Generate combined TypeScript .d.ts from multiple MBTI packages
pub fn generate_combined_dts(packages : Array[@mbti_ast.Mbti]) -> String {
  let buf = StringBuilder::new()
  buf.write_string("// Generated from .mbti files - DO NOT EDIT\n")
  buf.write_string("// MoonBit Parser TypeScript Definitions\n\n")

  for pkg in packages {
    buf.write_string(generate_dts_namespace(pkg))
    buf.write_string("\n")
  }
  buf.to_string().trim_space().to_string()
}

///|
fn generate_sig(sig : @mbti_ast.Sig) -> String {
  match sig {
    Func(func_sig) => generate_func_sig(func_sig)
    Type(type_sig) => generate_type_sig(type_sig)
    Alias(alias_sig) => generate_alias_sig(alias_sig)
    Trait(trait_sig) => generate_trait_sig(trait_sig)
    Impl(_) => "" // Skip impl signatures for now
    Const(const_sig) => generate_const_sig(const_sig)
    Value(value_sig) => generate_value_sig(value_sig)
  }
}

///|
/// Replace Self with actual type name in generated code
fn replace_self(code : String, type_name : String) -> String {
  let buf = StringBuilder::new()
  let chars : Array[Char] = code.to_array()
  let len = chars.length()
  let mut i = 0
  while i < len {
    // Check for "Self" (must not be preceded/followed by alphanumeric)
    if i + 4 <= len &&
      chars[i] == 'S' &&
      chars[i + 1] == 'e' &&
      chars[i + 2] == 'l' &&
      chars[i + 3] == 'f' {
      // Check if preceded by alphanumeric
      let preceded_by_alnum = i > 0 && is_alnum(chars[i - 1])
      // Check if followed by alphanumeric
      let followed_by_alnum = i + 4 < len && is_alnum(chars[i + 4])
      if not(preceded_by_alnum) && not(followed_by_alnum) {
        buf.write_string(type_name)
        i += 4
        continue
      }
    }
    buf.write_char(chars[i])
    i += 1
  }
  buf.to_string()
}

///|
fn is_alnum(c : Char) -> Bool {
  let code = c.to_int()
  (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    c == '_'
}

///|
fn generate_func_sig(func : @mbti_ast.FuncSig) -> String {
  let buf = StringBuilder::new()
  let func_name = escape_func_name(to_camel_case(func.name.name))

  // Generate type parameters
  let type_params = generate_type_params(func.type_params)

  // Generate parameters
  let params = generate_params(func.params)

  // Generate return type
  let (ret_type, _err_type) = func.return_
  let return_ts = generate_type(ret_type)
  match func.type_name {
    Some(type_name) => {
      // Method: Type::method -> Type$method
      let ts_type_name = type_name.name
      buf.write_string("export function ")
      buf.write_string(ts_type_name)
      buf.write_string("$")
      buf.write_string(to_camel_case(func.name.name))
      buf.write_string(type_params)
      buf.write_string("(")
      buf.write_string(params)
      buf.write_string("): ")
      buf.write_string(return_ts)
      buf.write_string(";")
      // Replace Self with actual type name
      replace_self(buf.to_string(), ts_type_name)
    }
    None => {
      // Standalone function
      buf.write_string("export function ")
      buf.write_string(func_name)
      buf.write_string(type_params)
      buf.write_string("(")
      buf.write_string(params)
      buf.write_string("): ")
      buf.write_string(return_ts)
      buf.write_string(";")
      buf.to_string()
    }
  }
}

///|
/// Check if type name conflicts with TypeScript built-in types
fn is_ts_builtin_type(name : String) -> Bool {
  match name {
    "Promise" | "Error" | "Array" | "Map" | "Set" | "Date" | "RegExp" | "Symbol"
    | "Function" | "Object" | "Number" | "String" | "Boolean" => true
    _ => false
  }
}

///|
fn generate_type_sig(type_sig : @mbti_ast.TypeSig) -> String {
  let buf = StringBuilder::new()
  let name = type_sig.name.name
  let type_params = generate_type_params_no_constraints(type_sig.type_params)
  match type_sig.components {
    Abstract => {
      // Skip TypeScript built-in types (use TS native ones)
      if is_ts_builtin_type(name) {
        buf.write_string("// Using TypeScript built-in: ")
        buf.write_string(name)
      } else {
        buf.write_string("export interface ")
        buf.write_string(name)
        buf.write_string(type_params)
        buf.write_string(" {\n  readonly __brand: \"")
        buf.write_string(name)
        buf.write_string("\";\n}")
      }
    }
    Extern => {
      // Skip TypeScript built-in types (use TS native ones)
      if is_ts_builtin_type(name) {
        buf.write_string("// Using TypeScript built-in: ")
        buf.write_string(name)
      } else {
        buf.write_string("export interface ")
        buf.write_string(name)
        buf.write_string(type_params)
        buf.write_string(" {\n  readonly __brand: \"")
        buf.write_string(name)
        buf.write_string("\";\n}")
      }
    }
    Newtype(ty) => {
      buf.write_string("export type ")
      buf.write_string(name)
      buf.write_string(type_params)
      buf.write_string(" = ")
      buf.write_string(generate_type(ty))
      buf.write_string(";")
    }
    Variant(constrs) => generate_enum_type(buf, name, type_params, constrs)
    Record(fields) => generate_struct_type(buf, name, type_params, fields)
    TupleStruct(types) => {
      buf.write_string("export type ")
      buf.write_string(name)
      buf.write_string(type_params)
      buf.write_string(" = [")
      let types_arr = types.to_array()
      for i, ty in types_arr {
        if i > 0 {
          buf.write_string(", ")
        }
        buf.write_string(generate_type(ty))
      }
      buf.write_string("];")
    }
    Alias(ty) => {
      buf.write_string("export type ")
      buf.write_string(name)
      buf.write_string(type_params)
      buf.write_string(" = ")
      buf.write_string(generate_type(ty))
      buf.write_string(";")
    }
    Error(exception_decl) => {
      match exception_decl {
        NoPayload => {
          // Simple error type with no payload
          buf.write_string("export interface ")
          buf.write_string(name)
          buf.write_string(" extends Error {\n  readonly $tag: \"")
          buf.write_string(name)
          buf.write_string("\";\n}")
        }
        SinglePayload(ty) => {
          // Error with single payload
          buf.write_string("export interface ")
          buf.write_string(name)
          buf.write_string(" extends Error {\n  readonly $tag: \"")
          buf.write_string(name)
          buf.write_string("\";\n  readonly $0: ")
          buf.write_string(generate_type(ty))
          buf.write_string(";\n}")
        }
        EnumPayload(constrs) => {
          // Error with enum-like variants - same as enum
          generate_error_enum_type(buf, name, type_params, constrs)
        }
      }
    }
  }
  buf.to_string()
}

///|
fn generate_error_enum_type(
  buf : StringBuilder,
  name : String,
  type_params : String,
  constrs : @list.List[@syntax.ConstrDecl],
) -> Unit {
  // Same as generate_enum_type but extends Error
  generate_enum_type_internal(buf, name, type_params, constrs, extends_error=true)
}

///|
fn generate_enum_type(
  buf : StringBuilder,
  name : String,
  type_params : String,
  constrs : @list.List[@syntax.ConstrDecl],
) -> Unit {
  generate_enum_type_internal(buf, name, type_params, constrs, extends_error=false)
}

///|
fn generate_enum_type_internal(
  buf : StringBuilder,
  name : String,
  type_params : String,
  constrs : @list.List[@syntax.ConstrDecl],
  extends_error~ : Bool,
) -> Unit {
  let constrs_arr = constrs.to_array()

  // Generate individual variant types
  for constr in constrs_arr {
    let variant_name = constr.name.name
    buf.write_string("export interface ")
    buf.write_string(name)
    buf.write_string("_")
    buf.write_string(variant_name)
    buf.write_string(type_params)
    if extends_error {
      buf.write_string(" extends Error")
    }
    buf.write_string(" { readonly $tag: \"")
    buf.write_string(variant_name)
    buf.write_string("\"")

    // Add payload fields if any
    match constr.args {
      Some(args) => {
        let args_arr = args.to_array()
        for i, arg in args_arr {
          buf.write_string("; readonly ")
          // Use label name if available, otherwise use positional $N
          match arg.label {
            Some(label) => buf.write_string(escape_func_name(label.name))
            None => {
              buf.write_string("$")
              buf.write_string(i.to_string())
            }
          }
          buf.write_string(": ")
          buf.write_string(generate_type(arg.ty))
        }
      }
      None => ()
    }
    buf.write_string("; }\n")
  }

  // Generate union type
  buf.write_string("export type ")
  buf.write_string(name)
  buf.write_string(type_params)
  buf.write_string(" = ")
  for i, constr in constrs_arr {
    if i > 0 {
      buf.write_string(" | ")
    }
    buf.write_string(name)
    buf.write_string("_")
    buf.write_string(constr.name.name)
    buf.write_string(type_params)
  }
  buf.write_string(";\n\n")

  // Generate flat variant constructors (tree-shakeable)
  for constr in constrs_arr {
    let variant_name = constr.name.name
    match constr.args {
      Some(args) => {
        // Tuple variant - constructor function
        let args_arr = args.to_array()
        buf.write_string("export function ")
        buf.write_string(name)
        buf.write_string("$")
        buf.write_string(variant_name)
        buf.write_string("(")
        for i, arg in args_arr {
          if i > 0 {
            buf.write_string(", ")
          }
          // Use label name if available, escape reserved words
          let param_name = match arg.label {
            Some(label) => escape_func_name(label.name)
            None => "$\{i}"
          }
          buf.write_string(param_name)
          buf.write_string(": ")
          buf.write_string(generate_type(arg.ty))
        }
        buf.write_string("): ")
        buf.write_string(name)
        buf.write_string("_")
        buf.write_string(variant_name)
        buf.write_string(";\n")
      }
      None => {
        // Unit variant - constant
        buf.write_string("export const ")
        buf.write_string(name)
        buf.write_string("$")
        buf.write_string(variant_name)
        buf.write_string(": ")
        buf.write_string(name)
        buf.write_string("_")
        buf.write_string(variant_name)
        buf.write_string(";\n")
      }
    }
  }
}

///|
fn generate_struct_type(
  buf : StringBuilder,
  name : String,
  type_params : String,
  fields : @list.List[@syntax.FieldDecl],
) -> Unit {
  buf.write_string("export interface ")
  buf.write_string(name)
  buf.write_string(type_params)
  buf.write_string(" {\n")
  for field in fields {
    let field_name = field.name.label
    let ts_type = generate_type(field.ty)
    let is_readonly = if field.mut_ { "" } else { "readonly " }
    buf.write_string("  ")
    buf.write_string(is_readonly)
    buf.write_string(field_name)
    buf.write_string(": ")
    buf.write_string(ts_type)
    buf.write_string(";\n")
  }
  buf.write_string("}")
}

///|
fn generate_alias_sig(alias_sig : @mbti_ast.AliasSig) -> String {
  match alias_sig {
    TypeAlias(name~, type_params~, type_~, vis~) => {
      ignore(vis)
      let buf = StringBuilder::new()
      buf.write_string("export type ")
      buf.write_string(name.name)
      buf.write_string(generate_type_params_no_constraints(type_params))
      buf.write_string(" = ")
      buf.write_string(generate_type(type_))
      buf.write_string(";")
      buf.to_string()
    }
    TraitAlias(name~, trait_name~, vis~) => {
      ignore(vis)
      let buf = StringBuilder::new()
      buf.write_string("// Trait alias: ")
      buf.write_string(name.name)
      buf.write_string(" = ")
      buf.write_string(qualified_name_to_string(trait_name))
      buf.to_string()
    }
    FnAlias(name~, type_name~, loc~) => {
      ignore(loc)
      let buf = StringBuilder::new()
      buf.write_string("// Fn alias: ")
      buf.write_string(name.name)
      buf.write_string(" = ")
      buf.write_string(qualified_name_to_string(type_name))
      buf.to_string()
    }
  }
}

///|
fn generate_trait_sig(trait_sig : @mbti_ast.TraitSig) -> String {
  let trait_name = trait_sig.name.name
  let buf = StringBuilder::new()
  buf.write_string("// trait ")
  buf.write_string(trait_name)
  buf.write_string("\n")
  for m in trait_sig.methods {
    let params = generate_trait_method_params(m.params)
    let (ret_type, _) = m.return_
    buf.write_string("export function ")
    buf.write_string(trait_name)
    buf.write_string("$")
    buf.write_string(to_camel_case(m.name.name))
    buf.write_string("<Self>(")
    buf.write_string(params)
    buf.write_string("): ")
    buf.write_string(generate_type(ret_type))
    buf.write_string(";\n")
  }
  buf.to_string().trim_space().to_string()
}

///|
fn generate_const_sig(const_sig : @mbti_ast.ConstSig) -> String {
  let buf = StringBuilder::new()
  buf.write_string("export const ")
  buf.write_string(const_sig.name.name)
  buf.write_string(": ")
  buf.write_string(generate_type(const_sig.type_))
  buf.write_string(";")
  buf.to_string()
}

///|
fn generate_value_sig(value_sig : @mbti_ast.ValueSig) -> String {
  let buf = StringBuilder::new()
  buf.write_string("export const ")
  buf.write_string(value_sig.name.name)
  buf.write_string(": ")
  buf.write_string(generate_type(value_sig.type_))
  buf.write_string(";")
  buf.to_string()
}

///|
fn generate_type(ty : @syntax.Type) -> String {
  match ty {
    Any(_) => "any"
    Arrow(args~, res~, err~, is_async~, loc~) => {
      ignore(err)
      ignore(loc)
      let buf = StringBuilder::new()
      if is_async {
        buf.write_string("Promise<")
        buf.write_string(generate_type(res))
        buf.write_string(">")
      } else {
        buf.write_string("(")
        let args_arr = args.to_array()
        for i, arg in args_arr {
          if i > 0 {
            buf.write_string(", ")
          }
          buf.write_string("arg")
          buf.write_string(i.to_string())
          buf.write_string(": ")
          buf.write_string(generate_type(arg))
        }
        buf.write_string(") => ")
        buf.write_string(generate_type(res))
      }
      buf.to_string()
    }
    Tuple(tys~, loc~) => {
      ignore(loc)
      let buf = StringBuilder::new()
      buf.write_string("[")
      let tys_arr = tys.to_array()
      for i, t in tys_arr {
        if i > 0 {
          buf.write_string(", ")
        }
        buf.write_string(generate_type(t))
      }
      buf.write_string("]")
      buf.to_string()
    }
    Name(constr_id~, tys~, loc~) => {
      ignore(loc)
      let name = long_ident_to_string(constr_id.id)
      let mapped = map_moonbit_type(name)
      let tys_arr = tys.to_array()
      if tys_arr.length() == 0 {
        mapped
      } else {
        let buf = StringBuilder::new()
        buf.write_string(mapped)
        buf.write_string("<")
        for i, t in tys_arr {
          if i > 0 {
            buf.write_string(", ")
          }
          buf.write_string(generate_type(t))
        }
        buf.write_string(">")
        buf.to_string()
      }
    }
    Option(ty~, loc~, question_loc~) => {
      ignore(loc)
      ignore(question_loc)
      let buf = StringBuilder::new()
      buf.write_string(generate_type(ty))
      buf.write_string(" | undefined")
      buf.to_string()
    }
    Object(constr_id) => long_ident_to_string(constr_id.id)
  }
}

///|
fn map_moonbit_type(name : String) -> String {
  match name {
    "String" => "string"
    "Int" | "UInt" | "Float" | "Double" | "Int64" | "UInt64" => "number"
    "Byte" => "number"
    "Bool" => "boolean"
    "Unit" => "void"
    "Bytes" => "Uint8Array"
    "BigInt" => "bigint"
    "Array" | "FixedArray" => "Array"
    "Map" => "Map"
    "Json" => "any"
    "Ref" => "Ref" // Will be defined in preamble
    _ => name
  }
}

///|
fn generate_params(params : @list.List[@mbti_ast.Parameter]) -> String {
  let buf = StringBuilder::new()
  let params_arr = params.to_array()
  let mut pos_index = 0
  for i, param in params_arr {
    if i > 0 {
      buf.write_string(", ")
    }
    match param {
      Positional(ty) => {
        buf.write_string("arg")
        buf.write_string(pos_index.to_string())
        buf.write_string(": ")
        buf.write_string(generate_type(ty))
        pos_index += 1
      }
      Labelled(label, ty) => {
        buf.write_string(label.name)
        buf.write_string(": ")
        buf.write_string(generate_type(ty))
      }
      Autofill(label, ty) => {
        buf.write_string(label.name)
        buf.write_string("?: ")
        buf.write_string(generate_type(ty))
      }
      OptionalDefault(label, ty) => {
        buf.write_string(label.name)
        buf.write_string("?: ")
        buf.write_string(generate_type(ty))
      }
      OptionalOption(label, ty) => {
        buf.write_string(label.name)
        buf.write_string("?: ")
        buf.write_string(generate_type(ty))
      }
    }
  }
  buf.to_string()
}

///|
fn generate_trait_method_params(
  params : @list.List[@mbti_ast.TraitMethodParameter],
) -> String {
  let buf = StringBuilder::new()
  let params_arr = params.to_array()
  let mut pos_index = 0
  for i, param in params_arr {
    if i > 0 {
      buf.write_string(", ")
    }
    match param {
      Positional(ty) => {
        buf.write_string("arg")
        buf.write_string(pos_index.to_string())
        buf.write_string(": ")
        buf.write_string(generate_type(ty))
        pos_index += 1
      }
      Labelled(label, ty) => {
        buf.write_string(label.name)
        buf.write_string(": ")
        buf.write_string(generate_type(ty))
      }
    }
  }
  buf.to_string()
}

///|
fn generate_type_params(
  params : @list.List[@mbti_ast.TypeParamWithConstraints],
) -> String {
  let params_arr = params.to_array()
  if params_arr.length() == 0 {
    return ""
  }
  let buf = StringBuilder::new()
  buf.write_string("<")
  for i, param in params_arr {
    if i > 0 {
      buf.write_string(", ")
    }
    buf.write_string(param.name.name)
  }
  buf.write_string(">")
  buf.to_string()
}

///|
fn generate_type_params_no_constraints(
  params : @list.List[@mbti_ast.TypeParamNoConstraints],
) -> String {
  let params_arr = params.to_array()
  if params_arr.length() == 0 {
    return ""
  }
  let buf = StringBuilder::new()
  buf.write_string("<")
  for i, param in params_arr {
    if i > 0 {
      buf.write_string(", ")
    }
    match param {
      Name(name) => buf.write_string(name.name)
      Underscore(_) => buf.write_string("_")
    }
  }
  buf.write_string(">")
  buf.to_string()
}

///|
fn long_ident_to_string(id : @syntax.LongIdent) -> String {
  match id {
    Ident(name~) => name
    Dot(pkg~, id~) => "\{pkg}.\{id}"
  }
}

///|
fn qualified_name_to_string(qn : @mbti_ast.QualifiedName) -> String {
  qualified_ident_to_string(qn.name)
}

///|
fn qualified_ident_to_string(qi : @mbti_ast.QualifiedIdent) -> String {
  match qi {
    Ident(name~) => name
    Dot(pkg~, id~) => "\{pkg}.\{id}"
  }
}

///|
fn to_camel_case(s : String) -> String {
  // Convert snake_case to camelCase
  let buf = StringBuilder::new()
  let mut next_upper = false
  for c in s {
    if c == '_' {
      next_upper = true
    } else if next_upper {
      buf.write_char(char_to_upper(c))
      next_upper = false
    } else {
      buf.write_char(c)
    }
  }
  buf.to_string()
}

///|
fn char_to_upper(c : Char) -> Char {
  let code = c.to_int()
  if code >= 97 && code <= 122 {
    // 'a' to 'z'
    (code - 32).unsafe_to_char()
  } else {
    c
  }
}

///|
/// Check if a name is a TypeScript/JavaScript reserved word
fn is_ts_reserved(name : String) -> Bool {
  match name {
    // JavaScript reserved words
    "break"
    | "case"
    | "catch"
    | "continue"
    | "debugger"
    | "default"
    | "delete"
    | "do"
    | "else"
    | "finally"
    | "for"
    | "function"
    | "if"
    | "in"
    | "instanceof"
    | "new"
    | "return"
    | "switch"
    | "this"
    | "throw"
    | "try"
    | "typeof"
    | "var"
    | "void"
    | "while"
    | "with"
    | "class"
    | "const"
    | "enum"
    | "export"
    | "extends"
    | "import"
    | "super"
    | "implements"
    | "interface"
    | "let"
    | "package"
    | "private"
    | "protected"
    | "public"
    | "static"
    | "yield"
    // Literal values
    | "null"
    | "undefined"
    | "true"
    | "false"
    | "NaN"
    | "Infinity"
    // TypeScript specific
    | "any"
    | "boolean"
    | "number"
    | "string"
    | "symbol"
    | "bigint"
    | "never"
    | "unknown"
    | "object"
    | "type"
    | "declare"
    | "as"
    | "from"
    | "async"
    | "await" => true
    _ => false
  }
}

///|
/// Escape function name if it's a reserved word
fn escape_func_name(name : String) -> String {
  if is_ts_reserved(name) {
    name + "_"
  } else {
    name
  }
}
