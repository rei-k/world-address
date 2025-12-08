# 🇪🇺 Europe / ヨーロッパ

[![Countries](https://img.shields.io/badge/Countries-48-green.svg)](.)
[![Regions](https://img.shields.io/badge/Regions-6-blue.svg)](.)
[![Data Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](.)

ヨーロッパ大陸の住所形式データベース。48の国と地域の住所形式、郵便番号体系、言語、通貨、税制などの情報を網羅しています。

**English:** Comprehensive address format database for the European continent, covering 48 countries and regions with address formats, postal code systems, languages, currencies, and tax information.

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
| Northern Europe | 10 | 100% |
| Western Europe | 9 | 100% |
| Southern Europe | 10 | 100% |
| Eastern Europe | 10 | 100% |
| Southeastern Europe | 6 | 100% |
| Caucasus | 3 | 100% |
| **Total** | **48** | **100%** |

### Key Features / 主要機能

- ✅ **Advanced Postal Systems**: Alphanumeric UK postcodes, German 5-digit system, French cedex
- 🌐 **Multi-language Support**: Latin, Cyrillic, Greek scripts; 40+ languages
- 📮 **Diverse Postal Formats**: From simple 4-digit codes to complex alphanumeric systems
- 💰 **Eurozone Integration**: 20 countries using EUR, plus diverse local currencies
- 📍 **Geocoding**: Coordinates for all countries and territories
- 🏛️ **EU & EEA**: European Union members, Schengen Area, and EFTA countries
- 🇬🇧 **Overseas Territories**: British Crown Dependencies and overseas territories
- 🇫🇷 **French Territories**: Overseas departments and regions worldwide

---

## 🗺️ Regional Classification / 地域分類

ヨーロッパは地理的・文化的特徴に基づき6つの地域に分類されています。

**Europe is classified into 6 regions based on geographical and cultural characteristics:**

### Northern Europe / 北ヨーロッパ (10 countries)

スカンディナビア半島、バルト三国、イギリス諸島を含む地域。

**Scandinavia, Baltic states, and British Isles.**

- **Primary Languages**: English, Swedish, Norwegian, Danish, Finnish, Icelandic, Estonian, Latvian, Lithuanian, Irish
- **Postal Code Systems**: 
  - UK: Alphanumeric (SW1A 2AA)
  - Nordic countries: 5-digit (Sweden, Norway, Denmark), 7-digit Finland (FI-00100)
  - Baltic states: 5-digit
  - Ireland: Eircode (7-character alphanumeric)
- **Currency Zone**: EUR (most countries), GBP (UK), SEK (Sweden), NOK (Norway), DKK (Denmark), ISK (Iceland)
- **Special Features**:
  - UK's complex postcode system covering Crown Dependencies
  - Nordic Council integration
  - British overseas territories across all continents
  - Denmark's autonomous territories (Faroe Islands, Greenland)

### Western Europe / 西ヨーロッパ (9 countries)

ドイツ語圏、フランス語圏、ベネルクス諸国を含む経済的中心地。

**German-speaking, French-speaking, and Benelux countries - economic heart of Europe.**

- **Primary Languages**: German, French, Dutch, Luxembourgish, Romansh
- **Postal Code Systems**: 
  - Germany: 5-digit (10115)
  - France: 5-digit (75001) + CEDEX system
  - Netherlands: 4-digit + 2-letter (1012 AB)
  - Belgium: 4-digit
  - Switzerland: 4-digit
  - Austria: 4-digit
- **Currency Zone**: EUR (except Switzerland: CHF, Liechtenstein: CHF)
- **Special Features**:
  - France's extensive overseas territories (départements d'outre-mer)
  - Netherlands' Caribbean territories
  - Multi-lingual countries (Switzerland: 4 official languages, Belgium: 3)
  - Micro-states (Monaco, Liechtenstein, Luxembourg)

### Southern Europe / 南ヨーロッパ (10 countries)

地中海沿岸、イベリア半島、イタリア半島、バルカン半島南部。

**Mediterranean coast, Iberian Peninsula, Italian Peninsula, and southern Balkans.**

- **Primary Languages**: Spanish, Italian, Portuguese, Greek, Catalan, Basque, Galician
- **Postal Code Systems**: 
  - Spain: 5-digit (28001)
  - Italy: 5-digit CAP (00184)
  - Portugal: 7-digit (1000-001)
  - Greece: 5-digit (10431)
  - Cyprus: 4-digit
- **Currency Zone**: EUR (except Vatican: EUR)
- **Special Features**:
  - Spain's autonomous regions (Canary Islands, Ceuta & Melilla)
  - Portugal's Atlantic islands (Azores, Madeira)
  - Micro-states (Vatican City, San Marino, Andorra, Malta)
  - Greece's island territories
  - Cyprus's complex political situation

### Eastern Europe / 東ヨーロッパ (10 countries)

旧ソ連圏・旧東欧圏。キリル文字使用国を含む。

**Former Soviet and Eastern Bloc countries. Includes Cyrillic script users.**

- **Primary Languages**: Russian, Polish, Ukrainian, Czech, Slovak, Hungarian, Romanian, Bulgarian, Belarusian, Moldovan
- **Postal Code Systems**: 
  - Russia: 6-digit (101000)
  - Poland: 5-digit with hyphen (00-001)
  - Ukraine: 5-digit (01001)
  - Czech Republic: 5-digit with space (100 00)
  - Hungary: 4-digit (1011)
  - Others: 4-6 digit systems
- **Currency Zone**: Diverse (PLN, CZK, HUF, RON, BGN, UAH, BYN, RUB, MDL)
- **Special Features**:
  - Cyrillic and Latin script duality
  - EU members and candidate countries
  - Russia spans Europe and Asia
  - Moldova's Transnistria disputed region
  - Russia's federal subjects (Chechnya, Dagestan)

### Southeastern Europe / 南東ヨーロッパ (6 countries)

バルカン半島。旧ユーゴスラビア諸国を含む。

**Balkans. Former Yugoslav states.**

- **Primary Languages**: Serbian, Croatian, Bosnian, Albanian, Macedonian, Montenegrin, Slovenian
- **Postal Code Systems**: 
  - Serbia: 5-6 digit (11000)
  - Croatia: 5-digit (10000)
  - Bosnia: 5-digit (71000)
  - Albania: 4-digit (1001)
  - North Macedonia: 4-digit (1000)
  - Kosovo: 5-digit (10000) - uses XK code
- **Currency Zone**: EUR (Slovenia, Montenegro, Kosovo), local currencies (others)
- **Special Features**:
  - Former Yugoslav republics (except Slovenia in Southern Europe)
  - Kosovo's partial recognition (ISO code XK)
  - Complex multi-ethnic regions
  - EU candidates (Serbia, Albania, Bosnia & Herzegovina, North Macedonia, Montenegro)

### Caucasus / コーカサス (3 countries)

ヨーロッパとアジアの境界地域。独自の文字体系を持つ。

**Border region between Europe and Asia. Unique indigenous scripts.**

- **Primary Languages**: Armenian (unique script), Georgian (unique script), Azerbaijani (Latin)
- **Postal Code Systems**: 
  - Armenia: 4-digit (0010)
  - Georgia: 4-digit (0108)
  - Azerbaijan: 4-digit (AZ1000)
- **Currency Zone**: AMD (Armenia), GEL (Georgia), AZN (Azerbaijan)
- **Special Features**:
  - Ancient indigenous scripts (Armenian alphabet, Georgian alphabet)
  - Former Soviet republics
  - Mountain terrain affecting postal infrastructure
  - Nagorno-Karabakh disputed region

---

## 🏗️ Data Structure / データ構造

各国のデータファイルは以下の構造で統一されています：

**Each country's data file follows this unified structure:**

```
data/europe/
  ├── northern_europe/
  │   ├── DK/                         # Denmark / デンマーク
  │   │   ├── DK.yaml
  │   │   └── overseas/
  │   │       ├── FO.yaml             # Faroe Islands / フェロー諸島
  │   │       └── GL.yaml             # Greenland / グリーンランド
  │   ├── GB/                         # United Kingdom / イギリス
  │   │   ├── GB.yaml
  │   │   ├── crown_dependencies/     # Crown Dependencies / 王室属領
  │   │   │   ├── GG.yaml             # Guernsey / ガーンジー
  │   │   │   ├── JE.yaml             # Jersey / ジャージー
  │   │   │   └── IM.yaml             # Isle of Man / マン島
  │   │   └── overseas/               # Overseas Territories / 海外領土
  │   │       ├── AI.yaml             # Anguilla / アンギラ
  │   │       ├── BM.yaml             # Bermuda / バミューダ
  │   │       ├── FK.yaml             # Falkland Islands / フォークランド諸島
  │   │       ├── GI.yaml             # Gibraltar / ジブラルタル
  │   │       ├── GS.yaml             # South Georgia / サウスジョージア
  │   │       ├── IO.yaml             # British Indian Ocean Territory / 英領インド洋地域
  │   │       ├── KY.yaml             # Cayman Islands / ケイマン諸島
  │   │       ├── MS.yaml             # Montserrat / モントセラト
  │   │       ├── PN.yaml             # Pitcairn Islands / ピトケアン諸島
  │   │       ├── SH.yaml             # Saint Helena / セントヘレナ
  │   │       ├── TC.yaml             # Turks and Caicos Islands / タークス・カイコス諸島
  │   │       ├── VG.yaml             # British Virgin Islands / 英領バージン諸島
  │   │       └── SBA.yaml            # Akrotiri and Dhekelia / アクロティリおよびデケリア
  │   ├── NO/                         # Norway / ノルウェー
  │   │   ├── NO.yaml
  │   │   └── overseas/
  │   │       ├── BV.yaml             # Bouvet Island / ブーベ島
  │   │       └── SJ.yaml             # Svalbard and Jan Mayen / スヴァールバル・ヤンマイエン
  │   ├── SE/SE.yaml                  # Sweden / スウェーデン
  │   ├── FI/FI.yaml                  # Finland / フィンランド
  │   ├── IS/IS.yaml                  # Iceland / アイスランド
  │   ├── IE/IE.yaml                  # Ireland / アイルランド
  │   ├── EE/EE.yaml                  # Estonia / エストニア
  │   ├── LV/LV.yaml                  # Latvia / ラトビア
  │   └── LT/LT.yaml                  # Lithuania / リトアニア
  │
  ├── western_europe/
  │   ├── FR/                         # France / フランス
  │   │   ├── FR.yaml
  │   │   └── overseas/               # Overseas Departments & Territories
  │   │       ├── GF.yaml             # French Guiana / 仏領ギアナ
  │   │       ├── GP.yaml             # Guadeloupe / グアドループ
  │   │       ├── MQ.yaml             # Martinique / マルティニーク
  │   │       ├── RE.yaml             # Réunion / レユニオン
  │   │       ├── YT.yaml             # Mayotte / マヨット
  │   │       ├── PM.yaml             # Saint Pierre and Miquelon / サンピエール・ミクロン
  │   │       ├── WF.yaml             # Wallis and Futuna / ワリス・フツナ
  │   │       ├── PF.yaml             # French Polynesia / 仏領ポリネシア
  │   │       ├── NC.yaml             # New Caledonia / ニューカレドニア
  │   │       ├── MF.yaml             # Saint Martin / サン・マルタン
  │   │       └── TF.yaml             # French Southern and Antarctic Lands / 仏領南方・南極地域
  │   ├── NL/                         # Netherlands / オランダ
  │   │   ├── NL.yaml
  │   │   └── overseas/
  │   │       ├── AW.yaml             # Aruba / アルバ
  │   │       ├── CW.yaml             # Curaçao / キュラソー
  │   │       ├── SX.yaml             # Sint Maarten / シント・マールテン
  │   │       ├── BQ-BO.yaml          # Bonaire / ボネール
  │   │       ├── BQ-SA.yaml          # Saba / サバ
  │   │       └── BQ-SE.yaml          # Sint Eustatius / シント・ユースタティウス
  │   ├── DE/DE.yaml                  # Germany / ドイツ
  │   ├── AT/AT.yaml                  # Austria / オーストリア
  │   ├── CH/CH.yaml                  # Switzerland / スイス
  │   ├── BE/BE.yaml                  # Belgium / ベルギー
  │   ├── LU/LU.yaml                  # Luxembourg / ルクセンブルク
  │   ├── LI/LI.yaml                  # Liechtenstein / リヒテンシュタイン
  │   └── MC/MC.yaml                  # Monaco / モナコ
  │
  ├── southern_europe/
  │   ├── ES/                         # Spain / スペイン
  │   │   ├── ES.yaml
  │   │   └── regions/
  │   │       ├── Canary_Islands.yaml # Canary Islands / カナリア諸島
  │   │       └── Ceuta_Melilla.yaml  # Ceuta and Melilla / セウタ・メリリャ
  │   ├── PT/                         # Portugal / ポルトガル
  │   │   ├── PT.yaml
  │   │   └── regions/
  │   │       ├── Azores.yaml         # Azores / アゾレス諸島
  │   │       ├── Madeira.yaml        # Madeira / マデイラ諸島
  │   │       └── Porto_Santo.yaml    # Porto Santo / ポルト・サント
  │   ├── IT/IT.yaml                  # Italy / イタリア
  │   ├── GR/GR.yaml                  # Greece / ギリシャ
  │   ├── CY/CY.yaml                  # Cyprus / キプロス
  │   ├── MT/MT.yaml                  # Malta / マルタ
  │   ├── SI/SI.yaml                  # Slovenia / スロベニア
  │   ├── AD/AD.yaml                  # Andorra / アンドラ
  │   ├── SM/SM.yaml                  # San Marino / サンマリノ
  │   └── VA/VA.yaml                  # Vatican City / バチカン市国
  │
  ├── eastern_europe/
  │   ├── RU/                         # Russia / ロシア
  │   │   ├── RU.yaml
  │   │   └── regions/
  │   │       ├── Chechnya.yaml       # Chechnya / チェチェン
  │   │       └── Dagestan.yaml       # Dagestan / ダゲスタン
  │   ├── PL/PL.yaml                  # Poland / ポーランド
  │   ├── CZ/CZ.yaml                  # Czech Republic / チェコ
  │   ├── SK/SK.yaml                  # Slovakia / スロバキア
  │   ├── HU/HU.yaml                  # Hungary / ハンガリー
  │   ├── RO/RO.yaml                  # Romania / ルーマニア
  │   ├── BG/BG.yaml                  # Bulgaria / ブルガリア
  │   ├── UA/UA.yaml                  # Ukraine / ウクライナ
  │   ├── BY/BY.yaml                  # Belarus / ベラルーシ
  │   └── MD/                         # Moldova / モルドバ
  │       ├── MD.yaml
  │       └── subregions/
  │           └── PMR.yaml            # Transnistria / 沿ドニエストル
  │
  ├── southeastern_europe/
  │   ├── RS/RS.yaml                  # Serbia / セルビア
  │   ├── HR/HR.yaml                  # Croatia / クロアチア
  │   ├── BA/BA.yaml                  # Bosnia and Herzegovina / ボスニア・ヘルツェゴビナ
  │   ├── ME/ME.yaml                  # Montenegro / モンテネグロ
  │   ├── MK/MK.yaml                  # North Macedonia / 北マケドニア
  │   ├── AL/AL.yaml                  # Albania / アルバニア
  │   └── subregions/
  │       ├── XK.yaml                 # Kosovo / コソボ
  │       └── North_Kosovo.yaml       # North Kosovo / 北コソボ
  │
  └── caucasus/
      ├── AM/AM.yaml                  # Armenia / アルメニア
      ├── AZ/AZ.yaml                  # Azerbaijan / アゼルバイジャン
      └── GE/GE.yaml                  # Georgia / ジョージア
```

---

## 📈 Statistics / 統計情報

### Postal Code Coverage / 郵便番号カバレッジ

| System Type | Countries | Format Examples |
|-------------|-----------|-----------------|
| Alphanumeric (UK) | 1 | SW1A 2AA, M1 1AE, EH1 1YZ |
| 5-digit numeric | 15 | 10115 (DE), 75001 (FR), 28001 (ES), 00184 (IT) |
| 4-digit numeric | 13 | 1011 (AT), 1000 (BE), 8000 (CH), 1001 (AL) |
| 5-digit hyphenated | 3 | 00-001 (PL), 100 00 (CZ), 010 01 (SK) |
| 6-digit numeric | 4 | 101000 (RU), 01001 (UA), 220000 (BY) |
| 7-digit (Finland) | 1 | FI-00100 |
| 7-digit (Portugal) | 1 | 1000-001 |
| 4+2 alphanumeric (NL) | 1 | 1012 AB |
| Eircode (Ireland) | 1 | A65 F4E2 |
| No postal code | 3 | Monaco, San Marino, Vatican City |

### Language Distribution / 言語分布

| Language Family | Primary Languages | Countries |
|----------------|------------------|-----------|
| Romance | Spanish, Italian, French, Portuguese, Romanian | 10 |
| Germanic | German, English, Dutch, Swedish, Norwegian, Danish | 10 |
| Slavic | Russian, Polish, Czech, Slovak, Ukrainian, Bulgarian, Serbian, Croatian | 15 |
| Celtic | Irish, Welsh, Scottish Gaelic | 2 |
| Uralic | Finnish, Hungarian, Estonian | 3 |
| Baltic | Latvian, Lithuanian | 2 |
| Greek | Greek | 1 |
| Albanian | Albanian | 1 |
| Unique Scripts | Armenian, Georgian | 2 |

### Currency Zones / 通貨圏

| Currency | Countries | Code | Symbol |
|----------|-----------|------|--------|
| Euro | 20 | EUR | € |
| British Pound | 1 | GBP | £ |
| Swiss Franc | 2 | CHF | Fr. |
| Swedish Krona | 1 | SEK | kr |
| Norwegian Krone | 1 | NOK | kr |
| Danish Krone | 1 | DKK | kr |
| Icelandic Króna | 1 | ISK | kr |
| Polish Złoty | 1 | PLN | zł |
| Czech Koruna | 1 | CZK | Kč |
| Hungarian Forint | 1 | HUF | Ft |
| Romanian Leu | 1 | RON | lei |
| Bulgarian Lev | 1 | BGN | лв |
| Ukrainian Hryvnia | 1 | UAH | ₴ |
| Russian Ruble | 1 | RUB | ₽ |
| Others | 7 | Various | Various |

### Tax Systems / 税制

| Tax Type | Rate Range | Countries |
|----------|------------|-----------|
| VAT (Standard EU) | 17-27% | 27 EU countries |
| VAT (Non-EU Europe) | 5-25% | 21 non-EU countries |
| No VAT | 0% | 0 (all countries have some form of taxation) |

### EU & EEA Membership / EU・EEA加盟状況

| Status | Countries | Count |
|--------|-----------|-------|
| EU Member States | AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE | 27 |
| EFTA (non-EU) | IS, LI, NO, CH | 4 |
| EU Candidates | AL, BA, ME, MK, RS, TR, UA, MD | 8 |
| Other | 9 | Various |

---

## ⚠️ Special Notes / 特記事項

### UK Postcode System / イギリス郵便番号システム

イギリスの郵便番号は世界で最も複雑なシステムの一つです：

**The UK postal system is one of the most complex in the world:**

- **Format**: Alphanumeric system (e.g., SW1A 2AA, M1 1AE, EH1 1YZ)
- **Structure**: 
  - Outward code (2-4 characters): Area and district
  - Inward code (3 characters): Sector and unit
- **Coverage**: England, Scotland, Wales, Northern Ireland
- **Crown Dependencies**: Jersey, Guernsey, Isle of Man have own systems
- **Overseas Territories**: Various systems (Gibraltar uses GX11 1AA format)

### Eurozone Integration / ユーロ圏統合

20カ国が共通通貨ユーロを使用：

**20 countries use the common Euro currency:**

- **EUR Symbol**: € (placed before or after amount, varies by country)
- **Decimal**: 2 places
- **Adopted**: 1999 (electronic), 2002 (physical)
- **Non-Euro EU**: Denmark, Sweden, Poland, Czech Republic, Hungary, Romania, Bulgaria
- **Euro outside EU**: Monaco, San Marino, Vatican City, Andorra (de facto), Montenegro, Kosovo

### French Overseas Territories / フランス海外領土

フランスの海外県・海外準県・海外領土：

**France's overseas departments, collectivities, and territories:**

- **Overseas Departments (DOM)**: Guadeloupe, Martinique, French Guiana, Réunion, Mayotte - use EUR
- **Overseas Collectivities (COM)**: Saint Pierre and Miquelon, Saint Martin, Wallis and Futuna
- **Overseas Countries (POM)**: French Polynesia, New Caledonia - use CFP franc (XPF)
- **Special**: French Southern and Antarctic Lands (no permanent population)

### Dutch Caribbean Territories / オランダ領カリブ海諸島

オランダ王国の構成国と特別自治体：

**Constituent countries and special municipalities of the Kingdom of the Netherlands:**

- **Constituent Countries**: Aruba (AWG), Curaçao (ANG), Sint Maarten (ANG)
- **Caribbean Netherlands**: Bonaire, Sint Eustatius, Saba (use USD, postal codes with BQ prefix)

### Schengen Area / シェンゲン協定圏

パスポートフリーの国境移動：

**Passport-free border crossing:**

- **Members**: 27 countries (23 EU + 4 EFTA)
- **Not in Schengen**: Ireland, Cyprus, Bulgaria, Romania (EU members)
- **Non-EU Schengen**: Iceland, Norway, Switzerland, Liechtenstein

### Cyrillic Script Countries / キリル文字使用国

キリル文字を使用する国々：

**Countries using Cyrillic script:**

- Russia (RU), Ukraine (UA - transitioning to Latin), Belarus (BY), Bulgaria (BG), Serbia (RS - also uses Latin), North Macedonia (MK), Montenegro (ME - also uses Latin)

### Complex Postal Systems / 複雑な郵便番号システム

特殊な郵便番号体系：

**Special postal code systems:**

- **France CEDEX**: Special codes for business/bulk mail (e.g., 75001 CEDEX)
- **UK Military**: BFPO codes for British Forces Post Office
- **Vatican**: Uses Italian postal code 00120
- **San Marino**: Uses Italian postal code 47890-47899
- **Monaco**: Uses French postal code 98000

### Micro-states / 極小国家

ヨーロッパの独立した極小国家：

**Europe's independent micro-states:**

- **Vatican City**: 0.44 km², smallest sovereign state, uses EUR
- **Monaco**: 2.02 km², uses EUR, French postal system
- **San Marino**: 61 km², uses EUR, Italian postal system
- **Liechtenstein**: 160 km², uses CHF, Swiss postal system
- **Malta**: 316 km², uses EUR, own postal system
- **Andorra**: 468 km², uses EUR, own postal system

### Disputed Territories / 係争地域

国際的に係争中または承認が限定的な地域：

**Internationally disputed or limited recognition territories:**

- **Kosovo (XK)**: Declared independence 2008, partial recognition (~100 countries)
- **Transnistria (PMR)**: Breakaway region from Moldova, limited recognition
- **North Kosovo**: Serb-majority region within Kosovo
- **Northern Cyprus**: Self-declared Turkish Republic of Northern Cyprus (TRNC), only recognized by Turkey
- **Nagorno-Karabakh (NR)**: Disputed between Armenia and Azerbaijan

---

## 💻 Usage Examples / 使用例

### Example 1: Validate UK Postcode / イギリス郵便番号を検証

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const ukData = yaml.load(
  fs.readFileSync('data/europe/northern_europe/GB/GB.yaml', 'utf8')
);

const postcodeRegex = new RegExp(ukData.address_format.postal_code.regex);

console.log(postcodeRegex.test('SW1A 2AA')); // true - Westminster
console.log(postcodeRegex.test('M1 1AE')); // true - Manchester
console.log(postcodeRegex.test('EH1 1YZ')); // true - Edinburgh
console.log(postcodeRegex.test('12345')); // false - Not UK format
console.log(postcodeRegex.test('ABC123')); // false - Invalid format
```

### Example 2: Validate German Postal Code / ドイツ郵便番号を検証

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const germanyData = yaml.load(
  fs.readFileSync('data/europe/western_europe/DE/DE.yaml', 'utf8')
);

const postalCodeRegex = new RegExp(
  germanyData.address_format.postal_code.regex
);

console.log(postalCodeRegex.test('10115')); // true - Berlin
console.log(postalCodeRegex.test('80331')); // true - Munich
console.log(postalCodeRegex.test('1234')); // false - Too short
console.log(postalCodeRegex.test('123456')); // false - Too long
```

### Example 3: Format Italian Address / イタリアの住所をフォーマット

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const italyData = yaml.load(
  fs.readFileSync('data/europe/southern_europe/IT/IT.yaml', 'utf8')
);

const address = {
  recipient: 'Mario Rossi',
  street: 'Via Nazionale',
  house_number: '1',
  postal_code: '00184',
  city: 'Roma',
  province: 'RM',
  country: 'Italia'
};

const order = italyData.address_format.order_variants[0].order;
const formattedLines = order
  .map(field => {
    if (field === 'street_address') {
      return `${address.street} ${address.house_number}`;
    }
    return address[field];
  })
  .filter(Boolean);

console.log(formattedLines.join('\n'));
// Mario Rossi
// Via Nazionale 1
// 00184 Roma
// Italia
```

### Example 4: Load French Overseas Territory / フランス海外領土データを読み込む

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const reunionData = yaml.load(
  fs.readFileSync('data/europe/western_europe/FR/overseas/RE.yaml', 'utf8')
);

console.log(reunionData.name.en); // "Réunion"
console.log(reunionData.name.local[0].value); // "La Réunion"
console.log(reunionData.pos.currency.code); // "EUR"
console.log(reunionData.address_format.postal_code.example); // e.g., "97400"
console.log(reunionData.iso_codes.alpha2); // "RE"
```

### Example 5: Handle Multi-script Country (Bulgaria) / 多文字体系国を扱う

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const bulgariaData = yaml.load(
  fs.readFileSync('data/europe/eastern_europe/BG/BG.yaml', 'utf8')
);

console.log(bulgariaData.name.en); // "Bulgaria"
console.log(bulgariaData.name.local[0].value); // "България"
console.log(bulgariaData.languages[0].script); // "Cyrillic"
console.log(bulgariaData.address_format.postal_code.regex); // "^[0-9]{4}$"
console.log(bulgariaData.pos.currency.code); // "BGN"
console.log(bulgariaData.pos.currency.symbol); // "лв"
```

### Example 6: Validate Dutch 4+2 Postal Code / オランダの4+2郵便番号を検証

```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const netherlandsData = yaml.load(
  fs.readFileSync('data/europe/western_europe/NL/NL.yaml', 'utf8')
);

const postalCodeRegex = new RegExp(
  netherlandsData.address_format.postal_code.regex
);

console.log(postalCodeRegex.test('1012 AB')); // true - Amsterdam
console.log(postalCodeRegex.test('2511 AB')); // true - Den Haag
console.log(postalCodeRegex.test('1012AB')); // May be true - No space variant
console.log(postalCodeRegex.test('12345')); // false - Wrong format
```

---

## 🌐 Country List / 国一覧

### Northern Europe / 北ヨーロッパ (10)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| DK | Denmark | Danmark | 4-digit | DKK (kr) | VAT 25% |
| EE | Estonia | Eesti | 5-digit | EUR (€) | VAT 20% |
| FI | Finland | Suomi | FI-00000 | EUR (€) | VAT 24% |
| GB | United Kingdom | United Kingdom | SW1A 2AA | GBP (£) | VAT 20% |
| IE | Ireland | Éire | A65 F4E2 | EUR (€) | VAT 23% |
| IS | Iceland | Ísland | 3-digit | ISK (kr) | VAT 24% |
| LT | Lithuania | Lietuva | 5-digit | EUR (€) | VAT 21% |
| LV | Latvia | Latvija | 4-digit | EUR (€) | VAT 21% |
| NO | Norway | Norge | 4-digit | NOK (kr) | VAT 25% |
| SE | Sweden | Sverige | 5-digit | SEK (kr) | VAT 25% |

**Danish Territories:**
| Code | Territory | Postal Code | Currency |
|------|-----------|-------------|----------|
| FO | Faroe Islands | 3-digit | DKK (kr) |
| GL | Greenland | 4-digit | DKK (kr) |

**British Crown Dependencies:**
| Code | Territory | Postal Code | Currency |
|------|-----------|-------------|----------|
| GG | Guernsey | GY1-GY9 | GBP (£) |
| JE | Jersey | JE1-JE5 | GBP (£) |
| IM | Isle of Man | IM1-IM9 | GBP (£) |

**British Overseas Territories (selected in Europe):**
| Code | Territory | Postal Code | Currency |
|------|-----------|-------------|----------|
| GI | Gibraltar | GX11 1AA | GBP (£) |

### Western Europe / 西ヨーロッパ (9)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| AT | Austria | Österreich | 4-digit | EUR (€) | VAT 20% |
| BE | Belgium | België/Belgique | 4-digit | EUR (€) | VAT 21% |
| CH | Switzerland | Schweiz/Suisse | 4-digit | CHF (Fr.) | VAT 7.7% |
| DE | Germany | Deutschland | 5-digit | EUR (€) | VAT 19% |
| FR | France | France | 5-digit | EUR (€) | VAT 20% |
| LI | Liechtenstein | Liechtenstein | 4-digit | CHF (Fr.) | VAT 7.7% |
| LU | Luxembourg | Lëtzebuerg | 4-digit | EUR (€) | VAT 17% |
| MC | Monaco | Monaco | 98000 | EUR (€) | VAT 20% |
| NL | Netherlands | Nederland | 1234 AB | EUR (€) | VAT 21% |

**French Overseas Departments:**
| Code | Territory | Postal Code | Currency |
|------|-----------|-------------|----------|
| GF | French Guiana | 973xx | EUR (€) |
| GP | Guadeloupe | 971xx | EUR (€) |
| MQ | Martinique | 972xx | EUR (€) |
| RE | Réunion | 974xx | EUR (€) |
| YT | Mayotte | 976xx | EUR (€) |

**Dutch Caribbean Territories:**
| Code | Territory | Postal Code | Currency |
|------|-----------|-------------|----------|
| AW | Aruba | None | AWG (ƒ) |
| CW | Curaçao | None | ANG (ƒ) |
| SX | Sint Maarten | None | ANG (ƒ) |
| BQ | Caribbean Netherlands | BQ format | USD ($) |

### Southern Europe / 南ヨーロッパ (10)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| AD | Andorra | Andorra | AD000 | EUR (€) | VAT 4.5% |
| CY | Cyprus | Κύπρος | 4-digit | EUR (€) | VAT 19% |
| ES | Spain | España | 5-digit | EUR (€) | VAT 21% |
| GR | Greece | Ελλάδα | 5-digit | EUR (€) | VAT 24% |
| IT | Italy | Italia | 5-digit | EUR (€) | VAT 22% |
| MT | Malta | Malta | 3-letter | EUR (€) | VAT 18% |
| PT | Portugal | Portugal | 0000-000 | EUR (€) | VAT 23% |
| SI | Slovenia | Slovenija | 4-digit | EUR (€) | VAT 22% |
| SM | San Marino | San Marino | 478xx | EUR (€) | VAT 17% |
| VA | Vatican City | Città del Vaticano | 00120 | EUR (€) | No VAT |

### Eastern Europe / 東ヨーロッパ (10)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| BG | Bulgaria | България | 4-digit | BGN (лв) | VAT 20% |
| BY | Belarus | Беларусь | 6-digit | BYN (Br) | VAT 20% |
| CZ | Czech Republic | Česká republika | 000 00 | CZK (Kč) | VAT 21% |
| HU | Hungary | Magyarország | 4-digit | HUF (Ft) | VAT 27% |
| MD | Moldova | Moldova | 4-digit | MDL (lei) | VAT 20% |
| PL | Poland | Polska | 00-000 | PLN (zł) | VAT 23% |
| RO | Romania | România | 6-digit | RON (lei) | VAT 19% |
| RU | Russia | Россия | 6-digit | RUB (₽) | VAT 20% |
| SK | Slovakia | Slovensko | 000 00 | EUR (€) | VAT 20% |
| UA | Ukraine | Україна | 5-digit | UAH (₴) | VAT 20% |

### Southeastern Europe / 南東ヨーロッパ (6)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| AL | Albania | Shqipëri | 4-digit | ALL (L) | VAT 20% |
| BA | Bosnia and Herzegovina | Bosna i Hercegovina | 5-digit | BAM (KM) | VAT 17% |
| HR | Croatia | Hrvatska | 5-digit | EUR (€) | VAT 25% |
| ME | Montenegro | Crna Gora | 5-digit | EUR (€) | VAT 21% |
| MK | North Macedonia | Северна Македонија | 4-digit | MKD (ден) | VAT 18% |
| RS | Serbia | Србија | 5-digit | RSD (дин) | VAT 20% |
| XK | Kosovo | Kosova/Косово | 5-digit | EUR (€) | VAT 18% |

### Caucasus / コーカサス (3)

| Code | Country | Local Name | Postal Code | Currency | Tax |
|------|---------|------------|-------------|----------|-----|
| AM | Armenia | Հայաստան | 4-digit | AMD (֏) | VAT 20% |
| AZ | Azerbaijan | Azərbaycan | AZ 0000 | AZN (₼) | VAT 18% |
| GE | Georgia | საქართველო | 4-digit | GEL (₾) | VAT 18% |

---

## 📚 Additional Resources / 関連リソース

- [Universal Postal Union - Europe](https://www.upu.int) - International postal standards
- [European Commission - Postal Services](https://ec.europa.eu/growth/sectors/postal-services_en) - EU postal regulations
- [UK Royal Mail Postcode Finder](https://www.royalmail.com/find-a-postcode) - UK postcode lookup
- [Deutsche Post](https://www.deutschepost.de) - German postal service
- [La Poste](https://www.laposte.fr) - French postal service
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
