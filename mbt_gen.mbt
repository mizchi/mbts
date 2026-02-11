///|
/// mbt_gen.mbt - Generate MoonBit FFI bindings from MbtBinding
///
/// This is the MoonBit implementation of dts-to-mbt code generation.
/// TypeScript parsing is still done in JS, code generation is done here.

// ============================================================
// Types (mirror of dts-to-mbt.ts types)
// ============================================================

///|
pub struct MbtBinding {
  package_name : String
  types : Array[MbtType]
  functions : Array[MbtFunction]
  extern_types : Array[String]
  classes : Array[MbtClass]
}

///|
pub struct MbtClass {
  name : String
  type_params : Array[String]
  methods : Array[MbtMethod]
  has_constructor : Bool
}

///|
pub struct MbtMethod {
  name : String
  js_name : String
}

///|
pub enum MbtTypeKind {
  Struct
  Type
  Enum
}

///|
pub struct MbtType {
  name : String
  kind : MbtTypeKind
  fields : Array[MbtField]
  variants : Array[MbtVariant]
  type_params : Array[String]
  js_name : String
}

///|
pub struct MbtField {
  name : String
  type_ : String
  mutable : Bool
}

///|
pub struct MbtVariant {
  name : String
  payload : Array[String]
}

///|
pub struct MbtFunction {
  name : String
  params : Array[MbtParam]
  return_type : String
  is_async : Bool
  js_name : String
  type_params : Array[String]
  is_method : Bool
  class_name : String
}

///|
pub struct MbtParam {
  name : String
  type_ : String
  optional : Bool
}

// ============================================================
// Helper Functions (public for testing)
// ============================================================

///|
/// Format type parameters as "[T, U, V]" or "" if empty
pub fn format_type_params(params : Array[String]) -> String {
  if params.length() == 0 {
    return ""
  }
  let buf = StringBuilder::new()
  buf.write_string("[")
  for i, p in params {
    if i > 0 {
      buf.write_string(", ")
    }
    buf.write_string(p)
  }
  buf.write_string("]")
  buf.to_string()
}

///|
/// Format struct fields
pub fn format_fields(fields : Array[MbtField]) -> String {
  let buf = StringBuilder::new()
  for f in fields {
    buf.write_string("  ")
    if f.mutable {
      buf.write_string("mut ")
    }
    buf.write_string(f.name)
    buf.write_string(" : ")
    buf.write_string(f.type_)
    buf.write_string("\n")
  }
  buf.to_string()
}

///|
/// Format enum variants
pub fn format_variants(variants : Array[MbtVariant]) -> String {
  let buf = StringBuilder::new()
  for v in variants {
    buf.write_string("  ")
    buf.write_string(v.name)
    if v.payload.length() > 0 {
      buf.write_string("(")
      for i, p in v.payload {
        if i > 0 {
          buf.write_string(", ")
        }
        buf.write_string(p)
      }
      buf.write_string(")")
    }
    buf.write_string("\n")
  }
  buf.to_string()
}

///|
/// Format function parameters as "name : Type, name2 : Type2"
pub fn format_fn_params(params : Array[MbtParam]) -> String {
  let buf = StringBuilder::new()
  for i, p in params {
    if i > 0 {
      buf.write_string(", ")
    }
    let name = if p.name.length() > 0 { p.name } else { "arg\{i}" }
    buf.write_string(name)
    buf.write_string(" : ")
    buf.write_string(p.type_)
  }
  buf.to_string()
}

// ============================================================
// Code Generation
// ============================================================

///|
pub fn generate_mbt(binding : MbtBinding) -> String {
  let buf = StringBuilder::new()
  // Package declaration (commented out)
  if binding.package_name.length() > 0 {
    buf.write_string("// package \"")
    buf.write_string(binding.package_name)
    buf.write_string("\"\n\n")
  }
  // Extern type declarations
  if binding.extern_types.length() > 0 {
    buf.write_string("// Extern types\n")
    for t in binding.extern_types {
      buf.write_string("#external\n")
      buf.write_string(t)
      buf.write_string("\n\n")
    }
  }
  // Type definitions
  if binding.types.length() > 0 {
    buf.write_string("// Types\n")
    for t in binding.types {
      buf.write_string(gen_mbt_type(t))
      buf.write_string("\n\n")
    }
  }
  // Function bindings
  if binding.functions.length() > 0 {
    buf.write_string("// Functions\n")
    for f in binding.functions {
      buf.write_string(gen_mbt_function(f))
      buf.write_string("\n")
    }
  }
  buf.to_string()
}

