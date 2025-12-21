// Whitebox tests for mbts - test with real mbti files
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
test "snapshot: mbti_ast package - full mbti file" (t : @test.Test) {
  // Test with actual pkg.generated.mbti content including pub impl and pub using
  let content =
    #|// Generated using `moon info`, DON'T EDIT IT
    #|package "moonbitlang/parser/mbti_ast"
    #|
    #|import(
    #|  "moonbitlang/core/list"
    #|  "moonbitlang/parser/basic"
    #|  "moonbitlang/parser/syntax"
    #|)
    #|
    #|// Values
    #|
    #|// Errors
    #|
    #|// Types and methods
    #|pub(all) enum AliasSig {
    #|  TypeAlias(name~ : Name, type_params~ : @list.List[TypeParamNoConstraints], type_~ : @syntax.Type, vis~ : @syntax.Visibility)
    #|  TraitAlias(name~ : Name, trait_name~ : QualifiedName, vis~ : @syntax.Visibility)
    #|  FnAlias(name~ : Name, type_name~ : QualifiedName, loc~ : @basic.Location)
    #|}
    #|pub impl ToJson for AliasSig
    #|
    #|pub(all) struct ConstSig {
    #|  name : Name
    #|  type_ : @syntax.Type
    #|  value : @syntax.Constant
    #|}
    #|pub impl ToJson for ConstSig
    #|
    #|pub(all) struct FuncSig {
    #|  attr : @list.List[(String, String?, String)]
    #|  type_name : Name?
    #|  name : Name
    #|  params : @list.List[Parameter]
    #|  return_ : (@syntax.Type, @syntax.ErrorType)
    #|  type_params : @list.List[TypeParamWithConstraints]
    #|}
    #|pub impl ToJson for FuncSig
    #|
    #|pub(all) enum ImplSig {
    #|  Trait(type_params~ : @list.List[TypeParamWithConstraints], type_~ : @syntax.Type, trait_name~ : QualifiedName)
    #|  DefaultImpl(trait_name~ : Name, method_name~ : Name)
    #|}
    #|pub impl ToJson for ImplSig
    #|
    #|pub(all) struct Mbti {
    #|  package_name : String
    #|  imports : @list.List[PackageImport]
    #|  sigs : @list.List[(Sig, @basic.Location)]
    #|}
    #|pub impl ToJson for Mbti
    #|
    #|pub(all) struct Name {
    #|  name : String
    #|  loc : @basic.Location
    #|}
    #|pub impl ToJson for Name
    #|
    #|pub(all) struct PackageImport {
    #|  name : String
    #|  alias_ : String?
    #|}
    #|pub impl ToJson for PackageImport
    #|
    #|pub(all) enum Parameter {
    #|  Positional(@syntax.Type)
    #|  Labelled(@syntax.Label, @syntax.Type)
    #|  Autofill(@syntax.Label, @syntax.Type)
    #|  OptionalDefault(@syntax.Label, @syntax.Type)
    #|  OptionalOption(@syntax.Label, @syntax.Type)
    #|}
    #|pub impl ToJson for Parameter
    #|
    #|pub(all) struct QualifiedName {
    #|  name : @syntax.LongIdent
    #|  loc : @basic.Location
    #|}
    #|pub impl ToJson for QualifiedName
    #|
    #|pub(all) enum Sig {
    #|  Func(FuncSig)
    #|  Type(TypeSig)
    #|  Alias(AliasSig)
    #|  Trait(TraitSig)
    #|  Impl(ImplSig)
    #|  Const(ConstSig)
    #|  Value(ValueSig)
    #|}
    #|pub impl ToJson for Sig
    #|
    #|pub(all) enum TraitMethodParameter {
    #|  Positional(@syntax.Type)
    #|  Labelled(@syntax.Label, @syntax.Type)
    #|}
    #|pub impl ToJson for TraitMethodParameter
    #|
    #|pub(all) struct TraitMethodSig {
    #|  name : Name
    #|  params : @list.List[TraitMethodParameter]
    #|  has_default : Bool
    #|  return_ : (@syntax.Type, @syntax.ErrorType)
    #|}
    #|pub impl ToJson for TraitMethodSig
    #|
    #|pub(all) struct TraitSig {
    #|  name : Name
    #|  super_traits : @list.List[QualifiedName]
    #|  methods : @list.List[TraitMethodSig]
    #|  vis : @syntax.Visibility
    #|}
    #|pub impl ToJson for TraitSig
    #|
    #|pub(all) enum TypeParamNoConstraints {
    #|  Name(Name)
    #|  Underscore(@basic.Location)
    #|}
    #|pub impl ToJson for TypeParamNoConstraints
    #|
    #|pub(all) struct TypeParamWithConstraints {
    #|  name : Name
    #|  constraints : @list.List[QualifiedName]
    #|}
    #|pub impl ToJson for TypeParamWithConstraints
    #|
    #|pub(all) struct TypeSig {
    #|  name : Name
    #|  type_params : @list.List[TypeParamNoConstraints]
    #|  components : @syntax.TypeDesc
    #|  vis : @syntax.Visibility
    #|}
    #|pub impl ToJson for TypeSig
    #|
    #|pub(all) struct ValueSig {
    #|  name : Name
    #|  type_ : @syntax.Type
    #|}
    #|pub impl ToJson for ValueSig
    #|
    #|// Type aliases
    #|pub using @syntax {type Constant}
    #|
    #|pub using @syntax {type ConstrDecl}
    #|
    #|pub using @syntax {type ConstrId}
    #|
    #|pub using @syntax {type ConstrName}
    #|
    #|pub using @syntax {type ConstrParam}
    #|
    #|pub using @syntax {type ErrorType}
    #|
    #|pub using @syntax {type FieldDecl}
    #|
    #|pub using @syntax {type FieldName}
    #|
    #|pub using @syntax {type Label}
    #|
    #|pub using @syntax {type LongIdent as QualifiedIdent}
    #|
    #|pub using @syntax {type Type}
    #|
    #|pub using @syntax {type TypeDesc}
    #|
    #|pub using @syntax {type Visibility}
    #|
    #|// Traits
    #|
  let mbti = parse_mbti(content, "mbti_ast.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="mbti_ast.d.ts")
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

///|
test "snapshot: basic package with namespace" (t : @test.Test) {
  let content =
    #|package "moonbitlang/parser/basic"
    #|
    #|pub(all) enum LocStyle {
    #|  Hidden
    #|  Json
    #|  String
    #|}
    #|
    #|pub(all) struct Location {
    #|  start : Position
    #|  end : Position
    #|}
    #|fn Location::merge(Self, Self) -> Self
    #|
    #|pub(all) struct Position {
    #|  fname : String
    #|  lnum : Int
    #|  bol : Int
    #|  cnum : Int
    #|}
    #|fn Position::column(Self) -> Int
    #|
  let mbti = parse_mbti(content, "basic.mbti")
  let dts = generate_dts_namespace(mbti)
  t.write(dts)
  t.snapshot(filename="basic_namespace.d.ts")
}

///|
test "package_to_namespace" {
  inspect(package_to_namespace("moonbitlang/parser/basic"), content="basic")
  inspect(package_to_namespace("moonbitlang/parser/syntax"), content="syntax")
  inspect(package_to_namespace("test"), content="test")
}

///|
test "package_to_namespace: empty string" {
  inspect(package_to_namespace(""), content="")
}

///|
test "generate_dts_with_preamble: with preamble" {
  let content =
    #|package "test"
    #|
    #|pub struct User {
    #|  name : String
    #|}
    #|
  let mbti = parse_mbti(content, "test.mbti")
  let dts = generate_dts_with_preamble(mbti, include_preamble=true)
  // Check that preamble is included
  assert_true(dts.contains("Runtime types"))
  assert_true(dts.contains("Ref<T>"))
  assert_true(dts.contains("interface User"))
}

///|
test "preprocess_mbti: pub fn to fn" {
  let content =
    #|package "test"
    #|pub fn hello() -> String
    #|
  let result = preprocess_mbti(content)
  assert_true(result.contains("fn hello"))
  assert_false(result.contains("pub fn hello"))
}

// ============================================================
// 曖昧性のあるケース - Phase 3 前に意思決定が必要
// ============================================================

///|
// Q: メソッド (Type::method) をどう出力するか？
// 現状: コメントとして出力 "// Method: Type::method"
// 選択肢:
//   A) interface のメソッドとして出力
//   B) スタンドアロン関数として出力 (Type$method)
//   C) コメントのまま (現状)
test "snapshot: ambiguous - methods" (t : @test.Test) {
  let content =
    #|package "test/methods"
    #|
    #|pub(all) struct Position {
    #|  line : Int
    #|  column : Int
    #|}
    #|fn Position::new(Int, Int) -> Self
    #|fn Position::offset(Self) -> Int
    #|fn Position::compare(Self, Self) -> Int
    #|
  let mbti = parse_mbti(content, "methods.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="ambiguous_methods.d.ts")
}

///|
// Q: suberror をどう出力するか？
// 選択肢:
//   A) Error クラスを継承した型として出力
//   B) Discriminated Union として出力
//   C) スキップ (現状)
test "snapshot: ambiguous - suberror" (t : @test.Test) {
  let content =
    #|package "test/error"
    #|
    #|pub suberror ParseError {
    #|  UnexpectedToken(String)
    #|  UnexpectedEndOfInput
    #|  InvalidSyntax(line~ : Int, message~ : String)
    #|}
    #|
  let mbti = parse_mbti(content, "error.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="ambiguous_suberror.d.ts")
}

///|
// Q: トップレベル関数 (pub fn) をどう出力するか？
// 現状: export function として出力
// 確認: snake_case → camelCase 変換は適切か？
test "snapshot: ambiguous - top level functions" (t : @test.Test) {
  let content =
    #|package "test/functions"
    #|
    #|fn create_instance() -> Instance
    #|fn parse_with_options(String, Options) -> Result
    #|fn[T] identity(T) -> T
    #|fn[A, B] map_result(Result[A, Error], (A) -> B) -> Result[B, Error]
    #|
    #|pub type Instance
    #|pub type Options
    #|pub type Result[T, E]
    #|pub type Error
    #|
  let mbti = parse_mbti(content, "functions.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="ambiguous_functions.d.ts")
}

///|
// Q: trait をどう出力するか？
// 現状: interface として出力
// 課題: Self 型パラメータの扱い
test "snapshot: ambiguous - traits" (t : @test.Test) {
  let content =
    #|package "test/traits"
    #|
    #|pub trait Show {
    #|  to_string(Self) -> String
    #|}
    #|
    #|pub trait Compare {
    #|  compare(Self, Self) -> Int
    #|}
    #|
    #|pub trait Default {
    #|  default() -> Self
    #|}
    #|
  let mbti = parse_mbti(content, "traits.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="ambiguous_traits.d.ts")
}

///|
// Q: 特殊な型 (Ref, FixedArray, etc.) をどう扱うか？
// 現状: そのまま出力
// 選択肢:
//   A) TypeScript の Ref<T> として出力 (定義が必要)
//   B) { value: T } として展開
//   C) そのまま (現状)
test "snapshot: ambiguous - special types" (t : @test.Test) {
  let content =
    #|package "test/special"
    #|
    #|pub(all) struct Config {
    #|  mut counter : Ref[Int]
    #|  buffer : FixedArray[Byte]
    #|  items : @list.List[String]
    #|  table : @hashmap.HashMap[String, Int]
    #|}
    #|
  let mbti = parse_mbti(content, "special.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="ambiguous_special_types.d.ts")
}

///|
// Q: typealias をどう出力するか？
// 注意: mbti_parser が typealias をサポートしていない可能性
// TODO: パーサーのバージョンアップ後に再確認
// test "snapshot: ambiguous - typealias" (t : @test.Test) {
//   let content =
//     #|package "test/alias"
//     #|
//     #|pub typealias UserId = Int
//     #|pub typealias Handler[T] = (T) -> Unit
//     #|pub typealias Callback = (String, Int) -> Bool
//     #|
//   let mbti = parse_mbti(content, "alias.mbti")
//   let dts = generate_dts(mbti)
//   t.write(dts)
//   t.snapshot(filename="ambiguous_typealias.d.ts")
// }

///|
// Q: async 関数 / Promise をどう扱うか？
// 現状: 戻り値が Promise[T] の場合は Promise<T>
// 確認: async の情報は .mbti に含まれるか？
test "snapshot: ambiguous - async functions" (t : @test.Test) {
  let content =
    #|package "test/async"
    #|
    #|fn fetch_data(String) -> Promise[String]
    #|fn fetch_json(String) -> Promise[Json]
    #|fn delay(Int) -> Promise[Unit]
    #|
    #|pub type Promise[T]
    #|pub type Json
    #|
  let mbti = parse_mbti(content, "async.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="ambiguous_async.d.ts")
}

///|
// Q: 外部パッケージ参照をどう解決するか？
// 現状: @pkg.Type → pkg.Type
// 課題: pkg が定義されていない場合の扱い
test "snapshot: ambiguous - external references" (t : @test.Test) {
  let content =
    #|package "test/external"
    #|
    #|import(
    #|  "some/external/pkg"
    #|)
    #|
    #|pub(all) struct Wrapper {
    #|  loc : @pkg.Location
    #|  tokens : @pkg.TokenList
    #|  ast : @another.Node
    #|}
    #|
    #|fn process(@pkg.Input) -> @pkg.Output
    #|
  let mbti = parse_mbti(content, "external.mbti")
  let dts = generate_dts(mbti)
  t.write(dts)
  t.snapshot(filename="ambiguous_external.d.ts")
}

///|
test "snapshot: combined packages" (t : @test.Test) {
  let basic_content =
    #|package "moonbitlang/parser/basic"
    #|
    #|pub(all) struct Position {
    #|  fname : String
    #|  lnum : Int
    #|  bol : Int
    #|  cnum : Int
    #|}
    #|
    #|pub(all) struct Location {
    #|  start : Position
    #|  end : Position
    #|}
    #|
  let tokens_content =
    #|package "moonbitlang/parser/tokens"
    #|
    #|import(
    #|  "moonbitlang/parser/basic"
    #|)
    #|
    #|pub(all) struct Comment {
    #|  content : String
    #|  kind : CommentKind
    #|  mut consumed_by_docstring : Bool
    #|}
    #|
    #|pub(all) enum CommentKind {
    #|  InlineTrailing
    #|  Ownline(leading_blank_line~ : Bool, trailing_blank_line~ : Bool)
    #|}
    #|
    #|pub(all) enum Token {
    #|  CHAR(String)
    #|  INT(String)
    #|  STRING(String)
    #|  LIDENT(String)
    #|  UIDENT(String)
    #|  COMMENT(Comment)
    #|  NEWLINE
    #|  EOF
    #|}
    #|
  let basic = parse_mbti(basic_content, "basic.mbti")
  let tokens = parse_mbti(tokens_content, "tokens.mbti")
  let dts = generate_combined_dts([basic, tokens])
  t.write(dts)
  t.snapshot(filename="combined_packages.d.ts")
}

// ============================================================
// .mbt → .d.ts 変換テスト (Phase 5)
// ============================================================

///|
test "snapshot: mbt to dts - pub struct" (t : @test.Test) {
  let content =
    #|pub struct User {
    #|  name : String
    #|  age : Int
    #|  mut email : String
    #|}
    #|
  let dts = generate_dts_from_mbt(content, "user.mbt")
  t.write(dts)
  t.snapshot(filename="mbt_struct.d.ts")
}

///|
test "snapshot: mbt to dts - pub enum" (t : @test.Test) {
  let content =
    #|pub enum Status {
    #|  Pending
    #|  Active
    #|  Done
    #|}
    #|
  let dts = generate_dts_from_mbt(content, "status.mbt")
  t.write(dts)
  t.snapshot(filename="mbt_enum.d.ts")
}

///|
test "snapshot: mbt to dts - pub fn" (t : @test.Test) {
  let content =
    #|pub fn greet(name : String) -> String {
    #|  "Hello, " + name
    #|}
    #|
    #|pub fn add(a : Int, b : Int) -> Int {
    #|  a + b
    #|}
    #|
  let dts = generate_dts_from_mbt(content, "functions.mbt")
  t.write(dts)
  t.snapshot(filename="mbt_functions.d.ts")
}

///|
test "snapshot: mbt to dts - mixed public items" (t : @test.Test) {
  let content =
    #|pub struct Config {
    #|  debug : Bool
    #|  timeout : Int
    #|}
    #|
    #|// Private struct - should not appear in output
    #|struct Internal {
    #|  data : String
    #|}
    #|
    #|pub fn create_config(debug : Bool, timeout : Int) -> Config {
    #|  { debug, timeout }
    #|}
    #|
    #|// Private function - should not appear in output
    #|fn internal_helper() -> Unit {
    #|  ()
    #|}
    #|
    #|pub enum LogLevel {
    #|  Debug
    #|  Info
    #|  Warn
    #|  Error
    #|}
    #|
  let dts = generate_dts_from_mbt(content, "mixed.mbt")
  t.write(dts)
  t.snapshot(filename="mbt_mixed.d.ts")
}

///|
test "snapshot: mbt to dts - generic types" (t : @test.Test) {
  let content =
    #|pub struct Container[T] {
    #|  value : T
    #|}
    #|
    #|pub fn[T] identity(x : T) -> T {
    #|  x
    #|}
    #|
    #|pub fn[A, B] map(container : Container[A], f : (A) -> B) -> Container[B] {
    #|  { value: f(container.value) }
    #|}
    #|
  let dts = generate_dts_from_mbt(content, "generics.mbt")
  t.write(dts)
  t.snapshot(filename="mbt_generics.d.ts")
}

///|
test "snapshot: mbt to dts - method syntax" (t : @test.Test) {
  let content =
    #|pub struct Counter {
    #|  value : Int
    #|}
    #|
    #|pub fn Counter::new() -> Counter {
    #|  { value: 0 }
    #|}
    #|
    #|pub fn Counter::increment(self : Counter) -> Counter {
    #|  { value: self.value + 1 }
    #|}
    #|
    #|pub fn Counter::get(self : Counter) -> Int {
    #|  self.value
    #|}
    #|
  let dts = generate_dts_from_mbt(content, "counter.mbt")
  t.write(dts)
  t.snapshot(filename="mbt_methods.d.ts")
}
