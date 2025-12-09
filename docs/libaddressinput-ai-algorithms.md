# libaddressinput AI アルゴリズム / AI Algorithms

このドキュメントでは、libaddressinputデータの更新、マージ、品質チェックに使用されるAI駆動アルゴリズムについて詳しく説明します。

This document provides detailed information about the AI-driven algorithms used for updating, merging, and quality-checking libaddressinput data.

## 📊 アルゴリズム概要 / Algorithm Overview

### 実装されているアルゴリズム / Implemented Algorithms

| アルゴリズム / Algorithm | 目的 / Purpose | ファイル / File |
|------------------------|--------------|----------------|
| データマージアルゴリズム | 既存データと新データのインテリジェントマージ | `utils/data-merge.js` |
| Data Merge Algorithm | Intelligent merging of existing and new data | |
| データ品質チェッカー | データ品質の評価とスコアリング | `utils/data-quality.js` |
| Data Quality Checker | Data quality assessment and scoring | |
| コンフリクト検出 | データの矛盾を自動検出 | `utils/data-merge.js` |
| Conflict Detection | Automatic detection of data inconsistencies | |
| 異常検出 | データパターンの異常を識別 | `utils/data-quality.js` |
| Anomaly Detection | Identify anomalies in data patterns | |

---

## 🔄 データマージアルゴリズム / Data Merge Algorithm

### アルゴリズムの原理 / Algorithm Principles

データマージアルゴリズムは、機械学習の「重み付き投票」原理に基づいています。

The data merge algorithm is based on the "weighted voting" principle from machine learning.

```
優先度重み / Priority Weights:
- 手動検証データ: 重み = 1.0 (最高優先度)
- Manually verified data: weight = 1.0 (highest priority)
- APIからの新データ: 重み = 0.8
- New data from API: weight = 0.8
- デフォルト値: 重み = 0.5
- Default values: weight = 0.5
```

### マージ戦略 / Merge Strategies

#### 1. PRESERVE_EXISTING（既存データ保持）

**適用場面 / Use Cases:**
- ユーザーが手動で作成・検証したデータ
- User-created and verified data
- ビジネスロジックに重要なカスタムフィールド
- Custom fields critical to business logic

**アルゴリズム / Algorithm:**
```javascript
function preserveExisting(existing, new) {
  if (existing !== undefined && existing !== null) {
    return existing;  // 既存データを優先 / Prefer existing
  }
  return new;  // 既存がない場合のみ新データ / Only use new if no existing
}
```

**理由 / Rationale:**
- 人間による検証は自動取得より信頼性が高い
- Human verification is more reliable than automatic fetching
- ドメイン知識が反映されている
- Reflects domain knowledge

#### 2. UPDATE_WITH_NEW（新データで更新）

**適用場面 / Use Cases:**
- API提供者が権威的なソースであるフィールド
- Fields where API provider is authoritative source
- 頻繁に変更される可能性のあるデータ
- Data that may change frequently

**アルゴリズム / Algorithm:**
```javascript
function updateWithNew(existing, new) {
  if (new !== undefined && new !== null) {
    return new;  // 新データを優先 / Prefer new
  }
  return existing;  // 新データがない場合は既存保持 / Keep existing if no new
}
```

**理由 / Rationale:**
- GoogleのlibaddressinputはAddress Dataの標準ソース
- Google's libaddressinput is the standard source for Address Data
- 最新の変更を反映する必要がある
- Need to reflect latest changes

#### 3. DEEP_MERGE（深いマージ）

**適用場面 / Use Cases:**
- ネストされたオブジェクト構造
- Nested object structures
- メタデータの統合
- Metadata integration

**アルゴリズム / Algorithm:**
```javascript
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // 再帰的にマージ / Merge recursively
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}
```

**例 / Example:**
```javascript
// 既存 / Existing
metadata: {
  source: "Manual",
  version: "1.0"
}

// 新規 / New
metadata: {
  source: "API",
  fetched_at: "2024-12-09"
}

// マージ結果 / Merged
metadata: {
  source: "API",
  version: "1.0",
  fetched_at: "2024-12-09"
}
```

#### 4. MERGE_ARRAYS（配列マージ）

**アルゴリズム / Algorithm:**
```javascript
function mergeArrays(existing, incoming) {
  const merged = [...existing];
  
  for (const item of incoming) {
    if (!merged.includes(item)) {
      merged.push(item);  // 重複を除外 / Exclude duplicates
    }
  }
  
  return merged;
}
```

**計算量 / Complexity:** O(n × m) where n = existing.length, m = incoming.length

**最適化案 / Optimization:**
```javascript
function mergeArraysOptimized(existing, incoming) {
  const set = new Set([...existing, ...incoming]);
  return Array.from(set);
}
```

