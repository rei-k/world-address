# Getting Started with World Address YAML

A comprehensive guide to get you up and running with the World Address YAML project and @vey/core SDK.

## 🎯 Quick Overview

**World Address YAML** provides:
- 📦 **Address Data**: Structured address formats for 269 countries/regions (325 total entities)
- 🛠️ **SDK**: Production-ready TypeScript/JavaScript SDK for address handling
- 🔐 **Privacy**: Zero-Knowledge Proof (ZKP) for privacy-preserving delivery
- 🌍 **International**: Support for all major countries with 99% data completeness

## 🚀 5-Minute Quick Start

### Option 1: Use the SDK (Recommended for Developers)

```bash
# Clone the repository
git clone https://github.com/rei-k/world-address-yaml.git
cd world-address-yaml

# Install dependencies
npm install

# Build the SDK
cd sdk/core
npm install
npm run build

# Run the basic example
cd ../../examples/nodejs-basic
npm install
npm start
```

### Option 2: Use the Data Directly

```bash
# Clone the repository
git clone https://github.com/rei-k/world-address-yaml.git
cd world-address-yaml

# Browse the data
ls data/asia/east_asia/JP/    # Japan data
cat data/asia/east_asia/JP/JP.yaml   # Human-readable format
cat data/asia/east_asia/JP/JP.json   # Machine-readable format
```

## 📚 What Can You Do?

### 1. Address Validation & Formatting

```typescript
import { validateAddress, formatAddress } from '@vey/core';

// Validate an address
const isValid = validateAddress({
  country: 'JP',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区'
});

// Format for display
const formatted = formatAddress(address, 'label');
```

### 2. Privacy-Preserving Address Management

```typescript
import { encodePID, decodePID } from '@vey/core';

// Generate hierarchical Place ID (hides exact address)
const pid = encodePID({
  country: 'JP',
  admin1: '13',      // Tokyo
  admin2: '113'      // Shibuya-ku
});
console.log(pid); // "JP-13-113"

// E-commerce can verify delivery to Tokyo/Shibuya
// WITHOUT seeing your exact address!
```

### 3. Country Information Lookup

```typescript
import { getCountryInfo, searchCountries } from '@vey/core';

// Get country details
const japan = getCountryInfo('JP');
console.log(japan.pos.currency.code); // "JPY"
console.log(japan.pos.tax.rate.standard); // 0.10 (10%)

// Search countries
const results = searchCountries('united');
// Returns: United States, United Kingdom, United Arab Emirates
```

### 4. Geocoding (Address ↔ Coordinates)

```typescript
import { forwardGeocode, reverseGeocode } from '@vey/core';

// Address → Coordinates
const result = await forwardGeocode({
  address: { city: 'Tokyo', country: 'JP' }
});
console.log(result.coordinates); // { latitude: 35.6812, longitude: 139.7671 }

// Coordinates → Address
const address = await reverseGeocode({
  coordinates: { latitude: 35.6812, longitude: 139.7671 }
});
console.log(address.address.city); // "Tokyo"
```

## 🎓 Learning Path

### Beginner: Understand the Basics

1. **Read the Main README**: [README.md](./README.md)
2. **Explore Data Structure**: [Schema Documentation](./docs/schema/README.md)
3. **Run Basic Example**: [examples/nodejs-basic](./examples/nodejs-basic)
4. **Try Country Data**: Browse `data/` directory

**Time**: 30 minutes

### Intermediate: Build with the SDK

