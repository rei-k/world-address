/**
 * ZKP Performance Benchmarks
 * 
 * This file contains performance benchmarks for all 5 ZKP patterns.
 * Run with: node benchmarks/zkp-benchmarks.js
 */

import { performance } from 'perf_hooks';
import {
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
} from '../src/zkp';

// Benchmark configuration
const ITERATIONS = 100;
const WARMUP_ITERATIONS = 10;

// Helper function to run benchmark
function benchmark(name, fn, iterations = ITERATIONS) {
  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    fn();
  }

  // Measure
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  // Statistics
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const sorted = times.sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  return {
    name,
    iterations,
    avg: avg.toFixed(3),
    min: min.toFixed(3),
    max: max.toFixed(3),
    p50: p50.toFixed(3),
    p95: p95.toFixed(3),
    p99: p99.toFixed(3),
  };
}

// Test data
const testPID = 'JP-13-113-01-T07-B12';
const validPIDs = Array.from({ length: 1000 }, (_, i) => `JP-13-${i}-01`);
const fullAddress = {
  country: 'JP',
  province: '13',
  city: 'Shibuya',
  postal_code: '150-0001',
  street_address: 'Dogenzaka 1-2-3',
  building: 'ABC Building',
  room: '501',
};
const lockerIds = Array.from({ length: 100 }, (_, i) => `LOCKER-A-${String(i).padStart(3, '0')}`);

console.log('🚀 ZKP Performance Benchmarks\n');
console.log(`Iterations: ${ITERATIONS} (+ ${WARMUP_ITERATIONS} warmup)\n`);

// Pattern 1: ZK-Membership Proof
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Pattern 1: ZK-Membership Proof');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const membershipCircuit = createZKCircuit('membership-v1', 'Membership Circuit');

const membershipGenResult = benchmark(
  'Membership Proof Generation',
  () => {
    generateZKMembershipProof(testPID, validPIDs, membershipCircuit);
  }
);
console.log(`Generation: avg=${membershipGenResult.avg}ms, p50=${membershipGenResult.p50}ms, p95=${membershipGenResult.p95}ms`);

const membershipProof = generateZKMembershipProof(testPID, validPIDs, membershipCircuit);
const membershipVerResult = benchmark(
  'Membership Proof Verification',
  () => {
    verifyZKMembershipProof(membershipProof, membershipCircuit, membershipProof.merkleRoot);
  }
);
console.log(`Verification: avg=${membershipVerResult.avg}ms, p50=${membershipVerResult.p50}ms, p95=${membershipVerResult.p95}ms\n`);

// Pattern 2: ZK-Structure Proof
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Pattern 2: ZK-Structure Proof');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const structureCircuit = createZKCircuit('structure-v1', 'Structure Circuit');

const structureGenResult = benchmark(
  'Structure Proof Generation',
  () => {
    generateZKStructureProof(testPID, 'JP', 6, structureCircuit);
  }
);
console.log(`Generation: avg=${structureGenResult.avg}ms, p50=${structureGenResult.p50}ms, p95=${structureGenResult.p95}ms`);

const structureProof = generateZKStructureProof(testPID, 'JP', 6, structureCircuit);
const structureVerResult = benchmark(
  'Structure Proof Verification',
  () => {
    verifyZKStructureProof(structureProof, structureCircuit, 'JP');
  }
);
console.log(`Verification: avg=${structureVerResult.avg}ms, p50=${structureVerResult.p50}ms, p95=${structureVerResult.p95}ms\n`);

// Pattern 3: ZK-Selective Reveal Proof
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Pattern 3: ZK-Selective Reveal Proof');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const selectiveCircuit = createZKCircuit('selective-v1', 'Selective Reveal Circuit');

const selectiveGenResult = benchmark(
  'Selective Reveal Proof Generation',
  () => {
    generateZKSelectiveRevealProof(testPID, fullAddress, ['country', 'postal_code'], selectiveCircuit);
  }
);
console.log(`Generation: avg=${selectiveGenResult.avg}ms, p50=${selectiveGenResult.p50}ms, p95=${selectiveGenResult.p95}ms`);

const selectiveProof = generateZKSelectiveRevealProof(testPID, fullAddress, ['country', 'postal_code'], selectiveCircuit);
const selectiveVerResult = benchmark(
  'Selective Reveal Proof Verification',
  () => {
    verifyZKSelectiveRevealProof(selectiveProof, selectiveCircuit);
  }
);
console.log(`Verification: avg=${selectiveVerResult.avg}ms, p50=${selectiveVerResult.p50}ms, p95=${selectiveVerResult.p95}ms\n`);

// Pattern 4: ZK-Version Proof
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Pattern 4: ZK-Version Proof');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const versionCircuit = createZKCircuit('version-v1', 'Version Circuit');

const versionGenResult = benchmark(
  'Version Proof Generation',
  () => {
    generateZKVersionProof('JP-13-113-01', 'JP-14-201-05', 'did:key:user123', versionCircuit);
  }
);
console.log(`Generation: avg=${versionGenResult.avg}ms, p50=${versionGenResult.p50}ms, p95=${versionGenResult.p95}ms`);

const versionProof = generateZKVersionProof('JP-13-113-01', 'JP-14-201-05', 'did:key:user123', versionCircuit);
const versionVerResult = benchmark(
  'Version Proof Verification',
  () => {
    verifyZKVersionProof(versionProof, versionCircuit);
  }
);
console.log(`Verification: avg=${versionVerResult.avg}ms, p50=${versionVerResult.p50}ms, p95=${versionVerResult.p95}ms\n`);

// Pattern 5: ZK-Locker Proof
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Pattern 5: ZK-Locker Proof');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const lockerCircuit = createZKCircuit('locker-v1', 'Locker Circuit');

const lockerGenResult = benchmark(
  'Locker Proof Generation',
  () => {
    generateZKLockerProof('LOCKER-A-042', 'FACILITY-SHIBUYA', lockerIds, lockerCircuit, 'KANTO');
  }
);
console.log(`Generation: avg=${lockerGenResult.avg}ms, p50=${lockerGenResult.p50}ms, p95=${lockerGenResult.p95}ms`);

const lockerProof = generateZKLockerProof('LOCKER-A-042', 'FACILITY-SHIBUYA', lockerIds, lockerCircuit, 'KANTO');
const lockerVerResult = benchmark(
  'Locker Proof Verification',
  () => {
    verifyZKLockerProof(lockerProof, lockerCircuit, 'FACILITY-SHIBUYA');
  }
);
console.log(`Verification: avg=${lockerVerResult.avg}ms, p50=${lockerVerResult.p50}ms, p95=${lockerVerResult.p95}ms\n`);

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Summary (avg times in ms)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const results = [
  { pattern: 'Membership', gen: membershipGenResult.avg, ver: membershipVerResult.avg },
  { pattern: 'Structure', gen: structureGenResult.avg, ver: structureVerResult.avg },
  { pattern: 'Selective Reveal', gen: selectiveGenResult.avg, ver: selectiveVerResult.avg },
  { pattern: 'Version', gen: versionGenResult.avg, ver: versionVerResult.avg },
  { pattern: 'Locker', gen: lockerGenResult.avg, ver: lockerVerResult.avg },
];

console.table(results);

console.log('\n⚠️  Note: These are placeholder benchmarks using mock ZKP implementation.');
console.log('   Real circom/snarkjs benchmarks will be significantly different.\n');
