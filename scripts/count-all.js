const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function hasNestedField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  return true;
}

function findYamlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'libaddressinput' && file !== 'examples' && file !== 'cloud-address-book' && file !== 'pos') {
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
console.log(`Total YAML files found: ${yamlFiles.length}`);

let validCount = 0;
let invalidFiles = [];

for (const file of yamlFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = yaml.load(content);
    if (data && typeof data === 'object') {
      const hasBasic = hasNestedField(data, 'name.en') && hasNestedField(data, 'iso_codes.alpha2');
      if (hasBasic) {
        validCount++;
      } else {
        invalidFiles.push(file);
      }
    } else {
      invalidFiles.push(file);
    }
  } catch (error) {
    invalidFiles.push(file);
  }
}

console.log(`Valid country files: ${validCount}`);
console.log(`Invalid/skipped files: ${invalidFiles.length}`);
if (invalidFiles.length > 0 && invalidFiles.length < 60) {
  console.log('\nSkipped files:');
  invalidFiles.forEach(f => console.log(`  ${path.relative(dataDir, f)}`));
}
