# 🌎 Americas / アメリカ大陸

[![Countries](https://img.shields.io/badge/Countries-35-green.svg)](.)
[![Regions](https://img.shields.io/badge/Regions-4-blue.svg)](.)
[![Data Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](.)

アメリカ大陸の住所形式データベース。35の国と地域の住所形式、郵便番号体系、言語、通貨、税制などの情報を網羅しています。

**English:** Comprehensive address format database for the Americas, covering 35 countries and regions with address formats, postal code systems, languages, currencies, and tax information.

---

## 📋 Table of Contents

- [Overview](#-overview--概要)
- [Regional Classification](#-regional-classification--地域分類)
- [Data Structure](#-data-structure--データ構造)
- [Statistics](#-statistics--統計情報)
- [Special Notes](#-special-notes--特記事項)
- [Usage Examples](#-usage-examples--使用例)
- [Country List](#-country-list--国一覧)

---

## 📊 Overview / 概要

### Coverage / カバレッジ

| Region | Countries | Data Completeness |
|--------|-----------|-------------------|
| North America | 3 | 100% |
| Central America | 7 | 100% |
| Caribbean | 13 | 100% |
| South America | 12 | 100% |
| **Total** | **35** | **100%** |

### Key Features / 主要機能

- ✅ **Advanced Postal Systems**: US ZIP+4, Canadian postal codes, Brazilian CEP
- 🌐 **Multi-language Support**: English, Spanish, Portuguese, French, Dutch, and indigenous languages
- 📮 **ZIP Code Validation**: Comprehensive regex patterns for North American postal codes
- 💰 **Diverse Tax Systems**: Sales tax, VAT, GST, and tax-free zones
- 📍 **Geocoding**: Coordinates for all countries and territories
- 🏝️ **Island Territories**: Caribbean nations and US overseas territories

---

## 🗺️ Regional Classification / 地域分類

アメリカ大陸は地理的・文化的特徴に基づき4つの地域に分類されています。

**The Americas are classified into 4 regions based on geographical and cultural characteristics:**

### North America / 北アメリカ (3 countries)

NAFTA/USMCA経済圏。高度に発達した郵便番号システム。

**NAFTA/USMCA economic zone with highly developed postal systems.**

- **Primary Languages**: English, French (Canada), Spanish (Mexico)
- **Postal Code Systems**: 
  - US: ZIP (5-digit) / ZIP+4 (5+4-digit)
  - Canada: Postal Code (A1A 1A1 format)
  - Mexico: 5-digit código postal
- **Currency Zone**: USD, CAD, MXN
- **Special Features**:
  - US territories span across Caribbean and Pacific (Puerto Rico, Guam, Virgin Islands)
  - Canada's bilingual addressing (English/French)
  - Mexico's complex state system

### Central America / 中央アメリカ (7 countries)

パナマ運河を含む地峡地域。スペイン語圏が中心。

**Isthmus region including the Panama Canal. Primarily Spanish-speaking.**

- **Primary Languages**: Spanish, English (Belize)
- **Postal Code Systems**: Varied (5-digit in most countries, some lack formal systems)
- **Currency Zone**: Mixed (USD used in Panama and El Salvador, local currencies in others)
- **Special Features**:
  - Panama Canal Zone with special addressing
  - Belize (former British Honduras) uses English
  - Small countries with limited postal infrastructure

### Caribbean / カリブ海 (13 countries)

島嶼国家群。旧英領・仏領・蘭領が多い。

**Island nations. Many former British, French, and Dutch colonies.**

- **Primary Languages**: English, Spanish, French, Dutch
- **Postal Code Systems**: Limited (many islands lack postal codes)
- **Currency Zone**: 
  - Eastern Caribbean Dollar (XCD) - shared by 8 countries
  - Individual currencies (Jamaican Dollar, Bahamian Dollar, etc.)
  - US Dollar (accepted in many tourist areas)
- **Special Features**:
  - Small island states with unique addressing challenges
  - Tourism-focused infrastructure
  - Mix of independent nations and territories (European/US dependencies in Europe section)

### South America / 南アメリカ (12 countries)

ブラジルを含む南部大陸。スペイン語・ポルトガル語圏。

**Southern continent including Brazil. Spanish and Portuguese-speaking regions.**

- **Primary Languages**: Spanish (9 countries), Portuguese (Brazil), Dutch (Suriname), English (Guyana)
- **Postal Code Systems**: 
  - Brazil: CEP (8-digit: 12345-678)
  - Argentina, Chile: 4-8 digit codes
  - Others: Variable or limited
- **Currency Zone**: Diverse (BRL, ARS, CLP, COP, PEN, etc.)
- **Special Features**:
  - Brazil's comprehensive CEP system
  - Chile's remote territories (Easter Island)
  - Andean countries with mountain addressing challenges
  - Amazon region with limited postal infrastructure

---

## 🏗️ Data Structure / データ構造

各国のデータファイルは以下の構造で統一されています：

**Each country's data file follows this unified structure:**

```
data/americas/
  ├── north_america/
  │   ├── US/                         # United States / アメリカ合衆国
  │   │   ├── US.yaml
  │   │   └── overseas/
  │   │       ├── PR.yaml             # Puerto Rico / プエルトリコ
  │   │       ├── VI.yaml             # US Virgin Islands / 米領バージン諸島
  │   │       ├── GU.yaml             # Guam / グアム
  │   │       ├── MP.yaml             # Northern Mariana Islands / 北マリアナ諸島
  │   │       ├── AS.yaml             # American Samoa / 米領サモア
  │   │       └── UM.yaml             # US Minor Outlying Islands / 米領小離島
  │   ├── CA/CA.yaml                  # Canada / カナダ
  │   └── MX/MX.yaml                  # Mexico / メキシコ
  │
  ├── central_america/
  │   ├── BZ/BZ.yaml                  # Belize / ベリーズ
  │   ├── CR/CR.yaml                  # Costa Rica / コスタリカ
  │   ├── SV/SV.yaml                  # El Salvador / エルサルバドル
  │   ├── GT/GT.yaml                  # Guatemala / グアテマラ
  │   ├── HN/HN.yaml                  # Honduras / ホンジュラス
  │   ├── NI/NI.yaml                  # Nicaragua / ニカラグア
  │   └── PA/PA.yaml                  # Panama / パナマ
  │
  ├── caribbean/
  │   ├── AG/AG.yaml                  # Antigua and Barbuda / アンティグア・バーブーダ
  │   ├── BB/BB.yaml                  # Barbados / バルバドス
  │   ├── BS/BS.yaml                  # The Bahamas / バハマ
  │   ├── CU/CU.yaml                  # Cuba / キューバ
  │   ├── DM/DM.yaml                  # Dominica / ドミニカ国
  │   ├── DO/DO.yaml                  # Dominican Republic / ドミニカ共和国
  │   ├── GD/GD.yaml                  # Grenada / グレナダ
  │   ├── HT/HT.yaml                  # Haiti / ハイチ
  │   ├── JM/JM.yaml                  # Jamaica / ジャマイカ
  │   ├── KN/KN.yaml                  # Saint Kitts and Nevis / セントクリストファー・ネイビス
  │   ├── LC/LC.yaml                  # Saint Lucia / セントルシア
  │   ├── VC/VC.yaml                  # Saint Vincent and the Grenadines / セントビンセント・グレナディーン
  │   └── TT/TT.yaml                  # Trinidad and Tobago / トリニダード・トバゴ
  │
  └── south_america/
      ├── AR/AR.yaml                  # Argentina / アルゼンチン
      ├── BO/BO.yaml                  # Bolivia / ボリビア
      ├── BR/BR.yaml                  # Brazil / ブラジル
      ├── CL/                         # Chile / チリ
      │   ├── CL.yaml
      │   └── overseas/
      │       ├── CL_EI.yaml          # Easter Island / イースター島
      │       └── CL_AA.yaml          # Juan Fernández Islands / フアン・フェルナンデス諸島
      ├── CO/CO.yaml                  # Colombia / コロンビア
      ├── EC/EC.yaml                  # Ecuador / エクアドル
      ├── GY/GY.yaml                  # Guyana / ガイアナ
      ├── PY/PY.yaml                  # Paraguay / パラグアイ
      ├── PE/PE.yaml                  # Peru / ペルー
      ├── SR/SR.yaml                  # Suriname / スリナム
      ├── UY/UY.yaml                  # Uruguay / ウルグアイ
      └── VE/VE.yaml                  # Venezuela / ベネズエラ
```

---

## 📈 Statistics / 統計情報

### Postal Code Coverage / 郵便番号カバレッジ

| System Type | Countries | Format Examples |
|-------------|-----------|-----------------|
| ZIP/ZIP+4 (US) | 7 | 12345, 12345-6789 (includes US territories) |
| Canadian Format | 1 | A1A 1A1 |
| CEP (Brazil) | 1 | 12345-678 |
| 5-digit numeric | 8 | 12345 |
| 4-digit numeric | 3 | 1234 |
| No postal code | 15 | N/A |

### Language Distribution / 言語分布

| Language | Countries | Percentage |
|----------|-----------|------------|
| Spanish | 20 | 57% |
| English | 15 | 43% |
| Portuguese | 1 | 3% |
| French | 1 | 3% |
| Dutch | 1 | 3% |

### Currency Zones / 通貨圏

| Currency | Countries | Code |
|----------|-----------|------|
| US Dollar | 4 (+ accepted widely) | USD |
| Eastern Caribbean Dollar | 8 | XCD |
| Individual currencies | 23 | Various |

### Tax Systems / 税制

| Tax Type | Countries | Rate Range |
|----------|-----------|------------|
| Sales Tax (State) | 1 (US) | 0-10% |
| VAT | 25 | 5-19% |
| GST | 1 (Canada) | 5% |
| Tax-free zones | 2 | 0% |

---

## ⚠️ Special Notes / 特記事項

### US ZIP Code System / 米国郵便番号システム

アメリカの郵便番号は世界で最も発達したシステムの一つです：

**The US postal system is one of the most advanced in the world:**

- **ZIP (Zone Improvement Plan)**: 5-digit code (e.g., 10001 for Manhattan)
- **ZIP+4**: Extended 9-digit code (e.g., 10001-1234) for precise delivery
- **Postal Territories**: Puerto Rico, Virgin Islands, Guam use US ZIP codes
- **Military**: APO/FPO/DPO codes for military addresses

### Canadian Postal Code Format / カナダ郵便番号形式

カナダ独自の英数字混合形式：

**Canada's unique alphanumeric format:**

- Format: **A1A 1A1** (letter-digit-letter space digit-letter-digit)
- Example: K1A 0B1 (Ottawa), M5H 2N2 (Toronto)
- Bilingual addressing (English/French)
- Forward Sortation Area (FSA): First 3 characters
- Local Delivery Unit (LDU): Last 3 characters

### Brazilian CEP System / ブラジルCEPシステム

ブラジルの包括的な郵便番号システム：

**Brazil's comprehensive postal code system:**

- Format: **12345-678** (5 digits - 3 digits)
- Covers all addresses nationwide
- CEP = Código de Endereçamento Postal
- Example: 01310-100 (São Paulo - Avenida Paulista)

### Caribbean Addressing Challenges / カリブ海の住所課題

島嶼国特有の課題：

**Unique challenges for island nations:**

- Many small islands lack formal street names
- PO Box systems are common
- Limited postal code implementation
- Tourism addresses often use resort/hotel names
- Hurricane-prone areas with changing infrastructure

### US Overseas Territories / 米国海外領土

米国の海外領土は独自の郵便システムを持ちながらUSPSに統合：

**US overseas territories have unique systems integrated into USPS:**

- **Puerto Rico (PR)**: Uses US ZIP codes (00600-00799, 00900-00999)
- **US Virgin Islands (VI)**: Uses US ZIP codes (00800-00899)
- **Guam (GU)**: Uses US ZIP codes (96910-96932)
- **Northern Mariana Islands (MP)**: Uses US ZIP codes (96950-96952)
- **American Samoa (AS)**: Uses US ZIP codes (96799)

### Dollarization / ドル化

複数の国が自国通貨の代わりに米ドルを採用：

**Several countries have adopted the US Dollar:**

- **Ecuador**: USD since 2000
- **El Salvador**: USD since 2001
- **Panama**: USD alongside Balboa (PAB, 1:1 pegged)
- **British Virgin Islands, Turks and Caicos, etc.**: Use USD (but these are in Europe section)

---

## 💻 Usage Examples / 使用例

### Example 1: Validate US ZIP Code / 米国郵便番号を検証

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const usData = yaml.load(
  fs.readFileSync('data/americas/north_america/US/US.yaml', 'utf8')
);

const zipRegex = new RegExp(usData.address_format.postal_code.regex);

console.log(zipRegex.test('10001')); // true - Basic ZIP
console.log(zipRegex.test('10001-1234')); // true - ZIP+4
console.log(zipRegex.test('123')); // false - Too short
console.log(zipRegex.test('ABCDE')); // false - Not numeric
```

### Example 2: Validate Canadian Postal Code / カナダ郵便番号を検証

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const canadaData = yaml.load(
  fs.readFileSync('data/americas/north_america/CA/CA.yaml', 'utf8')
);

const postalCodeRegex = new RegExp(canadaData.address_format.postal_code.regex);

console.log(postalCodeRegex.test('K1A 0B1')); // true - Valid format
console.log(postalCodeRegex.test('M5H 2N2')); // true - Valid format
console.log(postalCodeRegex.test('K1A0B1')); // May be true - Some systems allow no space
console.log(postalCodeRegex.test('123456')); // false - Must be alphanumeric
```

### Example 3: Format Brazilian Address with CEP / ブラジルのCEP住所をフォーマット

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const brazilData = yaml.load(
  fs.readFileSync('data/americas/south_america/BR/BR.yaml', 'utf8')
);

const address = {
  recipient: 'João Silva',
  street_address: 'Avenida Paulista, 1578',
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  province: 'SP',
  postal_code: '01310-200',
  country: 'Brasil'
};

const order = brazilData.address_format.order;
const formattedLines = order.map(field => address[field]).filter(Boolean);

console.log(formattedLines.join('\n'));
// João Silva
// Avenida Paulista, 1578
// Bela Vista
// São Paulo - SP
// 01310-200
// Brasil
```

### Example 4: Load Mexican State Data / メキシコの州データを読み込む

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const mexicoData = yaml.load(
  fs.readFileSync('data/americas/north_america/MX/MX.yaml', 'utf8')
);

console.log(mexicoData.name.en); // "Mexico"
console.log(mexicoData.name.local[0].value); // "México"
console.log(mexicoData.languages[0].name); // "Spanish"
console.log(mexicoData.address_format.postal_code.example); // e.g., "01000"
console.log(mexicoData.pos.currency.code); // "MXN"
console.log(mexicoData.pos.currency.symbol); // "$"
```

### Example 5: Handle Puerto Rico as US Territory / プエルトリコを米国領として扱う

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const prData = yaml.load(
  fs.readFileSync('data/americas/north_america/US/overseas/PR.yaml', 'utf8')
);

// Puerto Rico uses US ZIP codes in 006xx and 009xx ranges
console.log(prData.name.en); // "Puerto Rico"
console.log(prData.iso_codes.alpha2); // "PR"

// Validate PR ZIP code
const zipRegex = new RegExp(prData.address_format.postal_code.regex);
console.log(zipRegex.test('00901')); // true - San Juan
console.log(zipRegex.test('00601')); // true - Adjuntas
```

---

## 🌐 Country List / 国一覧

### North America / 北アメリカ (3)

| Code | Country | Postal Code | Currency | Tax |
|------|---------|-------------|----------|-----|
| CA | Canada | A1A 1A1 | CAD ($) | GST 5% + PST |
| MX | Mexico | 5-digit | MXN ($) | IVA 16% |
| US | United States | ZIP/ZIP+4 | USD ($) | Sales Tax 0-10% |

**US Overseas Territories:**

| Code | Territory | Postal Code | Currency |
|------|-----------|-------------|----------|
| PR | Puerto Rico | 00600-00999 | USD ($) |
| VI | US Virgin Islands | 00800-00899 | USD ($) |
| GU | Guam | 96910-96932 | USD ($) |
| MP | Northern Mariana Islands | 96950-96952 | USD ($) |
| AS | American Samoa | 96799 | USD ($) |
| UM | US Minor Outlying Islands | Various | USD ($) |

### Central America / 中央アメリカ (7)

| Code | Country | Postal Code | Currency | Tax |
|------|---------|-------------|----------|-----|
| BZ | Belize | None | BZD ($) | VAT 12.5% |
| CR | Costa Rica | 5-digit | CRC (₡) | IVA 13% |
| GT | Guatemala | 5-digit | GTQ (Q) | IVA 12% |
| HN | Honduras | 5-digit | HNL (L) | IVA 15% |
| NI | Nicaragua | 5-digit | NIO (C$) | IVA 15% |
| PA | Panama | None | USD/PAB (B/.) | ITBMS 7% |
| SV | El Salvador | 4-digit | USD ($) | IVA 13% |

### Caribbean / カリブ海 (13)

| Code | Country | Postal Code | Currency | Tax |
|------|---------|-------------|----------|-----|
| AG | Antigua and Barbuda | None | XCD ($) | VAT 15% |
| BB | Barbados | 5-digit | BBD ($) | VAT 17.5% |
| BS | The Bahamas | None | BSD ($) | VAT 12% |
| CU | Cuba | 5-digit | CUP/CUC | VAT 0% |
| DM | Dominica | None | XCD ($) | VAT 15% |
| DO | Dominican Republic | 5-digit | DOP ($) | ITBIS 18% |
| GD | Grenada | None | XCD ($) | VAT 15% |
| HT | Haiti | 4-digit | HTG (G) | VAT 10% |
| JM | Jamaica | None | JMD ($) | GCT 15% |
| KN | Saint Kitts and Nevis | None | XCD ($) | VAT 17% |
| LC | Saint Lucia | None | XCD ($) | VAT 15% |
| TT | Trinidad and Tobago | 6-digit | TTD ($) | VAT 12.5% |
| VC | St. Vincent & Grenadines | None | XCD ($) | VAT 16% |

### South America / 南アメリカ (12)

| Code | Country | Postal Code | Currency | Tax |
|------|---------|-------------|----------|-----|
| AR | Argentina | 4-8 digit | ARS ($) | IVA 21% |
| BO | Bolivia | 4-digit | BOB (Bs.) | IVA 13% |
| BR | Brazil | CEP 8-digit | BRL (R$) | ICMS 17-18% |
| CL | Chile | 7-digit | CLP ($) | IVA 19% |
| CO | Colombia | 6-digit | COP ($) | IVA 19% |
| EC | Ecuador | 6-digit | USD ($) | IVA 12% |
| GY | Guyana | None | GYD ($) | VAT 14% |
| PE | Peru | 5-digit | PEN (S/.) | IGV 18% |
| PY | Paraguay | 4-digit | PYG (₲) | IVA 10% |
| SR | Suriname | None | SRD ($) | VAT 10% |
| UY | Uruguay | 5-digit | UYU ($) | IVA 22% |
| VE | Venezuela | 4-digit | VES (Bs.) | IVA 16% |

---

## 📚 Additional Resources / 関連リソース

- [USPS Addressing Standards](https://pe.usps.com/text/pub28/welcome.htm) - US postal addressing
- [Canada Post Addressing Guidelines](https://www.canadapost-postescanada.ca/tools/pg/manual/PGaddress-e.asp)
- [Universal Postal Union](https://www.upu.int) - International postal standards
- [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html) - Country codes
- [World Address YAML Main Documentation](../../README.md) - Project overview
- [Schema Documentation](../../docs/schema/README.md) - Complete data schema

---

## 🤝 Contributing / 貢献

データの誤りや更新情報がありましたら、プルリクエストまたはIssueでお知らせください。

**If you find any errors or have updates, please submit a Pull Request or create an Issue.**

---

**Last Updated**: December 2024  
**Maintainer**: World Address YAML Project
  