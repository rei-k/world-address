# Vey Core SDK - Basic Example

This example demonstrates the core features of the `@vey/core` SDK.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run the basic example
npm start
```

## 📚 Features Demonstrated

### 1. Address Validation
- Validate Japanese addresses with proper postal code format (XXX-XXXX)
- Validate US addresses with state and ZIP code
- Handle validation errors for incorrect formats

### 2. Address Formatting
- Format addresses for labels (multi-line display)
- Format addresses for inline display (single-line)
- Support for different country formats

### 3. Address PID (Place ID)
- Generate hierarchical Place IDs
- Decode PIDs back to components
- Validate PID format
- Support for various hierarchy levels

### 4. Country Information
- Retrieve detailed country data (ISO codes, currency, tax, geo-coordinates)
- List all supported countries (269 countries/regions)
- Search countries by name

## 📖 Example Output

```
🌍 Vey Core SDK - Basic Example

============================================================

📝 1. ADDRESS VALIDATION

Validating Japanese address:
{ country: 'JP', postal_code: '100-0001', province: '東京都', ... }
✅ Valid Japanese address!

Validating US address:
{ country: 'US', street_address: '1600 Pennsylvania Avenue NW', ... }
✅ Valid US address!

Validating invalid address (wrong postal code format):
{ country: 'JP', postal_code: '12345', ... }
❌ Invalid address (as expected):
Errors: [ 'Postal code format is invalid' ]

📋 2. ADDRESS FORMATTING

Format: Label (multi-line)
1600 Pennsylvania Avenue NW
Washington, DC 20500
United States

🔑 3. ADDRESS PID (Place ID)

Generating PID from components:
{ country: 'JP', admin1: '13', admin2: '113', ... }

Generated PID: JP-13-113-01-T07-B12-BN02-R342

✅ Valid PID
Components: 8
Hierarchy level: 8

🌏 4. COUNTRY INFORMATION

Getting detailed information for Japan:

Country: Japan
Local name: 日本

ISO Codes:
  Alpha-2: JP
  Alpha-3: JPN
  Numeric: 392

Currency:
  Code: JPY
  Symbol: ¥
  Decimal places: 0

Tax:
  Type: Consumption Tax
  Standard rate: 10%

Geo-coordinates (center):
  Latitude: 35.6812
  Longitude: 139.7671

Address format:
  Order: recipient → street_address → city → province → postal_code → country
  Postal code required: true
  Postal code format: ^[0-9]{3}-[0-9]{4}$
  Example: 100-0001

============================================================
✅ Example completed successfully!
============================================================
```

## 📂 Project Structure

```
nodejs-basic/
├── index.js           # Main example file
├── package.json       # Package configuration
└── README.md          # This file
```

## 🔗 Related Resources

- [SDK Core Documentation](../../sdk/core/README.md)
- [API Reference](../../docs/api-reference.md)
- [More Examples](../)

## 📜 License

MIT License
