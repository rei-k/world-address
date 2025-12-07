# ZKP Performance Benchmarks

This directory contains performance benchmarks for the ZKP Address Protocol implementation.

## Running Benchmarks

```bash
# From sdk/core directory
npm run benchmark

# Or directly
node benchmarks/zkp-benchmarks.js
```

## Benchmark Metrics

Each benchmark measures:
- **Average (avg)**: Mean execution time
- **Minimum (min)**: Fastest execution
- **Maximum (max)**: Slowest execution
- **P50 (median)**: 50th percentile
- **P95**: 95th percentile
- **P99**: 99th percentile

## Benchmark Patterns

### 1. ZK-Membership Proof
- **Operation**: Generate/verify proof that address exists in set
- **Data Size**: 1,000 PIDs in Merkle tree
- **Key Metric**: Proof generation time with large trees

### 2. ZK-Structure Proof
- **Operation**: Generate/verify proof of PID hierarchy validity
- **Data Size**: 8-component PID structure
- **Key Metric**: Constraint satisfaction time

### 3. ZK-Selective Reveal Proof
- **Operation**: Generate/verify proof with partial field disclosure
- **Data Size**: 7 address fields, 2 revealed
- **Key Metric**: Selective disclosure overhead

### 4. ZK-Version Proof
- **Operation**: Generate/verify proof of address migration
- **Data Size**: Old PID + New PID + ownership proof
- **Key Metric**: Migration proof complexity

### 5. ZK-Locker Proof
- **Operation**: Generate/verify proof of locker access
- **Data Size**: 100 lockers in facility
- **Key Metric**: Locker set membership proof time

## Expected Performance (Production with Real Circuits)

**Note**: These are estimates for production circom/snarkjs implementation:

| Pattern | Proof Generation | Proof Verification | Proof Size |
|---------|------------------|-------------------|------------|
| Membership | 2-5 seconds | 5-20 ms | ~200 bytes |
| Structure | 1-3 seconds | 5-15 ms | ~200 bytes |
| Selective Reveal | 3-6 seconds | 5-20 ms | ~250 bytes |
| Version | 2-4 seconds | 5-15 ms | ~200 bytes |
| Locker | 2-5 seconds | 5-20 ms | ~200 bytes |

**Factors affecting performance**:
- Circuit complexity (number of constraints)
- Trusted setup parameters
- Hardware (CPU, RAM)
- Proof system (Groth16 vs PLONK vs STARK)

## Optimization Strategies

### For Proving Time
1. Reduce circuit constraints
2. Use PLONK instead of Groth16 (universal setup)
3. Optimize witness computation
4. Use GPU acceleration (if available)

### For Verification Time
1. Minimize public inputs
2. Use batch verification
3. Optimize pairing computations
4. Consider recursive SNARKs for aggregation

### For Proof Size
1. Use compression techniques
2. Minimize public inputs
3. Consider STARKs for larger proofs but faster verification

## Benchmarking Tools

- **perf_hooks**: Node.js performance measurement
- **circom**: Circuit compilation time
- **snarkjs**: Proving/verification time
- **memory-usage**: RAM consumption during proving

## Production Benchmarking

For production deployment:

1. **Load Testing**: Test with realistic data volumes
2. **Concurrency**: Measure throughput with multiple provers
3. **Memory Profiling**: Monitor RAM during proof generation
4. **Network Impact**: Measure proof transmission time
5. **End-to-End**: Measure complete flow from request to verification

## Continuous Benchmarking

Set up CI/CD to track performance regressions:

```yaml
# .github/workflows/benchmark.yml
name: Benchmarks
on: [push]
jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run benchmark
      - uses: benchmark-action/github-action-benchmark@v1
```

## References

- [SnarkJS Performance](https://github.com/iden3/snarkjs#performance)
- [Circom Optimization](https://docs.circom.io/getting-started/writing-circuits/)
- [ZK Benchmarks](https://github.com/matter-labs/awesome-zero-knowledge-proofs)
