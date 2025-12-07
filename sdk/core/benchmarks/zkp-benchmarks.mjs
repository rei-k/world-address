#!/usr/bin/env node

/**
 * ZKP Performance Benchmarks
 * 
 * Comprehensive benchmark suite for all 5 ZKP patterns in the World Address protocol.
 * Measures proof generation time, verification time, and memory usage.
 * Provides statistical analysis (avg, min, max, p50, p95, p99).
 */

import { performance } from 'node:perf_hooks';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Import ZKP functions from the SDK
const {
  createZKCircuit,
  generateZKMembershipProof,
  verifyZKMembershipProof,
  generateZKStructureProof,
  verifyZKStructureProof,
  generateZKSelectiveRevealProof,
  verifyZKSelectiveRevealProof,
  generateZKVersionProof,
  verifyZKVersionProof,
  generateZKLockerProof,
  verifyZKLockerProof,
} = require('../dist/index.js');

// ============================================================================
// Benchmark Utilities
// ============================================================================

class BenchmarkRunner {
  constructor(name) {
    this.name = name;
    this.measurements = [];
  }

  /**
   * Runs a benchmark function multiple times and collects measurements
   * @param {Function} fn - Function to benchmark
   * @param {number} iterations - Number of iterations
   * @returns {Object} Statistics
   */
  async run(fn, iterations = 100) {
    console.log(`\n📊 Running: ${this.name} (${iterations} iterations)`);
    const measurements = [];
    const memoryBefore = process.memoryUsage();

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      measurements.push(end - start);

      if ((i + 1) % 10 === 0) {
        process.stdout.write(`\r  Progress: ${i + 1}/${iterations}`);
      }
    }

    const memoryAfter = process.memoryUsage();
    const memoryDelta = {
      heapUsed: (memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024,
      external: (memoryAfter.external - memoryBefore.external) / 1024 / 1024,
    };

    process.stdout.write('\r  Progress: Complete       \n');

    this.measurements = measurements;
    return this.calculateStats(measurements, memoryDelta);
  }

  /**
   * Calculates statistical measures from measurements
   */
  calculateStats(measurements, memoryDelta) {
    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = measurements.reduce((acc, val) => acc + val, 0);

    const stats = {
      avg: sum / measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(measurements.length * 0.5)],
      p95: sorted[Math.floor(measurements.length * 0.95)],
      p99: sorted[Math.floor(measurements.length * 0.99)],
      count: measurements.length,
      memoryDelta,
    };

    return stats;
  }

  /**
   * Prints benchmark results
   */
  printResults(stats) {
    console.log(`\n  Results for ${this.name}:`);
    console.log(`    Average:    ${stats.avg.toFixed(3)} ms`);
    console.log(`    Min:        ${stats.min.toFixed(3)} ms`);
    console.log(`    Max:        ${stats.max.toFixed(3)} ms`);
    console.log(`    P50:        ${stats.p50.toFixed(3)} ms`);
    console.log(`    P95:        ${stats.p95.toFixed(3)} ms`);
    console.log(`    P99:        ${stats.p99.toFixed(3)} ms`);
    console.log(`    Iterations: ${stats.count}`);
    console.log(`    Memory (Heap): ${stats.memoryDelta.heapUsed.toFixed(2)} MB`);
    console.log(`    Memory (External): ${stats.memoryDelta.external.toFixed(2)} MB`);
  }
}

// ============================================================================
// Test Data Generation
// ============================================================================

function generateTestPIDs(count = 1000) {
  const pids = [];
  const countries = ['JP', 'US', 'GB', 'DE', 'FR', 'CA', 'AU', 'KR', 'CN', 'IN'];
  
  for (let i = 0; i < count; i++) {
    const country = countries[i % countries.length];
    const admin1 = String(i % 50).padStart(2, '0');
    const admin2 = String(i % 100).padStart(3, '0');
    const admin3 = String(i % 20).padStart(2, '0');
    pids.push(`${country}-${admin1}-${admin2}-${admin3}`);
  }
  
  return pids;
}

function generateTestAddress() {
  return {
    country: 'JP',
    province: '13',
    city: 'Shibuya',
    postal_code: '150-0001',
    street_address: '1-1-1 Test Street',
    building: 'Test Building',
    room: '101',
  };
}

function generateLockerIDs(count = 200) {
  const lockers = [];
  for (let i = 0; i < count; i++) {
    lockers.push(`LOCKER-${String.fromCharCode(65 + (i / 100) | 0)}-${String(i % 100).padStart(3, '0')}`);
  }
  return lockers;
}

// ============================================================================
// Pattern 1: ZK-Membership Benchmarks
// ============================================================================

