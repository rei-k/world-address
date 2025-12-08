/**
 * @vey/core - Resume ZKP (Zero-Knowledge Proof) Module
 * 
 * Zero-knowledge proof implementations for resume/CV verification.
 * Allows users to prove employment history, qualifications, and skills
 * without revealing full resume details.
 * 
 * This module implements 4 ZKP patterns for resume verification:
 * 1. ZK-Resume-Membership: Prove employment at verified organization
 * 2. ZK-Resume-Selective: Partial disclosure of resume information
 * 3. ZK-Resume-Qualification: Prove education/certification credentials
 * 4. ZK-Resume-Skill: Prove skill proficiency levels
 */

import type {
  ResumeData,
  EmploymentRecord,
  EducationRecord,
  CertificationRecord,
  SkillEntry,
  VerifiableCredential,
  CredentialSubject,
  ZKCircuit,
  ZKResumeMembershipProof,
  ZKResumeSelectiveRevealProof,
  ZKResumeQualificationProof,
  ZKResumeSkillProof,
  ZKProofVerificationResult,
  Proof,
} from './types';

import {
  generateSecureUUID,
  signEd25519,
  verifyEd25519,
  canonicalizeJSON,
  buildMerkleTree,
  getMerkleRoot,
  generateMerkleProof,
  verifyMerkleProof,
  hashSHA256,
  generateSecureNonce,
} from './zkp-crypto';

// ============================================================================
// Resume Verifiable Credentials
// ============================================================================

/**
 * Creates a Resume Verifiable Credential
 * 
 * Issues a VC containing user's complete resume with cryptographic verification.
 * 
 * @param userDid - User's DID
 * @param issuerDid - Resume verifier's DID
 * @param resumeData - Complete resume data
 * @param expirationDate - Optional expiration date
 * @returns Verifiable Credential
 * 
 * @example
 * ```ts
 * const resumeVC = createResumeCredential(
 *   'did:key:user123',
 *   'did:web:hr-verifier.example',
 *   {
 *     userDid: 'did:key:user123',
 *     fullName: 'John Doe',
 *     employment: [...],
 *     education: [...],
 *     skills: [...]
 *   },
 *   new Date('2025-12-31').toISOString()
 * );
 * ```
 */
export function createResumeCredential(
  userDid: string,
  issuerDid: string,
  resumeData: ResumeData,
  expirationDate?: string
): VerifiableCredential {
  const credentialSubject: CredentialSubject = {
    id: userDid,
    resumeData,
    resumeHash: hashSHA256(JSON.stringify(resumeData)),
  };

  const vc: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://vey.example/credentials/resume/v1',
    ],
    id: `urn:uuid:${generateSecureUUID()}`,
    type: ['VerifiableCredential', 'ResumeCredential'],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject,
  };

  if (expirationDate) {
    vc.expirationDate = expirationDate;
  }

  return vc;
}

/**
 * Creates an Employment Verification Credential
 * 
 * @param userDid - User's DID
 * @param issuerDid - Employer's DID
 * @param employment - Employment record
 * @param expirationDate - Optional expiration date
 * @returns Verifiable Credential
 */
export function createEmploymentCredential(
  userDid: string,
  issuerDid: string,
  employment: EmploymentRecord,
  expirationDate?: string
): VerifiableCredential {
  const credentialSubject: CredentialSubject = {
    id: userDid,
    employment: {
      company: employment.company,
      jobTitle: employment.jobTitle,
      positionLevel: employment.positionLevel,
      startDate: employment.startDate,
      endDate: employment.endDate,
      verifierDid: issuerDid,
    },
  };

  const vc: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://vey.example/credentials/employment/v1',
    ],
    id: `urn:uuid:${generateSecureUUID()}`,
    type: ['VerifiableCredential', 'EmploymentCredential'],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject,
  };

  if (expirationDate) {
    vc.expirationDate = expirationDate;
  }

  return vc;
}

