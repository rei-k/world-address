#!/usr/bin/env node

/**
 * YAML Validation Script
 *
 * Validates all YAML files in the data directory for:
 * - Valid YAML syntax
 * - Required fields presence
 * - Data structure integrity
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Required fields for country YAML files
const REQUIRED_FIELDS = ['name.en', 'iso_codes.alpha2'];

// Optional but recommended fields
const RECOMMENDED_FIELDS = ['iso_codes.alpha3', 'iso_codes.numeric', 'continent', 'languages'];

let totalFiles = 0;
let validFiles = 0;
let errorFiles = 0;
const errors = [];

/**
 * Check if a nested field exists in an object
 */
function hasNestedField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;

  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object' ||
      !(part in current)
    ) {
      return false;
    }
    current = current[part];
  }

  return true;
}

/**
 * Validate a single YAML file
 */
function validateYamlFile(filePath) {
  totalFiles++;

  try {
    // Read and parse YAML
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);

    if (!data || typeof data !== 'object') {
      errors.push({
        file: filePath,
        type: 'PARSE_ERROR',
        message: 'Invalid YAML structure: not an object',
      });
      errorFiles++;
      return false;
    }

    // Skip validation for special files (meta.yaml, schema.yaml)
    const fileName = path.basename(filePath);
    if (fileName === 'meta.yaml' || fileName === 'schema.yaml') {
      validFiles++;
      return true;
    }

    // For regions, overseas territories, claims, stations, subregions, and disputed territories, only require name.en
    const isSpecialRegion =
      filePath.includes('/regions/') ||
      filePath.includes('/overseas/') ||
      filePath.includes('/claims/') ||
      filePath.includes('/stations/') ||
      filePath.includes('/subregions/') ||
      filePath.includes('/disputed/');

    const requiredForThisFile = isSpecialRegion ? ['name.en'] : REQUIRED_FIELDS;

    // Check required fields
    const missingFields = [];
    for (const field of requiredForThisFile) {
      if (!hasNestedField(data, field)) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      errors.push({
        file: filePath,
        type: 'MISSING_FIELDS',
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
      errorFiles++;
      return false;
    }

    // Check recommended fields (warnings only) - only for regular countries
    if (!isSpecialRegion) {
      const missingRecommended = [];
      for (const field of RECOMMENDED_FIELDS) {
        if (!hasNestedField(data, field)) {
          missingRecommended.push(field);
        }
      }

      if (missingRecommended.length > 0) {
        errors.push({
          file: filePath,
          type: 'WARNING',
          message: `Missing recommended fields: ${missingRecommended.join(', ')}`,
        });
      }
    }

    validFiles++;
    return true;
  } catch (error) {
    errors.push({
      file: filePath,
      type: 'PARSE_ERROR',
      message: error.message,
    });
    errorFiles++;
    return false;
  }
}

/**
 * Recursively find all YAML files in a directory
 */
function findYamlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip libaddressinput directory
      if (file !== 'libaddressinput') {
        findYamlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Starting YAML validation...\n');

  const dataDir = path.join(__dirname, '..', 'data');

  if (!fs.existsSync(dataDir)) {
    console.error('❌ Error: data directory not found');
    process.exit(1);
  }

  const yamlFiles = findYamlFiles(dataDir);
  console.log(`Found ${yamlFiles.length} YAML files\n`);

  // Validate each file
  for (const file of yamlFiles) {
    validateYamlFile(file);
  }

  // Print results
  console.log('\n📊 Validation Results:');
  console.log('─'.repeat(50));
  console.log(`Total files:     ${totalFiles}`);
  console.log(`✅ Valid files:   ${validFiles}`);
  console.log(`❌ Error files:   ${errorFiles}`);
  console.log('─'.repeat(50));

  // Print errors
  if (errors.length > 0) {
    console.log('\n📋 Issues Found:\n');

    // Group by type
    const errorsByType = {
      PARSE_ERROR: [],
      MISSING_FIELDS: [],
      WARNING: [],
    };

    for (const error of errors) {
      if (errorsByType[error.type]) {
        errorsByType[error.type].push(error);
      }
    }

    // Print parse errors
    if (errorsByType.PARSE_ERROR.length > 0) {
      console.log('❌ Parse Errors:');
      for (const error of errorsByType.PARSE_ERROR) {
        const relativePath = path.relative(process.cwd(), error.file);
        console.log(`  - ${relativePath}`);
        console.log(`    ${error.message}`);
      }
      console.log();
    }

    // Print missing fields
    if (errorsByType.MISSING_FIELDS.length > 0) {
      console.log('❌ Missing Required Fields:');
      for (const error of errorsByType.MISSING_FIELDS) {
        const relativePath = path.relative(process.cwd(), error.file);
        console.log(`  - ${relativePath}`);
        console.log(`    ${error.message}`);
      }
      console.log();
    }

    // Print warnings
    if (errorsByType.WARNING.length > 0) {
      console.log('⚠️  Warnings:');
      for (const error of errorsByType.WARNING) {
        const relativePath = path.relative(process.cwd(), error.file);
        console.log(`  - ${relativePath}`);
        console.log(`    ${error.message}`);
      }
      console.log();
    }
  }

  // Exit with error code if there are errors
  if (errorFiles > 0) {
    console.log('\n❌ Validation failed with errors');
    process.exit(1);
  } else {
    console.log('\n✅ All files validated successfully!');
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { validateYamlFile, findYamlFiles };
