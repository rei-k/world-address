# スキーマ型定義 / Schema Type Definitions

このドキュメントでは、World Address YAMLプロジェクトで使用するスキーマ型を定義しています。

## 🚚 配送実務レベル（届くレベル）型

最小限の入力で確実に届くことを目指した、フォーム設計や配送ラベル生成向けのスキーマです。

```yaml
name:                     # 国名
  en: string              # 英語名（必須）

iso_codes:
  alpha2: string          # ISO 3166-1 alpha-2（必須）

languages:                # 配送ラベルで使う言語
  - name: string          # 言語名
    script: string        # 書記体系（例: Latin, Arabic）
    direction: string     # ltr / rtl
    role: string          # official / auxiliary / shipping_required

address_format:           # 住所フォーマット
  order:                  # フィールドの並び順（国際配送用推奨）
    - recipient
    - street_address
    - city
    - province
    - postal_code
    - country

  recipient:
    required: boolean
  street_address:
    required: boolean
  city:
    required: boolean
  province:
    required: boolean
    label_en: string      # 英語ラベル（例: Province, Prefecture）
  postal_code:
    required: boolean
    regex: string         # 郵便番号パターン
  country:
    required: boolean

examples:
  international: string   # 国際配送ラベルの例
```

## 📚 研究レベル（学術・比較用）型

各国の住所制度を比較・分析・標準化する研究用途向けの詳細スキーマです。

```yaml
name:                     # 国名（多言語対応）
  en: string              # 英語名
  local:                  # 現地名（複数可）
    - lang: string        # 言語名
      value: string       # 現地表記
      script: string      # 書記体系
      direction: string   # ltr / rtl

iso_codes:                # ISO 規格コード
  alpha2: string
  alpha3: string
  numeric: string

continent: string         # 大陸（例: Asia）
subregion: string         # サブリージョン（例: South Asia）

languages:                # 住所に対応する言語
  - name: string
    script: string
    direction: string
    role: string          # official / auxiliary
    required_for_shipping: boolean
    country_name: string  # 国名の現地表記

address_format:
  order_variants:         # 書式のバリエーション
    - context: string     # domestic / international / postal
      order:
        - recipient
        - building
        - floor
        - room
        - unit
        - street_address
        - district
        - city
        - province
        - postal_code
        - country

  recipient:
    required: boolean
  building:
    required: boolean
    example: string
  floor:
    required: boolean
    example: string
  room:
    required: boolean
    example: string
  unit:
    required: boolean
    example: string
  street_address:
    required: boolean
    example: string
  district:
    required: boolean
    example: string
  city:
    required: boolean
    example: string
  province:
    required: boolean
    type: string          # Province / State / Prefecture
    label_local: string   # 現地ラベル
    label_en: string      # 英語ラベル
    count: integer
  postal_code:
    required: boolean
    regex: string
    description: string
    example: string
    since: integer
  country:
    required: boolean
    value: string

administrative_divisions: # 行政区画
  level1:
    type: string
    label_local: string
    label_en: string
    count: integer
  level2:
    type: string
    required: boolean
  level3:
    type: string
    required: boolean

validation:               # 入力バリデーション
  allow_latin_transliteration: boolean
  postal_code_rules:
    general: string       # required / optional
    exceptions: string
  fallback: string        # 郵便番号なし時の代替

examples:                 # 住所例
  domestic_raw: string         # 現地そのまま
  domestic_normalized: string  # 正規化後
  international: string        # 国際配送用
```

## 🏪 POSレベル（販売時点情報管理用）型

POSシステムでの決済・レシート発行・税務処理に必要な情報を提供する、小売・飲食店向けのスキーマです。

```yaml
name:                     # 国名（多言語対応）
  en: string              # 英語名
  local:                  # 現地名（複数可）
    - lang: string        # 言語名
      value: string       # 現地表記
      script: string      # 書記体系
      direction: string   # ltr / rtl

iso_codes:                # ISO 規格コード
  alpha2: string
  alpha3: string
  numeric: string

currency:                 # 通貨情報
  code: string            # ISO 4217 通貨コード（例: JPY, USD, EUR）
  symbol: string          # 通貨記号（例: ¥, $, €）
  symbol_position: string # before / after（記号の位置）
  decimal_places: integer # 小数点以下桁数（例: 0, 2）
  decimal_separator: string    # 小数点記号（例: ".", ","）
  thousands_separator: string  # 千区切り記号（例: ",", ".", " "）

tax:                      # 税金情報
  type: string            # 税の種類（VAT / GST / Sales Tax / Consumption Tax）
  rate:                   # 税率
    standard: number      # 標準税率（例: 0.10 = 10%）
    reduced:              # 軽減税率（複数可）
      - rate: number      # 税率
        category: string  # 適用カテゴリ（例: food, medicine）
  included_in_price: boolean  # 価格に税込みか（true = 内税、false = 外税）
  invoice_requirement: string # インボイス制度の有無（required / optional / none）

receipt:                  # レシート要件
  required_fields:        # 法的必須項目
    - string              # 例: business_name, tax_id, date, items, total, tax_amount
  paper_width: string     # 標準レシート幅（例: "80mm", "58mm"）
  electronic_allowed: boolean # 電子レシート可否
  retention_period: string    # 保存義務期間（例: "7 years", "5 years"）

fiscal:                   # 財務・会計規制
  fiscal_device_required: boolean  # 財務デバイス（フィスカルプリンター等）必須か
  registration_required: boolean   # 事業者登録必須か
  reporting_frequency: string      # 申告頻度（例: monthly, quarterly, annually）

payment_methods:          # 主要決済手段
  - type: string          # 決済種別（cash / credit_card / debit_card / mobile / qr_code）
    name: string          # 決済名（例: Suica, PayPay, Alipay）
    prevalence: string    # 普及度（high / medium / low）

locale:                   # ロケール情報
  date_format: string     # 日付形式（例: "YYYY/MM/DD", "MM/DD/YYYY", "DD.MM.YYYY"）
  time_format: string     # 時刻形式（例: "24h", "12h"）
  timezone: string        # 主要タイムゾーン（例: "Asia/Tokyo", "America/New_York"）
  week_start: string      # 週の開始曜日（例: "monday", "sunday"）

business_hours:           # 営業時間慣習
  typical_open: string    # 一般的な開店時間（例: "10:00"）
  typical_close: string   # 一般的な閉店時間（例: "20:00"）
  sunday_trading: boolean # 日曜営業の一般性
  public_holidays_trading: boolean # 祝日営業の一般性
```