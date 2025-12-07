#!/usr/bin/env node

/**
 * Identify Effectively Independent Territories and Special Customs Territories
 *
 * This script analyzes the world address database to identify:
 * 1. Territories that appear to be effectively independent (separate currency, customs, etc.)
 * 2. Special customs/tariff territories with distinct economic zones
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const dataDir = path.join(__dirname, '..', 'data');

/**
 * Recursively find all YAML files
 */
function findYAMLFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'libaddressinput' && file !== 'cloud-address-book') {
        findYAMLFiles(filePath, fileList);
      }
    } else if (file.endsWith('.yaml')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Analyze a territory to determine if it's a special customs territory
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

  // Check for own ISO code
  if (data.iso_codes && data.iso_codes.alpha2) {
    indicators.hasOwnISO = true;
    indicators.isoCode = data.iso_codes.alpha2;
  }

  // Check for own currency
  if (data.pos && data.pos.currency && data.pos.currency.code) {
    indicators.hasOwnCurrency = true;
    indicators.currencyCode = data.pos.currency.code;
  }

  // Check for own tax system
  if (data.pos && data.pos.tax && data.pos.tax.type) {
    indicators.hasOwnTaxSystem = true;
    indicators.taxType = data.pos.tax.type;
  }

  // Check for own postal system
  if (data.address_format && data.address_format.postal_code) {
    const postalCode = data.address_format.postal_code;
    if (postalCode.regex || postalCode.example) {
      indicators.hasOwnPostalSystem = true;
      indicators.postalCodePattern = postalCode.regex || postalCode.example;
    }
  }

  // Check UN membership status
  if (data.status) {
    indicators.status = data.status;
    if (data.status.un_member === false) {
      indicators.isNotUNMember = true;
    }
    if (data.status.recognized || data.status.disputed !== undefined) {
      indicators.hasSpecialStatus = true;
    }
  }

  // Check for own timezone
  if (data.pos && data.pos.locale && data.pos.locale.timezone) {
    indicators.hasOwnTimezone = true;
  }

  return indicators;
}

/**
 * Categorize territories based on their characteristics
 */
function categorizeTerritory(data, indicators, filePath) {
  const categories = [];
  const relativePath = path.relative(dataDir, filePath);

  // Check if it's in overseas, regions, or disputed directory
  const isOverseas = relativePath.includes('/overseas/');
  const isRegion = relativePath.includes('/regions/');
  const isDisputed = relativePath.includes('/disputed/');

  // Special Administrative Regions (SAR) - have own currency and customs
  if (indicators.hasOwnCurrency && indicators.hasOwnISO && indicators.isNotUNMember) {
    // Check if currency is different from parent country
    const isoCode = indicators.isoCode;
    if (isoCode === 'HK' || isoCode === 'MO') {
      categories.push('SAR (Special Administrative Region)');
    }
  }

  // Autonomous territories with own currency
  if (indicators.hasOwnCurrency && indicators.hasOwnISO && (isOverseas || isRegion)) {
    categories.push('Autonomous Territory with Own Currency');
  }

  // Special customs territories (own postal system + own currency/tax)
  if (indicators.hasOwnPostalSystem && (indicators.hasOwnCurrency || indicators.hasOwnTaxSystem)) {
    categories.push('Special Customs Territory');
  }

  // Effectively independent (has most attributes of independence)
  const independenceScore =
    (indicators.hasOwnCurrency ? 1 : 0) +
    (indicators.hasOwnISO ? 1 : 0) +
    (indicators.hasOwnPostalSystem ? 1 : 0) +
    (indicators.hasOwnTaxSystem ? 1 : 0) +
    (indicators.hasOwnTimezone ? 1 : 0);

  if (independenceScore >= 4 && indicators.isNotUNMember) {
    categories.push('Effectively Independent');
  }

  // Disputed territories
  if (isDisputed || (indicators.status && indicators.status.disputed === true)) {
    categories.push('Disputed Territory');
  }

  // Overseas territories with special status
  if (isOverseas && indicators.hasOwnCurrency) {
    categories.push('Overseas Territory');
  }

  // Regions with special autonomy
  if (isRegion && (indicators.hasOwnTaxSystem || indicators.hasOwnPostalSystem)) {
    categories.push('Special Autonomous Region');
  }

  return categories;
}

