# ZKP Threat Model

## Overview

This document outlines the threat model for the ZKP Address Protocol, identifying potential security risks, attack vectors, and mitigation strategies.

## System Components

### 1. Address Provider (Prover)
- **Role**: Generates ZK proofs for address validation
- **Trust Level**: Trusted by users, semi-trusted by verifiers
- **Attack Surface**: Proof generation, key management, data storage

### 2. Verifier (EC Sites, Carriers)
- **Role**: Verifies ZK proofs without learning sensitive data
- **Trust Level**: Untrusted with user's private data
- **Attack Surface**: Proof verification, public input validation

### 3. User (Data Owner)
- **Role**: Controls address data, requests proofs
- **Trust Level**: Fully trusted with own data
- **Attack Surface**: Client-side wallet, key management

### 4. ZK Circuits
- **Role**: Define proof constraints and logic
- **Trust Level**: Must be bulletproof (trusted after audit)
- **Attack Surface**: Circuit bugs, underconstrained logic

## Threat Actors

### 1. External Attackers
**Motivation**: Financial gain, privacy violation, system disruption

**Capabilities**:
- Network interception (MitM)
- Public blockchain analysis
- Computational resources for brute force
- Social engineering

**Goals**:
- Extract private address information
- Forge valid proofs without valid addresses
- DoS the proof system

### 2. Malicious Verifiers
**Motivation**: Extract user address data

**Capabilities**:
- Control verification infrastructure
- Analyze proof patterns
- Request multiple proofs from same user
- Timing/side-channel analysis

**Goals**:
- Infer actual address from proof
- Correlate multiple proofs to same user
- Bypass privacy guarantees

### 3. Malicious Provers
**Motivation**: Create fake delivery addresses

**Capabilities**:
- Generate arbitrary proofs
- Modify proof generation code
- Attempt to bypass circuit constraints

**Goals**:
- Prove delivery to non-existent addresses
- Bypass shipping restrictions
- Impersonate legitimate addresses

### 4. Insider Threats
**Motivation**: Data theft, sabotage

**Capabilities**:
- Access to internal systems
- Knowledge of implementation details
- Ability to modify code/circuits

**Goals**:
- Extract user address database
- Introduce backdoors in circuits
- Compromise trusted setup

### 5. State-Level Adversaries
**Motivation**: Mass surveillance, censorship

**Capabilities**:
- Large-scale network monitoring
- Quantum computing (future threat)
- Legal pressure on infrastructure providers

**Goals**:
- De-anonymize all users
- Block specific addresses
- Break cryptographic assumptions

## Attack Scenarios

### Scenario 1: Proof Forgery Attack

**Attacker**: External attacker or malicious prover  
**Goal**: Create valid proof without owning valid address

**Attack Path**:
1. Attacker analyzes public circuits and verification keys
2. Attempts to find witness that satisfies constraints without valid PID
3. Exploits under-constrained circuit logic
4. Generates false proof

**Impact**: Critical - Enables fake deliveries, bypasses access control

**Mitigation**:
- [ ] Comprehensive circuit audit for constraint completeness
- [ ] Formal verification of circuit soundness
- [ ] Test with malicious witness attempts
- [ ] Use battle-tested circomlib components

**Detection**:
- Monitor for unusual proof patterns
- Cross-check with address database during delivery
- Implement rate limiting on proof generation

---

### Scenario 2: Witness Extraction Attack

**Attacker**: Malicious verifier  
**Goal**: Learn user's actual address from proof

**Attack Path**:
1. Verifier collects ZK proof from user
2. Analyzes proof structure, public inputs, timing
3. Performs statistical analysis on multiple proofs
4. Attempts to reverse-engineer private inputs

**Impact**: High - Violates privacy guarantee of ZKP

**Mitigation**:
- [ ] Ensure circuits are zero-knowledge (no information leakage)
- [ ] Minimize public inputs to essential data only
- [ ] Use constant-time proof generation
- [ ] Randomize proof generation paths

**Detection**:
- Monitor for verifiers requesting excessive proofs
- Detect correlation attacks through usage patterns

---

### Scenario 3: Replay Attack

**Attacker**: MitM or malicious third party  
**Goal**: Reuse old valid proof for unauthorized purposes

**Attack Path**:
1. Attacker intercepts valid proof between user and verifier
2. Stores proof for later use
3. Replays proof to different verifier or same verifier later
4. Gains unauthorized access or service

**Impact**: Medium - Enables unauthorized use of proof

**Mitigation**:
- [ ] Include timestamp in public inputs
- [ ] Implement nonce/challenge-response
- [ ] Short proof expiration times (5-15 minutes)
- [ ] Bind proof to specific verifier DID

**Detection**:
- Log all proof verifications with timestamps
- Detect duplicate proofs used across different contexts
- Alert on expired proof attempts

---

### Scenario 4: Malleability Attack

