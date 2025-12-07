// Address validator module
const AddressValidator = {
  /**
   * Validates an address against a country format
   * @param {Object} address - Address object to validate
   * @param {Object} format - Country format configuration
   * @returns {Object} Validation result with valid flag, errors array, and normalized address
   */
  validate(address, format) {
    const errors = [];

    // Validate required fields
    Object.keys(format.address_format).forEach((field) => {
      const fieldConfig = format.address_format[field];
      if (fieldConfig.required && !address[field]) {
        errors.push({
          field,
          message: `${this.getFieldLabel(field, format)} is required`,
        });
      }
    });

    // Validate postal code format
    if (address.postal_code && format.address_format.postal_code?.regex) {
      const regex = new RegExp(format.address_format.postal_code.regex);
      if (!regex.test(address.postal_code)) {
        errors.push({
          field: 'postal_code',
          message: `Invalid postal code format. Expected format: ${format.address_format.postal_code.example}`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      normalized: errors.length === 0 ? address : null,
    };
  },

  /**
   * Gets a human-readable label for a field
   * @param {string} field - Field name
   * @param {Object} format - Country format configuration
   * @returns {string} Field label
   */
  getFieldLabel(field, format) {
    if (field === 'province') {
      const type = format?.address_format?.province?.type;
      return type || 'Province';
    }
    return field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
  },

  /**
   * Checks if a field is required
   * @param {string} field - Field name
   * @param {Object} format - Country format configuration
   * @returns {boolean} True if field is required
   */
  isFieldRequired(field, format) {
    return format?.address_format?.[field]?.required || false;
  },

  /**
   * Gets the postal code example for a country
   * @param {Object} format - Country format configuration
   * @returns {string} Postal code example
   */
  getPostalCodeExample(format) {
    return format?.address_format?.postal_code?.example || '';
  },

  /**
   * Formats an address for display
   * @param {Object} address - Normalized address object
   * @returns {string} Formatted address string
   */
  formatAddress(address) {
    const parts = [];

    if (address.street_address) parts.push(address.street_address);
    if (address.city) parts.push(address.city);
    if (address.province) parts.push(address.province);
    if (address.postal_code) parts.push(address.postal_code);
    if (address.country) parts.push(address.country);

    return parts.join('\n');
  },
};
