// Simple MoonBit project for testing mbts

// External JS function binding
extern "js" fn console_log(message : String) -> Unit =
  #| (msg) => console.log(msg)

// ============================================================
// Structs
// ============================================================

pub struct User {
  id : Int
  name : String
  email : String?
}

pub struct Point {
  x : Double
  y : Double
}

// ============================================================
// Enums
// ============================================================

pub enum Status {
  Pending
  Active
  Done
}

pub enum Result[T, E] {
  Ok(T)
  Err(E)
}

// ============================================================
// Generic type (extern) - uses @js.Any for FFI compatibility
// ============================================================

type Box[T]

extern "js" fn Box::new(value : @js.Any) -> Box[@js.Any] =
  #| (v) => ({ value: v })

extern "js" fn Box::get(self : Box[@js.Any]) -> @js.Any =
  #| (self) => self.value

extern "js" fn Box::set(self : Box[@js.Any], value : @js.Any) -> Unit =
  #| (self, v) => { self.value = v }

// ============================================================
// Public functions
// ============================================================

pub fn greet(name : String) -> String {
  "Hello, " + name + "!"
}

pub fn add(a : Int, b : Int) -> Int {
  a + b
}

pub fn create_user(id : Int, name : String) -> User {
  { id, name, email: None }
}

pub fn create_point(x : Double, y : Double) -> Point {
  { x, y }
}

pub fn distance(p1 : Point, p2 : Point) -> Double {
  let dx = p1.x - p2.x
  let dy = p1.y - p2.y
  (dx * dx + dy * dy).sqrt()
}

// Generic function (will need wrapper)
pub fn[T] identity(value : T) -> T {
  value
}

// Non-generic wrapper for export
pub fn identity_any(value : @js.Any) -> @js.Any {
  value
}

// Box operations with Any for export
pub fn box_new(value : @js.Any) -> Box[@js.Any] {
  Box::new(value)
}

pub fn box_get(b : Box[@js.Any]) -> @js.Any {
  b.get()
}

pub fn box_set(b : Box[@js.Any], value : @js.Any) -> Unit {
  b.set(value)
}

// Test function using console
fn main {
  console_log(greet("MoonBit"))
}
