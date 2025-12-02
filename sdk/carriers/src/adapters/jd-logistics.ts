/**
 * JD Logistics (京东物流) Adapter
 * 
 * API Documentation: https://open.jdl.com/
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

export class JDLogisticsAdapter extends CarrierAdapter {
  protected getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://api.jdl.com/'
      : 'https://api-test.jdl.com/';
  }

  /**
   * Validate shipment
   */
  async validateShipment(shipment: Shipment): Promise<ValidationResult> {
    try {
      const response = await this.makeRequest('service/checkService', 'POST', {
        senderCity: shipment.sender.address.city,
        receiverCity: shipment.recipient.address.city,
        productType: 'EXPRESS'
      });

      return {
        valid: response.available,
        deliverable: response.available,
        prohibitedItems: [],
        estimatedCost: response.estimatedFee ? {
          amount: response.estimatedFee,
          currency: 'CNY'
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
   * Create pickup order
   */
  async createPickupOrder(order: PickupOrder): Promise<OrderResult> {
    const requestData = {
      customerCode: this.config.customerId,
      sender: {
        name: order.shipment.sender.name,
        mobile: order.shipment.sender.phone,
        provinceId: this.getProvinceId(order.shipment.sender.address.province),
        cityId: this.getCityId(order.shipment.sender.address.city),
        countyId: this.getCountyId(order.shipment.sender.address.district),
        address: this.formatAddress(order.shipment.sender.address)
      },
      receiver: {
        name: order.shipment.recipient.name,
        mobile: order.shipment.recipient.phone,
        provinceId: this.getProvinceId(order.shipment.recipient.address.province),
        cityId: this.getCityId(order.shipment.recipient.address.city),
        countyId: this.getCountyId(order.shipment.recipient.address.district),
        address: this.formatAddress(order.shipment.recipient.address)
      },
      goods: order.shipment.items.map(item => ({
        goodsName: item.name,
        goodsNumber: item.quantity,
        goodsWeight: item.weight
      })),
      payType: this.getPayType(order.paymentMethod),
      remark: order.shipment.notes
    };

    const response = await this.makeRequest('order/create', 'POST', requestData);

    return {
      waybillNumber: response.waybillCode,
      orderId: response.orderId,
      trackingUrl: `https://www.jdl.com/track?waybillCode=${response.waybillCode}`
    };
  }

  /**
   * Track shipment
   */
  async trackShipment(waybillNumber: string): Promise<TrackingInfo> {
    const response = await this.makeRequest('track/query', 'POST', {
      waybillCode: waybillNumber
    });

    const events = (response.tracks || []).map((track: any) => ({
      timestamp: new Date(track.operateTime),
      status: this.mapStatusToEnum(track.statusCode),
      location: track.operateSite,
      description: track.operateDesc
    }));

    return {
      waybillNumber,
      currentStatus: events.length > 0 ? events[0].status : TrackingStatus.ORDER_CREATED,
      events,
      currentLocation: events.length > 0 ? events[0].location : undefined
    };
  }

  /**
   * Cancel order
   */
  async cancelOrder(waybillNumber: string, reason?: string): Promise<CancelResult> {
    try {
      const response = await this.makeRequest('order/cancel', 'POST', {
        waybillCode: waybillNumber,
        cancelReason: reason || '用户取消'
      });

      return {
        success: response.success
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
    const response = await this.makeRequest('price/query', 'POST', {
      senderCity: shipment.sender.address.city,
      receiverCity: shipment.recipient.address.city,
      weight: shipment.items.reduce((sum, item) => sum + item.weight, 0)
    });

    return {
      amount: response.totalPrice,
      currency: 'CNY',
      estimatedDays: response.estimatedDays || 2
    };
  }

  /**
   * Make authenticated API request to JD Logistics
   */
  protected async makeRequest(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<any> {
    const timestamp = Date.now();
    const params = {
      ...data,
      timestamp,
      customerCode: this.config.customerId
    };

    const signature = this.generateSignature(params);

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        data: params,
        headers: {
          'Content-Type': 'application/json',
          'API-Key': this.config.apiKey,
          'Sign': signature
        },
        timeout: this.config.timeout || 30000
      });

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'API request failed');
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(`JD Logistics API Error: ${error.message}`);
    }
  }

  /**
   * Generate signature for JD Logistics API
   */
  protected generateSignature(data: any): string {
    const keys = Object.keys(data).sort();
    const signString = keys
      .map(key => `${key}=${data[key]}`)
      .join('&') + `&key=${this.config.apiSecret}`;
    
    return crypto.createHash('md5').update(signString, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * Helper methods
   */

  private getProvinceId(province: string): string {
    // Simplified - real implementation would use lookup tables
    const provinceMap: Record<string, string> = {
      '北京': '1',
      '上海': '2',
      '广东': '19',
      '浙江': '11'
    };
    return provinceMap[province] || '0';
  }

  private getCityId(city: string): string {
    // Simplified - real implementation would use lookup tables
    return '0';
  }

  private getCountyId(county?: string): string {
    return '0';
  }

  private formatAddress(address: any): string {
    const parts = [
      address.street,
      address.building,
      address.unit,
      address.room
    ].filter(Boolean);
    
    return parts.join('');
  }

  private getPayType(method: string): number {
    const types: Record<string, number> = {
      'SENDER_PAY': 1,
      'RECIPIENT_PAY': 2,
      'THIRD_PARTY': 3
    };
    return types[method] || 1;
  }

  private mapStatusToEnum(statusCode: string): TrackingStatus {
    const mapping: Record<string, TrackingStatus> = {
      '10': TrackingStatus.ORDER_CREATED,
      '20': TrackingStatus.PICKED_UP,
      '30': TrackingStatus.IN_TRANSIT,
      '40': TrackingStatus.OUT_FOR_DELIVERY,
      '50': TrackingStatus.DELIVERED,
      '99': TrackingStatus.EXCEPTION
    };

    return mapping[statusCode] || TrackingStatus.IN_TRANSIT;
  }
}
