pragma circom 2.0.0;

/*
 * ZK-Membership Circuit
 * 
 * Purpose: Proves that an address PID exists in a valid set without revealing which one
 * Use Case: Verify delivery address is in allowed service area without revealing exact location
 * 
 * Implementation: Merkle tree membership proof
 * - Private Inputs: PID (address identifier), Merkle path siblings
 * - Public Inputs: Merkle root of valid PIDs set
 * - Output: Proof that PID is in the valid set
 */

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template MerkleTreeChecker(levels) {
    // Private inputs
    signal input leaf;              // The PID hash (private)
    signal input pathElements[levels];  // Sibling hashes in the path (private)
    signal input pathIndices[levels];   // 0 = left, 1 = right (private)
    
    // Public input
    signal output root;             // Merkle root (public)
    
    // Hash the leaf to get starting hash
    component leafHasher = Poseidon(1);
    leafHasher.inputs[0] <== leaf;
    
    signal hashes[levels + 1];
    hashes[0] <== leafHasher.out;
    
    // Build path from leaf to root
    component hashers[levels];
    component selectors[levels];
    
    for (var i = 0; i < levels; i++) {
        selectors[i] = Selector();
        selectors[i].index <== pathIndices[i];
        selectors[i].left <== hashes[i];
        selectors[i].right <== pathElements[i];
        
        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== selectors[i].outLeft;
        hashers[i].inputs[1] <== selectors[i].outRight;
        
        hashes[i + 1] <== hashers[i].out;
    }
    
    root <== hashes[levels];
}

// Selector component: selects left/right based on path index
template Selector() {
    signal input index;      // 0 or 1
    signal input left;
    signal input right;
    signal output outLeft;
    signal output outRight;
    
    // Constrain index to be binary (0 or 1)
    index * (index - 1) === 0;
    
    // If index == 0: outLeft = left, outRight = right
    // If index == 1: outLeft = right, outRight = left
    outLeft <== (right - left) * index + left;
    outRight <== (left - right) * index + right;
}

// Main circuit with depth 20 (supports up to 2^20 = 1M addresses)
component main {public [root]} = MerkleTreeChecker(20);
