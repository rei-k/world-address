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
