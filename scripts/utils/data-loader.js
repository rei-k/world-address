/**
 * Data loader utilities for external JSON data files
 * This module provides functions to load reference data from JSON files
 */

const fs = require('fs');
const path = require('path');

// Cache for loaded data to avoid repeated file reads
const dataCache = {};

/**
 * Load JSON data file with caching
 * @param {string} filename - Name of the data file (without path)
 * @returns {Object} Parsed JSON data
 */
function loadData(filename) {
  // Return cached data if available
  if (dataCache[filename]) {
    return dataCache[filename];
  }

  const dataPath = path.join(__dirname, '..', 'data', filename);

  try {
    const content = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(content);
    
    // Cache the data
    dataCache[filename] = data;
    
    return data;
  } catch (error) {
    throw new Error(`Failed to load data file ${filename}: ${error.message}`);
  }
}

/**
 * Load currency data
 * @returns {Object} Currency data by country code
 */
function loadCurrencyData() {
  return loadData('currency-data.json');
}

/**
 * Load timezone data
 * @returns {Object} Timezone data by country code
 */
function loadTimezoneData() {
  return loadData('timezone-data.json');
}

/**
 * Load country coordinates data
 * @returns {Object} Country coordinates by country code
 */
function loadCountryCoordinates() {
  return loadData('country-coordinates.json');
}

/**
 * Load special region coordinates data
 * @returns {Object} Special region coordinates by region identifier
 */
function loadSpecialRegionCoordinates() {
  return loadData('special-region-coordinates.json');
}

/**
 * Load country codes organized by region
 * @returns {Object} Country codes grouped by region
 */
function loadCountryCodes() {
  return loadData('country-codes.json');
}

/**
 * Get all country codes as a flat array
 * @returns {string[]} Array of all country codes
 */
function getAllCountryCodes() {
  const countryCodes = loadCountryCodes();
  return Object.values(countryCodes).flat();
}

/**
 * Clear the data cache (useful for testing)
 */
function clearCache() {
  Object.keys(dataCache).forEach(key => delete dataCache[key]);
}

module.exports = {
  loadData,
  loadCurrencyData,
  loadTimezoneData,
  loadCountryCoordinates,
  loadSpecialRegionCoordinates,
  loadCountryCodes,
  getAllCountryCodes,
  clearCache,
};
