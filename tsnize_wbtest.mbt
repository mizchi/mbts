// Whitebox tests for tsnize - test with real mbti files
// Snapshots are written to __snapshot__/*.d.ts for TypeScript type checking

///|
test "snapshot: enum dts generation" (t : @test.Test) {
  let content =
    #|package "test"
    #|
    #|pub enum Status {
    #|  Pending
    #|  Active
    #|  Done
    #|}
    #|
  let mbti = parse_mbti(content, "test.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="enum_unit.d.ts")
}

///|
test "snapshot: struct dts generation" (t : @test.Test) {
  let content =
    #|package "test"
    #|
    #|pub struct User {
    #|  name : String
    #|  age : Int
    #|  mut email : String
    #|}
    #|
  let mbti = parse_mbti(content, "test.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="struct.d.ts")
}

///|
test "snapshot: tuple variant enum dts generation" (t : @test.Test) {
  let content =
    #|package "test"
    #|
    #|pub enum MyResult {
    #|  Ok(String)
    #|  Err(String)
    #|}
    #|
  let mbti = parse_mbti(content, "test.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="enum_tuple.d.ts")
}

///|
test "snapshot: mixed enum dts generation" (t : @test.Test) {
  let content =
    #|package "test"
    #|
    #|pub enum LoadState {
    #|  Idle
    #|  Loading
    #|  Success(String)
    #|  Error(String)
    #|}
    #|
  let mbti = parse_mbti(content, "test.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="enum_mixed.d.ts")
}

///|
test "snapshot: functions and types" (t : @test.Test) {
  let content =
    #|package "mizchi/js/core"
    #|
    #|fn[T] any(T) -> Any
    #|
    #|fn global_this() -> Any
    #|
    #|fn sleep(Double) -> Promise[Unit]
    #|
    #|pub(all) struct Any {
    #|}
    #|
    #|pub struct Promise[T] {
    #|}
    #|
  let mbti = parse_mbti(content, "core.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="functions_and_types.d.ts")
}

///|
test "to_camel_case" {
  inspect(to_camel_case("hello_world"), content="helloWorld")
  inspect(to_camel_case("get_user_name"), content="getUserName")
  inspect(to_camel_case("simple"), content="simple")
}

///|
test "char_to_upper" {
  assert_eq(char_to_upper('a'), 'A')
  assert_eq(char_to_upper('z'), 'Z')
  assert_eq(char_to_upper('A'), 'A')
  assert_eq(char_to_upper('1'), '1')
}

///|
test "snapshot: real mbti - storage" (t : @test.Test) {
  let content =
    #|// Generated using `moon info`, DON'T EDIT IT
    #|package "mizchi/js/browser/storage"
    #|
    #|import(
    #|  "mizchi/js/core"
    #|)
    #|
    #|// Values
    #|fn localStorage() -> Storage
    #|
    #|fn sessionStorage() -> Storage
    #|
    #|// Types and methods
    #|pub(all) struct Storage {
    #|  length : Int
    #|}
    #|fn Storage::as_any(Self) -> @core.Any
    #|fn Storage::clear(Self) -> Unit
    #|fn Storage::entries(Self) -> Array[(String, String)]
    #|fn Storage::getItem(Self, String) -> String?
    #|fn Storage::hasItem(Self, String) -> Bool
    #|fn Storage::key(Self, Int) -> String?
    #|fn Storage::keys(Self) -> Array[String]
    #|fn Storage::removeItem(Self, String) -> Unit
    #|fn Storage::setItem(Self, String, String) -> Unit
    #|fn Storage::values(Self) -> Array[String]
    #|
  let mbti = parse_mbti(content, "storage.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="storage.d.ts")
}

///|
test "snapshot: real mbti - core subset" (t : @test.Test) {
  let content =
    #|package "mizchi/js/core"
    #|
    #|// Values
    #|fn[T] any(T) -> Any
    #|fn global_this() -> Any
    #|fn is_null(Any) -> Bool
    #|fn is_undefined(Any) -> Bool
    #|fn json_parse(String) -> Any
    #|fn json_stringify(Any) -> String
    #|fn null() -> Any
    #|fn undefined() -> Any
    #|fn sleep(Int) -> Unit
    #|
    #|// Types and methods
    #|pub type Any
    #|fn Any::_get(Self, String) -> Self
    #|fn Any::_set(Self, String, Self) -> Unit
    #|fn[T] Any::cast(Self) -> T
    #|
    #|pub type Promise[T]
    #|fn[T] Promise::wait(Self[T]) -> T
    #|fn[A] Promise::resolve(A) -> Self[A]
    #|fn Promise::reject(Any) -> Self[Any]
    #|
    #|pub(all) struct PromiseResolvers[T] {
    #|  promise : Promise[T]
    #|  resolve : (T) -> Unit
    #|  reject : (Error) -> Unit
    #|}
    #|
  let mbti = parse_mbti(content, "core.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="core.d.ts")
}

///|
test "snapshot: labeled and optional arguments" (t : @test.Test) {
  let content =
    #|package "test/args"
    #|
    #|// Optional arguments
    #|fn exit(code? : Int) -> Unit
    #|
    #|// Multiple optional arguments
    #|fn inspect(Any, depth? : Int, colors? : Bool, compact? : Bool) -> String
    #|
    #|// Labeled arguments (required)
    #|fn parseArgs(args~ : Array[String], options~ : Array[Any]) -> Any
    #|
    #|// Mixed: labeled required + optional
    #|fn createServer(port~ : Int, hostname? : String) -> Any
    #|
    #|pub type Any
    #|
  let mbti = parse_mbti(content, "args.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="labeled_optional.d.ts")
}

///|
test "snapshot: enum with labeled variants" (t : @test.Test) {
  let content =
    #|package "test/enum"
    #|
    #|pub enum ParseArgsOption {
    #|  Boolean(key~ : String, short~ : String)
    #|  String(key~ : String, short~ : String, multiple~ : Bool, default~ : String?)
    #|}
    #|
    #|pub enum Action {
    #|  Click(x~ : Int, y~ : Int)
    #|  Scroll(delta~ : Int, direction~ : String)
    #|  KeyPress(key~ : String, modifiers~ : Array[String])
    #|}
    #|
  let mbti = parse_mbti(content, "enum_labeled.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="enum_labeled.d.ts")
}

///|
test "snapshot: complex types" (t : @test.Test) {
  let content =
    #|package "test/complex"
    #|
    #|// Nested generics
    #|fn get_nested() -> Array[Map[String, Array[Int]]]
    #|
    #|// Function types as parameters
    #|fn on_event(handler~ : (String, Any) -> Unit) -> Unit
    #|
    #|// Tuple types
    #|fn get_pair() -> (String, Int)
    #|
    #|// Optional in return type
    #|fn find(key~ : String) -> String?
    #|
    #|pub type Any
    #|pub type Map[K, V]
    #|
  let mbti = parse_mbti(content, "complex.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="complex_types.d.ts")
}

///|
// Test case from mod.test.ts - WebSocket
test "snapshot: websocket mbti" (t : @test.Test) {
  let content =
    #|package "mizchi/js/web/websocket"
    #|
    #|import(
    #|  "mizchi/js/core"
    #|)
    #|
    #|// Values
    #|fn get_close_code(@core.Any) -> Int
    #|
    #|// Types and methods
    #|pub(all) struct WebSocket {
    #|  url : String
    #|  readyState : Int
    #|  mut binaryType : String
    #|}
    #|fn WebSocket::new(String, protocols? : Array[String]) -> Self
    #|fn WebSocket::close(Self, code? : Int, reason? : String) -> Unit
    #|fn WebSocket::send_string(Self, String) -> Unit
    #|
    #|pub enum WebSocketReadyState {
    #|  Connecting
    #|  Open
    #|  Closing
    #|  Closed
    #|}
    #|fn WebSocketReadyState::to_int(Self) -> Int
    #|
  let mbti = parse_mbti(content, "websocket.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="websocket.d.ts")
}
