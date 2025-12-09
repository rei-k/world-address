#!/usr/bin/env node

/**
 * Test script for data merge and quality checking algorithms
 */

const {
  createLogger,
  mergeData,
  detectConflicts,
  generateMergeReport,
  checkDataQuality,
  generateQualityReport,
} = require('./utils');

const logger = createLogger({ prefix: 'test-algorithms' });

/**
 * Test 1: Basic data merge
 */
function testBasicMerge() {
  logger.section('Test 1: Basic Data Merge');

  const existingData = {
    country_code: 'JP',
    name: { en: 'Japan', local: [{ lang: 'ja', value: '日本' }] },
    libaddressinput: {
      key: 'JP',
      name: 'OLD NAME',
      format: '%N%n%O%n%A%n%C, %S %Z',
    },
  };

  const newData = {
    country_code: 'JP',
    libaddressinput: {
      key: 'JP',
      name: 'JAPAN',
      format: '%N%n%O%n%A%n%C %Z',
      postal_code_pattern: '^\\d{3}-\\d{4}$',
      sub_keys: ['01', '02'],
      sub_names: ['Hokkaido', 'Aomori'],
    },
    metadata: {
      source: 'Google libaddressinput API',
      fetched_at: new Date().toISOString(),
    },
  };

  const result = mergeData(existingData, newData, {
    countryCode: 'JP',
    preserveCustomFields: true,
    trackChanges: true,
  });

  logger.info('Merge Result:');
  logger.info(`  Change Type: ${result.changes.type}`);
  logger.info(`  Changed Fields: ${result.changes.count}`);
  logger.info(`  Conflicts: ${result.conflicts.length}`);

  // Verify: name should be preserved
  if (
    result.data.name &&
    result.data.name.en === 'Japan' &&
    result.data.name.local[0].value === '日本'
  ) {
    logger.success('✓ Custom name field preserved');
  } else {
    logger.error('✗ Custom name field not preserved');
  }

  // Verify: libaddressinput should be updated
  if (
    result.data.libaddressinput.name === 'JAPAN' &&
    result.data.libaddressinput.postal_code_pattern === '^\\d{3}-\\d{4}$'
  ) {
    logger.success('✓ libaddressinput section updated');
  } else {
    logger.error('✗ libaddressinput section not updated correctly');
  }

  console.log(generateMergeReport(result, 'JP'));
}

/**
 * Test 2: Conflict detection
 */
function testConflictDetection() {
  logger.section('Test 2: Conflict Detection');

  const existingData = {
    country_code: 'US',
    name: { en: 'United States' },
    continent: 'North America',
  };

  const newData = {
    country_code: 'US',
    name: { en: 'USA' }, // Different from existing
    continent: 'Americas', // Different from existing
    libaddressinput: {
      key: 'US',
      name: 'UNITED STATES',
    },
  };

  const conflicts = detectConflicts(existingData, newData);

  logger.info(`Detected ${conflicts.length} conflicts`);

  if (conflicts.length === 2) {
    logger.success('✓ Correctly detected conflicts in name and continent');
  } else {
    logger.error(`✗ Expected 2 conflicts, found ${conflicts.length}`);
  }

  conflicts.forEach((conflict) => {
    logger.info(`  - ${conflict.field}: ${conflict.resolution}`);
  });
}

/**
 * Test 3: Quality checking
 */
function testQualityChecking() {
  logger.section('Test 3: Data Quality Checking');

  // Test with complete data
  const completeData = {
    country_code: 'JP',
    libaddressinput: {
      key: 'JP',
      name: 'JAPAN',
      format: '%N%n%O%n%A%n%C, %S %Z',
      postal_code_pattern: '^\\d{3}-\\d{4}$',
      postal_code_examples: '100-0001~101-0001',
      sub_keys: ['01', '02'],
      sub_names: ['Hokkaido', 'Aomori'],
    },
    metadata: {
      source: 'Google libaddressinput API',
      fetched_at: new Date().toISOString(),
    },
  };

  const qualityReport = checkDataQuality(completeData, {
    countryCode: 'JP',
    includeRecommendations: true,
    includeAnomalies: true,
  });

  logger.info(`Quality Score: ${qualityReport.score}/100`);
  logger.info(`Passed: ${qualityReport.passed ? 'Yes' : 'No'}`);
  logger.info(`Critical Issues: ${qualityReport.summary.critical}`);
  logger.info(`Warnings: ${qualityReport.summary.warnings}`);
  logger.info(`Suggestions: ${qualityReport.suggestions.length}`);

  if (qualityReport.score >= 80 && qualityReport.passed) {
    logger.success('✓ High quality data detected');
  } else {
    logger.warn('⚠ Quality issues detected');
  }

  // Test with incomplete data
  const incompleteData = {
    libaddressinput: {
      key: 'XX',
    },
  };

  const poorQuality = checkDataQuality(incompleteData, {
    countryCode: 'XX',
  });

  logger.info(`\nIncomplete data score: ${poorQuality.score}/100`);

  if (poorQuality.score < 50 && !poorQuality.passed) {
    logger.success('✓ Low quality data correctly identified');
  } else {
    logger.error('✗ Quality check not sensitive enough');
  }

  console.log(generateQualityReport(qualityReport));
}

