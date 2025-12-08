/**
 * @vey/core - Core types and interfaces for World Address SDK
 */

/** Language information for address representation */
export interface Language {
  name: string;
  code?: string; // ISO 639-1/639-2 language code (e.g., 'en', 'ja', 'de')
  script: string;
  direction: 'ltr' | 'rtl';
  role: 'official' | 'auxiliary' | 'shipping_required' | 'co-official' | 'working_language';
  required_for_shipping?: boolean;
  country_name?: string;
  field_labels?: Record<string, string>; // Localized field labels for this language
}

/** Local name variant */
export interface LocalName {
  lang: string;
  value: string;
  script: string;
  direction: 'ltr' | 'rtl';
}

/** ISO country codes */
export interface IsoCodes {
  alpha2: string;
  alpha3?: string;
  numeric?: string;
}

/** Address field definition */
export interface AddressField {
  required: boolean;
  example?: string;
  label_local?: string;
  label_en?: string;
  regex?: string;
  length?: number;
  description?: string;
  type?: string;
  count?: number;
  since?: number;
  value?: string;
}

/** Address format order variant */
export interface OrderVariant {
  context: 'domestic' | 'international' | 'postal';
  order: string[];
}

/** Address format definition */
export interface AddressFormat {
  order?: string[];
  order_variants?: OrderVariant[];
  recipient?: AddressField;
  building?: AddressField;
  floor?: AddressField;
  room?: AddressField;
  unit?: AddressField;
  street_address?: AddressField;
  district?: AddressField;
  ward?: AddressField;
  city?: AddressField;
  province?: AddressField;
  postal_code?: AddressField;
  country?: AddressField;
}

/** Administrative division level */
export interface AdministrativeDivision {
  type: string;
  label_local?: string;
  label_en?: string;
  count?: number;
  required?: boolean;
  source?: string;
}

/** Administrative divisions structure */
export interface AdministrativeDivisions {
  level1?: AdministrativeDivision;
  level2?: AdministrativeDivision;
  level3?: AdministrativeDivision;
}

/** Validation rules */
export interface Validation {
  allow_latin_transliteration?: boolean;
  postal_code_rules?: {
    general?: string;
    exceptions?: string;
  };
  fallback?: string;
  rules?: string[];
}

/** Address examples */
export interface AddressExamples {
  domestic_raw?: string;
  domestic_normalized?: string;
  international?: string;
}

/** Country status */
export interface CountryStatus {
  un_member?: boolean;
  recognized?: boolean;
  disputed?: boolean;
}

/** Complete country address format */
export interface CountryAddressFormat {
  name: {
    en: string;
    local?: LocalName[];
  };
  iso_codes: IsoCodes;
  continent?: string;
  subregion?: string;
  languages: Language[];
  administrative_divisions?: AdministrativeDivisions;
  address_format: AddressFormat;
  validation?: Validation;
  examples?: AddressExamples;
  status?: CountryStatus;
}

/** Address input for validation */
export interface AddressInput {
  recipient?: string;
  building?: string;
  floor?: string;
  room?: string;
  unit?: string;
  street_address?: string;
  district?: string;
  ward?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  normalized?: AddressInput;
}

/** Validation error */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

/** Validation warning */
export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

/** SDK Configuration */
export interface VeyConfig {
  apiKey?: string;
  environment?: 'sandbox' | 'production';
  language?: string;
  dataPath?: string;
}

/** Webhook event types */
export type WebhookEventType = 
  | 'address.created'
  | 'address.updated'
  | 'address.deleted'
  | 'address.verified'
  | 'delivery.started'
  | 'delivery.completed'
  | 'delivery.failed';

/** Webhook payload */
export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
  signature?: string;
}

/** Region hierarchy for hierarchical picker */
export interface RegionHierarchy {
  continent: string;
  countries: {
    code: string;
    name: string;
    provinces?: {
      code: string;
      name: string;
      cities?: {
        code?: string;
        name: string;
        districts?: {
          code?: string;
          name: string;
        }[];
      }[];
    }[];
  }[];
}

/**
 * Address PID (Place ID) Components
 * 
 * Hierarchical ID structure: <Country>-<Admin1>-<Admin2>-<Locality>-<Sublocality>-<Block>-<Building>-<Unit>
 * Example: JP-13-113-01-T07-B12-BN02-R342
 */
export interface PIDComponents {
  /** ISO 3166-1 alpha-2 country code (e.g., 'JP') */
  country: string;
  /** First administrative level code (e.g., '13' for Tokyo) */
  admin1?: string;
  /** Second administrative level code (e.g., '113' for Shibuya) */
  admin2?: string;
  /** Locality code (e.g., '01') */
  locality?: string;
  /** Sublocality code (e.g., 'T07' for 7-chome) */
  sublocality?: string;
  /** Block code (e.g., 'B12' for block 12) */
  block?: string;
  /** Building code (e.g., 'BN02' for building 02) */
  building?: string;
  /** Unit/room code (e.g., 'R342' for room 342) */
  unit?: string;
  /** Collision counter suffix (e.g., 'C01' for first collision) */
  collision?: string;
}

