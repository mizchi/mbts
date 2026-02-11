// Test file to verify export behavior with generics
//
// Findings:
// 1. extern "js" fn with string binding -> NOT generated (external)
// 2. extern "js" fn with inline JS -> generated but NOT exportable
// 3. pub fn[T] generic function -> NOT exportable
// 4. pub fn non-generic wrapper -> EXPORTABLE
//
// Solution: Wrap extern/generic functions in non-generic pub fn

// ============================================================
// Extern type with type parameter
// ============================================================

///|
#external
type Container[T]

// ============================================================
// Extern functions (NOT directly exportable)
// ============================================================

// String binding - meant to be provided externally

///|
extern "js" fn external_greet(name : String) -> String = "greet"

// Inline JS - generated but not exportable

///|
extern "js" fn Container::new(value : @js.Any) -> Container[@js.Any] =
  #| (value) => new Container(value)

///|
extern "js" fn Container::get(self : Container[@js.Any]) -> @js.Any =
  #| (self) => self.get()

///|
extern "js" fn Container::set(
  self : Container[@js.Any],
  value : @js.Any,
) -> Unit =
  #| (self, value) => self.set(value)

// ============================================================
// Generic functions (NOT directly exportable)
// ============================================================

///|
pub fn[T] identity(value : T) -> T {
  value
}

// ============================================================
// Exportable wrappers (pub fn without generics)
// ============================================================

///|
/// Wrapper for external_greet - delegates to extern
pub fn greet(name : String) -> String {
  external_greet(name)
}

///|
/// Wrapper for Container::new
pub fn container_new(value : @js.Any) -> Container[@js.Any] {
  Container::new(value)
}

///|
/// Wrapper for Container::get
pub fn container_get(c : Container[@js.Any]) -> @js.Any {
  c.get()
}

///|
/// Wrapper for Container::set
pub fn container_set(c : Container[@js.Any], value : @js.Any) -> Unit {
  c.set(value)
}

///|
/// High-level API using Container
pub fn wrap_and_get(value : @js.Any) -> @js.Any {
  let c = Container::new(value)
  c.get()
}

///|
/// Wrapper for generic identity with @js.Any
pub fn identity_any(value : @js.Any) -> @js.Any {
  identity(value)
}
