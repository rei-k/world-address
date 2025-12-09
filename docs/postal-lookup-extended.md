# 📮 Postal Code Lookup - Extended & Unified Services

This guide explains how to use the extended postal code lookup services in the World Address SDK, which provide comprehensive worldwide coverage through multiple free and freemium APIs.

## 📊 Coverage Overview

The SDK provides three levels of postal code lookup:

1. **Standard Lookup** (`postal-lookup.ts`)
   - Zippopotam.us: 70+ countries, free, no API key
   - GeoNames.org: Worldwide, free with registration

2. **Extended Lookup** (`postal-lookup-extended.ts`)
   - Postcode.io: UK only, free, unlimited
   - Dawa API: Denmark only, free, unlimited
   - OpenDataSoft: France, Spain, and select countries, free
   - Zipcodebase: 250+ countries, free tier (10 requests/day)
   - Local YAML data: Fallback from world-address repository

3. **Unified Lookup** (`postal-lookup-unified.ts`)
   - Automatically combines all sources
   - Intelligent fallback and priority ordering
   - Configurable strategies

## 🚀 Quick Start

### Basic Usage (Auto-detect Best Source)

```typescript
import { lookupPostalCodeUnified } from '@vey/core';

// Automatically uses the best available source
const result = await lookupPostalCodeUnified({
  countryCode: 'US',
  postalCode: '90210'
});

console.log(result.city);        // "Beverly Hills"
console.log(result.province);    // "California"
console.log(result.coordinates); // { latitude: 34.0901, longitude: -118.4065 }
console.log(result.source);      // "zippopotam"
```

### UK - Free Unlimited Lookup

```typescript
// Uses Postcode.io (free, no API key required)
const ukResult = await lookupPostalCodeUnified({
  countryCode: 'GB',
  postalCode: 'SW1A 1AA'
});

console.log(ukResult.city);      // "Westminster"
console.log(ukResult.province);  // "London"
console.log(ukResult.source);    // "postcodeio"
```

### Denmark - Free Unlimited Lookup

```typescript
// Uses Dawa API (free, no API key required)
const dkResult = await lookupPostalCodeUnified({
  countryCode: 'DK',
  postalCode: '1050'
});

console.log(dkResult.city);    // "København K"
console.log(dkResult.source);  // "dawa"
```

### Worldwide Coverage with Free APIs

```typescript
// Option 1: GeoNames (requires free registration)
const result1 = await lookupPostalCodeUnified(
  { countryCode: 'BR', postalCode: '01310-100' },
  { geonamesUsername: 'your_username' } // Register at geonames.org
);

// Option 2: Zipcodebase (10 requests/day free)
const result2 = await lookupPostalCodeUnified(
  { countryCode: 'CN', postalCode: '100000' },
  { zipcodebaseApiKey: 'your_api_key' } // Get at zipcodebase.com
);

console.log(result2.city);    // "Beijing"
console.log(result2.source);  // "zipcodebase"
```

## 🎯 Advanced Configuration

### Lookup Strategies

```typescript
import { lookupPostalCodeUnified } from '@vey/core';

// Strategy 1: Auto (default) - Try Zippopotam first, then extended
const auto = await lookupPostalCodeUnified(
  { countryCode: 'GB', postalCode: 'SW1A 1AA' },
  { strategy: 'auto' }
);

// Strategy 2: Extended-first - Prefer country-specific free APIs
const extFirst = await lookupPostalCodeUnified(
  { countryCode: 'GB', postalCode: 'SW1A 1AA' },
  { strategy: 'extended-first' }
);

// Strategy 3: Zippopotam-only - Only use Zippopotam/GeoNames
const zipOnly = await lookupPostalCodeUnified(
  { countryCode: 'US', postalCode: '90210' },
  { strategy: 'zippopotam-only' }
);

// Strategy 4: Extended-only - Only use extended sources
const extOnly = await lookupPostalCodeUnified(
  { countryCode: 'GB', postalCode: 'SW1A 1AA' },
  { strategy: 'extended-only' }
);
```

### Fallback Configuration