**Attacker**: MitM or malicious prover  
**Goal**: Modify valid proof to create another valid proof

**Attack Path**:
1. Attacker intercepts valid proof
2. Modifies proof components without invalidating signature
3. Creates variations of proof with different properties
4. Uses modified proof for malicious purposes

**Impact**: Medium - Could enable proof manipulation

**Mitigation**:
- [ ] Use non-malleable proof systems (Groth16 is non-malleable)
- [ ] Include commitment to all public inputs
- [ ] Sign proofs with additional layer (JWS)
- [ ] Verify proof integrity end-to-end

**Detection**:
- Cryptographic verification catches invalid modifications
- Log proof validation failures

---

### Scenario 5: Trusted Setup Compromise

**Attacker**: Insider or supply chain attacker  
**Goal**: Compromise trusted setup to enable proof forgery

**Attack Path**:
1. Attacker participates in trusted setup ceremony
2. Keeps copy of "toxic waste" (private setup parameters)
3. Uses toxic waste to generate false proofs
4. Proofs appear valid to all verifiers

**Impact**: Critical - Complete system compromise

**Mitigation**:
- [ ] Use PLONK with universal setup (no per-circuit setup)
- [ ] If using Groth16, conduct MPC ceremony with >50 participants
- [ ] Use established Powers of Tau (e.g., Hermez, Ethereum)
- [ ] Transparent ceremony with public verification
- [ ] Multiple independent setup ceremonies

**Detection**:
- Impossible to detect after the fact
- Prevention is the only defense

---

### Scenario 6: Side-Channel Attack

**Attacker**: Malicious observer with timing/power analysis capabilities  
**Goal**: Extract private witness from proof generation process

**Attack Path**:
1. Attacker measures proof generation time
2. Analyzes CPU/memory usage patterns
3. Correlates resource usage with witness values
4. Reconstructs private PID from side-channel leakage

**Impact**: High - Privacy violation

**Mitigation**:
- [ ] Constant-time operations where possible
- [ ] Avoid conditional branching based on private data
- [ ] Use blinding factors in witness
- [ ] Sandboxed proof generation environment
- [ ] Client-side generation in secure enclave

**Detection**:
- Difficult to detect remotely
- Monitor for unusual system access patterns

---

### Scenario 7: Quantum Computing Attack

**Attacker**: State-level adversary with quantum computer  
**Goal**: Break cryptographic assumptions (future threat)

**Attack Path**:
1. Attacker uses quantum computer with Shor's algorithm
2. Breaks discrete log problem underlying pairing-based cryptography
3. Forges proofs or extracts witnesses from old proofs
4. Compromises entire ZKP system

**Impact**: Critical - Complete cryptographic failure

**Mitigation**:
- [ ] Monitor quantum computing advances
- [ ] Plan migration to post-quantum ZK systems (zk-STARKs)
- [ ] Implement crypto-agility for algorithm swaps
- [ ] Set proof expiration times (quantum harvest-now-decrypt-later)

**Detection**:
- Proactive monitoring of quantum threats
- No detection after quantum breakthrough

---

### Scenario 8: Merkle Tree Collision Attack

**Attacker**: Malicious prover  
**Goal**: Create two different addresses with same Merkle root

**Attack Path**:
1. Attacker finds hash collision in Poseidon function
2. Creates two PIDs that hash to same leaf
3. Generates valid proof for unauthorized PID
4. Bypasses membership check

**Impact**: High - Enables unauthorized access

**Mitigation**:
- [ ] Use collision-resistant hash (Poseidon parameters validated)
- [ ] Commitment to full PID, not just hash
- [ ] Secondary authentication factors
- [ ] Regular Merkle tree integrity checks

**Detection**:
- Cross-check proof against original PID database
- Detect duplicate leaf hashes in tree

---

## Residual Risks

After implementing all mitigations, these risks remain:

1. **Zero-day vulnerabilities** in circom/snarkjs libraries
2. **Implementation bugs** despite audits and testing
3. **Social engineering** attacks on users
4. **Quantum computing** breakthrough (long-term)
5. **Legal pressure** to compromise system

## Security Monitoring

### Metrics to Track

- Proof verification success/failure rates
- Proof generation times (detect anomalies)
- Number of proofs per user (detect abuse)
- Verifier access patterns
- Circuit constraint violations

### Alerting Thresholds

- **Critical**: Successful proof forgery detected
- **High**: Unusual proof pattern correlation
- **Medium**: Rate limit violations
- **Low**: Individual proof verification failures

## Incident Response

See [incident-response.md](./incident-response.md) for detailed procedures.

## Review Schedule

- **Quarterly**: Update threat model for new attack vectors
- **Bi-annually**: Red team penetration testing
- **Annually**: External security audit
- **Continuous**: Monitor security research and CVEs

---

**Last Updated**: 2024-12-07  
**Next Review**: 2025-01-07