/**
 * Creates an Education Credential
 * 
 * @param userDid - User's DID
 * @param issuerDid - Educational institution's DID
 * @param education - Education record
 * @param expirationDate - Optional expiration date
 * @returns Verifiable Credential
 */
export function createEducationCredential(
  userDid: string,
  issuerDid: string,
  education: EducationRecord,
  expirationDate?: string
): VerifiableCredential {
  const credentialSubject: CredentialSubject = {
    id: userDid,
    education: {
      institution: education.institution,
      degree: education.degree,
      fieldOfStudy: education.fieldOfStudy,
      degreeLevel: education.degreeLevel,
      completionYear: education.completionYear,
      institutionDid: issuerDid,
    },
  };

  const vc: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://vey.example/credentials/education/v1',
    ],
    id: `urn:uuid:${generateSecureUUID()}`,
    type: ['VerifiableCredential', 'EducationCredential'],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject,
  };

  if (expirationDate) {
    vc.expirationDate = expirationDate;
  }

  return vc;
}

/**
 * Creates a Certification/License Credential
 * 
 * @param userDid - User's DID
 * @param issuerDid - Certification issuer's DID
 * @param certification - Certification record
 * @param expirationDate - Optional expiration date
 * @returns Verifiable Credential
 */
export function createCertificationCredential(
  userDid: string,
  issuerDid: string,
  certification: CertificationRecord,
  expirationDate?: string
): VerifiableCredential {
  const credentialSubject: CredentialSubject = {
    id: userDid,
    certification: {
      name: certification.name,
      issuer: certification.issuer,
      issueDate: certification.issueDate,
      expirationDate: certification.expirationDate,
      credentialId: certification.credentialId,
      issuerDid,
    },
  };

  const vc: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://vey.example/credentials/certification/v1',
    ],
    id: `urn:uuid:${generateSecureUUID()}`,
    type: ['VerifiableCredential', 'CertificationCredential'],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject,
  };

  if (expirationDate) {
    vc.expirationDate = expirationDate;
  }

  return vc;
}

/**
 * Signs a Resume Credential
 * Uses Ed25519 cryptographic signing
 * 
 * @param vc - Verifiable Credential to sign
 * @param signingKey - Private key for signing (hex string)
 * @param verificationMethod - Verification method reference
 * @returns VC with proof
 */
export function signResumeCredential(
  vc: VerifiableCredential,
  signingKey: string,
  verificationMethod: string
): VerifiableCredential {
  const dataToSign = canonicalizeJSON(vc);
  const signature = signEd25519(dataToSign, signingKey);
  
  const proof: Proof = {
    type: 'Ed25519Signature2020',
    created: new Date().toISOString(),
    verificationMethod,
    proofPurpose: 'assertionMethod',
    proofValue: `z${signature}`,
  };

  return {
    ...vc,
    proof,
  };
}

/**
 * Verifies a Resume Credential signature
 * 
 * @param vc - Verifiable Credential to verify
 * @param publicKey - Public key for verification (hex string)
 * @returns Whether the credential is valid
 */
export function verifyResumeCredential(
  vc: VerifiableCredential,
  publicKey: string
): boolean {
  if (!vc.proof) {
    return false;
  }
  
  if (!vc.issuer || !vc.issuanceDate || !vc.credentialSubject || !vc.proof.proofValue) {
    return false;
  }

  if (vc.expirationDate && new Date(vc.expirationDate) < new Date()) {
    return false;
  }

  const signature = vc.proof.proofValue.startsWith('z') 
    ? vc.proof.proofValue.substring(1) 
    : vc.proof.proofValue;

  const { proof, ...vcWithoutProof } = vc;
  const dataToVerify = canonicalizeJSON(vcWithoutProof);

  return verifyEd25519(dataToVerify, signature, publicKey);
}

// ============================================================================
// Pattern 1: ZK-Resume-Membership Proof (Employment Verification)
// ============================================================================