///|
fn gen_mbt_type(t : MbtType) -> String {
  let type_params = format_type_params(t.type_params)
  match t.kind {
    Struct => gen_struct(t.name, type_params, t.fields)
    Enum => gen_enum(t.name, type_params, t.variants)
    Type => "pub type \{t.name}\{type_params}"
  }
}

///|
/// Generate struct definition
fn gen_struct(
  name : String,
  type_params : String,
  fields : Array[MbtField],
) -> String {
  if fields.length() == 0 {
    "pub struct \{name}\{type_params} {}"
  } else {
    let fields_str = format_fields(fields)
    "pub struct \{name}\{type_params} {\n\{fields_str}}"
  }
}

///|
/// Generate enum definition
fn gen_enum(
  name : String,
  type_params : String,
  variants : Array[MbtVariant],
) -> String {
  let variants_str = format_variants(variants)
  "pub enum \{name}\{type_params} {\n\{variants_str}}"
}

///|
fn gen_mbt_function(f : MbtFunction) -> String {
  let type_params = format_type_params(f.type_params)
  let params = format_fn_params(f.params)
  // Handle async - wrap in Promise if not already
  let return_type = if f.is_async && not(f.return_type.has_prefix("Promise[")) {
    "Promise[\{f.return_type}]"
  } else {
    f.return_type
  }

  // Generate inline JS for methods/constructors (glue-code-free)
  if f.is_method && f.class_name.length() > 0 {
    // Check if it's a constructor (name ends with ::new)
    if f.name.has_suffix("::new") {
      // Constructor: new ClassName(args)
      let arg_names = gen_param_names(f.params)
      let buf = StringBuilder::new()
      buf.write_string("extern \"js\" fn ")
      buf.write_string(f.name)
      buf.write_string(type_params)
      buf.write_string("(")
      buf.write_string(params)
      buf.write_string(") -> ")
      buf.write_string(return_type)
      buf.write_string(" =\n  #| (")
      buf.write_string(arg_names)
      buf.write_string(") => new ")
      buf.write_string(f.class_name)
      buf.write_string("(")
      buf.write_string(arg_names)
      buf.write_string(")")
      buf.to_string()
    } else {
      // Method: self.methodName(args)
      // Extract method name from "ClassName::method_name"
      let method_name = extract_method_name(f.name)
      let js_method_name = to_camel_case(method_name)
      // Skip 'self' parameter for JS call
      let arg_names_without_self = gen_param_names_skip_first(f.params)
      let buf = StringBuilder::new()
      buf.write_string("extern \"js\" fn ")
      buf.write_string(f.name)
      buf.write_string(type_params)
      buf.write_string("(")
      buf.write_string(params)
      buf.write_string(") -> ")
      buf.write_string(return_type)
      buf.write_string(" =\n  #| (self")
      if arg_names_without_self.length() > 0 {
        buf.write_string(", ")
        buf.write_string(arg_names_without_self)
      }
      buf.write_string(") => self.")
      buf.write_string(js_method_name)
      buf.write_string("(")
      buf.write_string(arg_names_without_self)
      buf.write_string(")")
      buf.to_string()
    }
  } else {
    // Regular function - use simple string binding
    "extern \"js\" fn \{f.name}\{type_params}(\{params}) -> \{return_type} = \"\{f.js_name}\""
  }
}

///|
/// Generate comma-separated parameter names
fn gen_param_names(params : Array[MbtParam]) -> String {
  let buf = StringBuilder::new()
  for i, p in params {
    if i > 0 {
      buf.write_string(", ")
    }
    let name = if p.name.length() > 0 { p.name } else { "arg\{i}" }
    buf.write_string(name)
  }
  buf.to_string()
}

///|
/// Generate comma-separated parameter names, skipping first (self)
fn gen_param_names_skip_first(params : Array[MbtParam]) -> String {
  let buf = StringBuilder::new()
  let mut first = true
  for i, p in params {
    if i == 0 {
      continue // Skip self
    }
    if not(first) {
      buf.write_string(", ")
    }
    first = false
    let name = if p.name.length() > 0 { p.name } else { "arg\{i}" }
    buf.write_string(name)
  }
  buf.to_string()
}

///|
/// Extract method name from "ClassName::method_name"
fn extract_method_name(full_name : String) -> String {
  match full_name.find("::") {
    Some(idx) => {
      let chars : Array[Char] = full_name.to_array()
      let buf = StringBuilder::new()
      for i = idx + 2; i < chars.length(); i = i + 1 {
        buf.write_char(chars[i])
      }
      buf.to_string()
    }
    None => full_name
  }
}

// ============================================================
// Default constructors
// ============================================================

