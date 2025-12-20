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
