/**
 * useShipping Hook
 * Manages shipping creation and validation
 */

import { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';

export interface ShippingItem {
  name: string;
  quantity: number;
  weight: number;
  value?: number;
}

export interface ShippingFormData {
  recipientPID: string;
  items: ShippingItem[];
  carrier: 'SF_EXPRESS' | 'JD_LOGISTICS';
  notes?: string;
}

export interface UseShippingResult {
  loading: boolean;
  error: string | null;
  validateShipment: (data: ShippingFormData) => Promise<boolean>;
  createPickup: (data: ShippingFormData) => Promise<{
    waybillNumber: string;
    handshakeToken: string;
  }>;
  trackShipment: (waybillNumber: string) => Promise<any>;
}

export function useShipping(apiBaseUrl: string): UseShippingResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateShipment = useCallback(async (data: ShippingFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await Taro.request({
        url: `${apiBaseUrl}/shipping/validate`,
        method: 'POST',
        data
      });

      if (response.data.deliverable) {
        return true;
      } else {
        setError(response.data.reason || '配送不可');
        Taro.showModal({
          title: '配送不可',
          content: response.data.reason,
          showCancel: false
        });
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      Taro.showToast({
        title: 'エラーが発生しました',
        icon: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const createPickup = useCallback(async (data: ShippingFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await Taro.request({
        url: `${apiBaseUrl}/shipping/create`,
        method: 'POST',
        data
      });

      return {
        waybillNumber: response.data.waybillNumber,
        handshakeToken: response.data.handshakeToken
      };
    } catch (err: any) {
      setError(err.message);
      Taro.showToast({
        title: '集荷依頼に失敗しました',
        icon: 'error'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const trackShipment = useCallback(async (waybillNumber: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await Taro.request({
        url: `${apiBaseUrl}/shipping/track`,
        method: 'GET',
        data: { waybillNumber }
      });

      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  return {
    loading,
    error,
    validateShipment,
    createPickup,
    trackShipment
  };
}
