// package "demo"

// Extern types
#external
type Container[T]

// Types
pub struct Result[T, E] {
  value : T?
  error : E?
}

// Functions
extern "js" fn Container::new[T](value : T) -> Container[T] =
  #| (value) => new Container(value)

extern "js" fn Container::get[T](self : Container[T]) -> T =
  #| (self) => self.get()

extern "js" fn Container::set[T](self : Container[T], value : T) -> Unit =
  #| (self, value) => self.set(value)

extern "js" fn wrap[T](value : T) -> Container<T> = "wrap"
