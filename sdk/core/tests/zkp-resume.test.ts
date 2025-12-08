/**
 * @vey/core - Resume ZKP Tests
 * 
 * Comprehensive tests for resume zero-knowledge proof functionality
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  // Resume Verifiable Credentials
  createResumeCredential,
  createEmploymentCredential,
  createEducationCredential,
  createCertificationCredential,
  signResumeCredential,
  verifyResumeCredential,
  
  // Resume ZKP Pattern Functions
  generateZKResumeMembershipProof,
  verifyZKResumeMembershipProof,
  generateZKResumeSelectiveRevealProof,
  verifyZKResumeSelectiveRevealProof,
  generateZKResumeQualificationProof,
  verifyZKResumeQualificationProof,
  generateZKResumeSkillProof,
  verifyZKResumeSkillProof,
} from '../src/zkp-resume';

// Import circuit creation from zkp module
import { createZKCircuit } from '../src/zkp';

import { generateEd25519KeyPair, buildMerkleTree, getMerkleRoot } from '../src/zkp-crypto';

import type {
  ResumeData,
  EmploymentRecord,
  EducationRecord,
  CertificationRecord,
  SkillEntry,
  ZKCircuit,
} from '../src/types';

describe('Resume Verifiable Credentials', () => {
  let keyPair: { privateKey: string; publicKey: string };

  beforeAll(() => {
    keyPair = generateEd25519KeyPair();
  });

  describe('createResumeCredential', () => {
    it('should create a valid resume credential', () => {
      const userDid = 'did:key:user123';
      const issuerDid = 'did:web:hr-verifier.example';
      
      const resumeData: ResumeData = {
        userDid,
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        employment: [
          {
            company: 'Google',
            jobTitle: 'Software Engineer',
            positionLevel: 'senior',
            startDate: '2020-01-01',
            endDate: '2023-12-31',
            verifierDid: 'did:web:google.com',
          },
        ],
        education: [
          {
            institution: 'MIT',
            degree: 'Master of Science',
            fieldOfStudy: 'Computer Science',
            degreeLevel: 'master',
            completionYear: 2019,
            institutionDid: 'did:web:mit.edu',
          },
        ],
        certifications: [],
        skills: [
          {
            name: 'JavaScript',
            category: 'programming',
            proficiency: 5,
            yearsOfExperience: 10,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const vc = createResumeCredential(userDid, issuerDid, resumeData);

      expect(vc).toBeDefined();
      expect(vc.type).toContain('ResumeCredential');
      expect(vc.issuer).toBe(issuerDid);
      expect(vc.credentialSubject.id).toBe(userDid);
      expect(vc.credentialSubject.resumeData).toEqual(resumeData);
      expect(vc.credentialSubject.resumeHash).toBeDefined();
    });

    it('should include expiration date when provided', () => {
      const userDid = 'did:key:user123';
      const issuerDid = 'did:web:hr-verifier.example';
      const expirationDate = new Date('2025-12-31').toISOString();
      
      const resumeData: ResumeData = {
        userDid,
        fullName: 'John Doe',
        employment: [],
        education: [],
        certifications: [],
        skills: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const vc = createResumeCredential(userDid, issuerDid, resumeData, expirationDate);

      expect(vc.expirationDate).toBe(expirationDate);
    });
  });

  describe('createEmploymentCredential', () => {
    it('should create a valid employment credential', () => {
      const userDid = 'did:key:user123';
      const issuerDid = 'did:web:google.com';
      
      const employment: EmploymentRecord = {
        company: 'Google',
        jobTitle: 'Senior Software Engineer',
        positionLevel: 'senior',
        startDate: '2020-01-01',
        endDate: '2023-12-31',
        verifierDid: issuerDid,
      };

      const vc = createEmploymentCredential(userDid, issuerDid, employment);

      expect(vc).toBeDefined();
      expect(vc.type).toContain('EmploymentCredential');
      expect(vc.credentialSubject.employment).toBeDefined();
      expect(vc.credentialSubject.employment.company).toBe('Google');
    });
  });

  describe('createEducationCredential', () => {
    it('should create a valid education credential', () => {
      const userDid = 'did:key:user123';
      const issuerDid = 'did:web:mit.edu';
      
      const education: EducationRecord = {
        institution: 'MIT',
        degree: 'Master of Science',
        fieldOfStudy: 'Computer Science',
        degreeLevel: 'master',
        completionYear: 2019,
        institutionDid: issuerDid,
      };

      const vc = createEducationCredential(userDid, issuerDid, education);

      expect(vc).toBeDefined();
      expect(vc.type).toContain('EducationCredential');
      expect(vc.credentialSubject.education).toBeDefined();
      expect(vc.credentialSubject.education.degree).toBe('Master of Science');
    });
  });

  describe('signResumeCredential and verifyResumeCredential', () => {
    it('should sign and verify a resume credential', () => {
      const userDid = 'did:key:user123';
      const issuerDid = 'did:web:hr-verifier.example';
      
      const resumeData: ResumeData = {
        userDid,
        fullName: 'John Doe',
        employment: [],
        education: [],
        certifications: [],
        skills: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const vc = createResumeCredential(userDid, issuerDid, resumeData);
      const signedVC = signResumeCredential(vc, keyPair.privateKey, `${issuerDid}#key-1`);

      expect(signedVC.proof).toBeDefined();
      expect(signedVC.proof?.type).toBe('Ed25519Signature2020');
      
      const isValid = verifyResumeCredential(signedVC, keyPair.publicKey);
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong public key', () => {
      const userDid = 'did:key:user123';
      const issuerDid = 'did:web:hr-verifier.example';
      
      const resumeData: ResumeData = {
        userDid,
        fullName: 'John Doe',
        employment: [],
        education: [],
        certifications: [],
        skills: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const vc = createResumeCredential(userDid, issuerDid, resumeData);
      const signedVC = signResumeCredential(vc, keyPair.privateKey, `${issuerDid}#key-1`);

      const wrongKeyPair = generateEd25519KeyPair();
      const isValid = verifyResumeCredential(signedVC, wrongKeyPair.publicKey);
      expect(isValid).toBe(false);
    });

    it('should fail verification for expired credential', () => {
      const userDid = 'did:key:user123';
      const issuerDid = 'did:web:hr-verifier.example';
      const pastDate = new Date('2020-01-01').toISOString();
      
      const resumeData: ResumeData = {
        userDid,
        fullName: 'John Doe',
        employment: [],
        education: [],
        certifications: [],
        skills: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const vc = createResumeCredential(userDid, issuerDid, resumeData, pastDate);
      const signedVC = signResumeCredential(vc, keyPair.privateKey, `${issuerDid}#key-1`);

      const isValid = verifyResumeCredential(signedVC, keyPair.publicKey);
      expect(isValid).toBe(false);
    });
  });
});

describe('ZK-Resume-Membership Proof', () => {
  let circuit: ZKCircuit;
  let verifiedOrganizations: string[];
  let organizationSetRoot: string;

  beforeAll(() => {
    circuit = createZKCircuit(
      'resume-membership-v1',
      'Resume Membership Circuit',
      'Verifies employment at verified organizations'
    );

    verifiedOrganizations = [
      'did:web:google.com',
      'did:web:microsoft.com',
      'did:web:amazon.com',
      'did:web:apple.com',
      'did:web:meta.com',
    ];

    const tree = buildMerkleTree(verifiedOrganizations);
    organizationSetRoot = getMerkleRoot(tree);
  });

  describe('generateZKResumeMembershipProof', () => {
    it('should generate a valid membership proof', () => {
      const employment: EmploymentRecord = {
        company: 'Google',
        jobTitle: 'Software Engineer',
        positionLevel: 'senior',
        startDate: '2020-01-01',
        endDate: '2023-12-31',
        verifierDid: 'did:web:google.com',
      };

      const proof = generateZKResumeMembershipProof(
        employment,
        verifiedOrganizations,
        circuit
      );

      expect(proof).toBeDefined();
      expect(proof.patternType).toBe('resume-membership');
      expect(proof.organizationSetRoot).toBe(organizationSetRoot);
      expect(proof.positionLevel).toBe('senior');
      expect(proof.merklePath).toBeDefined();
      expect(proof.periodCommitment).toBeDefined();
    });

    it('should throw error if employment has no verifierDid', () => {
      const employment: EmploymentRecord = {
        company: 'Unknown Company',
        jobTitle: 'Developer',
        startDate: '2020-01-01',
      };

      expect(() => {
        generateZKResumeMembershipProof(employment, verifiedOrganizations, circuit);
      }).toThrow('Employment record must have a verifierDid for membership proof');
    });
  });

  describe('verifyZKResumeMembershipProof', () => {
    it('should verify a valid membership proof', () => {
      const employment: EmploymentRecord = {
        company: 'Microsoft',
        jobTitle: 'Principal Engineer',
        positionLevel: 'executive',
        startDate: '2018-06-01',
        endDate: null,
        verifierDid: 'did:web:microsoft.com',
      };

      const proof = generateZKResumeMembershipProof(
        employment,
        verifiedOrganizations,
        circuit
      );

      const result = verifyZKResumeMembershipProof(proof, circuit, organizationSetRoot);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.publicInputs).toBeDefined();
    });

    it('should fail verification with wrong circuit', () => {
      const employment: EmploymentRecord = {
        company: 'Amazon',
        jobTitle: 'SDE',
        positionLevel: 'mid',
        startDate: '2021-01-01',
        verifierDid: 'did:web:amazon.com',
      };

      const proof = generateZKResumeMembershipProof(
        employment,
        verifiedOrganizations,
        circuit
      );

      const wrongCircuit = createZKCircuit('wrong-circuit', 'Wrong Circuit');
      const result = verifyZKResumeMembershipProof(proof, wrongCircuit, organizationSetRoot);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Circuit ID mismatch');
    });

    it('should fail verification with wrong organization set root', () => {
      const employment: EmploymentRecord = {
        company: 'Apple',
        jobTitle: 'iOS Engineer',
        positionLevel: 'senior',
        startDate: '2019-03-15',
        verifierDid: 'did:web:apple.com',
      };

      const proof = generateZKResumeMembershipProof(
        employment,
        verifiedOrganizations,
        circuit
      );

      const wrongRoot = 'wrong-merkle-root-hash';
      const result = verifyZKResumeMembershipProof(proof, circuit, wrongRoot);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Organization set root mismatch');
    });
  });
});

describe('ZK-Resume-Selective Reveal Proof', () => {
  let circuit: ZKCircuit;
  let resumeData: ResumeData;

  beforeAll(() => {
    circuit = createZKCircuit(
      'resume-selective-v1',
      'Resume Selective Reveal Circuit',
      'Allows selective disclosure of resume fields'
    );

    resumeData = {
      userDid: 'did:key:user123',
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      employment: [
        {
          company: 'Google',
          jobTitle: 'Senior Software Engineer',
          positionLevel: 'senior',
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          skills: ['JavaScript', 'Python', 'Go'],
        },
        {
          company: 'Microsoft',
          jobTitle: 'Software Engineer',
          positionLevel: 'mid',
          startDate: '2017-06-01',
          endDate: '2019-12-31',
          skills: ['C#', 'TypeScript'],
        },
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          degreeLevel: 'bachelor',
          completionYear: 2017,
        },
      ],
      certifications: [],
      skills: [
        { name: 'JavaScript', category: 'programming', proficiency: 5, yearsOfExperience: 8 },
        { name: 'Python', category: 'programming', proficiency: 4, yearsOfExperience: 6 },
        { name: 'React', category: 'programming', proficiency: 5, yearsOfExperience: 5 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  describe('generateZKResumeSelectiveRevealProof', () => {
    it('should generate proof revealing only selected fields', () => {
      const fieldsToReveal = ['fullName', 'totalYearsExperience', 'employmentCount'];

      const proof = generateZKResumeSelectiveRevealProof(
        resumeData,
        fieldsToReveal,
        circuit
      );

      expect(proof).toBeDefined();
      expect(proof.patternType).toBe('resume-selective');
      expect(proof.revealedFields).toEqual(fieldsToReveal);
      expect(proof.revealedValues.fullName).toBe('Jane Smith');
      expect(proof.revealedValues.totalYearsExperience).toBeDefined();
      expect(proof.revealedValues.employmentCount).toBe('2');
      expect(proof.disclosureNonce).toBeDefined();
    });

    it('should reveal top skills when requested', () => {
      const fieldsToReveal = ['topSkills'];

      const proof = generateZKResumeSelectiveRevealProof(
        resumeData,
        fieldsToReveal,
        circuit
      );

      expect(proof.revealedValues.topSkills).toBeDefined();
      const topSkills = JSON.parse(proof.revealedValues.topSkills);
      expect(Array.isArray(topSkills)).toBe(true);
      expect(topSkills.length).toBeLessThanOrEqual(5);
    });

    it('should not reveal unrequested fields', () => {
      const fieldsToReveal = ['fullName'];

      const proof = generateZKResumeSelectiveRevealProof(
        resumeData,
        fieldsToReveal,
        circuit
      );

      expect(proof.revealedValues.email).toBeUndefined();
      expect(proof.revealedValues.totalYearsExperience).toBeUndefined();
    });
  });

  describe('verifyZKResumeSelectiveRevealProof', () => {
    it('should verify a valid selective reveal proof', () => {
      const fieldsToReveal = ['fullName', 'employmentCount'];

      const proof = generateZKResumeSelectiveRevealProof(
        resumeData,
        fieldsToReveal,
        circuit
      );

      const result = verifyZKResumeSelectiveRevealProof(proof, circuit);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.revealedData).toBeDefined();
      expect(result.revealedData?.fullName).toBe('Jane Smith');
    });

    it('should fail verification with wrong circuit', () => {
      const proof = generateZKResumeSelectiveRevealProof(
        resumeData,
        ['fullName'],
        circuit
      );

      const wrongCircuit = createZKCircuit('wrong-circuit', 'Wrong Circuit');
      const result = verifyZKResumeSelectiveRevealProof(proof, wrongCircuit);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Circuit ID mismatch');
    });
  });
});

describe('ZK-Resume-Qualification Proof', () => {
  let circuit: ZKCircuit;

  beforeAll(() => {
    circuit = createZKCircuit(
      'resume-qualification-v1',
      'Resume Qualification Circuit',
      'Verifies educational qualifications'
    );
  });

  describe('generateZKResumeQualificationProof', () => {
    it('should generate proof for degree qualification', () => {
      const education: EducationRecord = {
        institution: 'MIT',
        degree: 'Master of Science',
        fieldOfStudy: 'Computer Science',
        degreeLevel: 'master',
        completionYear: 2019,
        institutionDid: 'did:web:mit.edu',
      };

      const proof = generateZKResumeQualificationProof(education, 'degree', circuit);

      expect(proof).toBeDefined();
      expect(proof.patternType).toBe('resume-qualification');
      expect(proof.qualificationType).toBe('degree');
      expect(proof.completionYear).toBe(2019);
      expect(proof.qualificationLevel).toBe('master');
      expect(proof.institutionHash).toBeDefined();
      expect(proof.fieldOfStudyHash).toBeDefined();
    });

    it('should generate proof for certification', () => {
      const certification: CertificationRecord = {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: '2022-06-15',
        issuerDid: 'did:web:aws.amazon.com',
      };

      const proof = generateZKResumeQualificationProof(certification, 'certification', circuit);

      expect(proof).toBeDefined();
      expect(proof.qualificationType).toBe('certification');
      expect(proof.completionYear).toBe(2022);
      expect(proof.qualificationLevel).toBe('certification');
      expect(proof.institutionHash).toBeDefined();
    });
  });

  describe('verifyZKResumeQualificationProof', () => {
    it('should verify a valid qualification proof', () => {
      const education: EducationRecord = {
        institution: 'Stanford University',
        degree: 'PhD',
        fieldOfStudy: 'Machine Learning',
        degreeLevel: 'doctorate',
        completionYear: 2021,
        institutionDid: 'did:web:stanford.edu',
      };

      const proof = generateZKResumeQualificationProof(education, 'degree', circuit);
      const result = verifyZKResumeQualificationProof(proof, circuit);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail verification with wrong circuit', () => {
      const education: EducationRecord = {
        institution: 'Harvard',
        degree: 'MBA',
        fieldOfStudy: 'Business Administration',
        degreeLevel: 'master',
        completionYear: 2020,
      };

      const proof = generateZKResumeQualificationProof(education, 'degree', circuit);
      const wrongCircuit = createZKCircuit('wrong-circuit', 'Wrong Circuit');
      const result = verifyZKResumeQualificationProof(proof, wrongCircuit);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Circuit ID mismatch');
    });
  });
});

describe('ZK-Resume-Skill Proof', () => {
  let circuit: ZKCircuit;
  let skills: SkillEntry[];

  beforeAll(() => {
    circuit = createZKCircuit(
      'resume-skill-v1',
      'Resume Skill Circuit',
      'Verifies skill proficiency levels'
    );

    skills = [
      { name: 'JavaScript', category: 'programming', proficiency: 5, yearsOfExperience: 10 },
      { name: 'Python', category: 'programming', proficiency: 4, yearsOfExperience: 7 },
      { name: 'React', category: 'programming', proficiency: 5, yearsOfExperience: 6 },
      { name: 'TypeScript', category: 'programming', proficiency: 4, yearsOfExperience: 5 },
      { name: 'Leadership', category: 'management', proficiency: 4, yearsOfExperience: 3 },
      { name: 'Agile', category: 'management', proficiency: 5, yearsOfExperience: 8 },
    ];
  });

  describe('generateZKResumeSkillProof', () => {
    it('should generate proof for programming skills', () => {
      const proof = generateZKResumeSkillProof(
        skills,
        'programming',
        4,
        circuit
      );

      expect(proof).toBeDefined();
      expect(proof.patternType).toBe('resume-skill');
      expect(proof.skillCategory).toBe('programming');
      expect(proof.minProficiencyLevel).toBe(4);
      expect(proof.skillSetCommitment).toBeDefined();
      expect(proof.experienceYearsRange).toBeDefined();
      expect(proof.experienceYearsRange?.min).toBeGreaterThan(0);
    });

    it('should generate proof for management skills', () => {
      const proof = generateZKResumeSkillProof(
        skills,
        'management',
        4,
        circuit
      );

      expect(proof).toBeDefined();
      expect(proof.skillCategory).toBe('management');
      expect(proof.publicInputs.skillCount).toBe(2); // Leadership (4) and Agile (5)
    });

    it('should throw error if no skills meet criteria', () => {
      expect(() => {
        generateZKResumeSkillProof(skills, 'design', 3, circuit);
      }).toThrow("No skills found in category 'design'");
    });

    it('should only count skills at or above minimum proficiency', () => {
      const proof = generateZKResumeSkillProof(
        skills,
        'programming',
        5,
        circuit
      );

      // Only JavaScript (5) and React (5) have proficiency 5
      expect(proof.publicInputs.skillCount).toBe(2);
    });
  });

  describe('verifyZKResumeSkillProof', () => {
    it('should verify a valid skill proof', () => {
      const proof = generateZKResumeSkillProof(
        skills,
        'programming',
        4,
        circuit
      );

      const result = verifyZKResumeSkillProof(proof, circuit);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.publicInputs).toBeDefined();
    });

    it('should fail verification with wrong circuit', () => {
      const proof = generateZKResumeSkillProof(
        skills,
        'programming',
        4,
        circuit
      );

      const wrongCircuit = createZKCircuit('wrong-circuit', 'Wrong Circuit');
      const result = verifyZKResumeSkillProof(proof, wrongCircuit);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Circuit ID mismatch');
    });
  });
});
