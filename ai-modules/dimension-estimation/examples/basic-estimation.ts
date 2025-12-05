/**
 * Dimension Estimation Example - Basic Usage
 * 寸法・重量推定の基本的な使用例
 */

import { DimensionEstimator, mapToVeyLockerBox, calculateShippingCost } from '@vey/dimension-estimation';
import fs from 'fs';

// Initialize estimator
const estimator = new DimensionEstimator({
  calibrationMethod: 'reference-object',
  weightModel: 'ml-regression',
  unit: 'metric'
});

/**
 * Basic dimension estimation
 * 基本的な寸法推定
 */
async function basicEstimation() {
  console.log('=== Basic Dimension Estimation ===\n');
  
  // Read package image
  const packageImage = fs.readFileSync('./examples/data/package-1.jpg');
  
  // Estimate dimensions
  const result = await estimator.estimate(packageImage);
  
  console.log('Estimation Result:');
  console.log('\nDimensions:');
  console.log(`  Length: ${result.dimensions.length} cm`);
  console.log(`  Width: ${result.dimensions.width} cm`);
  console.log(`  Height: ${result.dimensions.height} cm`);
  console.log(`  Volume: ${result.volume} liters`);
  console.log('\nWeight:');
  console.log(`  Estimated: ${result.weight.estimated} kg`);
  console.log(`  Confidence: ${result.weight.confidence}`);
  console.log('\nVeyLocker Box: ', result.veyLockerBox);
  console.log('\nShipping Cost:');
  console.log(`  Carrier: ${result.shippingCost.carrier}`);
  console.log(`  Price: ¥${result.shippingCost.price}`);
  console.log(`\nOverall Confidence: ${result.confidence}`);
  console.log(`Processing Time: ${result.processingTime}s\n`);
}

/**
 * Estimation with reference object
 * 参照物体を使用した推定
 */
async function estimationWithReference() {
  console.log('=== Estimation with Reference Object ===\n');
  
  const packageImage = fs.readFileSync('./examples/data/package-with-a4.jpg');
  
  // Use A4 paper as reference object
  const result = await estimator.estimate(packageImage, {
    referenceObject: {
      type: 'a4-paper',
      dimensions: {
        length: 29.7,
        width: 21.0
      }
    }
  });
  
  console.log('With A4 paper reference:');
  console.log(`  Dimensions: ${result.dimensions.length} × ${result.dimensions.width} × ${result.dimensions.height} cm`);
  console.log(`  Confidence: ${result.confidence} (improved!)`);
  console.log(`  Weight: ${result.weight.estimated} kg\n`);
}

/**
 * VeyLocker box mapping
 * VeyLockerボックスマッピング
 */
async function veyLockerMapping() {
  console.log('=== VeyLocker Box Mapping ===\n');
  
  const packages = [
    { name: 'Small Package', dims: { length: 25, width: 18, height: 12 } },
    { name: 'Medium Package', dims: { length: 35, width: 28, height: 20 } },
    { name: 'Large Package', dims: { length: 55, width: 38, height: 35 } },
    { name: 'XL Package', dims: { length: 75, width: 55, height: 55 } }
  ];
  
  for (const pkg of packages) {
    const mapping = mapToVeyLockerBox(pkg.dims);
    
    console.log(`${pkg.name}:`);
    console.log(`  Dimensions: ${pkg.dims.length} × ${pkg.dims.width} × ${pkg.dims.height} cm`);
    console.log(`  Recommended Box: ${mapping.recommendedBox}`);
    console.log(`  Utilization: ${(mapping.utilization * 100).toFixed(1)}%`);
    console.log(`  Price: ¥${mapping.pricing.basePrice}`);
    
    if (mapping.alternatives.length > 0) {
      console.log(`  Alternatives: ${mapping.alternatives.join(', ')}`);
    }
    console.log('');
  }
}

/**
 * Shipping cost calculation
 * 配送料金の計算
 */
async function shippingCostCalculation() {
  console.log('=== Shipping Cost Calculation ===\n');
  
  const packageImage = fs.readFileSync('./examples/data/package-1.jpg');
  const estimation = await estimator.estimate(packageImage);
  
  // Calculate shipping cost to different destinations
  const destinations = [
    { name: 'Same City', postalCode: '100-0001' },
    { name: 'Different City', postalCode: '530-0001' },
    { name: 'Rural Area', postalCode: '900-0001' }
  ];
  
  console.log(`Package: ${estimation.dimensions.length} × ${estimation.dimensions.width} × ${estimation.dimensions.height} cm, ${estimation.weight.estimated} kg\n`);
  
  for (const dest of destinations) {
    const cost = await calculateShippingCost({
      dimensions: estimation.dimensions,
      weight: estimation.weight.estimated,
      origin: { country: 'JP', postalCode: '150-0001' },
      destination: { country: 'JP', postalCode: dest.postalCode },
      carrier: 'auto'
    });
    
    console.log(`${dest.name}:`);
    console.log(`  Carrier: ${cost.carrier}`);
    console.log(`  Service: ${cost.service}`);
    console.log(`  Price: ¥${cost.price}`);
    console.log(`  Delivery: ${cost.estimatedDelivery}`);
    console.log('');
  }
}

