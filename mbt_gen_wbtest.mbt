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
    #|extern "js" fn Counter::increment(self : Counter) -> Int =
    #|  #| (self) => self.increment()
    #|
  assert_eq(result, expected)
}

// ============================================================
// JSON Parsing Tests
// ============================================================

test "from_json: simple function" {
  let json : Json = {
    "packageName": "mylib",
    "functions": [
      {
        "name": "greet",
        "jsName": "greet",
        "returnType": "String",
        "params": [{ "name": "name", "type": "String" }],
      },
    ],
    "types": [],
    "externTypes": [],
    "classes": [],
  }
  let binding = MbtBinding::from_json(json).unwrap()
  assert_eq(binding.package_name, "mylib")
  assert_eq(binding.functions.length(), 1)
  assert_eq(binding.functions[0].name, "greet")
  assert_eq(binding.functions[0].params[0].name, "name")
  assert_eq(binding.functions[0].params[0].type_, "String")
}

test "from_json: struct type" {
  let json : Json = {
    "packageName": "",
    "functions": [],
    "types": [
      {
        "name": "User",
        "kind": "struct",
        "fields": [
          { "name": "name", "type": "String", "mutable": false },
          { "name": "age", "type": "Int", "mutable": true },
        ],
      },
    ],
    "externTypes": [],
    "classes": [],
  }
  let binding = MbtBinding::from_json(json).unwrap()
  assert_eq(binding.types.length(), 1)
  let t = binding.types[0]
  assert_eq(t.name, "User")
  assert_eq(t.fields.length(), 2)
  assert_eq(t.fields[0].name, "name")
  assert_eq(t.fields[0].mutable, false)
  assert_eq(t.fields[1].mutable, true)
}

test "from_json: enum type" {
  let json : Json = {
    "packageName": "",
    "functions": [],
    "types": [
      {
        "name": "Status",
        "kind": "enum",
        "variants": [
          { "name": "Pending" },
          { "name": "Active", "payload": ["Int"] },
        ],
      },
    ],
    "externTypes": [],
    "classes": [],
  }
  let binding = MbtBinding::from_json(json).unwrap()
  let t = binding.types[0]
  assert_eq(t.name, "Status")
  assert_eq(t.variants.length(), 2)
  assert_eq(t.variants[0].name, "Pending")
  assert_eq(t.variants[0].payload.length(), 0)
  assert_eq(t.variants[1].name, "Active")
  assert_eq(t.variants[1].payload[0], "Int")
}

test "from_json: async function" {
  let json : Json = {
    "packageName": "",
    "functions": [
      {
        "name": "fetch_data",
        "jsName": "fetchData",
        "returnType": "String",
        "isAsync": true,
        "params": [{ "name": "url", "type": "String" }],
      },
    ],
    "types": [],
    "externTypes": [],
    "classes": [],
  }
  let binding = MbtBinding::from_json(json).unwrap()
  assert_eq(binding.functions[0].is_async, true)
}

test "from_json: class with methods" {
  let json : Json = {
    "packageName": "",
    "functions": [],
    "types": [],
    "externTypes": ["type Counter"],
    "classes": [
      {
        "name": "Counter",
        "hasConstructor": true,
        "methods": [{ "name": "increment", "jsName": "increment" }],
      },
    ],
  }
  let binding = MbtBinding::from_json(json).unwrap()
  assert_eq(binding.extern_types[0], "type Counter")
  assert_eq(binding.classes.length(), 1)
  assert_eq(binding.classes[0].name, "Counter")
  assert_eq(binding.classes[0].has_constructor, true)
  assert_eq(binding.classes[0].methods[0].name, "increment")
}

test "from_json: roundtrip with generate_mbt" {
  // Test that parsing JSON and generating MBT produces expected output
  let json : Json = {
    "packageName": "",
    "functions": [
      {
        "name": "add",
        "jsName": "add",
        "returnType": "Int",
        "params": [
          { "name": "a", "type": "Int" },
          { "name": "b", "type": "Int" },
        ],
      },
    ],
    "types": [],
    "externTypes": [],
    "classes": [],
  }
  let binding = MbtBinding::from_json(json).unwrap()
  let result = generate_mbt(binding)
  let expected =
    #|// Functions
    #|extern "js" fn add(a : Int, b : Int) -> Int = "add"
    #|
  assert_eq(result, expected)
}
