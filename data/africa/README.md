# 🌍 Africa / アフリカ

[![Countries](https://img.shields.io/badge/Countries-54-green.svg)](.)
[![Regions](https://img.shields.io/badge/Regions-5-blue.svg)](.)
[![Data Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](.)

アフリカ大陸の住所形式データベース。54の国と地域の住所形式、郵便番号体系、言語、通貨、税制などの情報を網羅しています。

**English:** Comprehensive address format database for the African continent, covering 54 countries and regions with address formats, postal code systems, languages, currencies, and tax information.

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
| Northern Africa | 8 | 100% |
| Western Africa | 16 | 100% |
| Central Africa | 9 | 100% |
| Eastern Africa | 17 | 100% |
| Southern Africa | 5 | 100% |
| **Total** | **54** | **100%** |

### Key Features / 主要機能

- ✅ **Full Address Formats**: Complete address field ordering and validation rules
- 🌐 **Multi-language Support**: Local language names and field labels (Arabic, French, English, Portuguese, etc.)
- 📮 **Postal Code Systems**: Regex validation patterns and examples
- 💰 **POS Data**: Currency codes, symbols, tax rates, and receipt requirements
- 📍 **Geocoding**: Geographic coordinates for each country
- 🏢 **Administrative Divisions**: Province/state/governorate hierarchies

---

## 🗺️ Regional Classification / 地域分類

アフリカ大陸は国連の地理的区分に基づき5つの地域に分類されています。

**Africa is classified into 5 regions based on UN geographical divisions:**

### Northern Africa / 北アフリカ (8 countries)

サハラ砂漠以北、地中海沿岸地域。アラビア語圏が中心。

Countries along the Mediterranean coast and north of the Sahara Desert. Primarily Arabic-speaking region.

- **Primary Languages**: Arabic, Berber, French
- **Postal Code Systems**: Varied (5-digit numeric in most countries)
- **Currency Zone**: Mixed (Egyptian Pound, Algerian Dinar, Moroccan Dirham, Tunisian Dinar, etc.)
- **Special Features**: Right-to-left (RTL) script support for Arabic

### Western Africa / 西アフリカ (16 countries)

大西洋沿岸からサヘル地域。旧フランス領・英領が多く、ECOWAS経済圏を形成。

Atlantic coast to the Sahel region. Many former French and British colonies, forming the ECOWAS economic zone.

- **Primary Languages**: French, English, Portuguese, various local languages
- **Postal Code Systems**: Limited (many countries lack formal postal codes)
- **Currency Zone**: CFA Franc (West African CFA franc - XOF) for many countries
- **Special Features**: Diverse linguistic landscape, French administrative influence

### Central Africa / 中部アフリカ (9 countries)

赤道周辺の熱帯雨林地域。旧フランス領・ベルギー領が中心。

Equatorial rainforest region. Primarily former French and Belgian colonies.

- **Primary Languages**: French, Portuguese, local languages
- **Postal Code Systems**: Limited or non-existent in many countries
- **Currency Zone**: Central African CFA franc (XAF) for many countries
- **Special Features**: French administrative systems, mineral-rich regions

### Eastern Africa / 東アフリカ (17 countries)

インド洋沿岸から内陸の大湖地域。英語圏とフランス語圏が混在。

Indian Ocean coast to the Great Lakes region. Mix of English and French-speaking countries.

- **Primary Languages**: Swahili, English, French, Arabic, various local languages
- **Postal Code Systems**: Varied (some countries use 5-digit codes, others have none)
- **Currency Zone**: Diverse (Kenyan Shilling, Ethiopian Birr, Tanzanian Shilling, etc.)
- **Special Features**: Island nations (Mauritius, Seychelles, Comoros, Madagascar)

### Southern Africa / 南アフリカ (5 countries)

アフリカ大陸南端。英語・アフリカーンス語圏が中心。

Southern tip of Africa. Primarily English and Afrikaans-speaking region.

- **Primary Languages**: English, Afrikaans, various local languages
- **Postal Code Systems**: Well-developed (especially South Africa with 4-digit codes)
- **Currency Zone**: South African Rand (ZAR) widely used, also Botswana Pula, Namibian Dollar
- **Special Features**: Most developed postal infrastructure in Africa

---

## 🏗️ Data Structure / データ構造

各国のデータファイルは以下の構造で統一されています：

**Each country's data file follows this unified structure:**

```
data/africa/
  ├── northern_africa/
  │   ├── DZ/DZ.yaml          # Algeria / アルジェリア
  │   ├── EG/EG.yaml          # Egypt / エジプト
  │   ├── EH/EH.yaml          # Western Sahara / 西サハラ
  │   ├── LY/LY.yaml          # Libya / リビア
  │   ├── MA/MA.yaml          # Morocco / モロッコ
  │   ├── SD/SD.yaml          # Sudan / スーダン
  │   ├── SS/SS.yaml          # South Sudan / 南スーダン
  │   └── TN/TN.yaml          # Tunisia / チュニジア
  │
  ├── west_africa/
  │   ├── BF/BF.yaml          # Burkina Faso / ブルキナファソ
  │   ├── BJ/BJ.yaml          # Benin / ベナン
  │   ├── CI/CI.yaml          # Côte d'Ivoire / コートジボワール
  │   ├── CV/CV.yaml          # Cape Verde / カーボベルデ
  │   ├── GH/GH.yaml          # Ghana / ガーナ
  │   ├── GM/GM.yaml          # The Gambia / ガンビア
  │   ├── GN/GN.yaml          # Guinea / ギニア
  │   ├── GW/GW.yaml          # Guinea-Bissau / ギニアビサウ
  │   ├── LR/LR.yaml          # Liberia / リベリア
  │   ├── ML/ML.yaml          # Mali / マリ
  │   ├── MR/MR.yaml          # Mauritania / モーリタニア
  │   ├── NE/NE.yaml          # Niger / ニジェール
  │   ├── NG/NG.yaml          # Nigeria / ナイジェリア
  │   ├── SL/SL.yaml          # Sierra Leone / シエラレオネ
  │   ├── SN/SN.yaml          # Senegal / セネガル
  │   └── TG/TG.yaml          # Togo / トーゴ
  │
  ├── central_africa/
  │   ├── AO/AO.yaml          # Angola / アンゴラ
  │   ├── CD/CD.yaml          # Democratic Republic of the Congo / コンゴ民主共和国
  │   ├── CF/CF.yaml          # Central African Republic / 中央アフリカ共和国
  │   ├── CG/CG.yaml          # Republic of the Congo / コンゴ共和国
  │   ├── CM/CM.yaml          # Cameroon / カメルーン
  │   ├── GA/GA.yaml          # Gabon / ガボン
  │   ├── GQ/GQ.yaml          # Equatorial Guinea / 赤道ギニア
  │   ├── ST/ST.yaml          # São Tomé and Príncipe / サントメ・プリンシペ
  │   └── TD/TD.yaml          # Chad / チャド
  │
  ├── eastern_africa/
  │   ├── BI/BI.yaml          # Burundi / ブルンジ
  │   ├── DJ/DJ.yaml          # Djibouti / ジブチ
  │   ├── ER/ER.yaml          # Eritrea / エリトリア
  │   ├── ET/ET.yaml          # Ethiopia / エチオピア
  │   ├── KE/KE.yaml          # Kenya / ケニア
  │   ├── KM/KM.yaml          # Comoros / コモロ
  │   ├── MG/MG.yaml          # Madagascar / マダガスカル
  │   ├── MU/MU.yaml          # Mauritius / モーリシャス
  │   ├── MW/MW.yaml          # Malawi / マラウイ
  │   ├── MZ/MZ.yaml          # Mozambique / モザンビーク
  │   ├── RW/RW.yaml          # Rwanda / ルワンダ
  │   ├── SC/SC.yaml          # Seychelles / セーシェル
  │   ├── SO/SO.yaml          # Somalia / ソマリア
  │   ├── TZ/TZ.yaml          # Tanzania / タンザニア
  │   ├── UG/UG.yaml          # Uganda / ウガンダ
  │   ├── ZM/ZM.yaml          # Zambia / ザンビア
  │   └── ZW/ZW.yaml          # Zimbabwe / ジンバブエ
  │
  └── southern_africa/
      ├── BW/BW.yaml          # Botswana / ボツワナ
      ├── LS/LS.yaml          # Lesotho / レソト
      ├── NA/NA.yaml          # Namibia / ナミビア
      ├── SZ/SZ.yaml          # Eswatini / エスワティニ
      └── ZA/ZA.yaml          # South Africa / 南アフリカ
```

### Data Schema / データスキーマ

各YAMLファイルには以下の情報が含まれています：

**Each YAML file contains the following information:**

- **name**: 国名（英語・現地語）
- **iso_codes**: ISO 3166-1コード（alpha-2, alpha-3, numeric）
- **languages**: 使用言語、スクリプト、フィールドラベル
- **address_format**: 住所フォーマット、フィールド順序、必須項目、検証ルール
- **postal_code**: 郵便番号の正規表現、例、必須性
- **province/city**: 都市・州の階層構造、ローカライズ名
- **pos**: 通貨、税率、レシート要件
- **geo**: 地理座標（緯度・経度）

---

## 📈 Statistics / 統計情報

### Postal Code Coverage / 郵便番号カバレッジ

| Status | Countries | Percentage |
|--------|-----------|------------|
| Formal postal code system | 28 | 52% |
| No postal code system | 26 | 48% |

### Language Distribution / 言語分布

| Language | Countries | Primary Script |
|----------|-----------|----------------|
| French | 26 | Latin |
| English | 24 | Latin |
| Arabic | 9 | Arabic (RTL) |
| Portuguese | 6 | Latin |
| Swahili | 5 | Latin |

### Currency Zones / 通貨圏

| Currency | Countries | Code |
|----------|-----------|------|
| West African CFA Franc | 8 | XOF |
| Central African CFA Franc | 6 | XAF |
| Individual currencies | 40 | Various |

---

## ⚠️ Special Notes / 特記事項

### Right-to-Left (RTL) Support / 右横書き対応

北アフリカのアラビア語圏では、アラビア文字による右横書き（RTL）表記をサポートしています。

**Northern African Arabic-speaking countries support Right-to-Left (RTL) script for Arabic.**

- Egypt (EG), Algeria (DZ), Morocco (MA), Tunisia (TN), Libya (LY), Sudan (SD), Mauritania (MR), Djibouti (DJ), Somalia (SO)

### Postal Code Systems / 郵便番号システム

郵便番号制度のある国でも、実際の運用は都市部に限定されている場合があります。

**Even in countries with postal code systems, actual implementation may be limited to urban areas.**

### Former Colonial Influence / 旧植民地の影響

住所形式は旧宗主国の影響を強く受けています：

**Address formats are heavily influenced by former colonial powers:**

- **French influence**: State/Province → City → Street → Number order
- **British influence**: Number → Street → City → State order
- **Portuguese influence**: Similar to French system with local variations

### CFA Franc Zone / CFAフラン圏

西アフリカと中部アフリカの多くの国がCFAフランを使用しています。これらの国では通貨が統一されていますが、住所形式は各国独自です。

**Many West and Central African countries use the CFA Franc. While the currency is unified, address formats remain country-specific.**

### Island Nations / 島嶼国

東アフリカには複数の島嶼国があり、独自の住所体系を持っています：

**Eastern Africa includes several island nations with unique address systems:**

- **Mauritius (MU)**: Well-developed postal system with unique codes
- **Seychelles (SC)**: Island-based addressing
- **Comoros (KM)**: French-influenced format
- **Madagascar (MG)**: Large island with diverse regional systems
- **Cape Verde (CV)**: Portuguese-influenced island addressing

---

## 💻 Usage Examples / 使用例

### Example 1: Load Egypt Address Data / エジプトの住所データを読み込む

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

// Load Egypt data
const egyptData = yaml.load(
  fs.readFileSync('data/africa/northern_africa/EG/EG.yaml', 'utf8')
);

console.log(egyptData.name.en); // "Egypt"
console.log(egyptData.name.local[0].value); // "مصر" (Arabic)
console.log(egyptData.languages[0].direction); // "rtl"
console.log(egyptData.address_format.postal_code.regex); // Postal code pattern
console.log(egyptData.pos.currency.code); // "EGP"
console.log(egyptData.pos.currency.symbol); // "£" or "ج.م"
```

### Example 2: Validate South African Postal Code / 南アフリカの郵便番号を検証

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const southAfricaData = yaml.load(
  fs.readFileSync('data/africa/southern_africa/ZA/ZA.yaml', 'utf8')
);

const postalCodeRegex = new RegExp(
  southAfricaData.address_format.postal_code.regex
);

console.log(postalCodeRegex.test('0001')); // true - Valid 4-digit code
console.log(postalCodeRegex.test('12345')); // false - Too many digits
console.log(postalCodeRegex.test('ABC1')); // false - Contains letters
```

### Example 3: Display Field Labels in Local Language / 現地語でフィールドラベルを表示

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const moroccoData = yaml.load(
  fs.readFileSync('data/africa/northern_africa/MA/MA.yaml', 'utf8')
);

// Get Arabic field labels
const arabicLang = moroccoData.languages.find(lang => lang.code === 'ar');
console.log(arabicLang.field_labels);
// {
//   recipient: 'المستلم',
//   street_address: 'عنوان الشارع',
//   city: 'المدينة',
//   postal_code: 'الرمز البريدي',
//   ...
// }
```

### Example 4: Format Address for Display / 住所を表示用にフォーマット

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const nigeriaData = yaml.load(
  fs.readFileSync('data/africa/west_africa/NG/NG.yaml', 'utf8')
);

const address = {
  recipient: 'John Doe',
  street_address: '123 Victoria Island',
  city: 'Lagos',
  province: 'Lagos State',
  postal_code: '101001',
  country: 'Nigeria'
};

// Format according to Nigeria's address order
const order = nigeriaData.address_format.order;
const formattedLines = order.map(field => address[field]).filter(Boolean);

console.log(formattedLines.join('\n'));
// John Doe
// 123 Victoria Island
// Lagos
// Lagos State
// 101001
// Nigeria
```

---

## 🌐 Country List / 国一覧

### Northern Africa / 北アフリカ (8)

| Code | Country | Local Name | Capital | Postal Code | Currency |
|------|---------|------------|---------|-------------|----------|
| DZ | Algeria | الجزائر (al-Jazāʾir) | Algiers | 5-digit | DZD (د.ج) |
| EG | Egypt | مصر (Miṣr) | Cairo | 5-digit | EGP (£/ج.م) |
| EH | Western Sahara | الصحراء الغربية | — | None | MAD |
| LY | Libya | ليبيا (Lībiyā) | Tripoli | 5-digit | LYD (ل.د) |
| MA | Morocco | المغرب (al-Maġrib) | Rabat | 5-digit | MAD (د.م.) |
| SD | Sudan | السودان (as-Sūdān) | Khartoum | 5-digit | SDG (ج.س.) |
| SS | South Sudan | South Sudan | Juba | None | SSP (£) |
| TN | Tunisia | تونس (Tūnis) | Tunis | 4-digit | TND (د.ت) |

### Western Africa / 西アフリカ (16)

| Code | Country | Local Name | Capital | Postal Code | Currency |
|------|---------|------------|---------|-------------|----------|
| BF | Burkina Faso | Burkina Faso | Ouagadougou | None | XOF (CFA) |
| BJ | Benin | Bénin | Porto-Novo | None | XOF (CFA) |
| CI | Côte d'Ivoire | Côte d'Ivoire | Yamoussoukro | None | XOF (CFA) |
| CV | Cape Verde | Cabo Verde | Praia | 4-digit | CVE ($) |
| GH | Ghana | Ghana | Accra | Variable | GHS (₵) |
| GM | The Gambia | The Gambia | Banjul | None | GMD (D) |
| GN | Guinea | Guinée | Conakry | 3-digit | GNF (Fr) |
| GW | Guinea-Bissau | Guiné-Bissau | Bissau | 4-digit | XOF (CFA) |
| LR | Liberia | Liberia | Monrovia | 4-digit | LRD ($) |
| ML | Mali | Mali | Bamako | None | XOF (CFA) |
| MR | Mauritania | موريتانيا | Nouakchott | None | MRU (UM) |
| NE | Niger | Niger | Niamey | 4-digit | XOF (CFA) |
| NG | Nigeria | Nigeria | Abuja | 6-digit | NGN (₦) |
| SL | Sierra Leone | Sierra Leone | Freetown | None | SLL (Le) |
| SN | Senegal | Sénégal | Dakar | 5-digit | XOF (CFA) |
| TG | Togo | Togo | Lomé | None | XOF (CFA) |

### Central Africa / 中部アフリカ (9)

| Code | Country | Local Name | Capital | Postal Code | Currency |
|------|---------|------------|---------|-------------|----------|
| AO | Angola | Angola | Luanda | None | AOA (Kz) |
| CD | DR Congo | RD Congo | Kinshasa | None | CDF (FC) |
| CF | Central African Republic | République centrafricaine | Bangui | None | XAF (CFA) |
| CG | Republic of the Congo | République du Congo | Brazzaville | None | XAF (CFA) |
| CM | Cameroon | Cameroun | Yaoundé | None | XAF (CFA) |
| GA | Gabon | Gabon | Libreville | None | XAF (CFA) |
| GQ | Equatorial Guinea | Guinea Ecuatorial | Malabo | None | XAF (CFA) |
| ST | São Tomé and Príncipe | São Tomé e Príncipe | São Tomé | None | STN (Db) |
| TD | Chad | Tchad / تشاد | N'Djamena | None | XAF (CFA) |

### Eastern Africa / 東アフリカ (17)

| Code | Country | Local Name | Capital | Postal Code | Currency |
|------|---------|------------|---------|-------------|----------|
| BI | Burundi | Burundi | Gitega | None | BIF (Fr) |
| DJ | Djibouti | Djibouti / جيبوتي | Djibouti | None | DJF (Fdj) |
| ER | Eritrea | ኤርትራ (Ertra) | Asmara | None | ERN (Nfk) |
| ET | Ethiopia | ኢትዮጵያ (Ītyōṗṗyā) | Addis Ababa | 4-digit | ETB (Br) |
| KE | Kenya | Kenya | Nairobi | 5-digit | KES (Sh) |
| KM | Comoros | Comores / جزر القمر | Moroni | None | KMF (CF) |
| MG | Madagascar | Madagasikara | Antananarivo | 3-digit | MGA (Ar) |
| MU | Mauritius | Maurice | Port Louis | 5-digit | MUR (₨) |
| MW | Malawi | Malawi | Lilongwe | None | MWK (MK) |
| MZ | Mozambique | Moçambique | Maputo | 4-digit | MZN (MT) |
| RW | Rwanda | Rwanda | Kigali | None | RWF (Fr) |
| SC | Seychelles | Seychelles | Victoria | None | SCR (₨) |
| SO | Somalia | Soomaaliya / الصومال | Mogadishu | None | SOS (Sh) |
| TZ | Tanzania | Tanzania | Dodoma | 5-digit | TZS (Sh) |
| UG | Uganda | Uganda | Kampala | None | UGX (Sh) |
| ZM | Zambia | Zambia | Lusaka | 5-digit | ZMW (ZK) |
| ZW | Zimbabwe | Zimbabwe | Harare | None | ZWL ($) |

### Southern Africa / 南アフリカ (5)

| Code | Country | Local Name | Capital | Postal Code | Currency |
|------|---------|------------|---------|-------------|----------|
| BW | Botswana | Botswana | Gaborone | None | BWP (P) |
| LS | Lesotho | Lesotho | Maseru | 3-digit | LSL (L) |
| NA | Namibia | Namibia | Windhoek | 5-digit | NAD ($) |
| SZ | Eswatini | eSwatini | Mbabane | 4-letter | SZL (L) |
| ZA | South Africa | South Africa | Pretoria | 4-digit | ZAR (R) |

---

## 📚 Additional Resources / 関連リソース

- [Africa UN Regions](https://unstats.un.org/unsd/methodology/m49/) - UN Statistical Division classification
- [Universal Postal Union - Africa](https://www.upu.int/en/Universal-Postal-Union/Activities/Addressing-Solutions) - International postal addressing standards
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
