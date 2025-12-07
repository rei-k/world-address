#!/usr/bin/env node

/**
 * Script to add geo-coordinates to all country YAML files
 *
 * This script adds the 'geo' section to country YAML files that don't have it yet.
 * The coordinates are approximate country centers based on geographic data.
 *
 * REFACTORED: Data is now loaded from external JSON files for better maintainability.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { loadCountryCoordinates, loadSpecialRegionCoordinates } = require('./utils/data-loader');

// Load coordinate data from external files
const COUNTRY_COORDINATES = loadCountryCoordinates();
const SPECIAL_REGION_COORDINATES = loadSpecialRegionCoordinates();

/**
 * Recursively find all YAML files
 */
function findYamlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip these directories
      if (!['libaddressinput', 'cloud-address-book', 'node_modules', '.git'].includes(file)) {
        findYamlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Main function to add geo coordinates to YAML files
 */
function addGeoCoordinates() {
  const dataDir = path.join(__dirname, '..', 'data');
  const yamlFiles = findYamlFiles(dataDir);

  let updatedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  console.log('🌍 Adding geo-coordinates to country YAML files...');
  console.log(`📍 Processing ${yamlFiles.length} YAML files...`);
  console.log('');

  yamlFiles.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      // Skip if geo section already exists
      if (data.geo) {
        skippedCount++;
        return;
      }

      // Skip meta and schema files
      const fileName = path.basename(filePath, '.yaml');
      if (fileName === 'meta' || fileName === 'schema') {
        skippedCount++;
        return;
      }

      // Get country code or identifier
      let countryCode = data.iso_codes?.alpha2;
      let coords;

      // Check if it's a special region code (contains hyphen or slash)
      if (countryCode && (countryCode.includes('-') || countryCode.includes('/'))) {
        coords = SPECIAL_REGION_COORDINATES[countryCode];
        if (!coords) {
          console.log(
            `⚠️  No coordinates found for special region code: ${countryCode} (${filePath})`
          );
          notFoundCount++;
          return;
        }
      } else if (countryCode) {
        // Regular country code
        coords = COUNTRY_COORDINATES[countryCode];
        if (!coords) {
          console.log(`⚠️  No coordinates found for country code: ${countryCode} (${filePath})`);
          notFoundCount++;
          return;
        }
      } else {
        // No country code, try special region identifier by filename
        const fileName = path.basename(filePath, '.yaml');
        coords = SPECIAL_REGION_COORDINATES[fileName];

        if (!coords) {
          console.log(`⚠️  No coordinates found for special region: ${fileName} (${filePath})`);
          notFoundCount++;
          return;
        }

        countryCode = fileName;
      }

      // Validate coordinates have required properties
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lon !== 'number') {
        console.log(`⚠️  Invalid coordinates for: ${countryCode} (${filePath})`);
        notFoundCount++;
        return;
      }

      // Add geo section
      data.geo = {
        center: {
          latitude: coords.lat,
          longitude: coords.lon,
          accuracy: 1000,
        },
      };

      // Write the updated YAML
      const yamlContent = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
      });

      fs.writeFileSync(filePath, yamlContent, 'utf8');
      console.log(`✅ Added geo to: ${countryCode} (${coords.name || 'Unknown'})`);
      updatedCount++;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });

  console.log('');
  console.log('📊 Summary:');
  console.log(`   ✅ Updated: ${updatedCount} files`);
  console.log(`   ⏭️  Skipped (already has geo): ${skippedCount} files`);
  console.log(`   ⚠️  Not found in database: ${notFoundCount} files`);
  console.log(`   📁 Total processed: ${yamlFiles.length} files`);
}

// Run the script
if (require.main === module) {
  addGeoCoordinates();
}

module.exports = { addGeoCoordinates };
