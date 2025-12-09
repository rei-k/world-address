#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Load tax data
const taxDataPath = path.join(__dirname, 'americas_tax_data.json');
const taxData = JSON.parse(fs.readFileSync(taxDataPath, 'utf8'));

// Function to update a YAML file
function updateYAMLFile(filePath, region, countryCode) {
  const data = yaml.load(fs.readFileSync(filePath, 'utf8'));
  
  let regionData;
  if (region === 'caribbean') {
    regionData = taxData.caribbean[countryCode];
  } else if (region === 'central_america') {
    regionData = taxData.central_america[countryCode];
  } else if (region === 'north_america') {
    regionData = taxData.north_america[countryCode];
  } else if (region === 'south_america') {
    regionData = taxData.south_america[countryCode];
  }
  
  if (!regionData) {
    console.log(`⚠️  No tax data for ${countryCode} in ${region}`);
    return false;
  }
  
  let updated = false;
  
  // Add subregion if missing
  if (regionData.subregion && !data.subregion) {
    data.subregion = regionData.subregion;
    updated = true;
    console.log(`  ✓ Added subregion: ${regionData.subregion}`);
  }
  
  // Update tax data
  if (data.pos && data.pos.tax) {
    const taxInfo = regionData.tax;
    
    // Update tax type
    if (taxInfo.type && data.pos.tax.type !== taxInfo.type) {
      data.pos.tax.type = taxInfo.type;
      updated = true;
      console.log(`  ✓ Updated tax type to: ${taxInfo.type}`);
    }
    
    // Add type_local if different from type
    if (taxInfo.type_local && taxInfo.type_local !== taxInfo.type) {
      if (!data.pos.tax.type_local || data.pos.tax.type_local !== taxInfo.type_local) {
        data.pos.tax.type_local = taxInfo.type_local;
        updated = true;
        console.log(`  ✓ Added type_local: ${taxInfo.type_local}`);
      }
    }
    
    // Update tax rate
    if (taxInfo.rate) {
      if (taxInfo.rate.standard !== null && 
          data.pos.tax.rate.standard !== taxInfo.rate.standard) {
        data.pos.tax.rate.standard = taxInfo.rate.standard;
        updated = true;
        console.log(`  ✓ Updated standard tax rate to: ${(taxInfo.rate.standard * 100).toFixed(2)}%`);
      }
      
      // Add reduced rate if exists
      if (taxInfo.rate.reduced && !data.pos.tax.rate.reduced) {
        data.pos.tax.rate.reduced = taxInfo.rate.reduced;
        updated = true;
        console.log(`  ✓ Added reduced tax rate: ${(taxInfo.rate.reduced * 100).toFixed(2)}%`);
      }
      
      // Add tourism rate if exists
      if (taxInfo.rate.tourism && !data.pos.tax.rate.tourism) {
        data.pos.tax.rate.tourism = taxInfo.rate.tourism;
        updated = true;
        console.log(`  ✓ Added tourism tax rate: ${(taxInfo.rate.tourism * 100).toFixed(2)}%`);
      }
      
      // Add notes if exists
      if (taxInfo.rate.notes) {
        if (!data.pos.tax.rate.notes || data.pos.tax.rate.notes !== taxInfo.rate.notes) {
          data.pos.tax.rate.notes = taxInfo.rate.notes;
          updated = true;
          console.log('  ✓ Added tax rate notes');
        }
      }
    }
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
console.log('🚀 Updating Americas YAML files with quality improvements...\n');

const baseDir = path.join(__dirname, '../data/americas');
const regions = ['caribbean', 'central_america', 'north_america', 'south_america'];

let totalUpdated = 0;
let totalFiles = 0;

regions.forEach(region => {
  console.log(`\n📂 Processing ${region.replace('_', ' ').toUpperCase()}...`);
  
  const regionDir = path.join(baseDir, region);
  if (!fs.existsSync(regionDir)) {
    return;
  }
  
  const countries = fs.readdirSync(regionDir);
  
  countries.forEach(countryCode => {
    const countryDir = path.join(regionDir, countryCode);
    const yamlFile = path.join(countryDir, `${countryCode}.yaml`);
    
    if (!fs.existsSync(yamlFile)) {
      return;
    }
    
    totalFiles++;
    console.log(`\n${countryCode}:`);
    
    const wasUpdated = updateYAMLFile(yamlFile, region, countryCode);
    if (wasUpdated) {
      totalUpdated++;
    } else {
      console.log('  ℹ️  No changes needed');
    }
  });
});

console.log('\n\n✅ Complete!');
console.log(`   Files processed: ${totalFiles}`);
console.log(`   Files updated: ${totalUpdated}`);
