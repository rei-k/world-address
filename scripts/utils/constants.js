/**
 * Constants for libaddressinput fetcher
 */

const { loadCountryCodes } = require('./data-loader');

// Base URL for Google's libaddressinput API
const BASE_URL = 'https://chromium-i18n.appspot.com/ssl-address';

// Load country codes from external data file
// This keeps the constants file focused and data separated
const COUNTRY_CODES = loadCountryCodes();

// Flatten all country codes
const ALL_COUNTRY_CODES = Object.values(COUNTRY_CODES).flat();

// Additional fields to extract from libaddressinput data
const ADDITIONAL_FIELDS = ['id', 'sub_isoids', 'sub_lnames', 'sub_mores', 'sub_zips', 'sub_zipexs'];

// Request configuration
const REQUEST_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  exponentialBackoff: true,
};

// Rate limiting configuration
const RATE_LIMIT = {
  delay: 100, // ms between requests
  batchSize: 10, // number of concurrent requests
};

module.exports = {
  BASE_URL,
  COUNTRY_CODES,
  ALL_COUNTRY_CODES,
  ADDITIONAL_FIELDS,
  REQUEST_CONFIG,
  RATE_LIMIT,
};
