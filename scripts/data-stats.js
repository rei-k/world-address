#!/usr/bin/env node

/**
 * Data Completeness Statistics Script
 *
 * Analyzes YAML files to determine:
 * - Total number of countries
 * - Countries with full schema support
 * - Countries with partial data
 * - Overall completion percentage
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Fields that indicate full schema support
const FULL_SCHEMA_FIELDS = [
  'name.en',
  'name.local',
  'iso_codes.alpha2',
  'iso_codes.alpha3',
  'iso_codes.numeric',
  'continent',
  'languages',
  'address_format',
  'examples',
];

// Fields for basic support
const BASIC_FIELDS = ['name.en', 'iso_codes.alpha2'];

/**
 * Check if a nested field exists in an object
 */
function hasNestedField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }

  return true;
}

/**
 * Calculate completeness percentage
 */
function calculateCompleteness(data) {
  let presentFields = 0;

  for (const field of FULL_SCHEMA_FIELDS) {
    if (hasNestedField(data, field)) {
      presentFields++;
    }
  }

  return (presentFields / FULL_SCHEMA_FIELDS.length) * 100;
}

/**
 * Analyze a single YAML file
 */
function analyzeYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);

    if (!data || typeof data !== 'object') {
      return null;
    }

    const hasBasicFields = BASIC_FIELDS.every((field) => hasNestedField(data, field));
    if (!hasBasicFields) {
      return null;
    }

    const completeness = calculateCompleteness(data);
    const isFull = completeness >= 80; // 80% or more is considered "full"

    return {
      file: filePath,
      countryCode: data.iso_codes?.alpha2 || 'UNKNOWN',
      countryName: data.name?.en || 'Unknown',
      completeness: Math.round(completeness),
      isFull,
      hasPos: !!data.pos,
      hasGeo: !!data.geo,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Recursively find all YAML files
 */
function findYamlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'libaddressinput' && file !== 'examples') {
        findYamlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Main function
 */
function main() {
  console.log('📊 Analyzing data completeness...\n');

  const dataDir = path.join(__dirname, '..', 'data');

  if (!fs.existsSync(dataDir)) {
    console.error('❌ Error: data directory not found');
    process.exit(1);
  }

  const yamlFiles = findYamlFiles(dataDir);
  const totalYamlFiles = yamlFiles.length;
  const analyzed = yamlFiles.map(analyzeYamlFile).filter((result) => result !== null);

  const fullSchemaCountries = analyzed.filter((a) => a.isFull);
  const partialCountries = analyzed.filter((a) => !a.isFull);
  const withPos = analyzed.filter((a) => a.hasPos);
  const withGeo = analyzed.filter((a) => a.hasGeo);

  const avgCompleteness =
    analyzed.length > 0
      ? Math.round(analyzed.reduce((sum, a) => sum + a.completeness, 0) / analyzed.length)
      : 0;

  const additionalEntities = totalYamlFiles - analyzed.length;

  // Print statistics
  console.log('📈 Data Statistics:');
  console.log('═'.repeat(60));
  console.log(`Total YAML files (all entities):      ${totalYamlFiles}`);
  console.log(`Main countries/regions:               ${analyzed.length}`);
  console.log(`Additional entities:                  ${additionalEntities}`);
  console.log('  (regions, overseas territories, disputed areas, stations, etc.)');
  console.log(`Full schema support (≥80%):           ${fullSchemaCountries.length}`);
  console.log(`Partial data (<80%):                  ${partialCountries.length}`);
  console.log(`Average completeness:                 ${avgCompleteness}%`);
  console.log(`Countries with POS data:              ${withPos.length}`);
  console.log(`Countries with geo-coordinates:       ${withGeo.length}`);
  console.log('═'.repeat(60));

  // List full schema countries
  if (fullSchemaCountries.length > 0) {
    console.log('\n✅ Countries with Full Schema Support:');
    console.log('─'.repeat(60));

    // Group by continent
    const byContinent = {};
    for (const country of fullSchemaCountries) {
      const continent = path.dirname(path.dirname(country.file)).split(path.sep).pop();
      if (!byContinent[continent]) {
        byContinent[continent] = [];
      }
      byContinent[continent].push(country);
    }

    for (const [continent, countries] of Object.entries(byContinent).sort()) {
      console.log(`\n${continent.toUpperCase().replace(/_/g, ' ')}:`);
      for (const country of countries.sort((a, b) => a.countryCode.localeCompare(b.countryCode))) {
        const features = [];
        if (country.hasPos) {
          features.push('POS');
        }
        if (country.hasGeo) {
          features.push('GEO');
        }
        const featureStr = features.length > 0 ? ` [${features.join(', ')}]` : '';
        console.log(
          `  ${country.countryCode} - ${country.countryName} (${country.completeness}%)${featureStr}`,
        );
      }
    }
  }

  // Generate markdown stats for README
  console.log('\n\n📝 Markdown for README.md:');
  console.log('─'.repeat(60));
  console.log('```');
  console.log('### 📊 データ完成度 / Data Completeness');
  console.log('');
  console.log(`- **総エンティティ数 / Total Entities**: ${totalYamlFiles}`);
  console.log(`  - 主要国・地域 / Main Countries & Regions: ${analyzed.length}`);
  console.log(`  - 追加エンティティ / Additional Entities: ${additionalEntities}`);
  console.log(
    '    (海外領土、特別地域、紛争地域、基地局等 / Overseas territories, special regions, disputed areas, stations, etc.)',
  );
  console.log(
    `- **フルスキーマ対応 / Full Schema Support**: ${fullSchemaCountries.length} (${Math.round((fullSchemaCountries.length / analyzed.length) * 100)}%)`,
  );
  console.log(`- **平均完成度 / Average Completeness**: ${avgCompleteness}%`);
  console.log(`- **POS対応 / POS Support**: ${withPos.length} countries`);
  console.log(`- **緯度経度対応 / Geo-coordinates**: ${withGeo.length} countries`);
  console.log('```');

  console.log('\n✅ Analysis complete!');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { analyzeYamlFile, calculateCompleteness };
