/**
 * @vey/core - POS Hardware & IoT Integration Types
 *
 * Types for hardware integrations:
 * - Bluetooth weight scale
 * - AR size measurement
 * - Payment terminals (Square/Stripe)
 * - Passport scanner (MRZ)
 * - Label printer (Zebra, Brother, etc.)
 */

import type { AddressInput } from './types';

// ============================================================================
// Bluetooth Weight Scale
// ============================================================================

/**
 * Weight unit types
 */
export type WeightUnit = 'kg' | 'lb' | 'g' | 'oz';

/**
 * Bluetooth device connection state
 */
export type BluetoothConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

/**
 * Weight scale device info
 */
export interface WeightScaleDevice {
  /** Device ID */
  id: string;
  /** Device name */
  name: string;
  /** Device manufacturer */
  manufacturer?: string;
  /** Device model */
  model?: string;
  /** Bluetooth service UUID */
  serviceUUID: string;
  /** Characteristic UUID for weight data */
  characteristicUUID: string;
}

/**
 * Weight measurement result
 */
export interface WeightMeasurement {
  /** Measured weight value */
  value: number;
  /** Weight unit */
  unit: WeightUnit;
  /** Whether measurement is stable */
  stable: boolean;
  /** Timestamp of measurement */
  timestamp: Date;
  /** Device ID */
  deviceId: string;
  /** Tare applied */
  tare?: number;
}

/**
 * Weight scale configuration
 */
export interface WeightScaleConfig {
  /** Preferred weight unit */
  preferredUnit?: WeightUnit;
  /** Auto-tare on connect */
  autoTare?: boolean;
  /** Stability threshold in seconds */
  stabilityThreshold?: number;
  /** Reconnect attempts */
  reconnectAttempts?: number;
}

/**
 * Weight scale event handlers
 */
export interface WeightScaleEventHandlers {
  onConnect?: (device: WeightScaleDevice) => void;
  onDisconnect?: (deviceId: string) => void;
  onWeightChange?: (measurement: WeightMeasurement) => void;
  onStableWeight?: (measurement: WeightMeasurement) => void;
  onError?: (error: Error) => void;
}

/**
 * Weight scale interface
 */
export interface WeightScaleService {
  /** Whether Web Bluetooth is supported */
  isSupported(): boolean;
  
  /** Scan for available weight scales */
  scan(): Promise<WeightScaleDevice[]>;
  
  /** Connect to a specific device */
  connect(deviceId: string): Promise<void>;
  
  /** Disconnect from device */
  disconnect(): Promise<void>;
  
  /** Get current connection state */
  getConnectionState(): BluetoothConnectionState;
  
  /** Get current weight */
  getCurrentWeight(): WeightMeasurement | null;
  
  /** Tare (zero) the scale */
  tare(): Promise<void>;
  
  /** Convert weight to different unit */
  convertWeight(value: number, fromUnit: WeightUnit, toUnit: WeightUnit): number;
  
  /** Register event handlers */
  on<K extends keyof WeightScaleEventHandlers>(
    event: K,
    handler: NonNullable<WeightScaleEventHandlers[K]>
  ): void;
  
  /** Unregister event handlers */
  off<K extends keyof WeightScaleEventHandlers>(
    event: K,
    handler: NonNullable<WeightScaleEventHandlers[K]>
  ): void;
}

// ============================================================================
// AR Size Measurement
// ============================================================================

/**
 * Dimension unit types
 */
export type DimensionUnit = 'cm' | 'in' | 'mm' | 'm';

/**
 * Package dimensions
 */
export interface PackageDimensions {
  /** Length (longest side) */
  length: number;
  /** Width */
  width: number;
  /** Height */
  height: number;
  /** Unit of measurement */
  unit: DimensionUnit;
}

/**
 * AR measurement result
 */
export interface ARMeasurementResult {
  /** Measured dimensions */
  dimensions: PackageDimensions;
  /** Actual volume */
  actualVolume: number;
  /** Volumetric weight (for shipping) */
  volumetricWeight: {
    value: number;
    unit: WeightUnit;
    divisor: number; // DIM factor used (e.g., 5000 for air)
  };
  /** Confidence score (0-1) */
  confidence: number;
  /** Measurement timestamp */
  timestamp: Date;
  /** Snapshot image (base64) */
  snapshot?: string;
  /** Detected box corners for visualization */
  corners?: Array<{ x: number; y: number; z: number }>;
}

/**
 * AR measurement configuration
 */
export interface ARMeasurementConfig {
  /** Preferred dimension unit */
  preferredUnit?: DimensionUnit;
  /** DIM factor for volumetric weight */
  dimFactor?: number;
  /** Minimum confidence threshold */
  minConfidence?: number;
  /** Enable debug overlay */
  debugOverlay?: boolean;
  /** Camera resolution */
  resolution?: 'low' | 'medium' | 'high';
}

