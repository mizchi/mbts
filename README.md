# mbts

Bidirectional type definition converter between MoonBit and TypeScript.

## Features

- `.mbti` → `.d.ts` generation
- `.d.ts` → `.mbt` / `.mbti` generation
- Auto-update `moon.pkg.json` exports

## Installation

```bash
# As a MoonBit package
moon add mizchi/mbts

# As a CLI tool
pnpm add mbts
```

## CLI

### Commands

```
mbts link <path>                Update moon.pkg.json exports from .mbti
mbts dts <src> [--out <dir>]    Generate .d.ts from .mbti
mbts mbt <file.d.ts> [options]  Generate .mbt from .d.ts
```

### mbts mbt - Generate MoonBit bindings from TypeScript

```bash
# Basic conversion
mbts mbt lib.d.ts

# Specify output directory and package name
mbts mbt lib.d.ts --out src --package myapp

# Also generate .mbti interface file
mbts mbt lib.d.ts --mbti
```

**Options:**
- `--out <dir>` - Output directory
- `--package <name>` - Package name
- `--mbti` - Also generate .mbti interface file

### mbts dts - Generate TypeScript definitions from MoonBit

```bash
# Generate .d.ts from .mbti
mbts dts src --out js

# Wrap in namespace
mbts dts src --namespace

# Include runtime type preamble
mbts dts src --preamble
```

**Options:**
- `--out <dir>` - Output directory
- `--namespace` - Wrap in namespace
- `--preamble` - Include runtime types
- `--naming <type>` - preserve (default) or camelCase

### mbts link - Auto-update exports

```bash
# Update exports after running 'moon info'
moon info
mbts link src/moon.pkg.json

# Multiple targets
mbts link src --targets js,wasm-gc

# Exclude methods
mbts link src --no-methods

# Dry run
mbts link src --dry-run
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
import { parseDts, generateMbt, generateMbti, dtsToMbtWithMbti } from "mbts";

const dtsContent = `
export interface User {
  name: string;
  age: number;
}
export function createUser(name: string): User;
`;

// Method 1: Generate separately
const binding = parseDts(dtsContent, "lib.d.ts", { packageName: "myapp" });
const mbt = generateMbt(binding);
const mbti = generateMbti(binding);

// Method 2: Generate together
const result = dtsToMbtWithMbti(dtsContent, "lib.d.ts", { packageName: "myapp" });
console.log(result.mbt);   // .mbt code
console.log(result.mbti);  // .mbti interface
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

### Functions

```mbti
// MoonBit
fn get_user_name(user_id : Int) -> String
```

```typescript
// TypeScript
export function getUserName(userId: number): string;
```

### Structs

```mbti
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

### Classes

```typescript
// TypeScript
export class Counter {
  constructor(initial: number);
  increment(): void;
  getValue(): number;
}
```

```moonbit
// Generated MoonBit
#external
type Counter

extern "js" fn Counter::new(initial : Int) -> Counter =
  #| (initial) => new Counter(initial)

extern "js" fn Counter::increment(self : Counter) -> Unit =
  #| (self) => self.increment()

extern "js" fn Counter::get_value(self : Counter) -> Int =
  #| (self) => self.getValue()
```

### Enums

```mbti
// MoonBit
pub enum LoadState {
  Idle
  Loading
  Success(String)
  Error(String)
}
```

```typescript
// TypeScript (Discriminated Union)
export interface LoadState_Idle { readonly $tag: "Idle"; }
export interface LoadState_Success { readonly $tag: "Success"; readonly $0: string; }
export type LoadState = LoadState_Idle | LoadState_Loading | LoadState_Success | LoadState_Error;
```

## Conversion Flow

```
TypeScript (.d.ts)          MoonBit (.mbti)
        │                         │
        │ mbts mbt                │ mbts dts
        ▼                         ▼
    MoonBit (.mbt)  ◄──────►  TypeScript (.d.ts)
        │
        │ --mbti option
        ▼
    MoonBit (.mbti)
```

## Development

```bash
# Install dependencies
moon update
pnpm install

# Build MoonBit
moon build --target js

# Build CLI
pnpm build

# Run tests
moon test
pnpm test

# Update snapshots
moon test --update
```

## License

MIT
