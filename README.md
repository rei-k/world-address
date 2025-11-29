# 🌍 World Address YAML / JSON

世界各国の住所形式をYAML形式とJSON形式で構造化したオープンデータベースです。

## 📋 概要

このプロジェクトは、世界中の国・地域の住所体系を標準化されたYAML形式およびJSON形式で記述し、以下の用途に活用できるデータを提供します：

- 🚚 **配送実務**: 国際配送のためのフォーム設計や住所ラベル生成
- 📚 **研究・分析**: 各国の住所制度の比較研究や標準化

## 📂 データ形式

全てのデータはYAMLとJSONの両形式で提供されています：

- **YAML**: 人間が読みやすく編集しやすい形式
- **JSON**: プログラムからの利用に最適化された形式

各国・地域のデータは同じディレクトリ内に `.yaml` と `.json` の両方のファイルとして配置されています。

## 📁 ディレクトリ構造

```
world-address-yaml/
├── africa/                 # アフリカ
│   ├── central_africa/
│   ├── eastern_africa/
│   ├── northern_africa/
│   ├── southern_africa/
│   └── west_africa/
├── americas/               # アメリカ大陸
│   ├── caribbean/
│   ├── central_america/
│   ├── north_america/
│   └── south_america/
├── antarctica/             # 南極
│   ├── claims/             # 領有権主張地域
│   └── stations/           # 研究基地
├── asia/                   # アジア
│   ├── central_asia/
│   ├── east_asia/
│   ├── south_asia/
│   ├── southeast_asia/
│   └── west_asia/
├── europe/                 # ヨーロッパ
│   ├── caucasus/
│   ├── eastern_europe/
│   ├── northern_europe/
│   ├── southeastern_europe/
│   ├── southern_europe/
│   └── western_europe/
├── oceania/                # オセアニア
│   ├── australia_new_zealand/
│   ├── melanesia/
│   ├── micronesia/
│   └── polynesia/
├── 型/                     # スキーマ型定義
└── 例/                     # サンプルデータ
```

## 📝 データ形式

### ファイル命名規則

- 国ファイル: `{ISO 3166-1 alpha-2コード}.yaml` / `{ISO 3166-1 alpha-2コード}.json` (例: `JP.yaml`, `JP.json`, `US.yaml`, `US.json`)
- 地域ファイル: `{地域名}.yaml` / `{地域名}.json` (例: `Papua.yaml`, `Papua.json`)

### スキーマレベル

このプロジェクトでは2つのスキーマレベルを提供しています：

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

## 🔧 使用方法

### データの読み込み

任意のYAML/JSONパーサーを使用してデータを読み込むことができます。

**Python (YAML):**
```python
import yaml

with open('asia/east_asia/JP.yaml', 'r', encoding='utf-8') as f:
    japan_data = yaml.safe_load(f)

print(japan_data['name']['en'])  # Japan
print(japan_data['address_format']['postal_code']['regex'])  # ^[0-9]{3}-[0-9]{4}$
```

**Python (JSON):**
```python
import json

with open('asia/east_asia/JP.json', 'r', encoding='utf-8') as f:
    japan_data = json.load(f)

print(japan_data['name']['en'])  # Japan
print(japan_data['address_format']['postal_code']['regex'])  # ^[0-9]{3}-[0-9]{4}$
```

**JavaScript/Node.js (YAML):**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');

const japanData = yaml.load(fs.readFileSync('asia/east_asia/JP.yaml', 'utf8'));
console.log(japanData.name.en);  // Japan
```

**JavaScript/Node.js (JSON):**
```javascript
const fs = require('fs');

