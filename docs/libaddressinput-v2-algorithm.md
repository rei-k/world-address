# libaddressinput v2 アルゴリズム / Algorithm

このドキュメントは、libaddressinputデータを正しく更新するための改良されたv2アルゴリズムについて説明します。

This document describes the improved v2 algorithm for properly updating libaddressinput data.

## 概要 / Overview

### v1からの改善点 / Improvements from v1

1. **階層的データ取得 / Hierarchical Data Fetching**
   - 国レベルだけでなく、すべての地域・サブリージョンを再帰的に取得
   - Recursively fetches all regions and sub-regions, not just country-level data

2. **変更検出 / Change Detection**
   - 既存データと比較し、変更があった場合のみ更新
   - Compares with existing data and updates only when changes are detected

3. **インテリジェントマージ / Intelligent Merging**
   - 既存の国データを保持しながらlibaddressinputセクションを更新可能
   - Can update libaddressinput section while preserving existing country data

4. **改善されたエラー処理 / Enhanced Error Handling**
   - 指数バックオフによる再試行ロジック
   - Retry logic with exponential backoff
   - より詳細なエラーログとデバッグ情報
   - More detailed error logging and debug information

5. **包括的なロギング / Comprehensive Logging**
   - 進捗状況の詳細な追跡
   - Detailed progress tracking
   - 実行統計とサマリー
   - Execution statistics and summary

6. **レート制限対応 / Rate Limiting**
   - APIスロットリングを避けるための遅延制御
   - Delay control to avoid API throttling

## アルゴリズムの詳細 / Algorithm Details

### データ取得プロセス / Data Fetching Process

```
1. 国コード取得
   Get country code
   ↓
2. 国レベルデータ取得
   Fetch country-level data
   ↓
3. サブキーの確認
   Check for sub_keys
   ↓
4. サブリージョンを再帰的に取得（深さ優先探索）
   Recursively fetch sub-regions (depth-first search)
   ↓
5. データ変換とフォーマット
   Transform and format data
   ↓
6. 既存データとの差分比較
   Compare with existing data
   ↓
7. 変更がある場合のみ保存（JSON + YAML）
   Save only if changed (JSON + YAML)
```

### データ構造 / Data Structure

```yaml
country_code: US
libaddressinput:
  key: US
  name: UNITED STATES
  format: "%N%n%O%n%A%n%C, %S %Z"
  required_fields: ACS
  uppercase_fields: CS
  postal_code_pattern: "(\\d{5})(?:[ \\-](\\d{4}))?"
  postal_code_examples: "95014~22162-1010"
  state_name_type: state
  sub_keys:
    - AL
    - AK
    - ...
  sub_names:
    - Alabama
    - Alaska
    - ...
  sub_regions:
    AL:
      key: US/AL
      name: Alabama
      # ... more data
    AK:
      key: US/AK
      name: Alaska
      # ... more data
metadata:
  source: "Google libaddressinput API"
  source_url: "https://chromium-i18n.appspot.com/ssl-address/data/US"
  fetched_at: "2024-12-03T09:30:00.000Z"
  version: "2.0"
```

## 使用方法 / Usage

### 基本的な使用 / Basic Usage

```bash
# すべての国のデータを取得
# Fetch data for all countries
npm run fetch:libaddressinput

# または直接実行
# Or run directly
node scripts/fetch-libaddressinput-v2.js
```

### 統計情報 / Statistics Output

スクリプト実行後、以下の統計情報が表示されます：

After execution, the following statistics are displayed:

```
============================================================
SUMMARY
============================================================
Execution time: 125.43s

Countries:
  Total: 241
  Success: 238
  Unchanged: 150
  Failed: 3

Regions fetched:
  Total: 5421
  Success: 5398
  Failed: 23

Changes:
  New files: 88
  Updated files: 0
```

## 設定 / Configuration

設定は `scripts/utils/constants.js` で管理されています：

