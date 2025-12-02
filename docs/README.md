# ドキュメント / Documentation

このディレクトリには、World Address YAMLプロジェクトのドキュメントが含まれています。

## 📁 構成

| ファイル/ディレクトリ | 説明 |
|---------------------|------|
| [cloud-address-book.md](./cloud-address-book.md) | クラウド住所帳システム - ZKPを中心としたプライバシー保護型住所管理システムの概要 |
| [address-search-engine.md](./address-search-engine.md) | **NEW!** 住所検索エンジン - 検索UIで入力工程を削除する新規格 |
| [address-search-engine-api.md](./address-search-engine-api.md) | **NEW!** 住所検索エンジンAPI - 検索エンジンのAPI仕様とリファレンス |
| [cloud-address-book-architecture.md](./cloud-address-book-architecture.md) | クラウド住所帳アーキテクチャ - システムアーキテクチャとデータフロー |
| [cloud-address-book-implementation.md](./cloud-address-book-implementation.md) | 実装ガイド - コード例と実装ベストプラクティス |
| [ec-integration-flow.md](./ec-integration-flow.md) | ECサイト統合フロー - チェックアウトフロー完全ガイド |
| [zkp-protocol.md](./zkp-protocol.md) | ZKPプロトコル - ゼロ知識証明プロトコルの詳細仕様 |
| [zkp-api.md](./zkp-api.md) | ZKP API - API仕様とリファレンス |
| [schema/](./schema/) | スキーマ型定義 - 各スキーマレベル（配送実務・研究・POS）の型定義 |
| [examples/](./examples/) | サンプルデータ - 各スキーマレベルの具体的な使用例 |

## 🔐 クラウド住所帳システム / Cloud Address Book System

ゼロ知識証明（ZKP）を活用した、プライバシー保護型のクラウド住所帳システムです。

### 主要ドキュメント

1. **[住所検索エンジン](./address-search-engine.md)** 🆕
   - コア概念: 入力工程の削除
   - システムアーキテクチャ（5層構造）
   - 検索エンジンの役割（Identity vs Index & Routing）
   - 検索体験フロー
   - Permissions Index構造
   - 解除・権限モデル
   - ルーティングレイヤー
   - プロダクト競争力
   - 実装ガイド

2. **[住所検索エンジンAPI](./address-search-engine-api.md)** 🆕
   - 認証
   - 検索API
   - 権限管理API
   - ルーティングAPI
   - 監査API
   - エラーハンドリング
   - Webhooks
   - SDK使用例

3. **[クラウド住所帳システム](./cloud-address-book.md)**
   - システムの登場人物（役割）
   - 住所ID（PID）の扱い方
   - 住所登録フロー
   - 友達管理フロー
   - 送り状発行フロー
   - QR/NFC活用ケース
   - 多言語・多国対応
   - 住所更新・失効
   - 実装技術スタック
   - ロードマップ（v1-v5）

4. **[システムアーキテクチャ](./cloud-address-book-architecture.md)**
   - システム全体構成
   - データフロー詳細
   - コンポーネント設計
   - セキュリティアーキテクチャ
   - データモデル
   - APIエンドポイント設計

5. **[実装ガイド](./cloud-address-book-implementation.md)**
   - 開発環境セットアップ
   - 基本的な使用例
   - 住所登録の実装
   - 友達管理の実装
   - 配送統合の実装
   - QR/NFC統合
   - セキュリティベストプラクティス

### 特徴

- 🔍 **入力工程の削除**: 検索UIで住所入力フォームを完全に置き換え
- 🔒 **プライバシー保護**: ECサイトは生住所を一切見ない
- ✅ **検証可能**: ZK証明で配送可能性を検証
- 📊 **監査可能**: すべてのアクセスを記録
- 🔑 **ユーザー主権**: ユーザーが自分の住所データと提出権を管理
- 🌍 **多国対応**: すべての国の住所形式に対応
- 📱 **モバイル対応**: Google Wallet/Apple Wallet統合
- 🔄 **提出権管理**: User-Controlled Revocationによる完全な権限制御

## 📚 スキーマレベル

このプロジェクトでは3つのスキーマレベルを提供しています：

### 🚚 配送実務レベル（届くレベル）

最小限の入力で確実に届くことを目指した、フォーム設計や配送ラベル生成向けのスキーマです。

### 📚 研究レベル（学術・比較用）

各国の住所制度を比較・分析・標準化する研究用途向けの詳細スキーマです。

### 🏪 POSレベル（販売時点情報管理用）

POSシステムでの決済・レシート発行・税務処理に必要な情報を提供する、小売・飲食店向けのスキーマです。

## 🔗 関連リンク

- [データディレクトリ](../data/) - 世界各国の住所データ（YAML/JSON）
- [SDK](../sdk/) - 開発者向けツール
- [メインREADME](../README.md) - プロジェクト概要
