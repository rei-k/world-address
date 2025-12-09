# libaddressinput データ更新ルールとガイドライン / Data Update Rules and Guidelines

このドキュメントでは、libaddressinputデータを更新する際の明確なルールとガイドラインを定義します。

This document defines clear rules and guidelines for updating libaddressinput data.

## 📋 目次 / Table of Contents

1. [更新ルール / Update Rules](#更新ルール--update-rules)
2. [データマージルール / Data Merge Rules](#データマージルール--data-merge-rules)
3. [コンフリクト解決ルール / Conflict Resolution Rules](#コンフリクト解決ルール--conflict-resolution-rules)
4. [データ品質基準 / Data Quality Standards](#データ品質基準--data-quality-standards)
5. [自動化とAI / Automation and AI](#自動化とai--automation-and-ai)

---

## 更新ルール / Update Rules

### 基本原則 / Basic Principles

#### 1. データソースの優先順位 / Data Source Priority

```
優先度（高→低） / Priority (High → Low):
1. 手動で検証済みの国データ / Manually verified country data
2. 既存のカスタムフィールド / Existing custom fields
3. libaddressinputからの新データ / New data from libaddressinput
4. デフォルト値 / Default values
```

**ルール 1.1**: 既存の検証済みデータを保護する
- `name`, `iso_codes`, `languages`, `address_format`, `pos`, `geo` などのカスタムフィールドは常に保持
- Rule 1.1: Protect existing verified data
- Custom fields like `name`, `iso_codes`, `languages`, `address_format`, `pos`, `geo` are always preserved

**ルール 1.2**: libaddressinputセクションは常に最新に保つ
- `libaddressinput` セクションは新しいデータで上書き
- Rule 1.2: Keep libaddressinput section up-to-date
- The `libaddressinput` section is always replaced with new data

**ルール 1.3**: メタデータは統合する
- `metadata` セクションは既存と新規をマージ
- Rule 1.3: Merge metadata
- The `metadata` section merges existing and new data

#### 2. 更新タイミング / Update Timing

**ルール 2.1**: 毎日自動更新
- GitHub Actionsで毎日JST午前0時に実行
- Rule 2.1: Daily automatic updates
- Runs daily at midnight JST via GitHub Actions

**ルール 2.2**: 変更検出による効率化
- データに変更がある場合のみコミット
- Rule 2.2: Efficiency through change detection
- Commits only when data has changed

**ルール 2.3**: 手動更新の許可
- 緊急時は手動で `npm run fetch:libaddressinput` を実行可能
- Rule 2.3: Allow manual updates
- Can manually run `npm run fetch:libaddressinput` in emergencies

#### 3. データ検証 / Data Validation

**ルール 3.1**: 更新前の検証
- 新しいデータは必ず品質チェックを通過すること
- 必須フィールドの存在確認
- データ形式の妥当性確認
- Rule 3.1: Pre-update validation
- New data must pass quality checks
- Verify required fields exist
- Validate data format

**ルール 3.2**: 更新後の検証
- 更新後も既存の検証スクリプトでチェック
- `npm run validate:data` を実行
- Rule 3.2: Post-update validation
- Check with existing validation scripts after update
- Run `npm run validate:data`

---

## データマージルール / Data Merge Rules

### フィールド別マージ戦略 / Field-by-Field Merge Strategies

| フィールド / Field | 戦略 / Strategy | 理由 / Reason |
|-------------------|----------------|--------------|
| `name` | PRESERVE_EXISTING | 手動で翻訳・検証済み / Manually translated and verified |
| `iso_codes` | PRESERVE_EXISTING | ISO標準から取得済み / Already from ISO standards |
| `continent` | PRESERVE_EXISTING | 手動で分類済み / Manually classified |
| `subregion` | PRESERVE_EXISTING | 手動で分類済み / Manually classified |
| `languages` | PRESERVE_EXISTING | 詳細な言語情報を保持 / Preserve detailed language info |
| `administrative_divisions` | PRESERVE_EXISTING | カスタム行政区分データ / Custom administrative division data |
| `address_format` | PRESERVE_EXISTING | カスタム住所フォーマット / Custom address format |
| `examples` | PRESERVE_EXISTING | 手動で作成した例 / Manually created examples |
| `pos` | PRESERVE_EXISTING | POS固有データ / POS-specific data |
| `geo` | PRESERVE_EXISTING | 地理座標データ / Geographic coordinate data |
| `libaddressinput` | UPDATE_WITH_NEW | Google APIから常に最新 / Always latest from Google API |
| `metadata` | DEEP_MERGE | 両方の情報を保持 / Preserve both information |

### マージアルゴリズム / Merge Algorithm

```javascript
// 疑似コード / Pseudocode
function mergeData(existing, new) {
  result = {}
  
  // ステップ1: 既存のカスタムフィールドをコピー
  // Step 1: Copy existing custom fields
  for each field in existing {
    if field in PRESERVE_FIELDS {
      result[field] = existing[field]
    }
  }
  
  // ステップ2: libaddressinputを更新
  // Step 2: Update libaddressinput
  result.libaddressinput = new.libaddressinput
  
  // ステップ3: メタデータをマージ
  // Step 3: Merge metadata
  result.metadata = deepMerge(existing.metadata, new.metadata)
  
  // ステップ4: 新しいフィールドを追加
  // Step 4: Add new fields
  for each field in new {
    if field not in result {
      result[field] = new[field]
    }
  }
  
  return result
}
```

---

## コンフリクト解決ルール / Conflict Resolution Rules

### コンフリクトの種類 / Types of Conflicts

#### 1. フィールド値の不一致 / Field Value Mismatch

**状況 / Situation**: 既存データと新データで同じフィールドの値が異なる

**解決ルール / Resolution Rule**:
- 保護フィールド（PRESERVE_EXISTING）の場合: 既存データを優先
- If protected field (PRESERVE_EXISTING): Prefer existing data
- 更新フィールド（UPDATE_WITH_NEW）の場合: 新データを優先
- If update field (UPDATE_WITH_NEW): Prefer new data

**ログ記録 / Logging**:
```
Conflict detected in field 'name'
  Existing: "日本"
  New: "JAPAN"
  Resolution: Preserved existing value
```

#### 2. 配列長の不一致 / Array Length Mismatch

**状況 / Situation**: `sub_keys` と `sub_names` の配列長が異なる

**解決ルール / Resolution Rule**:
- 警告を記録
- Log warning
- データを受け入れるが品質スコアを下げる
- Accept data but lower quality score
- 手動確認を推奨
- Recommend manual verification

#### 3. 必須フィールドの欠落 / Missing Required Fields

**状況 / Situation**: 新データに必須フィールドがない

**解決ルール / Resolution Rule**:
- 既存データから必須フィールドを保持
- Preserve required fields from existing data
- 新データは部分的に統合
- Partially integrate new data
- エラーログを記録
- Log error

### コンフリクト検出アルゴリズム / Conflict Detection Algorithm

```javascript
function detectConflicts(existing, new) {
  conflicts = []
  
  for each field in PRESERVE_FIELDS {
    if existing[field] exists AND new[field] exists {
      if existing[field] != new[field] {
        conflicts.push({
          field: field,
          existing: existing[field],
          new: new[field],
          resolution: 'preserve_existing'
        })
      }
    }
  }
  
  return conflicts
}
```

---

## データ品質基準 / Data Quality Standards

### 必須要件 / Required Standards

#### レベル1: クリティカル / Level 1: Critical

これらが欠けている場合、データは無効
If these are missing, data is invalid

- ✅ `country_code` が存在し、有効なISO 3166-1 alpha-2形式
- ✅ `country_code` exists and is valid ISO 3166-1 alpha-2 format
- ✅ `libaddressinput` セクションが存在
- ✅ `libaddressinput` section exists
- ✅ `libaddressinput.key` が存在
- ✅ `libaddressinput.key` exists

**品質スコア影響 / Quality Score Impact**: -30点/項目 / -30 points per item

#### レベル2: 警告 / Level 2: Warning

これらが欠けている場合、警告を発する
If these are missing, issue warning

- ⚠️ `libaddressinput.name` が存在
- ⚠️ `libaddressinput.name` exists
- ⚠️ `country_code` と `libaddressinput.key` が一致
- ⚠️ `country_code` matches `libaddressinput.key`
- ⚠️ `sub_keys` と `sub_names` の配列長が一致
- ⚠️ Array lengths of `sub_keys` and `sub_names` match
- ⚠️ 正規表現パターンが有効
- ⚠️ Regex patterns are valid

**品質スコア影響 / Quality Score Impact**: -10点/項目 / -10 points per item

#### レベル3: 推奨 / Level 3: Recommended

これらがあるとデータがより完全になる
These make data more complete

- ℹ️ `libaddressinput.format` が存在
- ℹ️ `libaddressinput.format` exists
- ℹ️ `libaddressinput.postal_code_pattern` が存在
- ℹ️ `libaddressinput.postal_code_pattern` exists
- ℹ️ `libaddressinput.postal_code_examples` が存在
- ℹ️ `libaddressinput.postal_code_examples` exists
- ℹ️ `metadata.source` が存在
- ℹ️ `metadata.source` exists
- ℹ️ `metadata.fetched_at` が存在
- ℹ️ `metadata.fetched_at` exists

**品質スコア影響 / Quality Score Impact**: -2点/項目 / -2 points per item

### 品質スコア計算 / Quality Score Calculation

```
初期スコア / Initial Score: 100

最終スコア / Final Score = 100
  - (クリティカル数 × 30)
  - (Critical count × 30)
  - (警告数 × 10)
  - (Warning count × 10)
  - (推奨欠落数 × 2)
  - (Missing recommended × 2)
  - (異常検出数 × 1)
  - (Anomaly count × 1)

最小値 / Minimum: 0
最大値 / Maximum: 100
```

### 合格基準 / Pass Criteria

```
✓ 合格 / PASS: スコア ≥ 80 かつ クリティカル問題 = 0
✗ 不合格 / FAIL: スコア < 80 または クリティカル問題 > 0
```

---

## 自動化とAI / Automation and AI

### 自動化されたプロセス / Automated Processes

#### 1. データ取得 / Data Fetching

```yaml
トリガー / Triggers:
  - スケジュール: 毎日JST午前0時
  - Schedule: Daily at midnight JST
  - 手動: workflow_dispatch
  - Manual: workflow_dispatch

プロセス / Process:
  1. 全国コードをループ
  2. Loop through all country codes
  3. 階層的にデータを取得
  4. Fetch data hierarchically
  5. 変更を検出
  6. Detect changes
  7. データをマージ
  8. Merge data
  9. 品質をチェック
  10. Check quality
  11. 変更をコミット
  12. Commit changes
```

#### 2. データ検証 / Data Validation

```yaml
タイミング / Timing:
  - データ取得後
  - After data fetching
  - プルリクエスト時
  - On pull request
  - 手動実行
  - Manual execution

チェック項目 / Checks:
  - 必須フィールド
  - Required fields
  - データ整合性
  - Data consistency
  - 正規表現の妥当性
  - Regex validity
  - 配列長の一致
  - Array length matching
```

### AI支援機能 / AI-Assisted Features

#### 1. 異常検出 / Anomaly Detection

**アルゴリズム / Algorithm**:
```javascript
function detectAnomalies(data) {
  anomalies = []
  
  // 異常な文字列長を検出
  // Detect abnormal string lengths
  if data.name.length > 100 {
    anomalies.push('Name too long')
  }
  
  // 古いデータを検出
  // Detect stale data
  daysSinceFetch = (now - data.metadata.fetched_at) / 86400000
  if daysSinceFetch > 90 {
    anomalies.push('Data is stale')
  }
  
  // 空の配列を検出
  // Detect empty arrays
  if data.sub_keys.length == 0 {
    anomalies.push('No subdivisions')
  }
  
  return anomalies
}
```

#### 2. データ補完推論 / Data Completion Inference

**使用例 / Use Cases**:
- 欠落している住所フォーマットの推測
- Infer missing address formats
- 郵便番号パターンの生成
- Generate postal code patterns
- 類似国からのデータ推定
- Estimate data from similar countries

**実装状況 / Implementation Status**:
- 🔄 Phase 1: 基本的な異常検出を実装済み
- 🔄 Phase 1: Basic anomaly detection implemented
- 📋 Phase 2: データ補完機能を計画中
- 📋 Phase 2: Data completion feature planned
- 📋 Phase 3: 機械学習による品質予測を検討中
- 📋 Phase 3: ML-based quality prediction under consideration

#### 3. 品質スコア予測 / Quality Score Prediction

**目的 / Purpose**:
- 更新前にデータ品質を予測
- Predict data quality before update
- 問題のある更新を防ぐ
- Prevent problematic updates

**アプローチ / Approach**:
```
1. 履歴データからパターンを学習
   Learn patterns from historical data
2. 新データの品質スコアを予測
   Predict quality score for new data
3. しきい値以下の場合は警告
   Warn if below threshold
4. 手動レビューを推奨
   Recommend manual review
```

---

## 実装ガイドライン / Implementation Guidelines

### コーディング規約 / Coding Standards

```javascript
// ✓ 良い例 / Good Example
const { mergeData } = require('./utils/data-merge');
const existingData = readJSON('existing.json');
const newData = fetchFromAPI();
const result = mergeData(existingData, newData, {
  countryCode: 'JP',
  preserveCustomFields: true,
  trackChanges: true
});

// ✗ 悪い例 / Bad Example
let data = JSON.parse(fs.readFileSync('file.json'));
data = {...data, ...newData}; // カスタムフィールドが失われる / Loses custom fields
```

### エラーハンドリング / Error Handling

```javascript
try {
  const result = mergeData(existing, new);
  
  if (!result.data) {
    throw new Error('Merge failed');
  }
  
  if (result.conflicts.length > 0) {
    logger.warn(`${result.conflicts.length} conflicts detected`);
  }
  
  // 品質チェック / Quality check
  const quality = checkDataQuality(result.data);
  if (!quality.passed) {
    logger.error('Quality check failed');
    return;
  }
  
  saveData(result.data);
} catch (error) {
  logger.error(`Update failed: ${error.message}`);
  // ロールバックまたは既存データを保持
  // Rollback or preserve existing data
}
```

### テスト要件 / Testing Requirements

```javascript
// データマージのテスト / Test data merge
describe('Data Merge', () => {
  it('should preserve custom fields', () => {
    const existing = { name: 'Custom', libaddressinput: {} };
    const new = { name: 'API', libaddressinput: { key: 'JP' } };
    const result = mergeData(existing, new);
    expect(result.data.name).toBe('Custom');
  });
  
  it('should update libaddressinput section', () => {
    const existing = { libaddressinput: { key: 'OLD' } };
    const new = { libaddressinput: { key: 'NEW' } };
    const result = mergeData(existing, new);
    expect(result.data.libaddressinput.key).toBe('NEW');
  });
});
```

---

## リファレンス / Reference

### 関連ファイル / Related Files

- `scripts/fetch-libaddressinput-v2.js` - メインフェッチスクリプト / Main fetch script
- `scripts/utils/data-merge.js` - データマージアルゴリズム / Data merge algorithm
- `scripts/utils/data-quality.js` - データ品質チェッカー / Data quality checker
- `scripts/utils/validation.js` - 基本バリデーション / Basic validation
- `.github/workflows/auto-fetch-libaddressinput.yml` - 自動化ワークフロー / Automation workflow

### 外部リソース / External Resources

- [Google libaddressinput API](https://chromium-i18n.appspot.com/ssl-address/)
- [ISO 3166 Country Codes](https://www.iso.org/iso-3166-country-codes.html)
- [Address Data Schema](../docs/schema/README.md)

---

## 変更履歴 / Change History

| 日付 / Date | バージョン / Version | 変更内容 / Changes |
|------------|---------------------|------------------|
| 2024-12-09 | 1.0.0 | 初版作成 / Initial version |

---

## ライセンス / License

MIT License - See [LICENSE](../../LICENSE) for details
