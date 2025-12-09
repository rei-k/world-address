#!/usr/bin/env node

/**
 * Enhanced libaddressinput data fetcher with intelligent merge and quality checking
 * Version 3 - with AI-powered data quality and smart merging
 *
 * New Features:
 * - Intelligent data merging with existing country data
 * - Comprehensive data quality checking
 * - Conflict detection and resolution
 * - Quality score calculation
 * - Detailed merge reports
 */

const path = require('path');
const {
  createLogger,
  fetchJSON,
  writeJSON,
  writeText,
  readJSON,
  jsonToYaml,
  ensureDir,
  BASE_URL,
  ALL_COUNTRY_CODES,
  REQUEST_CONFIG,
  RATE_LIMIT,
  mergeWithFile,
  generateMergeReport,
  checkDataQuality,
  generateQualityReport,
} = require('./utils');

// Initialize logger
const logger = createLogger({ prefix: 'libaddressinput-v3' });

// Statistics tracking
const stats = {
  countries: { total: 0, success: 0, failed: 0, unchanged: 0 },
  regions: { total: 0, success: 0, failed: 0 },
  changes: { new: 0, updated: 0 },
  quality: { passed: 0, failed: 0, avgScore: 0, totalScore: 0 },
  conflicts: { total: 0 },
  startTime: Date.now(),
};

/**
 * Transform libaddressinput data to our repository format
 * @param {string} key - Data key (e.g., "US" or "US/CA")
 * @param {Object} data - Raw libaddressinput data
 * @returns {Object} Transformed data
 */
function transformData(key, data) {
  const transformed = {
    key: data.key || key,
    name: data.name || '',
  };

  // Add ID if available
  if (data.id) {
    transformed.id = data.id;
  }

  // Add format if available
  if (data.fmt) {
    transformed.format = data.fmt;
  }

  // Add language-specific formats
  if (data.lfmt) {
    transformed.local_format = data.lfmt;
  }

  // Add required fields if available
  if (data.require) {
    transformed.required_fields = data.require;
  }

  // Add upper fields if available
  if (data.upper) {
    transformed.uppercase_fields = data.upper;
  }

  // Add postal code info if available
  if (data.zip) {
    transformed.postal_code_pattern = data.zip;
  }

  if (data.zipex) {
    transformed.postal_code_examples = data.zipex;
  }

  // Add state/province label if available
  if (data.state_name_type) {
    transformed.state_name_type = data.state_name_type;
  }

  if (data.locality_name_type) {
    transformed.locality_name_type = data.locality_name_type;
  }

  if (data.sublocality_name_type) {
    transformed.sublocality_name_type = data.sublocality_name_type;
  }

  // Add sub-regions if available
  if (data.sub_keys) {
    transformed.sub_keys = data.sub_keys.split('~');
  }

  if (data.sub_names) {
    transformed.sub_names = data.sub_names.split('~');
  }

  if (data.sub_lnames) {
    transformed.sub_local_names = data.sub_lnames.split('~');
  }

  if (data.sub_isoids) {
    transformed.sub_iso_codes = data.sub_isoids.split('~');
  }

  if (data.sub_zips) {
    transformed.sub_postal_patterns = data.sub_zips.split('~');
  }

  if (data.sub_zipexs) {
    transformed.sub_postal_examples = data.sub_zipexs.split('~');
  }

  if (data.sub_mores) {
    transformed.sub_has_children = data.sub_mores.split('~').map((val) => val === 'true');
  }

  // Add language-specific data
  if (data.lang) {
    transformed.languages = data.lang.split('~');
  }

  if (data.languages) {
    transformed.languages = data.languages.split('~');
  }

  return transformed;
}

/**
 * Fetch data for a specific key with retry logic
 * @param {string} key - Data key (e.g., "US" or "US/CA")
 * @param {number} depth - Current depth in hierarchy
 * @returns {Promise<Object|null>} Fetched data or null on failure
 */
async function fetchDataWithRetry(key, depth = 0) {
  const url = `${BASE_URL}/data/${key}`;
  const indent = '  '.repeat(depth);

  try {
    logger.debug(`${indent}Fetching ${key}...`);
    const data = await fetchJSON(url, REQUEST_CONFIG);
    return data;
  } catch (error) {
    logger.debug(`${indent}Failed to fetch ${key}: ${error.message}`);
    return null;
  }
}

