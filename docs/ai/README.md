# AI機能 / AI Capabilities

このディレクトリには、World Address YAMLシステムのAI機能に関するドキュメントが含まれています。

This directory contains documentation about AI capabilities in the World Address YAML system.

## 📁 ドキュメント / Documents

| ファイル | 説明 |
|---------|------|
| [ai-capabilities.md](./ai-capabilities.md) | **AI機能強化戦略** - 検索精度・安全性・相互運用性を向上させる5つのAI機能 |
| [search-engine-algorithms.md](./search-engine-algorithms.md) | **検索エンジンアルゴリズム** - 住所クラウド検索エンジンの能力を向上させるアルゴリズムと技術スタック |
| [waybill-ai-capabilities.md](./waybill-ai-capabilities.md) | **送り状AI・アルゴリズム** - 送り状の生成・検索・管理における10のAI機能 |
| [zkp-quality-ai.md](./zkp-quality-ai.md) | **ZKPクオリティ向上AI** - ゼロ知識証明の安全性・正しさ・性能・UXを向上させる10のAI機能 |

### 画像認識モジュール / Image Recognition Modules

| モジュール | 説明 |
|---------|------|
| [Image Recognition Modules](../../ai-modules/README.md) | **AI画像認識モジュール** - OCR、寸法推定、破損検出、書類スキャン |
| [Package OCR](../../ai-modules/package-ocr/docs/README.md) | **荷物ラベル自動読み取り** - 多言語OCR + AMF正規化 + PID生成 |
| [Dimension Estimation](../../ai-modules/dimension-estimation/docs/README.md) | **荷物寸法・重量推定** - VeyLockerマッピング + 料金自動算出 |
| [Damage Detection](../../ai-modules/damage-detection/docs/README.md) | **破損・異常検出** - 証拠記録 + 保険自動化 |
| [Document OCR](../../ai-modules/document-ocr/docs/README.md) | **書類住所OCR** - 名刺・公共料金・手書き認識 + Veyform統合 |
| [Integration Guide](../ai-image-recognition-integration.md) | **統合ガイド** - VeyExpress/Veyform統合の完全な例 |

## 🤖 概要 / Overview

### AI機能強化戦略

システム全体の以下5つのAI機能について解説しています：

1. **住所理解・構造化AI** - 住所をPID構造に正規化し一致検索
2. **住所検索UI最適化AI** - 利用タイプに合わせた最優先候補の抽出
3. **決済接続AI** - 住所ごとに適合する決済候補を優先判断
4. **提携インデックス管理AI** - 提携状態のインデックス最適化
5. **攻撃・異常検知AI** - セキュリティ監視と信頼性の確保

### 送り状AI・アルゴリズム

送り状の生成・検索・管理における以下10のAI・アルゴリズム機能について解説しています：

1. **Waybill Parse AI** - 送り状構造の解析・仕様理解
2. **Carrier Adapt AI** - 配送業者ごとの仕様・必須フィールド適合
3. **PID Embed AI** - 住所PIDの埋め込みとユニークID生成
4. **Field Align AI** - 国ごとの住所階層・並び順の整合性マッピング
5. **Error Prevent AI** - 生成時・提出時のエラー自動検出・補正
6. **FedEx-like Ranking Search** - 送り状生成・過去伝票の優先検索
7. **Fraud Block LSH** - 不正住所入力・スパム検出
8. **Waybill Nonce AI** - ワンタイムNonce IDによる改ざん防止
9. **Merklized Routing Hash** - 宛先一致の高速検証
10. **Wallet Waybill Restore AI** - ウォレットアプリからの送り状復元

### 検索エンジンアルゴリズム

住所クラウド検索エンジンの能力を向上させる以下4つの主軸アルゴリズム分野について詳細に解説しています：

1. **住所意味理解による検索精度向上**
   - PCFG (Probabilistic Context-Free Grammar) - 住所表記の文法揺れに対応
   - AST (Abstract Syntax Tree) - 住所の構造をツリーで検索
   - DAG (Directed Acyclic Graph) - 住所階層と地域関係の最適検索構造
   - Merkle Tree - 住所一致と包含の高速照合

2. **類似住所・揺れ吸収による検索能力向上**
   - Cosine Similarity - 類似住所候補の高速検索
   - Locality-Sensitive Hashing (LSH) - 揺れ表記も近傍検索可能に
   - N-gram - 部分一致検索の強化

3. **履歴学習・優先抽出による検索UX高速化**
   - Reinforcement Learning - 住所候補の優先判断
   - Ranking Algorithm - 利用頻度・相性・サービス適合スコアで順位付け

4. **不正・ノイズ除外による検索信頼性向上**
   - Anomaly Detection - 異常検知
   - Rate Limiting - 不正検索を制御

### ZKPクオリティ向上AI

ゼロ知識証明のクオリティを向上させる以下10のAI機能について解説しています：

1. **証明仕様チェッカーAI** - 仕様と実装の一致検証
2. **ZK回路最適化AI** - 制約数削減と性能向上
3. **証明テストケース生成AI** - 境界・異常・攻撃ケースの自動生成
4. **パラメータ選定AI** - ユースケース別の最適パラメータ提案
5. **サイドチャネル・メタデータ解析AI** - 情報漏洩の検出・防止
6. **非ZKロジックとの整合性チェッカーAI** - 通常APIとの挙動一致確認
7. **プロトコル設計アドバイザーAI** - プライバシーと実用性のバランス最適化
8. **ZK UXガイドAI** - ユーザーフレンドリーなUI/UX設計
9. **証明システム選定AI** - SNARK/STARK/Bulletproofsなどの最適選定
10. **継続監査AI** - 運用中のZKPシステムの継続監視

## 🔗 関連ドキュメント / Related Documents

- [クラウド住所帳システム](../cloud-address-book.md) - システムの全体像
- [住所検索エンジン](../address-search-engine.md) - 検索UIの仕様
- [システムアーキテクチャ](../cloud-address-book-architecture.md) - 技術アーキテクチャ
