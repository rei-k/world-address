/**
 * File system utilities for reading and writing data
 */

const fs = require('fs');
const path = require('path');

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write JSON file with formatting
 * @param {string} filePath - File path
 * @param {Object} data - Data to write
 * @param {Object} options - Options
 * @param {number} options.indent - Indentation spaces (default: 2)
 */
function writeJSON(filePath, data, options = {}) {
  const { indent = 2 } = options;
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, JSON.stringify(data, null, indent) + '\n', 'utf8');
}

/**
 * Read JSON file
 * @param {string} filePath - File path
 * @returns {Object} Parsed JSON data
 */
function readJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Write text file
 * @param {string} filePath - File path
 * @param {string} content - Content to write
 */
function writeText(filePath, content) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Read text file
 * @param {string} filePath - File path
 * @returns {string} File content
 */
function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Check if file exists
 * @param {string} filePath - File path
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Get file stats
 * @param {string} filePath - File path
 * @returns {fs.Stats|null} File stats or null if not found
 */
function getFileStats(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (error) {
    return null;
  }
}

/**
 * List files in directory
 * @param {string} dirPath - Directory path
 * @param {Object} options - Options
 * @param {boolean} options.recursive - List recursively
 * @param {RegExp} options.filter - Filter by regex pattern
 * @returns {string[]} Array of file paths
 */
function listFiles(dirPath, options = {}) {
  const { recursive = false, filter = null } = options;
  
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = [];
  
  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        if (recursive) {
          traverse(fullPath);
        }
      } else if (stats.isFile()) {
        if (!filter || filter.test(fullPath)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dirPath);
  return files;
}

/**
 * Safe file write with atomic operation
 * @param {string} filePath - File path
 * @param {string} content - Content to write
 */
function safeWriteFile(filePath, content) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, content, 'utf8');
  fs.renameSync(tmpPath, filePath);
}

/**
 * Copy file
 * @param {string} source - Source path
 * @param {string} destination - Destination path
 */
function copyFile(source, destination) {
  const dir = path.dirname(destination);
  ensureDir(dir);
  fs.copyFileSync(source, destination);
}

module.exports = {
  ensureDir,
  writeJSON,
  readJSON,
  writeText,
  readText,
  fileExists,
  getFileStats,
  listFiles,
  safeWriteFile,
  copyFile,
};
