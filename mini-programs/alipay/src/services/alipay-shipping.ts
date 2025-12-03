/**
 * Alipay Shipping Service
 * Alipay-specific implementation of shipping service
 */

import { ShippingService, ApiResponse } from '@vey/mini-common';

export class AlipayShippingService extends ShippingService {
  /**
   * Alipay-specific HTTP request implementation
   */
  protected async request<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      my.request({
        url,
        method: method as any,
        data,
        headers: {
          'content-type': 'application/json',
        },
        success: (res: any) => {
          resolve({
            success: res.status === 200,
            data: res.data as T,
            error: res.status !== 200 ? {
              code: `HTTP_${res.status}`,
              message: res.data?.message || '请求失败',
            } : undefined,
          });
        },
        fail: (err: any) => {
          resolve({
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: err.errorMessage || '网络错误',
            },
          });
        },
      });
    });
  }
  
  /**
   * Alipay-specific: Show error with native modal
   */
  async validateShipment(data: any) {
    const result = await super.validateShipment(data);
    
    if (!result.valid) {
      my.alert({
        title: '配送不可',
        content: result.reason || '配送できません',
      });
    }
    
    return result;
  }
  
  /**
   * Alipay-specific: Show success toast
   */
  async createPickup(data: any) {
    my.showLoading({ content: '集荷依頼中...' });
    
    try {
      const order = await super.createPickup(data);
      
      my.hideLoading();
      my.showToast({
        content: '集荷依頼完了',
        type: 'success',
        duration: 2000,
      });
      
      return order;
    } catch (error: any) {
      my.hideLoading();
      my.alert({
        title: 'エラー',
        content: error.message || '集荷依頼に失敗しました',
      });
      throw error;
    }
  }
  
  /**
   * Alipay-specific: Open mini-program scanner for tracking
   */
  async scanAndTrack(): Promise<any> {
    return new Promise((resolve, reject) => {
      my.scan({
        type: 'qr',
        success: async (res: any) => {
          try {
            const waybillNumber = this.extractWaybillNumber(res.code);
            const tracking = await this.trackShipment(waybillNumber);
            resolve(tracking);
          } catch (error) {
            reject(error);
          }
        },
        fail: () => {
          reject(new Error('スキャンに失敗しました'));
        },
      });
    });
  }
  
  /**
   * Extract waybill number from QR code
   */
  private extractWaybillNumber(qrData: string): string {
    try {
      const data = JSON.parse(qrData);
      return data.waybillNumber || qrData;
    } catch {
      return qrData;
    }
  }
  
  /**
   * Alipay-specific: Check Sesame Credit score for premium features
   */
  async checkSesameCredit(): Promise<number | null> {
    // In production, integrate with Alipay's Sesame Credit API
    return new Promise((resolve) => {
      my.showToast({
        content: '芝麻信用は現在サポートされていません',
        type: 'none',
      });
      resolve(null);
    });
  }
}
