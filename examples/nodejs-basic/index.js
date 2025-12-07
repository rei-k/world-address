#!/usr/bin/env node

/**
 * Basic Example - @vey/core SDK
 * 
 * This example demonstrates the core features of the @vey/core SDK:
 * - Address validation
 * - Address formatting
 * - Address PID (Place ID) generation
 * - Country information retrieval
 */

import {
  validateAddress,
  formatAddress,
  encodePID,
  decodePID,
  validatePID,
  getCountryInfo,
  getAllCountries,
  searchCountries
} from '@vey/core';

console.log('🌍 Vey Core SDK - Basic Example\n');
console.log('='.repeat(60));

// ============================================================================
// 1. ADDRESS VALIDATION
// ============================================================================

console.log('\n📝 1. ADDRESS VALIDATION\n');

// Example 1: Valid Japanese address
const japanAddress = {
  country: 'JP',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1'
};

console.log('Validating Japanese address:');
console.log(japanAddress);

const jpValidation = validateAddress(japanAddress);

if (jpValidation.valid) {
  console.log('✅ Valid Japanese address!');
} else {
  console.log('❌ Invalid address:');
  console.log('Errors:', jpValidation.errors);
}

// Example 2: Valid US address
const usAddress = {
  country: 'US',
  street_address: '1600 Pennsylvania Avenue NW',
  city: 'Washington',
  province: 'DC',
  postal_code: '20500'
};

console.log('\nValidating US address:');
console.log(usAddress);

const usValidation = validateAddress(usAddress);

if (usValidation.valid) {
  console.log('✅ Valid US address!');
} else {
  console.log('❌ Invalid address:');
  console.log('Errors:', usValidation.errors);
}

// Example 3: Invalid address (wrong postal code format)
const invalidAddress = {
  country: 'JP',
  postal_code: '12345',  // Should be XXX-XXXX format
  province: '東京都',
  city: '千代田区'
};

console.log('\nValidating invalid address (wrong postal code format):');
console.log(invalidAddress);

const invalidValidation = validateAddress(invalidAddress);

if (invalidValidation.valid) {
  console.log('✅ Valid address');
} else {
  console.log('❌ Invalid address (as expected):');
  console.log('Errors:', invalidValidation.errors);
}

// ============================================================================
// 2. ADDRESS FORMATTING
// ============================================================================

console.log('\n\n📋 2. ADDRESS FORMATTING\n');

// Format for label (multi-line)
console.log('Format: Label (multi-line)');
const labelFormat = formatAddress(usAddress, 'label');
console.log(labelFormat);

// Format for inline display
console.log('\nFormat: Inline (single-line)');
const inlineFormat = formatAddress(usAddress, 'inline');
console.log(inlineFormat);

// Format Japanese address
console.log('\nFormat: Japanese address (label)');
const jpLabelFormat = formatAddress(japanAddress, 'label');
console.log(jpLabelFormat);

// ============================================================================
// 3. ADDRESS PID (Place ID)
// ============================================================================

console.log('\n\n🔑 3. ADDRESS PID (Place ID)\n');

// Generate hierarchical Place ID
const pidComponents = {
  country: 'JP',
  admin1: '13',        // Tokyo
  admin2: '113',       // Shibuya-ku
  locality: '01',
  sublocality: 'T07',  // 7-chome
  block: 'B12',        // 12-banchi
  building: 'BN02',    // Building-02
  unit: 'R342'         // Room 342
};

console.log('Generating PID from components:');
console.log(pidComponents);

const pid = encodePID(pidComponents);
console.log('\nGenerated PID:', pid);

// Decode PID back to components
console.log('\nDecoding PID back to components:');
const decodedComponents = decodePID(pid);
console.log(decodedComponents);

// Validate PID
console.log('\nValidating PID:');
const pidValidation = validatePID(pid);
if (pidValidation.valid) {
  console.log('✅ Valid PID');
  console.log('Components:', pidValidation.components);
  console.log('Hierarchy level:', pidValidation.components.length);
} else {
  console.log('❌ Invalid PID');
}

// Example: Shorter PID (country + prefecture + city)
const shortPid = encodePID({
  country: 'JP',
  admin1: '13',
  admin2: '113'
});
console.log('\nShort PID (Country + Prefecture + City):', shortPid);

// ============================================================================
// 4. COUNTRY INFORMATION
// ============================================================================

console.log('\n\n🌏 4. COUNTRY INFORMATION\n');

// Get detailed country information
console.log('Getting detailed information for Japan:');
const japanInfo = getCountryInfo('JP');

if (japanInfo) {
  console.log('\nCountry:', japanInfo.name?.en);
  if (japanInfo.name?.local?.[0]) {
    console.log('Local name:', japanInfo.name.local[0].value);
  }
  
  console.log('\nISO Codes:');
  console.log('  Alpha-2:', japanInfo.iso_codes?.alpha2);
  console.log('  Alpha-3:', japanInfo.iso_codes?.alpha3);
  console.log('  Numeric:', japanInfo.iso_codes?.numeric);
  
  if (japanInfo.pos?.currency) {
    console.log('\nCurrency:');
    console.log('  Code:', japanInfo.pos.currency.code);
    console.log('  Symbol:', japanInfo.pos.currency.symbol);
    console.log('  Decimal places:', japanInfo.pos.currency.decimal_places);
  }
  
  if (japanInfo.pos?.tax) {
    console.log('\nTax:');
    console.log('  Type:', japanInfo.pos.tax.type);
    console.log('  Standard rate:', (japanInfo.pos.tax.rate.standard * 100) + '%');
  }
  
  if (japanInfo.geo?.center) {
    console.log('\nGeo-coordinates (center):');
    console.log('  Latitude:', japanInfo.geo.center.latitude);
    console.log('  Longitude:', japanInfo.geo.center.longitude);
  }
  
  if (japanInfo.address_format) {
    console.log('\nAddress format:');
    console.log('  Order:', japanInfo.address_format.order?.join(' → '));
    console.log('  Postal code required:', japanInfo.address_format.postal_code?.required);
    console.log('  Postal code format:', japanInfo.address_format.postal_code?.regex);
    console.log('  Example:', japanInfo.address_format.postal_code?.example);
  }
}

// Get all countries
console.log('\n\nGetting all countries:');
const allCountries = getAllCountries();
console.log('Total countries supported:', allCountries.length);
console.log('Sample countries:', allCountries.slice(0, 10).map(c => c.iso_codes?.alpha2).join(', '));

// Search countries
console.log('\n\nSearching for countries containing "united":');
const searchResults = searchCountries('united');
console.log('Found', searchResults.length, 'countries:');
searchResults.forEach(country => {
  console.log(`  - ${country.name?.en} (${country.iso_codes?.alpha2})`);
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n\n' + '='.repeat(60));
console.log('✅ Example completed successfully!');
console.log('='.repeat(60));
console.log('\nFeatures demonstrated:');
console.log('  ✓ Address validation (valid and invalid cases)');
console.log('  ✓ Address formatting (label and inline formats)');
console.log('  ✓ Address PID generation and decoding');
console.log('  ✓ Country information retrieval');
console.log('  ✓ Country search functionality');
console.log('\nFor more examples, check the examples/ directory.');
console.log('For full documentation, see: ../../sdk/core/README.md\n');
