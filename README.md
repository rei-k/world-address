# 🌍 World Address YAML / JSON

世界各国の住所形式をYAML形式とJSON形式で構造化したオープンデータベースです。

## 📋 概要

このプロジェクトは、世界中の国・地域の住所体系を標準化されたYAML形式およびJSON形式で記述し、以下の用途に活用できるデータを提供します：

- 🚚 **配送実務**: 国際配送のためのフォーム設計や住所ラベル生成
- 📚 **研究・分析**: 各国の住所制度の比較研究や標準化
- 🔐 **クラウド住所帳**: ゼロ知識証明を活用したプライバシー保護型住所管理システム

## 🆕 クラウド住所帳システム / Cloud Address Book System

**NEW!** ゼロ知識証明（ZKP）を中心とした、プライバシー保護型のクラウド住所帳システムを提供します。

### 特徴

- 🔒 **完全なプライバシー保護**: ECサイトや第三者は生住所を一切見ることができません
- ✅ **検証可能な配送**: ZK証明により、住所を公開せずに配送可能性を証明
- 📊 **完全な監査可能性**: すべてのアクセスを記録し、不正利用を防止
- 🔑 **ユーザー主権**: ユーザーが自分の住所データを完全に管理
- 🌍 **グローバル対応**: すべての国の住所形式に対応
- 📱 **モバイルウォレット統合**: Google Wallet/Apple Walletとシームレスに連携

### 主要機能

1. **住所登録・管理**
   - AMF（Address Mapping Framework）による住所正規化
   - PID（Place ID）自動生成
   - エンドツーエンド暗号化
   - Verifiable Credential（VC）発行

2. **友達管理**
   - 生住所を見ずに配送先を登録
   - QR/NFCによる簡単な友達追加
   - PIDベースの安全な住所共有

3. **配送統合**
   - ECサイトでのZK証明ベース配送先検証
   - 配送業者へのアクセス制御
   - ラストワンマイルでのみ住所開示
   - 完全な監査ログ

4. **QR/NFC対応**
   - 端末内での住所暗号化
   - Google Wallet/Apple Wallet連携
   - ホテル、金融機関での住所証明

### クイックスタート

```bash
# SDKのインストール
npm install @vey/core

# 基本的な使用例
import { createAddressClient, normalizeAddress, encodePID } from '@vey/core';

// 住所の正規化とPID生成
const normalized = await normalizeAddress(rawAddress, 'JP');
const pid = encodePID(normalized);
console.log(pid); // "JP-13-113-01-T07-B12-BN02-R342"
```

### ドキュメント

#### システム設計
- 📖 [クラウド住所帳システム概要](./docs/cloud-address-book.md) - システムの全体像と主要フロー
- 🔍 [住所検索エンジン](./docs/address-search-engine.md) - 検索UIで入力工程を削除する新規格
- 🏗️ [システムアーキテクチャ](./docs/cloud-address-book-architecture.md) - 技術アーキテクチャとデータフロー
- 🔧 [サーバーサイドアーキテクチャ](./docs/server-architecture.md) - コアAPI・SDK役割整理
- 🌐 [SDK言語・エコシステム分類](./docs/sdk-classification.md) - 各言語向けSDK仕様

#### 実装ガイド
- 💻 [実装ガイド](./docs/cloud-address-book-implementation.md) - コード例とベストプラクティス
- 🛒 [ECサイト統合フロー](./docs/ec-integration-flow.md) - チェックアウトフロー完全ガイド
- 🔐 [ZKPプロトコル](./docs/zkp-protocol.md) - ゼロ知識証明プロトコルの詳細
- 📚 [API仕様](./docs/zkp-api.md) - APIリファレンス
- 🔎 [住所検索エンジンAPI](./docs/address-search-engine-api.md) - 検索エンジンAPIリファレンス

### ロードマップ

- ✅ **v1 MVP**: AMF + PID + 暗号化保存のクラウド住所帳
- 🔄 **v2**: 国コード・地域レベルのZK証明
- 📋 **v3**: 配送業者統合と高度なアクセス制御
- 🎯 **v4**: DID/VC完全連携とマルチキャリア対応
- 🚀 **v5**: Google Wallet/Apple Wallet完全統合

## 📂 データ形式

全てのデータはYAMLとJSONの両形式で提供されています：

- **YAML**: 人間が読みやすく編集しやすい形式
- **JSON**: プログラムからの利用に最適化された形式

各国・地域のデータは同じディレクトリ内に `.yaml` と `.json` の両方のファイルとして配置されています。

## 🔄 自動データ更新 / Automatic Data Updates

このリポジトリは、Google の libaddressinput API から住所データを自動的に取得し、毎日更新します。

### libaddressinput データ

- **データソース**: https://chromium-i18n.appspot.com/ssl-address/data
- **更新頻度**: 毎日深夜0時（日本時間）
- **保存先**: `data/libaddressinput/`
- **形式**: YAML および JSON

libaddressinput は Google が提供する国際住所メタデータで、以下の情報を含みます：

- 住所フォーマット（各国の標準的な住所表記順序）
- 必須フィールド（住所として必要な項目）
- 郵便番号パターン（正規表現）
- 郵便番号の例
- 行政区画（都道府県・州など）
- 言語情報

### 手動実行

```bash
# スクリプトを直接実行
node scripts/fetch-libaddressinput.js

# または GitHub Actions から手動実行
# リポジトリの Actions タブ → "Auto-fetch libaddressinput data" → "Run workflow"
```

