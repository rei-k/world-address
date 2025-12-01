# サンプルデータ / Example Data

このドキュメントでは、World Address YAMLプロジェクトの各スキーマレベルの具体的な使用例を示しています。

## 🚚 配送実務（届くレベル）スキーマ

👉 ゴール：最小限の入力でも確実に届く。フォーム設計や配送ラベル生成向け。

```yaml
name: 
  en: Afghanistan

iso_codes:
  alpha2: AF

languages:
  - name: English
    script: Latin
    direction: ltr
    role: shipping_required
  - name: Pashto
    script: Arabic
    direction: rtl
    role: official
  - name: Dari
    script: Arabic
    direction: rtl
    role: official

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
    label_en: Province
  postal_code:
    required: true
    regex: "^[0-9]{4}$"
  country:
    required: true

examples:
  international: "Mr. Ahmad Khan, Karte Parwan Street 15, Kabul, Afghanistan 1001"
```

### 特徴

- 必須フィールドだけ
- 言語は英語＋現地語（英語必須フラグあり）
- 郵便番号は正規表現のみ
- サンプル住所は国際配送向けに1つ

---

## 📚 研究分析（フルレベル）スキーマ

👉 ゴール：各国の住所制度を比較・分析・標準化する研究用途。階層・多言語・歴史も含む。

```yaml
name:
  en: Afghanistan
  fa: افغانستان
  ps: افغانستان

iso_codes:
  alpha2: AF
  alpha3: AFG
  numeric: "004"

continent: Asia
subregion: South Asia

languages:
  - name: Pashto
    script: Arabic
    direction: rtl
    role: official
    country_name: افغانستان
  - name: Dari
    script: Arabic
    direction: rtl
    role: official
    country_name: افغانستان
  - name: English
    script: Latin
    direction: ltr
    role: auxiliary
    required_for_shipping: true
    country_name: Afghanistan

address_format:
  order_variants:
    - context: domestic
      order: [recipient, street_address, district, city, province, postal_code, country]
    - context: international
      order: [recipient, building, floor, room, street_address, city, province, postal_code, country]

  recipient:
    required: true
  building:
    required: false
  floor:
    required: false
  room:
    required: false
  street_address:
    required: true
  district:
    required: false
  city:
    required: true
  province:
    required: true
    type: Province
    label_local: ولایت
    label_en: Province
    count: 34
  postal_code:
    required: true
    regex: "^[0-9]{4}$"
    description: "4-digit numeric code"
    example: "1001"
    since: 2011
  country:
    required: true
    value: Afghanistan

administrative_divisions:
  level1:
    type: Province
    count: 34
  level2:
    type: District
    required: false
  level3:
    type: Subdistrict
    required: false

validation:
  allow_latin_transliteration: true
  postal_code_rules:
    general: required
    exceptions: "Some rural areas may not have postal codes"
  fallback: "city + province + country"

examples:
  domestic_raw: "ولایت کابل، شهر کابل، کارته پروان، سرک ۱۵"
  domestic_normalized: "Kabul Province, Kabul City, Karte Parwan Street 15"
  international: "Room 1205, Floor 12, Azadi Tower Complex, Karte Parwan Street 15, Kabul, Afghanistan 1001"
```

---

## 🏪 POS（販売時点情報管理）スキーマ

👉 ゴール：POS システムでの決済・レシート発行・税務処理に必要な情報を提供。小売・飲食店向け。

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

currency:
  code: JPY
  symbol: "¥"
  symbol_position: before
  decimal_places: 0
  decimal_separator: "."
  thousands_separator: ","

tax:
  type: Consumption Tax
  rate:
    standard: 0.10
    reduced:
      - rate: 0.08
        category: food_beverages
      - rate: 0.08
        category: newspapers
  included_in_price: true
  invoice_requirement: required

receipt:
  required_fields:
    - business_name
    - business_address
    - registration_number
    - date
    - items
    - tax_breakdown
    - total
  paper_width: "80mm"
  electronic_allowed: true
  retention_period: "7 years"

fiscal:
  fiscal_device_required: false
  registration_required: true
  reporting_frequency: annually

payment_methods:
  - type: cash
    name: 現金
    prevalence: high
  - type: credit_card
    name: クレジットカード
    prevalence: high
  - type: mobile
    name: Suica/PASMO
    prevalence: high
  - type: qr_code
    name: PayPay
    prevalence: high
  - type: qr_code
    name: LINE Pay
    prevalence: medium

locale:
  date_format: "YYYY/MM/DD"
  time_format: "24h"
  timezone: "Asia/Tokyo"
  week_start: "sunday"

business_hours:
  typical_open: "10:00"
  typical_close: "20:00"
  sunday_trading: true
  public_holidays_trading: true
```

### 特徴

- 通貨情報（ISO 4217 コード、記号、小数点桁数）
- 税制（消費税率、軽減税率、内税/外税）
- レシート要件（必須項目、電子レシート可否、保存義務期間）
- 決済手段（主要な決済方法と普及度）
- ロケール（日付・時刻形式、タイムゾーン）
- 営業時間慣習（日曜・祝日営業の一般性）