```typescript
// Enable automatic fallback (default: true)
const result = await lookupPostalCodeUnified(
  { countryCode: 'GB', postalCode: 'SW1A 1AA' },
  {
    enableFallback: true, // If one source fails, try others
    timeout: 5000,        // Timeout per API call in ms
  }
);

// Disable fallback (fail fast)
try {
  const result = await lookupPostalCodeUnified(
    { countryCode: 'GB', postalCode: 'INVALID' },
    { enableFallback: false }
  );
} catch (error) {
  console.error('Lookup failed:', error.message);
}
```

## 📋 API Reference

### Check Available Sources

```typescript
import {
  isUnifiedLookupAvailable,
  getAvailableSources,
  getAllSupportedCountries,
} from '@vey/core';

// Check if lookup is available for a country
if (isUnifiedLookupAvailable('GB')) {
  console.log('Lookup available for UK');
}

// Get list of available sources for a country
const sources = getAvailableSources('GB', {
  geonamesUsername: 'test',
  zipcodebaseApiKey: 'test-key',
});
console.log(sources); // ['zippopotam', 'geonames', 'postcodeio']

// Get all supported countries
const countries = getAllSupportedCountries();
console.log(countries.length); // 70+ countries
console.log(countries); // ['AD', 'AR', 'AT', 'AU', 'BE', 'BR', ...]
```

### Configuration Recommendations

```typescript
import { getRecommendedConfig } from '@vey/core';

const config = getRecommendedConfig();

console.log(config.freeNoKey);
// [
//   'Zippopotam.us - 70+ countries, no registration',
//   'Postcode.io - UK only, unlimited',
//   'Dawa API - Denmark only, unlimited',
//   'OpenDataSoft - Select countries (FR, ES, etc.)'
// ]

console.log(config.freeWithRegistration);
// [
//   'GeoNames - Worldwide coverage, free registration required',
//   'Get username at: https://www.geonames.org/login'
// ]

console.log(config.freeLimited);
// [
//   'Zipcodebase - 250+ countries, 10 requests/day free',
//   'Get API key at: https://zipcodebase.com'
// ]
```

### Extended Lookup (Direct Access)

```typescript
import { lookupPostalCodeExtended } from '@vey/core';

// Use extended sources directly (bypasses Zippopotam)
const result = await lookupPostalCodeExtended(
  { countryCode: 'GB', postalCode: 'SW1A 1AA' },
  {
    zipcodebaseApiKey: 'optional-api-key',
    enableLocalFallback: true,
  }
);
```

## 🌍 Supported Countries by Source

### Free, No API Key Required

**Zippopotam.us (70+ countries):**
```
AD, AR, AS, AT, AU, AX, BD, BE, BG, BR, BY, CA, CH, CZ, DE, DK,
DO, ES, FI, FO, FR, GB, GF, GG, GL, GP, GT, GU, GY, HR, HU, IM,
IN, IS, IT, JE, JP, LI, LK, LT, LU, MC, MD, MH, MK, MP, MQ, MX,
MY, NC, NL, NO, NZ, PH, PK, PL, PM, PR, PT, RE, RO, RU, SE, SI,
SJ, SK, SM, TH, TR, UA, US, VA, VI, WF, YT, ZA
```

**Postcode.io (UK only):**
```
GB - United Kingdom (England, Scotland, Wales, Northern Ireland)
```

**Dawa API (Denmark only):**
```
DK - Denmark
```

**OpenDataSoft (Select countries):**
```
FR - France
ES - Spain
IT - Italy
DE - Germany (partial)
BE - Belgium
CH - Switzerland
AT - Austria
NL - Netherlands
```

### Free with Registration

**GeoNames.org (Worldwide):**
- All 269 countries and regions
- Free registration at https://www.geonames.org/login
- Requires username in configuration

### Free Tier (Limited Requests)

**Zipcodebase (250+ countries):**
- Free tier: 10 requests per day
- Get API key at https://zipcodebase.com
- Supports most countries worldwide

## 💡 Best Practices

### 1. Use Unified Lookup for Maximum Coverage

```typescript
// ✅ Good: Uses unified lookup with fallback
import { lookupPostalCodeUnified } from '@vey/core';

const result = await lookupPostalCodeUnified(
  { countryCode: 'US', postalCode: '90210' }
);
```

```typescript
// ❌ Less optimal: Direct API call without fallback
import { lookupPostalCode } from '@vey/core';

const result = await lookupPostalCode(
  { countryCode: 'US', postalCode: '90210' }
);
```

### 2. Configure Multiple Services for Reliability