async function benchmarkZKMembership(iterations = 100) {
  const circuit = createZKCircuit('zkp-membership-v1', 'ZK-Membership Circuit');
  const validPIDs = generateTestPIDs(1000);
  const testPID = validPIDs[42]; // Pick one from the set

  // Benchmark proof generation
  const genBenchmark = new BenchmarkRunner('ZK-Membership: Proof Generation');
  const genStats = await genBenchmark.run(() => {
    generateZKMembershipProof(testPID, validPIDs, circuit);
  }, iterations);
  genBenchmark.printResults(genStats);

  // Generate a proof for verification benchmark
  const proof = generateZKMembershipProof(testPID, validPIDs, circuit);

  // Benchmark verification
  const verifyBenchmark = new BenchmarkRunner('ZK-Membership: Verification');
  const verifyStats = await verifyBenchmark.run(() => {
    verifyZKMembershipProof(proof, circuit, proof.merkleRoot);
  }, iterations);
  verifyBenchmark.printResults(verifyStats);

  return { generation: genStats, verification: verifyStats };
}

// ============================================================================
// Pattern 2: ZK-Structure Benchmarks
// ============================================================================

async function benchmarkZKStructure(iterations = 100) {
  const circuit = createZKCircuit('zkp-structure-v1', 'ZK-Structure Circuit');
  const testPID = 'JP-13-113-01-T07-B12-BN02-R342';
  const countryCode = 'JP';
  const hierarchyDepth = 8;

  // Benchmark proof generation
  const genBenchmark = new BenchmarkRunner('ZK-Structure: Proof Generation');
  const genStats = await genBenchmark.run(() => {
    generateZKStructureProof(testPID, countryCode, hierarchyDepth, circuit);
  }, iterations);
  genBenchmark.printResults(genStats);

  // Generate a proof for verification benchmark
  const proof = generateZKStructureProof(testPID, countryCode, hierarchyDepth, circuit);

  // Benchmark verification
  const verifyBenchmark = new BenchmarkRunner('ZK-Structure: Verification');
  const verifyStats = await verifyBenchmark.run(() => {
    verifyZKStructureProof(proof, circuit, countryCode);
  }, iterations);
  verifyBenchmark.printResults(verifyStats);

  return { generation: genStats, verification: verifyStats };
}

// ============================================================================
// Pattern 3: ZK-Selective Reveal Benchmarks
// ============================================================================

async function benchmarkZKSelectiveReveal(iterations = 100) {
  const circuit = createZKCircuit('zkp-selective-v1', 'ZK-Selective Reveal Circuit');
  const testPID = 'JP-13-113-01';
  const fullAddress = generateTestAddress();
  const fieldsToReveal = ['country', 'postal_code'];

  // Benchmark proof generation
  const genBenchmark = new BenchmarkRunner('ZK-Selective Reveal: Proof Generation');
  const genStats = await genBenchmark.run(() => {
    generateZKSelectiveRevealProof(testPID, fullAddress, fieldsToReveal, circuit);
  }, iterations);
  genBenchmark.printResults(genStats);

  // Generate a proof for verification benchmark
  const proof = generateZKSelectiveRevealProof(testPID, fullAddress, fieldsToReveal, circuit);

  // Benchmark verification
  const verifyBenchmark = new BenchmarkRunner('ZK-Selective Reveal: Verification');
  const verifyStats = await verifyBenchmark.run(() => {
    verifyZKSelectiveRevealProof(proof, circuit);
  }, iterations);
  verifyBenchmark.printResults(verifyStats);

  return { generation: genStats, verification: verifyStats };
}

// ============================================================================
// Pattern 4: ZK-Version Benchmarks
// ============================================================================

async function benchmarkZKVersion(iterations = 100) {
  const circuit = createZKCircuit('zkp-version-v1', 'ZK-Version Circuit');
  const oldPID = 'JP-13-113-01-T07-B12';
  const newPID = 'JP-14-201-05-T03-B08';
  const userDID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';

  // Benchmark proof generation
  const genBenchmark = new BenchmarkRunner('ZK-Version: Proof Generation');
  const genStats = await genBenchmark.run(() => {
    generateZKVersionProof(oldPID, newPID, userDID, circuit);
  }, iterations);
  genBenchmark.printResults(genStats);

  // Generate a proof for verification benchmark
  const proof = generateZKVersionProof(oldPID, newPID, userDID, circuit);

  // Benchmark verification
  const verifyBenchmark = new BenchmarkRunner('ZK-Version: Verification');
  const verifyStats = await verifyBenchmark.run(() => {
    verifyZKVersionProof(proof, circuit);
  }, iterations);
  verifyBenchmark.printResults(verifyStats);

  return { generation: genStats, verification: verifyStats };
}

// ============================================================================
// Pattern 5: ZK-Locker Benchmarks
// ============================================================================