詳細は [scripts/README.md](./scripts/README.md) をご覧ください。

## 📁 ディレクトリ構造

```
world-address-yaml/
├── data/                     # 住所データ（YAML・JSON）
│   ├── africa/               # アフリカ
│   │   ├── central_africa/
│   │   ├── eastern_africa/
│   │   ├── northern_africa/
│   │   ├── southern_africa/
│   │   └── west_africa/
│   ├── americas/             # アメリカ大陸
│   │   ├── caribbean/
│   │   ├── central_america/
│   │   ├── north_america/
│   │   └── south_america/
│   ├── antarctica/           # 南極
│   │   ├── claims/           # 領有権主張地域
│   │   └── stations/         # 研究基地
│   ├── asia/                 # アジア
│   │   ├── central_asia/
│   │   ├── east_asia/
│   │   ├── south_asia/
│   │   ├── southeast_asia/
│   │   └── west_asia/
│   ├── europe/               # ヨーロッパ
│   │   ├── caucasus/
│   │   ├── eastern_europe/
│   │   ├── northern_europe/
│   │   ├── southeastern_europe/
│   │   ├── southern_europe/
│   │   └── western_europe/
│   ├── oceania/              # オセアニア
│   │   ├── australia_new_zealand/
│   │   ├── melanesia/
│   │   ├── micronesia/
│   │   └── polynesia/
│   └── libaddressinput/      # Google libaddressinput データ（自動更新）
│       ├── A/                # 国コード A で始まる国
│       ├── B/                # 国コード B で始まる国
│       └── ...
├── docs/                     # ドキュメント
│   ├── schema/               # スキーマ型定義
│   └── examples/             # サンプルデータ
├── scripts/                  # 自動化スクリプト
│   ├── fetch-libaddressinput.js  # libaddressinput データ取得スクリプト
│   └── README.md             # スクリプト説明
├── sdk/                      # 開発者向けSDK
│   ├── core/                 # コアSDK
│   ├── react/                # React用コンポーネント
│   ├── vue/                  # Vue用コンポーザブル
│   ├── widget/               # ユニバーサルウィジェット
│   ├── webhooks/             # Webhookユーティリティ
│   ├── qr-nfc/               # QRコード・NFC統合
│   ├── graphql/              # GraphQLスキーマ
│   ├── grpc/                 # gRPCプロトコル定義
│   └── cli/                  # CLIツール
├── .github/                  # GitHub 設定
│   └── workflows/            # GitHub Actions ワークフロー
│       └── auto-fetch-libaddressinput.yml  # 自動データ更新
└── README.md                 # プロジェクト説明
```

## 📝 データ形式

### ファイル命名規則とディレクトリ構造

全ての国は専用のディレクトリを持ち、その中に国コードと同じ名前のファイルが配置されています：

- 国ファイル: `{地域}/{ISO 3166-1 alpha-2コード}/{ISO 3166-1 alpha-2コード}.yaml` および `.json`
  - 例: `data/asia/east_asia/JP/JP.yaml`, `data/americas/north_america/US/US.yaml`
- 海外領土・特別地域: `{国コード}/overseas/{地域名}.yaml` または `{国コード}/regions/{地域名}.yaml`
  - 例: `data/americas/north_america/US/overseas/PR.yaml` (プエルトリコ)
  - 例: `data/asia/southeast_asia/ID/regions/Papua.yaml` (パプア)

### スキーマレベル

このプロジェクトでは3つのスキーマレベルを提供しています：

#### 🚚 配送実務レベル（届くレベル）

最小限の入力で確実に届くことを目指した、フォーム設計や配送ラベル生成向けのスキーマです。

```yaml
name:
  en: Japan                    # 英語名（必須）

iso_codes:
  alpha2: JP                   # ISO 3166-1 alpha-2（必須）

languages:
  - name: English
    script: Latin
    direction: ltr
    role: shipping_required

address_format:
  order: [recipient, street_address, city, province, postal_code, country]
  
  recipient:
    required: true
  street_address:
    required: true
  city:
    required: true
  province:
    required: true
    label_en: Prefecture
  postal_code:
    required: true
    regex: "^[0-9]{3}-[0-9]{4}$"
  country:
    required: true

examples:
  international: "..."
```

#### 📚 研究レベル（学術・比較用）

各国の住所制度を比較・分析・標準化する研究用途向けの詳細スキーマです。

```yaml
name:
  en: Japan
  local:
    - lang: ja
      value: 日本
      script: Kanji
      direction: ltr

iso_codes:
  alpha2: JP
  alpha3: JPN
  numeric: "392"

continent: Asia
subregion: East Asia

languages:
  - name: Japanese
    script: Kanji
    direction: ltr
    role: official
    country_name: 日本

administrative_divisions:
  level1:
    type: Prefecture
    label_local: 都道府県
    label_en: Prefecture
    count: 47

address_format:
  order_variants:
    - context: domestic
      order: [recipient, prefecture, city, ward, street_address, ...]
    - context: international
      order: [recipient, room, floor, building, street_address, ...]

validation:
  allow_latin_transliteration: true
  rules:
    - "Prefecture name must never be omitted"

examples:
  domestic_raw: "〒100-0001 東京都千代田区千代田1-1 皇居"
  domestic_normalized: "東京都 千代田区 千代田1-1 皇居 100-0001"
  international: "Imperial Palace, 1-1 Chiyoda, Chiyoda-ku, Tokyo 100-0001, Japan"

status:
  un_member: true
  recognized: true
  disputed: false
```

#### 🏪 POSレベル（販売時点情報管理用）