///|
pub fn MbtBinding::new() -> MbtBinding {
  MbtBinding::{
    package_name: "",
    types: [],
    functions: [],
    extern_types: [],
    classes: [],
  }
}

///|
pub fn MbtType::new(name : String, kind : MbtTypeKind) -> MbtType {
  MbtType::{
    name,
    kind,
    fields: [],
    variants: [],
    type_params: [],
    js_name: "",
  }
}

///|
pub fn MbtFunction::new(name : String, js_name : String) -> MbtFunction {
  MbtFunction::{
    name,
    params: [],
    return_type: "Unit",
    is_async: false,
    js_name,
    type_params: [],
    is_method: false,
    class_name: "",
  }
}

///|
pub fn MbtParam::new(name : String, type_ : String) -> MbtParam {
  MbtParam::{ name, type_, optional: false }
}

///|
pub fn MbtField::new(name : String, type_ : String) -> MbtField {
  MbtField::{ name, type_, mutable: false }
}

///|
pub fn MbtVariant::new(name : String) -> MbtVariant {
  MbtVariant::{ name, payload: [] }
}

// ============================================================
// JSON Parsing (for TypeScript integration)
// ============================================================

///|
/// Helper to get optional string from Json object
fn get_string(obj : Map[String, Json], key : String) -> String? {
  match obj.get(key) {
    Some(v) => v.as_string()
    None => None
  }
}

///|
/// Helper to get optional bool from Json object
fn get_bool(obj : Map[String, Json], key : String) -> Bool? {
  match obj.get(key) {
    Some(v) => v.as_bool()
    None => None
  }
}

///|
/// Helper to get optional array from Json object
fn get_array(obj : Map[String, Json], key : String) -> Array[Json]? {
  match obj.get(key) {
    Some(v) => v.as_array()
    None => None
  }
}

///|
/// Parse MbtBinding from JSON
/// JSON structure mirrors dts-to-mbt.ts MbtBinding interface
pub fn MbtBinding::from_json(json : Json) -> MbtBinding? {
  match json.as_object() {
    None => None
    Some(obj) => {
      let package_name = get_string(obj, "packageName").unwrap_or("")
      let extern_types = parse_string_array(get_array(obj, "externTypes"))
      let types = parse_mbt_types(get_array(obj, "types"))
      let functions = parse_mbt_functions(get_array(obj, "functions"))
      let classes = parse_mbt_classes(get_array(obj, "classes"))
      Some(MbtBinding::{ package_name, types, functions, extern_types, classes })
    }
  }
}

///|
fn parse_string_array(arr : Array[Json]?) -> Array[String] {
  let result : Array[String] = []
  match arr {
    Some(items) =>
      for item in items {
        match item.as_string() {
          Some(s) => result.push(s)
          None => ()
        }
      }
    None => ()
  }
  result
}

///|
fn parse_mbt_types(arr : Array[Json]?) -> Array[MbtType] {
  let result : Array[MbtType] = []
  match arr {
    Some(items) =>
      for item in items {
        match MbtType::from_json(item) {
          Some(t) => result.push(t)
          None => ()
        }
      }
    None => ()
  }
  result
}

///|
fn parse_mbt_functions(arr : Array[Json]?) -> Array[MbtFunction] {
  let result : Array[MbtFunction] = []
  match arr {
    Some(items) =>
      for item in items {
        match MbtFunction::from_json(item) {
          Some(f) => result.push(f)
          None => ()
        }
      }
    None => ()
  }
  result
}

///|
fn parse_mbt_classes(arr : Array[Json]?) -> Array[MbtClass] {
  let result : Array[MbtClass] = []
  match arr {
    Some(items) =>
      for item in items {
        match MbtClass::from_json(item) {
          Some(c) => result.push(c)
          None => ()
        }
      }
    None => ()
  }
  result
}

///|
pub fn MbtType::from_json(json : Json) -> MbtType? {
  match json.as_object() {
    None => None
    Some(obj) => {
      let name = match get_string(obj, "name") {
        Some(n) => n
        None => return None
      }
      let kind_str = match get_string(obj, "kind") {
        Some(k) => k
        None => return None
      }
      let kind = match kind_str {
        "struct" => MbtTypeKind::Struct
        "type" => MbtTypeKind::Type
        "enum" => MbtTypeKind::Enum
        _ => return None
      }
      let fields = parse_mbt_fields(get_array(obj, "fields"))
      let variants = parse_mbt_variants(get_array(obj, "variants"))
      let type_params = parse_string_array(get_array(obj, "typeParams"))
      let js_name = get_string(obj, "jsName").unwrap_or("")
      Some(MbtType::{ name, kind, fields, variants, type_params, js_name })
    }
  }
}

