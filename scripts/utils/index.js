/**
 * Utilities for scripts
 * Central export point for all utility modules
 */

const logger = require('./logger');
const http = require('./http');
const file = require('./file');
const yaml = require('./yaml');
const constants = require('./constants');
const validation = require('./validation');
const dataLoader = require('./data-loader');
const dataMerge = require('./data-merge');
const dataQuality = require('./data-quality');

module.exports = {
  // Logger
  ...logger,

  // HTTP utilities
  ...http,

  // File utilities
  ...file,

  // YAML utilities
  ...yaml,

  // Constants
  ...constants,

  // Validation
  ...validation,

  // Data loader
  ...dataLoader,

  // Data merge utilities
  ...dataMerge,

  // Data quality checker
  ...dataQuality,
};
