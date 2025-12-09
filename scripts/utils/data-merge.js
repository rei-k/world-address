/**
 * Data merge utilities for intelligent merging of libaddressinput data
 * with existing country data
 *
 * This module provides algorithms for:
 * - Smart merging of new libaddressinput data with existing data
 * - Conflict detection and resolution
 * - Data preservation during updates
 * - Change tracking and logging
 */

const { createLogger } = require('./logger');
const { readJSON } = require('./file');
const fs = require('fs');
const path = require('path');

const logger = createLogger({ prefix: 'data-merge' });

/**
 * Merge strategies for different data types
 */
const MERGE_STRATEGIES = {
  PRESERVE_EXISTING: 'preserve_existing', // Keep existing data, ignore new
  UPDATE_WITH_NEW: 'update_with_new', // Replace with new data
  MERGE_ARRAYS: 'merge_arrays', // Merge arrays intelligently
  DEEP_MERGE: 'deep_merge', // Deep merge objects
  PREFER_NON_EMPTY: 'prefer_non_empty', // Use non-empty value
};

/**
 * Field merge rules - defines how each field should be merged
 */
const FIELD_MERGE_RULES = {
  // Country metadata - preserve existing custom data
  name: MERGE_STRATEGIES.PRESERVE_EXISTING,
  iso_codes: MERGE_STRATEGIES.PRESERVE_EXISTING,
  continent: MERGE_STRATEGIES.PRESERVE_EXISTING,
  subregion: MERGE_STRATEGIES.PRESERVE_EXISTING,
  languages: MERGE_STRATEGIES.PRESERVE_EXISTING,
  administrative_divisions: MERGE_STRATEGIES.PRESERVE_EXISTING,
  address_format: MERGE_STRATEGIES.PRESERVE_EXISTING,
  examples: MERGE_STRATEGIES.PRESERVE_EXISTING,
  pos: MERGE_STRATEGIES.PRESERVE_EXISTING,
  geo: MERGE_STRATEGIES.PRESERVE_EXISTING,

  // libaddressinput section - always update with new data
  libaddressinput: MERGE_STRATEGIES.UPDATE_WITH_NEW,

  // Metadata - update with new fetch info
  metadata: MERGE_STRATEGIES.DEEP_MERGE,
};

/**
 * Check if a value is empty
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * Merge arrays intelligently (remove duplicates, maintain order)
 * @param {Array} existing - Existing array
 * @param {Array} incoming - Incoming array
 * @returns {Array} Merged array
 */
function mergeArrays(existing, incoming) {
  if (!Array.isArray(existing)) return incoming;
  if (!Array.isArray(incoming)) return existing;

  // Use Set to remove duplicates while preserving order
  const merged = [...existing];
  for (const item of incoming) {
    if (!merged.includes(item)) {
      merged.push(item);
    }
  }

  return merged;
}

/**
 * Merge a single field based on its strategy
 * @param {string} fieldName - Field name
 * @param {*} existingValue - Existing value
 * @param {*} newValue - New value
 * @param {string} strategy - Merge strategy
 * @returns {*} Merged value
 */
function mergeField(fieldName, existingValue, newValue, strategy) {
  switch (strategy) {
    case MERGE_STRATEGIES.PRESERVE_EXISTING:
      return existingValue !== undefined ? existingValue : newValue;

    case MERGE_STRATEGIES.UPDATE_WITH_NEW:
      return newValue !== undefined ? newValue : existingValue;

    case MERGE_STRATEGIES.MERGE_ARRAYS:
      return mergeArrays(existingValue, newValue);

    case MERGE_STRATEGIES.DEEP_MERGE:
      if (typeof existingValue === 'object' && typeof newValue === 'object') {
        return deepMerge(existingValue || {}, newValue || {});
      }
      return newValue !== undefined ? newValue : existingValue;

    case MERGE_STRATEGIES.PREFER_NON_EMPTY:
      if (!isEmpty(existingValue)) return existingValue;
      if (!isEmpty(newValue)) return newValue;
      return existingValue;

    default:
      logger.warn(`Unknown merge strategy: ${strategy}, using UPDATE_WITH_NEW`);
      return newValue !== undefined ? newValue : existingValue;
  }
}

/**
 * Detect conflicts between existing and new data
 * @param {Object} existing - Existing data
 * @param {Object} incoming - Incoming data
 * @returns {Array} Array of conflict objects
 */
function detectConflicts(existing, incoming) {
  const conflicts = [];

  // Only check fields that should be preserved but have different values
  const preservedFields = Object.keys(FIELD_MERGE_RULES).filter(
    (field) => FIELD_MERGE_RULES[field] === MERGE_STRATEGIES.PRESERVE_EXISTING
  );

  for (const field of preservedFields) {
    const existingVal = existing[field];
    const incomingVal = incoming[field];

    // Skip if either is undefined or they're the same
    if (existingVal === undefined || incomingVal === undefined) continue;
    if (JSON.stringify(existingVal) === JSON.stringify(incomingVal)) continue;

    conflicts.push({
      field,
      existing: existingVal,
      incoming: incomingVal,
      resolution: 'preserved_existing',
    });
  }

  return conflicts;
}