Configuration is managed in `scripts/utils/constants.js`:

```javascript
// リクエスト設定
const REQUEST_CONFIG = {
  maxRetries: 3,           // 最大再試行回数
  retryDelay: 1000,        // 再試行遅延（ミリ秒）
  timeout: 30000,          // タイムアウト（ミリ秒）
  exponentialBackoff: true // 指数バックオフを使用
};

// レート制限設定
const RATE_LIMIT = {
  delay: 100,      // リクエスト間の遅延（ミリ秒）
  batchSize: 10    // 同時リクエスト数
};
```

## トラブルシューティング / Troubleshooting

### ネットワークエラー / Network Errors

```
Failed to fetch XX: getaddrinfo ENOTFOUND chromium-i18n.appspot.com
```

**解決方法 / Solution:**
1. インターネット接続を確認 / Check internet connection
2. APIエンドポイントが利用可能か確認 / Verify API endpoint is accessible
3. `constants.js`で再試行設定を調整 / Adjust retry settings in `constants.js`

### レート制限 / Rate Limiting

```
Failed to fetch XX: 429 Too Many Requests
```

**解決方法 / Solution:**
1. `RATE_LIMIT.delay`を増やす（例：200ms） / Increase `RATE_LIMIT.delay` (e.g., 200ms)
2. `REQUEST_CONFIG.retryDelay`を増やす / Increase `REQUEST_CONFIG.retryDelay`

### データ変換エラー / Data Transformation Errors

```
Failed to process XX: Cannot read property 'split' of undefined
```

**解決方法 / Solution:**
1. APIレスポンス形式が変更されていないか確認 / Check if API response format has changed
2. `transformData`関数を確認し、必要に応じて更新 / Review and update `transformData` function if needed

## ベストプラクティス / Best Practices

1. **定期実行 / Regular Execution**
   - GitHub Actionsで毎日自動実行を推奨
   - Recommended to run daily via GitHub Actions

2. **変更の確認 / Verify Changes**
   - 更新後は差分を確認
   - Review diffs after updates

3. **バックアップ / Backups**
   - Gitの履歴で自動バックアップされる
   - Automatically backed up via Git history

4. **段階的ロールアウト / Gradual Rollout**
   - 新しいデータは段階的に導入
   - Introduce new data gradually

## 技術仕様 / Technical Specifications

### パフォーマンス / Performance

- **平均実行時間 / Average execution time**: ~2-3分（241カ国） / ~2-3 minutes (241 countries)
- **APIリクエスト数 / API requests**: ~5000-7000リクエスト / ~5000-7000 requests
- **データサイズ / Data size**: ~10-15MB（全国合計） / ~10-15MB (all countries)

### 互換性 / Compatibility

- **Node.js**: >= 14.x
- **依存関係 / Dependencies**: js-yaml のみ / js-yaml only
- **OS**: Linux, macOS, Windows

## 今後の改善計画 / Future Improvements

1. **並列処理 / Parallel Processing**
   - 複数国を同時に処理（要レート制限考慮）
   - Process multiple countries in parallel (considering rate limits)

2. **差分更新 / Differential Updates**
   - 前回から変更があった国のみ更新
   - Update only countries that changed since last run

3. **キャッシング / Caching**
   - ローカルキャッシュで不要なリクエストを削減
   - Reduce unnecessary requests with local caching

4. **データ検証 / Data Validation**
   - フェッチしたデータの自動検証
   - Automatic validation of fetched data

## ライセンス / License

MIT License - 詳細は [LICENSE](../LICENSE) を参照

MIT License - See [LICENSE](../LICENSE) for details

## 参考資料 / References

- [Google libaddressinput API](https://chromium-i18n.appspot.com/ssl-address/)
- [DEVELOPMENT.md](../DEVELOPMENT.md)
- [ROADMAP.md](../ROADMAP.md)