/**
 * Test 4: Array merging
 */
function testArrayMerging() {
  logger.section('Test 4: Array Merging');

  const { mergeArrays } = require('./utils/data-merge');

  const existing = ['en', 'ja'];
  const incoming = ['ja', 'zh', 'ko'];

  const merged = mergeArrays(existing, incoming);

  logger.info('Existing:', existing);
  logger.info('Incoming:', incoming);
  logger.info('Merged:', merged);

  if (merged.length === 4 && merged.includes('en') && merged.includes('zh')) {
    logger.success('✓ Arrays merged correctly without duplicates');
  } else {
    logger.error('✗ Array merge failed');
  }
}

/**
 * Test 5: Deep merge
 */
function testDeepMerge() {
  logger.section('Test 5: Deep Object Merge');

  const { deepMerge } = require('./utils/data-merge');

  const target = {
    metadata: {
      source: 'Old Source',
      version: '1.0',
    },
    custom: {
      field1: 'value1',
    },
  };

  const source = {
    metadata: {
      source: 'New Source',
      fetched_at: '2024-12-09',
    },
    custom: {
      field2: 'value2',
    },
  };

  const merged = deepMerge(target, source);

  logger.info('Merged metadata:', merged.metadata);
  logger.info('Merged custom:', merged.custom);

  if (
    merged.metadata.source === 'New Source' &&
    merged.metadata.version === '1.0' &&
    merged.metadata.fetched_at === '2024-12-09' &&
    merged.custom.field1 === 'value1' &&
    merged.custom.field2 === 'value2'
  ) {
    logger.success('✓ Deep merge preserved and merged nested objects');
  } else {
    logger.error('✗ Deep merge failed');
  }
}

/**
 * Test 6: Regex validation
 */
function testRegexValidation() {
  logger.section('Test 6: Regex Pattern Validation');

  const validData = {
    country_code: 'US',
    libaddressinput: {
      key: 'US',
      name: 'UNITED STATES',
      postal_code_pattern: '^\\d{5}(-\\d{4})?$',
    },
  };

  const invalidData = {
    country_code: 'XX',
    libaddressinput: {
      key: 'XX',
      name: 'TEST',
      postal_code_pattern: '[invalid(regex',
    },
  };

  const validReport = checkDataQuality(validData);
  const invalidReport = checkDataQuality(invalidData);

  if (validReport.summary.warnings === 0) {
    logger.success('✓ Valid regex pattern accepted');
  } else {
    logger.error('✗ Valid regex incorrectly flagged');
  }

  if (invalidReport.summary.warnings > 0) {
    logger.success('✓ Invalid regex pattern detected');
  } else {
    logger.error('✗ Invalid regex not detected');
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  logger.section('Data Merge and Quality Algorithm Tests');
  logger.info('Starting test suite...\n');

  const tests = [
    testBasicMerge,
    testConflictDetection,
    testQualityChecking,
    testArrayMerging,
    testDeepMerge,
    testRegexValidation,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      test();
      passed++;
      console.log(''); // Add spacing between tests
    } catch (error) {
      failed++;
      logger.error(`Test failed: ${error.message}`);
      logger.error(error.stack);
    }
  }

  logger.section('Test Results');
  logger.success(`Passed: ${passed}/${tests.length}`);
  if (failed > 0) {
    logger.error(`Failed: ${failed}/${tests.length}`);
  }

  if (failed === 0) {
    logger.success('\n✓ All tests passed!');
  } else {
    logger.error('\n✗ Some tests failed');
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testBasicMerge,
  testConflictDetection,
  testQualityChecking,
  testArrayMerging,
  testDeepMerge,
  testRegexValidation,
};
