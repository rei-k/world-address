# ZKP Circuits for Address Privacy Protocol

This directory contains Zero-Knowledge Proof circuits implemented in Circom for the World Address ZKP Protocol.

## Overview

These circuits enable privacy-preserving address validation for delivery systems. They allow verification of address properties without revealing sensitive location data.

## Implemented Circuits

### 1. ZK-Membership Circuit (`membership.circom`)

**Purpose**: Proves that an address PID exists in a valid set without revealing which one.

**Use Case**: Verify a delivery address is within an allowed service area without exposing the exact location.

**Implementation**: Merkle tree membership proof using Poseidon hash function.

**Parameters**:
- Tree depth: 20 levels (supports up to 2^20 = 1,048,576 addresses)
- Hash function: Poseidon (ZK-friendly)

**Inputs**:
- **Private**: `leaf` (PID hash), `pathElements` (sibling hashes), `pathIndices` (path direction)
- **Public**: `root` (Merkle root of valid address set)

**Constraints**: ~420 constraints (20 levels × 21 constraints per level)

### 2. ZK-Structure Circuit (`structure.circom`)

**Purpose**: Proves that a PID has correct hierarchical structure (Country > Admin1 > Admin2 > ...).

**Use Case**: Verify address conforms to regional format requirements without revealing full address.

**Implementation**: Validates PID component structure and relationships.

**Parameters**:
- Max components: 8 (Country + up to 7 admin levels)
- Hash function: Poseidon

**Inputs**:
- **Private**: `components` (PID parts), `componentLengths` (validation data)
- **Public**: `countryCode`, `hierarchyDepth`

**Output**: `structureCommitment` (cryptographic commitment to structure)

**Constraints**: ~250 constraints

## Remaining Circuits (To Be Implemented)

### 3. ZK-Selective Reveal Circuit

**Purpose**: Allows partial disclosure of address fields with user control.

**Use Case**: EC site sees only country & postal code; carrier sees full address.

**Implementation**: Commitment scheme with selective opening.

### 4. ZK-Version Circuit

**Purpose**: Proves consistency between old and new PID after address change.

**Use Case**: Prove same person/entity owns both addresses during migration.

**Implementation**: Linkable commitments with ownership proof.

### 5. ZK-Locker Circuit

**Purpose**: Proves access to a locker without revealing which one.

**Use Case**: Privacy-preserving locker delivery verification.

**Implementation**: Merkle tree membership for locker facility.

## Circuit Compilation

### Prerequisites

```bash
# Install circom compiler
npm install -g circom

# Install snarkjs for proving/verification
npm install -g snarkjs
```

### Compilation Steps

#### 1. Compile Circuit

```bash
# Compile membership circuit
circom circuits/membership.circom --r1cs --wasm --sym -o build/

# Compile structure circuit
circom circuits/structure.circom --r1cs --wasm --sym -o build/
```

Output files:
- `membership.r1cs` - R1CS constraint system
- `membership.wasm` - WASM witness generator
- `membership.sym` - Symbol table (for debugging)

#### 2. View Circuit Info

```bash
# View constraint count
snarkjs r1cs info build/membership.r1cs

# Export R1CS to JSON
snarkjs r1cs export json build/membership.r1cs build/membership.r1cs.json
```

#### 3. Generate Powers of Tau (Trusted Setup - Phase 1)

```bash
# Start Powers of Tau ceremony (for circuits with <1M constraints)
snarkjs powersoftau new bn128 14 pot14_0000.ptau -v

# Contribute randomness (can be done by multiple parties)
snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau \
  --name="First contribution" -v

# Prepare for phase 2
snarkjs powersoftau prepare phase2 pot14_0001.ptau pot14_final.ptau -v
```

**Security Note**: In production, run a multi-party ceremony with at least 10 contributors from independent organizations.

#### 4. Generate Proving and Verification Keys (Phase 2)

```bash
# Generate zkey for membership circuit
snarkjs groth16 setup build/membership.r1cs pot14_final.ptau membership_0000.zkey

# Contribute to phase 2 ceremony
snarkjs zkey contribute membership_0000.zkey membership_final.zkey \
  --name="First contribution" -v

# Export verification key
snarkjs zkey export verificationkey membership_final.zkey verification_key.json
```