1. **SDK Documentation**: [sdk/core/README.md](./sdk/core/README.md)
2. **Run Veyvault Demo**: [examples/veyvault-demo](./examples/veyvault-demo)
3. **Study PID System**: [SDK README - Address PID](./sdk/core/README.md#-address-pid-place-id)
4. **Build Your Own App**: Start with `examples/` as templates

**Time**: 2-3 hours

### Advanced: Privacy & Integration

1. **ZKP Protocol**: [docs/zkp-protocol.md](./docs/zkp-protocol.md)
2. **Vey Ecosystem**: [Vey/README.md](./Vey/README.md)
3. **Logistics Integration**: [sdk/core/README.md - Logistics](./sdk/core/README.md#-logistics-integration)
4. **Production Deployment**: Build real-world applications

**Time**: 1-2 days

## 📁 Project Structure

```
world-address-yaml/
├── data/                    # Address data (YAML & JSON)
│   ├── asia/
│   ├── europe/
│   ├── americas/
│   ├── africa/
│   ├── oceania/
│   └── libaddressinput/    # Auto-updated from Google
│
├── sdk/                     # Developer SDKs
│   └── core/               # @vey/core SDK (production-ready)
│
├── examples/               # Working examples
│   ├── nodejs-basic/       # Basic SDK usage
│   └── veyvault-demo/      # Address book demo
│
├── docs/                   # Documentation
│   ├── schema/            # Data schema definitions
│   ├── examples/          # Usage examples
│   └── zkp-protocol.md    # ZKP documentation
│
├── Vey/                    # Vey ecosystem specs
│   └── apps/              # Application specifications
│
└── scripts/               # Automation scripts
    ├── fetch-libaddressinput-v2.js
    ├── validate-yaml.js
    └── data-stats.js
```

## 🛠️ Common Commands

### Data Management

```bash
# Fetch latest address data from Google
npm run fetch:libaddressinput

# Validate all YAML data
npm run validate:data

# View data statistics
npm run stats:data
```

### SDK Development

```bash
# Build SDK
cd sdk/core
npm run build

# Run tests
npm test

# Check coverage
npm run test:coverage

# Lint code
npm run lint
```

### Examples

```bash
# Run basic example
cd examples/nodejs-basic
npm start

# Run Veyvault demo
cd examples/veyvault-demo
npm start
```

## 🎯 Use Cases

### E-commerce Checkout

```typescript
// User selects address from their Veyvault
const userPID = 'JP-13-113-01';

// Verify delivery capability without seeing raw address
const canDeliver = await validateShippingRequest({
  pid: userPID,
  conditions: { allowedCountries: ['JP'], allowedRegions: ['13'] }
});

// Ship without exposing address
if (canDeliver.valid) {
  createZKPWaybill(waybillNumber, userPID, canDeliver.zkProof);
}
```

### International Shipping

```typescript
// Get country-specific requirements
const country = getCountryInfo('JP');
console.log('Currency:', country.pos.currency.code);
console.log('Tax rate:', country.pos.tax.rate.standard);
console.log('Postal format:', country.address_format.postal_code.regex);

// Validate postal code
const isValidPostal = validatePostalCode('100-0001', 'JP');
```

### Address Autocomplete

```typescript
// Search countries
const countries = searchCountries('jap');
// Returns: Japan, Jamaica, etc.

// Get address format
const format = getCountryInfo('JP').address_format;
console.log('Required fields:', format.required);
console.log('Field order:', format.order);
```

## 🤔 FAQ

### Q: Is the SDK ready for production?

**A**: The SDK core is production-ready with:
- ✅ 98% test coverage (682/693 tests passing)
- ✅ TypeScript support with full type definitions
- ✅ CommonJS + ESM builds
- ✅ Comprehensive documentation

Note: NPM publication is not yet complete. Use local installation for now.

### Q: How do I add a new country?

**A**: See [DEVELOPMENT.md](./DEVELOPMENT.md#adding-new-country-data) for the step-by-step guide.

### Q: Can I use this commercially?

**A**: Yes! MIT License allows commercial use. See [LICENSE](./LICENSE).

### Q: How is privacy preserved?

**A**: Addresses are converted to hierarchical PIDs (Place IDs). E-commerce sites verify delivery capability via Zero-Knowledge Proof without ever seeing raw addresses. See [ZKP Protocol Guide](./docs/zkp-protocol.md).

### Q: What about geocoding accuracy?

**A**: We use OpenStreetMap Nominatim for geocoding, which provides good coverage globally. Accuracy varies by region. Consider using a paid service for production.

## 🆘 Getting Help

- **Documentation**: Browse [docs/](./docs) directory
- **Examples**: Check [examples/](./examples) directory
- **Issues**: [GitHub Issues](https://github.com/rei-k/world-address-yaml/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rei-k/world-address-yaml/discussions)

## 🎉 Next Steps

1. ✅ **Run the examples** to see the SDK in action
2. 📖 **Read the SDK documentation** to understand the API
3. 🛠️ **Build something** using the SDK
4. 🤝 **Contribute** - add data, fix bugs, or create examples

## 📈 Roadmap

- [ ] Publish @vey/core to NPM
- [ ] Add React/Vue/Angular SDKs
- [ ] Create web-based examples
- [ ] Add more application demos
- [ ] Expand ZKP documentation

See [ROADMAP.md](./ROADMAP.md) for detailed plans.

---

**Ready to start?** Pick an example and run it:

```bash
cd examples/nodejs-basic && npm install && npm start
```

🚀 Happy coding!
