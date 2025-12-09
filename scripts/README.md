# Scripts

This directory contains automation scripts for the world-address-yaml repository.

## 🚀 Latest Updates (2024-12-09)

**New AI-Powered Algorithms Added:**

- **Intelligent Data Merging**: Smart algorithm for merging libaddressinput data with existing country data
- **Data Quality Checker**: Comprehensive quality assessment with scoring (0-100)
- **Conflict Detection**: Automatic detection and resolution of data conflicts
- **Anomaly Detection**: AI-driven detection of data anomalies and outliers

See documentation:
- [libaddressinput Update Rules](../docs/libaddressinput-update-rules.md) - Complete rules and guidelines
- [libaddressinput AI Algorithms](../docs/libaddressinput-ai-algorithms.md) - Detailed algorithm documentation
- [libaddressinput v2 Algorithm](../docs/libaddressinput-v2-algorithm.md) - Version 2 improvements

## 🔄 Recent Refactoring (2025-12-07)

Major refactoring completed to improve maintainability:

- **Data Extraction**: Moved large data constants to `data/` directory (JSON files)
- **Script Consolidation**: Merged territory classification scripts into unified `analyze-territories.js`
- **Size Reduction**: Reduced script sizes by 30-83% through data extraction
- **New Utilities**: Added `utils/data-loader.js` for centralized data access

See [REFACTORING_SUMMARY.md](../REFACTORING_SUMMARY.md) for complete details.

## Structure

```
scripts/
├── utils/                      # Shared utility modules
│   ├── logger.js              # Logging utilities
│   ├── http.js                # HTTP request utilities with retry
│   ├── file.js                # File system utilities
│   ├── yaml.js                # YAML conversion utilities
│   ├── validation.js          # Data validation utilities
│   ├── data-merge.js          # 🆕 Intelligent data merging algorithms
│   ├── data-quality.js        # 🆕 Data quality checker and scorer
│   ├── data-loader.js         # Data loading utilities
│   ├── constants.js           # Configuration constants
│   └── index.js               # Central export point
├── fetch-libaddressinput.js   # Legacy data fetcher (v1)
├── fetch-libaddressinput-v2.js # Enhanced data fetcher (v2)
├── fetch-libaddressinput-v3.js # 🆕 AI-powered fetcher with merge & quality check
├── test-algorithms.js         # 🆕 Test suite for merge and quality algorithms
└── test-transform.js          # Transformation tests
```

## 🤖 fetch-libaddressinput-v3.js (Recommended)

**NEW:** Enhanced version with AI-powered data quality and intelligent merging.

Fetches address data from Google's libaddressinput API with advanced features:

### Features

- ✨ **Intelligent Data Merging** - Preserves custom fields while updating libaddressinput data
- 🔍 **Quality Checking** - Scores data quality (0-100) with detailed reports
- ⚠️ **Conflict Detection** - Detects and resolves data conflicts automatically
- 🎯 **Change Tracking** - Tracks what changed and why
- 📊 **Comprehensive Statistics** - Detailed merge and quality statistics
- 🛡️ **Safety First** - Only updates if quality check passes

### Usage

```bash
# Run using npm script (recommended)
npm run fetch:libaddressinput:v3

# Or run directly
node scripts/fetch-libaddressinput-v3.js
```

### Algorithm Overview

```
1. Fetch hierarchical data from API
2. Load existing country data
3. Intelligently merge with field-level strategies:
   - PRESERVE_EXISTING: Custom fields (name, languages, etc.)
   - UPDATE_WITH_NEW: libaddressinput section
   - DEEP_MERGE: Metadata
4. Check data quality (required fields, consistency, anomalies)
5. Resolve conflicts automatically
6. Save only if quality check passes
```

See [AI Algorithms Documentation](../docs/libaddressinput-ai-algorithms.md) for details.

## fetch-libaddressinput-v2.js

Enhanced version with hierarchical data fetching and intelligent updates.

### Features

- ✨ **Hierarchical data fetching** - Recursively fetches all sub-regions
- 🔍 **Change detection** - Only updates files when data has changed
- 🔄 **Automatic retry** on network failures with exponential backoff
- ⏱️ **Rate limiting** to avoid API throttling
- 📊 **Progress tracking** with detailed statistics

### Usage

```bash
# Run using npm script
npm run fetch:libaddressinput

# Or run directly
node scripts/fetch-libaddressinput-v2.js
```

