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
  let type_params = if t.type_params.length() > 0 {
    let buf = StringBuilder::new()
    buf.write_string("[")
    for i, p in t.type_params {
      if i > 0 {
        buf.write_string(", ")
      }
      buf.write_string(p)
    }
    buf.write_string("]")
    buf.to_string()
  } else {
    ""
  }
  match t.kind {
    Struct => {
      if t.fields.length() == 0 {
        "pub struct \{t.name}\{type_params} {}"
      } else {
        let buf = StringBuilder::new()
        buf.write_string("pub struct ")
        buf.write_string(t.name)
        buf.write_string(type_params)
        buf.write_string(" {\n")
        for f in t.fields {
          buf.write_string("  ")
          if f.mutable {
            buf.write_string("mut ")
          }
          buf.write_string(f.name)
          buf.write_string(" : ")
          buf.write_string(f.type_)
          buf.write_string("\n")
        }
        buf.write_string("}")
        buf.to_string()
      }
    }
    Enum => {
      let buf = StringBuilder::new()
      buf.write_string("pub enum ")
      buf.write_string(t.name)
      buf.write_string(type_params)
      buf.write_string(" {\n")
      for v in t.variants {
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
      buf.write_string("}")
      buf.to_string()
    }
    Type => "pub type \{t.name}\{type_params}"
  }
}

///|
fn gen_mbt_function(f : MbtFunction) -> String {
  let type_params = if f.type_params.length() > 0 {
    let buf = StringBuilder::new()
    buf.write_string("[")
    for i, p in f.type_params {
      if i > 0 {
        buf.write_string(", ")
      }
      buf.write_string(p)
    }
    buf.write_string("]")
    buf.to_string()
  } else {
    ""
  }
  let params = {
    let buf = StringBuilder::new()
    for i, p in f.params {
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
  // Handle async - wrap in Promise if not already
  let return_type = if f.is_async && not(f.return_type.has_prefix("Promise[")) {
    "Promise[\{f.return_type}]"
  } else {
    f.return_type
  }
  "extern \"js\" fn \{f.name}\{type_params}(\{params}) -> \{return_type} = \"\{f.js_name}\""
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
