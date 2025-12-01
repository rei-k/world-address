/**
 * @vey/core - Dashboard & Analytics Types
 *
 * Types for dashboard/analytics features:
 * - Heatmap analysis
 * - Inventory management
 * - Staff performance
 * - Profit margin calculation
 * - Fraud detection
 */

import type { AddressInput } from './types';
import type { CarrierCode } from './logistics';

// ============================================================================
// Heatmap Analysis
// ============================================================================

/**
 * Geographic data point for heatmap
 */
export interface GeoDataPoint {
  /** Country code */
  countryCode: string;
  /** Country name */
  countryName: string;
  /** Shipment count */
  shipmentCount: number;
  /** Total value */
  totalValue: {
    amount: number;
    currency: string;
  };
  /** Average weight */
  averageWeight: number;
  /** Top carriers used */
  topCarriers: Array<{
    carrier: CarrierCode;
    percentage: number;
  }>;
  /** Subdivision data (if available) */
  subdivisions?: Array<{
    code: string;
    name: string;
    shipmentCount: number;
    totalValue: number;
  }>;
}

/**
 * Heatmap configuration
 */
export interface HeatmapConfig {
  /** Date range */
  dateRange: {
    from: string;
    to: string;
  };
  /** Metric to display */
  metric: 'shipment_count' | 'value' | 'weight';
  /** Group by */
  groupBy: 'country' | 'region' | 'city';
  /** Direction filter */
  direction?: 'outbound' | 'inbound' | 'both';
  /** Carrier filter */
  carrier?: CarrierCode;
}

/**
 * Heatmap data
 */
export interface HeatmapData {
  /** Configuration used */
  config: HeatmapConfig;
  /** Data points */
  dataPoints: GeoDataPoint[];
  /** Summary statistics */
  summary: {
    totalShipments: number;
    totalValue: number;
    totalCountries: number;
    topDestination: string;
    topOrigin: string;
    periodComparison?: {
      previousPeriod: {
        from: string;
        to: string;
      };
      shipmentChange: number; // percentage
      valueChange: number; // percentage
    };
  };
  /** Generated at */
  generatedAt: string;
}

// ============================================================================
// Inventory Management
// ============================================================================

/**
 * Inventory item types
 */
export type InventoryItemType =
  | 'box_small'
  | 'box_medium'
  | 'box_large'
  | 'box_xl'
  | 'envelope'
  | 'tube'
  | 'bubble_wrap'
  | 'tape'
  | 'label_roll'
  | 'receipt_paper'
  | 'ink_cartridge'
  | 'custom';

/**
 * Inventory item
 */
export interface InventoryItem {
  /** Item ID */
  id: string;
  /** Item type */
  type: InventoryItemType;
  /** Item name */
  name: string;
  /** SKU */
  sku?: string;
  /** Current quantity */
  quantity: number;
  /** Unit of measure */
  unit: string;
  /** Reorder threshold */
  reorderThreshold: number;
  /** Reorder quantity */
  reorderQuantity: number;
  /** Cost per unit */
  costPerUnit: number;
  /** Currency */
  currency: string;
  /** Supplier */
  supplier?: {
    name: string;
    contactEmail?: string;
    leadTimeDays?: number;
  };
  /** Last reorder date */
  lastReorderDate?: string;
  /** Usage forecast */
  usageForecast?: {
    dailyAverage: number;
    weeklyAverage: number;
    daysUntilEmpty: number;
  };
}

/**
 * Inventory alert
 */
export interface InventoryAlert {
  /** Alert ID */
  id: string;
  /** Item */
  item: InventoryItem;
  /** Alert type */
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'overstock';
  /** Severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Message */
  message: string;
  /** Created at */
  createdAt: string;
  /** Acknowledged */
  acknowledged: boolean;
  /** Acknowledged by */
  acknowledgedBy?: string;
  /** Acknowledged at */
  acknowledgedAt?: string;
}

/**
 * Inventory usage record
 */
