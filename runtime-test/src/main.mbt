// Runtime test for extern "js" FFI

fn main {
  // Test 1: Simple add function
  let result = add(1, 2)
  println("add(1, 2) = \{result}")

  // Test 2: String function
  let greeting = greet("World")
  println("greet(\"World\") = \{greeting}")

  // Test 3: Array function
  let arr : Array[Int] = [1, 2, 3, 4, 5]
  let len = get_length(arr)
  println("get_length([1,2,3,4,5]) = \{len}")

  // Test 4: Struct
  let person = create_person("Alice", 30)
  let name = get_person_name(person)
  println("create_person(\"Alice\", 30) -> get_person_name = \{name}")

  // Test 5: Class (using Type::method syntax)
  let counter = Counter::new(10)
  let val1 = counter.increment()
  println("Counter::new(10) -> increment = \{val1}")
  let val2 = counter.get_value()
  println("counter -> get_value = \{val2}")

  println("Sync tests passed!")
}

// Test 6: Async function with Promise (exported for JS to await)
pub fn test_promise() -> @js.Promise[String] {
  fetch_data("https://example.com/api")
}
