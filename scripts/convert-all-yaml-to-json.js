#!/usr/bin/env node

/**
 * Script to convert all YAML files to JSON format
 * 
 * This script finds all YAML files in the data directory and creates
 * corresponding JSON files.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Recursively find all YAML files in a directory
 */
function findYAMLFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip certain directories
      if (!['libaddressinput', 'node_modules', '.git'].includes(file)) {
        findYAMLFiles(filePath, fileList);
      }
    } else if (file.endsWith('.yaml')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Convert YAML file to JSON
 */
function convertYAMLToJSON(yamlPath) {
  try {
    const jsonPath = yamlPath.replace('.yaml', '.json');
    
    // Read YAML file
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const data = yaml.load(yamlContent);
    
    // Write JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    
    return true;
  } catch (error) {
    console.error(`Error converting ${yamlPath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  
  console.log('🔄 Converting all YAML files to JSON...\n');

  // Find all YAML files
  const yamlFiles = findYAMLFiles(dataDir);
  console.log(`Found ${yamlFiles.length} YAML files\n`);

  let successCount = 0;
  let errorCount = 0;

  // Convert each file
  yamlFiles.forEach(file => {
    if (convertYAMLToJSON(file)) {
      successCount++;
      console.log(`✓ ${path.relative(dataDir, file)}`);
    } else {
      errorCount++;
    }
  });

  console.log('\n✅ Conversion complete!');
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors:  ${errorCount}`);
  console.log(`   Total:   ${yamlFiles.length}`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { convertYAMLToJSON };
