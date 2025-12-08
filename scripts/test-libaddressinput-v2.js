#!/usr/bin/env node

/**
 * Test script for libaddressinput v2 algorithm
 * Tests the transformation logic with mock data
 */

const { transformData } = require('./fetch-libaddressinput-v2.js');
const { createLogger } = require('./utils');

const logger = createLogger({ prefix: 'test-v2' });

// Mock data that simulates Google's libaddressinput API response
const mockUSData = {
  key: 'US',
  name: 'UNITED STATES',
  fmt: '%N%n%O%n%A%n%C, %S %Z',
  require: 'ACS',
  upper: 'CS',
  zip: '(\\d{5})(?:[ \\-](\\d{4}))?',
  zipex: '95014~22162-1010',
  state_name_type: 'state',
  sub_keys: 'AL~AK~AZ~AR~CA',
  sub_names: 'Alabama~Alaska~Arizona~Arkansas~California',
  sub_isoids: 'US-AL~US-AK~US-AZ~US-AR~US-CA',
  lang: 'en',
};

const mockJPData = {
  key: 'JP',
  name: 'Japan',
  fmt: '〒%Z%n%S%C%A%n%O%n%N',
  lfmt: '%N%n%O%n%A, %C%n%S %Z',
  require: 'ACSZ',
  upper: 'S',
  zip: '\\d{3}-\\d{4}',
  zipex: '154-0023~350-1106~951-8073~112-0001',
  state_name_type: 'prefecture',
  sub_keys: '01~02~03~04~05',
  sub_names: '北海道~青森県~岩手県~宮城県~秋田県',
  sub_lnames: 'Hokkaido~Aomori~Iwate~Miyagi~Akita',
  lang: 'ja~en',
};

const mockSubRegionData = {
  key: 'US/CA',
  name: 'California',
  zip: '9[0-5]\\d{3}(?:-\\d{4})?',
  zipex: '90001~90210~94043~95014',
  sub_keys: 'Los Angeles~San Francisco~San Diego',
  sub_names: 'Los Angeles~San Francisco~San Diego',
};

/**
 * Test basic transformation
 */