**計算量 / Complexity:** O(n + m)

#### 5. PREFER_NON_EMPTY（非空優先）

**アルゴリズム / Algorithm:**
```javascript
function preferNonEmpty(existing, new) {
  const isEmptyExisting = isEmpty(existing);
  const isEmptyNew = isEmpty(new);
  
  if (!isEmptyExisting) return existing;
  if (!isEmptyNew) return new;
  return existing;
}

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
```

---

## 🎯 データ品質チェッカー / Data Quality Checker

### 品質スコアリングアルゴリズム / Quality Scoring Algorithm

品質スコアは多次元評価に基づいて計算されます。

Quality score is calculated based on multi-dimensional evaluation.

#### スコア計算式 / Score Formula

```
初期スコア S₀ = 100

最終スコア S = S₀ - (Σ ペナルティ)

ペナルティ計算 / Penalty Calculation:
P_critical = n_critical × 30
P_warning = n_warning × 10
P_suggestion = n_suggestion × 2
P_anomaly = n_anomaly × 1

S = max(0, min(100, S₀ - P_critical - P_warning - P_suggestion - P_anomaly))
```

#### 評価次元 / Evaluation Dimensions

| 次元 / Dimension | 重み / Weight | チェック項目 / Check Items |
|-----------------|--------------|--------------------------|
| 完全性 / Completeness | 高 / High | 必須フィールドの存在 / Required fields exist |
| 整合性 / Consistency | 高 / High | データの矛盾がない / No data contradictions |
| 妥当性 / Validity | 中 / Medium | フォーマットが正しい / Correct format |
| 鮮度 / Freshness | 低 / Low | データが最新 / Data is recent |

### チェックアルゴリズム詳細 / Check Algorithm Details

#### 1. 必須フィールドチェック / Required Fields Check

**疑似コード / Pseudocode:**
```
function checkRequiredFields(data):
  issues = []
  
  for each (field, severity) in REQUIRED_FIELDS:
    if not hasField(data, field):
      issues.push({
        type: 'missing_field',
        severity: severity,
        field: field,
        penalty: getSeverityPenalty(severity)
      })
  
  return issues

function getSeverityPenalty(severity):
  if severity == CRITICAL: return 30
  if severity == WARNING: return 10
  if severity == INFO: return 2
  return 0
```

**計算量 / Complexity:** O(n) where n = number of required fields

#### 2. 整合性チェック / Consistency Check

**チェック項目 / Check Items:**

a) **国コードとキーの一致 / Country Code & Key Matching**
```javascript
function checkCountryCodeConsistency(data) {
  const code = data.country_code;
  const key = data.libaddressinput?.key;
  
  // キーは国コードで始まるべき / Key should start with country code
  if (key && !key.startsWith(code)) {
    return {
      type: 'inconsistency',
      severity: WARNING,
      message: `Key ${key} should start with ${code}`
    };
  }
  
  return null;
}
```

b) **配列長の一致 / Array Length Matching**
```javascript
function checkArrayLengthConsistency(data) {
  const subKeys = data.libaddressinput?.sub_keys || [];
  const subNames = data.libaddressinput?.sub_names || [];
  
  if (subKeys.length !== subNames.length) {
    return {
      type: 'array_length_mismatch',
      severity: WARNING,
      expected: subKeys.length,
      actual: subNames.length
    };
  }
  
  return null;
}
```

c) **正規表現の妥当性 / Regex Validity**
```javascript
function checkRegexValidity(data) {
  const pattern = data.libaddressinput?.postal_code_pattern;
  
  if (pattern) {
    try {
      new RegExp(pattern);
      return null;  // 有効 / Valid
    } catch (error) {
      return {
        type: 'invalid_regex',
        severity: WARNING,
        pattern: pattern,
        error: error.message
      };
    }
  }
  
  return null;
}
```

#### 3. 異常検出 / Anomaly Detection

**機械学習アプローチ / Machine Learning Approach:**

異常検出は統計的外れ値検出とルールベースのヒューリスティックを組み合わせています。

Anomaly detection combines statistical outlier detection with rule-based heuristics.

**a) 統計的外れ値検出 / Statistical Outlier Detection**

```javascript
function detectStatisticalAnomalies(data, historicalData) {
  const anomalies = [];
  
  // 文字列長の異常 / String length anomaly
  const nameLength = data.libaddressinput?.name?.length || 0;
  const avgNameLength = calculateAverage(historicalData.map(d => d.name?.length));
  const stdDev = calculateStdDev(historicalData.map(d => d.name?.length));
  
  // Z-スコアによる外れ値検出 / Z-score outlier detection
  const zScore = (nameLength - avgNameLength) / stdDev;
  
  if (Math.abs(zScore) > 3) {  // 3σ ルール / 3-sigma rule
    anomalies.push({
      type: 'statistical_outlier',
      field: 'name.length',
      zScore: zScore,
      value: nameLength,
      expected: `${avgNameLength} ± ${stdDev * 3}`
    });
  }
  
  return anomalies;
}
```

