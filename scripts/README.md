# Scripts

This directory contains automation scripts for the world-address-yaml repository.

## Structure

```
scripts/
├── utils/                      # Shared utility modules
│   ├── logger.js              # Logging utilities
│   ├── http.js                # HTTP request utilities with retry
│   ├── file.js                # File system utilities
│   ├── yaml.js                # YAML conversion utilities
│   ├── validation.js          # Data validation utilities
│   ├── constants.js           # Configuration constants
│   └── index.js               # Central export point
├── fetch-libaddressinput.js   # Main data fetcher script
└── test-transform.js          # Transformation tests
```

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