See [v2 Algorithm Documentation](../docs/libaddressinput-v2-algorithm.md) for details.

## fetch-libaddressinput.js

Fetches address data from Google's libaddressinput API (https://chromium-i18n.appspot.com/ssl-address/data) and converts it to YAML and JSON formats.

**Refactored:** Now uses modular utilities for better maintainability and error handling.

### Usage

```bash
# Run using npm script (recommended)
npm run fetch:libaddressinput

# Or run directly
node scripts/fetch-libaddressinput.js

# Make executable and run
chmod +x scripts/fetch-libaddressinput.js
./scripts/fetch-libaddressinput.js
```

### What it does

1. Fetches address metadata for all countries from the libaddressinput API
2. Transforms the data into a structured format with validation
3. Saves both YAML and JSON versions in `data/libaddressinput/`
4. Organizes files by the first letter of the country code
5. Includes comprehensive error handling and retry logic
6. Provides progress tracking and colored console output

### Features

- **Automatic retry** - Failed requests are automatically retried with exponential backoff
- **Rate limiting** - Configurable delay between requests to avoid API throttling
- **Progress tracking** - Real-time progress bar showing fetch status
- **Error recovery** - Graceful handling of network and parsing errors
- **Validation** - Data validation before writing to disk
- **Logging** - Structured logging with different levels (debug, info, error)
- **Modular design** - Uses shared utility modules for maintainability

### Output Structure

```
data/libaddressinput/
├── A/
│   ├── AD.json
│   ├── AD.yaml
│   ├── AE.json
│   ├── AE.yaml
│   └── ...
├── B/
│   ├── BD.json
│   ├── BD.yaml
│   └── ...
└── ...
```

### Data Format

Each file contains:
- `country_code`: ISO 3166-1 alpha-2 code
- `libaddressinput`: Object containing:
  - `key`: Region key
  - `name`: Country name
  - `format`: Address format string
  - `require`: Required fields
  - `postal_code_pattern`: Postal code regex pattern
  - `postal_code_examples`: Example postal codes
  - `sub_keys`: Sub-region codes (if applicable)
  - `sub_names`: Sub-region names (if applicable)
  - Other metadata fields

### Automated Updates

This script runs automatically every day at midnight JST (15:00 UTC) via GitHub Actions workflow (`.github/workflows/auto-fetch-libaddressinput.yml`).

The workflow:
1. Fetches the latest data from libaddressinput API
2. Updates the files in `data/libaddressinput/`
3. Commits and pushes changes if any updates are detected

### Manual Trigger

You can manually trigger the workflow from the GitHub Actions tab:
1. Go to the "Actions" tab in the repository
2. Select "Auto-fetch libaddressinput data" workflow
3. Click "Run workflow"

## test-transform.js

Tests the data transformation logic with mock data for different countries.

### Usage

```bash
# Run using npm script (recommended)
npm run test:scripts

# Or run directly
node scripts/test-transform.js
```

### What it does

1. Tests transformation logic with mock data for JP (Japan) and US (United States)
2. Validates the output structure
3. Reports test results with colored output
4. Exits with appropriate status code (0 for success, 1 for failure)

## Utility Modules

The `utils/` directory contains shared utilities used by the scripts:

### logger.js

Provides colored console logging with different levels:
- `debug()` - Debug information (cyan)
- `info()` - General information (blue)
- `success()` - Success messages (green)
- `warn()` - Warning messages (yellow)
- `error()` - Error messages (red)
- `progress()` - Progress bar for long operations
- `section()` - Section headers

**Example:**
```javascript
const { createLogger } = require('./utils');
const logger = createLogger({ prefix: 'my-script' });

logger.info('Starting process...');
logger.success('Completed successfully');
```

### http.js

HTTP utilities with automatic retry logic:
- `fetchWithRetry()` - Fetch data with configurable retry
- `fetchJSON()` - Fetch and parse JSON data
- `parseJSON()` - Parse JSON from various formats (including JSONP)
- `batchFetch()` - Batch fetch multiple URLs with concurrency control

**Features:**
- Automatic retry with exponential backoff
- Configurable timeout and retry attempts
- Support for JSONP format parsing
- Batch processing with concurrency limits

### file.js

