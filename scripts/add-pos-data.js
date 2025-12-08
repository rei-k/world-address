#!/usr/bin/env node

/**
 * Script to add POS (Point of Sale) data to all country YAML files
 *
 * This script adds the 'pos' section to country YAML files that don't have it yet.
 * The data includes currency, tax, receipt requirements, fiscal regulations, and locale information.
 *
 * REFACTORED: Data is now loaded from external JSON files for better maintainability.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { loadCurrencyData, loadTimezoneData } = require('./utils/data-loader');

// Load currency and timezone data from external files
// This makes the script cleaner and data easier to maintain
const CURRENCY_DATA = loadCurrencyData();
const TIMEZONE_DATA = loadTimezoneData();

/**
 * Get default POS data template for a country
 */
function getDefaultPOSData(countryCode) {
  const currency = CURRENCY_DATA[countryCode];
  const timezone = TIMEZONE_DATA[countryCode];

  if (!currency) {
    console.warn(`Warning: No currency data found for ${countryCode}`);
    return null;
  }

  // Default tax configuration (simplified - countries have varying tax systems)
  const taxType = [
    'AT',
    'BE',
    'BG',
    'HR',
    'CY',
    'CZ',
    'DK',
    'EE',
    'FI',
    'FR',
    'DE',
    'GR',
    'HU',
    'IE',
    'IT',
    'LV',
    'LT',
    'LU',
    'MT',
    'NL',
    'PL',
    'PT',
    'RO',
    'SK',
    'SI',
    'ES',
    'SE',
    'GB',
  ].includes(countryCode)
    ? 'VAT'
    : ['AU', 'NZ', 'SG', 'IN', 'MY', 'CA'].includes(countryCode)
      ? 'GST'
      : ['US'].includes(countryCode)
        ? 'Sales Tax'
        : 'VAT';

  // Standard tax rate (default 0 - should be updated with actual rates)
  const standardRate = null;

  return {
    currency: {
      code: currency.code,
      symbol: currency.symbol,
      symbol_position: 'before',
      decimal_places: currency.decimal_places,
      decimal_separator: '.',
      thousands_separator: ',',
    },
    tax: {
      type: taxType,
      rate: {
        standard: standardRate,
      },
      included_in_price: true,
      invoice_requirement: 'optional',
    },
    receipt: {
      required_fields: ['business_name', 'date', 'items', 'total'],
      paper_width: '80mm',
      electronic_allowed: true,
      retention_period: '5 years',
    },
    fiscal: {
      fiscal_device_required: false,
      registration_required: false,
      reporting_frequency: 'varies',
    },
    payment_methods: [
      {
        type: 'cash',
        name: 'Cash',
        prevalence: 'high',
      },
      {
        type: 'credit_card',
        name: 'Credit Card',
        prevalence: 'high',
      },
    ],
    locale: {
      date_format: 'YYYY-MM-DD',
      time_format: '24h',
      timezone: timezone || 'UTC',
      first_day_of_week: 'monday',
    },
  };
}

/**
 * Get parent country code for regions and territories
 */
function getParentCountryCode(data, filePath) {
  // Check for parent_country field
  if (data.parent_country) {
    if (typeof data.parent_country === 'string') {
      return data.parent_country;
    }
    if (data.parent_country.alpha2) {
      return data.parent_country.alpha2;
    }
  }

  // Check for region_of field
  if (data.region_of) {
    // Map region names to country codes
    const regionMap = {
      Spain: 'ES',
      Portugal: 'PT',
      Indonesia: 'ID',
      India: 'IN',
      Chile: 'CL',
    };
    return regionMap[data.region_of];
  }

  // Check file path for parent country
  const pathParts = filePath.split(path.sep);
  const parentDir = pathParts[pathParts.length - 3];

  // If parent directory is a 2-letter code, use it
  if (parentDir && parentDir.length === 2 && parentDir === parentDir.toUpperCase()) {
    return parentDir;
  }

  return null;
}

/**
 * Add POS data to a country YAML file
 */
function addPOSToCountry(filePath) {
  try {
    // Skip metadata and schema files
    const fileName = path.basename(filePath);
    if (fileName === 'meta.yaml' || fileName === 'schema.yaml') {
      console.log(`⊘ Skipping ${fileName} (metadata/schema file)`);
      return false;
    }

    // Read the YAML file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContent);

    // Skip if POS data already exists
    if (data.pos) {
      console.log(`✓ ${path.basename(filePath, '.yaml')} already has POS data`);
      return false;
    }

    // Get country code from file name or parent country
    let countryCode = path.basename(filePath, '.yaml');

    // For disputed territories in subregions, use Georgia's currency for Caucasus regions
    if (filePath.includes('/subregions/')) {
      if (countryCode === 'AB' || countryCode === 'SO') {
        // Caucasus disputed territories use Russian Ruble
        countryCode = 'RU';
        console.log(
          `  Using Russia (RU) for disputed territory ${path.basename(filePath, '.yaml')}`,
        );
      }
    } else if (
      data.parent_country ||
      data.region_of ||
      filePath.includes('/regions/') ||
      filePath.includes('/overseas/')
    ) {
      // For special regions, try to get parent country code
      const parentCode = getParentCountryCode(data, filePath);
      if (parentCode) {
        console.log(`  Using parent country ${parentCode} for region ${countryCode}`);
        countryCode = parentCode;
      }
    }

    // For Antarctica stations and claims, use USD as default
    if (filePath.includes('/antarctica/')) {
      if (filePath.includes('/stations/')) {
        // Get operating country if available
        if (data.operating_country && data.operating_country.alpha2) {
          countryCode = data.operating_country.alpha2;
        } else {
          // Default to USD for stations
          countryCode = 'AQ';
        }
      } else if (filePath.includes('/claims/')) {
        // For claims, use the claim holder's currency
        const claimMap = {
          AR_CLAIM: 'AR',
          AT: 'AU',
          BAT: 'GB',
          CL_CLAIM: 'CL',
          FR_ADELIE: 'FR',
          NO_PB: 'NO',
          NO_QML: 'NO',
          NZ_ROSS: 'NZ',
          UNCLAIMED: 'AQ',
        };
        countryCode = claimMap[countryCode] || 'AQ';
      }
    }

    // Get default POS data
    const posData = getDefaultPOSData(countryCode);

    if (!posData) {
      console.log(
        `✗ Skipping ${path.basename(filePath, '.yaml')} - no currency data available for ${countryCode}`,
      );
      return false;
    }

    // Add POS data to the country data
    data.pos = posData;

    // Write back to file
    const yamlContent = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    fs.writeFileSync(filePath, yamlContent, 'utf8');
    console.log(`✓ Added POS data to ${path.basename(filePath, '.yaml')}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively find all YAML files in a directory
 */
function findYAMLFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip certain directories
      if (
        !['libaddressinput', 'cloud-address-book', 'pos', 'node_modules', '.git'].includes(file)
      ) {
        findYAMLFiles(filePath, fileList);
      }
    } else if (file.endsWith('.yaml')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Main execution
 */
function main() {
  const dataDir = path.join(__dirname, '..', 'data');

  console.log('🏪 Adding POS data to all countries...\n');

  // Find all YAML files
  const yamlFiles = findYAMLFiles(dataDir);
  console.log(`Found ${yamlFiles.length} YAML files\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  // Process each file
  yamlFiles.forEach((file) => {
    if (addPOSToCountry(file)) {
      updatedCount++;
    } else {
      skippedCount++;
    }
  });

  console.log('\n✅ Processing complete!');
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Total:   ${yamlFiles.length}`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { getDefaultPOSData, addPOSToCountry };