/**
 * AR measurement service interface
 */
export interface ARMeasurementService {
  /** Whether AR measurement is supported */
  isSupported(): boolean;
  
  /** Initialize camera and AR session */
  initialize(config?: ARMeasurementConfig): Promise<void>;
  
  /** Start measurement session */
  startMeasurement(): Promise<void>;
  
  /** Capture current measurement */
  capture(): Promise<ARMeasurementResult>;
  
  /** Stop measurement session */
  stopMeasurement(): void;
  
  /** Calculate volumetric weight */
  calculateVolumetricWeight(
    dimensions: PackageDimensions,
    dimFactor?: number
  ): number;
  
  /** Convert dimensions to different unit */
  convertDimensions(
    dimensions: PackageDimensions,
    toUnit: DimensionUnit
  ): PackageDimensions;
}

// ============================================================================
// Payment Terminal Integration
// ============================================================================

/**
 * Payment method types
 */
export type PaymentMethodType =
  | 'card_present'     // Physical card
  | 'card_not_present' // Online card
  | 'apple_pay'
  | 'google_pay'
  | 'contactless'
  | 'ic_card'          // Transit IC cards (Suica, PASMO)
  | 'qr_code'
  | 'cash';

/**
 * Payment status
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'authorized'
  | 'captured'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/**
 * Terminal device types
 */
export type TerminalType = 'square' | 'stripe' | 'verifone' | 'ingenico' | 'pax' | 'sunmi';

/**
 * Payment terminal device
 */
export interface PaymentTerminalDevice {
  /** Device ID */
  id: string;
  /** Device name */
  name: string;
  /** Terminal type */
  type: TerminalType;
  /** Serial number */
  serialNumber?: string;
  /** Firmware version */
  firmwareVersion?: string;
  /** Battery level (if applicable) */
  batteryLevel?: number;
  /** Connection type */
  connectionType: 'bluetooth' | 'usb' | 'network' | 'cloud';
  /** Whether device is online */
  online: boolean;
}

/**
 * Payment request
 */
export interface PaymentRequest {
  /** Amount in smallest currency unit (e.g., cents) */
  amount: number;
  /** Currency code */
  currency: string;
  /** Allowed payment methods */
  allowedMethods?: PaymentMethodType[];
  /** Reference/Order ID */
  referenceId?: string;
  /** Description */
  description?: string;
  /** Metadata */
  metadata?: Record<string, string>;
  /** Auto-capture after authorization */
  autoCapture?: boolean;
  /** Receipt email */
  receiptEmail?: string;
}

/**
 * Payment result
 */
export interface PaymentResult {
  /** Payment ID */
  id: string;
  /** Status */
  status: PaymentStatus;
  /** Amount charged */
  amount: number;
  /** Currency */
  currency: string;
  /** Payment method used */
  method: PaymentMethodType;
  /** Card details (masked) */
  cardDetails?: {
    brand: string;
    last4: string;
    expMonth?: number;
    expYear?: number;
  };
  /** Receipt URL */
  receiptUrl?: string;
  /** Authorization code */
  authorizationCode?: string;
  /** Transaction timestamp */
  timestamp: Date;
  /** Error message if failed */
  error?: string;
}

/**
 * Refund request
 */
export interface RefundRequest {
  /** Original payment ID */
  paymentId: string;
  /** Refund amount (partial refund if less than original) */
  amount?: number;
  /** Reason for refund */
  reason?: string;
}

/**
 * Refund result
 */
export interface RefundResult {
  /** Refund ID */
  id: string;
  /** Original payment ID */
  paymentId: string;
  /** Refund amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Status */
  status: 'pending' | 'completed' | 'failed';
  /** Timestamp */
  timestamp: Date;
  /** Error message if failed */
  error?: string;
}

/**
 * Payment terminal event handlers
 */
export interface PaymentTerminalEventHandlers {
  onConnect?: (device: PaymentTerminalDevice) => void;
  onDisconnect?: (deviceId: string) => void;
  onPaymentStart?: (request: PaymentRequest) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
  onPaymentError?: (error: Error) => void;
  onCardInserted?: () => void;
  onCardRemoved?: () => void;
}

/**
 * Payment terminal service interface
 */
export interface PaymentTerminalService {
  /** Get available terminals */
  getTerminals(): Promise<PaymentTerminalDevice[]>;
  
  /** Connect to terminal */
  connect(deviceId: string): Promise<void>;
  
  /** Disconnect from terminal */
  disconnect(): Promise<void>;
  
