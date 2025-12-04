/**
 * VeyPOS Application Types
 * Based on POS schema from world-address-yaml
 */

/**
 * Currency configuration
 */
export interface Currency {
  code: string; // ISO 4217
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  decimalSeparator: string;
  thousandsSeparator: string;
}

/**
 * Tax configuration
 */
export interface TaxConfig {
  type: string; // e.g., "Consumption Tax", "VAT", "Sales Tax"
  rate: {
    standard: number;
    reduced?: Array<{
      rate: number;
      category: string;
    }>;
  };
  includedInPrice: boolean;
  invoiceRequirement?: 'required' | 'optional' | 'not_applicable';
}

/**
 * Receipt configuration
 */
export interface ReceiptConfig {
  requiredFields: string[];
  paperWidth: string;
  electronicAllowed: boolean;
  retentionPeriod: string;
}

/**
 * Payment method
 */
export interface PaymentMethod {
  type: 'cash' | 'card' | 'mobile' | 'qr_code' | 'nfc';
  name: string;
  prevalence: 'high' | 'medium' | 'low';
  enabled: boolean;
}

/**
 * Product/Item
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  taxCategory?: string; // for reduced tax rates
  inventory?: number;
}

/**
 * Cart item
 */
export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

/**
 * Transaction
 */
export interface Transaction {
  id: string;
  storeId: string;
  terminalId: string;
  timestamp: Date;
  items: CartItem[];
  subtotal: number;
  taxBreakdown: Array<{
    rate: number;
    amount: number;
  }>;
  total: number;
  paymentMethod: PaymentMethod;
  currency: Currency;
  customer?: {
    id?: string;
    name?: string;
    veybookId?: string; // Link to Veyvault account
  };
  delivery?: {
    addressToken: string; // From Veyvault
    carrier?: string;
    trackingNumber?: string;
  };
  receiptNumber: string;
}

/**
 * Store configuration
 */
export interface StoreConfig {
  id: string;
  name: string;
  country: string;
  currency: Currency;
  tax: TaxConfig;
  receipt: ReceiptConfig;
  paymentMethods: PaymentMethod[];
  locale: {
    dateFormat: string;
    timeFormat: '12h' | '24h';
    timezone: string;
    weekStart: 'sunday' | 'monday';
  };
}
