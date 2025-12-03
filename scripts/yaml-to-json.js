const fs = require('fs');
const yaml = require('js-yaml');

const files = [
  'data/africa/southern_africa/SZ/SZ.yaml',
  'data/americas/central_america/CR/CR.yaml',
  'data/americas/central_america/GT/GT.yaml',
  'data/americas/central_america/HN/HN.yaml',
  'data/americas/central_america/NI/NI.yaml',
  'data/americas/central_america/PA/PA.yaml',
  'data/americas/central_america/SV/SV.yaml'
];

files.forEach(yamlFile => {
  const jsonFile = yamlFile.replace('.yaml', '.json');
  const yamlContent = fs.readFileSync(yamlFile, 'utf8');
  const data = yaml.load(yamlContent);
  fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✅ Converted ${yamlFile} -> ${jsonFile}`);
});
