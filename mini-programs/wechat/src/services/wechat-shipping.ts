/**
 * WeChat Shipping Service
 * WeChat-specific implementation of shipping service
 */

import { ShippingService, ApiResponse } from '@vey/mini-common';

export class WeChatShippingService extends ShippingService {
  /**
   * WeChat-specific HTTP request implementation
   */
  protected async request<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: method as any,
        data,
        header: {
          'content-type': 'application/json',
        },
        success: (res) => {
          resolve({
            success: res.statusCode === 200,
            data: res.data as T,
            error: res.statusCode !== 200 ? {
              code: `HTTP_${res.statusCode}`,
              message: res.data?.message || '请求失败',
            } : undefined,
          });
        },
        fail: (err) => {
          resolve({
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: err.errMsg || '网络错误',
            },
          });
        },
      });
    });
  }
  
  /**
   * WeChat-specific: Show error with native modal
   */
  async validateShipment(data: any) {
    const result = await super.validateShipment(data);
    
    if (!result.valid) {
      wx.showModal({
        title: '配送不可',
        content: result.reason || '配送できません',
        showCancel: false,
      });
    }
    
    return result;
  }
  
  /**
   * WeChat-specific: Show success toast
   */
  async createPickup(data: any) {
    wx.showLoading({ title: '集荷依頼中...' });
    
    try {
      const order = await super.createPickup(data);
      
      wx.hideLoading();
      wx.showToast({
        title: '集荷依頼完了',
        icon: 'success',
        duration: 2000,
      });
      
      return order;
    } catch (error: any) {
      wx.hideLoading();
      wx.showModal({
        title: 'エラー',
        content: error.message || '集荷依頼に失敗しました',
        showCancel: false,
      });
      throw error;
    }
  }
  
  /**
   * WeChat-specific: Open mini-program scanner for tracking
   */
  async scanAndTrack(): Promise<any> {
    return new Promise((resolve, reject) => {
      wx.scanCode({
        success: async (res) => {
          try {
            const waybillNumber = this.extractWaybillNumber(res.result);
            const tracking = await this.trackShipment(waybillNumber);
            resolve(tracking);
          } catch (error) {
            reject(error);
          }
        },
        fail: (err) => {
          reject(new Error('スキャンに失敗しました'));
        },
      });
    });
  }
  
  /**
   * Extract waybill number from QR code
   */
  private extractWaybillNumber(qrData: string): string {
    // Simple extraction - in production, use proper parsing
    try {
      const data = JSON.parse(qrData);
      return data.waybillNumber || qrData;
    } catch {
      return qrData;
    }
  }
}
