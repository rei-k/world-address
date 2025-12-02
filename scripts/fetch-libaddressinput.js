#!/usr/bin/env node

/**
 * Fetch address data from Google's libaddressinput API
 * https://chromium-i18n.appspot.com/ssl-address/data
 * 
 * This script fetches address metadata for all countries and converts it to YAML and JSON format.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://chromium-i18n.appspot.com/ssl-address';

// Additional fields to extract from libaddressinput data
const ADDITIONAL_FIELDS = ['id', 'sub_isoids', 'sub_lnames', 'sub_mores', 'sub_zips', 'sub_zipexs'];

// ISO 3166-1 alpha-2 country codes
// Based on the existing data structure in this repository
const COUNTRY_CODES = [
  // Africa
  'AO', 'BF', 'BI', 'BJ', 'BW', 'CD', 'CF', 'CG', 'CI', 'CM', 'CV', 'DJ', 'DZ', 'EG', 'ER', 'ET',
  'GA', 'GH', 'GM', 'GN', 'GQ', 'GW', 'KE', 'KM', 'LR', 'LS', 'LY', 'MA', 'MG', 'ML', 'MR', 'MU',
  'MW', 'MZ', 'NA', 'NE', 'NG', 'RW', 'SC', 'SD', 'SL', 'SN', 'SO', 'SS', 'ST', 'SZ', 'TD', 'TG',
  'TN', 'TZ', 'UG', 'ZA', 'ZM', 'ZW',
  
  // Americas
  'AG', 'AR', 'BB', 'BO', 'BR', 'BS', 'BZ', 'CA', 'CL', 'CO', 'CR', 'CU', 'DM', 'DO', 'EC', 'GD',
  'GT', 'GY', 'HN', 'HT', 'JM', 'KN', 'LC', 'MX', 'NI', 'PA', 'PE', 'PY', 'SR', 'SV', 'TT', 'US',
  'UY', 'VC', 'VE',
  
  // Asia
  'AE', 'AF', 'AM', 'AZ', 'BD', 'BH', 'BN', 'BT', 'CN', 'GE', 'HK', 'ID', 'IL', 'IN', 'IQ', 'IR',
  'JO', 'JP', 'KG', 'KH', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LK', 'MM', 'MN', 'MO', 'MV', 'MY',
  'NP', 'OM', 'PH', 'PK', 'PS', 'QA', 'SA', 'SG', 'SY', 'TH', 'TJ', 'TL', 'TM', 'TR', 'TW', 'UZ',
  'VN', 'YE',
  
  // Europe
  'AD', 'AL', 'AT', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR',
  'GB', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MC', 'MD', 'ME', 'MK', 'MT',
  'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'RU', 'SE', 'SI', 'SK', 'SM', 'UA', 'VA', 'XK',
  
  // Oceania
  'AU', 'FJ', 'FM', 'KI', 'MH', 'NR', 'NZ', 'PG', 'PW', 'SB', 'TO', 'TV', 'VU', 'WS',
  
  // Special territories and dependencies
  'AS', 'AI', 'AQ', 'BM', 'BQ', 'CC', 'CK', 'CW', 'CX', 'FK', 'FO', 'GF', 'GG', 'GI', 'GL', 'GP',
  'GS', 'GU', 'HM', 'IM', 'IO', 'JE', 'KY', 'MQ', 'MS', 'MP', 'NC', 'NF', 'NU', 'PF', 'PM', 'PN',
  'PR', 'RE', 'SH', 'SX', 'TC', 'TK', 'VI', 'VG', 'WF', 'YT'
];

/**
 * Fetch data from URL
 */
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // The API returns JSONP format like: callback({"key":"value"})
          // We need to extract the JSON part
          const jsonMatch = data.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]));
          } else {
            resolve(JSON.parse(data));
          }
        } catch (error) {
          reject(new Error(`Failed to parse JSON from ${url}: ${error.message}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Convert JSON to YAML format
 */
function jsonToYaml(obj, indent = 0) {
  const indentStr = '  '.repeat(indent);
  let yaml = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      yaml += `${indentStr}${key}: null\n`;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      yaml += `${indentStr}${key}:\n`;
      yaml += jsonToYaml(value, indent + 1);
    } else if (Array.isArray(value)) {
      yaml += `${indentStr}${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object') {
          yaml += `${indentStr}  -\n`;
          yaml += jsonToYaml(item, indent + 2);
        } else {
          yaml += `${indentStr}  - ${item}\n`;
        }
      });
    } else if (typeof value === 'string') {
      // Escape special characters in YAML
      // Check for characters that require quoting in YAML
      const needsQuoting = /[:\n#\[\]{}&*!|>'"%@`]/.test(value) || 
                          value.trim() !== value || 
                          /^[-?]/.test(value);
      
      if (needsQuoting) {
        // Escape backslashes first, then quotes to avoid double-escaping
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        yaml += `${indentStr}${key}: "${escaped}"\n`;
      } else {
        yaml += `${indentStr}${key}: ${value}\n`;
      }
    } else {
      yaml += `${indentStr}${key}: ${value}\n`;
    }
  }
  
  return yaml;
}

