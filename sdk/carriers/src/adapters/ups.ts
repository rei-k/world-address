/**
 * UPS (United Parcel Service) Adapter
 * 
 * API Documentation: https://developer.ups.com/
 */

import axios from 'axios';
import crypto from 'crypto';
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

export class UPSAdapter extends CarrierAdapter {
  private accessToken?: string;
  private tokenExpiresAt?: number;

  protected getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://onlinetools.ups.com/api'
      : 'https://wwwcie.ups.com/api';
  }

  /**
   * Validate address and shipment
   */
  async validateShipment(shipment: Shipment): Promise<ValidationResult> {
    try {
      // Validate destination address
      const addressValidation = await this.makeRequest('addressvalidation/v1/1', 'POST', {
        AddressValidationRequest: {
          Address: {
            City: shipment.recipient.address.city,
            StateProvinceCode: shipment.recipient.address.province,
            PostalCode: shipment.recipient.address.postalCode,
            CountryCode: shipment.recipient.address.country
          }
        }
      });

      // Check service availability
      const weight = shipment.items.reduce((sum, item) => sum + item.weight, 0);
      const rateResponse = await this.makeRequest('rating/v1/Rate', 'POST', {
        RateRequest: {
          Shipment: {
            ShipFrom: {
              Address: {
                City: shipment.sender.address.city,
                StateProvinceCode: shipment.sender.address.province,
                PostalCode: shipment.sender.address.postalCode,
                CountryCode: shipment.sender.address.country
              }
            },
            ShipTo: {
              Address: {
                City: shipment.recipient.address.city,
                StateProvinceCode: shipment.recipient.address.province,
                PostalCode: shipment.recipient.address.postalCode,
                CountryCode: shipment.recipient.address.country
              }
            },
            Package: {
              PackagingType: { Code: '02' }, // Package
              PackageWeight: {
                UnitOfMeasurement: { Code: 'KGS' },
                Weight: weight.toString()
              }
            }
          }
        }
      });

      const prohibitedItems = this.checkProhibitedItems(shipment.items);
      const validAddress = addressValidation.AddressValidationResponse?.Response?.ResponseStatus?.Code === '1';

      return {
        valid: validAddress && prohibitedItems.length === 0,
        deliverable: validAddress,
        prohibitedItems,
        estimatedCost: rateResponse.RateResponse?.RatedShipment?.[0]?.TotalCharges ? {
          amount: parseFloat(rateResponse.RateResponse.RatedShipment[0].TotalCharges.MonetaryValue),
          currency: rateResponse.RateResponse.RatedShipment[0].TotalCharges.CurrencyCode
        } : undefined,
        estimatedDeliveryTime: rateResponse.RateResponse?.RatedShipment?.[0]?.TimeInTransit ? {
          min: parseInt(rateResponse.RateResponse.RatedShipment[0].TimeInTransit.DaysInTransit) * 24,
          max: parseInt(rateResponse.RateResponse.RatedShipment[0].TimeInTransit.DaysInTransit) * 24 + 24
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
   * Create pickup order with UPS
   */
  async createPickupOrder(order: PickupOrder): Promise<OrderResult> {
    const weight = order.shipment.items.reduce((sum, item) => sum + item.weight, 0);
    
    const requestData = {
      ShipmentRequest: {
        Shipment: {
          Shipper: {
            Name: order.shipment.sender.name,
            Phone: {
              Number: order.shipment.sender.phone
            },
            Address: {
              AddressLine: [order.shipment.sender.address.street],
              City: order.shipment.sender.address.city,
              StateProvinceCode: order.shipment.sender.address.province,
              PostalCode: order.shipment.sender.address.postalCode,
              CountryCode: order.shipment.sender.address.country
            }
          },
          ShipTo: {
            Name: order.shipment.recipient.name,
            Phone: {
              Number: order.shipment.recipient.phone
            },
            Address: {
              AddressLine: [order.shipment.recipient.address.street],
              City: order.shipment.recipient.address.city,
              StateProvinceCode: order.shipment.recipient.address.province,
              PostalCode: order.shipment.recipient.address.postalCode,
              CountryCode: order.shipment.recipient.address.country
            }
          },
          PaymentInformation: {
            ShipmentCharge: {
              Type: this.getPaymentType(order.paymentMethod),
              BillShipper: {
                AccountNumber: this.config.customerId
              }
            }
          },
          Service: {
            Code: this.getServiceCode(order.shipment.deliveryRequirement)
          },
          Package: {
            Packaging: {
              Code: '02' // Package
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: 'KGS'
              },
              Weight: weight.toString()
            }
          }
        },
        LabelSpecification: {
          LabelImageFormat: {
            Code: 'ZPL' // Zebra Programming Language
          }
        }
      }
    };

    const response = await this.makeRequest('shipments/v1/ship', 'POST', requestData);
    const shipmentResults = response.ShipmentResponse?.ShipmentResults;

    return {
      waybillNumber: shipmentResults.ShipmentIdentificationNumber,
      orderId: shipmentResults.ShipmentIdentificationNumber,
      trackingNumber: shipmentResults.PackageResults?.[0]?.TrackingNumber,
      trackingUrl: `https://www.ups.com/track?tracknum=${shipmentResults.PackageResults?.[0]?.TrackingNumber}`,
      labelUrl: shipmentResults.PackageResults?.[0]?.ShippingLabel?.GraphicImage,
      qrCode: shipmentResults.PackageResults?.[0]?.TrackingNumber
    };
  }

  /**
   * Track shipment
   */
  async trackShipment(waybillNumber: string): Promise<TrackingInfo> {
    const response = await this.makeRequest(`track/v1/details/${waybillNumber}`, 'GET');

    const trackResponse = response.trackResponse;
    const shipment = trackResponse?.shipment?.[0];
    
    const events = (shipment?.package?.[0]?.activity || []).map((activity: any) => ({
      timestamp: new Date(`${activity.date} ${activity.time}`),
      status: this.mapStatusToEnum(activity.status?.code),
      location: activity.location?.address?.city,
      description: activity.status?.description,
      coordinates: activity.location?.address ? {
        latitude: parseFloat(activity.location.address.latitude || '0'),
        longitude: parseFloat(activity.location.address.longitude || '0')
      } : undefined
    }));

    return {
      waybillNumber,
      currentStatus: events.length > 0 ? events[0].status : TrackingStatus.ORDER_CREATED,
      events,
      estimatedDelivery: shipment?.deliveryDate?.[0] ? new Date(shipment.deliveryDate[0].date) : undefined,
      currentLocation: events.length > 0 ? events[0].location : undefined
    };
  }

  /**
   * Cancel order
   */
  async cancelOrder(waybillNumber: string, reason?: string): Promise<CancelResult> {
    try {
      const response = await this.makeRequest(`shipments/v1/void/cancel/${waybillNumber}`, 'DELETE');

      return {
        success: response.VoidShipmentResponse?.Response?.ResponseStatus?.Code === '1',
        reason: response.VoidShipmentResponse?.Response?.ResponseStatus?.Description
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
    
    const response = await this.makeRequest('rating/v1/Rate', 'POST', {
      RateRequest: {
        Shipment: {
          ShipFrom: {
            Address: {
              City: shipment.sender.address.city,
              StateProvinceCode: shipment.sender.address.province,
              PostalCode: shipment.sender.address.postalCode,
              CountryCode: shipment.sender.address.country
            }
          },
          ShipTo: {
            Address: {
              City: shipment.recipient.address.city,
              StateProvinceCode: shipment.recipient.address.province,
              PostalCode: shipment.recipient.address.postalCode,
              CountryCode: shipment.recipient.address.country
            }
          },
          Service: {
            Code: this.getServiceCode(shipment.deliveryRequirement)
          },
          Package: {
            PackagingType: { Code: '02' },
            PackageWeight: {
              UnitOfMeasurement: { Code: 'KGS' },
              Weight: weight.toString()
            }
          }
        }
      }
    });

    const ratedShipment = response.RateResponse?.RatedShipment?.[0];
    
    return {
      amount: parseFloat(ratedShipment?.TotalCharges?.MonetaryValue || '0'),
      currency: ratedShipment?.TotalCharges?.CurrencyCode || 'USD',
      estimatedDays: parseInt(ratedShipment?.TimeInTransit?.DaysInTransit || '3')
    };
  }

  /**
   * Make authenticated API request to UPS
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
          'transId': this.generateTransactionId(),
          'transactionSrc': 'VeyLogistics'
        },
        timeout: this.config.timeout || 30000
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`UPS API Error: ${error.response?.data?.response?.errors?.[0]?.message || error.message}`);
    }
  }

  /**
   * Generate OAuth signature for UPS
   */
  protected generateSignature(data: any): string {
    // UPS uses OAuth 2.0, signature not needed for requests
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
    const auth = Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64');
    
    const response = await axios({
      method: 'POST',
      url: `${this.baseUrl}/security/v1/oauth/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      data: 'grant_type=client_credentials'
    });

    // Cache token (expires in seconds, convert to ms and subtract 5 min buffer)
    this.accessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;

    return this.accessToken;
  }

  /**
   * Helper methods
   */

  private getServiceCode(requirement?: string): string {
    const services: Record<string, string> = {
      'EXPRESS': '01',     // Next Day Air
      'STANDARD': '03',    // Ground
      'ECONOMY': '13'      // Next Day Air Saver
    };
    return services[requirement || 'STANDARD'] || '03';
  }

  private getPaymentType(method: string): string {
    const types: Record<string, string> = {
      'SENDER_PAY': '01',
      'RECIPIENT_PAY': '02',
      'THIRD_PARTY': '03'
    };
    return types[method] || '01';
  }

  private checkProhibitedItems(items: any[]): string[] {
    const prohibited = [
      'explosive', 'flammable', 'corrosive', 'toxic', 
      'radioactive', 'weapon', 'ammunition', 'live animal'
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

  private mapStatusToEnum(statusCode: string): TrackingStatus {
    const mapping: Record<string, TrackingStatus> = {
      'P': TrackingStatus.PICKUP_SCHEDULED,
      'M': TrackingStatus.PICKED_UP,
      'I': TrackingStatus.IN_TRANSIT,
      'X': TrackingStatus.EXCEPTION,
      'D': TrackingStatus.DELIVERED,
      'V': TrackingStatus.CANCELLED
    };

    return mapping[statusCode] || TrackingStatus.IN_TRANSIT;
  }

  private generateTransactionId(): string {
    return `VEY${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }
}
