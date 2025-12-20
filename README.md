# mbts

MoonBit と TypeScript 間の型定義を相互変換するツールです。

## 機能

- `.mbti` → `.d.ts` 生成
- `.d.ts` → `.mbt` / `.mbti` 生成
- `moon.pkg.json` の exports 自動更新

## インストール

```bash
# MoonBit パッケージとして
moon add mizchi/tsnize

# CLI ツールとして
pnpm add mbts
```

## CLI

### コマンド一覧

```
mbts link <path>                .mbti → moon.pkg.json exports 更新
mbts dts <src> [--out <dir>]    .mbti → .d.ts 生成
mbts mbt <file.d.ts> [options]  .d.ts → .mbt 生成
```

### mbts mbt - TypeScript から MoonBit バインディング生成

```bash
# 基本的な変換
mbts mbt lib.d.ts

# 出力先とパッケージ名を指定
mbts mbt lib.d.ts --out src --package myapp

# .mbti も同時生成
mbts mbt lib.d.ts --mbti
```

**オプション:**
- `--out <dir>` - 出力ディレクトリ
- `--package <name>` - パッケージ名
- `--mbti` - .mbti インターフェースファイルも生成

### mbts dts - MoonBit から TypeScript 型定義生成

```bash
# .mbti から .d.ts を生成
mbts dts src --out js

# namespace でラップ
mbts dts src --namespace

# ランタイム型プリアンブルを含める
mbts dts src --preamble
```

**オプション:**
- `--out <dir>` - 出力ディレクトリ
- `--namespace` - namespace でラップ
- `--preamble` - ランタイム型を含める
- `--naming <type>` - preserve (default) または camelCase

### mbts link - exports 自動更新

```bash
# moon info 実行後に exports を更新
moon info
mbts link src/moon.pkg.json

# 複数ターゲット
mbts link src --targets js,wasm-gc

# メソッドを除外
mbts link src --no-methods

# ドライラン
mbts link src --dry-run
```

## プログラム API

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

// 方法1: 個別に生成
const binding = parseDts(dtsContent, "lib.d.ts", { packageName: "myapp" });
const mbt = generateMbt(binding);
const mbti = generateMbti(binding);

// 方法2: 一括生成
const result = dtsToMbtWithMbti(dtsContent, "lib.d.ts", { packageName: "myapp" });
console.log(result.mbt);   // .mbt コード
console.log(result.mbti);  // .mbti インターフェース
```

## 型変換ルール

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

### 関数

```mbti
// MoonBit
fn get_user_name(user_id : Int) -> String
```

```typescript
// TypeScript
export function getUserName(userId: number): string;
```

### 構造体

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

### クラス

```typescript
// TypeScript
export class Counter {
  constructor(initial: number);
  increment(): void;
  getValue(): number;
}
```

```moonbit
// 生成される MoonBit
#external
type Counter

extern "js" fn Counter::new(initial : Int) -> Counter =
  #| (initial) => new Counter(initial)

extern "js" fn Counter::increment(self : Counter) -> Unit =
  #| (self) => self.increment()

extern "js" fn Counter::get_value(self : Counter) -> Int =
  #| (self) => self.getValue()
```

### 列挙型

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

## 変換フロー

```
TypeScript (.d.ts)          MoonBit (.mbti)
        │                         │
        │ mbts mbt                │ mbts dts
        ▼                         ▼
    MoonBit (.mbt)  ◄──────►  TypeScript (.d.ts)
        │
        │ --mbti オプション
        ▼
    MoonBit (.mbti)
```

## 開発

```bash
# 依存関係のインストール
moon update
pnpm install

# MoonBit ビルド
moon build --target js

# テスト実行
moon test
pnpm test

# スナップショットの更新
moon test --update
```

## ライセンス

MIT
