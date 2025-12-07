# ZKP Circuits for Address Protocol

This directory contains Circom circuits for the 5 ZKP patterns used in the Vey Address Protocol.

## ⚠️ Important Security Notice

**These circuits are simplified reference implementations for development and testing.**

For production use:
1. Replace simplified components with battle-tested circomlib components
2. Conduct thorough security audits by qualified cryptographers
3. Use proper range checks, comparators, and hash functions from circomlib
4. Implement additional constraints for edge cases
5. Follow best practices from zkSNARK security guidelines

## Circuits

### 1. membership.circom - ZK-Membership Proof
Proves that an address PID exists in a valid set (Merkle tree) without revealing which one.

**Public Inputs:**
- `merkleRoot`: Root hash of the Merkle tree
- `timestamp`: Timestamp for proof freshness

**Private Inputs:**
- `addressPID`: The actual PID being proven
- `merklePathElements`: Merkle proof path
- `merklePathIndices`: Path indices

### 2. structure.circom - ZK-Structure Proof
Proves that a PID has correct hierarchical structure for a country.

**Public Inputs:**
- `countryCode`: Expected country code
- `hierarchyDepth`: Expected hierarchy depth

**Private Inputs:**
- `pid[8]`: PID components
- `hierarchyRules[8]`: Country-specific validation rules

### 3. selective-reveal.circom - ZK-Selective Reveal Proof
*(To be implemented)* Proves address validity while revealing only selected fields.

### 4. version.circom - ZK-Version Proof
*(To be implemented)* Proves ownership continuity when address changes.

### 5. locker.circom - ZK-Locker Proof
*(To be implemented)* Proves access to a locker in a facility without revealing which one.

## Compilation

```bash
# Install circom (https://docs.circom.io/getting-started/installation/)
npm install -g circom

# Compile circuits
circom circuits/membership.circom --r1cs --wasm --sym -o build/
circom circuits/structure.circom --r1cs --wasm --sym -o build/
```

## Setup (Trusted Setup)

```bash
# Download powers of tau (ceremony file)
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau

# Generate proving and verification keys
snarkjs groth16 setup build/membership.r1cs powersOfTau28_hez_final_20.ptau build/membership_0000.zkey
snarkjs zkey export verificationkey build/membership_0000.zkey build/membership_vkey.json
```

## Production Considerations

1. **Use circomlib**: Replace placeholder components with proper implementations
   - `circomlib/circuits/poseidon.circom` for hashing
   - `circomlib/circuits/comparators.circom` for comparisons
   - `circomlib/circuits/gates.circom` for logical operations

2. **Conduct MPC Ceremony**: For production, run a multi-party computation ceremony for trusted setup

3. **Optimize Constraints**: Minimize constraint count for faster proving

4. **Security Audit**: Have circuits audited by professional ZK cryptographers

5. **Gas Optimization**: For on-chain verification, optimize verifier contracts

## References

- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS](https://github.com/iden3/snarkjs)
- [Circomlib](https://github.com/iden3/circomlib)
- [ZK Security Guidelines](https://github.com/0xPARC/zk-bug-tracker)
