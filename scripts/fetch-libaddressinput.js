#!/usr/bin/env node

/**
 * Fetch address data from Google's libaddressinput API
 * https://chromium-i18n.appspot.com/ssl-address/data
 *
 * This script fetches address metadata for all countries and converts it to YAML and JSON format.
 * 
 * Refactored to use modular utilities for better maintainability.
 */

const path = require('path');
const {
  createLogger,
  fetchJSON,
  writeJSON,
  writeText,
  jsonToYaml,
  BASE_URL,
  ALL_COUNTRY_CODES,
  ADDITIONAL_FIELDS,
  REQUEST_CONFIG,
  RATE_LIMIT,
} = require('./utils');

// Initialize logger
const logger = createLogger({ prefix: 'libaddressinput' });

/**
 * Transform libaddressinput data to our repository format
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @param {Object} data - Raw libaddressinput data
 * @returns {Object} Transformed data
 */
function transformLibAddressData(countryCode, data) {
  const transformed = {
    country_code: countryCode,
    libaddressinput: {
      key: data.key || countryCode,
      name: data.name || '',
    },
  };

  // Add format if available
  if (data.fmt) {
    transformed.libaddressinput.format = data.fmt;
  }

  // Add required fields if available
  if (data.require) {
    transformed.libaddressinput.require = data.require;
  }

  // Add postal code info if available
  if (data.zip) {
    transformed.libaddressinput.postal_code_pattern = data.zip;
  }

  if (data.zipex) {
    transformed.libaddressinput.postal_code_examples = data.zipex;
  }

  // Add sub-regions if available
  if (data.sub_keys) {
    transformed.libaddressinput.sub_keys = data.sub_keys.split('~');
  }

  if (data.sub_names) {
    transformed.libaddressinput.sub_names = data.sub_names.split('~');
  }

  // Add language-specific data
  if (data.lang) {
    transformed.libaddressinput.languages = data.lang.split('~');
  }

  // Add other useful fields
  ADDITIONAL_FIELDS.forEach((field) => {
    if (data[field]) {
      transformed.libaddressinput[field] = data[field];
    }
  });

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
 * Fetch and save data for a single country
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {Promise<Object>} Result object with success status
 */
async function fetchCountry(countryCode) {
  const url = `${BASE_URL}/data/${countryCode}`;

  try {
    logger.debug(`Fetching ${countryCode}...`);
    const data = await fetchJSON(url, REQUEST_CONFIG);
    const transformed = transformLibAddressData(countryCode, data);

    // Determine output directory
    const outputDir = getOutputDirectory(countryCode);

    // Write JSON file
    const jsonPath = path.join(outputDir, `${countryCode}.json`);
    writeJSON(jsonPath, transformed);
    logger.debug(`Saved ${jsonPath}`);

    // Write YAML file
    const yamlPath = path.join(outputDir, `${countryCode}.yaml`);
    const yamlContent = jsonToYaml(transformed);
    writeText(yamlPath, yamlContent);
    logger.debug(`Saved ${yamlPath}`);

    return { success: true, countryCode };
  } catch (error) {
    logger.error(`Failed to fetch ${countryCode}: ${error.message}`);
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
  };

  logger.section('Starting libaddressinput data fetch');
  logger.info(`Total countries to fetch: ${ALL_COUNTRY_CODES.length}`);

  // Process countries with delay to avoid rate limiting
  for (let i = 0; i < ALL_COUNTRY_CODES.length; i++) {
    const countryCode = ALL_COUNTRY_CODES[i];
    
    // Show progress
    logger.progress(i + 1, ALL_COUNTRY_CODES.length, countryCode);
    
    const result = await fetchCountry(countryCode);

    if (result.success) {
      results.success.push(countryCode);
    } else {
      results.failed.push({ code: countryCode, error: result.error });
    }

    // Add delay between requests
    if (i < ALL_COUNTRY_CODES.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT.delay));
    }
  }

  return results;
}

/**
 * Print summary of results
 * @param {Object} results - Results object
 */
function printSummary(results) {
  logger.section('SUMMARY');
  logger.info(`Total: ${ALL_COUNTRY_CODES.length}`);
  logger.success(`Success: ${results.success.length}`);
  
  if (results.failed.length > 0) {
    logger.error(`Failed: ${results.failed.length}`);
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

    logger.success('\nDone!');
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
  transformLibAddressData,
  getOutputDirectory,
};
