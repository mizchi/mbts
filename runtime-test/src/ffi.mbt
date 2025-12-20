// Extern types
#external
type Counter

// Types
pub struct Person {
  name : String
  age : Int
}

// Functions
extern "js" fn add(a : Int, b : Int) -> Int = "add"

extern "js" fn greet(name : String) -> String = "greet"

extern "js" fn get_length(arr : Array[Int]) -> Int = "getLength"

extern "js" fn create_person(name : String, age : Int) -> Person = "createPerson"

extern "js" fn get_person_name(person : Person) -> String = "getPersonName"

extern "js" fn fetch_data(url : String) -> @js.Promise[String] = "fetchData"

extern "js" fn Counter::new(initial : Int) -> Counter = "Counter"

extern "js" fn Counter::increment(self : Counter) -> Int = "Counter.prototype.increment"

extern "js" fn Counter::get_value(self : Counter) -> Int = "Counter.prototype.getValue"