/**
 * Transform libaddressinput data to our repository format
 */
function transformLibAddressData(countryCode, data) {
  const transformed = {
    country_code: countryCode,
    libaddressinput: {
      key: data.key || countryCode,
      name: data.name || '',
    }
  };
  
  // Add format if available
  if (data.fmt) {
    transformed.libaddressinput.format = data.fmt;
  }
  
  // Add required fields if available
  if (data.require) {
    transformed.libaddressinput.require = data.require;
  }
  
  // Add postal code info if available
  if (data.zip) {
    transformed.libaddressinput.postal_code_pattern = data.zip;
  }
  
  if (data.zipex) {
    transformed.libaddressinput.postal_code_examples = data.zipex;
  }
  
  // Add sub-regions if available
  if (data.sub_keys) {
    transformed.libaddressinput.sub_keys = data.sub_keys.split('~');
  }
  
  if (data.sub_names) {
    transformed.libaddressinput.sub_names = data.sub_names.split('~');
  }
  
  // Add language-specific data
  if (data.lang) {
    transformed.libaddressinput.languages = data.lang.split('~');
  }
  
  // Add other useful fields
  ADDITIONAL_FIELDS.forEach(field => {
    if (data[field]) {
      transformed.libaddressinput[field] = data[field];
    }
  });
  
  return transformed;
}

/**
 * Determine the output directory for a country code
 */
function getOutputDirectory(countryCode) {
  const baseDir = path.join(__dirname, '..', 'data', 'libaddressinput');
  
  // For now, we'll organize by first letter for simplicity
  // A more sophisticated approach would categorize by continent/region
  const firstLetter = countryCode.charAt(0).toUpperCase();
  return path.join(baseDir, firstLetter);
}

/**
 * Fetch and save data for a single country
 */
async function fetchCountry(countryCode) {
  const url = `${BASE_URL}/data/${countryCode}`;
  
  try {
    console.log(`Fetching ${countryCode}...`);
    const data = await fetchData(url);
    const transformed = transformLibAddressData(countryCode, data);
    
    // Determine output directory
    const outputDir = getOutputDirectory(countryCode);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write JSON file
    const jsonPath = path.join(outputDir, `${countryCode}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(transformed, null, 2) + '\n', 'utf8');
    console.log(`  ✓ Saved ${jsonPath}`);
    
    // Write YAML file
    const yamlPath = path.join(outputDir, `${countryCode}.yaml`);
    const yamlContent = jsonToYaml(transformed);
    fs.writeFileSync(yamlPath, yamlContent, 'utf8');
    console.log(`  ✓ Saved ${yamlPath}`);
    
    return { success: true, countryCode };
  } catch (error) {
    console.error(`  ✗ Failed to fetch ${countryCode}: ${error.message}`);
    return { success: false, countryCode, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting libaddressinput data fetch...\n');
  console.log(`Total countries to fetch: ${COUNTRY_CODES.length}\n`);
  
  const results = {
    success: [],
    failed: []
  };
  
  // Process countries with a delay to avoid rate limiting
  for (let i = 0; i < COUNTRY_CODES.length; i++) {
    const countryCode = COUNTRY_CODES[i];
    const result = await fetchCountry(countryCode);
    
    if (result.success) {
      results.success.push(countryCode);
    } else {
      results.failed.push({ code: countryCode, error: result.error });
    }
    
    // Add a small delay to avoid overwhelming the API
    if (i < COUNTRY_CODES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total: ${COUNTRY_CODES.length}`);
  console.log(`Success: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed countries:');
    results.failed.forEach(({ code, error }) => {
      console.log(`  - ${code}: ${error}`);
    });
  }
  
  console.log('\nDone!');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { fetchCountry, transformLibAddressData };
