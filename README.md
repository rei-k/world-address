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

## 📜 ライセンス

このプロジェクトのデータはオープンデータとして提供されています。

## 🔗 関連リンク

- [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html) - 国名コード規格
- [Universal Postal Union](https://www.upu.int/) - 万国郵便連合

---

🌐 **World Address YAML / JSON** - 世界の住所を、ひとつのフォーマットで