export interface InventoryUsage {
  /** Item ID */
  itemId: string;
  /** Quantity used */
  quantity: number;
  /** Used at */
  usedAt: string;
  /** Used by (staff ID) */
  usedBy?: string;
  /** Related shipment */
  shipmentId?: string;
  /** Notes */
  notes?: string;
}

/**
 * Inventory report
 */
export interface InventoryReport {
  /** Report date */
  date: string;
  /** Items */
  items: InventoryItem[];
  /** Alerts */
  alerts: InventoryAlert[];
  /** Total inventory value */
  totalValue: number;
  /** Items needing reorder */
  needsReorder: InventoryItem[];
  /** Usage statistics */
  usageStats: {
    period: string;
    totalItemsUsed: number;
    totalCost: number;
    byType: Record<InventoryItemType, {
      quantity: number;
      cost: number;
    }>;
  };
}

// ============================================================================
// Staff Performance
// ============================================================================

/**
 * Staff member
 */
export interface StaffMember {
  /** Staff ID */
  id: string;
  /** Name */
  name: string;
  /** Role */
  role: 'admin' | 'manager' | 'staff' | 'trainee';
  /** Email */
  email?: string;
  /** Active */
  active: boolean;
  /** Started date */
  startedAt: string;
}

/**
 * Staff performance metrics
 */
export interface StaffPerformanceMetrics {
  /** Staff member */
  staff: StaffMember;
  /** Period */
  period: {
    from: string;
    to: string;
  };
  /** Shipments processed */
  shipmentsProcessed: number;
  /** Average processing time (seconds) */
  averageProcessingTime: number;
  /** Error rate */
  errorRate: number;
  /** Corrections made */
  correctionsMade: number;
  /** Customer complaints */
  customerComplaints: number;
  /** Revenue generated */
  revenueGenerated: {
    amount: number;
    currency: string;
  };
  /** Hours worked */
  hoursWorked: number;
  /** Productivity score (0-100) */
  productivityScore: number;
  /** Accuracy score (0-100) */
  accuracyScore: number;
  /** Comparison to average */
  comparison: {
    processingTime: number; // percentage vs average
    errorRate: number; // percentage vs average
    productivity: number; // percentage vs average
  };
  /** Ranking among staff */
  ranking: {
    position: number;
    total: number;
  };
}

/**
 * Staff performance error
 */
export interface StaffPerformanceError {
  /** Error ID */
  id: string;
  /** Staff ID */
  staffId: string;
  /** Error type */
  errorType: 'address' | 'weight' | 'dimensions' | 'carrier' | 'payment' | 'label' | 'other';
  /** Description */
  description: string;
  /** Related shipment */
  shipmentId?: string;
  /** Occurred at */
  occurredAt: string;
  /** Resolved */
  resolved: boolean;
  /** Resolution notes */
  resolutionNotes?: string;
}

/**
 * Staff leaderboard
 */
export interface StaffLeaderboard {
  /** Period */
  period: {
    from: string;
    to: string;
  };
  /** Metric being ranked */
  metric: 'productivity' | 'accuracy' | 'revenue' | 'volume';
  /** Rankings */
  rankings: Array<{
    position: number;
    staff: StaffMember;
    value: number;
    change: number; // change from previous period
  }>;
}

// ============================================================================
// Profit Margin Analysis
// ============================================================================

/**
 * Cost breakdown
 */
export interface CostBreakdown {
  /** Carrier cost */
  carrierCost: number;
  /** Packaging cost */
  packagingCost: number;
  /** Labor cost */
  laborCost: number;
  /** Processing fees */
  processingFees: number;
  /** Insurance cost */
  insuranceCost: number;
  /** Carbon offset cost */
  carbonOffsetCost?: number;
  /** Other costs */
  otherCosts: number;
  /** Total cost */
  totalCost: number;
}

/**
 * Revenue breakdown
 */
export interface RevenueBreakdown {
  /** Shipping charge */
  shippingCharge: number;
  /** Packaging charge */
  packagingCharge: number;
  /** Insurance charge */
  insuranceCharge: number;
  /** Service fees */
  serviceFees: number;
  /** Surcharges */
  surcharges: number;
  /** Discounts applied */
  discounts: number;
  /** Total revenue */
  totalRevenue: number;
}

