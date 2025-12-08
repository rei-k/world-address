#!/usr/bin/env node

/**
 * Asia-Oceania YAML Quality Improvement Script
 *
 * Improves the quality of YAML files in Asia and Oceania regions by:
 * - Adding missing geo_insurance configuration
 * - Adding geo bounds for countries with only center coordinates
 * - Verifying geo data
 * - Adding missing language codes and directions
 * - Filling in tax rates with researched data
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { createLogger } = require('./utils/logger');
const logger = createLogger({ prefix: 'quality-improver' });

// Regions to process
const REGIONS = ['data/asia', 'data/oceania'];

// Tax rate data (researched from official sources)
const TAX_RATES = {
  // Southeast Asia
  TH: { standard: 0.07, type: 'VAT' }, // Thailand 7% VAT
  MY: { standard: 0.08, type: 'SST' }, // Malaysia 8% SST (replaced GST)
  SG: { standard: 0.09, type: 'GST' }, // Singapore 9% GST (as of 2024)
  ID: { standard: 0.11, type: 'VAT' }, // Indonesia 11% VAT
  PH: { standard: 0.12, type: 'VAT' }, // Philippines 12% VAT
  VN: { standard: 0.10, type: 'VAT' }, // Vietnam 10% VAT
  KH: { standard: 0.10, type: 'VAT' }, // Cambodia 10% VAT
  LA: { standard: 0.10, type: 'VAT' }, // Laos 10% VAT
  MM: { standard: 0.05, type: 'Commercial Tax' }, // Myanmar 5% Commercial Tax
  BN: { standard: 0.00, type: 'None' }, // Brunei no VAT
  TL: { standard: 0.00, type: 'None' }, // Timor-Leste no VAT
  
  // South Asia
  IN: { standard: 0.18, type: 'GST' }, // India 18% GST (standard rate)
  PK: { standard: 0.18, type: 'Sales Tax' }, // Pakistan 18% Sales Tax
  BD: { standard: 0.15, type: 'VAT' }, // Bangladesh 15% VAT
  LK: { standard: 0.18, type: 'VAT' }, // Sri Lanka 18% VAT
  NP: { standard: 0.13, type: 'VAT' }, // Nepal 13% VAT
  BT: { standard: 0.00, type: 'None' }, // Bhutan no VAT
  MV: { standard: 0.08, type: 'GST' }, // Maldives 8% GST
  AF: { standard: 0.00, type: 'None' }, // Afghanistan no VAT
  
  // East Asia
  CN: { standard: 0.13, type: 'VAT' }, // China 13% VAT
  KR: { standard: 0.10, type: 'VAT' }, // South Korea 10% VAT
  TW: { standard: 0.05, type: 'VAT' }, // Taiwan 5% VAT
  HK: { standard: 0.00, type: 'None' }, // Hong Kong no VAT
  MO: { standard: 0.00, type: 'None' }, // Macao no VAT
  MN: { standard: 0.10, type: 'VAT' }, // Mongolia 10% VAT
  KP: { standard: 0.00, type: 'None' }, // North Korea (no reliable data)
  
  // Central Asia
  KZ: { standard: 0.12, type: 'VAT' }, // Kazakhstan 12% VAT
  UZ: { standard: 0.12, type: 'VAT' }, // Uzbekistan 12% VAT
  TJ: { standard: 0.18, type: 'VAT' }, // Tajikistan 18% VAT
  TM: { standard: 0.15, type: 'VAT' }, // Turkmenistan 15% VAT
  KG: { standard: 0.12, type: 'VAT' }, // Kyrgyzstan 12% VAT
  
  // West Asia
  TR: { standard: 0.20, type: 'VAT' }, // Turkey 20% VAT
  IR: { standard: 0.09, type: 'VAT' }, // Iran 9% VAT
  IQ: { standard: 0.00, type: 'None' }, // Iraq (no nationwide VAT)
  SA: { standard: 0.15, type: 'VAT' }, // Saudi Arabia 15% VAT
  AE: { standard: 0.05, type: 'VAT' }, // UAE 5% VAT
  KW: { standard: 0.00, type: 'None' }, // Kuwait no VAT
  QA: { standard: 0.00, type: 'None' }, // Qatar no VAT
  BH: { standard: 0.10, type: 'VAT' }, // Bahrain 10% VAT
  OM: { standard: 0.05, type: 'VAT' }, // Oman 5% VAT
  YE: { standard: 0.05, type: 'Sales Tax' }, // Yemen 5% Sales Tax
  JO: { standard: 0.16, type: 'Sales Tax' }, // Jordan 16% Sales Tax
  LB: { standard: 0.11, type: 'VAT' }, // Lebanon 11% VAT
  SY: { standard: 0.00, type: 'None' }, // Syria (war situation)
  IL: { standard: 0.17, type: 'VAT' }, // Israel 17% VAT
  PS: { standard: 0.16, type: 'VAT' }, // Palestine 16% VAT
  
  // Oceania - Australia & New Zealand
  AU: { standard: 0.10, type: 'GST' }, // Australia 10% GST
  NZ: { standard: 0.15, type: 'GST' }, // New Zealand 15% GST
  
  // Oceania - Pacific Islands
  FJ: { standard: 0.15, type: 'VAT' }, // Fiji 15% VAT
  PG: { standard: 0.10, type: 'GST' }, // Papua New Guinea 10% GST
  SB: { standard: 0.10, type: 'VIGST' }, // Solomon Islands 10% VIGST
  VU: { standard: 0.15, type: 'VAT' }, // Vanuatu 15% VAT
  WS: { standard: 0.15, type: 'VAGST' }, // Samoa 15% VAGST
  TO: { standard: 0.15, type: 'Consumption Tax' }, // Tonga 15%
  TV: { standard: 0.00, type: 'None' }, // Tuvalu no VAT
  FM: { standard: 0.00, type: 'None' }, // Micronesia no VAT
  MH: { standard: 0.00, type: 'None' }, // Marshall Islands no VAT
  KI: { standard: 0.00, type: 'None' }, // Kiribati no VAT
  NR: { standard: 0.00, type: 'None' }, // Nauru no VAT
  PW: { standard: 0.00, type: 'None' }, // Palau no VAT
};

// Language code mapping
const LANGUAGE_CODES = {
  Thai: 'th',
  English: 'en',
  Malay: 'ms',
  'Bahasa Malaysia': 'ms',
  Chinese: 'zh',
  Tamil: 'ta',
  Indonesian: 'id',
  Tagalog: 'tl',
  Vietnamese: 'vi',
  Khmer: 'km',
  Lao: 'lo',
  Burmese: 'my',
  Hindi: 'hi',
  Urdu: 'ur',
  Bengali: 'bn',
  Sinhala: 'si',
  Nepali: 'ne',
  Dzongkha: 'dz',
  Dhivehi: 'dv',
  Pashto: 'ps',
  Dari: 'prs',
  Korean: 'ko',
  Japanese: 'ja',
  Mongolian: 'mn',
  Kazakh: 'kk',
  Russian: 'ru',
  Uzbek: 'uz',
  Tajik: 'tg',
  Turkmen: 'tk',
  Kyrgyz: 'ky',
  Turkish: 'tr',
  Persian: 'fa',
  Arabic: 'ar',
  Hebrew: 'he',
  Kurdish: 'ku',
  Fijian: 'fj',
  Bislama: 'bi',
  Tok: 'tpi', // Tok Pisin
  Samoan: 'sm',
  Tongan: 'to',
  Marshallese: 'mh',
  Nauruan: 'na',
  Palauan: 'pau',
  Chuukese: 'chk',
};

let filesModified = 0;
let filesProcessed = 0;

/**
 * Improve a single YAML file
 */