```typescript
const config = {
  // Primary: Zippopotam/Extended (free, no key)
  strategy: 'auto',
  
  // Fallback 1: GeoNames (worldwide, free registration)
  geonamesUsername: process.env.GEONAMES_USERNAME,
  
  // Fallback 2: Zipcodebase (10/day free)
  zipcodebaseApiKey: process.env.ZIPCODEBASE_API_KEY,
  
  // Enable automatic fallback
  enableFallback: true,
};

const result = await lookupPostalCodeUnified(request, config);
```

### 3. Use Country-Specific APIs When Available

```typescript
// For UK, use Postcode.io (free, unlimited)
if (country === 'GB') {
  const result = await lookupPostalCodeUnified(
    { countryCode: 'GB', postalCode: code },
    { strategy: 'extended-first' } // Prefers Postcode.io
  );
}
```

### 4. Handle Errors Gracefully

```typescript
try {
  const result = await lookupPostalCodeUnified({
    countryCode: 'US',
    postalCode: '90210'
  });
  
  // Use the result
  fillAddressForm(result);
} catch (error) {
  if (error.message.includes('not found')) {
    console.warn('Invalid postal code');
  } else if (error.message.includes('rate limit')) {
    console.warn('API rate limit exceeded, try again later');
  } else {
    console.error('Lookup failed:', error.message);
  }
  
  // Fallback to manual entry
  enableManualAddressEntry();
}
```

### 5. Cache Results to Reduce API Calls

```typescript
// Results are automatically cached for 1 hour
const result1 = await lookupPostalCodeUnified(request); // API call
const result2 = await lookupPostalCodeUnified(request); // From cache

console.log(result1.cached); // false
console.log(result2.cached); // true
```

## 🔧 Environment Configuration

### Recommended .env Setup

```bash
# GeoNames (free registration required)
# Get username at: https://www.geonames.org/login
GEONAMES_USERNAME=your_username

# Zipcodebase (10 requests/day free)
# Get API key at: https://zipcodebase.com
ZIPCODEBASE_API_KEY=your_api_key

# Optional: Enable local YAML fallback
ENABLE_LOCAL_FALLBACK=true
LOCAL_DATA_PATH=./data
```

### Usage with Environment Variables

```typescript
import { lookupPostalCodeUnified } from '@vey/core';

const config = {
  geonamesUsername: process.env.GEONAMES_USERNAME,
  zipcodebaseApiKey: process.env.ZIPCODEBASE_API_KEY,
  enableLocalFallback: process.env.ENABLE_LOCAL_FALLBACK === 'true',
  localDataPath: process.env.LOCAL_DATA_PATH,
};

const result = await lookupPostalCodeUnified(request, config);
```

## 📊 Performance Considerations

### Response Times (Typical)

| Service | Average Response Time | Coverage |
|---------|----------------------|----------|
| Zippopotam.us | 100-300ms | 70+ countries |
| Postcode.io | 50-150ms | UK only |
| Dawa API | 50-150ms | Denmark only |
| GeoNames | 200-500ms | Worldwide |
| Zipcodebase | 200-400ms | 250+ countries |
| OpenDataSoft | 300-600ms | Select countries |

### Rate Limits

| Service | Rate Limit | Cost |
|---------|-----------|------|
| Zippopotam.us | Unlimited | Free |
| Postcode.io | Unlimited | Free |
| Dawa API | Unlimited | Free |
| GeoNames | 2000/hour free tier | Free with registration |
| Zipcodebase | 10/day free tier | $9.99/month for unlimited |
| OpenDataSoft | ~100/day per dataset | Free |

## 🤝 Contributing

Found a country not supported? Want to add a new free API source?

1. Check `postal-lookup-extended.ts`
2. Add your API implementation
3. Update the tests in `postal-lookup-extended.test.ts`
4. Submit a pull request!

## 📚 Additional Resources

- [Zippopotam.us Documentation](http://www.zippopotam.us/)
- [Postcode.io API Docs](https://postcodes.io/)
- [Dawa API Documentation](https://dawa.aws.dk/dok/api)
- [GeoNames Web Services](https://www.geonames.org/export/web-services.html)
- [Zipcodebase API](https://zipcodebase.com/documentation)
- [OpenDataSoft Catalog](https://public.opendatasoft.com/explore/)

## 📄 License

MIT - Same as World Address YAML project
