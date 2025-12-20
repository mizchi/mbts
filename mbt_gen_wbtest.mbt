///|
/// Tests for mbt_gen.mbt - MoonBit code generation

test "generate_mbt: empty binding" {
  let binding = MbtBinding::new()
  let result = generate_mbt(binding)
  assert_eq(result, "")
}

test "generate_mbt: extern types" {
  let binding = MbtBinding::{
    package_name: "",
    types: [],
    functions: [],
    extern_types: ["type Counter", "type Timer[T]"],
    classes: [],
  }
  let result = generate_mbt(binding)
  let expected =
    #|// Extern types
    #|#external
    #|type Counter
    #|
    #|#external
    #|type Timer[T]
    #|
    #|
  assert_eq(result, expected)
}

test "generate_mbt: struct type" {
  let t = MbtType::{
    name: "User",
    kind: MbtTypeKind::Struct,
    fields: [
      MbtField::new("name", "String"),
      MbtField::{ name: "age", type_: "Int", mutable: true },
    ],
    variants: [],
    type_params: [],
    js_name: "",
  }
  let binding = MbtBinding::{
    package_name: "",
    types: [t],
    functions: [],
    extern_types: [],
    classes: [],
  }
  let result = generate_mbt(binding)
  let expected =
    #|// Types
    #|pub struct User {
    #|  name : String
    #|  mut age : Int
    #|}
    #|
    #|
  assert_eq(result, expected)
}

test "generate_mbt: enum type" {
  let t = MbtType::{
    name: "Status",
    kind: MbtTypeKind::Enum,
    fields: [],
    variants: [
      MbtVariant::new("Pending"),
      MbtVariant::{ name: "Active", payload: ["Int"] },
      MbtVariant::{ name: "Error", payload: ["String", "Int"] },
    ],
    type_params: [],
    js_name: "",
  }
  let binding = MbtBinding::{
    package_name: "",
    types: [t],
    functions: [],
    extern_types: [],
    classes: [],
  }
  let result = generate_mbt(binding)
  let expected =
    #|// Types
    #|pub enum Status {
    #|  Pending
    #|  Active(Int)
    #|  Error(String, Int)
    #|}
    #|
    #|
  assert_eq(result, expected)
}

test "generate_mbt: functions" {
  let f1 = MbtFunction::{
    name: "greet",
    params: [MbtParam::new("name", "String")],
    return_type: "String",
    is_async: false,
    js_name: "greet",
    type_params: [],
    is_method: false,
    class_name: "",
  }
  let f2 = MbtFunction::{
    name: "add",
    params: [MbtParam::new("a", "Int"), MbtParam::new("b", "Int")],
    return_type: "Int",
    is_async: false,
    js_name: "add",
    type_params: [],
    is_method: false,
    class_name: "",
  }
  let binding = MbtBinding::{
    package_name: "",
    types: [],
    functions: [f1, f2],
    extern_types: [],
    classes: [],
  }
  let result = generate_mbt(binding)
  let expected =
    #|// Functions
    #|extern "js" fn greet(name : String) -> String = "greet"
    #|extern "js" fn add(a : Int, b : Int) -> Int = "add"
    #|
  assert_eq(result, expected)
}

test "generate_mbt: async function" {
  let f = MbtFunction::{
    name: "fetch_data",
    params: [MbtParam::new("url", "String")],
    return_type: "String",
    is_async: true,
    js_name: "fetchData",
    type_params: [],
    is_method: false,
    class_name: "",
  }
  let binding = MbtBinding::{
    package_name: "",
    types: [],
    functions: [f],
    extern_types: [],
    classes: [],
  }
  let result = generate_mbt(binding)
  let expected =
    #|// Functions
    #|extern "js" fn fetch_data(url : String) -> Promise[String] = "fetchData"
    #|
  assert_eq(result, expected)
}

test "generate_mbt: generic function" {
  let f = MbtFunction::{
    name: "identity",
    params: [MbtParam::new("x", "T")],
    return_type: "T",
    is_async: false,
    js_name: "identity",
    type_params: ["T"],
    is_method: false,
    class_name: "",
  }
  let binding = MbtBinding::{
    package_name: "",
    types: [],
    functions: [f],
    extern_types: [],
    classes: [],
  }
  let result = generate_mbt(binding)
  let expected =
    #|// Functions
    #|extern "js" fn identity[T](x : T) -> T = "identity"
    #|
  assert_eq(result, expected)
}

test "generate_mbt: class method" {
  let f = MbtFunction::{
    name: "Counter::increment",
    params: [MbtParam::new("self", "Counter")],
    return_type: "Int",
    is_async: false,
    js_name: "Counter.prototype.increment",
    type_params: [],
    is_method: true,
    class_name: "Counter",
  }
  let binding = MbtBinding::{
    package_name: "",
    types: [],
    functions: [f],
    extern_types: ["type Counter"],
    classes: [],
  }
  let result = generate_mbt(binding)
  let expected =
    #|// Extern types
    #|#external
    #|type Counter
    #|
    #|// Functions
    #|extern "js" fn Counter::increment(self : Counter) -> Int = "Counter.prototype.increment"
    #|
  assert_eq(result, expected)
}