/**
 * Merge libaddressinput data with existing country data
 * @param {Object} existingData - Existing country data
 * @param {Object} newLibAddressData - New libaddressinput data
 * @param {Object} options - Merge options
 * @returns {Object} Merge result with data and metadata
 */
function mergeData(existingData, newLibAddressData, options = {}) {
  const {
    countryCode = 'UNKNOWN',
    preserveCustomFields = true,
    trackChanges = true,
  } = options;

  // If no existing data, return new data as-is
  if (!existingData || Object.keys(existingData).length === 0) {
    logger.debug(`No existing data for ${countryCode}, using new data`);
    return {
      data: newLibAddressData,
      conflicts: [],
      changes: {
        type: 'new',
        fields: Object.keys(newLibAddressData),
      },
    };
  }

  // Detect conflicts before merging
  const conflicts = detectConflicts(existingData, newLibAddressData);

  if (conflicts.length > 0) {
    logger.info(`Detected ${conflicts.length} conflicts for ${countryCode}`);
  }

  // Perform merge based on field rules
  const mergedData = {};
  const changedFields = [];

  // Get all unique field names from both objects
  const allFields = new Set([
    ...Object.keys(existingData),
    ...Object.keys(newLibAddressData),
  ]);

  for (const field of allFields) {
    const strategy = FIELD_MERGE_RULES[field] || MERGE_STRATEGIES.UPDATE_WITH_NEW;
    const existingValue = existingData[field];
    const newValue = newLibAddressData[field];

    const mergedValue = mergeField(field, existingValue, newValue, strategy);
    mergedData[field] = mergedValue;

    // Track changes if enabled
    if (
      trackChanges &&
      JSON.stringify(existingValue) !== JSON.stringify(mergedValue)
    ) {
      changedFields.push({
        field,
        strategy,
        before: existingValue,
        after: mergedValue,
      });
    }
  }

  // Preserve custom fields that don't conflict with standard fields
  if (preserveCustomFields) {
    for (const field in existingData) {
      if (
        !Object.prototype.hasOwnProperty.call(newLibAddressData, field) &&
        !Object.prototype.hasOwnProperty.call(FIELD_MERGE_RULES, field)
      ) {
        mergedData[field] = existingData[field];
        logger.debug(`Preserved custom field: ${field}`);
      }
    }
  }

  return {
    data: mergedData,
    conflicts,
    changes: {
      type: changedFields.length > 0 ? 'updated' : 'unchanged',
      fields: changedFields,
      count: changedFields.length,
    },
  };
}

/**
 * Merge libaddressinput data with existing YAML/JSON file
 * @param {string} filePath - Path to existing file (JSON or YAML)
 * @param {Object} newLibAddressData - New libaddressinput data
 * @param {Object} options - Merge options
 * @returns {Object} Merge result
 */
function mergeWithFile(filePath, newLibAddressData, options = {}) {
  const countryCode = options.countryCode || path.basename(filePath, path.extname(filePath));

  let existingData = {};

  // Try to read existing file
  if (fs.existsSync(filePath)) {
    try {
      existingData = readJSON(filePath);
      logger.debug(`Loaded existing data from ${filePath}`);
    } catch (error) {
      logger.warn(`Failed to read existing file ${filePath}: ${error.message}`);
      logger.warn('Will treat as new file');
    }
  } else {
    logger.debug(`File does not exist: ${filePath}, will create new`);
  }

  return mergeData(existingData, newLibAddressData, {
    countryCode,
    ...options,
  });
}

/**
 * Generate merge report for logging/debugging
 * @param {Object} mergeResult - Result from mergeData
 * @param {string} countryCode - Country code
 * @returns {string} Formatted report
 */
function generateMergeReport(mergeResult, countryCode) {
  const { conflicts, changes } = mergeResult;

  const lines = [];
  lines.push(`\nMerge Report for ${countryCode}`);
  lines.push('='.repeat(50));
  lines.push(`Change Type: ${changes.type}`);
  lines.push(`Changed Fields: ${changes.count}`);

  if (conflicts.length > 0) {
    lines.push(`\nConflicts Detected: ${conflicts.length}`);
    conflicts.forEach((conflict, i) => {
      lines.push(`  ${i + 1}. ${conflict.field}: ${conflict.resolution}`);
    });
  }

  if (changes.fields && changes.fields.length > 0) {
    lines.push(`\nField Changes:`);
    changes.fields.forEach((change, i) => {
      lines.push(`  ${i + 1}. ${change.field} (${change.strategy})`);
    });
  }

  return lines.join('\n');
}

module.exports = {
  MERGE_STRATEGIES,
  FIELD_MERGE_RULES,
  mergeData,
  mergeWithFile,
  mergeField,
  detectConflicts,
  generateMergeReport,
  deepMerge,
  mergeArrays,
  isEmpty,
};
