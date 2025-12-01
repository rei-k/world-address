/**
 * @vey/core - AI/Automation Types and Interfaces
 *
 * Types for Gemini-powered AI features:
 * - OCR for handwritten/printed documents
 * - HS Code auto-suggestion
 * - Dangerous goods detection
 * - Multilingual real-time translation
 * - Address verification and correction
 * - Invoice auto-generation
 */

import type { AddressInput } from './types';

// ============================================================================
// OCR (Handwritten Character Recognition)
// ============================================================================

/**
 * OCR request for document scanning
 */
export interface OCRRequest {
  /** Base64 encoded image data or URL */
  image: string;
  /** Image format */
  format?: 'base64' | 'url';
  /** MIME type of the image */
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  /** Language hints for OCR processing */
  languageHints?: string[];
  /** Document type hint */
  documentType?: 'shipping_label' | 'invoice' | 'handwritten_note' | 'receipt' | 'general';
}

/**
 * OCR result for a single text block
 */
export interface OCRTextBlock {
  /** Recognized text content */
  text: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Bounding box coordinates */
  boundingBox?: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
  /** Detected language */
  detectedLanguage?: string;
}

/**
 * Structured address extracted from OCR
 */
export interface OCRAddressResult {
  /** Extracted address fields */
  address: Partial<AddressInput>;
  /** Overall confidence score */
  confidence: number;
  /** Raw text blocks used for extraction */
  sourceBlocks: OCRTextBlock[];
  /** Suggestions for unclear fields */
  suggestions?: {
    field: keyof AddressInput;
    alternatives: string[];
  }[];
}

/**
 * Complete OCR response
 */
