/**
 * Validation utilities for data processing
 */

/**
 * Validate country code format
 * @param {string} code - Country code to validate
 * @returns {boolean} True if valid
 */
function isValidCountryCode(code) {
  return typeof code === 'string' && /^[A-Z]{2}$/.test(code);
}

/**
 * Validate libaddressinput data structure
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
function validateLibAddressData(data) {
  const errors = [];
  const warnings = [];

  if (!data) {
    errors.push('Data is null or undefined');
    return { valid: false, errors, warnings };
  }

  if (typeof data !== 'object') {
    errors.push('Data is not an object');
    return { valid: false, errors, warnings };
  }

  // Check required fields
  if (!data.key) {
    errors.push('Missing required field: key');
  }

  if (!data.name) {
    warnings.push('Missing recommended field: name');
  }

  // Validate format field if present
  if (data.fmt && typeof data.fmt !== 'string') {
    errors.push('Format field (fmt) must be a string');
  }

  // Validate postal code pattern if present
  if (data.zip) {
    try {
      new RegExp(data.zip);
    } catch (error) {
      errors.push(`Invalid postal code regex pattern: ${error.message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate transformed data structure
 * @param {Object} data - Transformed data to validate
 * @returns {Object} Validation result
 */
function validateTransformedData(data) {
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data structure');
    return { valid: false, errors, warnings };
  }

  if (!data.country_code) {
    errors.push('Missing country_code field');
  } else if (!isValidCountryCode(data.country_code)) {
    errors.push(`Invalid country code format: ${data.country_code}`);
  }

  if (!data.libaddressinput) {
    errors.push('Missing libaddressinput field');
  } else {
    if (!data.libaddressinput.key) {
      errors.push('Missing libaddressinput.key field');
    }
    if (!data.libaddressinput.name) {
      warnings.push('Missing libaddressinput.name field');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim();
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  isValidCountryCode,
  validateLibAddressData,
  validateTransformedData,
  sanitizeString,
  isValidUrl,
};
