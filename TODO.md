# mbts ロードマップ

## 最終目標

グルーコードなしで `.mbt` から `.d.ts` を直接生成する

## 具体的なゴール

`mizchi/markdown` のグルーコード (`js/api.js`, `js/api.d.ts`) を自動生成できるようにする。
現在は手動で生成しているが、これを `.mbti` から自動生成する。

## 背景

TypeScript Language API のバインディングを MoonBit で手動生成するのは API の量が多すぎて現実的ではない。
そのため、`.d.ts` から `.mbt` バインディングを自動生成するアプローチを取る。

## フェーズ

### Phase 1: .mbti → .d.ts (完了)

- [x] `moonbitlang/parser` を使った `.mbti` パーサー
- [x] TypeScript 型定義 (`.d.ts`) の生成
- [x] `pub impl` / `pub using` の前処理
- [x] 基本的な型マッピング (String→string, Int→number, etc.)
- [x] Discriminated Union パターンでの enum 変換
- [x] テストスナップショット

### Phase 2: moonbitlang/parser の TS 型定義生成

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

## 意思決定ログ

スナップショット: `__snapshot__/ambiguous_*.d.ts`

### 1. メソッド (`Type::method`) ✅ 決定済み
**方針**: B) スタンドアロン関数 `Type$method()` として出力
```typescript
export function Position$new(arg0: number, arg1: number): Position;
export function Position$offset(arg0: Position): number;
```

### 2. suberror ✅ 決定済み
**方針**: B) Discriminated Union として出力 (enum と同様、`extends Error` 付き)
```typescript
export interface ParseError_UnexpectedToken extends Error { readonly $tag: "UnexpectedToken"; readonly $0: string; }
export type ParseError = ParseError_UnexpectedToken | ...;
```

### 3. trait ✅ 決定済み
**方針**: 第一引数に Self を受ける関数シグネチャとして出力
```typescript
// trait Show
export function Show$toString<Self>(arg0: Self): string;
```

### 4. 特殊型 (Ref, FixedArray, etc.) ✅ 決定済み
**方針**:
- `FixedArray<T>` → `Array<T>` にマッピング
- `Byte` → `number` にマッピング
- `Ref<T>` → プリアンブルで定義 (`generate_dts_with_preamble` で利用可能)

### 5. Promise の扱い ✅ 決定済み
**方針**: B) TypeScript の組み込み Promise を使う (定義を出力しない)
```typescript
// Using TypeScript built-in: Promise
```

### 6. 外部パッケージ参照
**現状**: `@pkg.Type` → `pkg.Type`
**課題**: namespace が定義されていない場合にエラー
**選択肢**:
- A) 全パッケージを統合して出力 (Phase 2 の方針)
- B) import 文を生成
- C) 現状維持 (利用者が解決)

### Phase 3: MoonBit Parser の JS ビルド + TS ラッパー (完了)

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

### Phase 4: .d.ts → .mbt バインディング生成 (完了)

- [x] TypeScript Compiler API で `.d.ts` をパース
  - `js/dts-to-mbt.ts` で実装
  - `parseDts()` 関数で .d.ts を解析
- [x] TypeScript AST → MoonBit FFI バインディング変換
  - interface → struct (フィールド付き)
  - function → extern fn (引数・戻り値の型変換)
  - string literal union → enum
  - 型パラメータ対応
- [x] `@ffi` 属性の自動付与
  - `@ffi.ffi("originalName")` 形式で出力
  - snake_case への変換も自動
- [x] 型マッピング
  - string → String, number → Int, boolean → Bool
  - Uint8Array → Bytes, bigint → BigInt
  - Array<T> → Array[T], Promise<T> → Promise[T]
  - optional (?) → T?
- [ ] `.mbti` も同時生成 (未実装)

### Phase 5: セルフホスティング

- [ ] Phase 4 の実装を MoonBit で書き直し
- [ ] `.mbt` から直接 `.d.ts` を生成 (現在の逆方向)
- [ ] グルーコード不要の完全な相互変換

## 検証ポイント

### 完了

- [x] 生成した型定義で TypeScript の型チェックが通ること
  - vitest で 35 テストケースが通過

### 未検証

- [x] 生成した `.mbt` バインディングで MoonBit のコンパイルが通ること
  - `extern "js" fn name(...) = "jsName"` 構文で生成
  - JS ターゲット (`moon check --target js`) でコンパイル成功
  - パラメータ名付きの正しい形式で出力

- [ ] ランタイムで実際に動作すること
  - JS → MoonBit の FFI 呼び出しが機能するか
  - 型のマーシャリングが正しく行われるか (特に Optional, Array, Promise)

- [ ] 双方向変換の一貫性
  - `.mbti → .d.ts → .mbt` の変換が往復して意味的に等価になるか

- [x] 具体的なゴールの検証
  - mizchi/markdown の `.mbti` → `.d.ts` 生成が実用的か
    - 低レベル FFI API は生成可能 (`mdToHtml`, `mdParseToAst` など)
    - 外部パッケージ参照 (`markdown.Document`) は未解決
  - 現在手動で書いている `js/api.d.ts` を自動生成できるか
    - **部分的に可能**: 低レベル API は自動生成可能
    - **完全置換は不可**: 高レベルラッパー (DocumentHandle, parse など) は手動実装が必要

## 疑問点・課題

### 型マッピングの妥当性

| TypeScript | 現在の変換 | 疑問点 |
|------------|-----------|--------|
| `number` | `Int` | `Float`/`Double` にすべきケースの判別ができない |
| `T \| undefined` | `T?` | MoonBit の `Option[T]` との整合性 |
| `Promise<T>` | `Promise[T]` | MoonBit の async/await との統合方法 |
| `Map<K,V>` | `Map[K,V]` | MoonBit の `Map` との互換性 |
| `class` | 未実装 | メソッドをどう表現するか |

### 未実装・部分実装の機能

| 機能 | 状態 | 詳細 |
|------|------|------|
| class 変換 | ✅完了 | `extern type` + メソッド関数 (`ClassName_method`) |
| namespace/module | 部分的 | ネストした namespace の扱い |
| overload | 未実装 | 同名関数の複数シグネチャ |
| generics 制約 | 未実装 | `T extends X` の変換 |
| `.mbti` 同時生成 | 未実装 | Phase 4 の残タスク |

### 優先度

1. **高**: 生成した `.mbt` が実際にコンパイル通るか (簡単なサンプルで試す)
2. **高**: mizchi/markdown の `.mbti` → `.d.ts` 生成が実用的か
3. **中**: class 変換の実装
4. **低**: セルフホスティング (Phase 5)

## 依存関係

```
Phase 1 (完了)
    ↓
Phase 2 ← moonbitlang/parser の全 .mbti
    ↓
Phase 3 ← JS ビルド環境
    ↓
Phase 4 ← TypeScript Compiler API
    ↓
Phase 5 (セルフホスティング)
```
