# Mini-Programs / ミニプログラム

このディレクトリには、WeChat（微信）とAlipay（支付宝）ミニプログラムの実装が含まれています。

## 📁 ディレクトリ構成 / Directory Structure

```
mini-programs/
├── common/           # 共通コード・ユーティリティ / Common code and utilities
│   ├── src/         # 共通ソースコード / Common source code
│   └── docs/        # 共通ドキュメント / Common documentation
├── wechat/          # WeChat ミニプログラム / WeChat Mini-Program
│   ├── src/         # WeChat 固有実装 / WeChat-specific implementation
│   └── docs/        # WeChat ドキュメント / WeChat documentation
└── alipay/          # Alipay ミニプログラム / Alipay Mini-Program
    ├── src/         # Alipay 固有実装 / Alipay-specific implementation
    └── docs/        # Alipay ドキュメント / Alipay documentation
```

## 🎯 設計方針 / Design Philosophy

### 1. 共通コードベース / Common Code Base
- **効率的な開発**: 共通の機能は`common/`ディレクトリに集約し、重複を避ける
- **一貫性**: 両プラットフォームで同じビジネスロジックとデータモデルを使用
- **保守性**: 共通機能の修正は一箇所で完結

### 2. プラットフォーム固有の最適化 / Platform-Specific Optimizations
- **WeChat**: WeChat API、UI/UXガイドライン、決済機能に最適化
- **Alipay**: Alipay API、デザイン言語、金融機能に最適化

### 3. 品質基準 / Quality Standards
- ✅ **パフォーマンス**: 高速なロード時間と滑らかな操作感
- ✅ **セキュリティ**: ユーザーデータの暗号化と安全な通信
- ✅ **アクセシビリティ**: すべてのユーザーが利用可能なUI
- ✅ **国際化**: 多言語対応（日本語、中国語、英語）

## 🚀 主要機能 / Key Features

### 共通機能 / Common Features
- 📍 住所管理（Address Management）
  - クラウド住所帳
  - 住所検証・正規化
  - PID（Place ID）生成
- 🔐 セキュリティ（Security）
  - エンドツーエンド暗号化
  - ゼロ知識証明（ZKP）
  - 安全な住所共有
- 🚚 配送統合（Shipping Integration）
  - QR/NFCハンドシェイク
  - リアルタイム追跡
  - 複数配送業者対応

### WeChat 固有機能 / WeChat-Specific Features
- 💬 WeChat API統合
  - WeChat ログイン
  - WeChat Pay決済
  - WeChat 友達共有
- 🎨 WeChat Design System
  - WeUI コンポーネント
  - WeChat カラーパレット
  - WeChat ナビゲーション

### Alipay 固有機能 / Alipay-Specific Features
- 💳 Alipay API統合
  - Alipay ログイン
  - Alipay 決済
  - 芝麻信用スコア連携
- 🎨 Ant Design Mini
  - Ant Design コンポーネント
  - Alipay カラーシステム
  - Alipay ナビゲーション

## 📦 パッケージ構成 / Package Structure

| パッケージ | 説明 | インストール |
|---------|------|------------|
| `@vey/mini-common` | 共通ユーティリティ | `npm install @vey/mini-common` |
| `@vey/mini-wechat` | WeChat ミニプログラム | `npm install @vey/mini-wechat` |
| `@vey/mini-alipay` | Alipay ミニプログラム | `npm install @vey/mini-alipay` |

## 🛠️ 開発 / Development

### セットアップ / Setup

```bash
# 共通パッケージのインストール
cd mini-programs/common
npm install

# WeChat ミニプログラム
cd ../wechat
npm install

# Alipay ミニプログラム
cd ../alipay
npm install
```

### ビルド / Build

```bash
# すべてのミニプログラムをビルド
npm run build:all

# 個別にビルド
npm run build:wechat
npm run build:alipay
```

### テスト / Test

```bash
# すべてのテストを実行
npm test

# プラットフォーム別テスト
npm run test:wechat
npm run test:alipay
```

## 📚 ドキュメント / Documentation

- [共通コードガイド](./common/docs/README.md)
- [WeChat 開発ガイド](./wechat/docs/README.md)
- [Alipay 開発ガイド](./alipay/docs/README.md)

## 🔗 関連リンク / Related Links

### Taro.js SDK
既存の [Taro.js SDK](../sdk/taro/) は、WeChat と Alipay の両方をサポートするクロスプラットフォームソリューションです。このミニプログラムディレクトリは、より細かいプラットフォーム固有の最適化と機能を提供します。

### 公式ドキュメント
- [WeChat Mini-Program 開発ドキュメント](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Alipay Mini-Program 開発ドキュメント](https://opendocs.alipay.com/mini/developer)

## ⚖️ ライセンス / License

MIT License - 詳細は [LICENSE](../LICENSE) を参照してください。
