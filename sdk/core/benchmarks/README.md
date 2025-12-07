# ZKP Performance Benchmarks

Comprehensive performance benchmarking suite for the World Address ZKP Protocol. Measures proof generation, verification time, and memory usage across all 5 ZKP patterns.

## Quick Start

```bash
# From sdk/core directory
npm run benchmark

# With custom iteration count
BENCHMARK_ITERATIONS=500 npm run benchmark
```

## Benchmark Coverage

The suite benchmarks all 5 ZKP patterns:

### 1. **ZK-Membership** (Address Existence)
- **Proof Generation**: Creates Merkle tree membership proof
- **Verification**: Validates proof against Merkle root
- **Test Data**: 1,000 valid PIDs, tree depth 20

### 2. **ZK-Structure** (PID Hierarchy)
- **Proof Generation**: Validates hierarchical structure
- **Verification**: Checks country code and depth compliance
- **Test Data**: 8-level hierarchy (Country → Room)

### 3. **ZK-Selective Reveal** (Partial Disclosure)
- **Proof Generation**: Creates commitment to unrevealed fields
- **Verification**: Validates revealed data integrity
- **Test Data**: Full address with selective field disclosure

### 4. **ZK-Version** (Address Migration)
- **Proof Generation**: Proves ownership continuity
- **Verification**: Validates migration proof
- **Test Data**: Old PID → New PID migration

### 5. **ZK-Locker** (Locker Membership)
- **Proof Generation**: Merkle proof for locker set
- **Verification**: Validates facility membership
- **Test Data**: 200 lockers in facility

## Metrics Collected

### Time Measurements
- **Average (Avg)**: Mean execution time
- **Minimum (Min)**: Fastest execution
- **Maximum (Max)**: Slowest execution
- **P50 (Median)**: 50th percentile
- **P95**: 95th percentile (SLA target)
- **P99**: 99th percentile (worst-case)

### Memory Usage
- **Heap Used**: JavaScript heap memory delta
- **External**: Native memory (C++ objects)

## Current Implementation Performance

**Note**: These benchmarks measure the **current cryptographic implementation** using:
- SHA-256 hashing (@noble/hashes)
- Ed25519 signatures (@noble/curves)
- Merkle tree operations

### Typical Results (100 iterations, Node.js 20)

#### Proof Generation
| Pattern | Avg | P95 | P99 |
|---------|-----|-----|-----|
| ZK-Membership | 2-5 ms | 6 ms | 8 ms |
| ZK-Structure | 1-2 ms | 3 ms | 4 ms |
| ZK-Selective Reveal | 1-3 ms | 4 ms | 5 ms |
| ZK-Version | 1-2 ms | 3 ms | 4 ms |
| ZK-Locker | 1-3 ms | 4 ms | 5 ms |

#### Verification
| Pattern | Avg | P95 | P99 |
|---------|-----|-----|-----|
| ZK-Membership | 0.5-1 ms | 2 ms | 3 ms |
| ZK-Structure | 0.3-0.8 ms | 1 ms | 2 ms |
| ZK-Selective Reveal | 0.3-0.8 ms | 1 ms | 2 ms |
| ZK-Version | 0.3-0.8 ms | 1 ms | 2 ms |
| ZK-Locker | 0.3-0.8 ms | 1 ms | 2 ms |

#### Memory Usage
- **Heap**: 1-5 MB per pattern
- **External**: <1 MB per pattern

## Expected Production Performance (with zk-SNARKs)

When integrated with real circom/snarkjs circuits (Groth16):

### Proof Generation
| Pattern | Expected Avg | Expected P95 | Constraints |
|---------|--------------|--------------|-------------|
| ZK-Membership | 200-500 ms | 800 ms | ~420 |
| ZK-Structure | 100-300 ms | 500 ms | ~250 |
| ZK-Selective Reveal | 300-800 ms | 1200 ms | ~600 |
| ZK-Version | 200-500 ms | 800 ms | ~400 |
| ZK-Locker | 200-500 ms | 800 ms | ~420 |

**Hardware**: 4-core CPU, 8GB RAM

### Verification (Groth16)
- **All Patterns**: 5-20 ms (constant time)
- **Proof Size**: ~128 bytes (constant)

### Memory Requirements
- **Proving**: 200-500 MB RAM
- **Verification**: <50 MB RAM

## Performance Optimization Guidelines

### 1. Circuit Optimization
```circom
// ❌ Avoid: Inefficient hash chains
for (var i = 0; i < 1000; i++) {
    hash = SHA256(hash);  // 1000 SHA-256 circuits
}

// ✅ Prefer: Poseidon hash (ZK-friendly)
hash = Poseidon([input1, input2]);  // Single constraint
```

### 2. Batch Processing
```typescript
// Process multiple proofs in parallel
const proofs = await Promise.all(
  pids.map(pid => generateZKMembershipProof(pid, validSet, circuit))
);
```

### 3. Proof Caching
```typescript
// Cache frequently used proofs
const cache = new Map();
const cacheKey = `${pid}-${merkleRoot}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

