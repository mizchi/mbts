# mbts

MoonBit と TypeScript 間の型定義を相互変換するツールです。

## 目標

- `.mbti` から `.d.ts` を生成 (実装済み)
- `.d.ts` から `.mbt`, `.mbti` を生成 (TODO)

## インストール

```bash
moon add mizchi/tsnize
```

## 使い方

### .mbti → .d.ts

```moonbit
let content = "..."  // .mbti ファイルの内容
let mbti = @tsnize.parse_mbti(content, "example.mbti")!
let dts = @tsnize.generate_dts(mbti)
```

## 型変換ルール

### プリミティブ型

| MoonBit | TypeScript |
|---------|------------|
| `String` | `string` |
| `Int`, `UInt`, `Float`, `Double`, `Int64`, `UInt64` | `number` |
| `Bool` | `boolean` |
| `Unit` | `void` |
| `Bytes` | `Uint8Array` |
| `BigInt` | `bigint` |
| `Array[T]` | `Array<T>` |
| `Map[K, V]` | `Map<K, V>` |
| `Json` | `any` |
| `Option[T]` | `T \| undefined` |
| `(A, B, C)` | `[A, B, C]` (タプル) |

### 関数

snake_case は camelCase に変換されます。

```mbti
fn get_user_name(user_id : Int) -> String
```

```typescript
export function getUserName(arg0: number): string;
```

ラベル付き引数とオプショナル引数もサポート:

```mbti
fn create_user(name~ : String, age? : Int) -> User
```

```typescript
export function createUser(name: string, age?: number): User;
```

### 構造体 (Struct)

```mbti
pub struct User {
  name : String
  age : Int
  mut email : String
}
```

```typescript
export interface User {
  readonly name: string;
  readonly age: number;
  email: string;  // mut なので readonly ではない
}
```

### 列挙型 (Enum)

Discriminated Union として生成されます。

```mbti
pub enum LoadState {
  Idle
  Loading
  Success(String)
  Error(String)
}
```

```typescript
export interface LoadState_Idle { readonly $tag: "Idle"; }
export interface LoadState_Loading { readonly $tag: "Loading"; }
export interface LoadState_Success { readonly $tag: "Success"; readonly $0: string; }
export interface LoadState_Error { readonly $tag: "Error"; readonly $0: string; }
export type LoadState = LoadState_Idle | LoadState_Loading | LoadState_Success | LoadState_Error;

// コンストラクタ
export const LoadState$Idle: LoadState_Idle = { $tag: "Idle" };
export const LoadState$Loading: LoadState_Loading = { $tag: "Loading" };
export function LoadState$Success($0: string): LoadState_Success { return { $tag: "Success", $0 }; }
export function LoadState$Error($0: string): LoadState_Error { return { $tag: "Error", $0 }; }
```

ラベル付きバリアント:

```mbti
pub enum Result {
  Ok(value~ : String)
  Err(message~ : String, code~ : Int)
}
```

```typescript
export interface Result_Ok { readonly $tag: "Ok"; readonly value: string; }
export interface Result_Err { readonly $tag: "Err"; readonly message: string; readonly code: number; }
export type Result = Result_Ok | Result_Err;
```

### 型エイリアス

```mbti
pub typealias UserId = Int
```

```typescript
export type UserId = number;
```

### トレイト

```mbti
pub trait Show {
  output(Self, Logger) -> Unit
}
```

```typescript
export interface Show<Self> {
  output(self: Self, arg1: Logger): void;
}
```

### 抽象型・外部型

ブランド型として生成されます。

```mbti
pub type Handle
```

```typescript
export interface Handle {
  readonly __brand: "Handle";
}
```

## 予約語のエスケープ

TypeScript/JavaScript の予約語は自動的にアンダースコア付きに変換されます。

```mbti
fn type(value : String) -> Int  // "type" は予約語
```

```typescript
export function type_(value: string): number;
```

## 開発

```bash
# 依存関係のインストール
moon update

# テスト実行
moon test

# スナップショットの更新
moon test --update
```

## ライセンス

MIT