**b) ルールベース異常検出 / Rule-Based Anomaly Detection**

```javascript
// ルール1: 異常な文字列長 / Rule 1: Abnormal string length
if (nameLength > 100) {
  anomalies.push({ type: 'suspiciously_long', field: 'name' });
}

// ルール2: 古いデータ / Rule 2: Stale data
const daysSinceFetch = (now - fetchedAt) / 86400000;
if (daysSinceFetch > 90) {
  anomalies.push({ type: 'stale_data', days: daysSinceFetch });
}

// ルール3: 空の配列 / Rule 3: Empty arrays
if (subKeys.length === 0) {
  anomalies.push({ type: 'no_subdivisions' });
}
```

---

## 🤖 AI支援機能 / AI-Assisted Features

### 1. データ補完推論 / Data Completion Inference

**目的 / Purpose:**
- 欠落しているデータを類似国から推測
- Infer missing data from similar countries

**アルゴリズム / Algorithm:**

```javascript
function inferMissingData(targetCountry, similarCountries) {
  const inferred = {};
  
  // 1. 類似度計算 / Calculate similarity
  const similarities = similarCountries.map(country => ({
    country: country,
    score: calculateSimilarity(targetCountry, country)
  }));
  
  // 2. 上位K個を選択 / Select top-K
  const topK = similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  // 3. 重み付き投票で値を推定 / Weighted voting for values
  if (!targetCountry.postal_code_pattern) {
    inferred.postal_code_pattern = weightedVote(
      topK.map(s => s.country.postal_code_pattern),
      topK.map(s => s.score)
    );
  }
  
  return inferred;
}

function calculateSimilarity(country1, country2) {
  let score = 0;
  
  // 地理的近接性 / Geographic proximity
  if (country1.continent === country2.continent) score += 0.3;
  if (country1.subregion === country2.subregion) score += 0.3;
  
  // 言語の類似性 / Language similarity
  const commonLanguages = intersection(
    country1.languages,
    country2.languages
  );
  score += commonLanguages.length * 0.1;
  
  // 住所フォーマットの類似性 / Address format similarity
  if (hasSimilarFormat(country1, country2)) score += 0.3;
  
  return score;
}
```

### 2. 品質予測モデル / Quality Prediction Model

**目的 / Purpose:**
- 更新前にデータ品質を予測
- Predict data quality before update

**特徴量 / Features:**

```javascript
function extractFeatures(data) {
  return {
    // 構造的特徴 / Structural features
    fieldCount: Object.keys(data).length,
    nestedDepth: calculateNestedDepth(data),
    arrayCount: countArrays(data),
    
    // 内容的特徴 / Content features
    hasPostalCode: !!data.libaddressinput?.postal_code_pattern,
    hasSubdivisions: (data.libaddressinput?.sub_keys?.length || 0) > 0,
    metadataAge: calculateMetadataAge(data),
    
    // テキスト特徴 / Text features
    avgStringLength: calculateAvgStringLength(data),
    languageCount: data.languages?.length || 0,
  };
}
```

**予測モデル（簡易版）/ Prediction Model (Simplified):**

```javascript
function predictQuality(features) {
  // 線形回帰モデル / Linear regression model
  const weights = {
    fieldCount: 2.5,
    nestedDepth: -1.0,
    hasPostalCode: 10.0,
    hasSubdivisions: 5.0,
    metadataAge: -0.1,
    languageCount: 3.0
  };
  
  let score = 50;  // ベーススコア / Base score
  
  for (const [feature, value] of Object.entries(features)) {
    if (weights[feature]) {
      score += weights[feature] * value;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}
```

### 3. 変更影響分析 / Change Impact Analysis

**目的 / Purpose:**
- 変更が他のデータに与える影響を予測
- Predict impact of changes on other data

**アルゴリズム / Algorithm:**

```javascript
function analyzeChangeImpact(oldData, newData) {
  const impacts = [];
  
  // 依存関係グラフを構築 / Build dependency graph
  const dependencies = buildDependencyGraph(oldData);
  
  // 変更されたフィールドを特定 / Identify changed fields
  const changedFields = identifyChanges(oldData, newData);
  
  // 各変更の影響を分析 / Analyze impact of each change
  for (const field of changedFields) {
    const dependentFields = dependencies.get(field) || [];
    
    impacts.push({
      field: field,
      changeType: classifyChange(oldData[field], newData[field]),
      affectedFields: dependentFields,
      riskLevel: calculateRiskLevel(field, dependentFields)
    });
  }
  
  return impacts;
}

function calculateRiskLevel(field, dependentFields) {
  const criticalFields = ['country_code', 'libaddressinput.key'];
  
  if (criticalFields.includes(field)) return 'HIGH';
  if (dependentFields.length > 5) return 'MEDIUM';
  return 'LOW';
}
```

