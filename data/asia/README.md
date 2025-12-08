# 🌏 Asia / アジア

[![Countries](https://img.shields.io/badge/Countries-51-green.svg)](.)
[![Regions](https://img.shields.io/badge/Regions-6-blue.svg)](.)
[![Data Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](.)

アジア大陸の住所形式データベース。51の国と地域の住所形式、郵便番号体系、言語、通貨、税制などの情報を網羅しています。

**English:** Comprehensive address format database for the Asian continent, covering 51 countries and regions with address formats, postal code systems, languages, currencies, and tax information.

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
| East Asia | 8 | 100% |
| Southeast Asia | 13 | 100% |
| South Asia | 10 | 100% |
| Central Asia | 5 | 100% |
| West Asia | 15 | 100% |
| Caucasus | 3 | 100% |
| **Total** | **51** | **100%** |

### Key Features / 主要機能

- ✅ **Multiple Writing Systems**: Support for Latin, CJK (Chinese, Japanese, Korean), Arabic, Devanagari, Thai, Cyrillic, etc.
- 🌐 **Complex Postal Systems**: From Japan's 7-digit format to countries with no postal codes
- 📮 **Address Hierarchies**: Province/Prefecture/State → City/District → Street/Block systems
- 💰 **Diverse POS Data**: Multiple currency zones, tax systems (VAT, GST, consumption tax)
- 📍 **Geographic Diversity**: From island nations to landlocked countries
- 🏛️ **Special Administrative Regions**: Hong Kong, Macao with unique address formats

---

## 🗺️ Regional Classification / 地域分類

アジア大陸は地理的・文化的特徴に基づき6つの地域に分類されています。

**Asia is classified into 6 regions based on geographical and cultural characteristics:**

### East Asia / 東アジア (8 countries/regions)

漢字文化圏。高度に発達した郵便番号システムを持つ地域。

**Sinosphere with highly developed postal code systems.**

- **Primary Scripts**: CJK (Chinese/Japanese/Korean characters), Hangul, Latin
- **Postal Code Systems**: Highly advanced (Japan: 7-digit, China: 6-digit, Korea: 5-digit)
- **Currency Zone**: CNY (China), JPY (Japan), KRW (Korea), HKD (Hong Kong), MOP (Macao), TWD (Taiwan)
- **Special Features**: 
  - Complex address hierarchies with multiple administrative levels
  - Special Administrative Regions (Hong Kong, Macao)
  - Multiple script support (Traditional/Simplified Chinese, Kanji/Hiragana/Katakana)

### Southeast Asia / 東南アジア (13 countries)

多様な文化・言語が混在。ASEANを形成。

**Diverse cultures and languages. Forms ASEAN economic community.**

- **Primary Scripts**: Latin, Thai, Lao, Khmer, Burmese, Arabic (Brunei, Malaysia, Indonesia)
- **Postal Code Systems**: Varied (5-6 digits in most countries, some regions lack formal systems)
- **Currency Zone**: Diverse (THB, VND, IDR, PHP, MYR, SGD, etc.)
- **Special Features**:
  - Island nations with unique addressing (Indonesia, Philippines)
  - Multilingual countries (Malaysia, Singapore with English, Malay, Chinese, Tamil)
  - Buddhist influence on administrative divisions

### South Asia / 南アジア (10 countries)

インド文化圏。デーヴァナーガリー文字やベンガル文字を使用。

**Indian cultural sphere. Uses Devanagari and Bengali scripts.**

- **Primary Scripts**: Devanagari, Bengali, Urdu, Sinhala, Tibetan, Latin
- **Postal Code Systems**: India's PIN code (6-digit), varied in other countries
- **Currency Zone**: INR (India), PKR (Pakistan), BDT (Bangladesh), NPR (Nepal), LKR (Sri Lanka)
- **Special Features**:
  - India's vast PIN code system covering 1.4 billion people
  - Right-to-left scripts (Urdu in Pakistan)
  - Himalayan kingdoms (Nepal, Bhutan)
  - Island nations (Maldives, Sri Lanka)

### Central Asia / 中央アジア (5 countries)

旧ソ連構成国。キリル文字とラテン文字を併用。

**Former Soviet republics. Use Cyrillic and Latin scripts.**

- **Primary Scripts**: Cyrillic, Latin (transition ongoing in some countries)
- **Postal Code Systems**: 6-digit codes inherited from Soviet postal system
- **Currency Zone**: KZT (Kazakhstan), UZS (Uzbekistan), KGS (Kyrgyzstan), TJS (Tajikistan), TMT (Turkmenistan)
- **Special Features**:
  - Landlocked nations
  - Soviet-era infrastructure still in use
  - Bilingual address systems

### West Asia / 西アジア (15 countries)

中東地域。アラビア語圏が中心。豊富な石油資源。

**Middle East region. Primarily Arabic-speaking. Rich in oil resources.**

- **Primary Scripts**: Arabic (RTL), Hebrew (RTL), Turkish (Latin)
- **Postal Code Systems**: Varied (well-developed in Israel, Turkey, UAE; less common in others)
- **Currency Zone**: SAR (Saudi Arabia), AED (UAE), ILS (Israel), TRY (Turkey), IRR (Iran)
- **Special Features**:
  - Right-to-left (RTL) script support crucial
  - GCC countries with modern postal systems
  - Oil-rich Gulf states with advanced infrastructure
  - Conflict zones affecting postal services (Syria, Yemen, Palestine)

### Caucasus / コーカサス (3 countries)

アジアとヨーロッパの境界地域。旧ソ連構成国。

**Border region between Asia and Europe. Former Soviet republics.**

- **Primary Scripts**: Armenian, Georgian, Cyrillic, Latin
- **Postal Code Systems**: 4-6 digit codes
- **Currency Zone**: AMD (Armenia), GEL (Georgia), AZN (Azerbaijan)
- **Special Features**:
  - Unique indigenous scripts (Armenian, Georgian)
  - Strategic location between Europe and Asia
  - Mountain terrain affecting postal infrastructure

---

## 🏗️ Data Structure / データ構造

各国のデータファイルは以下の構造で統一されています：

**Each country's data file follows this unified structure:**

```
data/asia/
  ├── east_asia/
  │   ├── CN/CN.yaml              # China / 中国
  │   ├── HK/HK.yaml              # Hong Kong / 香港（中国特別行政区）
  │   ├── MO/MO.yaml              # Macao / マカオ（中国特別行政区）
  │   ├── TW/TW.yaml              # Taiwan / 台湾（独自体系）
  │   ├── JP/JP.yaml              # Japan / 日本
  │   ├── KR/KR.yaml              # South Korea / 韓国
  │   ├── KP/KP.yaml              # North Korea / 北朝鮮
  │   └── MN/MN.yaml              # Mongolia / モンゴル
  │
  ├── southeast_asia/
  │   ├── BN/BN.yaml              # Brunei / ブルネイ
  │   ├── KH/KH.yaml              # Cambodia / カンボジア
  │   ├── ID/                     # Indonesia / インドネシア
  │   │   ├── ID.yaml
  │   │   └── regions/
  │   │       └── Papua.yaml      # West Papua / 西パプア（オセアニア寄り）
  │   ├── LA/LA.yaml              # Laos / ラオス
  │   ├── MY/MY.yaml              # Malaysia / マレーシア
  │   ├── MM/MM.yaml              # Myanmar / ミャンマー
  │   ├── PH/PH.yaml              # Philippines / フィリピン
  │   ├── SG/SG.yaml              # Singapore / シンガポール
  │   ├── TH/TH.yaml              # Thailand / タイ
  │   ├── TL/TL.yaml              # Timor-Leste / 東ティモール
  │   ├── VN/VN.yaml              # Vietnam / ベトナム
  │   ├── PCL/PCL.yaml            # Paracel Islands / 西沙諸島（係争地）
  │   └── SPRT/SPRT.yaml          # Spratly Islands / 南沙諸島（係争地）
  │
  ├── south_asia/
  │   ├── AF/AF.yaml              # Afghanistan / アフガニスタン
  │   ├── BD/BD.yaml              # Bangladesh / バングラデシュ
  │   ├── BT/BT.yaml              # Bhutan / ブータン
  │   ├── IN/                     # India / インド
  │   │   ├── IN.yaml
  │   │   └── regions/
  │   │       ├── Andaman_Nicobar.yaml  # Andaman and Nicobar Islands
  │   │       └── Lakshadweep.yaml      # Lakshadweep Islands
  │   ├── MV/MV.yaml              # Maldives / モルディブ
  │   ├── NP/NP.yaml              # Nepal / ネパール
  │   ├── PK/PK.yaml              # Pakistan / パキスタン
  │   └── LK/LK.yaml              # Sri Lanka / スリランカ
  │
  ├── central_asia/
  │   ├── KZ/KZ.yaml              # Kazakhstan / カザフスタン
  │   ├── KG/KG.yaml              # Kyrgyzstan / キルギス
  │   ├── TJ/TJ.yaml              # Tajikistan / タジキスタン
  │   ├── TM/TM.yaml              # Turkmenistan / トルクメニスタン
  │   └── UZ/UZ.yaml              # Uzbekistan / ウズベキスタン
  │
  ├── west_asia/
  │   ├── TR/TR.yaml              # Turkey / トルコ（ヨーロッパと跨る）
  │   ├── IR/IR.yaml              # Iran / イラン
  │   ├── IQ/IQ.yaml              # Iraq / イラク
  │   ├── IL/IL.yaml              # Israel / イスラエル
  │   ├── PS/PS.yaml              # Palestine / パレスチナ（部分承認地域）
  │   ├── JO/JO.yaml              # Jordan / ヨルダン
  │   ├── LB/LB.yaml              # Lebanon / レバノン
  │   ├── SY/SY.yaml              # Syria / シリア
  │   ├── SA/SA.yaml              # Saudi Arabia / サウジアラビア
  │   ├── AE/AE.yaml              # United Arab Emirates / アラブ首長国連邦
  │   ├── QA/QA.yaml              # Qatar / カタール
  │   ├── KW/KW.yaml              # Kuwait / クウェート
  │   ├── OM/OM.yaml              # Oman / オマーン
  │   ├── BH/BH.yaml              # Bahrain / バーレーン
  │   └── YE/YE.yaml              # Yemen / イエメン
  │
  └── caucasus/                   # Caucasus / コーカサス地方
      ├── AM/AM.yaml              # Armenia / アルメニア
      ├── AZ/AZ.yaml              # Azerbaijan / アゼルバイジャン
      └── GE/GE.yaml              # Georgia / ジョージア
```

---

## 📈 Statistics / 統計情報

### Postal Code Systems / 郵便番号システム

| Format | Countries | Examples |
|--------|-----------|----------|
| 7-digit (3-4) | 1 | Japan: 100-0001 |
| 6-digit | 8 | China: 100000, India: 110001 |
| 5-digit | 12 | Korea: 12345, Turkey: 34000 |
| 4-digit | 3 | Armenia, Georgia, Bhutan |
| No formal system | 15 | Yemen, Afghanistan, Laos, etc. |

### Script Diversity / 文字体系の多様性

| Script Family | Scripts | Countries |
|---------------|---------|-----------|
| CJK | Chinese (Simplified/Traditional), Kanji, Hangul | 8 |
| Arabic | Arabic, Persian, Urdu | 18 |
| Indic | Devanagari, Bengali, Tamil, Sinhala, Thai, Lao, Khmer, Burmese | 10 |
| Cyrillic | Russian-based Cyrillic | 6 |
| Unique | Armenian, Georgian, Hebrew | 3 |
| Latin | Primary or secondary in most countries | 40+ |

### Tax Systems / 税制システム

| Tax Type | Rate Range | Countries |
|----------|------------|-----------|
| Consumption Tax | 8-10% | Japan |
| VAT | 5-20% | China, India, UAE, Turkey, etc. |
| GST | 0-18% | India, Singapore, Malaysia |
| Sales Tax | Varied | Various |

---

## ⚠️ Special Notes / 特記事項

### CJK Address Format / CJK住所形式

東アジアでは、住所の順序が欧米とは逆になります：

**East Asian addresses follow a different order from Western addresses:**

```
Western: Number → Street → City → State → Country
CJK:     Country → State → City → Street → Number
```

Example (Japan):
```
〒100-0001
東京都千代田区千代田1-1
```

### Right-to-Left (RTL) Support / 右横書き対応

西アジア・南アジアのアラビア語圏・ヘブライ語圏では、右横書き（RTL）をサポート：

**West and South Asian Arabic/Hebrew regions support Right-to-Left (RTL):**

- Arabic: Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman, Yemen, Iraq, Syria, Jordan, Lebanon, Palestine, Iran (Persian), Pakistan (Urdu), Afghanistan
- Hebrew: Israel

### Special Administrative Regions / 特別行政区

**Hong Kong (HK)** and **Macao (MO)** maintain separate postal systems from mainland China:
- Different postal code formats
- Different currency (HKD, MOP vs CNY)
- Different languages (Traditional Chinese vs Simplified)
- Separate customs and immigration

### Disputed Territories / 係争地域

以下の地域は国際的に係争中：

**The following territories are internationally disputed:**

- **Taiwan (TW)**: Maintains independent postal system, uses TWD currency
- **Palestine (PS)**: Partial recognition, limited postal infrastructure
- **Paracel Islands (PCL)**: Disputed between China, Vietnam, Taiwan
- **Spratly Islands (SPRT)**: Disputed among China, Vietnam, Philippines, Malaysia, Taiwan, Brunei
- **Kashmir**: Disputed between India, Pakistan, China (included in respective country data)

### Island Nations Address Challenges / 島嶼国の住所課題

**Indonesia** and **Philippines** face unique challenges:
- Thousands of islands with varying postal infrastructure
- Some remote islands lack formal addressing
- Special handling for regional variations

---

## 💻 Usage Examples / 使用例

### Example 1: Load Japan Address Data / 日本の住所データを読み込む

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const japanData = yaml.load(
  fs.readFileSync('data/asia/east_asia/JP/JP.yaml', 'utf8')
);

console.log(japanData.name.en); // "Japan"
console.log(japanData.name.local[0].value); // "日本"
console.log(japanData.address_format.postal_code.regex); // "^[0-9]{3}-[0-9]{4}$"
console.log(japanData.address_format.postal_code.example); // "100-0001"
console.log(japanData.pos.currency.code); // "JPY"
console.log(japanData.pos.tax.rate.standard); // 0.10 (10%)
```

### Example 2: Validate Chinese Postal Code / 中国の郵便番号を検証

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const chinaData = yaml.load(
  fs.readFileSync('data/asia/east_asia/CN/CN.yaml', 'utf8')
);

const postalCodeRegex = new RegExp(
  chinaData.address_format.postal_code.regex
);

console.log(postalCodeRegex.test('100000')); // true - Beijing
console.log(postalCodeRegex.test('200000')); // true - Shanghai
console.log(postalCodeRegex.test('12345')); // false - Too short
console.log(postalCodeRegex.test('ABC123')); // false - Contains letters
```

### Example 3: Display Arabic Field Labels (UAE) / アラビア語でフィールドラベルを表示

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const uaeData = yaml.load(
  fs.readFileSync('data/asia/west_asia/AE/AE.yaml', 'utf8')
);

// Get Arabic field labels
const arabicLang = uaeData.languages.find(lang => lang.code === 'ar');
console.log(arabicLang.direction); // "rtl"
console.log(arabicLang.field_labels.city); // Arabic label for "city"
console.log(arabicLang.field_labels.postal_code); // Arabic label for "postal code"
```

### Example 4: Format Multi-level Address (India) / 階層型住所のフォーマット

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const indiaData = yaml.load(
  fs.readFileSync('data/asia/south_asia/IN/IN.yaml', 'utf8')
);

const address = {
  recipient: 'Raj Kumar',
  building: 'Building A',
  street_address: '123 MG Road',
  district: 'Connaught Place',
  city: 'New Delhi',
  province: 'Delhi',
  postal_code: '110001',
  country: 'India'
};

// Format according to India's address order
const order = indiaData.address_format.order;
const formattedLines = order.map(field => address[field]).filter(Boolean);

console.log(formattedLines.join('\n'));
// Raj Kumar
// Building A
// 123 MG Road
// Connaught Place
// New Delhi
// Delhi - 110001
// India
```

### Example 5: Handle Singapore's Unique 6-digit Postal Code

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const singaporeData = yaml.load(
  fs.readFileSync('data/asia/southeast_asia/SG/SG.yaml', 'utf8')
);

const postalCodeRegex = new RegExp(
  singaporeData.address_format.postal_code.regex
);

console.log(postalCodeRegex.test('018956')); // true - Raffles Place
console.log(postalCodeRegex.test('238859')); // true - Orchard Road
console.log(singaporeData.address_format.postal_code.required); // true
```

---

## 🌐 Country List / 国一覧

### East Asia / 東アジア (8)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| CN | China | 中国 | 6-digit | CNY (¥) | VAT 13% |
| HK | Hong Kong | 香港 | None | HKD ($) | No VAT |
| JP | Japan | 日本 | 7-digit (3-4) | JPY (¥) | Consumption 10% |
| KP | North Korea | 조선 | Variable | KPW (₩) | N/A |
| KR | South Korea | 대한민국 | 5-digit | KRW (₩) | VAT 10% |
| MN | Mongolia | Монгол Улс | 5-digit | MNT (₮) | VAT 10% |
| MO | Macao | 澳門 | None | MOP (MOP$) | No VAT |
| TW | Taiwan | 台灣 | 5-digit | TWD (NT$) | VAT 5% |

### Southeast Asia / 東南アジア (13)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| BN | Brunei | Brunei | 6-letter | BND ($) | No VAT |
| ID | Indonesia | Indonesia | 5-digit | IDR (Rp) | VAT 11% |
| KH | Cambodia | កម្ពុជា | 5-digit | KHR (៛) | VAT 10% |
| LA | Laos | ລາວ | 5-digit | LAK (₭) | VAT 10% |
| MM | Myanmar | မြန်မာ | 5-digit | MMK (K) | VAT 5% |
| MY | Malaysia | Malaysia | 5-digit | MYR (RM) | GST 6% |
| PH | Philippines | Pilipinas | 4-digit | PHP (₱) | VAT 12% |
| SG | Singapore | Singapore | 6-digit | SGD ($) | GST 8% |
| TH | Thailand | ไทย | 5-digit | THB (฿) | VAT 7% |
| TL | Timor-Leste | Timor-Leste | None | USD ($) | VAT 2.5% |
| VN | Vietnam | Việt Nam | 6-digit | VND (₫) | VAT 10% |

### South Asia / 南アジア (10)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| AF | Afghanistan | افغانستان | 4-digit | AFN (؋) | VAT 10% |
| BD | Bangladesh | বাংলাদেশ | 4-digit | BDT (৳) | VAT 15% |
| BT | Bhutan | འབྲུག | 5-digit | BTN (Nu.) | VAT 5% |
| IN | India | भारत | 6-digit (PIN) | INR (₹) | GST 18% |
| LK | Sri Lanka | ශ්‍රී ලංකා | 5-digit | LKR (Rs) | VAT 15% |
| MV | Maldives | ދިވެހިރާއްޖެ | 5-digit | MVR (Rf) | GST 6% |
| NP | Nepal | नेपाल | 5-digit | NPR (Rs) | VAT 13% |
| PK | Pakistan | پاکستان | 5-digit | PKR (Rs) | VAT 17% |

### Central Asia / 中央アジア (5)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| KZ | Kazakhstan | Қазақстан | 6-digit | KZT (₸) | VAT 12% |
| KG | Kyrgyzstan | Кыргызстан | 6-digit | KGS (с) | VAT 12% |
| TJ | Tajikistan | Тоҷикистон | 6-digit | TJS (ЅМ) | VAT 18% |
| TM | Turkmenistan | Türkmenistan | 6-digit | TMT (m) | VAT 15% |
| UZ | Uzbekistan | Oʻzbekiston | 6-digit | UZS (сўм) | VAT 12% |

### West Asia / 西アジア (15)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| AE | UAE | الإمارات | 5-digit | AED (د.إ) | VAT 5% |
| BH | Bahrain | البحرين | 3-4 digit | BHD (د.ب) | VAT 10% |
| IL | Israel | ישראל | 7-digit | ILS (₪) | VAT 17% |
| IQ | Iraq | العراق | 5-digit | IQD (ع.د) | VAT 0% |
| IR | Iran | ایران | 10-digit | IRR (﷼) | VAT 9% |
| JO | Jordan | الأردن | 5-digit | JOD (د.ا) | VAT 16% |
| KW | Kuwait | الكويت | 5-digit | KWD (د.ك) | No VAT |
| LB | Lebanon | لبنان | 8-digit | LBP (ل.ل) | VAT 11% |
| OM | Oman | عُمان | 3-digit | OMR (ر.ع.) | VAT 5% |
| PS | Palestine | فلسطين | None | ILS/JOD | VAT 16% |
| QA | Qatar | قطر | None | QAR (ر.ق) | No VAT |
| SA | Saudi Arabia | السعودية | 5-digit | SAR (ر.س) | VAT 15% |
| SY | Syria | سوريا | None | SYP (£S) | VAT 0% |
| TR | Turkey | Türkiye | 5-digit | TRY (₺) | VAT 18% |
| YE | Yemen | اليمن | None | YER (﷼) | VAT 5% |

### Caucasus / コーカサス (3)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| AM | Armenia | Հայաստան | 4-digit | AMD (֏) | VAT 20% |
| AZ | Azerbaijan | Azərbaycan | 4-digit | AZN (₼) | VAT 18% |
| GE | Georgia | საქართველო | 4-digit | GEL (₾) | VAT 18% |

---

## 📚 Additional Resources / 関連リソース

- [Universal Postal Union - Asia Pacific](https://www.upu.int) - International postal standards
- [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html) - Country codes
- [Unicode CLDR](http://cldr.unicode.org/) - Locale data for address formatting
- [World Address YAML Main Documentation](../../README.md) - Project overview
- [Schema Documentation](../../docs/schema/README.md) - Complete data schema

---

## 🤝 Contributing / 貢献

データの誤りや更新情報がありましたら、プルリクエストまたはIssueでお知らせください。

**If you find any errors or have updates, please submit a Pull Request or create an Issue.**

---

**Last Updated**: December 2024  
**Maintainer**: World Address YAML Project 