/**
 * Shipment profit analysis
 */
export interface ShipmentProfitAnalysis {
  /** Shipment ID */
  shipmentId: string;
  /** Tracking number */
  trackingNumber: string;
  /** Created at */
  createdAt: string;
  /** Carrier */
  carrier: CarrierCode;
  /** Service */
  service: string;
  /** Origin country */
  originCountry: string;
  /** Destination country */
  destinationCountry: string;
  /** Weight */
  weight: number;
  /** Cost breakdown */
  costs: CostBreakdown;
  /** Revenue breakdown */
  revenue: RevenueBreakdown;
  /** Gross profit */
  grossProfit: number;
  /** Profit margin (percentage) */
  profitMargin: number;
  /** Break-even point */
  breakEvenWeight?: number;
}

/**
 * Profit margin report
 */
export interface ProfitMarginReport {
  /** Report period */
  period: {
    from: string;
    to: string;
  };
  /** Summary */
  summary: {
    totalShipments: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    averageMargin: number;
    medianMargin: number;
  };
  /** By carrier */
  byCarrier: Array<{
    carrier: CarrierCode;
    shipmentCount: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  /** By destination */
  byDestination: Array<{
    country: string;
    shipmentCount: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  /** By service level */
  byServiceLevel: Array<{
    level: string;
    shipmentCount: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  /** Loss-making shipments */
  lossMakingShipments: ShipmentProfitAnalysis[];
  /** Recommendations */
  recommendations: string[];
}

// ============================================================================
// Fraud Detection
// ============================================================================

/**
 * Fraud risk level
 */
export type FraudRiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Fraud indicator
 */
export interface FraudIndicator {
  /** Indicator type */
  type: 
    | 'high_value_rapid'      // High value shipments in short time
    | 'suspicious_destination' // Known fraud destination
    | 'payment_mismatch'      // Payment details don't match
    | 'velocity_spike'        // Unusual activity volume
    | 'address_manipulation'  // Address appears manipulated
    | 'new_account_risk'      // New account with high activity
    | 'device_fingerprint'    // Known fraudulent device
    | 'time_anomaly'          // Activity at unusual times
    | 'refund_pattern'        // Unusual refund requests
    | 'custom';
  /** Description */
  description: string;
  /** Weight in risk score */
  weight: number;
  /** Evidence */
  evidence?: string;
}

/**
 * Fraud alert
 */
export interface FraudAlert {
  /** Alert ID */
  id: string;
  /** Risk level */
  riskLevel: FraudRiskLevel;
  /** Risk score (0-100) */
  riskScore: number;
  /** Indicators */
  indicators: FraudIndicator[];
  /** Related entity type */
  entityType: 'shipment' | 'customer' | 'payment' | 'session';
  /** Entity ID */
  entityId: string;
  /** Details */
  details: {
    customerId?: string;
    customerName?: string;
    shipmentId?: string;
    trackingNumber?: string;
    paymentId?: string;
    paymentAmount?: number;
    ipAddress?: string;
    deviceId?: string;
  };
  /** Created at */
  createdAt: string;
  /** Status */
  status: 'pending' | 'reviewing' | 'confirmed_fraud' | 'false_positive' | 'dismissed';
  /** Reviewed by */
  reviewedBy?: string;
  /** Review notes */
  reviewNotes?: string;
  /** Actions taken */
  actionsTaken?: string[];
}

/**
 * Fraud screening request
 */
export interface FraudScreeningRequest {
  /** Shipment data */
  shipment?: {
    origin: AddressInput;
    destination: AddressInput;
    value: number;
    weight: number;
  };
  /** Customer data */
  customer?: {
    id?: string;
    email?: string;
    phone?: string;
    name?: string;
    accountAge?: number; // days
    shipmentCount?: number;
  };
  /** Payment data */
  payment?: {
    method: string;
    cardLast4?: string;
    cardBrand?: string;
    billingAddress?: AddressInput;
  };
  /** Session data */
  session?: {
    ipAddress?: string;
    deviceId?: string;
    userAgent?: string;
    isVPN?: boolean;
  };
}

/**
 * Fraud screening response
 */
export interface FraudScreeningResponse {
  /** Overall risk level */
  riskLevel: FraudRiskLevel;
  /** Risk score (0-100) */
  riskScore: number;
  /** Recommendation */
  recommendation: 'approve' | 'review' | 'block';
  /** Indicators found */
  indicators: FraudIndicator[];
  /** Suggested actions */
  suggestedActions: string[];
  /** Alert created (if high risk) */
  alertId?: string;
}

/**
 * Fraud rules configuration
 */
export interface FraudRulesConfig {
  /** High value threshold */
  highValueThreshold: number;
  /** Velocity limit (shipments per hour) */
  velocityLimit: number;
  /** New account restriction days */
  newAccountRestrictionDays: number;
  /** Suspicious countries */
  suspiciousCountries: string[];
  /** Block VPN */
  blockVPN: boolean;
  /** Require verification above amount */
  verificationThreshold: number;
  /** Custom rules */
  customRules?: Array<{
    name: string;
    condition: string;
    action: string;
    enabled: boolean;
  }>;
}

// ============================================================================
// Dashboard Service Interface
// ============================================================================

/**
 * Dashboard service configuration
 */
export interface DashboardConfig {
  /** Default date range (days) */
  defaultDateRange?: number;
  /** Currency for reports */
  currency?: string;
  /** Timezone */
  timezone?: string;
  /** Refresh interval (seconds) */
  refreshInterval?: number;
}

/**
 * Dashboard service interface
 */
export interface DashboardService {
  /** Get heatmap data */
  getHeatmapData(config: HeatmapConfig): Promise<HeatmapData>;
  
  /** Get inventory report */
  getInventoryReport(): Promise<InventoryReport>;
  
  /** Get inventory alerts */
  getInventoryAlerts(acknowledged?: boolean): Promise<InventoryAlert[]>;
  
  /** Update inventory item */
  updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem>;
  
  /** Record inventory usage */
  recordInventoryUsage(usage: InventoryUsage): Promise<void>;
  
  /** Acknowledge inventory alert */
  acknowledgeInventoryAlert(alertId: string, userId: string): Promise<void>;
  
  /** Get staff performance */
  getStaffPerformance(staffId: string, period: { from: string; to: string }): Promise<StaffPerformanceMetrics>;
  
  /** Get staff leaderboard */
  getStaffLeaderboard(
    metric: 'productivity' | 'accuracy' | 'revenue' | 'volume',
    period: { from: string; to: string }
  ): Promise<StaffLeaderboard>;
  
  /** Record staff error */
  recordStaffError(error: Omit<StaffPerformanceError, 'id' | 'occurredAt'>): Promise<void>;
  
  /** Get profit margin report */
  getProfitMarginReport(period: { from: string; to: string }): Promise<ProfitMarginReport>;
  
  /** Analyze shipment profit */
  analyzeShipmentProfit(shipmentId: string): Promise<ShipmentProfitAnalysis>;
  
  /** Screen for fraud */
  screenForFraud(request: FraudScreeningRequest): Promise<FraudScreeningResponse>;
  
  /** Get fraud alerts */
  getFraudAlerts(options?: {
    status?: FraudAlert['status'];
    riskLevel?: FraudRiskLevel;
    limit?: number;
  }): Promise<FraudAlert[]>;
  
  /** Review fraud alert */
  reviewFraudAlert(
    alertId: string,
    decision: 'confirmed_fraud' | 'false_positive' | 'dismissed',
    notes: string,
    reviewerId: string
  ): Promise<void>;
  
  /** Get fraud rules config */
  getFraudRulesConfig(): Promise<FraudRulesConfig>;
  
  /** Update fraud rules config */
  updateFraudRulesConfig(config: Partial<FraudRulesConfig>): Promise<void>;
}