/**
 * Address PID representation
 * 
 * PID serves as:
 * 1. Unique identifier for world addresses
 * 2. Lossless key to address hierarchy DAG
 * 3. ZK proof input for address validity verification
 * 4. Shipping routing code compatible with WMS/TMS/Carrier
 */
export interface AddressPID {
  /** Full PID string (e.g., 'JP-13-113-01-T07-B12-BN02-R342') */
  pid: string;
  /** Parsed PID components */
  components: PIDComponents;
  /** Whether this PID has been validated */
  validated?: boolean;
}

/** PID validation result */
export interface PIDValidationResult {
  /** Whether the PID is valid */
  valid: boolean;
  /** Validation errors */
  errors: PIDValidationError[];
  /** Parsed components if valid */
  components?: PIDComponents;
}

/** PID validation error */
export interface PIDValidationError {
  /** Component that caused the error */
  component: keyof PIDComponents | 'format';
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
}

/** PID encoding options */
export interface PIDEncodingOptions {
  /** Collision counter to append (1-99) */
  collisionCounter?: number;
}

/** Normalized address input for PID generation */
export interface NormalizedAddress {
  /** ISO 3166-1 alpha-2 country code */
  countryCode: string;
  /** First administrative division (e.g., prefecture, state) */
  admin1?: string;
  /** Second administrative division (e.g., city, ward) */
  admin2?: string;
  /** Locality/neighborhood */
  locality?: string;
  /** Sublocality (e.g., town, chome) */
  sublocality?: string;
  /** Block/street number */
  block?: string;
  /** Building name/number */
  building?: string;
  /** Unit/room number */
  unit?: string;
}

/**
 * Waybill with PID (shipping label payload)
 * 
 * Example QR payload structure for shipping labels
 */
export interface WaybillPayload {
  /** Waybill ID */
  waybill_id: string;
  /** Address PID */
  addr_pid: string;
  /** Parcel weight in kg */
  parcel_weight?: number;
  /** Parcel size code */
  parcel_size?: string;
  /** Carrier zone */
  carrier_zone?: string;
  /** ZK proof blob */
  zkp?: string;
  /** BLS signature */
  sig?: string;
}

// ============================================================================
// Geo-coordinates (緯度経度) Types
// ============================================================================

/**
 * Source of geo-coordinates
 * 緯度経度の取得元
 */
export type GeoSource =
  | 'gps'           // GPS device
  | 'geocoder'      // Geocoding service
  | 'nominatim'     // OpenStreetMap Nominatim
  | 'manual'        // Manual entry
  | 'database'      // Address database
  | 'device'        // Device location API
  | 'unknown';      // Unknown source

/**
 * Geographic coordinates with accuracy information
 * 緯度経度と精度情報
 * 
 * Used for:
 * 1. Address relationship mapping (住所との関係性)
 * 2. Address verification/insurance (緯度経度を保険とする技術)
 * 3. Fallback address resolution
 */
export interface GeoCoordinates {
  /** Latitude in decimal degrees (-90 to 90) / 緯度 */
  latitude: number;
  /** Longitude in decimal degrees (-180 to 180) / 経度 */
  longitude: number;
  /** Accuracy radius in meters (optional) / 精度（メートル） */
  accuracy?: number;
  /** Altitude in meters (optional) / 高度（メートル） */
  altitude?: number;
  /** Source of the coordinates / 取得元 */
  source?: GeoSource;
  /** Timestamp when coordinates were captured / 取得日時 */
  capturedAt?: string;
}

/**
 * Geo-bounds for area representation
 * 地理的境界（範囲表現用）
 */