/**
 * Recursively fetch all hierarchical data for a region
 * @param {string} key - Data key (e.g., "US" or "US/CA")
 * @param {number} depth - Current depth in hierarchy
 * @returns {Promise<Object>} Complete hierarchical data
 */
async function fetchHierarchicalData(key, depth = 0) {
  const data = await fetchDataWithRetry(key, depth);

  if (!data) {
    stats.regions.failed++;
    return null;
  }

  stats.regions.success++;
  const transformed = transformData(key, data);

  // If this region has sub-regions, fetch them recursively
  if (data.sub_keys) {
    const subKeys = data.sub_keys.split('~');
    const subData = {};

    for (const subKey of subKeys) {
      const fullKey = `${key}/${subKey}`;

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT.delay));

      const childData = await fetchHierarchicalData(fullKey, depth + 1);
      if (childData) {
        subData[subKey] = childData;
      }
    }

    if (Object.keys(subData).length > 0) {
      transformed.sub_regions = subData;
    }
  }

  return transformed;
}

/**
 * Determine the output directory for a country code
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {string} Output directory path
 */
function getOutputDirectory(countryCode) {
  const baseDir = path.join(__dirname, '..', 'data', 'libaddressinput');
  const firstLetter = countryCode.charAt(0).toUpperCase();
  return path.join(baseDir, firstLetter);
}

/**
 * Fetch and save data for a single country with intelligent merge and quality check
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {Promise<Object>} Result object with success status
 */
async function fetchCountry(countryCode) {
  stats.countries.total++;

  try {
    logger.debug(`\nProcessing ${countryCode}...`);

    // Fetch hierarchical data
    stats.regions.total++;
    const hierarchicalData = await fetchHierarchicalData(countryCode);

    if (!hierarchicalData) {
      logger.error(`Failed to fetch data for ${countryCode}`);
      stats.countries.failed++;
      return { success: false, countryCode, error: 'Failed to fetch data' };
    }

    // Create new data structure
    const newData = {
      country_code: countryCode,
      libaddressinput: hierarchicalData,
      metadata: {
        source: 'Google libaddressinput API',
        source_url: `${BASE_URL}/data/${countryCode}`,
        fetched_at: new Date().toISOString(),
        version: '3.0',
      },
    };

    // Determine output paths
    const outputDir = getOutputDirectory(countryCode);
    const jsonPath = path.join(outputDir, `${countryCode}.json`);
    const yamlPath = path.join(outputDir, `${countryCode}.yaml`);

    // Merge with existing data using intelligent merge
    const mergeResult = mergeWithFile(jsonPath, newData, {
      countryCode,
      preserveCustomFields: true,
      trackChanges: true,
    });

    const { data: finalData, conflicts, changes } = mergeResult;

    // Track conflicts
    if (conflicts.length > 0) {
      stats.conflicts.total += conflicts.length;
      logger.debug(generateMergeReport(mergeResult, countryCode));
    }

    // Perform quality check
    const qualityReport = checkDataQuality(finalData, {
      countryCode,
      includeRecommendations: true,
      includeAnomalies: true,
    });

    // Update quality statistics
    stats.quality.totalScore += qualityReport.score;
    if (qualityReport.passed) {
      stats.quality.passed++;
    } else {
      stats.quality.failed++;
      logger.warn(generateQualityReport(qualityReport));
    }

    // Check if data has changed
    const hasChanged = changes.type !== 'unchanged';

    if (!hasChanged) {
      logger.debug(`No changes for ${countryCode} (Quality: ${qualityReport.score}/100)`);
      stats.countries.unchanged++;
      stats.countries.success++;
      return { success: true, countryCode, changed: false };
    }

    // Only save if quality check passes or if it's a new file
    if (!qualityReport.passed && changes.type !== 'new') {
      logger.error(
        `Quality check failed for ${countryCode} (Score: ${qualityReport.score}/100), skipping update`
      );
      stats.countries.failed++;
      return {
        success: false,
        countryCode,
        error: `Quality check failed (Score: ${qualityReport.score}/100)`,
      };
    }

    // Ensure output directory exists
    ensureDir(outputDir);

    // Write JSON file
    writeJSON(jsonPath, finalData);
    logger.debug(`Saved ${jsonPath} (Quality: ${qualityReport.score}/100)`);

    // Write YAML file
    const yamlContent = jsonToYaml(finalData);
    writeText(yamlPath, yamlContent);
    logger.debug(`Saved ${yamlPath}`);

    // Track whether this is new or updated
    if (changes.type === 'new') {
      stats.changes.new++;
    } else {
      stats.changes.updated++;
    }

    stats.countries.success++;
    return {
      success: true,
      countryCode,
      changed: true,
      qualityScore: qualityReport.score,
    };
  } catch (error) {
    logger.error(`Failed to process ${countryCode}: ${error.message}`);
    stats.countries.failed++;
    return { success: false, countryCode, error: error.message };
  }
}

