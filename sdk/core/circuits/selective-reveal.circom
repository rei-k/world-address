pragma circom 2.0.0;

/*
 * ZK-Selective Reveal Circuit
 * 
 * Purpose: Allows partial disclosure of address fields with user control
 * Use Case: EC site sees only country & postal code; carrier sees full address
 * 
 * Implementation: Commitment scheme with selective opening
 * - Private Inputs: Full address data, field values
 * - Public Inputs: Field selection mask, revealed values
 * - Output: Proof that revealed fields match committed address
 */

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

template SelectiveRevealValidator(numFields) {
    // Private inputs - all address field values
    signal input fieldValues[numFields];     // All field values (hashed)
    signal input revealMask[numFields];      // 1 = reveal, 0 = hide
    signal input nonce;                      // Random nonce for commitment
    
    // Public inputs - what user chooses to reveal
    signal input revealedValues[numFields];  // Values that are revealed (0 if hidden)
    
    // Output - commitment to unrevealed data
    signal output fullCommitment;            // Commitment to complete address
    signal output revealedCommitment;        // Commitment to revealed fields
    
    // Validate reveal mask is binary (0 or 1)
    component maskChecks[numFields];
    for (var i = 0; i < numFields; i++) {
        maskChecks[i] = Num2Bits(1);
        maskChecks[i].in <== revealMask[i];
    }
    
    // Validate revealed values match actual values when mask = 1
    component matchChecks[numFields];
    for (var i = 0; i < numFields; i++) {
        matchChecks[i] = IsEqual();
        
        // If mask[i] == 1, revealedValues[i] must equal fieldValues[i]
        // If mask[i] == 0, revealedValues[i] must be 0
        signal expectedValue;
        expectedValue <== revealMask[i] * fieldValues[i];
        
        matchChecks[i].in[0] <== revealedValues[i];
        matchChecks[i].in[1] <== expectedValue;
        matchChecks[i].out === 1;
    }
    
    // Create full commitment (all fields + nonce)
    component fullHasher = Poseidon(numFields + 1);
    for (var i = 0; i < numFields; i++) {
        fullHasher.inputs[i] <== fieldValues[i];
    }
    fullHasher.inputs[numFields] <== nonce;
    fullCommitment <== fullHasher.out;
    
    // Create revealed commitment (only revealed fields)
    component revealedHasher = Poseidon(numFields + 1);
    for (var i = 0; i < numFields; i++) {
        revealedHasher.inputs[i] <== revealedValues[i];
    }
    revealedHasher.inputs[numFields] <== nonce;
    revealedCommitment <== revealedHasher.out;
}

// Main circuit with 8 address fields
// Fields: country, province, city, postal_code, street, building, room, recipient
component main {public [revealedValues]} = SelectiveRevealValidator(8);
