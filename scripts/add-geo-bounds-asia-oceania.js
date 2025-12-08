#!/usr/bin/env node

/**
 * Add Geographic Bounds to Asia-Oceania Countries
 *
 * Adds approximate geographic bounds (bounding boxes) to countries in Asia and Oceania
 * that currently only have center coordinates.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { createLogger } = require('./utils/logger');
const logger = createLogger({ prefix: 'geo-bounds' });

// Regions to process
const REGIONS = ['data/asia', 'data/oceania'];

// Geographic bounds data (approximate bounding boxes)
// Format: { northeast: { lat, lon }, southwest: { lat, lon } }
const GEO_BOUNDS = {
  // Southeast Asia
  TH: {
    northeast: { latitude: 20.4648, longitude: 105.6363 },
    southwest: { latitude: 5.6133, longitude: 97.3439 },
  },
  MY: {
    northeast: { latitude: 7.3634, longitude: 119.2671 },
    southwest: { latitude: 0.8550, longitude: 99.6433 },
  },
  SG: {
    northeast: { latitude: 1.4707, longitude: 104.0077 },
    southwest: { latitude: 1.1304, longitude: 103.6057 },
  },
  ID: {
    northeast: { latitude: 6.2167, longitude: 141.0194 },
    southwest: { latitude: -11.0059, longitude: 94.7717 },
  },
  PH: {
    northeast: { latitude: 21.1207, longitude: 126.6044 },
    southwest: { latitude: 4.6448, longitude: 116.9283 },
  },
  VN: {
    northeast: { latitude: 23.3927, longitude: 109.4646 },
    southwest: { latitude: 8.5598, longitude: 102.1445 },
  },
  KH: {
    northeast: { latitude: 14.6904, longitude: 107.6277 },
    southwest: { latitude: 10.4091, longitude: 102.3480 },
  },
  LA: {
    northeast: { latitude: 22.5000, longitude: 107.6950 },
    southwest: { latitude: 13.9100, longitude: 100.0833 },
  },
  MM: {
    northeast: { latitude: 28.5478, longitude: 101.1702 },
    southwest: { latitude: 9.7844, longitude: 92.1896 },
  },
  BN: {
    northeast: { latitude: 5.0470, longitude: 115.3635 },
    southwest: { latitude: 4.0037, longitude: 114.0758 },
  },
  TL: {
    northeast: { latitude: -8.1274, longitude: 127.3088 },
    southwest: { latitude: -9.5043, longitude: 124.0464 },
  },

  // South Asia
  IN: {
    northeast: { latitude: 35.5138, longitude: 97.3953 },
    southwest: { latitude: 6.7477, longitude: 68.1623 },
  },
  PK: {
    northeast: { latitude: 37.0841, longitude: 77.8374 },
    southwest: { latitude: 23.6345, longitude: 60.8728 },
  },
  BD: {
    northeast: { latitude: 26.6312, longitude: 92.6727 },
    southwest: { latitude: 20.7434, longitude: 88.0284 },
  },
  LK: {
    northeast: { latitude: 9.8351, longitude: 81.8811 },
    southwest: { latitude: 5.9169, longitude: 79.6522 },
  },
  NP: {
    northeast: { latitude: 30.4469, longitude: 88.2015 },
    southwest: { latitude: 26.3479, longitude: 80.0586 },
  },
  BT: {
    northeast: { latitude: 28.3238, longitude: 92.1252 },
    southwest: { latitude: 26.7022, longitude: 88.7464 },
  },
  MV: {
    northeast: { latitude: 7.0954, longitude: 73.6370 },
    southwest: { latitude: -0.6929, longitude: 72.6929 },
  },
  AF: {
    northeast: { latitude: 38.4907, longitude: 74.8894 },
    southwest: { latitude: 29.3772, longitude: 60.5284 },
  },

  // East Asia
  CN: {
    northeast: { latitude: 53.5608, longitude: 134.7728 },
    southwest: { latitude: 18.1973, longitude: 73.4994 },
  },
  KR: {
    northeast: { latitude: 38.6122, longitude: 131.8694 },
    southwest: { latitude: 33.1906, longitude: 125.0657 },
  },
  TW: {
    northeast: { latitude: 25.2954, longitude: 122.0067 },
    southwest: { latitude: 21.8972, longitude: 120.0385 },
  },
  HK: {
    northeast: { latitude: 22.5597, longitude: 114.4346 },
    southwest: { latitude: 22.1533, longitude: 113.8353 },
  },
  MO: {
    northeast: { latitude: 22.2168, longitude: 113.5989 },
    southwest: { latitude: 22.1099, longitude: 113.5281 },
  },
  MN: {
    northeast: { latitude: 52.1543, longitude: 119.9245 },
    southwest: { latitude: 41.5675, longitude: 87.7495 },
  },
  KP: {
    northeast: { latitude: 43.0089, longitude: 130.6968 },
    southwest: { latitude: 37.6732, longitude: 124.3154 },
  },

  // Central Asia
  KZ: {
    northeast: { latitude: 55.4421, longitude: 87.3156 },
    southwest: { latitude: 40.5686, longitude: 46.4932 },
  },
  UZ: {
    northeast: { latitude: 45.5749, longitude: 73.1322 },
    southwest: { latitude: 37.1843, longitude: 55.9977 },
  },
  TJ: {
    northeast: { latitude: 41.0442, longitude: 75.1372 },
    southwest: { latitude: 36.6711, longitude: 67.3872 },
  },
  TM: {
    northeast: { latitude: 42.7975, longitude: 66.6841 },
    southwest: { latitude: 35.1413, longitude: 52.4416 },
  },
  KG: {
    northeast: { latitude: 43.2384, longitude: 80.2599 },
    southwest: { latitude: 39.1728, longitude: 69.2649 },
  },

  // West Asia
  TR: {
    northeast: { latitude: 42.1069, longitude: 44.8176 },
    southwest: { latitude: 35.8215, longitude: 25.6688 },
  },
  IR: {
    northeast: { latitude: 39.7770, longitude: 63.3333 },
    southwest: { latitude: 25.0642, longitude: 44.0311 },
  },
  IQ: {
    northeast: { latitude: 37.3857, longitude: 48.5679 },
    southwest: { latitude: 29.0697, longitude: 38.7936 },
  },
  SA: {
    northeast: { latitude: 32.1543, longitude: 55.6667 },
    southwest: { latitude: 16.3792, longitude: 34.4957 },
  },
  AE: {
    northeast: { latitude: 26.0844, longitude: 56.3968 },
    southwest: { latitude: 22.6315, longitude: 51.5795 },
  },
  KW: {
    northeast: { latitude: 30.0956, longitude: 48.5177 },
    southwest: { latitude: 28.5243, longitude: 46.5687 },
  },
  QA: {
    northeast: { latitude: 26.1551, longitude: 51.6360 },
    southwest: { latitude: 24.4821, longitude: 50.7439 },
  },
  BH: {
    northeast: { latitude: 26.2824, longitude: 50.8213 },
    southwest: { latitude: 25.7967, longitude: 50.4542 },
  },
  OM: {
    northeast: { latitude: 26.3876, longitude: 59.8360 },
    southwest: { latitude: 16.6456, longitude: 51.8821 },
  },
  YE: {
    northeast: { latitude: 19.0000, longitude: 54.5305 },
    southwest: { latitude: 12.1110, longitude: 42.5332 },
  },
  JO: {
    northeast: { latitude: 33.3747, longitude: 39.3012 },
    southwest: { latitude: 29.1850, longitude: 34.9596 },
  },
  LB: {
    northeast: { latitude: 34.6917, longitude: 36.6250 },
    southwest: { latitude: 33.0550, longitude: 35.1023 },
  },
  SY: {
    northeast: { latitude: 37.3195, longitude: 42.3745 },
    southwest: { latitude: 32.3117, longitude: 35.7278 },
  },
  IL: {
    northeast: { latitude: 33.3356, longitude: 35.8950 },
    southwest: { latitude: 29.4971, longitude: 34.2674 },
  },
  PS: {
    northeast: { latitude: 32.5468, longitude: 35.5731 },
    southwest: { latitude: 31.2164, longitude: 34.2165 },
  },
  AM: {
    northeast: { latitude: 41.3007, longitude: 46.6344 },
    southwest: { latitude: 38.8404, longitude: 43.4472 },
  },
  AZ: {
    northeast: { latitude: 41.9104, longitude: 50.3928 },
    southwest: { latitude: 38.3927, longitude: 44.7740 },
  },
  GE: {
    northeast: { latitude: 43.5864, longitude: 46.7365 },
    southwest: { latitude: 41.0537, longitude: 40.0101 },
  },

  // Oceania - Australia & New Zealand
  AU: {
    northeast: { latitude: -9.2218, longitude: 159.2556 },
    southwest: { latitude: -54.7772, longitude: 112.9211 },
  },
  NZ: {
    northeast: { latitude: -29.2313, longitude: -175.5319 },
    southwest: { latitude: -52.6194, longitude: 166.4260 },
  },

  // Oceania - Pacific Islands
  FJ: {
    northeast: { latitude: -12.4800, longitude: -178.4250 },
    southwest: { latitude: -20.6756, longitude: 177.1289 },
  },
  PG: {
    northeast: { latitude: -0.8774, longitude: 155.9633 },
    southwest: { latitude: -11.6572, longitude: 140.8420 },
  },
  SB: {
    northeast: { latitude: -6.5894, longitude: 167.8441 },
    southwest: { latitude: -12.3086, longitude: 155.5085 },
  },
  VU: {
    northeast: { latitude: -13.0733, longitude: 170.2368 },
    southwest: { latitude: -20.2489, longitude: 166.5244 },
  },
  WS: {
    northeast: { latitude: -13.4321, longitude: -171.4152 },
    southwest: { latitude: -14.0579, longitude: -172.8098 },
  },
  TO: {
    northeast: { latitude: -15.5638, longitude: -173.9074 },
    southwest: { latitude: -21.4547, longitude: -175.6821 },
  },
  TV: {
    northeast: { latitude: -5.6417, longitude: 179.8628 },
    southwest: { latitude: -10.8017, longitude: 176.0646 },
  },
  FM: {
    northeast: { latitude: 10.0897, longitude: 163.0367 },
    southwest: { latitude: 1.0267, longitude: 137.3333 },
  },
  MH: {
    northeast: { latitude: 14.6200, longitude: 171.9308 },
    southwest: { latitude: 4.5719, longitude: 160.8286 },
  },
  KI: {
    northeast: { latitude: 4.7197, longitude: -150.2083 },
    southwest: { latitude: -11.4461, longitude: 169.5344 },
  },
  NR: {
    northeast: { latitude: -0.4930, longitude: 166.9589 },
    southwest: { latitude: -0.5530, longitude: 166.9089 },
  },
  PW: {
    northeast: { latitude: 8.2225, longitude: 134.7195 },
    southwest: { latitude: 2.7481, longitude: 131.1183 },
  },
};

let filesModified = 0;
let filesProcessed = 0;

/**
 * Add geo bounds to a single YAML file
 */
function addGeoBounds(filePath) {
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

    // Add geo bounds if geo data exists, has center, but no bounds
    if (
      data.geo &&
      data.geo.center &&
      !data.geo.bounds &&
      countryCode &&
      GEO_BOUNDS[countryCode]
    ) {
      data.geo.bounds = GEO_BOUNDS[countryCode];
      modified = true;
      logger.info(`${countryCode}: Added geo bounds`);
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
        logger.info(`${countryCode}: Updated JSON file`);
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
      addGeoBounds(filePath);
    }
  }
}

/**
 * Main function
 */
function main() {
  logger.info('🗺️  Starting geo bounds addition for Asia-Oceania...\n');

  for (const region of REGIONS) {
    const regionPath = path.join(__dirname, '..', region);

    if (!fs.existsSync(regionPath)) {
      logger.warn(`Region not found: ${region}`);
      continue;
    }

    logger.info(`Processing ${region}...`);
    processDirectory(regionPath);
  }

  logger.info('\n✨ Geo bounds addition complete!');
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

module.exports = { addGeoBounds, processDirectory };
