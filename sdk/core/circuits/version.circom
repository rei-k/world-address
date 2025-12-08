pragma circom 2.0.0;

/*
 * ZK-Version Circuit
 * 
 * Purpose: Proves consistency between old and new PID after address change
 * Use Case: Prove same person/entity owns both addresses during migration
 * 
 * Implementation: Linkable commitments with ownership proof
 * - Private Inputs: Old PID, new PID, user secret key
 * - Public Inputs: Old PID hash, new PID hash, ownership token
 * - Output: Proof of continuity and ownership
 */

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template VersionProofValidator() {
    // Private inputs
    signal input oldPID;                // Previous PID (private)
    signal input newPID;                // New PID (private)
    signal input userSecret;            // User's secret key (private)
    signal input migrationNonce;        // Random nonce for this migration (private)
    
    // Public inputs
    signal input oldPIDCommitment;      // Hash of old PID (public)
    signal input newPIDCommitment;      // Hash of new PID (public)
    
    // Outputs
    signal output ownershipProof;       // Proof of same owner
    signal output migrationCommitment;  // Commitment to this migration
    
    // Verify old PID commitment
    component oldPIDHasher = Poseidon(1);
    oldPIDHasher.inputs[0] <== oldPID;
    
    component oldPIDCheck = IsEqual();
    oldPIDCheck.in[0] <== oldPIDHasher.out;
    oldPIDCheck.in[1] <== oldPIDCommitment;
    oldPIDCheck.out === 1;
    
    // Verify new PID commitment
    component newPIDHasher = Poseidon(1);
    newPIDHasher.inputs[0] <== newPID;
    
    component newPIDCheck = IsEqual();
    newPIDCheck.in[0] <== newPIDHasher.out;
    newPIDCheck.in[1] <== newPIDCommitment;
    newPIDCheck.out === 1;
    
    // Generate ownership proof linking both PIDs to same user
    // ownershipProof = Hash(userSecret, oldPID, newPID)
    component ownershipHasher = Poseidon(3);
    ownershipHasher.inputs[0] <== userSecret;
    ownershipHasher.inputs[1] <== oldPID;
    ownershipHasher.inputs[2] <== newPID;
    ownershipProof <== ownershipHasher.out;
    
    // Generate migration commitment
    // migrationCommitment = Hash(oldPID, newPID, ownershipProof, nonce)
    component migrationHasher = Poseidon(4);
    migrationHasher.inputs[0] <== oldPID;
    migrationHasher.inputs[1] <== newPID;
    migrationHasher.inputs[2] <== ownershipProof;
    migrationHasher.inputs[3] <== migrationNonce;
    migrationCommitment <== migrationHasher.out;
}

// Main circuit
component main {public [oldPIDCommitment, newPIDCommitment]} = VersionProofValidator();