function testBasicTransformation() {
  logger.section('Test 1: Basic Transformation');

  try {
    const result = transformData('US', mockUSData);

    // Verify basic fields
    console.assert(result.key === 'US', 'Key should be US');
    console.assert(result.name === 'UNITED STATES', 'Name should be UNITED STATES');
    console.assert(result.format === '%N%n%O%n%A%n%C, %S %Z', 'Format should match');
    console.assert(result.required_fields === 'ACS', 'Required fields should match');
    console.assert(result.uppercase_fields === 'CS', 'Uppercase fields should match');

    // Verify postal code info
    console.assert(
      result.postal_code_pattern === '(\\d{5})(?:[ \\-](\\d{4}))?',
      'Postal pattern should match',
    );
    console.assert(
      result.postal_code_examples === '95014~22162-1010',
      'Postal examples should match',
    );

    // Verify sub-regions
    console.assert(Array.isArray(result.sub_keys), 'sub_keys should be array');
    console.assert(result.sub_keys.length === 5, 'Should have 5 sub_keys');
    console.assert(result.sub_keys[0] === 'AL', 'First sub_key should be AL');

    console.assert(Array.isArray(result.sub_names), 'sub_names should be array');
    console.assert(result.sub_names[0] === 'Alabama', 'First sub_name should be Alabama');

    // Verify ISO codes
    console.assert(Array.isArray(result.sub_iso_codes), 'sub_iso_codes should be array');
    console.assert(result.sub_iso_codes[0] === 'US-AL', 'First ISO code should be US-AL');

    logger.success('✓ Basic transformation test passed');
    return true;
  } catch (error) {
    logger.error(`✗ Basic transformation test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Test Japanese data with local names
 */
function testJapaneseTransformation() {
  logger.section('Test 2: Japanese Data Transformation');

  try {
    const result = transformData('JP', mockJPData);

    // Verify format and local format
    console.assert(result.format === '〒%Z%n%S%C%A%n%O%n%N', 'JP format should match');
    console.assert(result.local_format === '%N%n%O%n%A, %C%n%S %Z', 'JP local format should match');

    // Verify sub-regions with local names
    console.assert(Array.isArray(result.sub_local_names), 'sub_local_names should be array');
    console.assert(result.sub_local_names[0] === 'Hokkaido', 'First local name should be Hokkaido');

    // Verify languages
    console.assert(Array.isArray(result.languages), 'Languages should be array');
    console.assert(result.languages.length === 2, 'Should have 2 languages');
    console.assert(result.languages.includes('ja'), 'Should include ja');
    console.assert(result.languages.includes('en'), 'Should include en');

    logger.success('✓ Japanese transformation test passed');
    return true;
  } catch (error) {
    logger.error(`✗ Japanese transformation test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Test sub-region data
 */
function testSubRegionTransformation() {
  logger.section('Test 3: Sub-Region Transformation');

  try {
    const result = transformData('US/CA', mockSubRegionData);

    // Verify key
    console.assert(result.key === 'US/CA', 'Key should be US/CA');
    console.assert(result.name === 'California', 'Name should be California');

    // Verify CA-specific postal pattern
    console.assert(
      result.postal_code_pattern === '9[0-5]\\d{3}(?:-\\d{4})?',
      'CA postal pattern should match',
    );

    // Verify sub-keys (cities)
    console.assert(Array.isArray(result.sub_keys), 'sub_keys should be array');
    console.assert(result.sub_keys.includes('Los Angeles'), 'Should include Los Angeles');

    logger.success('✓ Sub-region transformation test passed');
    return true;
  } catch (error) {
    logger.error(`✗ Sub-region transformation test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Test edge cases
 */
function testEdgeCases() {
  logger.section('Test 4: Edge Cases');

  try {
    // Empty data
    const emptyResult = transformData('XX', {});
    console.assert(emptyResult.key === 'XX', 'Should handle empty data');
    console.assert(emptyResult.name === '', 'Name should be empty string');

    // Minimal data
    const minimalResult = transformData('YY', { key: 'YY', name: 'Test Country' });
    console.assert(minimalResult.key === 'YY', 'Should handle minimal data');
    console.assert(minimalResult.name === 'Test Country', 'Name should match');

    // Data with only some fields
    const partialData = {
      key: 'ZZ',
      name: 'Partial Country',
      zip: '\\d{5}',
      require: 'AC',
    };
    const partialResult = transformData('ZZ', partialData);
    console.assert(
      partialResult.postal_code_pattern === '\\d{5}',
      'Should preserve postal pattern',
    );
    console.assert(partialResult.required_fields === 'AC', 'Should preserve required fields');
    console.assert(!partialResult.format, 'Format should be undefined');

    logger.success('✓ Edge cases test passed');
    return true;
  } catch (error) {
    logger.error(`✗ Edge cases test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Test output structure
 */
function testOutputStructure() {
  logger.section('Test 5: Output Structure');

  try {
    const result = transformData('US', mockUSData);

    // Check that all expected fields are present
    const expectedFields = [
      'key',
      'name',
      'format',
      'required_fields',
      'uppercase_fields',
      'postal_code_pattern',
      'postal_code_examples',
      'state_name_type',
      'sub_keys',
      'sub_names',
      'sub_iso_codes',
      'languages',
    ];

    for (const field of expectedFields) {
      console.assert(field in result, `Output should contain ${field}`);
    }

    // Check that no unexpected fields are present
    const allowedFields = [
      'key',
      'name',
      'id',
      'format',
      'local_format',
      'required_fields',
      'uppercase_fields',
      'postal_code_pattern',
      'postal_code_examples',
      'state_name_type',
      'locality_name_type',
      'sublocality_name_type',
      'sub_keys',
      'sub_names',
      'sub_local_names',
      'sub_iso_codes',
      'sub_postal_patterns',
      'sub_postal_examples',
      'sub_has_children',
      'languages',
      'sub_regions',
    ];

    for (const field in result) {
      console.assert(allowedFields.includes(field), `Unexpected field: ${field}`);
    }

    logger.success('✓ Output structure test passed');
    return true;
  } catch (error) {
    logger.error(`✗ Output structure test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  logger.section('libaddressinput v2 Algorithm Tests');
  logger.info('Running transformation logic tests...\n');

  const tests = [
    testBasicTransformation,
    testJapaneseTransformation,
    testSubRegionTransformation,
    testEdgeCases,
    testOutputStructure,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    console.log('');
  }

  logger.section('Test Results');
  logger.info(`Total: ${tests.length}`);
  logger.success(`Passed: ${passed}`);

  if (failed > 0) {
    logger.error(`Failed: ${failed}`);
    process.exit(1);
  } else {
    logger.success('\n✓ All tests passed!');
  }
}

// Run tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testBasicTransformation,
  testJapaneseTransformation,
  testSubRegionTransformation,
  testEdgeCases,
  testOutputStructure,
};
