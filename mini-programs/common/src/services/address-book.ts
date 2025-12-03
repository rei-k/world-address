/**
 * Address Book Service
 * Common address book operations
 */

import { Address, ApiResponse } from '../types';

/**
 * Abstract base class for address book service
 * Platform-specific implementations should extend this
 */
export abstract class AddressBookService {
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
   * Get all addresses from cloud address book
   */
  async getAddresses(): Promise<Address[]> {
    const response = await this.request<{ addresses: Address[] }>(
      `${this.apiBaseUrl}/address-book/list`,
      'GET'
    );
    
    return response.data?.addresses || [];
  }
  
  /**
   * Get address by PID
   */
  async getAddressByPID(pid: string): Promise<Address | null> {
    const response = await this.request<Address>(
      `${this.apiBaseUrl}/address-book/get`,
      'GET',
      { pid }
    );
    
    return response.data || null;
  }
  
  /**
   * Add new address to cloud address book
   */
  async addAddress(address: Omit<Address, 'pid'>): Promise<Address> {
    const response = await this.request<Address>(
      `${this.apiBaseUrl}/address-book/add`,
      'POST',
      address
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '住所の追加に失敗しました');
    }
    
    return response.data;
  }
  
  /**
   * Update existing address
   */
  async updateAddress(pid: string, address: Partial<Address>): Promise<Address> {
    const response = await this.request<Address>(
      `${this.apiBaseUrl}/address-book/update`,
      'PUT',
      { pid, ...address }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '住所の更新に失敗しました');
    }
    
    return response.data;
  }
  
  /**
   * Delete address from cloud address book
   */
  async deleteAddress(pid: string): Promise<boolean> {
    const response = await this.request<{ success: boolean }>(
      `${this.apiBaseUrl}/address-book/delete`,
      'DELETE',
      { pid }
    );
    
    return response.success;
  }
  
  /**
   * Share address with friend
   */
  async shareAddress(pid: string, friendId: string): Promise<boolean> {
    const response = await this.request<{ success: boolean }>(
      `${this.apiBaseUrl}/address-book/share`,
      'POST',
      { pid, friendId }
    );
    
    return response.success;
  }
  
  /**
   * Search addresses
   */
  async searchAddresses(query: string): Promise<Address[]> {
    const response = await this.request<{ addresses: Address[] }>(
      `${this.apiBaseUrl}/address-book/search`,
      'GET',
      { q: query }
    );
    
    return response.data?.addresses || [];
  }
}
