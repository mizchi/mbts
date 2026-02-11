// CLI entry point for mbts
// Build: moon build --target js
// Usage: node cli.js <mbti-file>

///|
fn main {
  println("mbts - MoonBit to TypeScript type generator")
  println("Use the exported functions from JS")
}

///|
/// Parse MBTI content and generate TypeScript definitions
/// Exported for JS usage
pub fn generate_dts_from_string(content : String, filename : String) -> String {
  try {
    let mbti = @mbts.parse_mbti(content, filename)
    @mbts.generate_dts(mbti)
  } catch {
    e => "// Error: \{e}"
  }
}

///|
/// Parse MBTI content and generate TypeScript definitions with preamble
pub fn generate_dts_with_preamble_from_string(
  content : String,
  filename : String,
) -> String {
  try {
    let mbti = @mbts.parse_mbti(content, filename)
    @mbts.generate_dts_with_preamble(mbti, include_preamble=true)
  } catch {
    e => "// Error: \{e}"
  }
}

///|
/// Parse MBTI content and generate TypeScript definitions wrapped in namespace
pub fn generate_dts_namespace_from_string(
  content : String,
  filename : String,
) -> String {
  try {
    let mbti = @mbts.parse_mbti(content, filename)
    @mbts.generate_dts_namespace(mbti)
  } catch {
    e => "// Error: \{e}"
  }
}

///|
/// Parse MBTI content and return JSON representation of the AST
/// This enables TypeScript to work with the parsed structure directly
pub fn parse_mbti_to_json(content : String, filename : String) -> String {
  try {
    let mbti = @mbts.parse_mbti(content, filename)
    let imports : Array[Json] = mbti.imports
      .to_array()
      .map(fn(import_) {
        match import_.alias_ {
          Some(alias_name) => { "name": import_.name, "alias": alias_name }
          None => { "name": import_.name }
        }
      })
    let summary : Json = {
      "packageName": mbti.package_name,
      "imports": imports,
      "sigCount": mbti.sigs.to_array().length(),
    }
    summary.stringify()
  } catch {
    e => {
      let error_obj : Json = { "error": e.to_string() }
      error_obj.stringify()
    }
  }
}

///|
/// Generate MoonBit FFI bindings from JSON representation of MbtBinding
/// This is the MoonBit implementation of dts-to-mbt code generation
/// Input: JSON string matching dts-to-mbt.ts MbtBinding interface
/// Output: Generated .mbt code string
pub fn generate_mbt_from_json(json_str : String) -> String {
  let json = @json.parse(json_str) catch {
    e => return "// Error: JSON parse error: \{e}"
  }
  match @mbts.MbtBinding::from_json(json) {
    Some(binding) => @mbts.generate_mbt(binding)
    None => "// Error: Failed to parse MbtBinding from JSON"
  }
}

///|
/// Parse .mbt source code and generate TypeScript definitions
/// This enables direct .mbt -> .d.ts conversion without intermediate .mbti
pub fn generate_dts_from_mbt_string(
  content : String,
  filename : String,
) -> String {
  @mbts.generate_dts_from_mbt(content, filename)
}
