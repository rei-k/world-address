/**
 * SF Express (顺丰速运) Adapter
 * 
 * API Documentation: https://open.sf-express.com/
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

export class SFExpressAdapter extends CarrierAdapter {
  private readonly SERVICE_CODE = 'EX-STANDARD'; // 标准快递

  protected getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://sfapi.sf-express.com/std/service'
      : 'https://sfapi-sbox.sf-express.com/std/service';
  }

  /**
   * Validate address and shipment
   */
  async validateShipment(shipment: Shipment): Promise<ValidationResult> {
    try {
      const response = await this.makeRequest('validateAddress', 'POST', {
        destCode: this.getDestCode(shipment.recipient.address),
        destAddress: this.formatAddress(shipment.recipient.address),
        cargo: shipment.items.map(item => ({
          name: item.name,
          count: item.quantity,
          weight: item.weight
        }))
      });

      const prohibitedItems = this.checkProhibitedItems(shipment.items);

      return {
        valid: response.deliverable && prohibitedItems.length === 0,
        deliverable: response.deliverable,
        prohibitedItems,
        estimatedCost: response.estimatedFee ? {
          amount: response.estimatedFee,
          currency: 'CNY'
        } : undefined,
        reason: !response.deliverable ? response.reason : undefined
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
   * Create pickup order with SF Express
   */
  async createPickupOrder(order: PickupOrder): Promise<OrderResult> {
    const orderId = this.generateOrderId();
    
    const requestData = {
      orderId,
      serviceCode: this.SERVICE_CODE,
      consignee: {
        name: order.shipment.recipient.name,
        mobile: order.shipment.recipient.phone,
        province: order.shipment.recipient.address.province,
        city: order.shipment.recipient.address.city,
        county: order.shipment.recipient.address.district || '',
        address: this.formatAddress(order.shipment.recipient.address)
      },
      sender: {
        name: order.shipment.sender.name,
        mobile: order.shipment.sender.phone,
        province: order.shipment.sender.address.province,
        city: order.shipment.sender.address.city,
        county: order.shipment.sender.address.district || '',
        address: this.formatAddress(order.shipment.sender.address)
      },
      cargo: order.shipment.items.map(item => ({
        name: item.name,
        count: item.quantity,
        weight: item.weight,
        amount: item.value,
        currency: item.currency || 'CNY'
      })),
      expressType: this.getExpressType(order.shipment.deliveryRequirement),
      payMethod: this.getPayMethod(order.paymentMethod),
      remark: order.shipment.notes
    };

    const response = await this.makeRequest('createOrder', 'POST', requestData);

    return {
      waybillNumber: response.waybillNo,
      orderId: response.orderId,
      pickupId: response.orderId,
      trackingUrl: `https://www.sf-express.com/cn/sc/dynamic_function/waybill/#search/bill-number/${response.waybillNo}`,
      qrCode: this.generateQRCodeUrl(response.waybillNo)
    };
  }

  /**
   * Track shipment
   */
  async trackShipment(waybillNumber: string): Promise<TrackingInfo> {
    const response = await this.makeRequest('queryRoute', 'POST', {
      trackingNumber: waybillNumber,
      trackingType: '1' // 1=运单号
    });

    const events = (response.routes || []).map((route: any) => ({
      timestamp: new Date(route.acceptTime),
      status: this.mapStatusToEnum(route.opCode),
      location: route.acceptAddress,
      description: route.remark,
      operator: route.operator
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
      const response = await this.makeRequest('cancelOrder', 'POST', {
        orderId: waybillNumber,
        dealType: 2, // 2=取消订单
        cancelReason: reason || '用户取消'
      });

      return {
        success: response.success,
        reason: response.message
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
    const response = await this.makeRequest('queryFee', 'POST', {
      origCode: this.getDestCode(shipment.sender.address),
      destCode: this.getDestCode(shipment.recipient.address),
      cargo: shipment.items.map(item => ({
        name: item.name,
        count: item.quantity,
        weight: item.weight
      })),
      expressType: this.getExpressType(shipment.deliveryRequirement)
    });

    return {
      amount: response.totalFee,
      currency: 'CNY',
      estimatedDays: response.estimatedDays || 2
    };
  }

  /**
   * Make authenticated API request to SF Express
   */
  protected async makeRequest(
    service: string,
    method: string,
    data?: any
  ): Promise<any> {
    const timestamp = Date.now();
    const requestBody = {
      partnerID: this.config.customerId,
      requestID: this.generateRequestId(),
      serviceCode: service,
      timestamp,
      msgData: JSON.stringify(data)
    };

    const signature = this.generateSignature(requestBody);

    try {
      const response = await axios({
        method,
        url: this.baseUrl,
        data: {
          ...requestBody,
          msgDigest: signature
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout || 30000
      });

      if (response.data.apiResultCode !== 'A1000') {
        throw new Error(response.data.apiErrorMsg || 'API request failed');
      }

      return JSON.parse(response.data.apiResultData);
    } catch (error: any) {
      throw new Error(`SF Express API Error: ${error.message}`);
    }
  }

  /**
   * Generate MD5 signature for SF Express API
   */
  protected generateSignature(data: any): string {
    const signString = `${data.msgData}${this.config.apiSecret}`;
    return crypto.createHash('md5').update(signString, 'utf8').digest('base64');
  }

  /**
   * Helper methods
   */

  private getDestCode(address: any): string {
    // SF Express uses province/city codes
    // This is simplified - real implementation would use lookup tables
    return `${address.province}-${address.city}`;
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

  private getExpressType(requirement?: string): number {
    const types: Record<string, number> = {
      'EXPRESS': 1,    // 顺丰即日
      'STANDARD': 2,   // 顺丰标快
      'ECONOMY': 3     // 顺丰特惠
    };
    return types[requirement || 'STANDARD'] || 2;
  }

  private getPayMethod(method: string): number {
    const methods: Record<string, number> = {
      'SENDER_PAY': 1,
      'RECIPIENT_PAY': 2,
      'THIRD_PARTY': 3
    };
    return methods[method] || 1;
  }

  private checkProhibitedItems(items: any[]): string[] {
    const prohibited = [
      '易燃易爆',
      '腐蚀性物品',
      '毒品',
      '枪支弹药',
      '管制刀具',
      '活体动物'
    ];

    return items
      .filter(item => 
        prohibited.some(keyword => item.name.includes(keyword))
      )
      .map(item => item.name);
  }

  private mapStatusToEnum(opCode: string): TrackingStatus {
    const mapping: Record<string, TrackingStatus> = {
      '10': TrackingStatus.ORDER_CREATED,
      '20': TrackingStatus.PICKED_UP,
      '30': TrackingStatus.IN_TRANSIT,
      '40': TrackingStatus.ARRIVED_AT_FACILITY,
      '50': TrackingStatus.OUT_FOR_DELIVERY,
      '80': TrackingStatus.DELIVERED,
      '99': TrackingStatus.EXCEPTION
    };

    return mapping[opCode] || TrackingStatus.IN_TRANSIT;
  }

  private generateOrderId(): string {
    return `SF${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `REQ${Date.now()}`;
  }

  private generateQRCodeUrl(waybillNumber: string): string {
    return `https://api.sf-express.com/qr/${waybillNumber}`;
  }
}
