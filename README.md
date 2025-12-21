# mbts

Bidirectional type definition converter between MoonBit and TypeScript.

```bash
deno install -Afg @mizchi/mbts --name mbts
# TODO: npm
```

## Features

- Create new MoonBit projects with JS interop setup
- Full build pipeline (check, build, link, dts)
- `.mbti` → `.d.ts` generation
- `.d.ts` → `.mbt` / `.mbti` generation
- Auto-update `moon.pkg.json` exports

## Installation

```bash
# As a CLI tool
pnpm add mbts

# Or use directly
npx mbts --help
```

## Quick Start

```bash
# Create a new project
mbts new myapp --user myname
cd myapp
moon update

# Build and generate TypeScript definitions
mbts build .

# Use from JavaScript
node -e "const m = require('./target/js/release/build/myapp/myapp.js'); console.log(m.hello())"
```

## CLI Commands

### mbts new - Create a new project

```bash
mbts new <pkgname> --user <username>
```

Creates a new MoonBit project with:
- `moon.mod.json` - Module config with `mizchi/js` dependency and `preferred-target: js`
- `moon.pkg.json` - Package config with JS link settings
- `lib.mbt` - Sample source file

```bash
# Create project
mbts new myapp --user myname

# Without --user (uses "username" as default with warning)
mbts new myapp
```

### mbts build - Full build pipeline

```bash
mbts build <path>
```

Runs the complete build pipeline:
1. `moon check` - Type checking
2. `moon build --target js` - Build for JS target
3. `moon info` - Generate .mbti
4. `mbts link` - Update exports in moon.pkg.json
5. `mbts dts` - Generate .d.ts

```bash
# Build current directory
mbts build .

# Build specific directory
mbts build examples

# With options
mbts build . --out js --naming camelCase
```

### mbts link - Update exports

```bash
mbts link <path>
```

Updates `moon.pkg.json` with exports from `.mbti` file. Also generates `__jsglue.mbt` for generic function wrappers.

```bash
# Update exports after running 'moon info'
moon info
mbts link .

# Multiple targets
mbts link . --targets js,wasm-gc

# Exclude methods
mbts link . --no-methods

# Dry run
mbts link . --dry-run
```

### mbts dts - Generate TypeScript definitions

```bash
mbts dts <src> [--out <dir>]
```

Generates `.d.ts` from `.mbti` file.

```bash
# Generate .d.ts in same directory
mbts dts .

# Output to different directory
mbts dts src --out js

# Wrap in namespace
mbts dts src --namespace

# Include runtime type preamble
mbts dts src --preamble

# Convert function names to camelCase
mbts dts src --naming camelCase
```

### mbts mbt - Generate MoonBit from TypeScript

```bash
mbts mbt <file.d.ts> [options]
```

Generates MoonBit FFI bindings from TypeScript definitions.

```bash
# Basic conversion
mbts mbt lib.d.ts

# Specify output directory and package name
mbts mbt lib.d.ts --out src --package myapp

# Also generate .mbti interface file
mbts mbt lib.d.ts --mbti
```

## Type Mapping

### MoonBit → TypeScript

| MoonBit | TypeScript |
|---------|------------|
| `String` | `string` |
| `Int`, `UInt`, `Float`, `Double` | `number` |
| `Bool` | `boolean` |
| `Unit` | `void` |
| `Bytes` | `Uint8Array` |
| `BigInt` | `bigint` |
| `Array[T]` | `Array<T>` |
| `Map[K, V]` | `Map<K, V>` |
| `Json` | `any` |
| `T?` / `Option[T]` | `T \| undefined` |
| `(A, B, C)` | `[A, B, C]` |

### TypeScript → MoonBit

| TypeScript | MoonBit |
|------------|---------|
| `string` | `String` |
| `number` | `Int` |
| `boolean` | `Bool` |
| `void` | `Unit` |
| `Uint8Array` | `Bytes` |
| `bigint` | `BigInt` |
| `T[]` / `Array<T>` | `Array[T]` |
| `Map<K, V>` | `@collection.JsMap[K, V]` |
| `Set<T>` | `@collection.JsSet[T]` |
| `Promise<T>` | `@js.Promise[T]` |
| `T \| undefined` | `T?` |
| `any` / `unknown` | `Json` |

### Structs

```moonbit
// MoonBit
pub struct User {
  name : String
  age : Int
  mut email : String
}
```