POSシステムでの決済・レシート発行・税務処理に必要な情報を提供する、小売・飲食店向けのスキーマです。

```yaml
pos:
  currency:
    code: JPY                  # ISO 4217 通貨コード
    symbol: "¥"                # 通貨記号
    symbol_position: before    # 記号の位置（before / after）
    decimal_places: 0          # 小数点以下桁数
    decimal_separator: "."     # 小数点記号
    thousands_separator: ","   # 千区切り記号

  tax:
    type: Consumption Tax      # 税の種類
    rate:
      standard: 0.10           # 標準税率
      reduced:                 # 軽減税率
        - rate: 0.08
          category: food_beverages
    included_in_price: true    # 内税（true）/ 外税（false）
    invoice_requirement: required  # インボイス制度

  receipt:
    required_fields:           # 法的必須項目
      - business_name
      - registration_number
      - date
      - items
      - tax_breakdown
      - total
    paper_width: "80mm"        # 標準レシート幅
    electronic_allowed: true   # 電子レシート可否
    retention_period: "7 years"  # 保存義務期間

  fiscal:
    fiscal_device_required: false  # 財務デバイス必須か
    registration_required: true    # 事業者登録必須か
    reporting_frequency: annually  # 申告頻度

  payment_methods:             # 主要決済手段
    - type: cash
      name: 現金
      prevalence: high
    - type: mobile
      name: Suica/PASMO
      prevalence: high
    - type: qr_code
      name: PayPay
      prevalence: high

  locale:
    date_format: "YYYY/MM/DD"  # 日付形式
    time_format: "24h"         # 時刻形式
    timezone: "Asia/Tokyo"     # タイムゾーン
    week_start: sunday         # 週の開始曜日

  business_hours:
    typical_open: "10:00"      # 一般的な開店時間
    typical_close: "20:00"     # 一般的な閉店時間
    sunday_trading: true       # 日曜営業の一般性
    public_holidays_trading: true  # 祝日営業の一般性
```

## 🛠️ SDK（開発者向けツール）

本プロジェクトでは、様々なフレームワークやプラットフォームで利用可能なSDKを提供しています。

### 📦 利用可能なパッケージ

| パッケージ | 説明 | インストール |
|-----------|------|-------------|
| `@vey/core` | コアSDK（バリデーション・フォーマット） | `npm install @vey/core` |
| `@vey/react` | React用フック・コンポーネント | `npm install @vey/react` |
| `@vey/vue` | Vue用コンポーザブル | `npm install @vey/vue` |
| `@vey/widget` | Universal Shadow Widget（フレームワーク非依存） | `npm install @vey/widget` |
| `@vey/webhooks` | Webhookユーティリティ | `npm install @vey/webhooks` |
| `@vey/qr-nfc` | QRコード・NFC統合 | `npm install @vey/qr-nfc` |
| `@vey/graphql` | GraphQLスキーマ | `npm install @vey/graphql` |
| `@vey/grpc` | gRPCプロトコル定義 | `npm install @vey/grpc` |
| `veyform-sdk` | CLIツール | `npx veyform-sdk init` |

### 🚀 クイックスタート

```bash
# プロジェクト初期化
npx veyform-sdk init

# 依存関係インストール（React）
npm install @vey/core @vey/react
```

### React での使用例

```tsx
import { VeyProvider, AddressForm } from '@vey/react';

function App() {
  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <AddressForm
        countryCode="JP"
        onSubmit={(address, validation) => {
          if (validation.valid) {
            console.log('Valid address:', address);
          }
        }}
      />
    </VeyProvider>
  );
}
```

### Universal Widget の使用例

```html
<script src="https://unpkg.com/@vey/widget"></script>
<vey-address-widget country-code="JP" theme="light"></vey-address-widget>
```

### CLI コマンド

```bash
# GraphQLスキーマ生成
npx veyform-sdk graphql --output schema.graphql

# gRPC protoファイル生成
npx veyform-sdk proto --output vey.proto

# 住所バリデーション
npx veyform-sdk validate --country JP --postal-code 100-0001

# 対応国一覧
npx veyform-sdk countries --region asia
```

詳細は [SDK README](./sdk/README.md) をご覧ください。

## 🔑 住所PID (Place ID)

住所PIDは階層的な住所識別子で、以下の用途に対応しています：

- **一意識別** - 世界中の住所を1つのIDで区別
- **ZK証明** - 住所を公開せずに正当性を検証
- **配送ルーティング** - WMS/TMS/Carrierシステムと互換

### PIDフォーマット

```
<Country>-<Admin1>-<Admin2>-<Locality>-<Sublocality>-<Block>-<Building>-<Unit>
```

例: `JP-13-113-01-T07-B12-BN02-R342`

| フィールド | 内容 | コード例 |
|-----------|------|---------|
| Country | 国/地域 (ISO 3166-1 alpha-2) | `JP` |
| Admin1 | 第1行政階層（都道府県） | `13` = 東京 |
| Admin2 | 第2行政階層（市区町村） | `113` = 渋谷区 |
| Locality | 市/区/郡 | `01` |
| Sublocality | 町/丁目 | `T07` = 東7丁目 |
| Block | 番地/ブロック | `B12` = 12番地 |
| Building | 建物/ビル | `BN02` = build-02 |
| Unit | 部屋/ユニット | `R342` = 342号室 |

### 使用例

