/**
 * Simple Address Validation Example
 * 
 * This example demonstrates basic address validation using the @vey/core SDK.
 * It shows how to validate addresses for different countries with minimal code.
 */

const fs = require('fs');
const path = require('path');

// Import validator functions
// In production, you would import from '@vey/core' package
const { validateAddress, getRequiredFields } = require('../../sdk/core/dist/index.js');

/**
 * Load country data from JSON file
 */
function loadCountryData(countryCode) {
  // Map country codes to their file paths
  const countryPaths = {
    JP: '../../data/asia/east_asia/JP/JP.json',
    US: '../../data/americas/north_america/US/US.json',
    GB: '../../data/europe/northern_europe/GB/GB.json',
    DE: '../../data/europe/western_europe/DE/DE.json',
  };

  const filePath = countryPaths[countryCode];
  if (!filePath) {
    throw new Error(`Country ${countryCode} not found`);
  }

  const fullPath = path.join(__dirname, filePath);
  const data = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Example 1: Validate a Japanese address
 */
function example1_validateJapaneseAddress() {
  console.log('\n=== Example 1: Validate Japanese Address ===\n');

  const japanFormat = loadCountryData('JP');

  // Valid Japanese address
  const validAddress = {
    country: 'JP',
    postal_code: '100-0001',
    province: '東京都',
    city: '千代田区',
    street_address: '千代田1-1',
  };

  const result = validateAddress(validAddress, japanFormat, { languageCode: 'ja' });

  console.log('Address:', validAddress);
  console.log('Validation result:', {
    valid: result.valid,
    errors: result.errors,
    warnings: result.warnings,
  });

  if (result.valid) {
    console.log('✅ Address is valid!');
  } else {
    console.log('❌ Address has errors:', result.errors);
  }
}

/**
 * Example 2: Detect invalid postal code
 */
function example2_invalidPostalCode() {
  console.log('\n=== Example 2: Invalid Postal Code ===\n');

  const japanFormat = loadCountryData('JP');

  // Address with invalid postal code format
  const invalidAddress = {
    country: 'JP',
    postal_code: '1234567', // Wrong format, should be XXX-XXXX
    province: '東京都',
    city: '千代田区',
    street_address: '千代田1-1',
  };

  const result = validateAddress(invalidAddress, japanFormat);

  console.log('Address:', invalidAddress);
  console.log('Validation result:', {
    valid: result.valid,
    errors: result.errors,
  });

  if (!result.valid) {
    console.log('❌ Validation failed as expected');
    console.log('Error:', result.errors[0].message);
  }
}

/**
 * Example 3: Check required fields
 */
function example3_requiredFields() {
  console.log('\n=== Example 3: Check Required Fields ===\n');

  const japanFormat = loadCountryData('JP');
  const requiredFields = getRequiredFields(japanFormat);

  console.log('Required fields for Japan:', requiredFields);

  // Address missing required field (city)
  const incompleteAddress = {
    country: 'JP',
    postal_code: '100-0001',
    province: '東京都',
    // city is missing
    street_address: '千代田1-1',
  };

  const result = validateAddress(incompleteAddress, japanFormat);

  console.log('\nAddress:', incompleteAddress);
  console.log('Missing required field:', result.errors);

  if (!result.valid) {
    console.log('❌ Address is incomplete');
  }
}

/**
 * Example 4: Validate US address
 */
function example4_validateUSAddress() {
  console.log('\n=== Example 4: Validate US Address ===\n');

  const usFormat = loadCountryData('US');

  const address = {
    country: 'US',
    postal_code: '10001',
    province: 'NY',
    city: 'New York',
    street_address: '350 5th Ave',
  };

  const result = validateAddress(address, usFormat);

  console.log('Address:', address);
  console.log('Validation result:', {
    valid: result.valid,
    errors: result.errors,
    warnings: result.warnings,
  });

  if (result.valid) {
    console.log('✅ US address is valid!');
  }
}

/**
 * Example 5: Validate UK address
 */
function example5_validateUKAddress() {
  console.log('\n=== Example 5: Validate UK Address ===\n');

  const gbFormat = loadCountryData('GB');

  const address = {
    country: 'GB',
    postal_code: 'SW1A 1AA',
    city: 'London',
    street_address: 'Buckingham Palace',
  };

  const result = validateAddress(address, gbFormat);

  console.log('Address:', address);
  console.log('Validation result:', {
    valid: result.valid,
    errors: result.errors,
  });

  if (result.valid) {
    console.log('✅ UK address is valid!');
  }
}

/**
 * Example 6: Address normalization
 */
function example6_addressNormalization() {
  console.log('\n=== Example 6: Address Normalization ===\n');

  const usFormat = loadCountryData('US');

  const messyAddress = {
    country: 'US',
    postal_code: '  10001  ', // Extra whitespace
    province: ' NY ',
    city: '  New York  ',
    street_address: ' 350 5th Ave ',
  };

  const result = validateAddress(messyAddress, usFormat);

  console.log('Original address:', messyAddress);
  console.log('Normalized address:', result.normalized);
  console.log('\n✅ Whitespace has been trimmed!');
}

// Run all examples
console.log('╔════════════════════════════════════════════════════╗');
console.log('║  Simple Address Validation Examples               ║');
console.log('║  Using @vey/core SDK                               ║');
console.log('╚════════════════════════════════════════════════════╝');

try {
  example1_validateJapaneseAddress();
  example2_invalidPostalCode();
  example3_requiredFields();
  example4_validateUSAddress();
  example5_validateUKAddress();
  example6_addressNormalization();

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║  All examples completed successfully! ✅          ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
} catch (error) {
  console.error('\n❌ Error running examples:', error.message);
  process.exit(1);
}