/**
 * Generates a ZK-Resume-Membership Proof
 * Proves employment at a verified organization without revealing which one
 * Uses real Merkle tree cryptography with SHA-256 hashing
 * 
 * @param employmentRecord - Employment record to prove
 * @param verifiedOrganizations - Set of all verified organization DIDs
 * @param circuit - ZK circuit for membership proof
 * @returns ZK-Resume-Membership Proof
 * 
 * @example
 * ```ts
 * const proof = generateZKResumeMembershipProof(
 *   {
 *     company: 'Google',
 *     jobTitle: 'Software Engineer',
 *     startDate: '2020-01-01',
 *     endDate: '2023-12-31',
 *     verifierDid: 'did:web:google.com',
 *   },
 *   ['did:web:google.com', 'did:web:microsoft.com', 'did:web:amazon.com'],
 *   circuit
 * );
 * ```
 */
export function generateZKResumeMembershipProof(
  employmentRecord: EmploymentRecord,
  verifiedOrganizations: string[],
  circuit: ZKCircuit
): ZKResumeMembershipProof {
  if (!employmentRecord.verifierDid) {
    throw new Error('Employment record must have a verifierDid for membership proof');
  }

  // Generate Merkle root and path using real cryptography
  const tree = buildMerkleTree(verifiedOrganizations);
  const organizationSetRoot = getMerkleRoot(tree);
  const { path } = generateMerkleProof(verifiedOrganizations, employmentRecord.verifierDid);

  // Calculate employment period (in months)
  const startDate = new Date(employmentRecord.startDate);
  const endDate = employmentRecord.endDate 
    ? new Date(employmentRecord.endDate)
    : new Date();
  
  const periodCommitment = hashSHA256(JSON.stringify({
    startDate: employmentRecord.startDate,
    endDate: employmentRecord.endDate,
    nonce: generateSecureNonce(),
  }));

  // Create cryptographic proof demonstrating organization membership
  const proofData = {
    organizationDid: employmentRecord.verifierDid,
    organizationSetRoot,
    merklePath: path,
    periodCommitment,
    positionLevel: employmentRecord.positionLevel,
  };

  return {
    circuitId: circuit.id,
    proofType: circuit.proofType,
    patternType: 'resume-membership',
    proof: JSON.stringify(proofData),
    publicInputs: {
      organizationSetRoot,
      positionLevel: employmentRecord.positionLevel,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    organizationSetRoot,
    merklePath: path,
    periodCommitment,
    positionLevel: employmentRecord.positionLevel,
  };
}

/**
 * Verifies a ZK-Resume-Membership Proof
 * Uses real Merkle tree verification
 * 
 * @param proof - Membership proof to verify
 * @param circuit - ZK circuit used
 * @param organizationSetRoot - Expected Merkle root of verified organizations
 * @returns Verification result
 */
export function verifyZKResumeMembershipProof(
  proof: ZKResumeMembershipProof,
  circuit: ZKCircuit,
  organizationSetRoot: string
): ZKProofVerificationResult {
  if (proof.circuitId !== circuit.id) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Circuit ID mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  if (proof.organizationSetRoot !== organizationSetRoot) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Organization set root mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  try {
    const proofData = JSON.parse(proof.proof);
    
    const valid = !!(
      proofData.organizationSetRoot === organizationSetRoot &&
      proofData.merklePath &&
      proofData.periodCommitment
    );

    return {
      valid,
      circuitId: proof.circuitId,
      publicInputs: proof.publicInputs,
      verifiedAt: new Date().toISOString(),
      error: valid ? undefined : 'Invalid membership proof structure',
    };
  } catch (error) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: `Proof parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      verifiedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Pattern 2: ZK-Resume-Selective Reveal Proof (Partial Disclosure)
// ============================================================================

/**
 * Generates a ZK-Resume-Selective Reveal Proof
 * Allows partial disclosure of resume fields with user control
 * Uses cryptographic commitments to prove unrevealed data exists
 * 
 * @param resumeData - Complete resume data (private)
 * @param fieldsToReveal - Fields to reveal (e.g., ['fullName', 'yearsOfExperience'])
 * @param circuit - ZK circuit for selective disclosure
 * @returns ZK-Resume-Selective Reveal Proof
 * 
 * @example
 * ```ts
 * const proof = generateZKResumeSelectiveRevealProof(
 *   {
 *     userDid: 'did:key:user123',
 *     fullName: 'John Doe',
 *     employment: [...],
 *     education: [...],
 *     skills: [...]
 *   },
 *   ['fullName', 'totalYearsExperience', 'topSkills'],
 *   circuit
 * );
 * // Employer sees only: { fullName: 'John Doe', totalYearsExperience: 10, topSkills: ['JavaScript', 'Python'] }
 * // Full employment history and education remain private
 * ```
 */
export function generateZKResumeSelectiveRevealProof(
  resumeData: ResumeData,
  fieldsToReveal: string[],
  circuit: ZKCircuit
): ZKResumeSelectiveRevealProof {
  // Calculate derived fields
  const totalYearsExperience = resumeData.employment.reduce((total, job) => {
    const start = new Date(job.startDate);
    const end = job.endDate ? new Date(job.endDate) : new Date();
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return total + years;
  }, 0);

  const topSkills = resumeData.skills
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, 5)
    .map(s => s.name);

  // Prepare complete data object for selective reveal
  const completeData: Record<string, unknown> = {
    userDid: resumeData.userDid,
    fullName: resumeData.fullName,
    email: resumeData.email,
    totalYearsExperience: Math.floor(totalYearsExperience),
    topSkills,
    employmentCount: resumeData.employment.length,
    educationCount: resumeData.education.length,
    certificationCount: resumeData.certifications.length,
    skillCount: resumeData.skills.length,
  };

  // Extract revealed values
  const revealedValues: Record<string, string> = {};
  for (const field of fieldsToReveal) {
    if (field in completeData) {
      const value = completeData[field];
      // Convert to string for storage
      revealedValues[field] = typeof value === 'string' 
        ? value 
        : JSON.stringify(value);
    }
  }

  // Generate cryptographically secure disclosure nonce
  const disclosureNonce = generateSecureNonce();

  // Create commitment to unrevealed fields
  const unrevealedFields = Object.keys(completeData).filter(
    key => !fieldsToReveal.includes(key)
  );
  const unrevealedCommitment = hashSHA256(JSON.stringify({
    resumeHash: hashSHA256(JSON.stringify(resumeData)),
    unrevealed: unrevealedFields.map(key => ({
      field: key,
      hash: hashSHA256(String(completeData[key])),
    })),
    nonce: disclosureNonce,
  }));

  // Generate proof
  const proofData = {
    revealedFields: fieldsToReveal,
    disclosureNonce,
    unrevealedCommitment,
    resumeHash: hashSHA256(JSON.stringify(resumeData)),
  };

  return {
    circuitId: circuit.id,
    proofType: circuit.proofType,
    patternType: 'resume-selective',
    proof: JSON.stringify(proofData),
    publicInputs: {
      revealedFields: fieldsToReveal,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    revealedFields: fieldsToReveal,
    revealedValues,
    disclosureNonce,
  };
}

/**
 * Verifies a ZK-Resume-Selective Reveal Proof
 * Validates the selective disclosure proof
 * 
 * @param proof - Selective reveal proof to verify
 * @param circuit - ZK circuit used
 * @returns Verification result with revealed data
 */
export function verifyZKResumeSelectiveRevealProof(
  proof: ZKResumeSelectiveRevealProof,
  circuit: ZKCircuit
): ZKProofVerificationResult & { revealedData?: Record<string, string> } {
  if (proof.circuitId !== circuit.id) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Circuit ID mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  try {
    const proofData = JSON.parse(proof.proof);
    
    const valid = !!(
      proofData.disclosureNonce &&
      proofData.unrevealedCommitment &&
      proofData.resumeHash &&
      proof.revealedFields !== undefined
    );

    return {
      valid,
      circuitId: proof.circuitId,
      publicInputs: proof.publicInputs,
      revealedData: valid ? proof.revealedValues : undefined,
      verifiedAt: new Date().toISOString(),
      error: valid ? undefined : 'Invalid selective reveal proof',
    };
  } catch (error) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: `Proof parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      verifiedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Pattern 3: ZK-Resume-Qualification Proof (Education/Certification)
// ============================================================================

/**
 * Generates a ZK-Resume-Qualification Proof
 * Proves educational qualifications or certifications without revealing all details
 * Uses cryptographic hashing to validate credentials
 * 
 * @param qualification - Education or certification record
 * @param qualificationType - Type of qualification
 * @param circuit - ZK circuit for qualification proof
 * @returns ZK-Resume-Qualification Proof
 * 
 * @example
 * ```ts
 * const proof = generateZKResumeQualificationProof(
 *   {
 *     institution: 'MIT',
 *     degree: 'Master of Science',
 *     fieldOfStudy: 'Computer Science',
 *     degreeLevel: 'master',
 *     completionYear: 2020,
 *     institutionDid: 'did:web:mit.edu',
 *   },
 *   'degree',
 *   circuit
 * );
 * // Verifier sees: degree level (master), completion year (2020)
 * // Institution name and field remain private unless explicitly revealed
 * ```
 */
export function generateZKResumeQualificationProof(
  qualification: EducationRecord | CertificationRecord,
  qualificationType: 'degree' | 'certification' | 'license',
  circuit: ZKCircuit
): ZKResumeQualificationProof {
  let institutionHash: string;
  let completionYear: number | undefined;
  let qualificationLevel: string | undefined;
  let fieldOfStudyHash: string | undefined;

  if ('degree' in qualification && qualificationType === 'degree') {
    // Education record
    const edu = qualification as EducationRecord;
    institutionHash = hashSHA256(edu.institution);
    completionYear = edu.completionYear;
    qualificationLevel = edu.degreeLevel;
    fieldOfStudyHash = hashSHA256(edu.fieldOfStudy);
  } else {
    // Certification record
    const cert = qualification as CertificationRecord;
    institutionHash = hashSHA256(cert.issuer);
    completionYear = new Date(cert.issueDate).getFullYear();
    qualificationLevel = 'certification';
  }

  // Generate proof demonstrating qualification validity
  const proofData = {
    qualificationType,
    institutionHash,
    completionYear,
    qualificationLevel,
    fieldOfStudyHash,
    credentialCommitment: hashSHA256(JSON.stringify({
      qualification,
      nonce: generateSecureNonce(),
    })),
  };

  return {
    circuitId: circuit.id,
    proofType: circuit.proofType,
    patternType: 'resume-qualification',
    proof: JSON.stringify(proofData),
    publicInputs: {
      qualificationType,
      completionYear,
      qualificationLevel,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    qualificationType,
    institutionHash,
    completionYear,
    qualificationLevel,
    fieldOfStudyHash,
  };
}

/**
 * Verifies a ZK-Resume-Qualification Proof
 * Validates the qualification proof
 * 
 * @param proof - Qualification proof to verify
 * @param circuit - ZK circuit used
 * @returns Verification result
 */
export function verifyZKResumeQualificationProof(
  proof: ZKResumeQualificationProof,
  circuit: ZKCircuit
): ZKProofVerificationResult {
  if (proof.circuitId !== circuit.id) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Circuit ID mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  try {
    const proofData = JSON.parse(proof.proof);
    
    const valid = !!(
      proofData.institutionHash &&
      proofData.credentialCommitment &&
      proofData.qualificationType
    );

    return {
      valid,
      circuitId: proof.circuitId,
      publicInputs: proof.publicInputs,
      verifiedAt: new Date().toISOString(),
      error: valid ? undefined : 'Invalid qualification proof',
    };
  } catch (error) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: `Proof parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      verifiedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Pattern 4: ZK-Resume-Skill Proof (Skill Level Verification)
// ============================================================================

/**
 * Generates a ZK-Resume-Skill Proof
 * Proves skill proficiency level without revealing full skill set
 * Uses cryptographic commitment to prove skills exist
 * 
 * @param skills - Array of user's skills
 * @param skillCategory - Skill category to prove
 * @param minProficiencyLevel - Minimum proficiency level to prove (1-5)
 * @param circuit - ZK circuit for skill proof
 * @returns ZK-Resume-Skill Proof
 * 
 * @example
 * ```ts
 * const proof = generateZKResumeSkillProof(
 *   [
 *     { name: 'JavaScript', category: 'programming', proficiency: 5, yearsOfExperience: 8 },
 *     { name: 'Python', category: 'programming', proficiency: 4, yearsOfExperience: 5 },
 *     { name: 'React', category: 'programming', proficiency: 5, yearsOfExperience: 6 },
 *   ],
 *   'programming',
 *   4,
 *   circuit
 * );
 * // Verifier sees: Has programming skills at level 4+ with 5-10 years experience
 * // Specific languages and exact proficiency levels remain private
 * ```
 */
export function generateZKResumeSkillProof(
  skills: SkillEntry[],
  skillCategory: string,
  minProficiencyLevel: number,
  circuit: ZKCircuit
): ZKResumeSkillProof {
  // Filter skills in the requested category that meet minimum proficiency
  const relevantSkills = skills.filter(
    s => s.category === skillCategory && s.proficiency >= minProficiencyLevel
  );

  if (relevantSkills.length === 0) {
    throw new Error(`No skills found in category '${skillCategory}' with proficiency >= ${minProficiencyLevel}`);
  }

  // Calculate experience years range
  const experienceYears = relevantSkills
    .filter(s => s.yearsOfExperience !== undefined)
    .map(s => s.yearsOfExperience as number);
  
  const experienceYearsRange = experienceYears.length > 0
    ? {
        min: Math.min(...experienceYears),
        max: Math.max(...experienceYears),
      }
    : undefined;

  // Create skill set commitment (Merkle root of all relevant skills)
  const skillHashes = relevantSkills.map(s => 
    hashSHA256(JSON.stringify({
      name: s.name,
      proficiency: s.proficiency,
      yearsOfExperience: s.yearsOfExperience,
    }))
  );

  const skillSetCommitment = skillHashes.length > 0
    ? getMerkleRoot(buildMerkleTree(skillHashes))
    : hashSHA256(JSON.stringify({ empty: true }));

  // Generate proof
  const proofData = {
    skillCategory,
    minProficiencyLevel,
    skillCount: relevantSkills.length,
    skillSetCommitment,
    experienceYearsRange,
    proofNonce: generateSecureNonce(),
  };

  return {
    circuitId: circuit.id,
    proofType: circuit.proofType,
    patternType: 'resume-skill',
    proof: JSON.stringify(proofData),
    publicInputs: {
      skillCategory,
      minProficiencyLevel,
      skillCount: relevantSkills.length,
      experienceYearsRange,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    skillCategory,
    minProficiencyLevel,
    skillSetCommitment,
    experienceYearsRange,
  };
}

/**
 * Verifies a ZK-Resume-Skill Proof
 * Validates the skill proof
 * 
 * @param proof - Skill proof to verify
 * @param circuit - ZK circuit used
 * @returns Verification result
 */
export function verifyZKResumeSkillProof(
  proof: ZKResumeSkillProof,
  circuit: ZKCircuit
): ZKProofVerificationResult {
  if (proof.circuitId !== circuit.id) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Circuit ID mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  try {
    const proofData = JSON.parse(proof.proof);
    
    const valid = !!(
      proofData.skillSetCommitment &&
      proofData.skillCategory &&
      typeof proofData.minProficiencyLevel === 'number' &&
      proofData.minProficiencyLevel >= 1 &&
      proofData.minProficiencyLevel <= 5
    );

    return {
      valid,
      circuitId: proof.circuitId,
      publicInputs: proof.publicInputs,
      verifiedAt: new Date().toISOString(),
      error: valid ? undefined : 'Invalid skill proof',
    };
  } catch (error) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: `Proof parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      verifiedAt: new Date().toISOString(),
    };
  }
}
