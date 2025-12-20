# 完了したタスク

## Phase 1: .mbti → .d.ts

- [x] `moonbitlang/parser` を使った `.mbti` パーサー
- [x] TypeScript 型定義 (`.d.ts`) の生成
- [x] `pub impl` / `pub using` の前処理
- [x] 基本的な型マッピング (String→string, Int→number, etc.)
- [x] Discriminated Union パターンでの enum 変換
- [x] テストスナップショット

## Phase 2: moonbitlang/parser の TS 型定義生成

- [x] `moonbitlang/parser` の全パッケージの `.mbti` を収集
  - `basic`, `tokens`, `attribute`, `syntax`, `mbti_ast`, `lexer`, `mbti_parser`
- [x] 外部パッケージ参照 (`@syntax.Type` など) の解決
  - → `syntax.Type` のように namespace 付きで出力
- [x] namespace ラッパー付きの生成関数を実装
  - `generate_dts_namespace()`: 単一パッケージを namespace でラップ
  - `generate_combined_dts()`: 複数パッケージを統合
- [x] 前処理で未サポート構文を除去
  - `pub impl`, `pub using`, `pub let`, type alias (`pub type X = Y`)
  - `pub fn` → `fn` への変換
- [x] 実ファイルから `.d.ts` を生成するスクリプト
  - `scripts/generate-dts.mjs` で CLI ツールとして使用可能
  - `mizchi/markdown` の `.mbti` から `.d.ts` を生成できることを確認

## Phase 3: MoonBit Parser の JS ビルド + TS ラッパー

- [x] `moonbitlang/parser` を JS ターゲットでビルド
  - cli/ パッケージで moonbitlang/parser を使用
  - `parse_mbti_to_json()` 関数で JSON として AST をエクスポート
- [x] 生成した `.d.ts` でキャストした TypeScript ラッパー作成
  - `js/index.ts` に型定義 (Mbti, Sig, TypeSig, FuncSig, etc.)
  - `parseMbti()`, `parseMbtiOrThrow()` 関数
  - AST ユーティリティ: `getTypes()`, `getFunctions()`, `getTraits()`, `getTypeName()`
- [x] Node.js/Bun から使えるパッケージとして公開
  - ESM 形式でエクスポート
- [x] TypeScript から MoonBit の `.mbti` をパースできることを検証
  - 22 テストケースで検証済み

## Phase 4: .d.ts → .mbt バインディング生成

- [x] TypeScript Compiler API で `.d.ts` をパース
  - `js/dts-to-mbt.ts` で実装
  - `parseDts()` 関数で .d.ts を解析
- [x] TypeScript AST → MoonBit FFI バインディング変換
  - interface → struct (フィールド付き)
  - function → extern fn (引数・戻り値の型変換)
  - string literal union → enum
  - 型パラメータ対応
- [x] `extern "js"` 構文での出力
  - `extern "js" fn name(...) = "originalName"` 形式で出力
  - snake_case への変換も自動
- [x] 型マッピング
  - string → String, number → Int, boolean → Bool
  - Uint8Array → Bytes, bigint → BigInt
  - Array<T> → Array[T], Promise<T> → Promise[T]
  - optional (?) → T?

## CLI ツール

- [x] `mbts link <path>` コマンド
  - moon.pkg.json の `link.js.exports` を .mbti から自動更新
  - `--targets` オプションで複数ターゲット対応 (js, wasm, wasm-gc)
  - `--no-methods` オプションでメソッドを除外
  - `--dry-run` オプションで変更内容を確認
- [x] `mbts dts <src>` コマンド
  - .mbti から .d.ts を生成
  - `--out` オプションで出力先ディレクトリ指定
  - `--namespace` オプションで namespace ラッパー付きで出力
  - `--preamble` オプションでランタイム型のプリアンブル付加
  - `--naming` オプションで関数名の命名規則を指定 (preserve/camelCase)
- [x] ジェネリクス対応
  - 型パラメータ付き関数の正しい出力
  - `extractExportSymbols()` で型パラメータ情報を抽出

