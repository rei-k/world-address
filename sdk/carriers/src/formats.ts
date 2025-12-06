/**
 * Standardized Waybill Format Templates
 * Learned from various carriers worldwide
 * 
 * This module defines standard waybill formats that can be used
 * across different carriers for consistent data handling
 */

/**
 * Standard waybill format
 * Common structure across all carriers
 */
export interface StandardWaybillFormat {
  // Core identification
  waybillNumber: string;
  orderNumber?: string;
  trackingNumber?: string;
  
  // Shipment details
  shipmentDate: Date;
  serviceType: 'STANDARD' | 'EXPRESS' | 'ECONOMY' | 'OVERNIGHT';
  
  // Sender information
  sender: {
    name: string;
    nameKana?: string; // Japanese phonetic name
    company?: string;
    phone: string;
    email?: string;
    address: StandardAddress;
  };
  
  // Recipient information
  recipient: {
    name: string;
    nameKana?: string;
    company?: string;
    phone: string;
    email?: string;
    address: StandardAddress;
  };
  
  // Package details
  packages: StandardPackage[];
  
  // Value and customs
  declaredValue?: {
    amount: number;
    currency: string;
  };
  
  // Delivery preferences
  deliveryPreferences?: {
    timeSlot?: string;
    leaveAtDoor?: boolean;
    signatureRequired?: boolean;
    deliveryInstructions?: string;
  };
  
  // Payment
  paymentMethod: 'SENDER' | 'RECIPIENT' | 'THIRD_PARTY';
  cashOnDelivery?: {
    amount: number;
    currency: string;
  };
  
  // Insurance
  insurance?: {
    value: number;
    currency: string;
    type: 'BASIC' | 'PREMIUM';
  };
  
  // Special services
  specialServices?: string[];
  
  // References
  customerReference?: string;
  invoiceNumber?: string;
  
  // Label and documents
  label?: {
    format: 'PDF' | 'ZPL' | 'PNG' | 'JPG';
    data: string; // Base64 encoded
    url?: string;
  };
  
  // Tracking
  qrCode?: string;
  barcode?: string;
  trackingUrl?: string;
  
  // Status
  status: 'DRAFT' | 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
}

/**
 * Standard address format
 * Supports international address structures
 */
export interface StandardAddress {
  // Country (ISO 3166-1 alpha-2)
  country: string;
  
  // Administrative divisions
  admin1?: string; // Province/State
  admin2?: string; // City
  admin3?: string; // District/County
  
  // Postal code
  postalCode?: string;
  
  // Street address
  addressLine1: string;
  addressLine2?: string;
  
  // Building details
  building?: string;
  floor?: string;
  unit?: string;
  room?: string;
  
  // Geocoding
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Additional info
  landmark?: string;
  neighborhood?: string;
}

/**
 * Standard package format
 */
export interface StandardPackage {
  // Identification
  packageNumber?: string;
  referenceNumber?: string;
  
  // Physical properties
  weight: {
    value: number;
    unit: 'KG' | 'LB';
  };
  
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'CM' | 'IN';
  };
  
  // Contents
  description: string;
  items: PackageItem[];
  
  // Handling
  isFragile?: boolean;
  isPerishable?: boolean;
  requiresCooling?: boolean;
  handlingInstructions?: string;
}

/**
 * Package item
 */
export interface PackageItem {
  name: string;
  description?: string;
  quantity: number;
  weight: number;
  value?: number;
  currency?: string;
  hsCode?: string; // Harmonized System code for customs
  countryOfOrigin?: string;
  sku?: string;
}

/**
 * Waybill format converters
 */
export class WaybillFormatConverter {
  /**
   * Convert to SF Express format
   */
  static toSFExpressFormat(waybill: StandardWaybillFormat): any {
    return {
      orderId: waybill.orderNumber,
      serviceCode: this.mapServiceTypeToSF(waybill.serviceType),
      consignee: {
        name: waybill.recipient.name,
        mobile: waybill.recipient.phone,
        province: waybill.recipient.address.admin1,
        city: waybill.recipient.address.admin2,
        county: waybill.recipient.address.admin3 || '',
        address: `${waybill.recipient.address.addressLine1}${waybill.recipient.address.addressLine2 || ''}`
      },
      sender: {
        name: waybill.sender.name,
        mobile: waybill.sender.phone,
        province: waybill.sender.address.admin1,
        city: waybill.sender.address.admin2,
        county: waybill.sender.address.admin3 || '',
        address: `${waybill.sender.address.addressLine1}${waybill.sender.address.addressLine2 || ''}`
      },
      cargo: waybill.packages.map(pkg => ({
        name: pkg.description,
        count: pkg.items.reduce((sum, item) => sum + item.quantity, 0),
        weight: pkg.weight.value,
        amount: pkg.items.reduce((sum, item) => sum + (item.value || 0), 0)
      }))
    };
  }

  /**
   * Convert to UPS format
   */
  static toUPSFormat(waybill: StandardWaybillFormat): any {
    return {
      ShipmentRequest: {
        Shipment: {
          Shipper: {
            Name: waybill.sender.name,
            Phone: { Number: waybill.sender.phone },
            Address: {
              AddressLine: [waybill.sender.address.addressLine1],
              City: waybill.sender.address.admin2,
              StateProvinceCode: waybill.sender.address.admin1,
              PostalCode: waybill.sender.address.postalCode,
              CountryCode: waybill.sender.address.country
            }
          },
          ShipTo: {
            Name: waybill.recipient.name,
            Phone: { Number: waybill.recipient.phone },
            Address: {
              AddressLine: [waybill.recipient.address.addressLine1],
              City: waybill.recipient.address.admin2,
              StateProvinceCode: waybill.recipient.address.admin1,
              PostalCode: waybill.recipient.address.postalCode,
              CountryCode: waybill.recipient.address.country
            }
          },
          Service: {
            Code: this.mapServiceTypeToUPS(waybill.serviceType)
          },
          Package: waybill.packages.map(pkg => ({
            PackagingType: { Code: '02' },
            PackageWeight: {
              UnitOfMeasurement: { Code: pkg.weight.unit === 'KG' ? 'KGS' : 'LBS' },
              Weight: pkg.weight.value.toString()
            }
          }))
        }
      }
    };
  }

