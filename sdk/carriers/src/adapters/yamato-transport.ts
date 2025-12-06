/**
 * Yamato Transport (ヤマト運輸) Adapter
 * Japan's leading delivery service
 * 
 * API Documentation: https://www.kuronekoyamato.co.jp/ytc/customer/members/en/
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

export class YamatoTransportAdapter extends CarrierAdapter {
  protected getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://api.kuronekoyamato.co.jp/api/v1'
      : 'https://api-sandbox.kuronekoyamato.co.jp/api/v1';
  }

  /**
   * Validate address and shipment
   */
  async validateShipment(shipment: Shipment): Promise<ValidationResult> {
    try {
      // Validate postal code and address
      const addressValidation = await this.makeRequest('address/validate', 'POST', {
        postalCode: shipment.recipient.address.postalCode,
        prefecture: shipment.recipient.address.province,
        city: shipment.recipient.address.city,
        address: shipment.recipient.address.street
      });

      // Get delivery quote
      const weight = shipment.items.reduce((sum, item) => sum + item.weight, 0);
      const sizeCode = this.calculateSizeCode(weight, shipment.items);
      
      const quoteResponse = await this.makeRequest('quote', 'POST', {
        fromPostalCode: shipment.sender.address.postalCode,
        toPostalCode: shipment.recipient.address.postalCode,
        sizeCode,
        serviceType: this.getServiceType(shipment.deliveryRequirement),
        coolDelivery: false,
        cashOnDelivery: false
      });

      const prohibitedItems = this.checkProhibitedItems(shipment.items);
      const addressValid = addressValidation.valid === true;

      return {
        valid: addressValid && prohibitedItems.length === 0,
        deliverable: addressValid,
        prohibitedItems,
        estimatedCost: quoteResponse.fee ? {
          amount: quoteResponse.fee,
          currency: 'JPY'
        } : undefined,
        estimatedDeliveryTime: {
          min: quoteResponse.deliveryDays * 24,
          max: (quoteResponse.deliveryDays + 1) * 24
        },
        warnings: addressValidation.suggestions || []
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
   * Create pickup order with Yamato Transport
   */
  async createPickupOrder(order: PickupOrder): Promise<OrderResult> {
    const weight = order.shipment.items.reduce((sum, item) => sum + item.weight, 0);
    const sizeCode = this.calculateSizeCode(weight, order.shipment.items);
    
    const requestData = {
      customerCode: this.config.customerId,
      shipperInfo: {
        name: order.shipment.sender.name,
        nameKana: this.convertToKana(order.shipment.sender.name),
        phone: order.shipment.sender.phone,
        postalCode: order.shipment.sender.address.postalCode,
        prefecture: order.shipment.sender.address.province,
        city: order.shipment.sender.address.city,
        address1: order.shipment.sender.address.street,
        building: order.shipment.sender.address.building
      },
      recipientInfo: {
        name: order.shipment.recipient.name,
        nameKana: this.convertToKana(order.shipment.recipient.name),
        phone: order.shipment.recipient.phone,
        postalCode: order.shipment.recipient.address.postalCode,
        prefecture: order.shipment.recipient.address.province,
        city: order.shipment.recipient.address.city,
        address1: order.shipment.recipient.address.street,
        building: order.shipment.recipient.address.building
      },
      packageInfo: {
        sizeCode,
        weight,
        quantity: order.shipment.items.reduce((sum, item) => sum + item.quantity, 0),
        description: order.shipment.items.map(i => i.name).join(', '),
        declaredValue: order.shipment.items.reduce((sum, item) => sum + (item.value || 0), 0)
      },
      serviceOptions: {
        serviceType: this.getServiceType(order.shipment.deliveryRequirement),
        timeSpecified: false,
        coolDelivery: this.isCoolDelivery(order.shipment.items),
        cashOnDelivery: order.paymentMethod === 'RECIPIENT_PAY',
        insurance: order.shipment.insurance !== undefined
      },
      pickupRequest: {
        requestedDate: order.pickupTime === 'ASAP' ? new Date() : order.pickupTime,
        remarks: order.shipment.notes
      }
    };

    const response = await this.makeRequest('shipment/create', 'POST', requestData);

    return {
      waybillNumber: response.trackingNumber,
      orderId: response.orderNumber,
      trackingNumber: response.trackingNumber,
      pickupId: response.pickupNumber,
      estimatedPickupTime: new Date(response.estimatedPickupTime),
      estimatedDeliveryTime: new Date(response.estimatedDeliveryTime),
      trackingUrl: `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?number=${response.trackingNumber}`,
      labelUrl: response.labelUrl,
      qrCode: this.generateQRCodeData(response.trackingNumber)
    };
  }

  /**
   * Track shipment
   */
  async trackShipment(waybillNumber: string): Promise<TrackingInfo> {
    const response = await this.makeRequest(`tracking/${waybillNumber}`, 'GET');

    const events = (response.trackingDetails || []).map((detail: any) => ({
      timestamp: new Date(`${detail.date} ${detail.time}`),
      status: this.mapStatusToEnum(detail.statusCode),
      location: `${detail.location.name}`,
      description: detail.description,
      operator: detail.operator
    }));

    return {
      waybillNumber,
      currentStatus: events.length > 0 ? events[0].status : TrackingStatus.ORDER_CREATED,
      events,
      estimatedDelivery: response.estimatedDeliveryDate ? 
        new Date(response.estimatedDeliveryDate) : undefined,
      currentLocation: events.length > 0 ? events[0].location : undefined
    };
  }

  /**
   * Cancel order
   */
  async cancelOrder(waybillNumber: string, reason?: string): Promise<CancelResult> {
    try {
      const response = await this.makeRequest('shipment/cancel', 'POST', {
        trackingNumber: waybillNumber,
        cancelReason: reason || 'お客様都合によるキャンセル',
        customerCode: this.config.customerId
      });

      return {
        success: response.success,
        refund: response.refundAmount ? {
          amount: response.refundAmount,
          currency: 'JPY'
        } : undefined,
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
    const weight = shipment.items.reduce((sum, item) => sum + item.weight, 0);
    const sizeCode = this.calculateSizeCode(weight, shipment.items);
    
    const response = await this.makeRequest('quote', 'POST', {
      fromPostalCode: shipment.sender.address.postalCode,
      toPostalCode: shipment.recipient.address.postalCode,
      sizeCode,
      serviceType: this.getServiceType(shipment.deliveryRequirement),
      coolDelivery: this.isCoolDelivery(shipment.items),
      cashOnDelivery: shipment.paymentMethod === 'RECIPIENT_PAY'
    });

    return {
      amount: response.fee,
      currency: 'JPY',
      estimatedDays: response.deliveryDays || 1
    };
  }

  /**
   * Make authenticated API request to Yamato Transport
   */
  protected async makeRequest(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<any> {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const signature = this.generateSignature({
      method,
      endpoint,
      timestamp,
      nonce,
      data
    });

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}/${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Customer-Code': this.config.customerId,
          'X-Timestamp': timestamp.toString(),
          'X-Nonce': nonce,
          'X-Signature': signature
        },
        timeout: this.config.timeout || 30000
      });

      if (response.data.statusCode !== 200 && response.data.statusCode !== '200') {
        throw new Error(response.data.message || 'API request failed');
      }

      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(`Yamato Transport API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Generate HMAC-SHA256 signature for Yamato Transport API
   */
  protected generateSignature(data: any): string {
    const signString = [
      data.method,
      data.endpoint,
      data.timestamp,
      data.nonce,
      data.data ? JSON.stringify(data.data) : ''
    ].join('|');
    
    return crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(signString, 'utf8')
      .digest('hex');
  }

  /**
   * Helper methods
   */

  private getServiceType(requirement?: string): string {
    const services: Record<string, string> = {
      'EXPRESS': 'takkyu',      // 宅急便
      'STANDARD': 'takkyu',     // 宅急便
      'ECONOMY': 'takkyubin'    // 宅急便コンパクト
    };
    return services[requirement || 'STANDARD'] || 'takkyu';
  }

  private calculateSizeCode(weight: number, items: any[]): string {
    // Yamato size codes based on total dimensions
    // 60cm, 80cm, 100cm, 120cm, 140cm, 160cm
    if (weight <= 2) return '60';
    if (weight <= 5) return '80';
    if (weight <= 10) return '100';
    if (weight <= 15) return '120';
    if (weight <= 20) return '140';
    return '160';
  }

  private isCoolDelivery(items: any[]): boolean {
    const coolKeywords = ['refrigerated', 'frozen', '冷蔵', '冷凍', 'クール'];
    return items.some(item =>
      coolKeywords.some(keyword =>
        item.name.toLowerCase().includes(keyword.toLowerCase()) ||
        item.description?.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  private checkProhibitedItems(items: any[]): string[] {
    const prohibited = [
      '爆発物', '火薬類', '引火性液体', '可燃性物質', '酸化性物質',
      '毒物', '放射性物質', '腐食性物質', '危険物',
      'explosive', 'flammable', 'toxic', 'radioactive', 'corrosive'
    ];

    return items
      .filter(item => 
        prohibited.some(keyword => 
          item.name.includes(keyword) ||
          item.description?.includes(keyword)
        )
      )
      .map(item => item.name);
  }

  private mapStatusToEnum(statusCode: string): TrackingStatus {
    const mapping: Record<string, TrackingStatus> = {
      '10': TrackingStatus.ORDER_CREATED,      // 受付完了
      '20': TrackingStatus.PICKUP_SCHEDULED,   // 集荷予定
      '30': TrackingStatus.PICKED_UP,          // 集荷完了
      '40': TrackingStatus.IN_TRANSIT,         // 輸送中
      '50': TrackingStatus.ARRIVED_AT_FACILITY,// ベース店到着
      '60': TrackingStatus.OUT_FOR_DELIVERY,   // 配達中
      '70': TrackingStatus.DELIVERY_ATTEMPTED, // 不在持ち戻り
      '80': TrackingStatus.DELIVERED,          // 配達完了
      '90': TrackingStatus.EXCEPTION,          // 異常
      '99': TrackingStatus.CANCELLED           // キャンセル
    };

    return mapping[statusCode] || TrackingStatus.IN_TRANSIT;
  }

  private convertToKana(name: string): string {
    // In production, use proper romanization library
    // For now, return original name
    return name;
  }

  private generateQRCodeData(trackingNumber: string): string {
    return JSON.stringify({
      carrier: 'yamato',
      trackingNumber,
      url: `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?number=${trackingNumber}`
    });
  }
}