```typescript
import { encodePID, decodePID, validatePID } from '@vey/core';

// PIDエンコード
const pid = encodePID({
  country: 'JP',
  admin1: '13',
  admin2: '113',
  locality: '01'
});
// 結果: 'JP-13-113-01'

// PIDデコード
const components = decodePID('JP-13-113-01');

// PIDバリデーション
const result = validatePID('JP-13-113');
if (result.valid) {
  console.log('有効なPID:', result.components);
}
```

詳細は [SDK README](./sdk/README.md#-address-pid-place-id) をご覧ください。

## 🌍 緯度経度との関係性 (Geo-coordinates Relationship)

住所データと緯度経度の関係性を定義し、座標情報を活用した「保険」機能を提供します。

### 概要

- **住所と座標のマッピング** - 各住所に緯度経度を関連付け
- **座標検証** - 配送・位置確認時の座標ベース検証
- **フォールバック機能** - 住所が曖昧な場合の座標による補完

### データ構造

```yaml
geo:
  center:
    latitude: 35.6812      # 緯度
    longitude: 139.7671    # 経度
    accuracy: 10           # 精度（メートル）
    source: geocoder       # 取得元
  bounds:
    northeast:
      latitude: 35.6830
      longitude: 139.7690
    southwest:
      latitude: 35.6794
      longitude: 139.7652
  verified: true
```

### 緯度経度を保険とする技術

座標情報を住所検証の「保険」として活用する機能です：

```typescript
import { 
  verifyAddressWithGeo,
  createGeoAddress,
  calculateDistance 
} from '@vey/core';

// 住所と座標の関係性を作成
const address = createGeoAddress(
  'JP-13-101-01',
  { latitude: 35.6812, longitude: 139.7671 }
);

// 配達員の現在位置で住所を検証（保険機能）
const driverLocation = {
  latitude: 35.6815,
  longitude: 139.7668,
  accuracy: 5,
  source: 'gps'
};

const result = verifyAddressWithGeo(address, driverLocation, {
  toleranceMeters: 100,   // 許容距離
  minConfidence: 0.8      // 最小信頼度
});

if (result.valid) {
  console.log('配達員は正しい位置にいます');
  console.log(`信頼度: ${result.confidence}`);
} else {
  console.log(`配達員は${result.distance}m離れた位置にいます`);
}
```

### 利用シーン

| シーン | 説明 |
|-------|------|
| 配送検証 | 配達員が正しい住所にいることを座標で確認 |
| 住所補完 | 座標から住所を逆引きして補完 |
| 不正検出 | 住所と座標の不一致を検出 |
| オフライン対応 | 座標情報による住所特定のフォールバック |

詳細は [Schema Documentation](./docs/schema/README.md) をご覧ください。

## 🔐 ZKPアドレスプロトコル (ZKP Address Protocol)

プライバシー保護型の住所管理・配送システムです。ゼロ知識証明（Zero-Knowledge Proof）を活用し、ECサイトやキャリアに生住所を公開せずに配送を実現します。

### 概要

ZKPアドレスプロトコルは4つの主要なフローで構成されています：

1. **住所登録・認証フロー** - ユーザーが住所を登録し、検証済みの住所クレデンシャル（VC）を取得
2. **配送依頼・送り状発行フロー** - ECサイトが配送先の有効性をZK証明で確認（生住所は見ない）
3. **配送実行・追跡フロー** - キャリアが必要な範囲でのみ住所情報にアクセス
4. **住所更新・失効フロー** - 住所変更時の安全な更新と旧住所の失効

### 特徴

- 🔒 **プライバシー保護**: ECサイトは生住所を一切見ない
- ✅ **検証可能**: ZK証明で配送可能性を検証
- 📊 **監査可能**: すべてのアクセスを記録
- 🔑 **ユーザー主権**: ユーザーが自分の住所データを管理

### クイックスタート

```typescript
import {
  createAddressPIDCredential,
  validateShippingRequest,
  createZKPWaybill
} from '@vey/core';

// 1. Address Provider: ユーザーにAddress PID Credentialを発行
const vc = createAddressPIDCredential(
  'did:key:user123',      // ユーザーDID
  'did:web:vey.example',  // プロバイダDID
  'JP-13-113-01',         // 住所PID
  'JP',                   // 国コード
  '13'                    // 都道府県コード
);

// 2. EC Site: 配送条件を満たすかZK証明で検証
const response = validateShippingRequest(
  {
    pid: 'JP-13-113-01',
    conditions: {
      allowedCountries: ['JP'],
      allowedRegions: ['13', '14', '27']
    },
    requesterId: 'did:web:ec-site.example',
    timestamp: new Date().toISOString()
  },
  zkCircuit,
  fullAddress // プロバイダのみが持つ生住所
);

// 3. 配送可能であればZKP付き送り状を作成
if (response.valid && response.zkProof) {
  const waybill = createZKPWaybill(
    'WB-001',
    'JP-13-113-01',
    response.zkProof,
    'TN-001'
  );
  // ECサイトはPIDトークンとZK証明のみを保存
  // 生住所は保存しない！
}
```

### ドキュメント

- [ZKP Protocol Documentation](./docs/zkp-protocol.md) - プロトコル詳細
- [API Reference](./docs/zkp-api.md) - API仕様
- [Complete Flow Example](./docs/examples/zkp/complete-flow.ts) - 全フローの実装例
- [EC Integration Example](./docs/examples/zkp/ec-integration.ts) - ECサイト統合例

詳細は [ZKP Protocol Documentation](./docs/zkp-protocol.md) をご覧ください。

## 🔧 使用方法

### データの読み込み

任意のYAML/JSONパーサーを使用してデータを読み込むことができます。

**Python (YAML):**
```python
import yaml

with open('data/asia/east_asia/JP/JP.yaml', 'r', encoding='utf-8') as f:
    japan_data = yaml.safe_load(f)

print(japan_data['name']['en'])  # Japan
print(japan_data['address_format']['postal_code']['regex'])  # ^[0-9]{3}-[0-9]{4}$
```

**Python (JSON):**
```python
import json

with open('data/asia/east_asia/JP/JP.json', 'r', encoding='utf-8') as f:
    japan_data = json.load(f)

print(japan_data['name']['en'])  # Japan
print(japan_data['address_format']['postal_code']['regex'])  # ^[0-9]{3}-[0-9]{4}$
```

**JavaScript/Node.js (YAML):**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');

const japanData = yaml.load(fs.readFileSync('data/asia/east_asia/JP/JP.yaml', 'utf8'));
console.log(japanData.name.en);  // Japan
```

**JavaScript/Node.js (JSON):**
```javascript
const fs = require('fs');

const japanData = JSON.parse(fs.readFileSync('data/asia/east_asia/JP/JP.json', 'utf8'));
console.log(japanData.name.en);  // Japan
```

## 🤝 貢献方法

### 新しい国・地域のデータを追加する

1. 適切な大陸・地域のディレクトリに移動
2. 国コード（ISO 3166-1 alpha-2）と同じ名前のディレクトリを作成
3. そのディレクトリ内に `{国コード}.yaml` ファイルを作成
4. `docs/schema/README.md` のスキーマに従ってデータを記述
5. 対応するJSONファイルも作成（YAMLから自動変換可能）
6. Pull Requestを作成

例: 新しい国 "XY" を追加する場合
```
data/asia/east_asia/XY/
  ├── XY.yaml
  └── XY.json
```

### データの修正・改善

1. 誤りを発見した場合はIssueを作成
2. 修正がある場合はPull Requestで提案

### 注意事項

- 政治的に敏感な地域（係争地域、部分承認国など）については、`status` フィールドで状況を明記
- 海外領土は各国のディレクトリ内の `overseas/` サブディレクトリに配置
- 特殊な行政区画は各国のディレクトリ内の `regions/` サブディレクトリに配置
- 全ての国は専用のディレクトリを持ち、将来的な拡張に備えた構造になっています

## 📊 収録状況

- **総ファイル数**: 279件（YAML + JSON = 558ファイル）
- **大陸**: 6大陸（アフリカ、アメリカ、南極、アジア、ヨーロッパ、オセアニア）
- **特殊地域**: 海外領土、係争地域、研究基地なども収録
- **データ形式**: YAML および JSON

## 🗺️ 対応国・地域一覧 / Supported Countries and Regions

<details>
<summary>🌍 アフリカ / Africa（54か国・地域）</summary>

#### 中央アフリカ / Central Africa
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AO | Angola | アンゴラ |
| CD | Democratic Republic of the Congo | コンゴ民主共和国 |
| CF | Central African Republic | 中央アフリカ共和国 |
| CG | Republic of the Congo | コンゴ共和国 |
| CM | Cameroon | カメルーン |
| GA | Gabon | ガボン |
| GQ | Equatorial Guinea | 赤道ギニア |
| ST | São Tomé and Príncipe | サントメ・プリンシペ |
| TD | Chad | チャド |

#### 東アフリカ / Eastern Africa
| コード | 国名 | 日本語名 |
|--------|------|----------|
| BI | Burundi | ブルンジ |
| DJ | Djibouti | ジブチ |
| ER | Eritrea | エリトリア |
| ET | Ethiopia | エチオピア |
| KE | Kenya | ケニア |
| KM | Comoros | コモロ |
| MG | Madagascar | マダガスカル |
| MU | Mauritius | モーリシャス |
| MW | Malawi | マラウイ |
| MZ | Mozambique | モザンビーク |
| RW | Rwanda | ルワンダ |
| SC | Seychelles | セーシェル |
| SO | Somalia | ソマリア |
| TZ | Tanzania | タンザニア |
| UG | Uganda | ウガンダ |
| ZM | Zambia | ザンビア |
| ZW | Zimbabwe | ジンバブエ |

#### 北アフリカ / Northern Africa
| コード | 国名 | 日本語名 |
|--------|------|----------|
| DZ | Algeria | アルジェリア |
| EG | Egypt | エジプト |
| LY | Libya | リビア |
| MA | Morocco | モロッコ |
| SD | Sudan | スーダン |
| SS | South Sudan | 南スーダン |
| TN | Tunisia | チュニジア |

#### 南部アフリカ / Southern Africa
| コード | 国名 | 日本語名 |
|--------|------|----------|
| BW | Botswana | ボツワナ |
| LS | Lesotho | レソト |
| NA | Namibia | ナミビア |
| SZ | Eswatini | エスワティニ |
| ZA | South Africa | 南アフリカ |

#### 西アフリカ / West Africa
| コード | 国名 | 日本語名 |
|--------|------|----------|
| BF | Burkina Faso | ブルキナファソ |
| BJ | Benin | ベナン |
| CI | Côte d'Ivoire | コートジボワール |
| CV | Cape Verde | カーボベルデ |
| GH | Ghana | ガーナ |
| GM | The Gambia | ガンビア |
| GN | Guinea | ギニア |
| GW | Guinea-Bissau | ギニアビサウ |
| LR | Liberia | リベリア |
| ML | Mali | マリ |
| MR | Mauritania | モーリタニア |
| NE | Niger | ニジェール |
| NG | Nigeria | ナイジェリア |
| SL | Sierra Leone | シエラレオネ |
| SN | Senegal | セネガル |
| TG | Togo | トーゴ |

</details>

<details>
<summary>🌎 アメリカ大陸 / Americas（45か国・地域）</summary>

#### カリブ海 / Caribbean
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AG | Antigua and Barbuda | アンティグア・バーブーダ |
| BB | Barbados | バルバドス |
| BS | The Bahamas | バハマ |
| CU | Cuba | キューバ |
| DM | Dominica | ドミニカ国 |
| DO | Dominican Republic | ドミニカ共和国 |
| GD | Grenada | グレナダ |
| HT | Haiti | ハイチ |
| JM | Jamaica | ジャマイカ |
| KN | Saint Kitts and Nevis | セントクリストファー・ネイビス |
| LC | Saint Lucia | セントルシア |
| TT | Trinidad and Tobago | トリニダード・トバゴ |
| VC | Saint Vincent and the Grenadines | セントビンセント・グレナディーン |

#### 中央アメリカ / Central America
| コード | 国名 | 日本語名 |
|--------|------|----------|
| BZ | Belize | ベリーズ |
| CR | Costa Rica | コスタリカ |
| GT | Guatemala | グアテマラ |
| HN | Honduras | ホンジュラス |
| NI | Nicaragua | ニカラグア |
| PA | Panama | パナマ |
| SV | El Salvador | エルサルバドル |

#### 北アメリカ / North America
| コード | 国名 | 日本語名 |
|--------|------|----------|
| CA | Canada | カナダ |
| MX | Mexico | メキシコ |
| US | United States | アメリカ合衆国 |

**米国海外領土 / U.S. Overseas Territories:**
| コード | 地域名 | 日本語名 |
|--------|--------|----------|
| AS | American Samoa | アメリカ領サモア |
| GU | Guam | グアム |
| MP | Northern Mariana Islands | 北マリアナ諸島 |
| PR | Puerto Rico | プエルトリコ |
| VI | United States Virgin Islands | アメリカ領ヴァージン諸島 |

#### 南アメリカ / South America
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AR | Argentina | アルゼンチン |
| BO | Bolivia | ボリビア |
| BR | Brazil | ブラジル |
| CL | Chile | チリ |
| CO | Colombia | コロンビア |
| EC | Ecuador | エクアドル |
| GY | Guyana | ガイアナ |
| PE | Peru | ペルー |
| PY | Paraguay | パラグアイ |
| SR | Suriname | スリナム |
| UY | Uruguay | ウルグアイ |
| VE | Venezuela | ベネズエラ |

**チリ海外領土 / Chile Overseas Territories:**
| ファイル名 | 地域名 | 日本語名 |
|------------|--------|----------|
| Desventuradas | Desventuradas Islands | デスベンチュラダス諸島 |
| Easter_Island | Easter Island | イースター島 |
| Juan_Fernandez | Juan Fernández Islands | フアン・フェルナンデス諸島 |

</details>

<details>
<summary>🧊 南極 / Antarctica（22地域・基地）</summary>

#### 南極大陸 / Antarctica
| コード | 名称 | 日本語名 |
|--------|------|----------|
| AQ | Antarctica | 南極 |

#### 領有権主張地域 / Territorial Claims
| コード | 名称 | 日本語名 |
|--------|------|----------|
| AR_CLAIM | Argentine Antarctica | アルゼンチン領南極 |
| AT | Australian Antarctic Territory | オーストラリア南極領 |
| BAT | British Antarctic Territory | イギリス領南極地域 |
| CL_CLAIM | Chilean Antarctic Territory | チリ領南極 |
| FR_ADELIE | Adélie Land | アデリーランド |
| NO_PB | Peter I Island | ペーター1世島 |
| NO_QML | Queen Maud Land | ドロンニング・モード・ランド |
| NZ_ROSS | Ross Dependency | ロス海属領 |
| UNCLAIMED | Marie Byrd Land (Unclaimed) | マリーバードランド（未主張） |

#### 研究基地 / Research Stations
| コード | 名称 | 日本語名 |
|--------|------|----------|
| AU_CASEY | Casey Station | ケーシー基地 |
| AU_DAVIS | Davis Station | デイビス基地 |
| AU_MAWSON | Mawson Station | モーソン基地 |
| CN_ZHONGSHAN | Zhongshan Station | 中山基地 |
| DE_NEUMAYER | Neumayer Station III | ノイマイヤー基地III |
| IN_BHARATI | Bharati Station | バラティ基地 |
| IN_MAITRI | Maitri Station | マイトリ基地 |
| IT_ZUCCHELLI | Mario Zucchelli Station | マリオ・ズッケリ基地 |
| JP_SYOWA | Syowa Station | 昭和基地 |
| KR_SEJONG | King Sejong Station | 世宗基地 |
| RU_VOSTOK | Vostok Station | ボストーク基地 |
| US_MCMURDO | McMurdo Station | マクマード基地 |

</details>

<details>
<summary>🌏 アジア / Asia（54か国・地域）</summary>

#### 中央アジア / Central Asia
| コード | 国名 | 日本語名 |
|--------|------|----------|
| KG | Kyrgyzstan | キルギス |
| KZ | Kazakhstan | カザフスタン |
| TJ | Tajikistan | タジキスタン |
| TM | Turkmenistan | トルクメニスタン |
| UZ | Uzbekistan | ウズベキスタン |

#### 東アジア / East Asia
| コード | 国名 | 日本語名 |
|--------|------|----------|
| CN | China | 中国 |
| HK | Hong Kong | 香港 |
| JP | Japan | 日本 |
| KP | North Korea | 北朝鮮 |
| KR | South Korea | 韓国 |
| MN | Mongolia | モンゴル |
| MO | Macao | マカオ |
| TW | Taiwan | 台湾 |

#### 南アジア / South Asia
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AF | Afghanistan | アフガニスタン |
| BD | Bangladesh | バングラデシュ |
| BT | Bhutan | ブータン |
| IN | India | インド |
| LK | Sri Lanka | スリランカ |
| MV | Maldives | モルディブ |
| NP | Nepal | ネパール |
| PK | Pakistan | パキスタン |

**インド連邦直轄領 / Indian Union Territories:**
| ファイル名 | 地域名 | 日本語名 |
|------------|--------|----------|
| Andaman_Nicobar | Andaman and Nicobar Islands | アンダマン・ニコバル諸島 |
| Lakshadweep | Lakshadweep | ラクシャディープ諸島 |

#### 東南アジア / Southeast Asia
| コード | 国名 | 日本語名 |
|--------|------|----------|
| BN | Brunei | ブルネイ |
| ID | Indonesia | インドネシア |
| KH | Cambodia | カンボジア |
| LA | Laos | ラオス |
| MM | Myanmar | ミャンマー |
| MY | Malaysia | マレーシア |
| PH | Philippines | フィリピン |
| SG | Singapore | シンガポール |
| TH | Thailand | タイ |
| TL | Timor-Leste | 東ティモール |
| VN | Vietnam | ベトナム |

**インドネシア特別地域 / Indonesia Special Regions:**
| ファイル名 | 地域名 | 日本語名 |
|------------|--------|----------|
| Papua | Papua | パプア |

#### 西アジア / West Asia
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AE | United Arab Emirates | アラブ首長国連邦 |
| BH | Bahrain | バーレーン |
| IL | Israel | イスラエル |
| IQ | Iraq | イラク |
| IR | Iran | イラン |
| JO | Jordan | ヨルダン |
| KW | Kuwait | クウェート |
| LB | Lebanon | レバノン |
| OM | Oman | オマーン |
| PS | Palestine | パレスチナ |
| QA | Qatar | カタール |
| SA | Saudi Arabia | サウジアラビア |
| SY | Syria | シリア |
| TR | Turkey | トルコ |
| YE | Yemen | イエメン |

**コーカサス / Caucasus:**
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AM | Armenia | アルメニア |
| AZ | Azerbaijan | アゼルバイジャン |
| GE | Georgia | ジョージア |

> ※ コーカサス諸国はアジアとヨーロッパの境界に位置するため、両方のセクションに記載されています。
> *Note: Caucasus countries are listed in both Asia and Europe sections as they are geographically located at the boundary between the two continents.*

</details>

<details>
<summary>🇪🇺 ヨーロッパ / Europe（73か国・地域）</summary>

#### コーカサス / Caucasus
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AM | Armenia | アルメニア |
| AZ | Azerbaijan | アゼルバイジャン |
| GE | Georgia | ジョージア |

> ※ アジアセクションにも記載 / Also listed in Asia section

**コーカサス係争地域 / Caucasus Disputed Territories:**
| コード | 地域名 | 日本語名 |
|--------|--------|----------|
| AB | Abkhazia | アブハジア |
| SO | South Ossetia | 南オセチア |

#### 東ヨーロッパ / Eastern Europe
| コード | 国名 | 日本語名 |
|--------|------|----------|
| BG | Bulgaria | ブルガリア |
| BY | Belarus | ベラルーシ |
| CZ | Czech Republic | チェコ |
| HU | Hungary | ハンガリー |
| MD | Moldova | モルドバ |
| PL | Poland | ポーランド |
| RO | Romania | ルーマニア |
| RU | Russia | ロシア |
| SK | Slovakia | スロバキア |
| UA | Ukraine | ウクライナ |

#### 北ヨーロッパ / Northern Europe
| コード | 国名 | 日本語名 |
|--------|------|----------|
| DK | Denmark | デンマーク |
| EE | Estonia | エストニア |
| FI | Finland | フィンランド |
| GB | United Kingdom | イギリス |
| IE | Ireland | アイルランド |
| IS | Iceland | アイスランド |
| LT | Lithuania | リトアニア |
| LV | Latvia | ラトビア |
| NO | Norway | ノルウェー |
| SE | Sweden | スウェーデン |

**デンマーク自治領 / Danish Autonomous Territories:**
| コード | 地域名 | 日本語名 |
|--------|--------|----------|
| FO | Faroe Islands | フェロー諸島 |
| GL | Greenland | グリーンランド |

**イギリス王室属領 / British Crown Dependencies:**
| コード | 地域名 | 日本語名 |
|--------|--------|----------|
| GG | Guernsey | ガーンジー |
| IM | Isle of Man | マン島 |
| JE | Jersey | ジャージー |

**イギリス海外領土 / British Overseas Territories:**
| コード | 地域名 | 日本語名 |
|--------|--------|----------|
| AI | Anguilla | アンギラ |
| BM | Bermuda | バミューダ |
| FK | Falkland Islands | フォークランド諸島 |
| GI | Gibraltar | ジブラルタル |
| GS | South Georgia and the South Sandwich Islands | サウスジョージア・サウスサンドウィッチ諸島 |
| IO | British Indian Ocean Territory | イギリス領インド洋地域 |
| KY | Cayman Islands | ケイマン諸島 |
| MS | Montserrat | モントセラト |
| PN | Pitcairn Islands | ピトケアン諸島 |
| SH | Saint Helena, Ascension and Tristan da Cunha | セントヘレナ・アセンション・トリスタンダクーニャ |
| TC | Turks and Caicos Islands | タークス・カイコス諸島 |
| VG | British Virgin Islands | イギリス領ヴァージン諸島 |

#### 南東ヨーロッパ / Southeastern Europe
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AL | Albania | アルバニア |
| BA | Bosnia and Herzegovina | ボスニア・ヘルツェゴビナ |
| HR | Croatia | クロアチア |
| ME | Montenegro | モンテネグロ |
| MK | North Macedonia | 北マケドニア |
| RS | Serbia | セルビア |

**南東ヨーロッパ係争地域 / Southeastern Europe Disputed Territories:**
| コード | 地域名 | 日本語名 |
|--------|--------|----------|
| XK | Kosovo | コソボ |

#### 南ヨーロッパ / Southern Europe
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AD | Andorra | アンドラ |
| CY | Cyprus | キプロス |
| ES | Spain | スペイン |
| GR | Greece | ギリシャ |
| IT | Italy | イタリア |
| MT | Malta | マルタ |
| PT | Portugal | ポルトガル |
| SM | San Marino | サンマリノ |
| VA | Vatican City | バチカン市国 |

**スペイン特別地域 / Spain Special Regions:**
| ファイル名 | 地域名 | 日本語名 |
|------------|--------|----------|
| Canary_Islands | Canary Islands | カナリア諸島 |
| Ceuta_Melilla | Ceuta and Melilla | セウタ・メリリャ |

**ポルトガル自治領 / Portuguese Autonomous Regions:**
| ファイル名 | 地域名 | 日本語名 |
|------------|--------|----------|
| Azores | Azores | アゾレス諸島 |
| Madeira | Madeira | マデイラ諸島 |

#### 西ヨーロッパ / Western Europe
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AT | Austria | オーストリア |
| BE | Belgium | ベルギー |
| CH | Switzerland | スイス |
| DE | Germany | ドイツ |
| FR | France | フランス |
| LI | Liechtenstein | リヒテンシュタイン |
| LU | Luxembourg | ルクセンブルク |
| MC | Monaco | モナコ |
| NL | Netherlands | オランダ |

**フランス海外領土 / French Overseas Territories:**
| コード | 地域名 | 日本語名 |
|--------|--------|----------|
| GF | French Guiana | フランス領ギアナ |
| GP | Guadeloupe | グアドループ |
| MQ | Martinique | マルティニーク |
| NC | New Caledonia | ニューカレドニア |
| PF | French Polynesia | フランス領ポリネシア |
| PM | Saint Pierre and Miquelon | サンピエール・ミクロン |
| RE | Réunion | レユニオン |
| WF | Wallis and Futuna | ウォリス・フツナ |
| YT | Mayotte | マヨット |

**オランダ海外領土 / Dutch Overseas Territories:**
| コード | 地域名 | 日本語名 |
|--------|--------|----------|
| BQ | Caribbean Netherlands | カリブ・オランダ |
| CW | Curaçao | キュラソー |
| SX | Sint Maarten | シント・マールテン |

</details>

<details>
<summary>🌴 オセアニア / Oceania（22か国・地域）</summary>

#### オーストラリア・ニュージーランド / Australia and New Zealand
| コード | 国名 | 日本語名 |
|--------|------|----------|
| AU | Australia | オーストラリア |
| NZ | New Zealand | ニュージーランド |

**オーストラリア海外領土 / Australian External Territories:**
| コード | 地域名 | 日本語名 |
|--------|--------|----------|
| CC | Cocos (Keeling) Islands | ココス（キーリング）諸島 |
| CX | Christmas Island | クリスマス島 |
| HM | Heard Island and McDonald Islands | ハード島・マクドナルド諸島 |
| NF | Norfolk Island | ノーフォーク島 |

**ニュージーランド関連領土 / New Zealand Associated Territories:**
| コード | 地域名 | 日本語名 |
|--------|--------|----------|
| CK | Cook Islands | クック諸島 |
| NU | Niue | ニウエ |
| TK | Tokelau | トケラウ |

#### メラネシア / Melanesia
| コード | 国名 | 日本語名 |
|--------|------|----------|
| FJ | Fiji | フィジー |
| PG | Papua New Guinea | パプアニューギニア |
| SB | Solomon Islands | ソロモン諸島 |
| VU | Vanuatu | バヌアツ |

#### ミクロネシア / Micronesia
| コード | 国名 | 日本語名 |
|--------|------|----------|
| FM | Federated States of Micronesia | ミクロネシア連邦 |
| KI | Kiribati | キリバス |
| MH | Marshall Islands | マーシャル諸島 |
| NR | Nauru | ナウル |
| PW | Palau | パラオ |

#### ポリネシア / Polynesia
| コード | 国名 | 日本語名 |
|--------|------|----------|
| TO | Tonga | トンガ |
| TV | Tuvalu | ツバル |
| WS | Samoa | サモア |

</details>

## 📜 ライセンス

このプロジェクトのデータはオープンデータとして提供されています。

## 🔗 関連リンク

- [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html) - 国名コード規格
- [Universal Postal Union](https://www.upu.int/) - 万国郵便連合

---

🌐 **World Address YAML / JSON** - 世界の住所を、ひとつのフォーマットで