const proof = await generateProof(/* ... */);
cache.set(cacheKey, proof);
return proof;
```

### 4. Worker Threads
```typescript
// Offload proving to worker threads
import { Worker } from 'worker_threads';

const worker = new Worker('./proof-worker.js');
worker.postMessage({ pid, validSet, circuit });
const proof = await new Promise(resolve => 
  worker.on('message', resolve)
);
```

## Production Deployment Considerations

### SLA Targets
- **Proof Generation**: <1s (P95)
- **Verification**: <50ms (P99)
- **Availability**: 99.9%
- **Error Rate**: <0.1%

### Scaling Strategy

#### Horizontal Scaling
```
Load Balancer
    │
    ├─ Proof Server 1 (4 cores)
    ├─ Proof Server 2 (4 cores)
    ├─ Proof Server 3 (4 cores)
    └─ Proof Server N
```

**Capacity**: ~10-50 proofs/sec per server (depending on pattern)

#### Vertical Scaling
- **CPU**: More cores = more parallel proof generation
- **RAM**: 2GB + (500MB × concurrent proofs)
- **Storage**: Minimal (<1GB for circuits + keys)

### Monitoring Metrics

```typescript
// Key metrics to track
const metrics = {
  proofGenerationTime: histogram('proof_gen_ms', [50, 100, 500, 1000, 2000]),
  verificationTime: histogram('proof_verify_ms', [5, 10, 20, 50, 100]),
  proofCacheHitRate: gauge('cache_hit_rate'),
  activeProofGenerations: gauge('active_proofs'),
  memoryUsage: gauge('memory_mb'),
  errorRate: counter('proof_errors'),
};
```

### Resource Limits

```javascript
// Circuit constraints budget
const CONSTRAINT_LIMITS = {
  'membership': 500,      // Max constraints
  'structure': 300,
  'selective-reveal': 700,
  'version': 500,
  'locker': 500,
};

// Timeout configuration
const TIMEOUTS = {
  proofGeneration: 5000,    // 5s max
  verification: 100,         // 100ms max
  circuitCompilation: 60000, // 1 min max
};
```

## Troubleshooting

### Slow Proof Generation

**Problem**: Proof generation >2s

**Solutions**:
1. Check CPU usage (should be 100% during proving)
2. Verify circuit constraint count (`snarkjs r1cs info`)
3. Use faster hash functions (Poseidon vs SHA-256)
4. Enable circuit optimizations in circom

### High Memory Usage

**Problem**: Memory >1GB per proof

**Solutions**:
1. Reduce Merkle tree depth
2. Optimize witness calculation
3. Use streaming witness generation
4. Implement garbage collection between proofs

### Verification Failures

**Problem**: Valid proofs failing verification

**Solutions**:
1. Verify circuit compilation matches
2. Check public input formatting
3. Validate verification key integrity
4. Test with known-good proof/vkey pair

## Running Custom Benchmarks

### Test Specific Pattern

```javascript
// benchmark-custom.mjs
import { benchmarkZKMembership } from './zkp-benchmarks.mjs';

const results = await benchmarkZKMembership(1000); // 1000 iterations
console.log(results);
```

### With Different Data Sizes

```javascript
// Test with larger Merkle tree
const validPIDs = generateTestPIDs(10000); // 10k addresses
const proof = generateZKMembershipProof(testPID, validPIDs, circuit);
```

### Continuous Benchmarking

```bash
# Run every hour
0 * * * * cd /path/to/sdk/core && npm run benchmark >> /var/log/zkp-bench.log 2>&1
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: ZKP Benchmarks

on:
  pull_request:
    paths:
      - 'sdk/core/src/zkp*.ts'
      - 'sdk/core/circuits/**'

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run benchmark
      - name: Compare with baseline
        run: node scripts/compare-benchmarks.js
```

### Performance Regression Detection

```javascript
// Alert if performance degrades >20%
const THRESHOLDS = {
  generation: { p95: 10 },  // 10ms max P95 for current impl
  verification: { p95: 5 }, // 5ms max P95
};

if (results.generation.p95 > THRESHOLDS.generation.p95 * 1.2) {
  throw new Error('Performance regression detected!');
}
```

## Future Optimizations

### Phase 1: Circuit Compilation
- [ ] Compile circuits to WASM
- [ ] Cache compilation results
- [ ] Optimize constraint count

### Phase 2: Proving Optimization  
- [ ] WASM-based witness generation
- [ ] GPU acceleration (via CUDA/OpenCL)
- [ ] Batch proof generation

### Phase 3: Advanced Caching
- [ ] Redis-backed proof cache
- [ ] CDN distribution of verification keys
- [ ] Pre-computed witness templates

## References

- [snarkjs Performance Guide](https://github.com/iden3/snarkjs#performance)
- [Circom Optimization Tips](https://docs.circom.io/getting-started/computing-the-witness/)
- [ZK Benchmarking Best Practices](https://www.zkdocs.com/docs/zkdocs/zero-knowledge-protocols/groth16/)

## Support

For performance issues or optimization questions:
1. Review this guide
2. Check circuit implementations in `circuits/`
3. Review current performance data
4. Open an issue with benchmark results