/**
 * Main analysis function
 */
function analyzeAllTerritories() {
  console.log('🔍 Analyzing territories for independence and special customs status...\n');

  const yamlFiles = findYAMLFiles(dataDir);
  const results = {
    effectivelyIndependent: [],
    specialCustomsTerritories: [],
    sar: [],
    autonomousTerritories: [],
    overseasTerritories: [],
    disputedTerritories: [],
    specialAutonomousRegions: [],
  };

  yamlFiles.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      if (!data || !data.name) {
        return; // Skip invalid files
      }

      const indicators = analyzeTerritory(data);
      const categories = categorizeTerritory(data, indicators, filePath);

      if (categories.length > 0) {
        const relativePath = path.relative(dataDir, filePath);
        const entry = {
          name: data.name.en || data.name.local?.[0]?.value || 'Unknown',
          isoCode: indicators.isoCode,
          currency: indicators.currencyCode,
          taxSystem: indicators.taxType,
          postalPattern: indicators.postalCodePattern,
          status: indicators.status,
          path: relativePath,
          categories: categories,
          indicators: {
            ownCurrency: indicators.hasOwnCurrency,
            ownTaxSystem: indicators.hasOwnTaxSystem,
            ownPostalSystem: indicators.hasOwnPostalSystem,
            ownISO: indicators.hasOwnISO,
            notUNMember: indicators.isNotUNMember,
          },
        };

        // Add to appropriate categories
        categories.forEach((category) => {
          if (category === 'Effectively Independent') {
            results.effectivelyIndependent.push(entry);
          }
          if (category === 'Special Customs Territory') {
            results.specialCustomsTerritories.push(entry);
          }
          if (category === 'SAR (Special Administrative Region)') {
            results.sar.push(entry);
          }
          if (category === 'Autonomous Territory with Own Currency') {
            results.autonomousTerritories.push(entry);
          }
          if (category === 'Overseas Territory') {
            results.overseasTerritories.push(entry);
          }
          if (category === 'Disputed Territory') {
            results.disputedTerritories.push(entry);
          }
          if (category === 'Special Autonomous Region') {
            results.specialAutonomousRegions.push(entry);
          }
        });
      }
    } catch (error) {
      console.error(`Error processing ${filePath}: ${error.message}`);
    }
  });

  return results;
}

/**
 * Print results
 */