## 意思決定ログ

### 1. メソッド (`Type::method`)
**決定**: スタンドアロン関数 `Type$method()` として出力
```typescript
export function Position$new(arg0: number, arg1: number): Position;
export function Position$offset(arg0: Position): number;
```

### 2. suberror
**決定**: Discriminated Union として出力 (enum と同様、`extends Error` 付き)
```typescript
export interface ParseError_UnexpectedToken extends Error { readonly $tag: "UnexpectedToken"; readonly $0: string; }
export type ParseError = ParseError_UnexpectedToken | ...;
```

### 3. trait
**決定**: 第一引数に Self を受ける関数シグネチャとして出力
```typescript
// trait Show
export function Show$toString<Self>(arg0: Self): string;
```

### 4. 特殊型 (Ref, FixedArray, etc.)
**決定**:
- `FixedArray<T>` → `Array<T>` にマッピング
- `Byte` → `number` にマッピング
- `Ref<T>` → プリアンブルで定義 (`generate_dts_with_preamble` で利用可能)

### 5. Promise の扱い
**決定**: TypeScript の組み込み Promise を使う (定義を出力しない)

### 6. クラス変換 (.d.ts → .mbt)
**決定**: `mizchi/js/js` パッケージを使用
- コンストラクタ: `Type::new` として生成
- メソッド: `Type::method` として生成、self を第一引数に
- Promise: `@js.Promise[T]` を使用 (mizchi/js パッケージが必要)
- extern type: `#external type T` (新構文)

```moonbit
#external
type Counter

extern "js" fn Counter::new(initial : Int) -> Counter = "Counter"
extern "js" fn Counter::increment(self : Counter) -> Int = "Counter.prototype.increment"
```

### 7. 関数名の命名規則
**決定**: デフォルトは `preserve` (MoonBit の snake_case を維持)
- `--naming preserve`: `md_to_html` のまま出力
- `--naming camelCase`: `mdToHtml` に変換

### 8. 外部パッケージ参照
**決定**: `any /* TODO: @pkg.Type */` として出力 (仮対応)

Node.js リゾルバの実装が複雑なため、外部パッケージ参照は `any` 型で出力し、TODO コメントで元の型を残す。
```typescript
// 入力: @cmark_base.Meta
// 出力: any /* TODO: @cmark_base.Meta */
```

## 検証結果

### 生成コードのコンパイル
- [x] 生成した `.d.ts` で TypeScript の型チェックが通ること (35 テスト通過)
- [x] 生成した `.mbt` が MoonBit コンパイル通ること (`moon check --target js`)

### ランタイム動作確認
- [x] 関数呼び出し (`add`, `greet`)
- [x] 文字列マーシャリング
- [x] 配列マーシャリング (`Array[Int]`)
- [x] struct (JavaScript オブジェクトとして動作)
- [x] クラスのコンストラクタとメソッド
- [x] Promise (`@js.Promise[T]` with `mizchi/js`)

### 双方向変換の検証
- [x] `.mbti → .d.ts → .mbt` の変換をテスト済み
- **保持される要素**:
  - struct (フィールド名・型が保持)
  - 関数名 (snake_case ↔ camelCase 相互変換)
  - パラメータ型・戻り値型
- **変換で変わる要素**:
  - enum → Discriminated Union → struct (MoonBit enum に戻らない)
  - 関数パラメータ名 (arg0, arg1 などに変換される)

### mizchi/markdown 検証
- [x] 低レベル FFI API は生成可能 (`md_to_html`, `md_parse_to_ast` など)
- [x] 手書きグルーコードとの組み合わせで実用的に使える
- **推奨ワークフロー**:
  ```
  src/api/
    exports.mbt          # MoonBit FFI
    moon.pkg.json        # ← mbts link で自動更新

  js/
    api.generated.d.ts   # ← mbts dts で生成
    api.d.ts             # 手書き高レベル型
    api.js               # 手書きグルーコード
  ```
