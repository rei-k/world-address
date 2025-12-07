#!/usr/bin/env node

/**
 * Territory Analysis Script
 *
 * This script analyzes territories in the world address database and provides
 * multiple classification modes:
 * 1. Simple classification by file path (countries, autonomous, overseas, antarctica)
 * 2. Detailed analysis based on currency, tax, postal systems (effectively independent)
 * 3. Combined report with all information
 *
 * Consolidated from classify_territories.js and identify-special-territories.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const dataDir = path.join(__dirname, '..', 'data');
const MIN_INDEPENDENCE_SCORE = 4;
const SAR_CODES = ['HK', 'MO'];

/**
 * Recursively find all YAML files
 */
function findYAMLFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['libaddressinput', 'cloud-address-book', 'node_modules', '.git'].includes(file)) {
        findYAMLFiles(filePath, fileList);
      }
    } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Analyze a territory to determine autonomy indicators
 */
function analyzeTerritory(data) {
  const indicators = {
    hasOwnCurrency: false,
    hasOwnTaxSystem: false,
    hasOwnPostalSystem: false,
    hasOwnISO: false,
    isNotUNMember: false,
    hasSpecialStatus: false,
    hasOwnTimezone: false,
    currencyCode: null,
    taxType: null,
    status: null,
    isoCode: null,
    postalCodePattern: null,
  };

  if (data.iso_codes?.alpha2) {
    indicators.hasOwnISO = true;
    indicators.isoCode = data.iso_codes.alpha2;
  }

  if (data.pos?.currency?.code) {
    indicators.hasOwnCurrency = true;
    indicators.currencyCode = data.pos.currency.code;
  }

  if (data.pos?.tax?.type) {
    indicators.hasOwnTaxSystem = true;
    indicators.taxType = data.pos.tax.type;
  }

  if (data.address_format?.postal_code) {
    const postalCode = data.address_format.postal_code;
    if (postalCode.regex || postalCode.example) {
      indicators.hasOwnPostalSystem = true;
      indicators.postalCodePattern = postalCode.regex || postalCode.example;
    }
  }

  if (data.status) {
    indicators.status = data.status;
    if (data.status.un_member === false) {
      indicators.isNotUNMember = true;
    }
    if (data.status.recognized || data.status.disputed !== undefined) {
      indicators.hasSpecialStatus = true;
    }
  }

  if (data.pos?.locale?.timezone) {
    indicators.hasOwnTimezone = true;
  }

  return indicators;
}

/**
 * Calculate independence score
 */
function calculateIndependenceScore(indicators) {
  let score = 0;
  if (indicators.hasOwnCurrency) {
    score++;
  }
  if (indicators.hasOwnISO) {
    score++;
  }
  if (indicators.hasOwnPostalSystem) {
    score++;
  }
  if (indicators.hasOwnTaxSystem) {
    score++;
  }
  if (indicators.hasOwnTimezone) {
    score++;
  }
  if (indicators.isNotUNMember) {
    score++;
  }
  return score;
}

/**
 * Main analysis function
 */
function analyzeAll() {
  const yamlFiles = findYAMLFiles(dataDir);

  // Simple classification
  const simpleCategories = {
    countries: [],
    autonomous_territories: [],
    overseas_territories: [],
    antarctica: [],
  };

  // Detailed classification
  const effectivelyIndependent = [];
  const specialAdministrative = [];
  const specialCustoms = [];

  yamlFiles.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      if (!data || !data.iso_codes?.alpha2) {
        return;
      }

      const code = data.iso_codes.alpha2;
      const name = data.name?.en || 'Unknown';
      const indicators = analyzeTerritory(data);
      const score = calculateIndependenceScore(indicators);

      // Simple path-based classification
      const isOverseas = filePath.includes('/overseas/');
      const isRegion = filePath.includes('/regions/');
      const isAntarctica = filePath.includes('/antarctica/');

      const item = { code, name, path: filePath, score, indicators };

      if (isAntarctica) {
        simpleCategories.antarctica.push(item);
      } else if (isOverseas) {
        simpleCategories.overseas_territories.push(item);
      } else if (isRegion) {
        simpleCategories.autonomous_territories.push(item);
      } else {
        simpleCategories.countries.push(item);
      }

      // Detailed classification
      if (score >= MIN_INDEPENDENCE_SCORE) {
        effectivelyIndependent.push(item);
      }

      if (SAR_CODES.includes(code) && indicators.hasOwnCurrency) {
        specialAdministrative.push(item);
      }

      if (
        indicators.hasOwnPostalSystem &&
        (indicators.hasOwnCurrency || indicators.hasOwnTaxSystem)
      ) {
        specialCustoms.push(item);
      }
    } catch (error) {
      // Skip invalid files
    }
  });

  return {
    simpleCategories,
    effectivelyIndependent,
    specialAdministrative,
    specialCustoms,
    totalFiles: yamlFiles.length,
  };
}

