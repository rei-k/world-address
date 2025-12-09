/**
 * Data quality checker for libaddressinput and country data
 *
 * This module provides algorithms for:
 * - Validating data completeness
 * - Checking data consistency
 * - Detecting anomalies
 * - Scoring data quality
 */

const { createLogger } = require('./logger');
const { isValidCountryCode } = require('./validation');

const logger = createLogger({ prefix: 'data-quality' });

/**
 * Quality check severity levels
 */
const SEVERITY = {
  CRITICAL: 'critical', // Must be fixed
  WARNING: 'warning', // Should be fixed
  INFO: 'info', // Optional improvement
};

/**
 * Required fields for libaddressinput data
 */
const REQUIRED_FIELDS = {
  libaddressinput: {
    key: SEVERITY.CRITICAL,
    name: SEVERITY.WARNING,
  },
  country_code: SEVERITY.CRITICAL,
};

/**
 * Recommended fields for complete data
 */
const RECOMMENDED_FIELDS = {
  libaddressinput: {
    format: SEVERITY.INFO,
    postal_code_pattern: SEVERITY.INFO,
    postal_code_examples: SEVERITY.INFO,
    state_name_type: SEVERITY.INFO,
  },
  metadata: {
    source: SEVERITY.INFO,
    fetched_at: SEVERITY.INFO,
  },
};

/**
 * Check if a field exists and is not empty
 * @param {Object} obj - Object to check
 * @param {string} path - Dot-notation path to field
 * @returns {boolean} True if field exists and is not empty
 */
function hasField(obj, path) {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }

  // Check if value is not empty
  if (current === null || current === undefined) {
    return false;
  }
  if (typeof current === 'string') {
    return current.trim() !== '';
  }
  if (Array.isArray(current)) {
    return current.length > 0;
  }
  if (typeof current === 'object') {
    return Object.keys(current).length > 0;
  }

  return true;
}

/**
 * Check required fields
 * @param {Object} data - Data to check
 * @returns {Array} Array of issues found
 */
function checkRequiredFields(data) {
  const issues = [];

  // Check country_code
  if (!hasField(data, 'country_code')) {
    issues.push({
      type: 'missing_field',
      severity: SEVERITY.CRITICAL,
      field: 'country_code',
      message: 'Missing required field: country_code',
    });
  } else if (!isValidCountryCode(data.country_code)) {
    issues.push({
      type: 'invalid_value',
      severity: SEVERITY.CRITICAL,
      field: 'country_code',
      value: data.country_code,
      message: `Invalid country code format: ${data.country_code}`,
    });
  }

  // Check libaddressinput fields
  if (!hasField(data, 'libaddressinput')) {
    issues.push({
      type: 'missing_section',
      severity: SEVERITY.CRITICAL,
      field: 'libaddressinput',
      message: 'Missing libaddressinput section',
    });
  } else {
    for (const [field, severity] of Object.entries(REQUIRED_FIELDS.libaddressinput)) {
      if (!hasField(data.libaddressinput, field)) {
        issues.push({
          type: 'missing_field',
          severity,
          field: `libaddressinput.${field}`,
          message: `Missing required field: libaddressinput.${field}`,
        });
      }
    }
  }

  return issues;
}

/**
 * Check recommended fields
 * @param {Object} data - Data to check
 * @returns {Array} Array of suggestions
 */
function checkRecommendedFields(data) {
  const suggestions = [];

  for (const [section, fields] of Object.entries(RECOMMENDED_FIELDS)) {
    if (!hasField(data, section)) {
      suggestions.push({
        type: 'missing_section',
        severity: SEVERITY.INFO,
        field: section,
        message: `Missing recommended section: ${section}`,
      });
      continue;
    }

    for (const [field, severity] of Object.entries(fields)) {
      if (!hasField(data[section], field)) {
        suggestions.push({
          type: 'missing_field',
          severity,
          field: `${section}.${field}`,
          message: `Missing recommended field: ${section}.${field}`,
        });
      }
    }
  }

  return suggestions;
}

/**
 * Check data consistency
 * @param {Object} data - Data to check
 * @returns {Array} Array of consistency issues
 */
function checkConsistency(data) {
  const issues = [];

  // Check if country_code matches libaddressinput.key
  if (
    hasField(data, 'country_code') &&
    hasField(data, 'libaddressinput.key')
  ) {
    const countryCode = data.country_code;
    const key = data.libaddressinput.key;

    if (key !== countryCode && !key.startsWith(`${countryCode}/`)) {
      issues.push({
        type: 'inconsistency',
        severity: SEVERITY.WARNING,
        field: 'country_code vs libaddressinput.key',
        message: `Country code (${countryCode}) does not match libaddressinput key (${key})`,
      });
    }
  }

  // Check postal code pattern validity
  if (hasField(data, 'libaddressinput.postal_code_pattern')) {
    const pattern = data.libaddressinput.postal_code_pattern;
    try {
      new RegExp(pattern);
    } catch (error) {
      issues.push({
        type: 'invalid_regex',
        severity: SEVERITY.WARNING,
        field: 'libaddressinput.postal_code_pattern',
        value: pattern,
        message: `Invalid postal code regex: ${error.message}`,
      });
    }
  }

  // Check sub_keys and sub_names array length match
  if (
    hasField(data, 'libaddressinput.sub_keys') &&
    hasField(data, 'libaddressinput.sub_names')
  ) {
    const keysLen = data.libaddressinput.sub_keys.length;
    const namesLen = data.libaddressinput.sub_names.length;

    if (keysLen !== namesLen) {
      issues.push({
        type: 'array_length_mismatch',
        severity: SEVERITY.WARNING,
        field: 'sub_keys vs sub_names',
        message: `sub_keys length (${keysLen}) does not match sub_names length (${namesLen})`,
      });
    }
  }

  return issues;
}

