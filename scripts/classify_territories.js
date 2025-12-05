const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Find all YAML files
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

const dataDir = path.join(__dirname, '..', 'data');
const yamlFiles = findYamlFiles(dataDir);

const categories = {
  countries: [],
  autonomous_territories: [],
  overseas_territories: [],
  antarctica: []
};

for (const filePath of yamlFiles) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    if (!data || !data.iso_codes || !data.iso_codes.alpha2) continue;
    
    const code = data.iso_codes.alpha2;
    const name = data.name?.en || 'Unknown';
    const isOverseas = filePath.includes('/overseas/');
    const isRegion = filePath.includes('/regions/');
    const isAntarctica = filePath.includes('/antarctica/');
    
    const item = { code, name, path: filePath };
    
    if (isAntarctica) {
      categories.antarctica.push(item);
    } else if (isOverseas) {
      categories.overseas_territories.push(item);
    } else if (isRegion) {
      categories.autonomous_territories.push(item);
    } else {
      categories.countries.push(item);
    }
  } catch (error) {
    // Skip invalid files
  }
}

console.log('\n=== Classification Summary ===\n');
console.log(`Countries (主権国家): ${categories.countries.length}`);
console.log(`Autonomous Territories (自治領): ${categories.autonomous_territories.length}`);
console.log(`Overseas Territories (海外領): ${categories.overseas_territories.length}`);
console.log(`Antarctica (南極): ${categories.antarctica.length}`);
console.log(`\nTotal: ${categories.countries.length + categories.autonomous_territories.length + categories.overseas_territories.length + categories.antarctica.length}`);

console.log('\n=== Details ===\n');

console.log('Countries (主権国家):');
categories.countries.forEach(c => console.log(`  ${c.code} - ${c.name}`));

console.log('\nAutonomous Territories (自治領):');
categories.autonomous_territories.forEach(c => console.log(`  ${c.code} - ${c.name}`));

console.log('\nOverseas Territories (海外領):');
categories.overseas_territories.forEach(c => console.log(`  ${c.code} - ${c.name}`));

console.log('\nAntarctica (南極):');
categories.antarctica.forEach(c => console.log(`  ${c.code} - ${c.name}`));

