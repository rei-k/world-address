/**
 * Alipay Address Picker Component
 * Component for selecting addresses from cloud address book
 */

import { Address } from '@vey/mini-common';

export interface AddressPickerProps {
  onSelect: (address: Address) => void;
  onCancel?: () => void;
}

/**
 * Address picker component logic
 * Note: Actual Alipay component would be in AXML/ACSS files
 */
export class AddressPickerComponent {
  private addresses: Address[] = [];
  private selectedAddress: Address | null = null;
  
  constructor(private props: AddressPickerProps) {}
  
  /**
   * Load addresses from cloud
   */
  async loadAddresses(): Promise<void> {
    my.showLoading({ content: '読み込み中...' });
    
    try {
      // const service = new AlipayAddressBookService(apiUrl);
      // this.addresses = await service.getAddresses();
      my.hideLoading();
    } catch (error) {
      my.hideLoading();
      my.showToast({
        content: '読み込みに失敗しました',
        type: 'fail',
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
  
  /**
   * Use native Alipay address picker
   */
  async useNativePicker(): Promise<Address | null> {
    return new Promise((resolve) => {
      my.chooseAddress({
        success: (res: any) => {
          const address: Partial<Address> = {
            recipientName: res.fullname,
            phoneNumber: res.mobilePhone,
            province: res.provinceName,
            city: res.cityName,
            district: res.districtName,
            street: res.address,
            countryCode: 'CN',
            pid: '',
          };
          resolve(address as Address);
        },
        fail: () => resolve(null),
      });
    });
  }
}

/**
 * Component template helper (for AXML)
 */
export const AddressPickerTemplate = {
  name: 'address-picker',
  axml: `
    <view class="address-picker">
      <view class="picker-header">
        <text>住所を選択</text>
      </view>
      <scroll-view class="address-list" scroll-y="{{true}}">
        <view 
          a:for="{{addresses}}" 
          a:key="pid"
          class="address-item"
          onTap="onSelectAddress"
          data-address="{{item}}"
        >
          <view class="address-name">{{item.recipientName}}</view>
          <view class="address-detail">{{item.province}} {{item.city}}</view>
        </view>
      </scroll-view>
      <view class="picker-actions">
        <button class="btn-cancel" onTap="onCancel">キャンセル</button>
        <button class="btn-add" onTap="onAddNew">新規追加</button>
        <button class="btn-native" onTap="onUseNative">支付宝住所</button>
      </view>
    </view>
  `,
};
