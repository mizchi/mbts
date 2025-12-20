# mbts ロードマップ

## 最終目標

グルーコードなしで `.mbt` から `.d.ts` を直接生成する

## 現在の状態

- Phase 1: .mbti → .d.ts 生成 ✅
- Phase 2: moonbitlang/parser の型定義生成 ✅
- Phase 3: MoonBit Parser の JS ビルド ✅
- Phase 4: .d.ts → .mbt バインディング生成 ✅ (`.mbti` 同時生成は未実装)
- CLI ツール (`mbts link`, `mbts dts`) ✅

mizchi/markdown での検証完了。低レベル API は自動生成可能、高レベル API は手書きグルーコードと組み合わせて使用。

詳細は [docs/done.md](docs/done.md) を参照。

## 残りのタスク

### Phase 4 残タスク

- [ ] `.mbti` 同時生成 (.d.ts → .mbt 変換時に .mbti も出力)

### 未実装機能
- [x] 外部パッケージ参照 → `any /* TODO: @pkg.Type */` で仮対応
- [ ] overload (同名関数の複数シグネチャ)
- [ ] generics 制約 (`T extends X` の変換)

### Phase 5: セルフホスティング

- [ ] Phase 4 の実装を MoonBit で書き直し
- [ ] `.mbt` から直接 `.d.ts` を生成 (現在の逆方向)
- [ ] グルーコード不要の完全な相互変換

## 外部パッケージ参照の課題

**現状**: `@pkg.Type` → `any /* TODO: @pkg.Type */` (仮対応)

Node.js のリゾルバを実装して外部パッケージを解決するのは複雑なため、仮対応として `any` 型で出力し TODO コメントを残す方針。

```typescript
// 入力: @cmark_base.Meta
// 出力: any /* TODO: @cmark_base.Meta */
```

**将来的な選択肢**:
- A) 全パッケージを統合して出力 (Phase 2 で部分的に対応済み)
- B) import 文を生成 (Node.js リゾルバが必要)
- C) 現状維持 (利用者が手動で型を修正)

## 型マッピングの課題

| TypeScript | 現在の変換 | 課題 |
|------------|-----------|------|
| `number` | `Int` | `Float`/`Double` にすべきケースの判別ができない |
| `T \| undefined` | `T?` | MoonBit の `Option[T]` との整合性 |
| `Map<K,V>` | `Map[K,V]` | MoonBit の `Map` との互換性 |

## 優先度

1. **中**: namespace/module のネスト対応
2. **中**: `.mbti` 同時生成
3. **低**: セルフホスティング (Phase 5)

## 依存関係

```
Phase 1 (完了)
    ↓
Phase 2 (完了)
    ↓
Phase 3 (完了)
    ↓
Phase 4 (完了)
    ↓
Phase 5 (セルフホスティング) ← 未着手
```