/**
 * Process all countries with rate limiting
 * @returns {Promise<Object>} Results summary
 */
async function processAllCountries() {
  const results = {
    success: [],
    failed: [],
    unchanged: [],
  };

  logger.section('Starting libaddressinput v3 data fetch');
  logger.info(`Total countries to fetch: ${ALL_COUNTRY_CODES.length}`);
  logger.info('Features enabled:');
  logger.info('  ✓ Hierarchical data fetching');
  logger.info('  ✓ Intelligent data merging');
  logger.info('  ✓ Conflict detection');
  logger.info('  ✓ Quality checking');
  logger.info('');

  // Process countries with delay to avoid rate limiting
  for (let i = 0; i < ALL_COUNTRY_CODES.length; i++) {
    const countryCode = ALL_COUNTRY_CODES[i];

    // Show progress
    logger.progress(i + 1, ALL_COUNTRY_CODES.length, countryCode);

    const result = await fetchCountry(countryCode);

    if (result.success) {
      results.success.push(countryCode);
      if (!result.changed) {
        results.unchanged.push(countryCode);
      }
    } else {
      results.failed.push({ code: countryCode, error: result.error });
    }

    // Add delay between countries
    if (i < ALL_COUNTRY_CODES.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT.delay * 2));
    }
  }

  return results;
}

/**
 * Print detailed summary of results
 * @param {Object} results - Results object
 */
function printSummary(results) {
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);

  logger.section('SUMMARY');
  logger.info(`Execution time: ${duration}s\n`);

  logger.info('Countries:');
  logger.info(`  Total: ${stats.countries.total}`);
  logger.success(`  Success: ${stats.countries.success}`);
  logger.info(`  Unchanged: ${stats.countries.unchanged}`);

  if (stats.countries.failed > 0) {
    logger.error(`  Failed: ${stats.countries.failed}`);
  }

  logger.info('');
  logger.info('Regions fetched:');
  logger.info(`  Total: ${stats.regions.total}`);
  logger.success(`  Success: ${stats.regions.success}`);

  if (stats.regions.failed > 0) {
    logger.error(`  Failed: ${stats.regions.failed}`);
  }

  logger.info('');
  logger.info('Changes:');
  logger.info(`  New files: ${stats.changes.new}`);
  logger.info(`  Updated files: ${stats.changes.updated}`);

  logger.info('');
  logger.info('Data Quality:');
  const avgQualityScore =
    stats.countries.total > 0
      ? (stats.quality.totalScore / stats.countries.total).toFixed(1)
      : 0;
  logger.info(`  Average score: ${avgQualityScore}/100`);
  logger.success(`  Passed: ${stats.quality.passed}`);

  if (stats.quality.failed > 0) {
    logger.error(`  Failed: ${stats.quality.failed}`);
  }

  if (stats.conflicts.total > 0) {
    logger.info('');
    logger.info('Conflicts:');
    logger.warn(`  Total conflicts resolved: ${stats.conflicts.total}`);
  }

  if (results.failed.length > 0) {
    logger.info('\nFailed countries:');
    results.failed.forEach(({ code, error }) => {
      logger.error(`  ${code}: ${error}`);
    });
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const results = await processAllCountries();
    printSummary(results);

    // Exit with error code if there were failures
    if (results.failed.length > 0) {
      process.exit(1);
    }

    logger.success('\n✓ All done!');
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  fetchCountry,
  transformData,
  fetchHierarchicalData,
  getOutputDirectory,
};
