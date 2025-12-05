/**
 * Package OCR Example - Basic Usage
 * 荷物ラベルOCRの基本的な使用例
 */

import { PackageOCR } from '@vey/package-ocr';
import fs from 'fs';

// Initialize OCR engine
const ocr = new PackageOCR({
  language: 'auto',
  engine: 'google-vision',
  apiKey: process.env.GOOGLE_VISION_API_KEY
});

/**
 * Basic label scanning example
 * 基本的なラベルスキャンの例
 */
async function basicScan() {
  console.log('=== Basic Package Label Scanning ===\n');
  
  // Read package label image
  const labelImage = fs.readFileSync('./examples/data/package-label-jp.jpg');
  
  // Scan the label
  const result = await ocr.scan(labelImage);
  
  console.log('Scan Result:');
  console.log('Success:', result.success);
  console.log('Confidence:', result.confidence);
  console.log('Language:', result.language);
  console.log('\nRaw Text:');
  console.log(result.rawText);
  console.log('\nParsed Address:');
  console.log(JSON.stringify(result.address, null, 2));
  console.log('\nPID:', result.pid);
  console.log('Processing Time:', result.processingTime, 'seconds\n');
}

/**
 * Multi-language label scanning
 * 多言語ラベルスキャン
 */
async function multiLanguageScan() {
  console.log('=== Multi-language Label Scanning ===\n');
  
  const languages = [
    { file: 'package-label-jp.jpg', name: 'Japanese' },
    { file: 'package-label-cn.jpg', name: 'Chinese' },
    { file: 'package-label-ar.jpg', name: 'Arabic' },
    { file: 'package-label-th.jpg', name: 'Thai' }
  ];
  
  for (const lang of languages) {
    console.log(`Scanning ${lang.name} label...`);
    
    try {
      const image = fs.readFileSync(`./examples/data/${lang.file}`);
      const result = await ocr.scan(image);
      
      console.log(`✓ ${lang.name}: ${result.address.country} - ${result.pid}`);
      console.log(`  Confidence: ${result.confidence}`);
    } catch (error) {
      console.log(`✗ ${lang.name}: Failed - ${error.message}`);
    }
    console.log('');
  }
}

/**
 * Return label scanning
 * 返送ラベルスキャン
 */
async function returnLabelScan() {
  console.log('=== Return Label Scanning ===\n');
  
  const returnLabel = fs.readFileSync('./examples/data/return-label.jpg');
  const result = await ocr.scanReturnLabel(returnLabel);
  
  console.log('Destination:');
  console.log('  Address:', result.destination.address.addressLine1);
  console.log('  PID:', result.destination.pid);
  console.log('\nReturn Address:');
  console.log('  Address:', result.returnAddress.address.addressLine1);
  console.log('  PID:', result.returnAddress.pid);
  console.log('\nConfidence:', result.confidence);
  console.log('');
}

/**
 * Batch processing example
 * バッチ処理の例
 */
async function batchScan() {
  console.log('=== Batch Label Scanning ===\n');
  
  // Read multiple label images
  const labels = [
    fs.readFileSync('./examples/data/package-1.jpg'),
    fs.readFileSync('./examples/data/package-2.jpg'),
    fs.readFileSync('./examples/data/package-3.jpg'),
    fs.readFileSync('./examples/data/package-4.jpg'),
    fs.readFileSync('./examples/data/package-5.jpg')
  ];
  
  console.log(`Processing ${labels.length} labels...`);
  const startTime = Date.now();
  
  const results = await ocr.scanBatch(labels, {
    parallel: true,
    maxConcurrent: 3,
    continueOnError: true
  });
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  
  console.log(`\nProcessed ${results.length} labels in ${totalTime}s`);
  console.log(`Average time per label: ${(totalTime / results.length).toFixed(2)}s\n`);
  
  // Display results
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`Label ${index + 1}: ✓ ${result.pid} (${result.confidence.toFixed(2)})`);
    } else {
      console.log(`Label ${index + 1}: ✗ Failed - ${result.errors.join(', ')}`);
    }
  });
  console.log('');
}

/**
 * Error handling example
 * エラーハンドリングの例
 */
async function errorHandling() {
  console.log('=== Error Handling Example ===\n');
  
  try {
    // Low quality image
    const poorQualityImage = fs.readFileSync('./examples/data/poor-quality.jpg');
    const result = await ocr.scan(poorQualityImage);
    
    if (!result.success) {
      console.log('OCR failed:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    } else if (result.confidence < 0.9) {
      console.log(`⚠ Low confidence (${result.confidence})`);
      console.log('Recommend manual verification');
      console.log('Detected address:', result.address.addressLine1);
    } else {
      console.log('✓ OCR successful');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
  console.log('');
}

/**
 * VeyExpress integration example
 * VeyExpress統合の例
 */
async function veyExpressIntegration() {
  console.log('=== VeyExpress Integration ===\n');
  
  // Simulate VeyExpress integration
  const labelImage = fs.readFileSync('./examples/data/package-label-jp.jpg');
  
  // 1. Scan label
  console.log('1. Scanning package label...');
  const ocrResult = await ocr.scan(labelImage);
  console.log(`   ✓ Label scanned: ${ocrResult.pid}`);
  
  // 2. Generate waybill (simulated)
  console.log('2. Generating waybill...');
  const waybill = {
    id: 'WB-' + Date.now(),
    destination: ocrResult.address,
    pid: ocrResult.pid,
    carrier: 'Yamato',
    service: 'Standard'
  };
  console.log(`   ✓ Waybill generated: ${waybill.id}`);
  
  // 3. Calculate shipping cost (simulated)
  console.log('3. Calculating shipping cost...');
  const shippingCost = {
    price: 850,
    currency: 'JPY',
    estimatedDelivery: '2024-12-07'
  };
  console.log(`   ✓ Cost: ¥${shippingCost.price}`);
  console.log(`   ✓ Delivery: ${shippingCost.estimatedDelivery}`);
  
  console.log('\nWaybill created successfully!\n');
}

/**
 * Main function
 */
async function main() {
  try {
    await basicScan();
    await multiLanguageScan();
    await returnLabelScan();
    await batchScan();
    await errorHandling();
    await veyExpressIntegration();
    
    console.log('=== All examples completed successfully! ===');
  } catch (error) {
    console.error('Error running examples:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

export {
  basicScan,
  multiLanguageScan,
  returnLabelScan,
  batchScan,
  errorHandling,
  veyExpressIntegration
};
