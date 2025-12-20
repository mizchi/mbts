// package "demo"

// Extern types
#external
type Counter

// Functions
extern "js" fn Counter::new(initial : Int) -> Counter =
  #| (initial) => new Counter(initial)

extern "js" fn Counter::increment(self : Counter) -> Unit =
  #| (self) => self.increment()

extern "js" fn Counter::decrement(self : Counter) -> Unit =
  #| (self) => self.decrement()

extern "js" fn Counter::get_value(self : Counter) -> Int =
  #| (self) => self.getValue()