  /** Process payment */
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  
  /** Cancel current payment */
  cancelPayment(): Promise<void>;
  
  /** Process refund */
  processRefund(request: RefundRequest): Promise<RefundResult>;
  
  /** Display message on terminal */
  displayMessage(message: string): Promise<void>;
  
  /** Clear terminal display */
  clearDisplay(): Promise<void>;
  
  /** Register event handlers */
  on<K extends keyof PaymentTerminalEventHandlers>(
    event: K,
    handler: NonNullable<PaymentTerminalEventHandlers[K]>
  ): void;
}

// ============================================================================
// Passport Scanner (MRZ Reading)
// ============================================================================

/**
 * Document types for MRZ reading
 */
export type TravelDocumentType = 
  | 'passport'
  | 'id_card'
  | 'visa'
  | 'travel_document'
  | 'other';

/**
 * Gender codes
 */
export type GenderCode = 'M' | 'F' | 'X' | '<';

/**
 * MRZ (Machine Readable Zone) data
 */
export interface MRZData {
  /** Document type */
  documentType: TravelDocumentType;
  /** Document type code (P, I, V, etc.) */
  documentTypeCode: string;
  /** Issuing country code (ISO 3166-1 alpha-3) */
  issuingCountry: string;
  /** Surname (family name) */
  surname: string;
  /** Given names */
  givenNames: string;
  /** Document number */
  documentNumber: string;
  /** Nationality code (ISO 3166-1 alpha-3) */
  nationality: string;
  /** Date of birth (YYMMDD format) */
  dateOfBirth: string;
  /** Parsed date of birth */
  dateOfBirthParsed?: Date;
  /** Gender */
  gender: GenderCode;
  /** Expiry date (YYMMDD format) */
  expiryDate: string;
  /** Parsed expiry date */
  expiryDateParsed?: Date;
  /** Personal number (optional, varies by country) */
  personalNumber?: string;
  /** Raw MRZ lines */
  rawMRZ: string[];
  /** Check digits valid */
  checkDigitsValid: boolean;
}

/**
 * Passport scan result
 */
export interface PassportScanResult {
  /** Whether scan was successful */
  success: boolean;
  /** MRZ data if extracted */
  mrzData?: MRZData;
  /** Face photo (base64) if extracted */
  facePhoto?: string;
  /** Document image (base64) */
  documentImage?: string;
  /** Confidence score */
  confidence: number;
  /** Whether document appears genuine */
  genuineCheck?: {
    passed: boolean;
    warnings?: string[];
  };
  /** eKYC verification status */
  eKYCStatus?: 'verified' | 'pending' | 'failed';
  /** Error message if failed */
  error?: string;
}

/**
 * Passport scanner configuration
 */
export interface PassportScannerConfig {
  /** Enable face photo extraction */
  extractFacePhoto?: boolean;
  /** Enable genuineness check */
  enableGenuineCheck?: boolean;
  /** Camera facing mode */
  facingMode?: 'user' | 'environment';
  /** Scan timeout in seconds */
  timeout?: number;
}

/**
 * Passport scanner service interface
 */
export interface PassportScannerService {
  /** Whether passport scanning is supported */
  isSupported(): boolean;
  
  /** Initialize scanner */
  initialize(config?: PassportScannerConfig): Promise<void>;
  
  /** Start scanning */
  startScan(): Promise<void>;
  
  /** Stop scanning */
  stopScan(): void;
  
  /** Get scan result */
  getScanResult(): Promise<PassportScanResult>;
  
  /** Parse MRZ from image */
  parseMRZ(image: string): Promise<MRZData | null>;
  
  /** Validate MRZ check digits */
  validateMRZ(mrzData: MRZData): boolean;
}

// ============================================================================
// Label Printer Integration
// ============================================================================

/**
 * Printer connection types
 */
export type PrinterConnectionType = 'usb' | 'bluetooth' | 'network' | 'cloud';

/**
 * Label size presets
 */
export type LabelSize = 
  | '4x6'      // 4x6 inch (standard shipping)
  | '4x8'      // 4x8 inch
  | '2x1'      // 2x1 inch (product labels)
  | '62mm'     // 62mm roll (Brother)
  | '102mm'    // 102mm roll
  | 'custom';

/**
 * Printer device info
 */
export interface PrinterDevice {
  /** Device ID */
  id: string;
  /** Device name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Model */
  model: string;
  /** Connection type */
  connectionType: PrinterConnectionType;
  /** Supported label sizes */
  supportedSizes: LabelSize[];
  /** Current label size */
  currentSize?: LabelSize;
  /** Paper/label remaining (percentage) */
  mediaRemaining?: number;
  /** Whether device is ready */
  ready: boolean;
}

