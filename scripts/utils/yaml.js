/**
 * YAML conversion utilities
 */

/**
 * Convert JSON object to YAML format
 * @param {Object} obj - JSON object to convert
 * @param {number} indent - Current indentation level
 * @returns {string} YAML string
 */
function jsonToYaml(obj, indent = 0) {
  const indentStr = '  '.repeat(indent);
  let yaml = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      yaml += `${indentStr}${key}: null\n`;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      yaml += `${indentStr}${key}:\n`;
      yaml += jsonToYaml(value, indent + 1);
    } else if (Array.isArray(value)) {
      yaml += `${indentStr}${key}:\n`;
      value.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          yaml += `${indentStr}  -\n`;
          yaml += jsonToYaml(item, indent + 2);
        } else {
          yaml += `${indentStr}  - ${formatYamlValue(item)}\n`;
        }
      });
    } else if (typeof value === 'string') {
      yaml += `${indentStr}${key}: ${formatYamlValue(value)}\n`;
    } else {
      yaml += `${indentStr}${key}: ${value}\n`;
    }
  }

  return yaml;
}

/**
 * Format a value for YAML, handling special characters
 * @param {string} value - Value to format
 * @returns {string} Formatted value
 */
function formatYamlValue(value) {
  if (typeof value !== 'string') {
    return value;
  }

  // Check for characters that require quoting in YAML
  const needsQuoting =
    /[:\n#[\]{}&*!|>'"%@`]/.test(value) || value.trim() !== value || /^[-?]/.test(value);

  if (needsQuoting) {
    // Escape backslashes first, then quotes to avoid double-escaping
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}"`;
  }

  return value;
}

/**
 * Convert YAML string to JSON object
 * Note: This is a basic implementation. For production use, consider using a library like js-yaml
 * @param {string} _yaml - YAML string (unused - use js-yaml library instead)
 * @returns {Object} Parsed object
 */
function yamlToJson(_yaml) {
  // This is a placeholder for a basic YAML parser
  // In a real implementation, you would use a library like js-yaml
  throw new Error('YAML to JSON conversion requires js-yaml library');
}

module.exports = {
  jsonToYaml,
  formatYamlValue,
  yamlToJson,
};
