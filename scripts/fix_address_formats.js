#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Function to fix address format structure
function fixAddressFormat(filePath, countryCode) {
  const data = yaml.load(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.address_format || !data.address_format.order_variants) {
    return false;
  }
  
  let updated = false;
  
  // Fix order_variants structure
  data.address_format.order_variants = data.address_format.order_variants.map(variant => {
    // Check if variant is using incorrect structure like "domestic_es:" instead of "context: domestic_es"
    const keys = Object.keys(variant);
    
    // If the first key is not 'context', this is the old structure
    if (keys[0] !== 'context' && keys[0] !== 'order') {
      const contextName = keys[0];
      const orderArray = variant[contextName];
      
      // Convert to new structure
      updated = true;
      console.log(`  ✓ Fixed address format structure: ${contextName} → context: ${contextName.replace('_', ' ')}`);
      
      return {
        context: contextName,
        order: orderArray,
      };
    }
    
    return variant;
  });
  
  if (updated) {
    // Write back to YAML
    const yamlStr = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    });
    fs.writeFileSync(filePath, yamlStr, 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
console.log('🔧 Fixing address format structures in Americas...\n');

const baseDir = path.join(__dirname, '../data/americas');
const regions = ['caribbean', 'central_america', 'north_america', 'south_america'];

// Files that need fixing
const filesToFix = [
  'central_america/CR/CR.yaml',
  'central_america/GT/GT.yaml',
  'central_america/HN/HN.yaml',
  'central_america/PA/PA.yaml',
  'central_america/SV/SV.yaml',
];

let totalUpdated = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(baseDir, filePath);
  const countryCode = path.basename(path.dirname(fullPath));
  
  console.log(`${countryCode}:`);
  const wasUpdated = fixAddressFormat(fullPath, countryCode);
  
  if (wasUpdated) {
    totalUpdated++;
  } else {
    console.log('  ℹ️  No changes needed');
  }
  console.log('');
});

console.log(`✅ Complete! Files updated: ${totalUpdated}`);