#### 5. Generate and Verify Proofs

```bash
# Create input file (input.json)
cat > input.json << EOF
{
  "leaf": "12345...",
  "pathElements": ["hash1", "hash2", ...],
  "pathIndices": [0, 1, 0, ...],
  "root": "merkleRoot..."
}
EOF

# Generate witness
node build/membership_js/generate_witness.js \
  build/membership_js/membership.wasm input.json witness.wtns

# Generate proof
snarkjs groth16 prove membership_final.zkey witness.wtns proof.json public.json

# Verify proof
snarkjs groth16 verify verification_key.json public.json proof.json
```

## Integration with SDK

### 1. Install Dependencies

Already included in `package.json`:
```json
{
  "devDependencies": {
    "circom": "^2.0.0",
    "snarkjs": "^0.7.4"
  }
}
```

### 2. Load Circuit in TypeScript

```typescript
import { groth16 } from 'snarkjs';
import fs from 'fs';

// Load verification key
const verificationKey = JSON.parse(
  fs.readFileSync('verification_key.json', 'utf-8')
);

// Verify proof
const isValid = await groth16.verify(
  verificationKey,
  publicInputs,
  proof
);
```

### 3. Generate Proofs

```typescript
import { groth16 } from 'snarkjs';

// Generate witness and proof
const { proof, publicSignals } = await groth16.fullProve(
  input,
  'build/membership_js/membership.wasm',
  'membership_final.zkey'
);
```

## Circuit Development Guidelines

### 1. Security Considerations

- **Trusted Setup**: Use multi-party ceremony for production
- **Randomness**: All contributions must use cryptographic randomness
- **Circuit Audits**: Conduct formal verification and external audits
- **Input Validation**: Validate all inputs before proof generation

### 2. Optimization

- **Constraint Minimization**: Use efficient Poseidon hash (fewer constraints than SHA-256)
- **Proof Size**: Groth16 proofs are constant size (~128 bytes)
- **Proving Time**: Optimize for <1s proof generation on standard hardware

### 3. Testing

```bash
# Test circuit with known inputs
circom membership.circom --r1cs --wasm --sym
node generate_witness.js membership.wasm input.json witness.wtns
snarkjs groth16 prove zkey witness.wtns proof.json public.json
snarkjs groth16 verify vkey public.json proof.json
```

## Production Deployment Checklist

- [ ] **Trusted Setup Ceremony**
  - [ ] Minimum 10 independent contributors
  - [ ] Documented randomness sources
  - [ ] Public ceremony transcript
  - [ ] Destruction of toxic waste verification

- [ ] **Circuit Audits**
  - [ ] Formal verification of constraint system
  - [ ] External security audit (Trail of Bits, OpenZeppelin, etc.)
  - [ ] Peer review by cryptography experts

- [ ] **Performance Validation**
  - [ ] Proof generation < 1s on target hardware
  - [ ] Verification < 50ms
  - [ ] Memory usage < 500MB during proving

- [ ] **Integration Testing**
  - [ ] End-to-end proof generation and verification
  - [ ] Invalid input rejection
  - [ ] Error handling and recovery

- [ ] **Documentation**
  - [ ] API documentation
  - [ ] Integration examples
  - [ ] Security best practices
  - [ ] Migration guide for updates

## Resources

### Circom Documentation
- [Circom Language](https://docs.circom.io/)
- [Circomlib (Standard Library)](https://github.com/iden3/circomlib)
- [Writing Circuits](https://docs.circom.io/getting-started/writing-circuits/)

### snarkjs Documentation
- [snarkjs Guide](https://github.com/iden3/snarkjs)
- [Groth16 Protocol](https://eprint.iacr.org/2016/260.pdf)
- [Powers of Tau](https://github.com/kobigurk/phase2-bn254)

### ZK Learning Resources
- [ZK Whiteboard Sessions](https://zkhack.dev/whiteboard/)
- [ZK Proof Systems](https://www.zkdocs.com/)
- [Practical Circom](https://github.com/0xPARC/circom-ecdsa)

## Support

For questions or issues:
1. Check [Circuit Examples](../docs/examples/zkp/)
2. Review [Security Guidelines](../docs/zkp/security/)
3. Open an issue on GitHub