/**
 * Detect anomalies in data
 * @param {Object} data - Data to check
 * @returns {Array} Array of anomalies
 */
function detectAnomalies(data) {
  const anomalies = [];

  // Check for suspiciously long strings
  if (hasField(data, 'libaddressinput.name')) {
    const name = data.libaddressinput.name;
    if (name.length > 100) {
      anomalies.push({
        type: 'suspicious_length',
        severity: SEVERITY.INFO,
        field: 'libaddressinput.name',
        value: name,
        message: `Country name is suspiciously long (${name.length} chars)`,
      });
    }
  }

  // Check for empty arrays where data is expected
  if (hasField(data, 'libaddressinput.sub_keys')) {
    const subKeys = data.libaddressinput.sub_keys;
    if (Array.isArray(subKeys) && subKeys.length === 0) {
      anomalies.push({
        type: 'empty_array',
        severity: SEVERITY.INFO,
        field: 'libaddressinput.sub_keys',
        message: 'sub_keys array is empty (country may not have subdivisions)',
      });
    }
  }

  // Check for metadata freshness
  if (hasField(data, 'metadata.fetched_at')) {
    const fetchedAt = new Date(data.metadata.fetched_at);
    const now = new Date();
    const daysDiff = (now - fetchedAt) / (1000 * 60 * 60 * 24);

    if (daysDiff > 90) {
      anomalies.push({
        type: 'stale_data',
        severity: SEVERITY.INFO,
        field: 'metadata.fetched_at',
        value: data.metadata.fetched_at,
        message: `Data is ${Math.floor(daysDiff)} days old`,
      });
    }
  }

  return anomalies;
}

/**
 * Calculate data quality score (0-100)
 * @param {Object} qualityReport - Quality report from checkDataQuality
 * @returns {number} Quality score
 */
function calculateQualityScore(qualityReport) {
  const { issues, suggestions, anomalies } = qualityReport;

  // Start with perfect score
  let score = 100;

  // Deduct points for issues
  const criticalCount = issues.filter((i) => i.severity === SEVERITY.CRITICAL).length;
  const warningCount = issues.filter((i) => i.severity === SEVERITY.WARNING).length;

  score -= criticalCount * 30; // -30 per critical issue
  score -= warningCount * 10; // -10 per warning

  // Deduct points for missing recommended fields
  score -= suggestions.length * 2; // -2 per missing recommended field

  // Deduct points for anomalies
  score -= anomalies.length * 1; // -1 per anomaly

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Comprehensive data quality check
 * @param {Object} data - Data to check
 * @param {Object} options - Check options
 * @returns {Object} Quality report
 */
function checkDataQuality(data, options = {}) {
  const {
    countryCode = data?.country_code || 'UNKNOWN',
    includeRecommendations = true,
    includeAnomalies = true,
  } = options;

  logger.debug(`Checking data quality for ${countryCode}`);

  // Perform all checks
  const issues = checkRequiredFields(data);
  const consistencyIssues = checkConsistency(data);
  const suggestions = includeRecommendations ? checkRecommendedFields(data) : [];
  const anomalies = includeAnomalies ? detectAnomalies(data) : [];

  // Combine all issues
  const allIssues = [...issues, ...consistencyIssues];

  // Calculate quality score
  const qualityReport = {
    countryCode,
    issues: allIssues,
    suggestions,
    anomalies,
    summary: {
      critical: allIssues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
      warnings: allIssues.filter((i) => i.severity === SEVERITY.WARNING).length,
      info: suggestions.length + anomalies.length,
      total: allIssues.length + suggestions.length + anomalies.length,
    },
  };

  qualityReport.score = calculateQualityScore(qualityReport);
  qualityReport.passed = qualityReport.summary.critical === 0;

  return qualityReport;
}

/**
 * Generate quality report string
 * @param {Object} qualityReport - Quality report
 * @returns {string} Formatted report
 */
function generateQualityReport(qualityReport) {
  const { countryCode, issues, suggestions, anomalies, summary, score, passed } =
    qualityReport;

  const lines = [];
  lines.push(`\nData Quality Report for ${countryCode}`);
  lines.push('='.repeat(50));
  lines.push(`Quality Score: ${score}/100 ${passed ? '✓ PASSED' : '✗ FAILED'}`);
  lines.push('\nSummary:');
  lines.push(`  Critical Issues: ${summary.critical}`);
  lines.push(`  Warnings: ${summary.warnings}`);
  lines.push(`  Suggestions: ${suggestions.length}`);
  lines.push(`  Anomalies: ${anomalies.length}`);

  if (issues.length > 0) {
    lines.push('\nIssues:');
    issues.forEach((issue, i) => {
      lines.push(`  ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
    });
  }

  if (suggestions.length > 0 && suggestions.length <= 5) {
    lines.push('\nSuggestions:');
    suggestions.slice(0, 5).forEach((sug, i) => {
      lines.push(`  ${i + 1}. ${sug.message}`);
    });
  }

  if (anomalies.length > 0 && anomalies.length <= 3) {
    lines.push('\nAnomalies:');
    anomalies.slice(0, 3).forEach((anom, i) => {
      lines.push(`  ${i + 1}. ${anom.message}`);
    });
  }

  return lines.join('\n');
}

module.exports = {
  SEVERITY,
  REQUIRED_FIELDS,
  RECOMMENDED_FIELDS,
  checkDataQuality,
  checkRequiredFields,
  checkRecommendedFields,
  checkConsistency,
  detectAnomalies,
  calculateQualityScore,
  generateQualityReport,
  hasField,
};
