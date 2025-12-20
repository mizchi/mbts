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
    let mbti = @tsnize.parse_mbti(content, filename)
    @tsnize.generate_dts(mbti)
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
    let mbti = @tsnize.parse_mbti(content, filename)
    @tsnize.generate_dts_with_preamble(mbti, include_preamble=true)
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
    let mbti = @tsnize.parse_mbti(content, filename)
    @tsnize.generate_dts_namespace(mbti)
  } catch {
    e => "// Error: \{e}"
  }
}

///|
/// Parse MBTI content and return JSON representation of the AST
/// This enables TypeScript to work with the parsed structure directly
pub fn parse_mbti_to_json(content : String, filename : String) -> String {
  try {
    let mbti = @tsnize.parse_mbti(content, filename)
    mbti.to_json().stringify()
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
  match @tsnize.MbtBinding::from_json(json) {
    Some(binding) => @tsnize.generate_mbt(binding)
    None => "// Error: Failed to parse MbtBinding from JSON"
  }
}

///|
/// Parse .mbt source code and generate TypeScript definitions
/// This enables direct .mbt -> .d.ts conversion without intermediate .mbti
pub fn generate_dts_from_mbt_string(content : String, filename : String) -> String {
  @tsnize.generate_dts_from_mbt(content, filename)
}