/**
 * Print simple classification report
 */
function printSimpleReport(results) {
  const { simpleCategories } = results;

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║     Simple Territory Classification Report      ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  console.log('📊 Summary:');
  console.log(`   Countries (主権国家): ${simpleCategories.countries.length}`);
  console.log(
    `   Autonomous Territories (自治領): ${simpleCategories.autonomous_territories.length}`
  );
  console.log(`   Overseas Territories (海外領): ${simpleCategories.overseas_territories.length}`);
  console.log(`   Antarctica (南極): ${simpleCategories.antarctica.length}`);
  console.log(`   Total: ${results.totalFiles} files\n`);

  console.log('📝 Details:\n');

  console.log('Countries (主権国家):');
  simpleCategories.countries.forEach((c) => console.log(`  ${c.code} - ${c.name}`));

  console.log('\nAutonomous Territories (自治領):');
  simpleCategories.autonomous_territories.forEach((c) => console.log(`  ${c.code} - ${c.name}`));

  console.log('\nOverseas Territories (海外領):');
  simpleCategories.overseas_territories.forEach((c) => console.log(`  ${c.code} - ${c.name}`));

  console.log('\nAntarctica (南極):');
  simpleCategories.antarctica.forEach((c) => console.log(`  ${c.code} - ${c.name}`));
}

/**
 * Print detailed report
 */
function printDetailedReport(results) {
  const { effectivelyIndependent, specialAdministrative, specialCustoms } = results;

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║     Detailed Territory Analysis Report          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  console.log(`📊 Effectively Independent Territories (score >= ${MIN_INDEPENDENCE_SCORE}):`);
  console.log(`   Found: ${effectivelyIndependent.length}\n`);
  effectivelyIndependent
    .sort((a, b) => b.score - a.score)
    .forEach((t) => {
      console.log(`   ${t.code} - ${t.name} (score: ${t.score}/6)`);
      console.log(`      Currency: ${t.indicators.currencyCode || 'N/A'}`);
      console.log(`      Tax System: ${t.indicators.taxType || 'N/A'}`);
      console.log(`      Postal: ${t.indicators.hasOwnPostalSystem ? 'Yes' : 'No'}`);
      console.log(`      UN Member: ${!t.indicators.isNotUNMember ? 'Yes' : 'No'}\n`);
    });

  console.log('\n📊 Special Administrative Regions (SAR):');
  console.log(`   Found: ${specialAdministrative.length}\n`);
  specialAdministrative.forEach((t) => {
    console.log(`   ${t.code} - ${t.name}`);
    console.log(`      Currency: ${t.indicators.currencyCode}\n`);
  });

  console.log('\n📊 Special Customs Territories:');
  console.log(`   Found: ${specialCustoms.length}\n`);
  specialCustoms.forEach((t) => {
    console.log(`   ${t.code} - ${t.name}`);
    console.log(`      Currency: ${t.indicators.currencyCode || 'N/A'}`);
    console.log(`      Tax: ${t.indicators.taxType || 'N/A'}\n`);
  });
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'simple';

  const results = analyzeAll();

  if (mode === 'simple') {
    printSimpleReport(results);
  } else if (mode === 'detailed') {
    printDetailedReport(results);
  } else if (mode === 'all') {
    printSimpleReport(results);
    printDetailedReport(results);
  } else {
    console.log('Usage: node analyze-territories.js [simple|detailed|all]');
    console.log('  simple   - Simple path-based classification (default)');
    console.log('  detailed - Detailed analysis based on autonomy indicators');
    console.log('  all      - Both simple and detailed reports');
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeAll, analyzeTerritory, calculateIndependenceScore };
