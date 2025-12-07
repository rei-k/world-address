# Scripts Data Directory

This directory contains reference data extracted from scripts to improve maintainability.

## Data Files

### `currency-data.json`
Currency information for all countries (ISO 4217).

**Structure:**
```json
{
  "US": {
    "code": "USD",
    "symbol": "$",
    "decimal_places": 2
  }
}
```

**Source:** Originally embedded in `add-pos-data.js`

**Used by:**
- `add-pos-data.js` - For adding POS data to country YAML files
- `utils/data-loader.js` - For loading currency data

### `timezone-data.json`
Timezone mapping for countries.

**Structure:**
```json
{
  "US": "America/New_York",
  "JP": "Asia/Tokyo"
}
```

**Source:** Originally embedded in `add-pos-data.js`

**Used by:**
- `add-pos-data.js` - For setting locale timezone in POS data
- `utils/data-loader.js` - For loading timezone data

### `country-coordinates.json`
Geographic center coordinates for countries (latitude, longitude).

**Structure:**
```json
{
  "US": {
    "lat": 37.0902,
    "lon": -95.7129,
    "name": "United States"
  }
}
```

**Source:** Originally embedded in `add-geo-coordinates.js`, based on Natural Earth Data and OpenStreetMap

**Used by:**
- `add-geo-coordinates.js` - For adding geo data to country YAML files
- `utils/data-loader.js` - For loading country coordinates

### `special-region-coordinates.json`
Coordinates for special regions and territories.

**Structure:**
```json
{
  "Easter_Island": {
    "lat": -27.1127,
    "lon": -109.3497,
    "name": "Easter Island"
  }
}
```

**Source:** Originally embedded in `add-geo-coordinates.js`

**Used by:**
- `add-geo-coordinates.js` - For adding geo data to special regions
- `utils/data-loader.js` - For loading special region coordinates

### `country-codes.json`
ISO 3166-1 alpha-2 country codes organized by region.

**Structure:**
```json
{
  "africa": ["DZ", "EG", "MA", ...],
  "americas": ["AR", "BR", "CA", ...],
  "asia": ["JP", "CN", "IN", ...],
  "europe": ["FR", "DE", "IT", ...],
  "oceania": ["AU", "NZ", ...],
  "territories": ["PR", "GU", ...]
}
```

**Source:** Originally embedded in `scripts/utils/constants.js`

**Used by:**
- `scripts/utils/constants.js` - For providing country code lists
- `fetch-libaddressinput-v2.js` - For fetching address data for all countries
- Other scripts that need to iterate over countries

## Benefits of External Data Files

1. **Maintainability** - Data is easier to find and update
2. **Reduced Code Size** - Scripts are smaller and more focused on logic
3. **Reusability** - Data can be shared across multiple scripts
4. **Version Control** - Data changes are easier to track
5. **Testing** - Data can be easily mocked or replaced for testing

## Updating Data

To update any data file:

1. Edit the JSON file directly
2. Ensure the structure matches the format above
3. Test the scripts that use the data:
   ```bash
   npm run lint
   node scripts/add-pos-data.js
   node scripts/add-geo-coordinates.js
   ```
4. Commit the changes

## Data Sources

- **Currency Data:** ISO 4217, various financial databases
- **Timezone Data:** IANA Time Zone Database
- **Coordinates:** Natural Earth Data, OpenStreetMap
- **Country Codes:** ISO 3166-1
