/**
 * Electronic Waybill API
 * Generate and manage electronic waybills
 */

import { DeliveryOrder, APIResponse, Address } from '../types';

export interface WaybillRequest {
  origin: Address;
  destination: Address;
  packageDetails: {
    weight: number;
    dimensions: { length: number; width: number; height: number };
    contents: string;
    value: number;
  };
  carrierId: string;
  serviceId: string;
}

export interface Waybill {
  waybillNumber: string;
  trackingNumber: string;
  barcode: string;
  qrCode: string;
  pdfUrl: string;
  createdAt: Date;
}

export class WaybillAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Generate a new waybill
   */
  async generateWaybill(request: WaybillRequest): Promise<APIResponse<Waybill>> {
    const response = await fetch(`${this.baseUrl}/waybill/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  /**
   * Get waybill details
   */
  async getWaybill(waybillNumber: string): Promise<APIResponse<Waybill>> {
    const response = await fetch(`${this.baseUrl}/waybill/${waybillNumber}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Download waybill PDF
   */
  async downloadWaybillPDF(waybillNumber: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/waybill/${waybillNumber}/pdf`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
    return response.blob();
  }

  /**
   * Cancel a waybill
   */
  async cancelWaybill(waybillNumber: string): Promise<APIResponse<{ success: boolean }>> {
    const response = await fetch(`${this.baseUrl}/waybill/${waybillNumber}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Bulk generate waybills
   */
  async bulkGenerateWaybills(requests: WaybillRequest[]): Promise<APIResponse<Waybill[]>> {
    const response = await fetch(`${this.baseUrl}/waybill/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });
    return response.json();
  }
}