```typescript
// TypeScript
export interface User {
  readonly name: string;
  readonly age: number;
  email: string;
}
```

### Enums

```moonbit
// MoonBit
pub enum Status {
  Pending
  Active
  Done
}
```

```typescript
// TypeScript (Discriminated Union)
export interface Status_Pending { readonly $tag: "Pending"; }
export interface Status_Active { readonly $tag: "Active"; }
export interface Status_Done { readonly $tag: "Done"; }
export type Status = Status_Pending | Status_Active | Status_Done;
```

### Generic Types

```moonbit
// MoonBit - Generic function (needs wrapper for JS export)
pub fn[T] identity(value : T) -> T {
  value
}

// FFI functions must use @js.Any (no type parameters allowed)
extern "js" fn Box::new(value : @js.Any) -> Box[@js.Any] =
  #| (v) => ({ value: v })
```

When you run `mbts link`, it automatically generates wrappers in `__jsglue.mbt`:

```moonbit
// Auto-generated
pub fn __jsglue_identity(arg0 : @js.Any) -> @js.Any {
  identity(arg0)
}
```

## Conversion Rules

### Function Names

| MoonBit | TypeScript (default) | TypeScript (--naming camelCase) |
|---------|---------------------|--------------------------------|
| `get_user_name` | `get_user_name` | `getUserName` |
| `Type::method` | `type$method` | `type$method` |

### Structs → Interfaces

```moonbit
pub struct User {
  id : Int           // immutable
  mut name : String  // mutable
}
```

```typescript
export interface User {
  readonly id: number;  // readonly (immutable)
  name: string;         // writable (mut)
}
```

### Enums → Discriminated Unions

```moonbit
pub enum Result[T, E] {
  Ok(T)
  Err(E)
}
```

```typescript
export interface Result_Ok<T> { readonly $tag: "Ok"; readonly $0: T; }
export interface Result_Err<E> { readonly $tag: "Err"; readonly $0: E; }
export type Result<T, E> = Result_Ok<T> | Result_Err<E>;
```

### Option Types

```moonbit
pub fn find(id : Int) -> User?
```

```typescript
export function find(id: number): User | undefined;
```

### Tuples

```moonbit
pub fn get_pair() -> (Int, String)
```

```typescript
export function get_pair(): [number, string];
```

### Methods

Methods are exported with `$` separator:

```moonbit
pub fn User::new(name : String) -> User
pub fn User::greet(self : User) -> String
```

```typescript
export function user$new(name: string): User;
export function user$greet(self: User): string;
```

## Programmatic API

### .mbti → .d.ts

```typescript
import { generateDts } from "mbts";

const mbtiContent = `
package "myapp"
pub struct User {
  name : String
  age : Int
}
pub fn get_user(id : Int) -> User
`;

const dts = generateDts(mbtiContent, "myapp.mbti");
```

### .d.ts → .mbt / .mbti

```typescript
import { parseDts, generateMbt, generateMbti } from "mbts";

const dtsContent = `
export interface User {
  name: string;
  age: number;
}
export function createUser(name: string): User;
`;

const binding = parseDts(dtsContent, "lib.d.ts", { packageName: "myapp" });
const mbt = generateMbt(binding);
const mbti = generateMbti(binding);
```

## Important Notes

1. **`extern "js" fn` cannot have type parameters** - Use `@js.Any` instead
2. **Generic functions need wrappers for JS export** - `mbts link` generates these automatically
3. **Always run `moon info` before `mbts link/dts`** - The `.mbti` file must be up to date
4. **Set `preferred-target: js`** in `moon.mod.json` for JS-only projects

## Development

```bash
# Install dependencies
moon update
pnpm install

# Build CLI
pnpm build:cli

# Run tests
moon test
pnpm test
```

## Internals

mbts uses an internal `.mbti` parser to analyze MoonBit's interface files. The parser extracts:

- Function signatures with type parameters
- Struct and enum definitions
- Method declarations

For generic functions that cannot be directly exported to JavaScript (due to MoonBit's FFI limitation), mbts automatically generates wrapper functions in `__jsglue.mbt`. These wrappers replace type parameters with `@js.Any`, enabling JavaScript interop while preserving the original generic implementation.

```
.mbti (parsed) → AST → analyze generics → generate __jsglue.mbt
```

## License

MIT
