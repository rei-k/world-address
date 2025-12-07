pragma circom 2.0.0;

/*
 * ZK-Structure Circuit
 * 
 * Purpose: Proves that a PID has correct hierarchical structure without revealing full details
 * Use Case: Verify address conforms to regional format (Country > Admin1 > Admin2 > ...)
 * 
 * Implementation: Validates PID component structure and relationships
 * - Private Inputs: Full PID components
 * - Public Inputs: Country code, hierarchy depth
 * - Output: Proof of structural validity
 */

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";

template PIDStructureValidator(maxComponents) {
    // Private inputs - PID component values
    signal input components[maxComponents];      // PID parts (hashed)
    signal input componentLengths[maxComponents]; // Length of each component
    
    // Public inputs
    signal input countryCode;          // Country code (public)
    signal input hierarchyDepth;       // Expected number of components (public)
    
    // Output - commitment to the structure
    signal output structureCommitment;
    
    // Validate hierarchy depth is within bounds
    component depthCheck = LessThan(8);
    depthCheck.in[0] <== hierarchyDepth;
    depthCheck.in[1] <== maxComponents + 1;
    depthCheck.out === 1;
    
    // Validate country code matches first component
    component countryMatch = IsEqual();
    countryMatch.in[0] <== components[0];
    countryMatch.in[1] <== countryCode;
    countryMatch.out === 1;
    
    // Validate each component length is non-zero up to hierarchy depth
    component lengthChecks[maxComponents];
    for (var i = 0; i < maxComponents; i++) {
        lengthChecks[i] = IsZero();
        lengthChecks[i].in <== componentLengths[i];
        
        // If i < hierarchyDepth, length must be > 0
        // If i >= hierarchyDepth, length must be 0
        component shouldBeNonZero = LessThan(8);
        shouldBeNonZero.in[0] <== i;
        shouldBeNonZero.in[1] <== hierarchyDepth;
        
        signal lengthValid;
        lengthValid <== shouldBeNonZero.out * (1 - lengthChecks[i].out) + 
                       (1 - shouldBeNonZero.out) * lengthChecks[i].out;
        lengthValid === 1;
    }
    
    // Create structure commitment hash
    component commitmentHasher = Poseidon(maxComponents + 2);
    commitmentHasher.inputs[0] <== countryCode;
    commitmentHasher.inputs[1] <== hierarchyDepth;
    for (var i = 0; i < maxComponents; i++) {
        commitmentHasher.inputs[i + 2] <== components[i];
    }
    
    structureCommitment <== commitmentHasher.out;
}

// Utility: Check if value is zero
template IsZero() {
    signal input in;
    signal output out;
    
    signal inv;
    inv <-- in != 0 ? 1 / in : 0;
    out <== 1 - in * inv;
    in * out === 0;
}

// Main circuit with max 8 components (Country, Admin1-7)
component main {public [countryCode, hierarchyDepth]} = PIDStructureValidator(8);