async function benchmarkZKLocker(iterations = 100) {
  const circuit = createZKCircuit('zkp-locker-v1', 'ZK-Locker Circuit');
  const availableLockers = generateLockerIDs(200);
  const lockerId = availableLockers[42];
  const facilityId = 'FACILITY-SHIBUYA-STATION';
  const zone = 'KANTO-TOKYO-SHIBUYA';

  // Benchmark proof generation
  const genBenchmark = new BenchmarkRunner('ZK-Locker: Proof Generation');
  const genStats = await genBenchmark.run(() => {
    generateZKLockerProof(lockerId, facilityId, availableLockers, circuit, zone);
  }, iterations);
  genBenchmark.printResults(genStats);

  // Generate a proof for verification benchmark
  const proof = generateZKLockerProof(lockerId, facilityId, availableLockers, circuit, zone);

  // Benchmark verification
  const verifyBenchmark = new BenchmarkRunner('ZK-Locker: Verification');
  const verifyStats = await verifyBenchmark.run(() => {
    verifyZKLockerProof(proof, circuit, facilityId);
  }, iterations);
  verifyBenchmark.printResults(verifyStats);

  return { generation: genStats, verification: verifyStats };
}

// ============================================================================
// Main Benchmark Suite
// ============================================================================

async function runAllBenchmarks() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  ZKP Performance Benchmarks - World Address Protocol        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\nRunning comprehensive benchmarks for all 5 ZKP patterns...\n');

  const iterations = parseInt(process.env.BENCHMARK_ITERATIONS || '100', 10);
  const results = {};

  try {
    // Pattern 1: ZK-Membership
    console.log('\n━━━ Pattern 1: ZK-Membership ━━━');
    results.membership = await benchmarkZKMembership(iterations);

    // Pattern 2: ZK-Structure
    console.log('\n━━━ Pattern 2: ZK-Structure ━━━');
    results.structure = await benchmarkZKStructure(iterations);

    // Pattern 3: ZK-Selective Reveal
    console.log('\n━━━ Pattern 3: ZK-Selective Reveal ━━━');
    results.selectiveReveal = await benchmarkZKSelectiveReveal(iterations);

    // Pattern 4: ZK-Version
    console.log('\n━━━ Pattern 4: ZK-Version ━━━');
    results.version = await benchmarkZKVersion(iterations);

    // Pattern 5: ZK-Locker
    console.log('\n━━━ Pattern 5: ZK-Locker ━━━');
    results.locker = await benchmarkZKLocker(iterations);

    // Summary
    printSummary(results);

  } catch (error) {
    console.error('\n❌ Benchmark error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function printSummary(results) {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    BENCHMARK SUMMARY                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const patterns = [
    { name: 'ZK-Membership', key: 'membership' },
    { name: 'ZK-Structure', key: 'structure' },
    { name: 'ZK-Selective Reveal', key: 'selectiveReveal' },
    { name: 'ZK-Version', key: 'version' },
    { name: 'ZK-Locker', key: 'locker' },
  ];

  console.log('\n📊 Proof Generation Performance:');
  console.log('┌─────────────────────────┬────────┬────────┬────────┬────────┬────────┐');
  console.log('│ Pattern                 │  Avg   │  Min   │  Max   │  P95   │  P99   │');
  console.log('├─────────────────────────┼────────┼────────┼────────┼────────┼────────┤');
  
  patterns.forEach(({ name, key }) => {
    const stats = results[key].generation;
    console.log(
      `│ ${name.padEnd(23)} │ ${stats.avg.toFixed(2).padStart(6)} │ ${stats.min.toFixed(2).padStart(6)} │ ${stats.max.toFixed(2).padStart(6)} │ ${stats.p95.toFixed(2).padStart(6)} │ ${stats.p99.toFixed(2).padStart(6)} │`
    );
  });
  console.log('└─────────────────────────┴────────┴────────┴────────┴────────┴────────┘');
  console.log('(All times in milliseconds)');

  console.log('\n📊 Verification Performance:');
  console.log('┌─────────────────────────┬────────┬────────┬────────┬────────┬────────┐');
  console.log('│ Pattern                 │  Avg   │  Min   │  Max   │  P95   │  P99   │');
  console.log('├─────────────────────────┼────────┼────────┼────────┼────────┼────────┤');
  
  patterns.forEach(({ name, key }) => {
    const stats = results[key].verification;
    console.log(
      `│ ${name.padEnd(23)} │ ${stats.avg.toFixed(2).padStart(6)} │ ${stats.min.toFixed(2).padStart(6)} │ ${stats.max.toFixed(2).padStart(6)} │ ${stats.p95.toFixed(2).padStart(6)} │ ${stats.p99.toFixed(2).padStart(6)} │`
    );
  });
  console.log('└─────────────────────────┴────────┴────────┴────────┴────────┴────────┘');
  console.log('(All times in milliseconds)');

  console.log('\n✅ All benchmarks completed successfully!');
  console.log('\nℹ️  Note: These are current implementation benchmarks.');
  console.log('   Production zk-SNARK implementations will have different performance characteristics.');
  console.log('   See benchmarks/README.md for expected production performance.');
}

// Run benchmarks
runAllBenchmarks().catch(console.error);