/**
 * Barcode types for labels
 */
export type BarcodeType = 
  | 'code128'
  | 'code39'
  | 'ean13'
  | 'upc'
  | 'qr'
  | 'datamatrix'
  | 'pdf417';

/**
 * Label element types
 */
export interface LabelElement {
  /** Element type */
  type: 'text' | 'barcode' | 'image' | 'line' | 'rectangle';
  /** X position (in points) */
  x: number;
  /** Y position (in points) */
  y: number;
  /** Width (optional) */
  width?: number;
  /** Height (optional) */
  height?: number;
  /** Rotation in degrees */
  rotation?: 0 | 90 | 180 | 270;
}

/**
 * Text element for labels
 */
export interface TextElement extends LabelElement {
  type: 'text';
  /** Text content */
  content: string;
  /** Font family */
  fontFamily?: string;
  /** Font size in points */
  fontSize?: number;
  /** Bold */
  bold?: boolean;
  /** Maximum width for wrapping */
  maxWidth?: number;
}

/**
 * Barcode element for labels
 */
export interface BarcodeElement extends LabelElement {
  type: 'barcode';
  /** Barcode type */
  barcodeType: BarcodeType;
  /** Data to encode */
  data: string;
  /** Show text below barcode */
  showText?: boolean;
  /** Barcode height */
  height: number;
  /** Module width (bar width) */
  moduleWidth?: number;
}

/**
 * Image element for labels
 */
export interface ImageElement extends LabelElement {
  type: 'image';
  /** Image data (base64) or URL */
  source: string;
  /** Width */
  width: number;
  /** Height */
  height: number;
}

/**
 * Shipping label template data
 */
export interface ShippingLabelData {
  /** Shipper address */
  shipper: {
    name: string;
    company?: string;
    address: AddressInput;
    phone?: string;
  };
  /** Recipient address */
  recipient: {
    name: string;
    company?: string;
    address: AddressInput;
    phone?: string;
  };
  /** Tracking number */
  trackingNumber: string;
  /** Carrier service */
  service?: string;
  /** Weight */
  weight?: {
    value: number;
    unit: WeightUnit;
  };
  /** Dimensions */
  dimensions?: PackageDimensions;
  /** Reference numbers */
  references?: string[];
  /** Special services */
  services?: string[];
  /** Carrier logo */
  carrierLogo?: string;
}

/**
 * Print job request
 */
export interface PrintJobRequest {
  /** Number of copies */
  copies?: number;
  /** Label size */
  labelSize?: LabelSize;
  /** Custom elements (for custom labels) */
  elements?: LabelElement[];
  /** Shipping label data (for shipping labels) */
  shippingLabel?: ShippingLabelData;
  /** ZPL commands (for raw printing) */
  zplCommands?: string;
  /** Print quality */
  quality?: 'draft' | 'normal' | 'high';
}

/**
 * Print job result
 */
export interface PrintJobResult {
  /** Job ID */
  jobId: string;
  /** Status */
  status: 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled';
  /** Copies printed */
  copiesPrinted: number;
  /** Timestamp */
  timestamp: Date;
  /** Error message if failed */
  error?: string;
}

/**
 * Label printer event handlers
 */
export interface LabelPrinterEventHandlers {
  onConnect?: (device: PrinterDevice) => void;
  onDisconnect?: (deviceId: string) => void;
  onPrintStart?: (jobId: string) => void;
  onPrintComplete?: (result: PrintJobResult) => void;
  onPrintError?: (error: Error) => void;
  onMediaLow?: (remaining: number) => void;
}

/**
 * Label printer service interface
 */
export interface LabelPrinterService {
  /** Whether printing is supported */
  isSupported(): boolean;
  
  /** Scan for available printers */
  scanPrinters(): Promise<PrinterDevice[]>;
  
  /** Connect to printer */
  connect(deviceId: string): Promise<void>;
  
  /** Disconnect from printer */
  disconnect(): Promise<void>;
  
  /** Get connected printer info */
  getConnectedPrinter(): PrinterDevice | null;
  
  /** Print label */
  print(request: PrintJobRequest): Promise<PrintJobResult>;
  
  /** Cancel print job */
  cancelJob(jobId: string): Promise<void>;
  
  /** Get print job status */
  getJobStatus(jobId: string): Promise<PrintJobResult>;
  
  /** Generate ZPL from label data */
  generateZPL(labelData: ShippingLabelData): string;
  
  /** Preview label (returns image) */
  preview(request: PrintJobRequest): Promise<string>;
  
  /** Register event handlers */
  on<K extends keyof LabelPrinterEventHandlers>(
    event: K,
    handler: NonNullable<LabelPrinterEventHandlers[K]>
  ): void;
}