function printResults(results) {
  console.log('='.repeat(80));
  console.log('📊 ANALYSIS RESULTS');
  console.log('='.repeat(80));
  console.log();

  // 1. Effectively Independent Territories
  if (results.effectivelyIndependent.length > 0) {
    console.log('🏴 EFFECTIVELY INDEPENDENT TERRITORIES');
    console.log('   (Territories with high degree of autonomy, own currency, postal, tax systems)');
    console.log('-'.repeat(80));
    results.effectivelyIndependent.forEach((t) => {
      console.log(`   ${t.isoCode || '??'} - ${t.name}`);
      console.log(`      Currency: ${t.currency || 'N/A'}`);
      console.log(`      Tax System: ${t.taxSystem || 'N/A'}`);
      console.log(`      Path: ${t.path}`);
      console.log();
    });
  }

  // 2. Special Customs Territories
  if (results.specialCustomsTerritories.length > 0) {
    console.log('🏛️  SPECIAL CUSTOMS/TARIFF TERRITORIES');
    console.log('   (Territories with separate customs and tariff systems)');
    console.log('-'.repeat(80));
    results.specialCustomsTerritories.forEach((t) => {
      console.log(`   ${t.isoCode || '??'} - ${t.name}`);
      console.log(`      Currency: ${t.currency || 'N/A'}`);
      console.log(`      Tax System: ${t.taxSystem || 'N/A'}`);
      console.log(`      Postal Pattern: ${t.postalPattern || 'N/A'}`);
      console.log(`      Path: ${t.path}`);
      console.log();
    });
  }

  // 3. Special Administrative Regions (SAR)
  if (results.sar.length > 0) {
    console.log('🏙️  SPECIAL ADMINISTRATIVE REGIONS (SAR)');
    console.log('   (Regions with "One Country, Two Systems" policy)');
    console.log('-'.repeat(80));
    results.sar.forEach((t) => {
      console.log(`   ${t.isoCode || '??'} - ${t.name}`);
      console.log(`      Currency: ${t.currency || 'N/A'}`);
      console.log(`      Path: ${t.path}`);
      console.log();
    });
  }

  // 4. Autonomous Territories with Own Currency
  if (results.autonomousTerritories.length > 0) {
    console.log('💰 AUTONOMOUS TERRITORIES WITH OWN CURRENCY');
    console.log('-'.repeat(80));
    results.autonomousTerritories.forEach((t) => {
      console.log(`   ${t.isoCode || '??'} - ${t.name}`);
      console.log(`      Currency: ${t.currency || 'N/A'}`);
      console.log(`      Path: ${t.path}`);
      console.log();
    });
  }

  // 5. Overseas Territories
  if (results.overseasTerritories.length > 0) {
    console.log('🌍 OVERSEAS TERRITORIES WITH SPECIAL STATUS');
    console.log('-'.repeat(80));
    results.overseasTerritories.forEach((t) => {
      console.log(`   ${t.isoCode || '??'} - ${t.name}`);
      console.log(`      Currency: ${t.currency || 'N/A'}`);
      console.log(`      Path: ${t.path}`);
      console.log();
    });
  }

  // 6. Special Autonomous Regions
  if (results.specialAutonomousRegions.length > 0) {
    console.log('🗺️  SPECIAL AUTONOMOUS REGIONS');
    console.log('   (Regions with special tax, postal, or administrative systems)');
    console.log('-'.repeat(80));
    results.specialAutonomousRegions.forEach((t) => {
      console.log(`   ${t.isoCode || '??'} - ${t.name}`);
      console.log(`      Tax System: ${t.taxSystem || 'N/A'}`);
      console.log(`      Postal Pattern: ${t.postalPattern || 'N/A'}`);
      console.log(`      Path: ${t.path}`);
      console.log();
    });
  }

  // Summary
  console.log('='.repeat(80));
  console.log('📈 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`   Effectively Independent: ${results.effectivelyIndependent.length}`);
  console.log(`   Special Customs Territories: ${results.specialCustomsTerritories.length}`);
  console.log(`   Special Administrative Regions: ${results.sar.length}`);
  console.log(`   Autonomous Territories (Own Currency): ${results.autonomousTerritories.length}`);
  console.log(`   Overseas Territories: ${results.overseasTerritories.length}`);
  console.log(`   Special Autonomous Regions: ${results.specialAutonomousRegions.length}`);
  console.log('='.repeat(80));
  console.log();
}

/**
 * Generate JSON report
 */
function generateJSONReport(results) {
  const reportPath = path.join(__dirname, '..', 'docs', 'special-territories-report.json');

  // Ensure docs directory exists
  const docsDir = path.dirname(reportPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      effectivelyIndependent: results.effectivelyIndependent.length,
      specialCustomsTerritories: results.specialCustomsTerritories.length,
      specialAdministrativeRegions: results.sar.length,
      autonomousTerritoriesWithOwnCurrency: results.autonomousTerritories.length,
      overseasTerritories: results.overseasTerritories.length,
      specialAutonomousRegions: results.specialAutonomousRegions.length,
    },
    territories: results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`📄 JSON report generated: ${reportPath}`);
  console.log();
}

// Run analysis
const results = analyzeAllTerritories();
printResults(results);
generateJSONReport(results);

console.log('✅ Analysis complete!');