/**
 * Batch estimation
 * バッチ推定
 */
async function batchEstimation() {
  console.log('=== Batch Dimension Estimation ===\n');
  
  const packages = [
    fs.readFileSync('./examples/data/package-1.jpg'),
    fs.readFileSync('./examples/data/package-2.jpg'),
    fs.readFileSync('./examples/data/package-3.jpg'),
    fs.readFileSync('./examples/data/package-4.jpg')
  ];
  
  console.log(`Estimating ${packages.length} packages...`);
  const startTime = Date.now();
  
  const results = await estimator.estimateBatch(packages, {
    parallel: true,
    maxConcurrent: 2
  });
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  
  console.log(`\nProcessed ${results.length} packages in ${totalTime}s`);
  console.log(`Average time: ${(totalTime / results.length).toFixed(2)}s per package\n`);
  
  // Summary
  let totalWeight = 0;
  let totalCost = 0;
  
  results.forEach((result, index) => {
    console.log(`Package ${index + 1}:`);
    console.log(`  Size: ${result.dimensions.length} × ${result.dimensions.width} × ${result.dimensions.height} cm`);
    console.log(`  Weight: ${result.weight.estimated} kg`);
    console.log(`  Box: ${result.veyLockerBox}`);
    console.log(`  Cost: ¥${result.shippingCost.price}`);
    
    totalWeight += result.weight.estimated;
    totalCost += result.shippingCost.price;
  });
  
  console.log(`\nTotal Weight: ${totalWeight.toFixed(1)} kg`);
  console.log(`Total Cost: ¥${totalCost}\n`);
}

/**
 * VeyLocker integration example
 * VeyLocker統合の例
 */
async function veyLockerIntegration() {
  console.log('=== VeyLocker Integration Example ===\n');
  
  const packageImage = fs.readFileSync('./examples/data/package-1.jpg');
  
  // 1. Estimate dimensions
  console.log('1. Estimating package dimensions...');
  const estimation = await estimator.estimate(packageImage);
  console.log(`   ✓ Dimensions: ${estimation.dimensions.length} × ${estimation.dimensions.width} × ${estimation.dimensions.height} cm`);
  console.log(`   ✓ Weight: ${estimation.weight.estimated} kg`);
  
  // 2. Map to VeyLocker box
  console.log('2. Finding suitable VeyLocker box...');
  const boxMapping = mapToVeyLockerBox(estimation.dimensions);
  console.log(`   ✓ Recommended box: ${boxMapping.recommendedBox}`);
  console.log(`   ✓ Space utilization: ${(boxMapping.utilization * 100).toFixed(1)}%`);
  
  // 3. Check availability (simulated)
  console.log('3. Checking box availability...');
  const available = Math.random() > 0.3; // Simulate availability
  if (available) {
    console.log(`   ✓ Box ${boxMapping.recommendedBox} is available`);
    console.log(`   ✓ Location: Tokyo Shibuya Station`);
    console.log(`   ✓ Price: ¥${boxMapping.pricing.basePrice}`);
  } else {
    console.log(`   ✗ Box ${boxMapping.recommendedBox} is not available`);
    if (boxMapping.alternatives.length > 0) {
      console.log(`   ℹ Alternative: ${boxMapping.alternatives[0]}`);
    }
  }
  
  // 4. Calculate total cost
  console.log('4. Calculating total cost...');
  const storageCost = boxMapping.pricing.basePrice;
  const shippingCost = estimation.shippingCost.price;
  const totalCost = storageCost + shippingCost;
  console.log(`   Storage: ¥${storageCost}`);
  console.log(`   Shipping: ¥${shippingCost}`);
  console.log(`   Total: ¥${totalCost}`);
  
  console.log('\nVeyLocker reservation ready!\n');
}

/**
 * Main function
 */
async function main() {
  try {
    await basicEstimation();
    await estimationWithReference();
    await veyLockerMapping();
    await shippingCostCalculation();
    await batchEstimation();
    await veyLockerIntegration();
    
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
  basicEstimation,
  estimationWithReference,
  veyLockerMapping,
  shippingCostCalculation,
  batchEstimation,
  veyLockerIntegration
};