///|
fn parse_mbt_fields(arr : Array[Json]?) -> Array[MbtField] {
  let result : Array[MbtField] = []
  match arr {
    Some(items) =>
      for item in items {
        match MbtField::from_json(item) {
          Some(f) => result.push(f)
          None => ()
        }
      }
    None => ()
  }
  result
}

///|
pub fn MbtField::from_json(json : Json) -> MbtField? {
  match json.as_object() {
    None => None
    Some(obj) => {
      let name = match get_string(obj, "name") {
        Some(n) => n
        None => return None
      }
      let type_ = match get_string(obj, "type") {
        Some(t) => t
        None => return None
      }
      let mutable = get_bool(obj, "mutable").unwrap_or(false)
      Some(MbtField::{ name, type_, mutable })
    }
  }
}

///|
fn parse_mbt_variants(arr : Array[Json]?) -> Array[MbtVariant] {
  let result : Array[MbtVariant] = []
  match arr {
    Some(items) =>
      for item in items {
        match MbtVariant::from_json(item) {
          Some(v) => result.push(v)
          None => ()
        }
      }
    None => ()
  }
  result
}

///|
pub fn MbtVariant::from_json(json : Json) -> MbtVariant? {
  match json.as_object() {
    None => None
    Some(obj) => {
      let name = match get_string(obj, "name") {
        Some(n) => n
        None => return None
      }
      let payload = parse_string_array(get_array(obj, "payload"))
      Some(MbtVariant::{ name, payload })
    }
  }
}

///|
pub fn MbtFunction::from_json(json : Json) -> MbtFunction? {
  match json.as_object() {
    None => None
    Some(obj) => {
      let name = match get_string(obj, "name") {
        Some(n) => n
        None => return None
      }
      let js_name = match get_string(obj, "jsName") {
        Some(n) => n
        None => return None
      }
      let return_type = get_string(obj, "returnType").unwrap_or("Unit")
      let is_async = get_bool(obj, "isAsync").unwrap_or(false)
      let type_params = parse_string_array(get_array(obj, "typeParams"))
      let is_method = get_bool(obj, "isMethod").unwrap_or(false)
      let class_name = get_string(obj, "className").unwrap_or("")
      let params = parse_mbt_params(get_array(obj, "params"))
      Some(MbtFunction::{
        name,
        params,
        return_type,
        is_async,
        js_name,
        type_params,
        is_method,
        class_name,
      })
    }
  }
}

///|
fn parse_mbt_params(arr : Array[Json]?) -> Array[MbtParam] {
  let result : Array[MbtParam] = []
  match arr {
    Some(items) =>
      for item in items {
        match MbtParam::from_json(item) {
          Some(p) => result.push(p)
          None => ()
        }
      }
    None => ()
  }
  result
}

///|
pub fn MbtParam::from_json(json : Json) -> MbtParam? {
  match json.as_object() {
    None => None
    Some(obj) => {
      let name = match get_string(obj, "name") {
        Some(n) => n
        None => return None
      }
      let type_ = match get_string(obj, "type") {
        Some(t) => t
        None => return None
      }
      let optional = get_bool(obj, "optional").unwrap_or(false)
      Some(MbtParam::{ name, type_, optional })
    }
  }
}

///|
pub fn MbtClass::from_json(json : Json) -> MbtClass? {
  match json.as_object() {
    None => None
    Some(obj) => {
      let name = match get_string(obj, "name") {
        Some(n) => n
        None => return None
      }
      let type_params = parse_string_array(get_array(obj, "typeParams"))
      let has_constructor = get_bool(obj, "hasConstructor").unwrap_or(false)
      let methods = parse_mbt_methods(get_array(obj, "methods"))
      Some(MbtClass::{ name, type_params, methods, has_constructor })
    }
  }
}

///|
fn parse_mbt_methods(arr : Array[Json]?) -> Array[MbtMethod] {
  let result : Array[MbtMethod] = []
  match arr {
    Some(items) =>
      for item in items {
        match MbtMethod::from_json(item) {
          Some(m) => result.push(m)
          None => ()
        }
      }
    None => ()
  }
  result
}

///|
pub fn MbtMethod::from_json(json : Json) -> MbtMethod? {
  match json.as_object() {
    None => None
    Some(obj) => {
      let name = match get_string(obj, "name") {
        Some(n) => n
        None => return None
      }
      let js_name = match get_string(obj, "jsName") {
        Some(n) => n
        None => return None
      }
      Some(MbtMethod::{ name, js_name })
    }
  }
}