  /**
   * Convert to FedEx format
   */
  static toFedExFormat(waybill: StandardWaybillFormat): any {
    return {
      requestedShipment: {
        shipper: {
          contact: {
            personName: waybill.sender.name,
            phoneNumber: waybill.sender.phone,
            companyName: waybill.sender.company
          },
          address: {
            streetLines: [waybill.sender.address.addressLine1],
            city: waybill.sender.address.admin2,
            stateOrProvinceCode: waybill.sender.address.admin1,
            postalCode: waybill.sender.address.postalCode,
            countryCode: waybill.sender.address.country
          }
        },
        recipients: [{
          contact: {
            personName: waybill.recipient.name,
            phoneNumber: waybill.recipient.phone,
            companyName: waybill.recipient.company
          },
          address: {
            streetLines: [waybill.recipient.address.addressLine1],
            city: waybill.recipient.address.admin2,
            stateOrProvinceCode: waybill.recipient.address.admin1,
            postalCode: waybill.recipient.address.postalCode,
            countryCode: waybill.recipient.address.country
          }
        }],
        serviceType: this.mapServiceTypeToFedEx(waybill.serviceType),
        requestedPackageLineItems: waybill.packages.map(pkg => ({
          weight: {
            units: pkg.weight.unit === 'KG' ? 'KG' : 'LB',
            value: pkg.weight.value
          }
        }))
      }
    };
  }

  /**
   * Convert to DHL Express format
   */
  static toDHLFormat(waybill: StandardWaybillFormat): any {
    return {
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            addressLine1: waybill.sender.address.addressLine1,
            cityName: waybill.sender.address.admin2,
            countryCode: waybill.sender.address.country,
            postalCode: waybill.sender.address.postalCode,
            provinceCode: waybill.sender.address.admin1
          },
          contactInformation: {
            fullName: waybill.sender.name,
            phone: waybill.sender.phone,
            companyName: waybill.sender.company,
            email: waybill.sender.email
          }
        },
        receiverDetails: {
          postalAddress: {
            addressLine1: waybill.recipient.address.addressLine1,
            cityName: waybill.recipient.address.admin2,
            countryCode: waybill.recipient.address.country,
            postalCode: waybill.recipient.address.postalCode,
            provinceCode: waybill.recipient.address.admin1
          },
          contactInformation: {
            fullName: waybill.recipient.name,
            phone: waybill.recipient.phone,
            companyName: waybill.recipient.company,
            email: waybill.recipient.email
          }
        }
      },
      productCode: this.mapServiceTypeToDHL(waybill.serviceType),
      content: {
        packages: waybill.packages.map(pkg => ({
          weight: pkg.weight.value,
          dimensions: pkg.dimensions ? {
            length: pkg.dimensions.length,
            width: pkg.dimensions.width,
            height: pkg.dimensions.height
          } : undefined
        }))
      }
    };
  }

  /**
   * Convert to Yamato Transport format
   */
  static toYamatoFormat(waybill: StandardWaybillFormat): any {
    return {
      shipperInfo: {
        name: waybill.sender.name,
        nameKana: waybill.sender.nameKana,
        phone: waybill.sender.phone,
        postalCode: waybill.sender.address.postalCode,
        prefecture: waybill.sender.address.admin1,
        city: waybill.sender.address.admin2,
        address1: waybill.sender.address.addressLine1,
        building: waybill.sender.address.building
      },
      recipientInfo: {
        name: waybill.recipient.name,
        nameKana: waybill.recipient.nameKana,
        phone: waybill.recipient.phone,
        postalCode: waybill.recipient.address.postalCode,
        prefecture: waybill.recipient.address.admin1,
        city: waybill.recipient.address.admin2,
        address1: waybill.recipient.address.addressLine1,
        building: waybill.recipient.address.building
      },
      packageInfo: {
        weight: waybill.packages[0].weight.value,
        quantity: waybill.packages.reduce((sum, pkg) => 
          sum + pkg.items.reduce((s, item) => s + item.quantity, 0), 0
        ),
        description: waybill.packages.map(p => p.description).join(', ')
      }
    };
  }

  // ========== Service Type Mappers ==========

  private static mapServiceTypeToSF(type: string): string {
    const map: Record<string, string> = {
      'EXPRESS': 'EX-STANDARD',
      'STANDARD': 'EX-STANDARD',
      'ECONOMY': 'EX-ECONOMY'
    };
    return map[type] || 'EX-STANDARD';
  }

  private static mapServiceTypeToUPS(type: string): string {
    const map: Record<string, string> = {
      'EXPRESS': '01',
      'STANDARD': '03',
      'ECONOMY': '13'
    };
    return map[type] || '03';
  }

  private static mapServiceTypeToFedEx(type: string): string {
    const map: Record<string, string> = {
      'EXPRESS': 'FEDEX_2_DAY',
      'STANDARD': 'FEDEX_GROUND',
      'ECONOMY': 'GROUND_HOME_DELIVERY'
    };
    return map[type] || 'FEDEX_GROUND';
  }

  private static mapServiceTypeToDHL(type: string): string {
    const map: Record<string, string> = {
      'EXPRESS': 'P',
      'STANDARD': 'N',
      'ECONOMY': 'Y'
    };
    return map[type] || 'N';
  }
}