File system utilities:
- `ensureDir()` - Create directory if it doesn't exist
- `writeJSON()` - Write formatted JSON file
- `readJSON()` - Read and parse JSON file
- `writeText()` - Write text file
- `readText()` - Read text file
- `fileExists()` - Check file existence
- `listFiles()` - List files with optional filtering
- `safeWriteFile()` - Atomic file write operation

### yaml.js

YAML conversion utilities:
- `jsonToYaml()` - Convert JSON object to YAML string
- `formatYamlValue()` - Format values for YAML with proper escaping

### validation.js

Data validation utilities:
- `isValidCountryCode()` - Validate ISO country code format
- `validateLibAddressData()` - Validate libaddressinput data structure
- `validateTransformedData()` - Validate transformed data
- `sanitizeString()` - Sanitize string input
- `isValidUrl()` - Validate URL format

### constants.js

Configuration constants:
- `BASE_URL` - libaddressinput API base URL
- `COUNTRY_CODES` - Organized list of country codes by region
- `ALL_COUNTRY_CODES` - Flattened array of all country codes
- `ADDITIONAL_FIELDS` - Fields to extract from API data
- `REQUEST_CONFIG` - HTTP request configuration
- `RATE_LIMIT` - Rate limiting configuration

## Configuration

### Modifying Country List

Edit `scripts/utils/constants.js` to add or remove countries:

```javascript
const COUNTRY_CODES = {
  asia: ['JP', 'KR', 'CN', ...],
  // ... other regions
};
```

### Adjusting Rate Limiting

Edit retry and rate limit settings in `scripts/utils/constants.js`:

```javascript
const REQUEST_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  exponentialBackoff: true,
};

const RATE_LIMIT = {
  delay: 100,  // ms between requests
  batchSize: 10,
};
```

## Development

See [DEVELOPMENT.md](../DEVELOPMENT.md) for detailed development guidelines.

### Code Quality

```bash
# Lint scripts
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## analyze-territories.js

**NEW:** Unified territory classification and analysis tool (consolidates classify_territories.js and identify-special-territories.js).

Analyzes territories in the database with multiple classification modes.

### Usage

```bash
# Simple classification by file path (default)
node scripts/analyze-territories.js simple

# Detailed analysis based on autonomy indicators
node scripts/analyze-territories.js detailed

# Both simple and detailed reports
node scripts/analyze-territories.js all
```

### Classification Modes

#### Simple Mode
Path-based classification into four categories:
- **Countries (主権国家)** - Sovereign nations
- **Autonomous Territories (自治領)** - Regions with autonomy
- **Overseas Territories (海外領)** - Overseas possessions
- **Antarctica (南極)** - Antarctic territories

#### Detailed Mode
Analysis based on autonomy indicators:
- **Effectively Independent Territories** - Score >= 4/6 on independence metrics
- **Special Administrative Regions (SAR)** - e.g., Hong Kong, Macau
- **Special Customs Territories** - Own postal/currency/tax systems

Independence scoring based on:
1. Own currency
2. Own ISO code
3. Own postal system
4. Own tax system
5. Own timezone
6. Not a UN member

### Output Example

```
╔══════════════════════════════════════════════════╗
║     Simple Territory Classification Report      ║
╚══════════════════════════════════════════════════╝

📊 Summary:
   Countries (主権国家): 211
   Autonomous Territories (自治領): 13
   Overseas Territories (海外領): 44
   Antarctica (南極): 1
   Total: 325 files
```

## add-pos-data.js

**REFACTORED:** Now uses external data files from `data/` directory.

Script to add POS (Point of Sale) data to country YAML files.

### Usage

```bash
node scripts/add-pos-data.js
```

### What it does

1. Loads currency and timezone data from external JSON files
2. Scans all country YAML files
3. Adds POS section if missing (currency, tax, receipt, fiscal, payment, locale)
4. Handles special cases (territories, regions, Antarctica)

### Data Sources

- `data/currency-data.json` - ISO 4217 currency codes
- `data/timezone-data.json` - IANA timezone mappings

## add-geo-coordinates.js

**REFACTORED:** Now uses external data files from `data/` directory.

Script to add geographic coordinates to country YAML files.

### Usage

```bash
node scripts/add-geo-coordinates.js
```

### What it does

1. Loads coordinate data from external JSON files
2. Scans all country YAML files
3. Adds geo section if missing (center latitude/longitude)
4. Handles both regular countries and special regions

### Data Sources

- `data/country-coordinates.json` - Country center coordinates
- `data/special-region-coordinates.json` - Special region coordinates

