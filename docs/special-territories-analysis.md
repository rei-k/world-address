# 実質的に独立的に見えたり特殊関税領域の分析 / Analysis of Effectively Independent and Special Customs Territories

**Generated:** 2025-12-07  
**Language:** 日本語 / 日本語 + English

## 📋 目次 / Table of Contents

1. [概要 / Overview](#概要--overview)
2. [分析基準 / Analysis Criteria](#分析基準--analysis-criteria)
3. [分類結果 / Classification Results](#分類結果--classification-results)
4. [詳細リスト / Detailed Lists](#詳細リスト--detailed-lists)
5. [主要な特殊関税領域 / Major Special Customs Territories](#主要な特殊関税領域--major-special-customs-territories)

---

## 概要 / Overview

このドキュメントは、世界住所データベース内の領域を分析し、以下の特徴を持つ地域を特定したものです：

This document analyzes territories in the world address database and identifies regions with the following characteristics:

### 🏴 実質的に独立的な領域 / Effectively Independent Territories

実質的に独立国のように機能している地域（独自の通貨、郵便、税制、ISO コードを持つが国連加盟国ではない）

Territories that function like independent states (with own currency, postal system, tax system, and ISO code, but not UN members)

**Total:** 68 territories

### 🏛️ 特殊関税領域 / Special Customs/Tariff Territories

独自の関税・税制システムを持つ地域（独自の郵便システムと通貨または税制を持つ）

Territories with separate customs and tariff systems (with own postal system and currency or tax system)

**Total:** 199 territories

### 🏙️ 特別行政区 / Special Administrative Regions (SAR)

「一国二制度」政策の下にある地域（香港、マカオ）

Regions under "One Country, Two Systems" policy (Hong Kong, Macao)

**Total:** 2 territories

### 💰 独自通貨を持つ自治領域 / Autonomous Territories with Own Currency

**Total:** 57 territories

### 🗺️ 特別自治地域 / Special Autonomous Regions

独自の税制、郵便、行政システムを持つ地域

Regions with special tax, postal, or administrative systems

**Total:** 35 territories

---

## 分析基準 / Analysis Criteria

### 独立性の指標 / Independence Indicators

1. **独自のISO コード** / Own ISO Code (ISO 3166-1 alpha-2)
2. **独自の通貨** / Own Currency
3. **独自の税制** / Own Tax System
4. **独自の郵便システム** / Own Postal System
5. **独自のタイムゾーン** / Own Timezone
6. **国連非加盟** / Not a UN Member

### 特殊関税領域の基準 / Special Customs Territory Criteria

- 独自の郵便システム **かつ** (独自の通貨 **または** 独自の税制)
- Own postal system **AND** (Own currency **OR** Own tax system)

### 実質的独立の基準 / Effectively Independent Criteria

- 独立性スコア ≥ 4 (上記6指標のうち4つ以上) **かつ** 国連非加盟
- Independence score ≥ 4 (4 or more of the 6 indicators above) **AND** Not a UN member

---

## 分類結果 / Classification Results

### 📊 統計サマリー / Summary Statistics

| カテゴリー / Category | 数 / Count |
|----------------------|-----------|
| 実質的に独立的な領域 / Effectively Independent | 68 |
| 特殊関税領域 / Special Customs Territories | 199 |
| 特別行政区 (SAR) / Special Administrative Regions | 2 |
| 独自通貨を持つ自治領域 / Autonomous Territories (Own Currency) | 57 |
| 海外領土 / Overseas Territories | 47 |
| 特別自治地域 / Special Autonomous Regions | 35 |

---

## 詳細リスト / Detailed Lists

### 🏴 実質的に独立的な領域 / Effectively Independent Territories

これらの領域は、国連加盟国ではありませんが、独自の通貨、郵便システム、税制、ISO コードを持ち、実質的に独立国のように機能しています。

These territories are not UN members but have their own currency, postal system, tax system, and ISO code, functioning effectively as independent states.

#### アジア / Asia

1. **HK - 香港 / Hong Kong**
   - 通貨 / Currency: HKD
   - 税制 / Tax: VAT
   - 郵便 / Postal: なし (No postal code system)
   - 状態 / Status: 特別行政区 / Special Administrative Region

2. **MO - マカオ / Macao**
   - 通貨 / Currency: MOP
   - 税制 / Tax: VAT
   - 郵便 / Postal: なし (No postal code system)
   - 状態 / Status: 特別行政区 / Special Administrative Region

3. **TW - 台湾 / Taiwan**
   - 通貨 / Currency: TWD
   - 税制 / Tax: VAT
   - 郵便 / Postal: `^[0-9]{3}(-[0-9]{2,3})?$`
   - 状態 / Status: 係争地域 / Disputed territory

#### ヨーロッパ / Europe

4. **FO - フェロー諸島 / Faroe Islands**
   - 通貨 / Currency: DKK
   - 税制 / Tax: VAT
   - 郵便 / Postal: `^FO-[0-9]{3}$`
   - 状態 / Status: デンマーク自治領 / Danish autonomous territory

5. **GL - グリーンランド / Greenland**
   - 通貨 / Currency: DKK
   - 税制 / Tax: VAT
   - 郵便 / Postal: `^[0-9]{4}$`
   - 状態 / Status: デンマーク自治領 / Danish autonomous territory

6. **GG - ガーンジー / Guernsey**
   - 通貨 / Currency: GBP
   - 税制 / Tax: VAT
   - 郵便 / Postal: `^GY[0-9]{1,2} [0-9][A-Z]{2}$`
   - 状態 / Status: イギリス王室属領 / British Crown Dependency

7. **IM - マン島 / Isle of Man**
   - 通貨 / Currency: GBP
   - 税制 / Tax: VAT
   - 郵便 / Postal: `^IM[0-9]{1,2} [0-9][A-Z]{2}$`
   - 状態 / Status: イギリス王室属領 / British Crown Dependency

8. **JE - ジャージー / Jersey**
   - 通貨 / Currency: GBP
   - 税制 / Tax: VAT
   - 郵便 / Postal: `^JE[0-9]{1,2} [0-9][A-Z]{2}$`
   - 状態 / Status: イギリス王室属領 / British Crown Dependency

9. **AX - オーランド諸島 / Åland Islands**
   - 通貨 / Currency: EUR
   - 税制 / Tax: VAT
   - 郵便 / Postal: `^22[0-9]{3}$`
   - 状態 / Status: フィンランド自治領 / Finnish autonomous territory

#### オセアニア / Oceania

10. **CK - クック諸島 / Cook Islands**
    - 通貨 / Currency: NZD
    - 税制 / Tax: VAT
    - 郵便 / Postal: 特定パターン / Specific pattern
    - 状態 / Status: ニュージーランド関連領土 / NZ associated territory

11. **NU - ニウエ / Niue**
    - 通貨 / Currency: NZD
    - 税制 / Tax: VAT
    - 郵便 / Postal: 特定パターン / Specific pattern
    - 状態 / Status: ニュージーランド関連領土 / NZ associated territory

**...その他 / and 56 more territories**

*(Full list available in the generated JSON report: `docs/special-territories-report.json`)*

---

### 🏛️ 主要な特殊関税領域 / Major Special Customs Territories

これらの領域は、独自の関税・税制システムを持つため、国際貿易において特別な扱いを受けます。

These territories have separate customs and tariff systems and receive special treatment in international trade.

#### 特に重要な特殊関税領域 / Particularly Important Special Customs Territories

1. **香港 (HK) / Hong Kong**
   - 中国の特別行政区 / Special Administrative Region of China
   - 独自の通貨: HKD / Own currency: HKD
   - 独自の税制・関税システム / Own tax and customs system
   - WTO 独立加盟 / Separate WTO membership

2. **マカオ (MO) / Macao**
   - 中国の特別行政区 / Special Administrative Region of China
   - 独自の通貨: MOP / Own currency: MOP
   - 独自の税制・関税システム / Own tax and customs system
   - WTO 独立加盟 / Separate WTO membership

3. **台湾 (TW) / Taiwan**
   - 独自の通貨: TWD / Own currency: TWD
   - 独自の税制・関税システム / Own tax and customs system
   - WTO 加盟 (中華台北として) / WTO member (as Chinese Taipei)

4. **グリーンランド (GL) / Greenland**
   - デンマーク自治領 / Danish autonomous territory
   - EU 非加盟 (デンマークは加盟) / Not in EU (despite Denmark's membership)
   - 独自の関税システム / Own customs system

5. **フェロー諸島 (FO) / Faroe Islands**
   - デンマーク自治領 / Danish autonomous territory
   - EU 非加盟 (デンマークは加盟) / Not in EU (despite Denmark's membership)
   - 独自の関税システム / Own customs system

6. **プエルトリコ (PR) / Puerto Rico**
   - アメリカ合衆国領土 / US Territory
   - 米国通貨使用 (USD) / Uses US currency (USD)
   - 独自の税制 / Own tax system
   - 米国本土とは異なる関税扱い / Different customs treatment from US mainland

7. **海南省 (中国) / Hainan Province (China)**
   - 中国の自由貿易港 / China's free trade port
   - 独自の税制優遇 / Special tax incentives
   - 独自の郵便コード体系 / Own postal code system

8. **カナリア諸島 (ES-CN) / Canary Islands**
   - スペイン自治州 / Spanish autonomous community
   - EU 加盟だが特別な税制ステータス / In EU but with special tax status
   - 付加価値税の代わりに独自の間接税 (IGIC) / Own indirect tax (IGIC) instead of VAT

9. **セウタ・メリリャ (ES-CE/ES-ML) / Ceuta and Melilla**
   - スペイン自治都市 / Spanish autonomous cities
   - EU 加盟だが関税領域外 / In EU but outside customs territory
   - 独自の税制 / Own tax system

10. **オーランド諸島 (AX) / Åland Islands**
    - フィンランド自治領 / Finnish autonomous territory
    - EU 加盟だが税制上の特例 / In EU but with tax exemptions
    - 付加価値税の特別扱い / Special VAT treatment

---

### 🏙️ 特別行政区 (SAR) / Special Administrative Regions

「一国二制度」(One Country, Two Systems) の原則の下にある地域：

Regions under the "One Country, Two Systems" principle:

1. **HK - 香港 / Hong Kong**
   - 親国 / Parent Country: 中国 / China
   - 通貨 / Currency: HKD (香港ドル / Hong Kong Dollar)
   - 独自の法制度 / Own legal system: コモンロー / Common Law
   - 独自の出入国管理 / Own immigration control
   - 独自の関税システム / Own customs system
   - 2047年まで特別行政区の地位保証 / SAR status guaranteed until 2047

2. **MO - マカオ / Macao**
   - 親国 / Parent Country: 中国 / China
   - 通貨 / Currency: MOP (マカオパタカ / Macanese Pataca)
   - 独自の法制度 / Own legal system: 大陸法系 / Civil Law
   - 独自の出入国管理 / Own immigration control
   - 独自の関税システム / Own customs system
   - 2049年まで特別行政区の地位保証 / SAR status guaranteed until 2049

---

### 💰 独自通貨を持つ自治領域 / Autonomous Territories with Own Currency

これらの領域は独自の通貨を発行・使用しているため、金融・通貨政策において独立性を持っています。

These territories issue or use their own currency, giving them independence in financial and monetary policy.

#### 主要な例 / Major Examples:

1. **バミューダ (BM) / Bermuda**
   - 通貨 / Currency: BMD (バミューダドル / Bermudian Dollar)
   - 親国 / Parent: イギリス / United Kingdom

2. **ケイマン諸島 (KY) / Cayman Islands**
   - 通貨 / Currency: KYD (ケイマン諸島ドル / Cayman Islands Dollar)
   - 親国 / Parent: イギリス / United Kingdom
   - 国際金融センター / International financial center

3. **アルバ (AW) / Aruba**
   - 通貨 / Currency: AWG (アルバフローリン / Aruban Florin)
   - 親国 / Parent: オランダ / Netherlands

4. **キュラソー (CW) / Curaçao**
   - 通貨 / Currency: ANG (オランダ領アンティルギルダー / Netherlands Antillean Guilder)
   - 親国 / Parent: オランダ / Netherlands

5. **ニューカレドニア (NC) / New Caledonia**
   - 通貨 / Currency: XPF (CFPフラン / CFP Franc)
   - 親国 / Parent: フランス / France

6. **フランス領ポリネシア (PF) / French Polynesia**
   - 通貨 / Currency: XPF (CFPフラン / CFP Franc)
   - 親国 / Parent: フランス / France

**...その他 / and 51 more territories**

---

### 🗺️ 特別自治地域 / Special Autonomous Regions

これらの地域は、独自の税制、郵便、または行政システムを持つ特別な自治権を有しています。

These regions have special autonomy with their own tax, postal, or administrative systems.

#### アジア / Asia

1. **海南省 (中国) / Hainan Province (China)**
   - 自由貿易港 / Free Trade Port
   - 独自の税制優遇 / Special tax incentives
   - 郵便コード / Postal: `^57[0-9]{4}$`

2. **新疆ウイグル自治区 (中国) / Xinjiang Uyghur Autonomous Region (China)**
   - 民族自治区 / Ethnic autonomous region
   - 郵便コード / Postal: `^8[3-4][0-9]{4}$`

3. **チベット自治区 (中国) / Tibet Autonomous Region (China)**
   - 民族自治区 / Ethnic autonomous region
   - 郵便コード / Postal: `^85[0-9]{4}$`

4. **内モンゴル自治区 (中国) / Inner Mongolia Autonomous Region (China)**
   - 民族自治区 / Ethnic autonomous region
   - 郵便コード / Postal: `^01[0-9]{4}$`

5. **アチェ特別自治州 (インドネシア) / Aceh Special Autonomous Province (Indonesia)**
   - イスラム法の適用 / Application of Islamic law
   - 特別自治権 / Special autonomy
   - 郵便コード / Postal: `^2[0-9]{4}$`

6. **パプア (インドネシア) / Papua (Indonesia)**
   - 特別自治州 / Special autonomous province
   - 郵便コード / Postal: `^[0-9]{5}$`

7. **ラブアン連邦直轄領 (マレーシア) / Federal Territory of Labuan (Malaysia)**
   - 国際オフショア金融センター / International offshore financial center
   - 特別税制 / Special tax regime
   - 郵便コード / Postal: `^87[0-9]{3}$`

8. **サバ州 (マレーシア) / Sabah (Malaysia)**
   - 独自の出入国管理 / Own immigration control
   - 郵便コード / Postal: `^8[789][0-9]{3}$`

9. **サラワク州 (マレーシア) / Sarawak (Malaysia)**
   - 独自の出入国管理 / Own immigration control
   - 郵便コード / Postal: `^9[0-8][0-9]{3}$`

10. **バンサモロ自治地域 (フィリピン) / Bangsamoro Autonomous Region (Philippines)**
    - イスラム自治地域 / Islamic autonomous region
    - 独自の議会 / Own parliament
    - 郵便コード / Postal: `^[0-9]{4}$`

11. **オエクシ特別行政区 (東ティモール) / Oecusse Special Administrative Region (Timor-Leste)**
    - 飛び地の特別行政区 / Exclave special administrative region
    - 特別経済区 / Special economic zone

#### ヨーロッパ / Europe

12. **カナリア諸島 (スペイン) / Canary Islands (Spain)**
    - 独自の間接税 (IGIC) / Own indirect tax (IGIC)
    - EU 関税領域だが特別扱い / In EU customs territory but with special treatment
    - 郵便コード / Postal: `^(35|38)[0-9]{3}$`

13. **セウタ・メリリャ (スペイン) / Ceuta and Melilla (Spain)**
    - EU 加盟だが関税領域外 / In EU but outside customs territory
    - 独自の税制 / Own tax system
    - 郵便コード / Postal: `^(51|52)[0-9]{3}$`

14. **バレアレス諸島 (スペイン) / Balearic Islands (Spain)**
    - 自治州 / Autonomous community
    - 特別な税制 / Special tax regime
    - 郵便コード / Postal: `^07[0-9]{3}$`

15. **アゾレス諸島 (ポルトガル) / Azores (Portugal)**
    - 自治地域 / Autonomous region
    - 特別な税制優遇 / Special tax incentives
    - 郵便コード / Postal: `^9[0-9]{3}-[0-9]{3}$`

16. **マデイラ諸島 (ポルトガル) / Madeira (Portugal)**
    - 自治地域 / Autonomous region
    - 国際ビジネスセンター / International business center
    - 郵便コード / Postal: `^9[0-9]{3}-[0-9]{3}$`

#### アフリカ / Africa

17. **ザンジバル (タンザニア) / Zanzibar (Tanzania)**
    - 半自治地域 / Semi-autonomous region
    - 独自の政府 / Own government
    - 郵便コード / Postal: `^[0-9]{5}$`

18. **ソマリランド (ソマリア) / Somaliland (Somalia)**
    - 事実上の独立地域 / De facto independent region
    - 独自の通貨・政府 / Own currency and government
    - 国際的に未承認 / Internationally unrecognized

19. **プントランド (ソマリア) / Puntland (Somalia)**
    - 自治地域 / Autonomous region
    - 独自の政府 / Own government

**...その他 / and 16 more regions**

---

## 主要な特殊関税領域 / Major Special Customs Territories

### 📦 国際貿易における重要性 / Importance in International Trade

以下の領域は、国際貿易・通関手続きにおいて特別な扱いを要します：

The following territories require special handling in international trade and customs procedures:

#### Tier 1: 完全に独立した関税領域 / Fully Independent Customs Territories

1. **香港 (HK)** - 独自のWTO加盟、完全に独立した関税システム
2. **マカオ (MO)** - 独自のWTO加盟、完全に独立した関税システム
3. **台湾 (TW)** - WTO加盟(中華台北)、独立した関税システム
4. **グリーンランド (GL)** - EU非加盟(デンマークは加盟)
5. **フェロー諸島 (FO)** - EU非加盟(デンマークは加盟)

#### Tier 2: 特別な関税ステータスを持つ EU 領域 / EU Territories with Special Customs Status

6. **カナリア諸島 (ES-CN)** - EU加盟だが特別税制
7. **セウタ・メリリャ (ES-CE/ES-ML)** - EU加盟だが関税領域外
8. **オーランド諸島 (AX)** - EU加盟だが付加価値税特例
9. **アゾレス諸島・マデイラ諸島 (PT)** - EU加盟だが特別税制

#### Tier 3: 海外領土・自治領 / Overseas Territories and Autonomous Regions

10. **プエルトリコ (PR)** - 米国領土だが独自の税制
11. **バミューダ (BM)** - 独自通貨、独自税制
12. **ケイマン諸島 (KY)** - 国際金融センター、独自通貨
13. **ニューカレドニア (NC)** - 独自通貨 (XPF)
14. **フランス領ポリネシア (PF)** - 独自通貨 (XPF)
15. **アルバ (AW)** - 独自通貨、独自関税

---

## 注意事項 / Notes

### 🔍 分析の限界 / Analysis Limitations

1. **データの完全性**: すべての領域がすべてのフィールドを持つわけではありません
   - Data completeness: Not all territories have all fields populated

2. **政治的な配慮**: 一部の領域は国際的な承認状況が複雑です
   - Political sensitivity: Some territories have complex international recognition status

3. **動的な状況**: 関税・税制システムは変更される可能性があります
   - Dynamic situation: Customs and tax systems may change over time

### 📚 参考資料 / References

- World Trade Organization (WTO) - Customs Territories
- Universal Postal Union (UPU) - Member Countries
- International Organization for Standardization (ISO 3166-1)

---

## 使用方法 / Usage

### スクリプトの実行 / Running the Analysis Script

```bash
# データベース内の特殊領域を分析
node scripts/identify-special-territories.js

# 結果はコンソールに表示され、JSONレポートが生成されます
# Results will be displayed in console and a JSON report will be generated
```

### JSONレポートの参照 / Accessing the JSON Report

```bash
# JSONレポートを表示
cat docs/special-territories-report.json

# jqを使用して特定のカテゴリーを抽出
jq '.territories.effectivelyIndependent' docs/special-territories-report.json
jq '.territories.specialCustomsTerritories' docs/special-territories-report.json
```

---

## まとめ / Conclusion

このデータベースには、**325のエンティティ**が含まれており、そのうち：

This database contains **325 entities**, of which:

- **68** が実質的に独立的な領域
- **199** が特殊関税領域
- **2** が特別行政区 (SAR)
- **57** が独自通貨を持つ自治領域
- **35** が特別自治地域

これらの領域は、国際配送、税関手続き、電子商取引において特別な対応が必要です。

These territories require special handling in international shipping, customs procedures, and e-commerce.

---

**Generated by:** `scripts/identify-special-territories.js`  
**Last Updated:** 2025-12-07  
**Data Source:** World Address YAML Database
