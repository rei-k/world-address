const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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

function hasNestedField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  return true;
}

function calculateCompleteness(data) {
  let presentFields = 0;
  const missing = [];
  for (const field of FULL_SCHEMA_FIELDS) {
    if (hasNestedField(data, field)) {
      presentFields++;
    } else {
      missing.push(field);
    }
  }
  return {
    percentage: (presentFields / FULL_SCHEMA_FIELDS.length) * 100,
    missing,
  };
}

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

const dataDir = path.join(process.cwd(), 'data');
const yamlFiles = findYamlFiles(dataDir);

const partial = [];
for (const file of yamlFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = yaml.load(content);
    if (data && data.iso_codes?.alpha2) {
      const result = calculateCompleteness(data);
      if (result.percentage < 80) {
        partial.push({
          file: file.replace(process.cwd() + '/', ''),
          code: data.iso_codes.alpha2,
          name: data.name?.en || 'Unknown',
          completeness: Math.round(result.percentage),
          missing: result.missing,
        });
      }
    }
  } catch (e) {
    // Ignore errors when reading files
  }
}

console.log('Countries with <80% completeness:');
partial.forEach(p => {
  console.log(`\n${p.code} - ${p.name} (${p.completeness}%)`);
  console.log(`  File: ${p.file}`);
  console.log(`  Missing: ${p.missing.join(', ')}`);
});
console.log(`\nTotal: ${partial.length} countries`);
