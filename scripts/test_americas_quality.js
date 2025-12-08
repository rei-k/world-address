#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

console.log('🧪 Testing Americas Data Quality Improvements...\n');

const baseDir = '/home/runner/work/world-address/world-address/data/americas';
const regions = ['caribbean', 'central_america', 'north_america', 'south_america'];

let totalCountries = 0;
let withTaxRates = 0;
let withLocalTaxType = 0;
let withSubregion = 0;
let withEnhancedPayments = 0;
let issuesFound = [];

regions.forEach(region => {
  const regionDir = path.join(baseDir, region);
  if (!fs.existsSync(regionDir)) return;
  
  const countries = fs.readdirSync(regionDir);
  
  countries.forEach(countryCode => {
    const yamlFile = path.join(regionDir, countryCode, `${countryCode}.yaml`);
    if (!fs.existsSync(yamlFile)) return;
    
    totalCountries++;
    const data = yaml.load(fs.readFileSync(yamlFile, 'utf8'));
    
    // Check tax rate
    if (data.pos && data.pos.tax && data.pos.tax.rate) {
      if (data.pos.tax.rate.standard !== null || data.pos.tax.rate.notes) {
        withTaxRates++;
      } else {
        issuesFound.push(`${countryCode}: Missing tax rate`);
      }
      
      // Check for local tax type
      if (data.pos.tax.type_local) {
        withLocalTaxType++;
      }
    }
    
    // Check subregion
    if (data.subregion) {
      withSubregion++;
    }
    
    // Check payment methods (more than 2 = enhanced)
    if (data.pos && data.pos.payment_methods && data.pos.payment_methods.length > 2) {
      withEnhancedPayments++;
    }
  });
});

console.log('📊 Quality Metrics:');
console.log('─'.repeat(50));
console.log(`Total Countries: ${totalCountries}`);
console.log(`Countries with Tax Rates: ${withTaxRates} (${Math.round(withTaxRates/totalCountries*100)}%)`);
console.log(`Countries with Local Tax Type: ${withLocalTaxType} (${Math.round(withLocalTaxType/totalCountries*100)}%)`);
console.log(`Countries with Subregion: ${withSubregion} (${Math.round(withSubregion/totalCountries*100)}%)`);
console.log(`Countries with Enhanced Payments: ${withEnhancedPayments} (${Math.round(withEnhancedPayments/totalCountries*100)}%)`);
console.log('─'.repeat(50));

if (issuesFound.length > 0) {
  console.log('\n⚠️  Issues Found:');
  issuesFound.forEach(issue => console.log(`  - ${issue}`));
} else {
  console.log('\n✅ No issues found!');
}

// Test specific improvements
console.log('\n🎯 Specific Test Cases:');

// Test 1: Brazil should have Pix
const brData = yaml.load(fs.readFileSync(path.join(baseDir, 'south_america/BR/BR.yaml'), 'utf8'));
const hasPix = brData.pos.payment_methods.some(m => m.name === 'Pix');
console.log(`  Brazil has Pix: ${hasPix ? '✅' : '❌'}`);

// Test 2: Costa Rica should have 13% IVA
const crData = yaml.load(fs.readFileSync(path.join(baseDir, 'central_america/CR/CR.yaml'), 'utf8'));
const hasCorrectTax = crData.pos.tax.type === 'IVA' && crData.pos.tax.rate.standard === 0.13;
console.log(`  Costa Rica has 13% IVA: ${hasCorrectTax ? '✅' : '❌'}`);

// Test 3: Central America should have subregion
const hasSubregion = crData.subregion === 'Central America';
console.log(`  Costa Rica has subregion: ${hasSubregion ? '✅' : '❌'}`);

// Test 4: Dominican Republic should have ITBIS
const doData = yaml.load(fs.readFileSync(path.join(baseDir, 'caribbean/DO/DO.yaml'), 'utf8'));
const hasITBIS = doData.pos.tax.type === 'ITBIS' && doData.pos.tax.rate.standard === 0.18;
console.log(`  Dominican Republic has 18% ITBIS: ${hasITBIS ? '✅' : '❌'}`);

// Test 5: Colombia should have reduced rate
const coData = yaml.load(fs.readFileSync(path.join(baseDir, 'south_america/CO/CO.yaml'), 'utf8'));
const hasReducedRate = coData.pos.tax.rate.reduced === 0.05;
console.log(`  Colombia has 5% reduced rate: ${hasReducedRate ? '✅' : '❌'}`);

console.log('\n✨ Quality improvement test complete!\n');

// Return exit code based on critical issues
process.exit(issuesFound.length > 0 ? 1 : 0);
