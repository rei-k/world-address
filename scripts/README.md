# Scripts

This directory contains automation scripts for the world-address-yaml repository.

## fetch-libaddressinput.js

Fetches address data from Google's libaddressinput API (https://chromium-i18n.appspot.com/ssl-address/data) and converts it to YAML and JSON formats.

### Usage

```bash
# Run manually
node scripts/fetch-libaddressinput.js

# Make executable and run
chmod +x scripts/fetch-libaddressinput.js
./scripts/fetch-libaddressinput.js
```

### What it does

1. Fetches address metadata for all countries from the libaddressinput API
2. Transforms the data into a structured format
3. Saves both YAML and JSON versions in `data/libaddressinput/`
4. Organizes files by the first letter of the country code

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
