/**
 * Shipping Service
 * Common shipping operations
 */

import {
  ShippingFormData,
  ValidationResult,
  ShippingOrder,
  TrackingInfo,
  ApiResponse,
} from '../types';

/**
 * Abstract base class for shipping service
 * Platform-specific implementations should extend this
 */
export abstract class ShippingService {
  protected apiBaseUrl: string;
  
  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }
  
  /**
   * Platform-specific HTTP request method
   * Must be implemented by subclasses
   */
  protected abstract request<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any
  ): Promise<ApiResponse<T>>;
  
  /**
   * Validate shipment before creation
   */
  async validateShipment(data: ShippingFormData): Promise<ValidationResult> {
    try {
      const response = await this.request<ValidationResult>(
        `${this.apiBaseUrl}/shipping/validate`,
        'POST',
        data
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return {
          valid: false,
          reason: response.error?.message || '検証に失敗しました',
        };
      }
    } catch (error: any) {
      return {
        valid: false,
        reason: error.message || '検証エラー',
      };
    }
  }
  
  /**
   * Create pickup order
   */
  async createPickup(data: ShippingFormData): Promise<ShippingOrder> {
    const response = await this.request<ShippingOrder>(
      `${this.apiBaseUrl}/shipping/create`,
      'POST',
      data
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '集荷依頼の作成に失敗しました');
    }
    
    return response.data;
  }
  
  /**
   * Track shipment
   */
  async trackShipment(waybillNumber: string): Promise<TrackingInfo> {
    const response = await this.request<TrackingInfo>(
      `${this.apiBaseUrl}/shipping/track`,
      'GET',
      { waybillNumber }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '追跡情報の取得に失敗しました');
    }
    
    return response.data;
  }
  
  /**
   * Cancel pickup
   */
  async cancelPickup(pickupId: string): Promise<boolean> {
    const response = await this.request<{ success: boolean }>(
      `${this.apiBaseUrl}/shipping/cancel`,
      'POST',
      { pickupId }
    );
    
    return response.success;
  }
  
  /**
   * Get available carriers for address
   */
  async getAvailableCarriers(recipientPID: string): Promise<string[]> {
    const response = await this.request<{ carriers: string[] }>(
      `${this.apiBaseUrl}/shipping/carriers`,
      'GET',
      { recipientPID }
    );
    
    return response.data?.carriers || [];
  }
}
