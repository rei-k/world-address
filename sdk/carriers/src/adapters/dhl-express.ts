/**
 * DHL Express Adapter
 * 
 * API Documentation: https://developer.dhl.com/
 */

import axios from 'axios';
import { CarrierAdapter } from './base';
import {
  Shipment,
  ValidationResult,
  PickupOrder,
  OrderResult,
  TrackingInfo,
  TrackingStatus,
  CancelResult,
  CarrierConfig
} from '../types';

export class DHLExpressAdapter extends CarrierAdapter {
  protected getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://express.api.dhl.com'
      : 'https://express.api.dhl.com/sandbox';
  }

  /**
   * Validate address and shipment
   */
  async validateShipment(shipment: Shipment): Promise<ValidationResult> {
    try {
      // Get rate quote which includes service availability
      const weight = shipment.items.reduce((sum, item) => sum + item.weight, 0);
      
      const rateResponse = await this.makeRequest('rates', 'POST', {
        customerDetails: {
          shipperDetails: {
            postalAddress: {
              cityName: shipment.sender.address.city,
              countryCode: shipment.sender.address.country,
              postalCode: shipment.sender.address.postalCode,
              provinceCode: shipment.sender.address.province
            }
          },
          receiverDetails: {
            postalAddress: {
              cityName: shipment.recipient.address.city,
              countryCode: shipment.recipient.address.country,
              postalCode: shipment.recipient.address.postalCode,
              provinceCode: shipment.recipient.address.province
            }
          }
        },
        accounts: [
          {
            typeCode: 'shipper',
            number: this.config.customerId
          }
        ],
        productCode: this.getProductCode(shipment.deliveryRequirement),
        plannedShippingDateAndTime: new Date().toISOString(),
        unitOfMeasurement: 'metric',
        isCustomsDeclarable: this.isInternational(shipment),
        packages: [
          {
            weight: weight,
            dimensions: {
              length: 10,
              width: 10,
              height: 10
            }
          }
        ]
      });

      const prohibitedItems = this.checkProhibitedItems(shipment.items);
      const products = rateResponse.products || [];
      const hasAvailableService = products.length > 0;

      return {
        valid: hasAvailableService && prohibitedItems.length === 0,
        deliverable: hasAvailableService,
        prohibitedItems,
        estimatedCost: products[0]?.totalPrice?.[0] ? {
          amount: parseFloat(products[0].totalPrice[0].price),
          currency: products[0].totalPrice[0].priceCurrency
        } : undefined,
        estimatedDeliveryTime: products[0]?.deliveryCapabilities?.deliveryTypeCode ? {
          min: 24,
          max: 72
        } : undefined
      };
    } catch (error: any) {
      return {
        valid: false,
        deliverable: false,
        prohibitedItems: [],
        reason: error.message
      };
    }
  }

  /**
   * Create shipment with DHL Express
   */
  async createPickupOrder(order: PickupOrder): Promise<OrderResult> {
    const weight = order.shipment.items.reduce((sum, item) => sum + item.weight, 0);
    
    const requestData = {
      plannedShippingDateAndTime: new Date().toISOString(),
      pickup: {
        isRequested: true,
        pickupDetails: {
          postalAddress: {
            addressLine1: order.shipment.sender.address.street,
            cityName: order.shipment.sender.address.city,
            countryCode: order.shipment.sender.address.country,
            postalCode: order.shipment.sender.address.postalCode,
            provinceCode: order.shipment.sender.address.province
          },
          contactInformation: {
            fullName: order.shipment.sender.name,
            phone: order.shipment.sender.phone,
            companyName: order.shipment.sender.company
          }
        }
      },
      productCode: this.getProductCode(order.shipment.deliveryRequirement),
      accounts: [
        {
          typeCode: 'shipper',
          number: this.config.customerId
        }
      ],
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            addressLine1: order.shipment.sender.address.street,
            cityName: order.shipment.sender.address.city,
            countryCode: order.shipment.sender.address.country,
            postalCode: order.shipment.sender.address.postalCode,
            provinceCode: order.shipment.sender.address.province
          },
          contactInformation: {
            fullName: order.shipment.sender.name,
            phone: order.shipment.sender.phone,
            companyName: order.shipment.sender.company,
            email: order.shipment.sender.email
          }
        },
        receiverDetails: {
          postalAddress: {
            addressLine1: order.shipment.recipient.address.street,
            cityName: order.shipment.recipient.address.city,
            countryCode: order.shipment.recipient.address.country,
            postalCode: order.shipment.recipient.address.postalCode,
            provinceCode: order.shipment.recipient.address.province
          },
          contactInformation: {
            fullName: order.shipment.recipient.name,
            phone: order.shipment.recipient.phone,
            companyName: order.shipment.recipient.company,
            email: order.shipment.recipient.email
          }
        }
      },
      content: {
        packages: [
          {
            weight: weight,
            dimensions: {
              length: 10,
              width: 10,
              height: 10
            }
          }
        ],
        isCustomsDeclarable: this.isInternational(order.shipment),
        description: order.shipment.notes || 'General Merchandise'
      },
      outputImageProperties: {
        imageOptions: [
          {
            typeCode: 'label',
            templateName: 'ECOM26_84_001'
          }
        ]
      }
    };

    const response = await this.makeRequest('shipments', 'POST', requestData);

    const shipmentTrackingNumber = response.shipmentTrackingNumber;
    const packages = response.packages || [];

    return {
      waybillNumber: shipmentTrackingNumber,
      orderId: shipmentTrackingNumber,
      trackingNumber: shipmentTrackingNumber,
      trackingUrl: `https://www.dhl.com/en/express/tracking.html?AWB=${shipmentTrackingNumber}`,
      labelData: packages[0]?.documents?.[0]?.content,
      qrCode: packages[0]?.trackingNumber
    };
  }

  /**
   * Track shipment
   */
  async trackShipment(waybillNumber: string): Promise<TrackingInfo> {
    const response = await this.makeRequest(`tracking?trackingNumber=${waybillNumber}`, 'GET');

    const shipments = response.shipments || [];
    const shipment = shipments[0];
    
    const events = (shipment?.events || []).map((event: any) => ({
      timestamp: new Date(event.timestamp),
      status: this.mapStatusToEnum(event.typeCode),
      location: `${event.location?.address?.addressLocality || ''}`,
      description: event.description,
      coordinates: event.location?.address ? {
        latitude: parseFloat(event.location.address.latitude || '0'),
        longitude: parseFloat(event.location.address.longitude || '0')
      } : undefined
    }));

    return {
      waybillNumber,
      currentStatus: events.length > 0 ? events[0].status : TrackingStatus.ORDER_CREATED,
      events,
      estimatedDelivery: shipment?.estimatedDeliveryDate ? 
        new Date(shipment.estimatedDeliveryDate) : undefined,
      currentLocation: events.length > 0 ? events[0].location : undefined
    };
  }

  /**
   * Cancel order (delete shipment)
   */
  async cancelOrder(waybillNumber: string, reason?: string): Promise<CancelResult> {
    try {
      // DHL Express uses DELETE endpoint for cancellation
      await this.makeRequest(`shipments/${waybillNumber}`, 'DELETE');

      return {
        success: true,
        reason: 'Shipment cancelled successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * Get shipping quote
   */
  async getQuote(shipment: Shipment): Promise<{
    amount: number;
    currency: string;
    estimatedDays: number;
  }> {
    const weight = shipment.items.reduce((sum, item) => sum + item.weight, 0);
    
    const response = await this.makeRequest('rates', 'POST', {
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            cityName: shipment.sender.address.city,
            countryCode: shipment.sender.address.country,
            postalCode: shipment.sender.address.postalCode,
            provinceCode: shipment.sender.address.province
          }
        },
        receiverDetails: {
          postalAddress: {
            cityName: shipment.recipient.address.city,
            countryCode: shipment.recipient.address.country,
            postalCode: shipment.recipient.address.postalCode,
            provinceCode: shipment.recipient.address.province
          }
        }
      },
      accounts: [
        {
          typeCode: 'shipper',
          number: this.config.customerId
        }
      ],
      productCode: this.getProductCode(shipment.deliveryRequirement),
      plannedShippingDateAndTime: new Date().toISOString(),
      unitOfMeasurement: 'metric',
      isCustomsDeclarable: this.isInternational(shipment),
      packages: [
        {
          weight: weight,
          dimensions: {
            length: 10,
            width: 10,
            height: 10
          }
        }
      ]
    });

    const product = response.products?.[0];
    
    return {
      amount: parseFloat(product?.totalPrice?.[0]?.price || '0'),
      currency: product?.totalPrice?.[0]?.priceCurrency || 'USD',
      estimatedDays: 3 // DHL Express typically 1-3 days
    };
  }

  /**
   * Make authenticated API request to DHL Express
   */
  protected async makeRequest(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<any> {
    const auth = Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64');

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}/${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        timeout: this.config.timeout || 30000
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`DHL Express API Error: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Generate signature (not used for DHL Basic Auth)
   */
  protected generateSignature(data: any): string {
    return '';
  }

  /**
   * Helper methods
   */

  private getProductCode(requirement?: string): string {
    const products: Record<string, string> = {
      'EXPRESS': 'P', // DHL Express Worldwide
      'STANDARD': 'N', // DHL Express 12:00
      'ECONOMY': 'Y'   // DHL Express Economy Select
    };
    return products[requirement || 'STANDARD'] || 'N';
  }

  private isInternational(shipment: Shipment): boolean {
    return shipment.sender.address.country !== shipment.recipient.address.country;
  }

  private checkProhibitedItems(items: any[]): string[] {
    const prohibited = [
      'explosive', 'flammable', 'corrosive', 'toxic', 
      'radioactive', 'weapon', 'ammunition', 'live animal',
      'hazardous', 'dangerous goods', 'battery', 'lithium'
    ];

    return items
      .filter(item => 
        prohibited.some(keyword => 
          item.name.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword)
        )
      )
      .map(item => item.name);
  }

  private mapStatusToEnum(typeCode: string): TrackingStatus {
    const mapping: Record<string, TrackingStatus> = {
      'PU': TrackingStatus.PICKED_UP,
      'PL': TrackingStatus.PICKED_UP,
      'RW': TrackingStatus.IN_TRANSIT,
      'TD': TrackingStatus.IN_TRANSIT,
      'AF': TrackingStatus.ARRIVED_AT_FACILITY,
      'WC': TrackingStatus.OUT_FOR_DELIVERY,
      'OK': TrackingStatus.DELIVERED,
      'DF': TrackingStatus.DELIVERED,
      'CC': TrackingStatus.EXCEPTION,
      'CD': TrackingStatus.CANCELLED
    };

    return mapping[typeCode] || TrackingStatus.IN_TRANSIT;
  }
}
