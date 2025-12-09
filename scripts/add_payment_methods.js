#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Load payment methods data
const paymentDataPath = path.join(__dirname, 'americas_payment_methods.json');
const paymentData = JSON.parse(fs.readFileSync(paymentDataPath, 'utf8'));

// Function to update payment methods in a YAML file
function updatePaymentMethods(filePath, countryCode) {
  if (!paymentData[countryCode]) {
    return false;
  }
  
  const data = yaml.load(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.pos || !data.pos.payment_methods) {
    return false;
  }
  
  let updated = false;
  
  // Check if current payment methods are generic (only Cash and Credit Card)
  const currentMethods = data.pos.payment_methods;
  const isGeneric = currentMethods.length === 2 && 
                    currentMethods.some(m => m.name === 'Cash') &&
                    currentMethods.some(m => m.name === 'Credit Card');
  
  if (isGeneric || currentMethods.length <= 2) {
    // Replace with country-specific payment methods
    data.pos.payment_methods = paymentData[countryCode].payment_methods;
    updated = true;
    console.log(`  ✓ Updated payment methods (${paymentData[countryCode].payment_methods.length} methods)`);
    paymentData[countryCode].payment_methods.forEach(method => {
      console.log(`    - ${method.name} (${method.type}, ${method.prevalence})`);
    });
  }
  
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
console.log('💳 Adding country-specific payment methods...\n');

const baseDir = path.join(__dirname, '../data/americas');

// List of countries with specific payment methods
const countriesToUpdate = {
  'south_america/BR': 'BR',
  'north_america/MX': 'MX',
  'south_america/AR': 'AR',
  'south_america/CO': 'CO',
  'south_america/CL': 'CL',
  'south_america/PE': 'PE',
  'central_america/CR': 'CR',
  'south_america/UY': 'UY',
  'caribbean/JM': 'JM',
  'caribbean/TT': 'TT',
};

let totalUpdated = 0;

Object.entries(countriesToUpdate).forEach(([relativePath, countryCode]) => {
  const yamlFile = path.join(baseDir, relativePath, `${countryCode}.yaml`);
  
  if (!fs.existsSync(yamlFile)) {
    console.log(`⚠️  File not found: ${yamlFile}`);
    return;
  }
  
  console.log(`${countryCode}:`);
  const wasUpdated = updatePaymentMethods(yamlFile, countryCode);
  
  if (wasUpdated) {
    totalUpdated++;
  } else {
    console.log('  ℹ️  No changes needed');
  }
  console.log('');
});

console.log(`✅ Complete! Files updated: ${totalUpdated}`);