export interface OCRResponse {
  /** Whether OCR was successful */
  success: boolean;
  /** All detected text blocks */
  textBlocks: OCRTextBlock[];
  /** Structured address if detected */
  extractedAddress?: OCRAddressResult;
  /** Full text content */
  fullText: string;
  /** Detected document type */
  detectedDocumentType?: string;
  /** Processing metadata */
  metadata?: {
    processingTimeMs: number;
    imageSize: { width: number; height: number };
    modelVersion: string;
  };
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// HS Code Auto-Suggestion
// ============================================================================

/**
 * HS Code lookup request
 */
export interface HSCodeRequest {
  /** Product description (e.g., "cotton shirt", "laptop computer") */
  productDescription: string;
  /** Optional detailed description */
  detailedDescription?: string;
  /** Material information */
  material?: string;
  /** Origin country */
  originCountry?: string;
  /** Destination country for tariff rates */
  destinationCountry?: string;
  /** Product images for visual classification */
  images?: string[];
  /** Number of suggestions to return */
  maxSuggestions?: number;
}

/**
 * HS Code suggestion result
 */
export interface HSCodeSuggestion {
  /** HS code (6-10 digits) */
  code: string;
  /** Code description */
  description: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Chapter/Section info */
  chapter?: {
    number: string;
    title: string;
  };
  /** Associated tariff rate if available */
  tariffRate?: {
    rate: number;
    unit: 'percent' | 'fixed';
    currency?: string;
  };
  /** Additional notes */
  notes?: string[];
  /** Hierarchy path */
  hierarchy?: string[];
}

/**
 * HS Code response
 */
export interface HSCodeResponse {
  /** Whether lookup was successful */
  success: boolean;
  /** Suggested HS codes */
  suggestions: HSCodeSuggestion[];
  /** Query interpretation */
  interpretation?: {
    extractedKeywords: string[];
    inferredCategory: string;
    inferredMaterial?: string;
  };
  /** Warnings (e.g., restricted item) */
  warnings?: string[];
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Dangerous Goods / Prohibited Items Detection
// ============================================================================

/**
 * Hazard classification types
 */
export type HazardClass =
  | 'explosives'
  | 'gases'
  | 'flammable_liquids'
  | 'flammable_solids'
  | 'oxidizers'
  | 'toxic'
  | 'radioactive'
  | 'corrosive'
  | 'miscellaneous';

/**
 * Dangerous goods check request
 */
export interface DangerousGoodsRequest {
  /** Image of package contents */
  images: string[];
  /** Text description of contents */
  description?: string;
  /** Shipping method for regulation lookup */
  shippingMethod?: 'air' | 'sea' | 'ground' | 'rail';
  /** Origin country */
  originCountry?: string;
  /** Destination country */
  destinationCountry?: string;
  /** Carrier for specific regulations */
  carrier?: string;
}

/**
 * Detected hazardous item
 */
export interface DetectedHazard {
  /** Item name/description */
  item: string;
  /** Hazard classification */
  hazardClass: HazardClass;
  /** UN number if applicable */
  unNumber?: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Location in image */
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Shipping restrictions */
  restrictions: {
    airProhibited: boolean;
    requiresSpecialHandling: boolean;
    requiresDeclaration: boolean;
    maxQuantity?: {
      value: number;
      unit: string;
    };
  };
  /** Regulatory references */
  regulations?: string[];
}

/**
 * Dangerous goods check response
 */
export interface DangerousGoodsResponse {
  /** Whether check was successful */
  success: boolean;
  /** Overall result */
  result: 'clear' | 'warning' | 'prohibited';
  /** Detected hazards */
  detectedHazards: DetectedHazard[];
  /** General warnings */
  warnings: string[];
  /** Items that passed inspection */
  clearedItems?: string[];
  /** Recommended actions */
  recommendations?: string[];
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Multilingual Translation
// ============================================================================

/**
 * Supported language codes
 */
export type SupportedLanguage =
  | 'ja' | 'en' | 'zh' | 'ko' | 'th' | 'vi' | 'id' | 'ms'  // Asian
  | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'nl' | 'ru' | 'pl'  // European
  | 'ar' | 'he' | 'tr' | 'hi' | 'bn'                        // Other
  | 'auto';  // Auto-detect

/**
 * Translation request
 */
export interface TranslationRequest {
  /** Text to translate */
  text: string;
  /** Source language (auto-detect if not specified) */
  sourceLanguage?: SupportedLanguage;
  /** Target language */
  targetLanguage: SupportedLanguage;
  /** Context for better translation */
  context?: 'address' | 'product' | 'shipping' | 'invoice' | 'general';
  /** Whether to include romanization */
  includeRomanization?: boolean;
  /** Whether to include pronunciation guide */
  includePronunciation?: boolean;
}

/**
 * Translation response
 */
export interface TranslationResponse {
  /** Whether translation was successful */
  success: boolean;
  /** Translated text */
  translatedText: string;
  /** Detected source language */
  detectedLanguage?: SupportedLanguage;
  /** Romanized version */
  romanization?: string;
  /** Pronunciation guide */
  pronunciation?: string;
  /** Alternative translations */
  alternatives?: string[];
  /** Confidence score */
  confidence: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Speech-to-text request (voice input)
 */
export interface SpeechToTextRequest {
  /** Audio data (base64 encoded) */
  audio: string;
  /** Audio format */
  format: 'wav' | 'mp3' | 'ogg' | 'webm';
  /** Expected language */
  language?: SupportedLanguage;
  /** Hint phrases for better recognition */
  hintPhrases?: string[];
}

/**
 * Speech-to-text response
 */
export interface SpeechToTextResponse {
  /** Whether recognition was successful */
  success: boolean;
  /** Recognized text */
  text: string;
  /** Confidence score */
  confidence: number;
  /** Detected language */
  detectedLanguage?: SupportedLanguage;
  /** Alternative transcriptions */
  alternatives?: Array<{ text: string; confidence: number }>;
  /** Error message if failed */
  error?: string;
}

/**
 * Text-to-speech request (voice output)
 */
export interface TextToSpeechRequest {
  /** Text to convert to speech */
  text: string;
  /** Language for speech */
  language: SupportedLanguage;
  /** Voice type */
  voiceType?: 'male' | 'female' | 'neutral';
  /** Speech rate (0.5 - 2.0) */
  rate?: number;
}

/**
 * Text-to-speech response
 */
export interface TextToSpeechResponse {
  /** Whether synthesis was successful */
  success: boolean;
  /** Audio data (base64 encoded) */
  audio: string;
  /** Audio format */
  format: 'mp3' | 'wav';
  /** Duration in seconds */
  durationSeconds: number;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Address Verification & Correction
// ============================================================================

/**
 * Address verification request
 */
export interface AddressVerificationRequest {
  /** Address to verify */
  address: AddressInput;
  /** Country code */
  countryCode: string;
  /** Verification level */
  level?: 'basic' | 'geocode' | 'full';
  /** Whether to attempt corrections */
  suggestCorrections?: boolean;
}

/**
 * Address verification issue
 */
export interface AddressIssue {
  /** Issue type */
  type: 'missing' | 'invalid' | 'suspicious' | 'outdated';
  /** Field with issue */
  field: keyof AddressInput;
  /** Issue description */
  message: string;
  /** Severity */
  severity: 'error' | 'warning' | 'info';
  /** Suggested correction */
  suggestion?: string;
}

/**
 * Geocoding result
 */
export interface GeocodingResult {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Accuracy level */
  accuracy: 'rooftop' | 'range_interpolated' | 'geometric_center' | 'approximate';
  /** Plus code */
  plusCode?: string;
  /** Formatted address from geocoder */
  formattedAddress?: string;
}

/**
 * Address verification response
 */
export interface AddressVerificationResponse {
  /** Whether verification was successful */
  success: boolean;
  /** Whether address exists/is valid */
  exists: boolean;
  /** Verification confidence (0-1) */
  confidence: number;
  /** Issues found */
  issues: AddressIssue[];
  /** Suggested corrections */
  corrections?: Partial<AddressInput>;
  /** Geocoding result */
  geocode?: GeocodingResult;
  /** Standardized/normalized address */
  standardizedAddress?: AddressInput;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Invoice Auto-Generation
// ============================================================================

/**
 * Invoice item
 */
export interface InvoiceItem {
  /** Item description */
  description: string;
  /** HS code */
  hsCode?: string;
  /** Quantity */
  quantity: number;
  /** Unit (pcs, kg, etc.) */
  unit: string;
  /** Unit price */
  unitPrice: number;
  /** Total value */
  totalValue: number;
  /** Currency */
  currency: string;
  /** Country of origin */
  originCountry?: string;
  /** Weight per unit */
  unitWeight?: {
    value: number;
    unit: 'kg' | 'lb' | 'g' | 'oz';
  };
}

/**
 * Invoice generation request
 */
export interface InvoiceRequest {
  /** Shipper information */
  shipper: {
    name: string;
    company?: string;
    address: AddressInput;
    phone?: string;
    email?: string;
    taxId?: string;
  };
  /** Consignee information */
  consignee: {
    name: string;
    company?: string;
    address: AddressInput;
    phone?: string;
    email?: string;
    taxId?: string;
  };
  /** Invoice items */
  items: InvoiceItem[];
  /** Invoice date */
  invoiceDate?: string;
  /** Invoice number */
  invoiceNumber?: string;
  /** Terms of sale (Incoterms) */
  incoterms?: 'EXW' | 'FCA' | 'CPT' | 'CIP' | 'DAP' | 'DPU' | 'DDP' | 'FAS' | 'FOB' | 'CFR' | 'CIF';
  /** Reason for export */
  reasonForExport?: 'sale' | 'gift' | 'sample' | 'return' | 'repair' | 'temporary' | 'other';
  /** Additional notes */
  notes?: string;
  /** Output format */
  format?: 'pdf' | 'html' | 'json';
}

/**
 * Generated invoice
 */
export interface GeneratedInvoice {
  /** Invoice number */
  invoiceNumber: string;
  /** Invoice date */
  invoiceDate: string;
  /** Subtotal amount */
  subtotal: number;
  /** Shipping cost */
  shippingCost?: number;
  /** Insurance cost */
  insuranceCost?: number;
  /** Total amount */
  total: number;
  /** Currency */
  currency: string;
  /** Total weight */
  totalWeight?: {
    value: number;
    unit: 'kg' | 'lb';
  };
  /** Total packages */
  totalPackages: number;
  /** PDF data (base64) if format is pdf */
  pdfData?: string;
  /** HTML content if format is html */
  htmlContent?: string;
  /** JSON data if format is json */
  jsonData?: Record<string, unknown>;
}

/**
 * Invoice generation response
 */
export interface InvoiceResponse {
  /** Whether generation was successful */
  success: boolean;
  /** Generated invoice */
  invoice?: GeneratedInvoice;
  /** Validation warnings */
  warnings?: string[];
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// AI Service Configuration
// ============================================================================

/**
 * AI service provider configuration
 */
export interface AIServiceConfig {
  /** API key for the AI service */
  apiKey?: string;
  /** AI model to use */
  model?: 'gemini-pro' | 'gemini-pro-vision' | 'gemini-ultra';
  /** Timeout in milliseconds */
  timeout?: number;
  /** Maximum retries */
  maxRetries?: number;
  /** Base URL for custom endpoints */
  baseUrl?: string;
}

/**
 * AI service interface
 */
export interface AIService {
  /** OCR for document scanning */
  ocr(request: OCRRequest): Promise<OCRResponse>;
  
  /** HS code auto-suggestion */
  suggestHSCode(request: HSCodeRequest): Promise<HSCodeResponse>;
  
  /** Dangerous goods detection */
  checkDangerousGoods(request: DangerousGoodsRequest): Promise<DangerousGoodsResponse>;
  
  /** Text translation */
  translate(request: TranslationRequest): Promise<TranslationResponse>;
  
  /** Speech to text */
  speechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse>;
  
  /** Text to speech */
  textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse>;
  
  /** Address verification */
  verifyAddress(request: AddressVerificationRequest): Promise<AddressVerificationResponse>;
  
  /** Invoice generation */
  generateInvoice(request: InvoiceRequest): Promise<InvoiceResponse>;
}
