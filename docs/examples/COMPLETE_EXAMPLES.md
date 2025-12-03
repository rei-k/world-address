# 📚 完全実装国の例 / Complete Country Examples

このディレクトリには、すべてのスキーマフィールドを含む完全な実装例が含まれています。新しい国のデータを追加する際のリファレンスとしてご利用ください。

## 🌍 利用可能な完全実装例

### 🇯🇵 日本 (JP)

**ファイル:** [JP_complete_example.yaml](./JP_complete_example.yaml)

**完成度:** 100% | **特徴:** POS対応、緯度経度対応

日本の完全実装例。以下のすべての機能が含まれています：

- ✅ 基本情報（名前、ISOコード、大陸、地域）
- ✅ 多言語対応（日本語、英語）
- ✅ 行政区画（47都道府県）
- ✅ 住所フォーマット（国内用、国際用）
- ✅ 住所バリデーションルール
- ✅ **POS情報** - 通貨、消費税（標準10%、軽減8%）、レシート要件、決済手段（Suica、PayPay等）
- ✅ **緯度経度情報** - 日本の地理的中心、境界
- ✅ **緯度経度保険設定** - 配送検証用の座標活用設定

**活用例:**
- 日本向けECサイトのフォーム設計
- 配送ラベル生成
- POSレジシステムの税率設定
- 配達員の位置検証

### 🇺🇸 アメリカ合衆国 (US)

**ファイル:** [US_complete_example.yaml](./US_complete_example.yaml)

**完成度:** 100% | **特徴:** POS対応

アメリカ合衆国の完全実装例。以下の機能が含まれています：

- ✅ 基本情報
- ✅ 多言語対応（英語、スペイン語）
- ✅ 住所フォーマット（州、ZIP コード、ZIP+4対応）
- ✅ **POS情報** - 州ごとの税率設定
- ✅ 海外領土の参照（プエルトリコ、グアム、アメリカ領サモア等）

**活用例:**
- 北米向け配送システム
- 州別税率計算
- 海外領土への配送対応

## 📖 使い方ガイド

### 新しい国を追加する際のテンプレートとして使用

```bash
# 1. 例としてドイツ (DE) のデータを作成する場合
# JP_complete_example.yaml をベースにコピー
cp docs/examples/JP_complete_example.yaml data/europe/western_europe/DE/DE.yaml

# 2. ファイルを編集してドイツ固有のデータに変更
vi data/europe/western_europe/DE/DE.yaml

# 3. バリデーションを実行
npm run validate:data
```

### 必須フィールドの確認

**最低限必要なフィールド:**
```yaml
name:
  en: Country Name              # 英語名（必須）

iso_codes:
  alpha2: XX                    # ISO 3166-1 alpha-2（必須）
```

**推奨フィールド:**
```yaml
iso_codes:
  alpha3: XXX                   # ISO 3166-1 alpha-3
  numeric: "999"                # ISO 3166-1 numeric

continent: Continent Name       # 大陸
languages: [...]                # 言語情報
```

**完全実装に必要なフィールド:**
- `name` - 国名（英語、ローカル名）
- `iso_codes` - ISO 3166-1 コード
- `continent` - 大陸
- `subregion` - 地域
- `languages` - 言語情報
- `administrative_divisions` - 行政区画
- `address_format` - 住所フォーマット
- `validation` - バリデーションルール
- `examples` - 住所例
- `status` - 国家ステータス

**オプション（拡張機能）:**
- `pos` - POS（販売時点情報管理）関連情報
  - 通貨、税、レシート要件、決済手段、ロケール等
- `geo` - 緯度経度情報
  - 国の地理的中心、境界
- `geo_insurance` - 緯度経度保険設定
  - 配送検証のための座標活用設定

## 🔍 フィールド詳細説明

### POS情報の例（日本）

```yaml
pos:
  currency:
    code: JPY                    # ISO 4217 通貨コード
    symbol: "¥"                  # 通貨記号
    decimal_places: 0            # 小数点以下桁数
    
  tax:
    type: Consumption Tax        # 税の種類
    rate:
      standard: 0.10             # 標準税率（10%）
      reduced:                   # 軽減税率
        - rate: 0.08
          category: food_beverages
    included_in_price: true      # 内税
    
  payment_methods:
    - type: mobile
      name: Suica/PASMO
      prevalence: high
```

### 緯度経度情報の例（日本）

```yaml
geo:
  center:                        # 国の地理的中心
    latitude: 36.2048
    longitude: 138.2529
    accuracy: 1000               # 精度（メートル）
    
  bounds:                        # 国の地理的範囲
    northeast:
      latitude: 45.5220
      longitude: 153.9870
    southwest:
      latitude: 24.0500
      longitude: 122.9340
      
  verified: true                 # データ検証済み
```

## 📊 データ完成度の確認

プロジェクト全体のデータ完成度を確認するには：

```bash
npm run stats:data
```

このコマンドで以下の情報が表示されます：
- 総国数
- フルスキーマ対応の国数
- 平均完成度
- POS対応国数
- 緯度経度対応国数

## 🔗 関連ドキュメント

- [メインREADME](../../README.md) - プロジェクト概要
- [スキーマドキュメント](./README.md) - スキーマレベルの説明
- [SDK README](../../sdk/README.md) - SDK使用方法
- [バリデーションスクリプト](../../scripts/validate-yaml.js) - データ検証
- [統計スクリプト](../../scripts/data-stats.js) - データ統計

## ❓ よくある質問

**Q: どの国を参考にすればよいですか？**

A: 自分が追加したい国と似た特徴を持つ国を参考にしてください：
- 東アジア → JP（日本）
- 北米 → US（アメリカ）
- 複雑な税制 → JP（軽減税率あり）
- 多言語対応 → US（英語・スペイン語）

**Q: POS情報は必須ですか？**

A: いいえ、オプションです。ただし、小売・飲食店向けの用途がある場合は追加をお勧めします。

**Q: 緯度経度情報はどこから取得できますか？**

A: Google Maps API や OpenStreetMap などの信頼できる地理情報ソースから取得してください。

**Q: バリデーションエラーが出た場合は？**

A: `npm run validate:data` を実行して具体的なエラー内容を確認してください。必須フィールドの欠落や YAML 構文エラーが表示されます。
