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
  'data/americas/caribbean/KN/KN.yaml',
  'data/americas/caribbean/TT/TT.yaml',
  'data/americas/caribbean/VC/VC.yaml',
  'data/americas/central_america/BZ/BZ.yaml',
  'data/africa/southern_africa/ZA/ZA.yaml',
  'data/africa/southern_africa/LS/LS.yaml',
  'data/africa/southern_africa/NA/NA.yaml',
];

files.forEach(file => {
  try {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    const present = FULL_SCHEMA_FIELDS.filter(f => hasNestedField(data, f)).length;
    const pct = Math.round((present / FULL_SCHEMA_FIELDS.length) * 100);
    
    const missing = FULL_SCHEMA_FIELDS.filter(f => !hasNestedField(data, f));
    
    console.log(`${data.iso_codes.alpha2} - ${data.name.en} (${pct}%): Missing: ${missing.join(', ')}`);
  } catch (e) {
    console.log(`Error reading ${file}: ${e.message}`);
  }
});
