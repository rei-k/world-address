# Development Guide

This guide provides information for developers working on the world-address-yaml project.

## Project Structure

```
world-address-yaml/
├── .github/              # GitHub configurations and workflows
│   └── workflows/        # CI/CD workflows
├── data/                 # Address data files
│   ├── africa/          # African countries data
│   ├── americas/        # Americas countries data
│   ├── asia/            # Asian countries data
│   ├── europe/          # European countries data
│   ├── oceania/         # Oceania countries data
│   └── libaddressinput/ # Google libaddressinput API data cache
├── docs/                # Documentation
├── scripts/             # Automation scripts
│   ├── utils/          # Shared utility modules
│   ├── fetch-libaddressinput.js  # Data fetcher script
│   └── test-transform.js         # Transformation tests
└── sdk/                # SDK packages for various languages
    ├── core/           # Core SDK (TypeScript)
    ├── react/          # React SDK
    ├── vue/            # Vue SDK
    └── ...             # Other platform-specific SDKs
```

## Scripts

### Utility Modules

The `scripts/utils/` directory contains reusable utility modules:

- **logger.js** - Colored console logging with different levels (debug, info, warn, error)
- **http.js** - HTTP requests with retry logic and error handling
- **file.js** - File system operations (read/write JSON/text, directory management)
- **yaml.js** - JSON to YAML conversion utilities
- **validation.js** - Data validation helpers
- **constants.js** - Configuration constants and country codes

### Main Scripts

#### fetch-libaddressinput.js (v1 - Legacy)

Original version that fetches basic address data from Google's libaddressinput API.

**Note:** The v1 script is kept for reference. Use `fetch-libaddressinput-v2.js` for new data fetching.

#### fetch-libaddressinput-v2.js (Recommended)

Enhanced version with hierarchical data fetching and intelligent updates.

**Usage:**
```bash
npm run fetch:libaddressinput
# or
node scripts/fetch-libaddressinput-v2.js
```

**Features:**
- ✨ **Hierarchical data fetching** - Recursively fetches all sub-regions
- 🔍 **Change detection** - Only updates files when data has changed
- 🔄 **Automatic retry** on network failures with exponential backoff
- ⏱️ **Rate limiting** to avoid API throttling
- 📊 **Progress tracking** with detailed statistics
- 🎯 **Comprehensive error handling**
- 📁 **Dual format output** (YAML + JSON)
- 📈 **Metadata tracking** - Records fetch time and source information

**Improvements over v1:**
- Fetches complete hierarchical data (country → regions → subregions)
- Intelligent change detection to avoid unnecessary updates
- Better error handling and retry logic
- Comprehensive logging and statistics
- Supports incremental updates

**Configuration:**
- Edit `scripts/utils/constants.js` to modify:
  - Country codes to fetch
  - Request retry settings
  - Rate limiting parameters

**See also:** [libaddressinput v2 Algorithm Documentation](./docs/libaddressinput-v2-algorithm.md)

#### test-libaddressinput-v2.js

Tests the v2 transformation logic with mock data.

**Usage:**
```bash
npm run test:v2
# or
node scripts/test-libaddressinput-v2.js
```

**Features:**
- Validates data transformation logic
- Tests hierarchical data handling
- Tests Japanese and multilingual data
- Edge case testing
- Output structure validation

#### test-transform.js

Tests the data transformation logic with mock data.

**Usage:**
```bash
npm run test:scripts
# or
node scripts/test-transform.js
```

## Code Quality

### Linting

The project uses ESLint for JavaScript code quality:

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Code Formatting

Prettier is used for consistent code formatting:

```bash
# Check formatting
npm run format:check

# Auto-format code
npm run format
```

### Editor Configuration

The project includes `.editorconfig` for consistent coding style across editors:
- 2 spaces for indentation
- UTF-8 encoding
- LF line endings
- Trim trailing whitespace

## Development Workflow

### 1. Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/rei-k/world-address-yaml.git
cd world-address-yaml

# Install dependencies (if needed)
npm install
```

### 2. Making Changes to Scripts

1. Edit files in `scripts/` directory
2. Test your changes:
   ```bash
   npm run test:scripts
   ```
3. Lint your code:
   ```bash
   npm run lint
   ```
4. Format your code:
   ```bash
   npm run format
   ```

### 3. Adding New Utility Functions

When adding new utility functions:

1. Create a new module in `scripts/utils/` or add to existing module
2. Export the functions in the module
3. Add exports to `scripts/utils/index.js`
4. Document the function with JSDoc comments
5. Add tests if applicable

**Example:**
```javascript
/**
 * Calculate something useful
 * @param {number} value - Input value
 * @returns {number} Calculated result
 */
function calculateSomething(value) {
  return value * 2;
}

module.exports = { calculateSomething };
```

### 4. Testing Data Transformation

The transformation logic is tested in `scripts/test-transform.js`:

```javascript
const { transformLibAddressData } = require('./fetch-libaddressinput.js');

const mockData = { /* your test data */ };
const result = transformLibAddressData('US', mockData);
console.log(result);
```

## Best Practices

### Error Handling

Always handle errors gracefully:

```javascript
try {
  const data = await fetchJSON(url);
  // Process data
} catch (error) {
  logger.error(`Failed to fetch data: ${error.message}`);
  // Handle error appropriately
}
```

### Logging

Use the logger utility for consistent output:

```javascript
const { createLogger } = require('./utils');
const logger = createLogger({ prefix: 'my-script' });

logger.info('Starting process...');
logger.success('Process completed');
logger.error('Something went wrong');
```

### File Operations

Use the file utilities instead of raw fs operations:

```javascript
const { writeJSON, readJSON } = require('./utils');

// Write JSON
writeJSON('/path/to/file.json', data);

// Read JSON
const data = readJSON('/path/to/file.json');
```

### Constants

Define magic numbers and strings in `constants.js`:

```javascript
// Bad
const delay = 1000;

// Good
const { RATE_LIMIT } = require('./utils');
const delay = RATE_LIMIT.delay;
```

## Continuous Integration

The project uses GitHub Actions for CI/CD:

### Auto-fetch libaddressinput data

Workflow: `.github/workflows/auto-fetch-libaddressinput.yml`

**Schedule:** Daily at midnight JST (15:00 UTC)

**Actions:**
1. Fetches latest data from libaddressinput API
2. Updates data files if changes detected
3. Commits and pushes changes automatically

**Manual Trigger:**
Go to Actions tab → "Auto-fetch libaddressinput data" → Run workflow

## Troubleshooting

### Network Issues

If fetch script fails with network errors:
1. Check internet connection
2. Verify API endpoint is accessible
3. Adjust retry settings in `constants.js`

### Data Validation Errors

If data validation fails:
1. Check the error messages in console
2. Verify the API response format hasn't changed
3. Update transformation logic if needed

### File Permission Issues

If you encounter permission errors:
```bash
chmod +x scripts/*.js
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Commit with descriptive messages
5. Create a pull request

## Resources

- [Google libaddressinput API](https://chromium-i18n.appspot.com/ssl-address/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [Node.js Documentation](https://nodejs.org/docs/)