const japanData = JSON.parse(fs.readFileSync('asia/east_asia/JP.json', 'utf8'));
console.log(japanData.name.en);  // Japan
```

## 🤝 貢献方法

### 新しい国・地域のデータを追加する

1. 適切な大陸・地域のディレクトリに移動
2. ISO 3166-1 alpha-2コードをファイル名として使用
3. `型/README.md` のスキーマに従ってYAMLファイルを作成
4. 対応するJSONファイルも作成（YAMLから自動変換可能）
5. Pull Requestを作成

### データの修正・改善

1. 誤りを発見した場合はIssueを作成
2. 修正がある場合はPull Requestで提案

### 注意事項

- 政治的に敏感な地域（係争地域、部分承認国など）については、`status` フィールドで状況を明記
- 海外領土は宗主国のディレクトリ内の `overseas/` サブディレクトリに配置
- 特殊な行政区画は `regions/` サブディレクトリに配置

## 📊 収録状況

- **総ファイル数**: 279件（YAML + JSON = 558ファイル）
- **大陸**: 6大陸（アフリカ、アメリカ、南極、アジア、ヨーロッパ、オセアニア）
- **特殊地域**: 海外領土、係争地域、研究基地なども収録
- **データ形式**: YAML および JSON

## 🗺️ 対応国・地域一覧 / Supported Countries and Regions

<details>
<summary>🌍 アフリカ / Africa（54か国・地域）</summary>

#### 中央アフリカ / Central Africa
| コード | 国名 |
|--------|------|
| AO | Angola |
| CD | Democratic Republic of the Congo |
| CF | Central African Republic |
| CG | Republic of the Congo |
| CM | Cameroon |
| GA | Gabon |
| GQ | Equatorial Guinea |
| ST | São Tomé and Príncipe |
| TD | Chad |

#### 東アフリカ / Eastern Africa
| コード | 国名 |
|--------|------|
| BI | Burundi |
| DJ | Djibouti |
| ER | Eritrea |
| ET | Ethiopia |
| KE | Kenya |
| KM | Comoros |
| MG | Madagascar |
| MU | Mauritius |
| MW | Malawi |
| MZ | Mozambique |
| RW | Rwanda |
| SC | Seychelles |
| SO | Somalia |
| TZ | Tanzania |
| UG | Uganda |
| ZM | Zambia |
| ZW | Zimbabwe |

#### 北アフリカ / Northern Africa
| コード | 国名 |
|--------|------|
| DZ | Algeria |
| EG | Egypt |
| LY | Libya |
| MA | Morocco |
| SD | Sudan |
| SS | South Sudan |
| TN | Tunisia |

#### 南部アフリカ / Southern Africa
| コード | 国名 |
|--------|------|
| BW | Botswana |
| LS | Lesotho |
| NA | Namibia |
| SZ | Eswatini |
| ZA | South Africa |

#### 西アフリカ / West Africa
| コード | 国名 |
|--------|------|
| BF | Burkina Faso |
| BJ | Benin |
| CI | Côte d'Ivoire |
| CV | Cape Verde |
| GH | Ghana |
| GM | The Gambia |
| GN | Guinea |
| GW | Guinea-Bissau |
| LR | Liberia |
| ML | Mali |
| MR | Mauritania |
| NE | Niger |
| NG | Nigeria |
| SL | Sierra Leone |
| SN | Senegal |
| TG | Togo |

</details>

<details>
<summary>🌎 アメリカ大陸 / Americas（45か国・地域）</summary>

#### カリブ海 / Caribbean
| コード | 国名 |
|--------|------|
| AG | Antigua and Barbuda |
| BB | Barbados |
| BS | The Bahamas |
| CU | Cuba |
| DM | Dominica |
| DO | Dominican Republic |
| GD | Grenada |
| HT | Haiti |
| JM | Jamaica |
| KN | Saint Kitts and Nevis |
| LC | Saint Lucia |
| TT | Trinidad and Tobago |
| VC | Saint Vincent and the Grenadines |

#### 中央アメリカ / Central America
| コード | 国名 |
|--------|------|
| BZ | Belize |
| CR | Costa Rica |
| GT | Guatemala |
| HN | Honduras |
| NI | Nicaragua |
| PA | Panama |
| SV | El Salvador |

#### 北アメリカ / North America
| コード | 国名 |
|--------|------|
| CA | Canada |
| MX | Mexico |
| US | United States |

**米国海外領土 / U.S. Overseas Territories:**
| コード | 地域名 |
|--------|--------|
| AS | American Samoa |
| GU | Guam |
| MP | Northern Mariana Islands |
| PR | Puerto Rico |
| VI | United States Virgin Islands |

#### 南アメリカ / South America
| コード | 国名 |
|--------|------|
| AR | Argentina |
| BO | Bolivia |
| BR | Brazil |
| CL | Chile |
| CO | Colombia |
| EC | Ecuador |
| GY | Guyana |
| PE | Peru |
| PY | Paraguay |
| SR | Suriname |
| UY | Uruguay |
| VE | Venezuela |

**チリ海外領土 / Chile Overseas Territories:**
| 地域名 |
|--------|
| Desventuradas Islands |
| Easter Island |
| Juan Fernández Islands |

</details>

<details>
<summary>🧊 南極 / Antarctica（22地域・基地）</summary>

#### 南極大陸 / Antarctica
| コード | 名称 |
|--------|------|
| AQ | Antarctica |

#### 領有権主張地域 / Territorial Claims
| コード | 名称 |
|--------|------|
| AR_CLAIM | Argentine Antarctica |
| AT | Australian Antarctic Territory |
| BAT | British Antarctic Territory |
| CL_CLAIM | Chilean Antarctic Territory |
| FR_ADELIE | Adélie Land |
| NO_PB | Peter I Island |
| NO_QML | Queen Maud Land |
| NZ_ROSS | Ross Dependency |
| UNCLAIMED | Marie Byrd Land (Unclaimed) |

#### 研究基地 / Research Stations
| コード | 名称 |
|--------|------|
| AU_CASEY | Casey Station |
| AU_DAVIS | Davis Station |
| AU_MAWSON | Mawson Station |
| CN_ZHONGSHAN | Zhongshan Station |
| DE_NEUMAYER | Neumayer Station III |
| IN_BHARATI | Bharati Station |
| IN_MAITRI | Maitri Station |
| IT_ZUCCHELLI | Mario Zucchelli Station |
| JP_SYOWA | Syowa Station |
| KR_SEJONG | King Sejong Station |
| RU_VOSTOK | Vostok Station |
| US_MCMURDO | McMurdo Station |

</details>

<details>
<summary>🌏 アジア / Asia（54か国・地域）</summary>

#### 中央アジア / Central Asia
| コード | 国名 |
|--------|------|
| KG | Kyrgyzstan |
| KZ | Kazakhstan |
| TJ | Tajikistan |
| TM | Turkmenistan |
| UZ | Uzbekistan |

#### 東アジア / East Asia
| コード | 国名 |
|--------|------|
| CN | China |
| HK | Hong Kong |
| JP | Japan |
| KP | North Korea |
| KR | South Korea |
| MN | Mongolia |
| MO | Macao |
| TW | Taiwan |

#### 南アジア / South Asia
| コード | 国名 |
|--------|------|
| AF | Afghanistan |
| BD | Bangladesh |
| BT | Bhutan |
| IN | India |
| LK | Sri Lanka |
| MV | Maldives |
| NP | Nepal |
| PK | Pakistan |

**インド連邦直轄領 / Indian Union Territories:**
| 地域名 |
|--------|
| Andaman and Nicobar Islands |
| Lakshadweep |

#### 東南アジア / Southeast Asia
| コード | 国名 |
|--------|------|
| BN | Brunei |
| ID | Indonesia |
| KH | Cambodia |
| LA | Laos |
| MM | Myanmar |
| MY | Malaysia |
| PH | Philippines |
| SG | Singapore |
| TH | Thailand |
| TL | Timor-Leste |
| VN | Vietnam |

**インドネシア特別地域 / Indonesia Special Regions:**
| 地域名 |
|--------|
| Papua |

#### 西アジア / West Asia
| コード | 国名 |
|--------|------|
| AE | United Arab Emirates |
| BH | Bahrain |
| IL | Israel |
| IQ | Iraq |
| IR | Iran |
| JO | Jordan |
| KW | Kuwait |
| LB | Lebanon |
| OM | Oman |
| PS | Palestine |
| QA | Qatar |
| SA | Saudi Arabia |
| SY | Syria |
| TR | Turkey |
| YE | Yemen |

**コーカサス / Caucasus:**
| コード | 国名 |
|--------|------|
| AM | Armenia |
| AZ | Azerbaijan |
| GE | Georgia |

</details>

<details>
<summary>🇪🇺 ヨーロッパ / Europe（73か国・地域）</summary>

#### コーカサス / Caucasus
| コード | 国名 |
|--------|------|
| AM | Armenia |
| AZ | Azerbaijan |
| GE | Georgia |

**コーカサス係争地域 / Caucasus Disputed Territories:**
| コード | 地域名 |
|--------|--------|
| AB | Abkhazia |
| SO | South Ossetia |

#### 東ヨーロッパ / Eastern Europe
| コード | 国名 |
|--------|------|
| BG | Bulgaria |
| BY | Belarus |
| CZ | Czech Republic |
| HU | Hungary |
| MD | Moldova |
| PL | Poland |
| RO | Romania |
| RU | Russia |
| SK | Slovakia |
| UA | Ukraine |

#### 北ヨーロッパ / Northern Europe
| コード | 国名 |
|--------|------|
| DK | Denmark |
| EE | Estonia |
| FI | Finland |
| GB | United Kingdom |
| IE | Ireland |
| IS | Iceland |
| LT | Lithuania |
| LV | Latvia |
| NO | Norway |
| SE | Sweden |

**デンマーク自治領 / Danish Autonomous Territories:**
| コード | 地域名 |
|--------|--------|
| FO | Faroe Islands |
| GL | Greenland |

**イギリス王室属領 / British Crown Dependencies:**
| コード | 地域名 |
|--------|--------|
| GG | Guernsey |
| IM | Isle of Man |
| JE | Jersey |

**イギリス海外領土 / British Overseas Territories:**
| コード | 地域名 |
|--------|--------|
| AI | Anguilla |
| BM | Bermuda |
| FK | Falkland Islands |
| GI | Gibraltar |
| GS | South Georgia and the South Sandwich Islands |
| IO | British Indian Ocean Territory |
| KY | Cayman Islands |
| MS | Montserrat |
| PN | Pitcairn Islands |
| SH | Saint Helena, Ascension and Tristan da Cunha |
| TC | Turks and Caicos Islands |
| VG | British Virgin Islands |

#### 南東ヨーロッパ / Southeastern Europe
| コード | 国名 |
|--------|------|
| AL | Albania |
| BA | Bosnia and Herzegovina |
| HR | Croatia |
| ME | Montenegro |
| MK | North Macedonia |
| RS | Serbia |

**南東ヨーロッパ係争地域 / Southeastern Europe Disputed Territories:**
| コード | 地域名 |
|--------|--------|
| XK | Kosovo |

#### 南ヨーロッパ / Southern Europe
| コード | 国名 |
|--------|------|
| AD | Andorra |
| CY | Cyprus |
| ES | Spain |
| GR | Greece |
| IT | Italy |
| MT | Malta |
| PT | Portugal |
| SM | San Marino |
| VA | Vatican City |

**スペイン特別地域 / Spain Special Regions:**
| 地域名 |
|--------|
| Canary Islands |
| Ceuta and Melilla |

**ポルトガル自治領 / Portuguese Autonomous Regions:**
| 地域名 |
|--------|
| Azores |
| Madeira |

#### 西ヨーロッパ / Western Europe
| コード | 国名 |
|--------|------|
| AT | Austria |
| BE | Belgium |
| CH | Switzerland |
| DE | Germany |
| FR | France |
| LI | Liechtenstein |
| LU | Luxembourg |
| MC | Monaco |
| NL | Netherlands |

**フランス海外領土 / French Overseas Territories:**
| コード | 地域名 |
|--------|--------|
| GF | French Guiana |
| GP | Guadeloupe |
| MQ | Martinique |
| NC | New Caledonia |
| PF | French Polynesia |
| PM | Saint Pierre and Miquelon |
| RE | Réunion |
| WF | Wallis and Futuna |
| YT | Mayotte |

**オランダ海外領土 / Dutch Overseas Territories:**
| コード | 地域名 |
|--------|--------|
| BQ | Caribbean Netherlands |
| CW | Curaçao |
| SX | Sint Maarten |

</details>

<details>
<summary>🌴 オセアニア / Oceania（22か国・地域）</summary>

#### オーストラリア・ニュージーランド / Australia and New Zealand
| コード | 国名 |
|--------|------|
| AU | Australia |
| NZ | New Zealand |

**オーストラリア海外領土 / Australian External Territories:**
| コード | 地域名 |
|--------|--------|
| CC | Cocos (Keeling) Islands |
| CX | Christmas Island |
| HM | Heard Island and McDonald Islands |
| NF | Norfolk Island |

**ニュージーランド関連領土 / New Zealand Associated Territories:**
| コード | 地域名 |
|--------|--------|
| CK | Cook Islands |
| NU | Niue |
| TK | Tokelau |

#### メラネシア / Melanesia
| コード | 国名 |
|--------|------|
| FJ | Fiji |
| PG | Papua New Guinea |
| SB | Solomon Islands |
| VU | Vanuatu |

#### ミクロネシア / Micronesia
| コード | 国名 |
|--------|------|
| FM | Federated States of Micronesia |
| KI | Kiribati |
| MH | Marshall Islands |
| NR | Nauru |
| PW | Palau |

#### ポリネシア / Polynesia
| コード | 国名 |
|--------|------|
| TO | Tonga |
| TV | Tuvalu |
| WS | Samoa |

</details>

## 📜 ライセンス

このプロジェクトのデータはオープンデータとして提供されています。

## 🔗 関連リンク

- [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html) - 国名コード規格
- [Universal Postal Union](https://www.upu.int/) - 万国郵便連合

---

🌐 **World Address YAML / JSON** - 世界の住所を、ひとつのフォーマットで
