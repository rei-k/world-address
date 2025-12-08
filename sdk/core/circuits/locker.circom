pragma circom 2.0.0;

/*
 * ZK-Locker Circuit
 * 
 * Purpose: Proves access to a locker without revealing which one
 * Use Case: Privacy-preserving locker delivery verification
 * 
 * Implementation: Merkle tree membership for locker facility
 * - Private Inputs: Locker ID, Merkle path
 * - Public Inputs: Facility ID, locker set root
 * - Output: Proof of locker access rights
 */

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template LockerMembershipValidator(levels) {
    // Private inputs
    signal input lockerID;              // Specific locker ID (private)
    signal input pathElements[levels];  // Merkle path siblings (private)
    signal input pathIndices[levels];   // Path direction bits (private)
    signal input accessNonce;           // Random nonce for access (private)
    
    // Public inputs
    signal input facilityID;            // Locker facility identifier (public)
    signal input lockerSetRoot;         // Merkle root of all lockers in facility (public)
    
    // Outputs
    signal output accessCommitment;     // Commitment to locker access
    signal output validationRoot;       // Verified Merkle root
    
    // Hash locker ID to get leaf
    component lockerHasher = Poseidon(1);
    lockerHasher.inputs[0] <== lockerID;
    
    signal hashes[levels + 1];
    hashes[0] <== lockerHasher.out;
    
    // Build Merkle path from locker to facility root
    component hashers[levels];
    component selectors[levels];
    
    for (var i = 0; i < levels; i++) {
        selectors[i] = LockerSelector();
        selectors[i].index <== pathIndices[i];
        selectors[i].left <== hashes[i];
        selectors[i].right <== pathElements[i];
        
        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== selectors[i].outLeft;
        hashers[i].inputs[1] <== selectors[i].outRight;
        
        hashes[i + 1] <== hashers[i].out;
    }
    
    // Verify computed root matches expected facility root
    validationRoot <== hashes[levels];
    
    component rootCheck = IsEqual();
    rootCheck.in[0] <== validationRoot;
    rootCheck.in[1] <== lockerSetRoot;
    rootCheck.out === 1;
    
    // Generate access commitment
    // accessCommitment = Hash(lockerID, facilityID, accessNonce)
    component accessHasher = Poseidon(3);
    accessHasher.inputs[0] <== lockerID;
    accessHasher.inputs[1] <== facilityID;
    accessHasher.inputs[2] <== accessNonce;
    accessCommitment <== accessHasher.out;
}

// Selector for locker path
template LockerSelector() {
    signal input index;      // 0 or 1
    signal input left;
    signal input right;
    signal output outLeft;
    signal output outRight;
    
    // If index == 0: outLeft = left, outRight = right
    // If index == 1: outLeft = right, outRight = left
    outLeft <== (right - left) * index + left;
    outRight <== (left - right) * index + right;
}

// Main circuit with depth 10 (supports up to 2^10 = 1024 lockers per facility)
component main {public [facilityID, lockerSetRoot]} = LockerMembershipValidator(10);
