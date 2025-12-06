/**
 * FedEx Adapter
 * 
 * API Documentation: https://developer.fedex.com/
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

export class FedExAdapter extends CarrierAdapter {
  private accessToken?: string;
  private tokenExpiresAt?: number;

  protected getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://apis.fedex.com'
      : 'https://apis-sandbox.fedex.com';
  }

  /**
   * Validate address and shipment
   */
  async validateShipment(shipment: Shipment): Promise<ValidationResult> {
    try {
      // Validate address
      const addressValidation = await this.makeRequest('address/v1/addresses/resolve', 'POST', {
        addressesToValidate: [
          {
            address: {
              streetLines: [shipment.recipient.address.street],
              city: shipment.recipient.address.city,
              stateOrProvinceCode: shipment.recipient.address.province,
              postalCode: shipment.recipient.address.postalCode,
              countryCode: shipment.recipient.address.country
            }
          }
        ]
      });

      // Get rate quote
      const weight = shipment.items.reduce((sum, item) => sum + item.weight, 0);
      const rateResponse = await this.makeRequest('rate/v1/rates/quotes', 'POST', {
        accountNumber: {
          value: this.config.customerId
        },
        requestedShipment: {
          shipper: {
            address: {
              city: shipment.sender.address.city,
              stateOrProvinceCode: shipment.sender.address.province,
              postalCode: shipment.sender.address.postalCode,
              countryCode: shipment.sender.address.country
            }
          },
          recipient: {
            address: {
              city: shipment.recipient.address.city,
              stateOrProvinceCode: shipment.recipient.address.province,
              postalCode: shipment.recipient.address.postalCode,
              countryCode: shipment.recipient.address.country
            }
          },
          pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
          serviceType: this.getServiceType(shipment.deliveryRequirement),
          rateRequestType: ['ACCOUNT'],
          requestedPackageLineItems: [
            {
              weight: {
                units: 'KG',
                value: weight
              }
            }
          ]
        }
      });

      const prohibitedItems = this.checkProhibitedItems(shipment.items);
      const addressValid = addressValidation.output?.resolvedAddresses?.[0]?.classification === 'VALID';
      const rateQuote = rateResponse.output?.rateReplyDetails?.[0];

      return {
        valid: addressValid && prohibitedItems.length === 0,
        deliverable: addressValid,
        prohibitedItems,
        estimatedCost: rateQuote?.ratedShipmentDetails?.[0]?.totalNetCharge ? {
          amount: parseFloat(rateQuote.ratedShipmentDetails[0].totalNetCharge),
          currency: rateQuote.ratedShipmentDetails[0].currency || 'USD'
        } : undefined,
        estimatedDeliveryTime: rateQuote?.commit?.dateDetail ? {
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
   * Create pickup order with FedEx
   */
  async createPickupOrder(order: PickupOrder): Promise<OrderResult> {
    const weight = order.shipment.items.reduce((sum, item) => sum + item.weight, 0);
    
    const requestData = {
      accountNumber: {
        value: this.config.customerId
      },
      requestedShipment: {
        shipper: {
          contact: {
            personName: order.shipment.sender.name,
            phoneNumber: order.shipment.sender.phone,
            companyName: order.shipment.sender.company
          },
          address: {
            streetLines: [order.shipment.sender.address.street],
            city: order.shipment.sender.address.city,
            stateOrProvinceCode: order.shipment.sender.address.province,
            postalCode: order.shipment.sender.address.postalCode,
            countryCode: order.shipment.sender.address.country
          }
        },
        recipients: [
          {
            contact: {
              personName: order.shipment.recipient.name,
              phoneNumber: order.shipment.recipient.phone,
              companyName: order.shipment.recipient.company
            },
            address: {
              streetLines: [order.shipment.recipient.address.street],
              city: order.shipment.recipient.address.city,
              stateOrProvinceCode: order.shipment.recipient.address.province,
              postalCode: order.shipment.recipient.address.postalCode,
              countryCode: order.shipment.recipient.address.country
            }
          }
        ],
        shipDatestamp: new Date().toISOString().split('T')[0],
        serviceType: this.getServiceType(order.shipment.deliveryRequirement),
        packagingType: 'YOUR_PACKAGING',
        pickupType: 'USE_SCHEDULED_PICKUP',
        blockInsightVisibility: false,
        shippingChargesPayment: {
          paymentType: this.getPaymentType(order.paymentMethod)
        },
        labelSpecification: {
          imageType: 'PDF',
          labelStockType: 'PAPER_7X4.75'
        },
        requestedPackageLineItems: [
          {
            weight: {
              units: 'KG',
              value: weight
            }
          }
        ]
      }
    };

    const response = await this.makeRequest('ship/v1/shipments', 'POST', requestData);
    const completedShipment = response.output?.transactionShipments?.[0]?.completedShipmentDetail;

    return {
      waybillNumber: completedShipment?.masterTrackingNumber || '',
      orderId: completedShipment?.masterTrackingNumber || '',
      trackingNumber: completedShipment?.completedPackageDetails?.[0]?.trackingIds?.[0]?.trackingNumber,
      trackingUrl: `https://www.fedex.com/fedextrack/?tracknumbers=${completedShipment?.completedPackageDetails?.[0]?.trackingIds?.[0]?.trackingNumber}`,
      labelData: completedShipment?.completedPackageDetails?.[0]?.label?.encodedLabel,
      qrCode: completedShipment?.completedPackageDetails?.[0]?.trackingIds?.[0]?.trackingNumber
    };
  }

  /**
   * Track shipment
   */
  async trackShipment(waybillNumber: string): Promise<TrackingInfo> {
    const response = await this.makeRequest('track/v1/trackingnumbers', 'POST', {
      includeDetailedScans: true,
      trackingInfo: [
        {
          trackingNumberInfo: {
            trackingNumber: waybillNumber
          }
        }
      ]
    });

    const trackingOutput = response.output?.completeTrackResults?.[0]?.trackResults?.[0];
    
    const events = (trackingOutput?.scanEvents || []).map((event: any) => ({
      timestamp: new Date(event.date),
      status: this.mapStatusToEnum(event.eventType),
      location: `${event.scanLocation?.city || ''}, ${event.scanLocation?.stateOrProvinceCode || ''}`,
      description: event.eventDescription,
      coordinates: event.scanLocation ? {
        latitude: parseFloat(event.scanLocation.latitude || '0'),
        longitude: parseFloat(event.scanLocation.longitude || '0')
      } : undefined
    }));

    return {
      waybillNumber,
      currentStatus: events.length > 0 ? events[0].status : TrackingStatus.ORDER_CREATED,
      events,
      estimatedDelivery: trackingOutput?.estimatedDeliveryTimeWindow?.window?.begins ? 
        new Date(trackingOutput.estimatedDeliveryTimeWindow.window.begins) : undefined,
      currentLocation: events.length > 0 ? events[0].location : undefined
    };
  }

  /**
   * Cancel order
   */
  async cancelOrder(waybillNumber: string, reason?: string): Promise<CancelResult> {
    try {
      const response = await this.makeRequest('ship/v1/shipments/cancel', 'PUT', {
        accountNumber: {
          value: this.config.customerId
        },
        trackingNumber: waybillNumber,
        deletionControl: 'DELETE_ALL_PACKAGES'
      });

      return {
        success: response.output?.cancelledShipment !== undefined,
        reason: response.output?.alerts?.[0]?.message
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
    
    const response = await this.makeRequest('rate/v1/rates/quotes', 'POST', {
      accountNumber: {
        value: this.config.customerId
      },
      requestedShipment: {
        shipper: {
          address: {
            city: shipment.sender.address.city,
            stateOrProvinceCode: shipment.sender.address.province,
            postalCode: shipment.sender.address.postalCode,
            countryCode: shipment.sender.address.country
          }
        },
        recipient: {
          address: {
            city: shipment.recipient.address.city,
            stateOrProvinceCode: shipment.recipient.address.province,
            postalCode: shipment.recipient.address.postalCode,
            countryCode: shipment.recipient.address.country
          }
        },
        serviceType: this.getServiceType(shipment.deliveryRequirement),
        requestedPackageLineItems: [
          {
            weight: {
              units: 'KG',
              value: weight
            }
          }
        ]
      }
    });

    const rateQuote = response.output?.rateReplyDetails?.[0];
    
    return {
      amount: parseFloat(rateQuote?.ratedShipmentDetails?.[0]?.totalNetCharge || '0'),
      currency: rateQuote?.ratedShipmentDetails?.[0]?.currency || 'USD',
      estimatedDays: rateQuote?.commit?.transitDays ? parseInt(rateQuote.commit.transitDays) : 3
    };
  }

  /**
   * Make authenticated API request to FedEx
   */
  protected async makeRequest(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<any> {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}/${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-locale': 'en_US'
        },
        timeout: this.config.timeout || 30000
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`FedEx API Error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  /**
   * Generate signature (not used for FedEx OAuth)
   */
  protected generateSignature(data: any): string {
    return '';
  }

  /**
   * Get OAuth access token (with caching)
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    // Fetch new token
    const response = await axios({
      method: 'POST',
      url: `${this.baseUrl}/oauth/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.apiKey,
        client_secret: this.config.apiSecret
      })
    });

    // Cache token (expires in seconds, convert to ms and subtract 5 min buffer)
    this.accessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;

    return this.accessToken;
  }

  /**
   * Helper methods
   */

  private getServiceType(requirement?: string): string {
    const services: Record<string, string> = {
      'EXPRESS': 'FEDEX_2_DAY',
      'STANDARD': 'FEDEX_GROUND',
      'ECONOMY': 'GROUND_HOME_DELIVERY'
    };
    return services[requirement || 'STANDARD'] || 'FEDEX_GROUND';
  }

  private getPaymentType(method: string): string {
    const types: Record<string, string> = {
      'SENDER_PAY': 'SENDER',
      'RECIPIENT_PAY': 'RECIPIENT',
      'THIRD_PARTY': 'THIRD_PARTY'
    };
    return types[method] || 'SENDER';
  }

  private checkProhibitedItems(items: any[]): string[] {
    const prohibited = [
      'explosive', 'flammable', 'corrosive', 'toxic', 
      'radioactive', 'weapon', 'ammunition', 'live animal',
      'hazardous', 'dangerous goods'
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

  private mapStatusToEnum(eventType: string): TrackingStatus {
    const mapping: Record<string, TrackingStatus> = {
      'PU': TrackingStatus.PICKED_UP,
      'AR': TrackingStatus.ARRIVED_AT_FACILITY,
      'DP': TrackingStatus.IN_TRANSIT,
      'IT': TrackingStatus.IN_TRANSIT,
      'OD': TrackingStatus.OUT_FOR_DELIVERY,
      'DL': TrackingStatus.DELIVERED,
      'DE': TrackingStatus.EXCEPTION,
      'CA': TrackingStatus.CANCELLED
    };

    return mapping[eventType] || TrackingStatus.IN_TRANSIT;
  }
}