export interface GeoBounds {
  /** Northeast corner / 北東端 */
  northeast: {
    latitude: number;
    longitude: number;
  };
  /** Southwest corner / 南西端 */
  southwest: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Address with geo-coordinates relationship
 * 住所と緯度経度の関係性
 * 
 * This type represents the mapping between an address and its geographic location,
 * enabling the "insurance" (保険) feature where coordinates serve as a fallback
 * verification mechanism.
 */
export interface GeoAddress {
  /** Primary address PID */
  pid: string;
  /** Geographic center point / 中心座標 */
  center: GeoCoordinates;
  /** Geographic bounds of the address area / 住所範囲 */
  bounds?: GeoBounds;
  /** Verification status / 検証状態 */
  verified?: boolean;
  /** Last verified timestamp / 最終検証日時 */
  verifiedAt?: string;
}

/**
 * Geo-verification result
 * 緯度経度を用いた住所検証結果（保険機能）
 */
export interface GeoVerificationResult {
  /** Whether the coordinates match the address / 座標と住所の一致 */
  valid: boolean;
  /** Confidence score (0-1) / 信頼度スコア */
  confidence: number;
  /** Distance from expected location in meters / 期待位置からの距離 */
  distance: number;
  /** Whether within acceptable tolerance / 許容範囲内か */
  withinTolerance: boolean;
  /** Suggested PID if coordinates indicate different address / 候補PID */
  suggestedPid?: string;
  /** Verification method used / 検証方法 */
  method: 'bounds' | 'center' | 'reverse_geocode';
}

/**
 * Geocoding request
 * ジオコーディングリクエスト
 */
export interface GeocodingRequest {
  /** Address input for forward geocoding */
  address?: AddressInput;
  /** PID for PID-based geocoding */
  pid?: string;
  /** Coordinates for reverse geocoding */
  coordinates?: GeoCoordinates;
  /** Preferred language for results */
  language?: string;
}

/**
 * Geocoding result
 * ジオコーディング結果
 */
export interface GeocodingResult {
  /** Success status */
  success: boolean;
  /** Resolved coordinates (for forward geocoding) */
  coordinates?: GeoCoordinates;
  /** Resolved address (for reverse geocoding) */
  address?: AddressInput;
  /** Resolved PID */
  pid?: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Alternative results */
  alternatives?: Array<{
    coordinates?: GeoCoordinates;
    address?: AddressInput;
    pid?: string;
    confidence: number;
  }>;
  /** Error message if failed */
  error?: string;
}

/**
 * Geo-insurance configuration
 * 緯度経度保険設定
 * 
 * Configuration for using coordinates as address verification fallback
 */
export interface GeoInsuranceConfig {
  /** Enable geo-insurance feature / 緯度経度保険を有効化 */
  enabled: boolean;
  /** Maximum acceptable distance in meters / 最大許容距離（メートル） */
  toleranceMeters: number;
  /** Minimum confidence threshold (0-1) / 最小信頼度閾値 */
  minConfidence: number;
  /** Whether to auto-correct address based on coordinates / 座標に基づく住所自動補正 */
  autoCorrect: boolean;
  /** Fallback behavior when address verification fails */
  fallbackBehavior: 'reject' | 'warn' | 'accept_with_flag';
}

// ============================================================================
// ZKP (Zero-Knowledge Proof) Address Protocol Types
// ============================================================================

/**
 * DID (Decentralized Identifier) Method
 * Supported DID methods for identity management
 */
export type DIDMethod = 'did:key' | 'did:web' | 'did:ethr' | 'did:pkh' | string;

/**
 * DID Document
 * W3C Decentralized Identifier Document
 */
export interface DIDDocument {
  /** DID identifier */
  id: string;
  /** DID method used */
  method?: DIDMethod;
  /** Verification methods (public keys) */
  verificationMethod?: VerificationMethod[];
  /** Authentication methods */
  authentication?: string[];
  /** Service endpoints */
  service?: ServiceEndpoint[];
  /** Creation timestamp */
  created?: string;
  /** Last update timestamp */
  updated?: string;
}

/**
 * Verification Method (Public Key)
 * Used for signature verification
 */
export interface VerificationMethod {
  /** Method identifier */
  id: string;
  /** Key type (e.g., 'Ed25519VerificationKey2020') */
  type: string;
  /** Controller DID */
  controller: string;
  /** Public key in multibase format */
  publicKeyMultibase?: string;
  /** Public key in JWK format */
  publicKeyJwk?: Record<string, unknown>;
}

/**
 * Service Endpoint
 * DID service endpoint definition
 */
export interface ServiceEndpoint {
  /** Service identifier */
  id: string;
  /** Service type */
  type: string;
  /** Service endpoint URL */
  serviceEndpoint: string;
}

/**
 * Verifiable Credential Type
 * Types of VCs issued in the address protocol
 */
export type VCType = 
  | 'AddressPIDCredential'          // Address PID VC
  | 'DeliveryCapabilityCredential'  // Delivery capability VC
  | 'AddressVerificationCredential' // Address verification VC
  | 'ResumeCredential'              // Complete Resume VC
  | 'EmploymentCredential'          // Employment verification VC
  | 'EducationCredential'           // Education credential VC
  | 'CertificationCredential'       // Professional certification VC
  | 'SkillCredential'               // Skill verification VC
  | string;

/**
 * Verifiable Credential (VC)
 * W3C Verifiable Credential for address data
 */
export interface VerifiableCredential {
  /** VC context */
  '@context': string[];
  /** VC identifier */
  id: string;
  /** VC type */
  type: VCType[];
  /** Issuer DID */
  issuer: string;
  /** Issuance date (ISO 8601) */
  issuanceDate: string;
  /** Expiration date (ISO 8601, optional) */
  expirationDate?: string;
  /** Credential subject (actual data) */
  credentialSubject: CredentialSubject;
  /** Cryptographic proof */
  proof?: Proof;
}

/**
 * Credential Subject
 * Data contained in the VC
 */
export interface CredentialSubject {
  /** Subject DID (usually user DID) */
  id: string;
  /** Address PID */
  addressPID?: string;
  /** Country code */
  countryCode?: string;
  /** Administrative level 1 code */
  admin1Code?: string;
  /** Delivery capability metadata */
  deliveryCapability?: {
    /** Supported carriers */
    carriers?: string[];
    /** Delivery zone codes */
    zones?: string[];
    /** Restricted items */
    restrictions?: string[];
  };
  /** Additional properties */
  [key: string]: unknown;
}

// ============================================================================
// Resume/CV Data Types
// ============================================================================

/**
 * Employment Record
 * Single employment entry in resume
 */
export interface EmploymentRecord {
  /** Company/Organization name */
  company: string;
  /** Job title */
  jobTitle: string;
  /** Position level */
  positionLevel?: 'junior' | 'mid' | 'senior' | 'executive';
  /** Start date (ISO 8601) */
  startDate: string;
  /** End date (ISO 8601), null if current */
  endDate?: string | null;
  /** Job description */
  description?: string;
  /** Skills used in this role */
  skills?: string[];
  /** Verifier DID (if employment is verified) */
  verifierDid?: string;
  /** Verification timestamp */
  verifiedAt?: string;
}

/**
 * Education Record
 * Educational qualification entry
 */
export interface EducationRecord {
  /** Institution name */
  institution: string;
  /** Degree/qualification type */
  degree: string;
  /** Field of study */
  fieldOfStudy: string;
  /** Degree level (bachelor, master, phd, etc.) */
  degreeLevel?: 'associate' | 'bachelor' | 'master' | 'doctorate' | 'diploma';
  /** Graduation/Completion year */
  completionYear: number;
  /** GPA or grade (optional) */
  grade?: string;
  /** Institution DID (if verified) */
  institutionDid?: string;
  /** Verification timestamp */
  verifiedAt?: string;
}

/**
 * Certification Record
 * Professional certification or license
 */
export interface CertificationRecord {
  /** Certification name */
  name: string;
  /** Issuing organization */
  issuer: string;
  /** Issue date */
  issueDate: string;
  /** Expiration date (if applicable) */
  expirationDate?: string;
  /** Credential ID */
  credentialId?: string;
  /** Issuer DID (if verified) */
  issuerDid?: string;
  /** Verification timestamp */
  verifiedAt?: string;
}

/**
 * Skill Entry
 * Skill with proficiency level
 */
export interface SkillEntry {
  /** Skill name */
  name: string;
  /** Skill category */
  category: 'programming' | 'design' | 'management' | 'language' | 'technical' | 'soft-skill' | 'other';
  /** Proficiency level (1-5 scale: 1=beginner, 5=expert) */
  proficiency: 1 | 2 | 3 | 4 | 5;
  /** Years of experience with this skill */
  yearsOfExperience?: number;
  /** Endorsements or verifications */
  endorsements?: Array<{
    endorserDid: string;
    endorsedAt: string;
  }>;
}

/**
 * Complete Resume Data
 * Full resume/CV information
 */
export interface ResumeData {
  /** User DID */
  userDid: string;
  /** Full name */
  fullName: string;
  /** Email (optional, for contact) */
  email?: string;
  /** Employment history */
  employment: EmploymentRecord[];
  /** Education history */
  education: EducationRecord[];
  /** Certifications and licenses */
  certifications: CertificationRecord[];
  /** Skills */
  skills: SkillEntry[];
  /** Languages spoken */
  languages?: Array<{
    language: string;
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  }>;
  /** Resume creation timestamp */
  createdAt: string;
  /** Last updated timestamp */
  updatedAt: string;
}

/**
 * Cryptographic Proof
 * Signature/proof attached to VC
 */
export interface Proof {
  /** Proof type (e.g., 'Ed25519Signature2020', 'BbsBlsSignature2020') */
  type: string;
  /** Creation timestamp */
  created: string;
  /** Verification method reference */
  verificationMethod: string;
  /** Proof purpose */
  proofPurpose: string;
  /** Proof value (signature) */
  proofValue: string;
  /** Challenge (for proof of possession) */
  challenge?: string;
  /** Domain */
  domain?: string;
}

/**
 * ZK Proof Type
 * Supported ZK proof systems
 */
export type ZKProofType = 
  | 'groth16'      // Groth16 (zk-SNARK)
  | 'plonk'        // PLONK
  | 'bulletproofs' // Bulletproofs
  | 'stark'        // zk-STARK
  | 'halo2';       // Halo2

/**
 * ZKP Pattern Type
 * Different patterns of ZKP for various use cases in the address protocol
 */
export type ZKPPatternType =
  | 'membership'          // ZK-Membership Proof (Address Existence)
  | 'structure'           // ZK-Structure Proof (PID Hierarchy)
  | 'selective-reveal'    // ZK-Selective Reveal (Partial Disclosure)
  | 'version'             // ZK-Version Proof (Address Update/Migration)
  | 'locker'              // ZK-Locker Proof (Locker Membership)
  | 'resume-membership'   // ZK-Resume-Membership Proof (Employment Verification)
  | 'resume-selective'    // ZK-Resume-Selective Reveal (Partial Credential Disclosure)
  | 'resume-qualification' // ZK-Resume-Qualification Proof (Education/Certification)
  | 'resume-skill';       // ZK-Resume-Skill Proof (Skill Level Verification)

/**
 * ZK Circuit Definition
 * ZK circuit metadata
 */
export interface ZKCircuit {
  /** Circuit identifier */
  id: string;
  /** Circuit name */
  name: string;
  /** Proof type used */
  proofType: ZKProofType;
  /** Circuit version */
  version: string;
  /** Public parameters CID/hash */
  paramsHash: string;
  /** Verification key */
  verificationKey: string;
  /** Circuit description */
  description?: string;
}

/**
 * ZK Proof
 * Zero-knowledge proof for address validation
 */
export interface ZKProof {
  /** Circuit ID used */
  circuitId: string;
  /** Proof type */
  proofType: ZKProofType;
  /** Proof data (serialized) */
  proof: string;
  /** Public inputs */
  publicInputs: Record<string, unknown>;
  /** Proof generation timestamp */
  timestamp: string;
  /** Prover identifier (optional) */
  prover?: string;
}

/**
 * ZK-Membership Proof
 * Proves that an address PID belongs to a valid set (Merkle tree) without revealing the address
 */
export interface ZKMembershipProof extends ZKProof {
  /** Pattern type */
  patternType: 'membership';
  /** Merkle root of valid address set */
  merkleRoot: string;
  /** Merkle path (proof elements) */
  merklePath?: string[];
  /** Index in the tree (optional, for verification) */
  leafIndex?: number;
}

/**
 * ZK-Structure Proof
 * Proves that a PID has correct hierarchical structure without revealing the full address
 */
export interface ZKStructureProof extends ZKProof {
  /** Pattern type */
  patternType: 'structure';
  /** Country code (public) */
  countryCode: string;
  /** Number of hierarchy levels validated */
  hierarchyDepth: number;
  /** Hash of structure validation rules */
  rulesHash?: string;
}

/**
 * ZK-Selective Reveal Proof
 * Allows partial disclosure of address information with user control
 */
export interface ZKSelectiveRevealProof extends ZKProof {
  /** Pattern type */
  patternType: 'selective-reveal';
  /** Revealed fields (e.g., ['country', 'postal_code']) */
  revealedFields: string[];
  /** Revealed values */
  revealedValues: Record<string, string>;
  /** SD-JWT disclosure nonce */
  disclosureNonce?: string;
}

/**
 * ZK-Version Proof
 * Proves consistency between old and new PID after address update
 */
export interface ZKVersionProof extends ZKProof {
  /** Pattern type */
  patternType: 'version';
  /** Old PID (revoked) */
  oldPid: string;
  /** New PID (current) */
  newPid: string;
  /** Migration timestamp */
  migrationTimestamp: string;
  /** Proof of ownership continuity */
  ownershipProof?: string;
}

/**
 * ZK-Locker Proof
 * Proves membership in a locker ID set without revealing which specific locker
 */
export interface ZKLockerProof extends ZKProof {
  /** Pattern type */
  patternType: 'locker';
  /** Locker facility ID */
  facilityId: string;
  /** Locker zone/region */
  zone?: string;
  /** Merkle root of available locker IDs */
  lockerSetRoot: string;
}

/**
 * ZK-Resume-Membership Proof
 * Proves employment at a verified organization without revealing specific details
 */
export interface ZKResumeMembershipProof extends ZKProof {
  /** Pattern type */
  patternType: 'resume-membership';
  /** Merkle root of verified organizations */
  organizationSetRoot: string;
  /** Merkle path (proof elements) */
  merklePath?: string[];
  /** Employment period commitment hash (private) */
  periodCommitment?: string;
  /** Position level (junior/mid/senior) - optional public */
  positionLevel?: 'junior' | 'mid' | 'senior' | 'executive';
}

/**
 * ZK-Resume-Selective Reveal Proof
 * Allows partial disclosure of resume information with user control
 */
export interface ZKResumeSelectiveRevealProof extends ZKProof {
  /** Pattern type */
  patternType: 'resume-selective';
  /** Revealed fields (e.g., ['company', 'jobTitle', 'yearsOfExperience']) */
  revealedFields: string[];
  /** Revealed values */
  revealedValues: Record<string, string>;
  /** SD-JWT disclosure nonce */
  disclosureNonce?: string;
}

/**
 * ZK-Resume-Qualification Proof
 * Proves educational qualifications or certifications without revealing all details
 */
export interface ZKResumeQualificationProof extends ZKProof {
  /** Pattern type */
  patternType: 'resume-qualification';
  /** Qualification type (degree/certification) */
  qualificationType: 'degree' | 'certification' | 'license';
  /** Institution/Issuer hash (private) */
  institutionHash: string;
  /** Completion year (optional public) */
  completionYear?: number;
  /** Qualification level (bachelor/master/phd, etc.) */
  qualificationLevel?: string;
  /** Field of study hash (private unless revealed) */
  fieldOfStudyHash?: string;
}

/**
 * ZK-Resume-Skill Proof
 * Proves skill proficiency level without revealing full skill set
 */
export interface ZKResumeSkillProof extends ZKProof {
  /** Pattern type */
  patternType: 'resume-skill';
  /** Skill category (e.g., 'programming', 'design', 'management') */
  skillCategory: string;
  /** Minimum proficiency level proven (1-5 scale) */
  minProficiencyLevel: number;
  /** Skill set commitment hash (proves possession without revealing all) */
  skillSetCommitment: string;
  /** Years of experience range (optional public) */
  experienceYearsRange?: {
    min: number;
    max: number;
  };
}

/**
 * Combined ZKP type (union of all patterns)
 */
export type ZKPPattern = 
  | ZKMembershipProof 
  | ZKStructureProof 
  | ZKSelectiveRevealProof 
  | ZKVersionProof 
  | ZKLockerProof
  | ZKResumeMembershipProof
  | ZKResumeSelectiveRevealProof
  | ZKResumeQualificationProof
  | ZKResumeSkillProof;

/**
 * ZK Proof Verification Result
 * Result of ZK proof verification
 */
export interface ZKProofVerificationResult {
  /** Whether proof is valid */
  valid: boolean;
  /** Circuit ID verified */
  circuitId: string;
  /** Verified public inputs */
  publicInputs?: Record<string, unknown>;
  /** Error message if invalid */
  error?: string;
  /** Verification timestamp */
  verifiedAt: string;
}

/**
 * Shipping Condition
 * Conditions that must be satisfied for delivery
 */
export interface ShippingCondition {
  /** Allowed country codes */
  allowedCountries?: string[];
  /** Allowed region/province codes */
  allowedRegions?: string[];
  /** Prohibited areas (PIDs or polygon definitions) */
  prohibitedAreas?: string[];
  /** Required delivery capabilities */
  requiredCapabilities?: string[];
  /** Maximum parcel weight (kg) */
  maxWeight?: number;
  /** Maximum parcel dimensions */
  maxDimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
}

/**
 * Shipping Validation Request
 * Request to validate address against shipping conditions
 */
export interface ShippingValidationRequest {
  /** Address PID to validate */
  pid: string;
  /** User's signature (consent to use this address) */
  userSignature?: string;
  /** Shipping conditions */
  conditions: ShippingCondition;
  /** EC/Service provider identifier */
  requesterId: string;
  /** Request timestamp */
  timestamp: string;
}

/**
 * Shipping Validation Response
 * Response containing ZK proof of delivery capability
 */
export interface ShippingValidationResponse {
  /** Whether address satisfies conditions */
  valid: boolean;
  /** ZK proof of validation */
  zkProof?: ZKProof;
  /** PID token (anonymized) */
  pidToken?: string;
  /** Error details if invalid */
  error?: string;
  /** Response timestamp */
  timestamp: string;
}

/**
 * Address Provider Role
 * Role of the address provider in the ecosystem
 */
export interface AddressProvider {
  /** Provider identifier */
  id: string;
  /** Provider name */
  name: string;
  /** Provider DID */
  did: string;
  /** Provider's verification key */
  verificationKey: string;
  /** Supported ZK circuits */
  circuits: ZKCircuit[];
  /** API endpoint */
  endpoint: string;
  /** Supported countries */
  supportedCountries?: string[];
}

/**
 * Revocation List Entry
 * Entry in the PID revocation list
 */
export interface RevocationEntry {
  /** Revoked PID */
  pid: string;
  /** Revocation reason */
  reason: 'address_change' | 'user_request' | 'invalid' | 'expired' | string;
  /** Revocation timestamp */
  revokedAt: string;
  /** New PID (if address was updated) */
  newPid?: string;
}

/**
 * Revocation List
 * Authenticated list of revoked PIDs
 */
export interface RevocationList {
  /** List identifier */
  id: string;
  /** Issuer (address provider) DID */
  issuer: string;
  /** List version/sequence number */
  version: number;
  /** Last update timestamp */
  updatedAt: string;
  /** Revoked entries */
  entries: RevocationEntry[];
  /** Merkle root of revocation set */
  merkleRoot?: string;
  /** Cryptographic proof/signature */
  proof?: Proof;
}

/**
 * Access Control Policy
 * Policy for accessing PID resolution (raw address)
 */
export interface AccessControlPolicy {
  /** Policy identifier */
  id: string;
  /** Who can access */
  principal: string; // DID or role
  /** What resource (PID pattern) */
  resource: string;
  /** Action allowed */
  action: 'resolve' | 'decrypt' | 'view' | string;
  /** Conditions */
  conditions?: Record<string, unknown>;
  /** Expiration time */
  expiresAt?: string;
}

/**
 * PID Resolution Request
 * Request to resolve PID to raw address
 */
export interface PIDResolutionRequest {
  /** PID to resolve */
  pid: string;
  /** Requester DID (e.g., carrier) */
  requesterId: string;
  /** Access token/credential */
  accessToken?: string;
  /** Reason for access */
  reason: string;
  /** Request timestamp */
  timestamp: string;
}

/**
 * PID Resolution Response
 * Response with decrypted address
 */
export interface PIDResolutionResponse {
  /** Whether resolution succeeded */
  success: boolean;
  /** Decrypted address (only if authorized) */
  address?: AddressInput;
  /** Geographic coordinates */
  coordinates?: GeoCoordinates;
  /** Access log ID */
  accessLogId?: string;
  /** Error message if failed */
  error?: string;
  /** Response timestamp */
  timestamp: string;
}

/**
 * Audit Log Entry
 * Record of who accessed what PID and when
 */
export interface AuditLogEntry {
  /** Log entry ID */
  id: string;
  /** PID accessed */
  pid: string;
  /** Accessor DID */
  accessor: string;
  /** Action performed */
  action: 'resolve' | 'decrypt' | 'verify' | string;
  /** Access timestamp */
  timestamp: string;
  /** IP address (optional) */
  ipAddress?: string;
  /** Result (success/failure) */
  result: 'success' | 'denied' | 'error';
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Tracking Event
 * Delivery tracking event
 */
export interface TrackingEvent {
  /** Event ID */
  id: string;
  /** Tracking number */
  trackingNumber: string;
  /** Event type */
  type: 'accepted' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | string;
  /** Event timestamp */
  timestamp: string;
  /** Location (coarse, e.g., city/country) */
  location?: {
    country?: string;
    admin1?: string;
    city?: string;
  };
  /** Event description */
  description?: string;
  /** Carrier */
  carrier?: string;
}

/**
 * Waybill with ZKP
 * Enhanced waybill with ZK proof support
 */
export interface ZKPWaybill extends WaybillPayload {
  /** ZK proof of valid delivery address */
  zkProof: ZKProof;
  /** Tracking number */
  trackingNumber?: string;
  /** Sender information (limited) */
  sender?: {
    name?: string;
    country?: string;
  };
  /** Recipient information (limited, no raw address) */
  recipient?: {
    name?: string;
    pidToken?: string; // Anonymized PID reference
  };
  /** Carrier information */
  carrier?: {
    id: string;
    name: string;
  };
}

// ============================================================================
// Translation Service Types
// ============================================================================

/**
 * Translation service provider
 */
export type TranslationService = 
  | 'libretranslate'
  | 'apertium'
  | 'argostranslate';

/**
 * Translation service configuration
 */
export interface TranslationServiceConfig {
  /** Service provider */
  service: TranslationService;
  /** API endpoint (for LibreTranslate) */
  endpoint?: string;
  /** API key (if required) */
  apiKey?: string;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Translation request
 */
export interface TranslationRequest {
  /** Text to translate */
  text: string;
  /** Source language code (ISO 639-1) */
  sourceLang: string;
  /** Target language code (ISO 639-1) */
  targetLang: string;
  /** Field name being translated (for context) */
  field?: string;
  /** Country code (for context) */
  countryCode?: string;
}

/**
 * Translation result
 */
export interface TranslationResult {
  /** Translated text */
  translatedText: string;
  /** Source language */
  sourceLang: string;
  /** Target language */
  targetLang: string;
  /** Confidence score (0-1) */
  confidence?: number;
  /** Service used */
  service: TranslationService;
  /** Whether translation was cached */
  cached?: boolean;
}

// ============================================================================
// Gift Delivery Types
// ============================================================================

/**
 * Gift order status
 */
export enum GiftOrderStatus {
  /** Waiting for recipient to select delivery address */
  PENDING_SELECTION = 'pending_selection',
  /** Ready to ship (address selected) */
  READY_TO_SHIP = 'ready_to_ship',
  /** Shipped */
  SHIPPED = 'shipped',
  /** Delivered */
  DELIVERED = 'delivered',
  /** Cancelled */
  CANCELLED = 'cancelled',
  /** Expired (deadline passed without address selection) */
  EXPIRED = 'expired',
}

/**
 * Gift order
 */
export interface GiftOrder {
  /** Order ID */
  orderId: string;
  /** Sender DID */
  senderId: string;
  /** Recipient GAP PID (friend identifier) */
  recipientGAPPID: string;
  /** Product ID */
  productId: string;
  /** Order status */
  status: GiftOrderStatus;
  /** Delivery deadline (ISO 8601) */
  deadline: string;
  /** Created timestamp */
  createdAt: string;
  /** Address selected timestamp */
  selectedAddressAt?: string;
  /** Shipped timestamp */
  shippedAt?: string;
  /** Cancelled timestamp */
  cancelledAt?: string;
  /** Cancellation reason */
  cancellationReason?: CancellationReason;
  /** Gift message from sender */
  message?: string;
}

/**
 * Pending waybill (partial information)
 */
export interface PendingWaybill {
  /** Waybill ID */
  waybillId: string;
  /** Order ID */
  orderId: string;
  /** Status */
  status: 'pending' | 'completed';
  /** Country code (public info) */
  countryCode: string;
  /** Region code / Admin1 (public info) */
  regionCode?: string;
  /** Full address PID (set after recipient selection) */
  fullAddressPID?: string;
  /** Delivery location details (set after recipient selection) */
  deliveryLocation?: DeliveryLocation;
  /** Selection deadline */
  deadline: string;
  /** Created timestamp */
  createdAt: string;
  /** Completed timestamp */
  completedAt?: string;
}

/**
 * Delivery location type
 */
export type DeliveryLocationType = 'home' | 'office' | 'convenience_store' | 'locker' | 'pickup_point' | 'other';

/**
 * Delivery location
 */
export interface DeliveryLocation {
  /** Location type */
  type: DeliveryLocationType;
  /** Location label */
  label: string;
  /** Address PID */
  pid: string;
  /** Additional instructions */
  instructions?: string;
}

/**
 * Gift delivery candidate
 */
export interface GiftDeliveryCandidate {
  /** Address PID */
  pid: string;
  /** Display label (e.g., "Home", "Office") */
  label: string;
  /** Location type */
  type: DeliveryLocationType;
  /** Carrier compatible */
  carrierCompatible: boolean;
  /** Incompatibility reasons */
  incompatibleReasons?: string[];
  /** AI evaluation score (0-100) */
  aiScore: number;
  /** Success probability (0-1) */
  successProbability: number;
  /** Number of previous deliveries */
  previousDeliveries: number;
  /** Number of successful deliveries */
  successfulDeliveries: number;
  /** Distance from cluster center (km) */
  distanceFromCenter?: number;
  /** Cluster group ID */
  clusterGroupId?: string;
  /** Priority level */
  priority?: 'urgent' | 'high' | 'normal' | 'low';
}

/**
 * Gift delivery selection
 */
export interface GiftDeliverySelection {
  /** Selection ID */
  selectionId: string;
  /** Order ID */
  orderId: string;
  /** Recipient DID */
  recipientDID: string;
  /** Candidate addresses (AI-extracted) */
  candidates: GiftDeliveryCandidate[];
  /** Selected PID */
  selectedPID?: string;
  /** Selection timestamp */
  selectedAt?: string;
  /** AI recommendation */
  aiRecommendation?: {
    /** Recommended PID */
    recommendedPID: string;
    /** Recommendation reason */
    reason: string;
    /** Confidence (0-1) */
    confidence: number;
  };
  /** Selection deadline */
  deadline: string;
  /** Access token */
  accessToken: string;
}

/**
 * Candidate cluster
 */
export interface CandidateCluster {
  /** Cluster ID */
  clusterId: string;
  /** Cluster label (e.g., "Shibuya Area") */
  label: string;
  /** Candidates in cluster */
  candidates: GiftDeliveryCandidate[];
  /** Cluster center */
  center: {
    /** Latitude */
    latitude: number;
    /** Longitude */
    longitude: number;
    /** Center label (e.g., "Shibuya Station") */
    label?: string;
  };
  /** Cluster radius (km) */
  radius: number;
  /** Optimal candidate */
  optimalCandidate?: GiftDeliveryCandidate;
  /** Cluster quality score (0-100) */
  clusterScore: number;
}

/**
 * Cancellation reason
 */
export enum CancellationReason {
  /** Address not selected */
  ADDRESS_UNSET = 'address_unset',
  /** Deadline expired */
  DEADLINE_EXPIRED = 'deadline_expired',
  /** User cancelled */
  USER_CANCELLED = 'user_cancelled',
  /** Recipient declined */
  RECIPIENT_DECLINED = 'recipient_declined',
  /** System error */
  SYSTEM_ERROR = 'system_error',
  /** Payment failed */
  PAYMENT_FAILED = 'payment_failed',
}

/**
 * Expiration risk level
 */
export type ExpirationRisk = 'critical' | 'high' | 'medium' | 'low';

/**
 * Reminder type
 */
export type ReminderType = '72h' | '48h' | '24h' | '12h' | '3h' | '1h';

/**
 * Reminder schedule
 */
export interface ReminderSchedule {
  /** Reminder type */
  reminderType: ReminderType;
  /** Scheduled timestamp (ISO 8601) */
  scheduledAt: string;
  /** Notification channel */
  channel: 'email' | 'sms' | 'push';
  /** Message */
  message: string;
  /** Whether sent */
  sent: boolean;
}

/**
 * Recipient preferences
 */
export interface RecipientPreferences {
  /** Preferred notification channel */
  preferredChannel: 'email' | 'sms' | 'push';
  /** Timezone */
  timezone: string;
  /** Quiet hours */
  quietHours?: {
    /** Start time (HH:mm) */
    start: string;
    /** End time (HH:mm) */
    end: string;
  };
}

/**
 * Time window
 */
export interface TimeWindow {
  /** Start time (HH:mm) */
  start: string;
  /** End time (HH:mm) */
  end: string;
  /** Score (0-100) */
  score: number;
  /** Receive probability (0-1) */
  receiveProbability: number;
  /** Factors */
  factors: {
    /** Weekday pattern */
    weekdayPattern: number;
    /** Holiday pattern */
    holidayPattern: number;
    /** Traffic condition */
    trafficCondition: number;
  };
}

/**
 * Location suggestion
 */
export interface LocationSuggestion {
  /** Address PID */
  pid: string;
  /** Display label */
  label: string;
  /** Score (0-100) */
  score: number;
  /** Suggestion reasons */
  reasons: string[];
  /** Availability */
  availability: {
    /** Likely available */
    likely: boolean;
    /** Confidence (0-1) */
    confidence: number;
  };
}

/**
 * Probability factors
 */
export interface ProbabilityFactors {
  /** Historical success rate */
  historicalSuccess: number;
  /** Address quality score */
  addressQuality: number;
  /** Carrier reliability */
  carrierReliability: number;
  /** Seasonal factor */
  seasonalFactor: number;
  /** Geographic factor */
  geographicFactor: number;
}

/**
 * Action type
 */
export type ActionType = 'send_reminder' | 'adjust_priority' | 'escalate' | 'auto_cancel';

/**
 * Action
 */
export interface Action {
  /** Action type */
  type: ActionType;
  /** Description */
  description: string;
  /** Scheduled timestamp */
  scheduledAt?: string;
  /** Executed timestamp */
  executedAt?: string;
}

/**
 * Suggestion type
 */
export type SuggestionType = 'deadline_extension' | 'reminder_optimization' | 'ui_improvement';

/**
 * Suggestion
 */
export interface Suggestion {
  /** Suggestion type */
  type: SuggestionType;
  /** Description */
  description: string;
  /** Expected improvement (percentage) */
  expectedImprovement: number;
  /** Priority */
  priority: 'high' | 'medium' | 'low';
}