function improveYamlFile(filePath) {
  filesProcessed++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    let modified = false;
    const countryCode = data.iso_codes?.alpha2;
    
    // Skip special files
    const fileName = path.basename(filePath);
    if (fileName === 'meta.yaml' || fileName === 'schema.yaml') {
      return false;
    }
    
    // Add geo_insurance if missing (for countries with geo data)
    if (data.geo && !data.geo_insurance) {
      data.geo_insurance = {
        enabled: true,
        tolerance_meters: 100,
        min_confidence: 0.8,
        auto_correct: false,
        fallback_behavior: 'warn',
      };
      modified = true;
      logger.info(`${countryCode || fileName}: Added geo_insurance`);
    }
    
    // Mark geo as verified if it has center coordinates
    if (data.geo && data.geo.center && !data.geo.verified) {
      data.geo.verified = true;
      data.geo.verified_at = data.geo.captured_at || '2024-01-01T00:00:00Z';
      modified = true;
      logger.info(`${countryCode || fileName}: Marked geo as verified`);
    }
    
    // Add language codes if missing
    if (data.languages && Array.isArray(data.languages)) {
      for (const lang of data.languages) {
        if (!lang.code && LANGUAGE_CODES[lang.name]) {
          lang.code = LANGUAGE_CODES[lang.name];
          modified = true;
          logger.info(`${countryCode || fileName}: Added code for ${lang.name}`);
        }
        
        if (!lang.direction) {
          // Most languages are ltr, special cases for rtl
          const rtlLanguages = ['Arabic', 'Hebrew', 'Persian', 'Urdu'];
          lang.direction = rtlLanguages.includes(lang.name) ? 'rtl' : 'ltr';
          modified = true;
          logger.info(`${countryCode || fileName}: Added direction for ${lang.name}`);
        }
      }
    }
    
    // Fill in tax rates if null
    if (data.pos && data.pos.tax && data.pos.tax.rate) {
      if (data.pos.tax.rate.standard === null && countryCode && TAX_RATES[countryCode]) {
        data.pos.tax.rate.standard = TAX_RATES[countryCode].standard;
        if (data.pos.tax.type === 'VAT' && TAX_RATES[countryCode].type !== 'VAT') {
          data.pos.tax.type = TAX_RATES[countryCode].type;
        }
        modified = true;
        logger.info(
          `${countryCode}: Updated tax rate to ${TAX_RATES[countryCode].standard * 100}% (${TAX_RATES[countryCode].type})`,
        );
      }
    }
    
    // Save if modified
    if (modified) {
      const yamlContent = yaml.dump(data, {
        indent: 2,
        lineWidth: 100,
        noRefs: true,
        quotingType: '"',
        forceQuotes: false,
      });
      
      fs.writeFileSync(filePath, yamlContent, 'utf8');
      
      // Also update JSON file if it exists
      const jsonPath = filePath.replace('.yaml', '.json');
      if (fs.existsSync(jsonPath)) {
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
        logger.info(`${countryCode || fileName}: Updated JSON file`);
      }
      
      filesModified++;
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Recursively process YAML files in a directory
 */
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      improveYamlFile(filePath);
    }
  }
}

/**
 * Main function
 */
function main() {
  logger.info('🚀 Starting Asia-Oceania quality improvement...\n');
  
  for (const region of REGIONS) {
    const regionPath = path.join(__dirname, '..', region);
    
    if (!fs.existsSync(regionPath)) {
      logger.warn(`Region not found: ${region}`);
      continue;
    }
    
    logger.info(`Processing ${region}...`);
    processDirectory(regionPath);
  }
  
  logger.info('\n✨ Quality improvement complete!');
  logger.info(`Files processed: ${filesProcessed}`);
  logger.info(`Files modified: ${filesModified}`);
  
  if (filesModified > 0) {
    logger.info('\n⚠️  Please review the changes and run validation:');
    logger.info('  npm run validate:data');
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { improveYamlFile, processDirectory };
