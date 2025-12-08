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
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  
  return true;
}

const files = [
  'data/americas/caribbean/JM/JM.yaml',
  'data/americas/caribbean/AG/AG.yaml',
  'data/americas/caribbean/BB/BB.yaml',
  'data/americas/caribbean/LC/LC.yaml',
];

files.forEach(file => {
  const data = yaml.load(fs.readFileSync(file, 'utf8'));
  console.log(`\n${path.basename(file)} (${data.name.en}):`);
  
  FULL_SCHEMA_FIELDS.forEach(field => {
    const has = hasNestedField(data, field);
    console.log(`  ${field}: ${has ? '✓' : '✗'}`);
  });
  
  const present = FULL_SCHEMA_FIELDS.filter(f => hasNestedField(data, f)).length;
  const pct = Math.round((present / FULL_SCHEMA_FIELDS.length) * 100);
  console.log(`  Completeness: ${pct}%`);
});
