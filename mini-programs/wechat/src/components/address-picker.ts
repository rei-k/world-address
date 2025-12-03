/**
 * WeChat Address Picker Component
 * Component for selecting addresses from cloud address book
 */

import { Address } from '@vey/mini-common';

export interface AddressPickerProps {
  onSelect: (address: Address) => void;
  onCancel?: () => void;
}

/**
 * Address picker component logic
 * Note: Actual WeChat component would be in WXML/WXSS files
 */
export class AddressPickerComponent {
  private addresses: Address[] = [];
  private selectedAddress: Address | null = null;
  
  constructor(private props: AddressPickerProps) {}
  
  /**
   * Load addresses from cloud
   */
  async loadAddresses(): Promise<void> {
    // Implementation would use WeChatAddressBookService
    wx.showLoading({ title: '読み込み中...' });
    
    try {
      // const service = new WeChatAddressBookService(apiUrl);
      // this.addresses = await service.getAddresses();
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '読み込みに失敗しました',
        icon: 'error',
      });
    }
  }
  
  /**
   * Handle address selection
   */
  selectAddress(address: Address): void {
    this.selectedAddress = address;
    this.props.onSelect(address);
  }
  
  /**
   * Handle cancel
   */
  cancel(): void {
    this.props.onCancel?.();
  }
}

/**
 * Component template helper (for WXML)
 */
export const AddressPickerTemplate = {
  name: 'address-picker',
  wxml: `
    <view class="address-picker">
      <view class="picker-header">
        <text>住所を選択</text>
      </view>
      <scroll-view class="address-list" scroll-y>
        <view 
          wx:for="{{addresses}}" 
          wx:key="pid"
          class="address-item"
          bindtap="onSelectAddress"
          data-address="{{item}}"
        >
          <view class="address-name">{{item.recipientName}}</view>
          <view class="address-detail">{{item.province}} {{item.city}}</view>
        </view>
      </scroll-view>
      <view class="picker-actions">
        <button class="btn-cancel" bindtap="onCancel">キャンセル</button>
        <button class="btn-add" bindtap="onAddNew">新規追加</button>
      </view>
    </view>
  `,
};
