// Extern types
#external
type Container[T]

// Types
pub struct Result[T, E] {
  value : T?
  error : E?
}

// Functions
extern "js" fn Container::new(value : @js.Any) -> Container[@js.Any] =
  #| (value) => new Container(value)

extern "js" fn Container::get(self : Container[@js.Any]) -> @js.Any =
  #| (self) => self.get()

extern "js" fn Container::set(self : Container[@js.Any], value : @js.Any) -> Unit =
  #| (self, value) => self.set(value)

extern "js" fn wrap(value : @js.Any) -> Container[@js.Any] = "wrap"