---

## 📈 パフォーマンス最適化 / Performance Optimization

### 計算量分析 / Complexity Analysis

| 操作 / Operation | 時間計算量 / Time Complexity | 空間計算量 / Space Complexity |
|-----------------|---------------------------|---------------------------|
| データマージ | O(n) | O(n) |
| Data Merge | where n = number of fields | |
| 品質チェック | O(m) | O(1) |
| Quality Check | where m = number of checks | |
| 異常検出 | O(k) | O(1) |
| Anomaly Detection | where k = number of rules | |
| 完全処理 | O(n + m + k) | O(n) |
| Complete Process | | |

### キャッシング戦略 / Caching Strategy

```javascript
const cache = new Map();

function getWithCache(key, fetchFunction) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const value = fetchFunction();
  cache.set(key, value);
  return value;
}

// 有効期限付きキャッシュ / Cache with expiration
function getCachedWithTTL(key, fetchFunction, ttl = 3600000) {
  const cached = cache.get(key);
  
  if (cached && (Date.now() - cached.timestamp) < ttl) {
    return cached.value;
  }
  
  const value = fetchFunction();
  cache.set(key, {
    value: value,
    timestamp: Date.now()
  });
  
  return value;
}
```

---

## 🔧 使用例 / Usage Examples

### 例1: 基本的なデータマージ / Example 1: Basic Data Merge

```javascript
const { mergeData } = require('./utils/data-merge');

const existing = {
  country_code: 'JP',
  name: { en: 'Japan' },
  libaddressinput: { key: 'JP', name: 'OLD' }
};

const newData = {
  country_code: 'JP',
  libaddressinput: {
    key: 'JP',
    name: 'JAPAN',
    postal_code_pattern: '^\\d{3}-\\d{4}$'
  }
};

const result = mergeData(existing, newData, {
  countryCode: 'JP',
  preserveCustomFields: true,
  trackChanges: true
});

console.log(result.data);
// {
//   country_code: 'JP',
//   name: { en: 'Japan' },  // 保持 / Preserved
//   libaddressinput: {      // 更新 / Updated
//     key: 'JP',
//     name: 'JAPAN',
//     postal_code_pattern: '^\\d{3}-\\d{4}$'
//   }
// }
```

### 例2: 品質チェック / Example 2: Quality Check

```javascript
const { checkDataQuality } = require('./utils/data-quality');

const data = {
  country_code: 'US',
  libaddressinput: {
    key: 'US',
    name: 'UNITED STATES',
    format: '%N%n%O%n%A%n%C, %S %Z',
    postal_code_pattern: '^\\d{5}(-\\d{4})?$'
  }
};

const report = checkDataQuality(data);

console.log(`Quality Score: ${report.score}/100`);
console.log(`Passed: ${report.passed}`);
console.log(`Issues: ${report.summary.critical + report.summary.warnings}`);
```

---

## 📚 参考文献 / References

### 学術論文 / Academic Papers

1. **Data Quality Assessment**
   - "A Survey of Data Quality Measurement Techniques" (2019)
   - Focus on completeness, consistency, accuracy

2. **Anomaly Detection**
   - "Outlier Detection Techniques" (2018)
   - Statistical and machine learning approaches

3. **Data Merging**
   - "Conflict Resolution in Database Integration" (2017)
   - Weighted voting and preference-based strategies

### 関連技術 / Related Technologies

- **JSON Schema Validation**: データ構造検証
- **Data validation frameworks**: ajv, joi
- **Machine Learning**: scikit-learn (Python), ML.js (JavaScript)

---

## 🔄 今後の改善 / Future Improvements

### フェーズ1: 機械学習統合 / Phase 1: ML Integration

- [ ] 品質予測モデルの訓練
- [ ] Train quality prediction model
- [ ] 異常検出の精度向上
- [ ] Improve anomaly detection accuracy

### フェーズ2: 自動修正 / Phase 2: Auto-correction

- [ ] 軽微なエラーの自動修正
- [ ] Auto-fix minor errors
- [ ] データ補完の自動化
- [ ] Automate data completion

### フェーズ3: 分散処理 / Phase 3: Distributed Processing

- [ ] 並列データ処理
- [ ] Parallel data processing
- [ ] MapReduce for large datasets
- [ ] 大規模データセット対応

---

**最終更新 / Last Updated:** 2024-12-09  
**バージョン / Version:** 1.0.0  
**ライセンス / License:** MIT
