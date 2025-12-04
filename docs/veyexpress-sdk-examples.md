# VeyExpress SDK コード例

VeyExpressプラットフォームの各種SDK実装例とベストプラクティス。

---

## 目次

1. [基本的なセットアップ](#基本的なセットアップ)
2. [Shopify統合](#shopify統合)
3. [WooCommerce統合](#woocommerce統合)
4. [Magento統合](#magento統合)
5. [中国ミニアプリ統合](#中国ミニアプリ統合)
6. [React/Vue コンポーネント](#reactvue-コンポーネント)
7. [Webhook実装](#webhook実装)
8. [ZKPプライバシー統合](#zkpプライバシー統合)

---

## 基本的なセットアップ

### インストール

```bash
# npm
npm install @vey/express-sdk

# yarn
yarn add @vey/express-sdk

# pnpm
pnpm add @vey/express-sdk
```

### 初期化

```typescript
import VeyExpress from '@vey/express-sdk';

// 基本的な初期化
const veyexpress = VeyExpress.init({
  apiKey: process.env.VEYEXPRESS_API_KEY,
  environment: 'production', // or 'sandbox'
  defaultCountry: 'JP',
  enableZKP: true,
  enableAnalytics: true
});

// 設定確認
console.log(veyexpress.config);
```

---

## Shopify統合

### Shopify App設定

```typescript
// shopify-app/pages/api/veyexpress-setup.ts
import { VeyExpressShopify } from '@vey/express-shopify';

export default async function handler(req, res) {
  const { shop, accessToken } = req.query;

  const integration = await VeyExpressShopify.setup({
    shop,
    accessToken,
    veyexpressApiKey: process.env.VEYEXPRESS_API_KEY,
    
    // 配送設定
    shippingSettings: {
      enableGlobalShipping: true,
      supportedCountries: 'ALL', // 254カ国すべて
      autoCarrierSelection: true,
      zkpPrivacy: true
    },

    // Webhook設定
    webhooks: {
      endpoint: `https://${shop}/api/veyexpress/webhooks`,
      events: [
        'shipment.created',
        'shipment.picked_up',
        'shipment.delivered',
        'shipment.exception'
      ]
    }
  });

  res.json({
    success: true,
    integrationId: integration.id,
    message: 'VeyExpress統合が完了しました'
  });
}
```

### チェックアウトページカスタマイズ

```liquid
<!-- Shopify theme: checkout.liquid -->
<script src="https://cdn.veyexpress.com/sdk/v1/veyexpress.min.js"></script>

<div id="veyexpress-shipping"></div>

<script>
  const veyexpress = VeyExpress.init({
    apiKey: '{{ shop.metafields.veyexpress.api_key }}',
    autoDetect: true
  });

  // 住所フォームをレンダリング
  veyexpress.renderAddressForm('#shipping-address', {
    countries: {{ shop.metafields.veyexpress.countries | json }},
    defaultCountry: '{{ customer.default_address.country_code }}',
    enableAutocomplete: true,
    language: '{{ shop.locale }}',
    
    onAddressSelected: (address) => {
      console.log('選択された住所:', address);
      // Shopifyの住所フィールドに自動入力
      document.getElementById('checkout_shipping_address_address1').value = address.street;
      document.getElementById('checkout_shipping_address_city').value = address.city;
      // ... 他のフィールドも同様
    }
  });

  // 配送オプションをレンダリング
  veyexpress.renderShippingOptions('#veyexpress-shipping', {
    cartItems: {{ cart | json }},
    destination: customerAddress,
    showPrices: true,
    showEstimatedDays: true,
    enableCarrierComparison: true,
    recommendInsurance: true,
    
    onShippingSelected: (option) => {
      console.log('選択された配送:', option);
      // Shopifyの配送料を更新
      updateShippingRate(option.price);
    }
  });
</script>
```

### 注文作成時のWebhook

```typescript
// shopify-app/pages/api/webhooks/orders-create.ts
import { VeyExpressShopify } from '@vey/express-shopify';

export default async function handler(req, res) {
  const order = req.body;

  // VeyExpressで送り状を作成
  const shipment = await VeyExpressShopify.createShipment({
    orderId: order.id,
    orderNumber: order.order_number,
    
    sender: {
      // ストア情報
      name: order.shipping_address.company || order.shop_name,
      address: storeAddress
    },
    
    recipient: {
      // 顧客住所（ZKPの場合はPIDのみ）
      pid: order.shipping_address.veyexpress_pid,
      // または通常の住所
      name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
      phone: order.shipping_address.phone,
      address: {
        country: order.shipping_address.country_code,
        province: order.shipping_address.province,
        city: order.shipping_address.city,
        address1: order.shipping_address.address1,
        address2: order.shipping_address.address2,
        zip: order.shipping_address.zip
      }
    },
    
    items: order.line_items.map(item => ({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      weight: item.grams / 1000, // グラムをキログラムに
      value: item.price,
      currency: order.currency
    })),
    
    carrier: order.shipping_lines[0].veyexpress_carrier || 'AUTO',
    serviceType: order.shipping_lines[0].code
  });

  // Shopifyの注文にトラッキング情報を追加
  await shopify.fulfillment.create({
    order_id: order.id,
    tracking_number: shipment.trackingNumber,
    tracking_company: shipment.carrier,
    tracking_url: shipment.trackingUrl
  });

  res.json({ success: true, shipment });
}
```

---

## WooCommerce統合

### WordPress プラグイン

```php
<?php
/**
 * Plugin Name: VeyExpress for WooCommerce
 * Description: Global shipping with VeyExpress
 * Version: 1.0.0
 */

// VeyExpress設定ページ
add_action('admin_menu', function() {
    add_menu_page(
        'VeyExpress Settings',
        'VeyExpress',
        'manage_options',
        'veyexpress-settings',
        'veyexpress_settings_page'
    );
});

function veyexpress_settings_page() {
    ?>
    <div class="wrap">
        <h1>VeyExpress Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('veyexpress_options');
            do_settings_sections('veyexpress-settings');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

// チェックアウトページに住所フォームを追加
add_action('woocommerce_after_checkout_billing_form', function($checkout) {
    ?>
    <div id="veyexpress-address-form"></div>
    <script>
        jQuery(document).ready(function($) {
            const veyexpress = VeyExpress.init({
                apiKey: '<?php echo get_option('veyexpress_api_key'); ?>',
                autoDetect: true
            });

            veyexpress.renderAddressForm('#veyexpress-address-form', {
                countries: <?php echo json_encode(WC()->countries->get_shipping_countries()); ?>,
                onAddressSelected: function(address) {
                    // WooCommerceのフィールドに自動入力
                    $('#billing_address_1').val(address.street);
                    $('#billing_city').val(address.city);
                    $('#billing_state').val(address.province);
                    $('#billing_postcode').val(address.postalCode);
                }
            });
        });
    </script>
    <?php
});

// 注文作成時に送り状を生成
add_action('woocommerce_checkout_order_processed', function($order_id) {
    $order = wc_get_order($order_id);
    
    $veyexpress_client = new VeyExpressClient(get_option('veyexpress_api_key'));
    
    $shipment = $veyexpress_client->createShipment([
        'orderId' => $order_id,
        'sender' => [
            'name' => get_bloginfo('name'),
            'address' => get_option('veyexpress_sender_address')
        ],
        'recipient' => [
            'name' => $order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name(),
            'phone' => $order->get_billing_phone(),
            'address' => [
                'country' => $order->get_shipping_country(),
                'state' => $order->get_shipping_state(),
                'city' => $order->get_shipping_city(),
                'address1' => $order->get_shipping_address_1(),
                'address2' => $order->get_shipping_address_2(),
                'postcode' => $order->get_shipping_postcode()
            ]
        ],
        'items' => array_map(function($item) {
            $product = $item->get_product();
            return [
                'name' => $item->get_name(),
                'sku' => $product->get_sku(),
                'quantity' => $item->get_quantity(),
                'weight' => $product->get_weight(),
                'value' => $item->get_total(),
                'currency' => $order->get_currency()
            ];
        }, $order->get_items())
    ]);
    
    // トラッキング情報を保存
    $order->update_meta_data('_veyexpress_tracking_number', $shipment['trackingNumber']);
    $order->update_meta_data('_veyexpress_carrier', $shipment['carrier']);
    $order->save();
    
    // 顧客に追跡URLを送信
    $order->add_order_note(
        sprintf('VeyExpress追跡番号: %s - <a href="%s" target="_blank">追跡</a>',
            $shipment['trackingNumber'],
            $shipment['trackingUrl']
        )
    );
});
```

---

## Magento統合

### Magento 2 モジュール

```php
<?php
// app/code/VeyExpress/Shipping/etc/module.xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Module/etc/module.xsd">
    <module name="VeyExpress_Shipping" setup_version="1.0.0">
        <sequence>
            <module name="Magento_Shipping"/>
        </sequence>
    </module>
</config>

// app/code/VeyExpress/Shipping/Model/Carrier.php
<?php
namespace VeyExpress\Shipping\Model;

use Magento\Quote\Model\Quote\Address\RateRequest;
use Magento\Shipping\Model\Carrier\AbstractCarrier;
use Magento\Shipping\Model\Carrier\CarrierInterface;

class Carrier extends AbstractCarrier implements CarrierInterface
{
    protected $_code = 'veyexpress';
    
    public function collectRates(RateRequest $request)
    {
        $result = $this->_rateResultFactory->create();
        
        // VeyExpress APIで配送料を取得
        $veyexpressClient = new \VeyExpress\Client($this->getConfigData('api_key'));
        
        $quote = $veyexpressClient->getQuote([
            'from' => $this->getStoreAddress(),
            'to' => [
                'country' => $request->getDestCountryId(),
                'region' => $request->getDestRegionCode(),
                'city' => $request->getDestCity(),
                'postcode' => $request->getDestPostcode()
            ],
            'items' => $this->getItemsFromRequest($request)
        ]);
        
        // 複数の配送オプションを返す
        foreach ($quote['options'] as $option) {
            $method = $this->_rateMethodFactory->create();
            $method->setCarrier($this->_code);
            $method->setCarrierTitle('VeyExpress');
            $method->setMethod($option['id']);
            $method->setMethodTitle($option['name'] . ' (' . $option['estimatedDays'] . ' days)');
            $method->setPrice($option['price']);
            $method->setCost($option['cost']);
            
            $result->append($method);
        }
        
        return $result;
    }
    
    public function getAllowedMethods()
    {
        return [
            'express' => 'Express Delivery',
            'standard' => 'Standard Delivery',
            'economy' => 'Economy Delivery'
        ];
    }
}
```

### フロントエンド統合

```javascript
// view/frontend/web/js/view/shipping-address.js
define([
    'ko',
    'Magento_Checkout/js/view/shipping-address',
    'VeyExpress_Shipping/js/veyexpress-sdk'
], function (ko, Component, VeyExpress) {
    'use strict';

    return Component.extend({
        initialize: function () {
            this._super();
            this.initVeyExpress();
        },

        initVeyExpress: function () {
            const veyexpress = VeyExpress.init({
                apiKey: window.veyexpressConfig.apiKey,
                autoDetect: true
            });

            veyexpress.renderAddressForm('#veyexpress-address', {
                countries: window.veyexpressConfig.countries,
                onAddressSelected: (address) => {
                    // Magentoの住所フォームに入力
                    this.updateMagentoAddress(address);
                }
            });
        },

        updateMagentoAddress: function (address) {
            this.source.set('shippingAddress.street.0', address.street);
            this.source.set('shippingAddress.city', address.city);
            this.source.set('shippingAddress.region', address.province);
            this.source.set('shippingAddress.postcode', address.postalCode);
            this.source.set('shippingAddress.countryId', address.country);
        }
    });
});
```

---

## 中国ミニアプリ統合

### Alipay Mini Program

```javascript
// mini-program/pages/address/address.js
import VeyExpress from '@vey/express-alipay';

Page({
  data: {
    addresses: [],
    nearbyStations: []
  },

  onLoad() {
    this.veyexpress = VeyExpress.init({
      apiKey: 'your-api-key',
      platform: 'ALIPAY',
      enableCainiaoStation: true
    });

    this.loadAddresses();
    this.loadNearbyStations();
  },

  // 住所リストを読み込み
  async loadAddresses() {
    const userId = my.getStorageSync({ key: 'userId' }).data;
    const addresses = await this.veyexpress.getAddresses(userId);
    this.setData({ addresses });
  },

  // 近くの菜鸟驿站を検索
  async loadNearbyStations() {
    my.getLocation({
      success: async (res) => {
        const stations = await this.veyexpress.findNearbyPickupLocations({
          latitude: res.latitude,
          longitude: res.longitude,
          radius: 2000, // 2km以内
          types: ['CAINIAO_STATION', 'CONVENIENCE_STORE']
        });
        this.setData({ nearbyStations: stations });
      }
    });
  },

  // 新しい住所を追加
  async addAddress() {
    my.chooseAddress({
      success: async (res) => {
        const normalized = await this.veyexpress.normalizeAddress({
          name: res.fullName,
          phone: res.telNumber,
          address: {
            province: res.provinceName,
            city: res.cityName,
            district: res.countyName,
            street: res.detailInfo
          }
        });

        await this.veyexpress.saveAddress(userId, normalized);
        this.loadAddresses();
        
        my.showToast({
          content: '住所を保存しました',
          type: 'success'
        });
      }
    });
  },

  // 受取地点を選択
  async selectPickupLocation(e) {
    const stationId = e.currentTarget.dataset.id;
    const orderId = this.data.orderId;

    await this.veyexpress.setPickupLocation({
      orderId,
      locationType: 'CAINIAO_STATION',
      locationId: stationId
    });

    my.navigateBack();
  }
});
```

```xml
<!-- mini-program/pages/address/address.axml -->
<view class="container">
  <view class="section">
    <text class="section-title">我的地址</text>
    <view class="address-list">
      <view class="address-item" a:for="{{addresses}}" a:key="id" onTap="selectAddress" data-id="{{item.id}}">
        <view class="address-name">{{item.name}}</view>
        <view class="address-phone">{{item.phone}}</view>
        <view class="address-detail">{{item.formatted}}</view>
      </view>
    </view>
    <button onTap="addAddress" class="add-button">添加新地址</button>
  </view>

  <view class="section">
    <text class="section-title">附近的菜鸟驿站</text>
    <view class="station-list">
      <view class="station-item" a:for="{{nearbyStations}}" a:key="id" onTap="selectPickupLocation" data-id="{{item.id}}">
        <view class="station-name">{{item.name}}</view>
        <view class="station-distance">距离 {{item.distance}}米</view>
        <view class="station-hours">营业时间: {{item.businessHours}}</view>
      </view>
    </view>
  </view>
</view>
```

### WeChat Mini Program

```javascript
// miniprogram/pages/shipping/shipping.js
import VeyExpress from '@vey/express-wechat';

Page({
  data: {
    shippingOptions: [],
    selectedOption: null,
    deliverySlots: []
  },

  onLoad(options) {
    this.orderId = options.orderId;
    
    this.veyexpress = VeyExpress.init({
      apiKey: 'your-api-key',
      platform: 'WECHAT',
      enableJDLocker: true,
      enableWeChatPay: true
    });

    this.loadShippingOptions();
  },

  // 配送オプションを読み込み
  async loadShippingOptions() {
    wx.showLoading({ title: '加载中...' });

    const options = await this.veyexpress.getShippingOptions({
      orderId: this.orderId,
      includeInsurance: true,
      includeTracking: true
    });

    this.setData({ shippingOptions: options });
    wx.hideLoading();
  },

  // 配送オプションを選択
  async selectShippingOption(e) {
    const optionId = e.currentTarget.dataset.id;
    const option = this.data.shippingOptions.find(o => o.id === optionId);

    this.setData({ selectedOption: option });

    // 配送スロットを取得
    const slots = await this.veyexpress.getDeliverySlots({
      orderId: this.orderId,
      carrier: option.carrier,
      date: new Date()
    });

    this.setData({ deliverySlots: slots });
  },

  // 配送スロットを選択
  async selectDeliverySlot(e) {
    const slotId = e.currentTarget.dataset.id;

    await this.veyexpress.confirmShipping({
      orderId: this.orderId,
      shippingOption: this.data.selectedOption.id,
      deliverySlot: slotId
    });

    wx.showToast({
      title: '配送方式已确认',
      icon: 'success'
    });

    // 支払いページに遷移
    wx.navigateTo({
      url: `/pages/payment/payment?orderId=${this.orderId}`
    });
  },

  // 京东自提柜を検索
  async findJDLockers() {
    wx.getLocation({
      type: 'gcj02',
      success: async (res) => {
        const lockers = await this.veyexpress.findNearbyPickupLocations({
          latitude: res.latitude,
          longitude: res.longitude,
          radius: 3000,
          types: ['JD_LOCKER']
        });

        wx.navigateTo({
          url: `/pages/lockers/lockers?lockers=${JSON.stringify(lockers)}`
        });
      }
    });
  }
});
```

---

## React/Vue コンポーネント

### React コンポーネント

```typescript
// components/VeyExpressAddressForm.tsx
import React, { useEffect, useRef } from 'react';
import { useVeyExpress } from '@vey/express-react';

interface VeyExpressAddressFormProps {
  countries?: string[];
  defaultCountry?: string;
  onAddressSelected?: (address: Address) => void;
  className?: string;
}

export const VeyExpressAddressForm: React.FC<VeyExpressAddressFormProps> = ({
  countries = ['JP', 'US', 'CN'],
  defaultCountry = 'JP',
  onAddressSelected,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { renderAddressForm } = useVeyExpress();

  useEffect(() => {
    if (containerRef.current) {
      renderAddressForm(containerRef.current, {
        countries,
        defaultCountry,
        enableAutocomplete: true,
        language: 'auto',
        onAddressSelected
      });
    }
  }, [countries, defaultCountry, onAddressSelected]);

  return <div ref={containerRef} className={className} />;
};

// components/VeyExpressShippingOptions.tsx
import React from 'react';
import { useShippingOptions } from '@vey/express-react';

interface VeyExpressShippingOptionsProps {
  destination: Address;
  items: CartItem[];
  onShippingSelected?: (option: ShippingOption) => void;
}

export const VeyExpressShippingOptions: React.FC<VeyExpressShippingOptionsProps> = ({
  destination,
  items,
  onShippingSelected
}) => {
  const { options, loading, error } = useShippingOptions({
    destination,
    items
  });

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div className="shipping-options">
      {options.map((option) => (
        <div 
          key={option.id} 
          className="shipping-option"
          onClick={() => onShippingSelected?.(option)}
        >
          <div className="carrier-logo">
            <img src={option.carrierLogo} alt={option.carrier} />
          </div>
          <div className="option-details">
            <h3>{option.name}</h3>
            <p>{option.estimatedDays} 日</p>
            <p className="price">¥{option.price.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// components/VeyExpressTracking.tsx
import React from 'react';
import { useTracking } from '@vey/express-react';

interface VeyExpressTrackingProps {
  trackingNumber: string;
  showMap?: boolean;
}

export const VeyExpressTracking: React.FC<VeyExpressTrackingProps> = ({
  trackingNumber,
  showMap = true
}) => {
  const { tracking, loading, error } = useTracking(trackingNumber);

  if (loading) return <div>追跡情報を取得中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h2>追跡番号: {trackingNumber}</h2>
        <div className="status">{tracking.currentStatus}</div>
      </div>

      {showMap && (
        <div className="tracking-map">
          <img src={tracking.mapUrl} alt="配送ルート" />
        </div>
      )}

      <div className="tracking-timeline">
        {tracking.events.map((event, index) => (
          <div key={index} className="timeline-event">
            <div className="event-time">{event.timestamp}</div>
            <div className="event-description">{event.description}</div>
            <div className="event-location">{event.location}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Vue コンポーネント

```vue
<!-- components/VeyExpressAddressForm.vue -->
<template>
  <div ref="addressForm" :class="className"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useVeyExpress } from '@vey/express-vue';

interface Props {
  countries?: string[];
  defaultCountry?: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  countries: () => ['JP', 'US', 'CN'],
  defaultCountry: 'JP',
  className: ''
});

const emit = defineEmits<{
  addressSelected: [address: Address];
}>();

const addressForm = ref<HTMLElement | null>(null);
const { renderAddressForm } = useVeyExpress();

onMounted(() => {
  if (addressForm.value) {
    renderAddressForm(addressForm.value, {
      countries: props.countries,
      defaultCountry: props.defaultCountry,
      enableAutocomplete: true,
      language: 'auto',
      onAddressSelected: (address) => {
        emit('addressSelected', address);
      }
    });
  }
});
</script>

<!-- components/VeyExpressShippingOptions.vue -->
<template>
  <div class="shipping-options">
    <div v-if="loading">読み込み中...</div>
    <div v-else-if="error">エラー: {{ error.message }}</div>
    <div v-else>
      <div 
        v-for="option in options" 
        :key="option.id"
        class="shipping-option"
        @click="selectOption(option)"
      >
        <div class="carrier-logo">
          <img :src="option.carrierLogo" :alt="option.carrier" />
        </div>
        <div class="option-details">
          <h3>{{ option.name }}</h3>
          <p>{{ option.estimatedDays }} 日</p>
          <p class="price">¥{{ option.price.toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useShippingOptions } from '@vey/express-vue';

interface Props {
  destination: Address;
  items: CartItem[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  shippingSelected: [option: ShippingOption];
}>();

const { options, loading, error } = useShippingOptions({
  destination: props.destination,
  items: props.items
});

const selectOption = (option: ShippingOption) => {
  emit('shippingSelected', option);
};
</script>
```

---

## Webhook実装

### Node.js / Express

```typescript
// server/webhooks/veyexpress.ts
import express from 'express';
import { VeyExpressWebhook } from '@vey/express-sdk';

const router = express.Router();

const webhook = new VeyExpressWebhook({
  secret: process.env.VEYEXPRESS_WEBHOOK_SECRET!
});

router.post('/veyexpress/webhooks', async (req, res) => {
  try {
    // 署名を検証
    const isValid = webhook.verify(
      req.body,
      req.headers['x-veyexpress-signature'] as string
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // イベントタイプ別に処理
    switch (event.event) {
      case 'shipment.created':
        await handleShipmentCreated(event.data);
        break;

      case 'shipment.picked_up':
        await handleShipmentPickedUp(event.data);
        break;

      case 'shipment.in_transit':
        await handleShipmentInTransit(event.data);
        break;

      case 'shipment.out_for_delivery':
        await handleShipmentOutForDelivery(event.data);
        break;

      case 'shipment.delivered':
        await handleShipmentDelivered(event.data);
        break;

      case 'shipment.exception':
        await handleShipmentException(event.data);
        break;

      case 'shipment.returned':
        await handleShipmentReturned(event.data);
        break;

      default:
        console.log('Unknown event type:', event.event);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// イベントハンドラー
async function handleShipmentCreated(data: any) {
  // 注文ステータスを更新
  await updateOrderStatus(data.orderId, 'shipment_created');
  
  // 顧客に通知
  await sendCustomerNotification(data.orderId, {
    title: '発送準備中',
    message: 'ご注文の発送準備が開始されました。',
    trackingUrl: data.trackingUrl
  });
}

async function handleShipmentDelivered(data: any) {
  // 注文を完了
  await completeOrder(data.orderId);
  
  // 顧客に通知
  await sendCustomerNotification(data.orderId, {
    title: '配達完了',
    message: '荷物が配達されました。ご利用ありがとうございました。',
    deliveredAt: data.deliveredAt
  });
  
  // レビュー依頼を送信
  await scheduleReviewRequest(data.orderId, '3 days');
}

async function handleShipmentException(data: any) {
  // カスタマーサポートに通知
  await notifyCustomerSupport({
    orderId: data.orderId,
    trackingNumber: data.trackingNumber,
    exception: data.exception,
    priority: 'high'
  });
  
  // 顧客に通知
  await sendCustomerNotification(data.orderId, {
    title: '配送に遅延が発生しています',
    message: data.exception.description,
    supportUrl: `${process.env.APP_URL}/support/${data.orderId}`
  });
}

export default router;
```

---

## ZKPプライバシー統合

### ZKP証明の生成

```typescript
import { ZKPAddressProof } from '@vey/express-zkp';

// 住所提供者側（Veyvaultなど）
async function generateAddressProof(
  userAddress: Address,
  shippingRequest: ShippingRequest
): Promise<ZKProof> {
  
  const zkp = new ZKPAddressProof({
    circuit: 'address-verification-v1'
  });

  // ゼロ知識証明を生成
  const proof = await zkp.generate({
    // 秘密情報（証明者のみが知っている）
    privateInputs: {
      fullAddress: userAddress,
      pid: userAddress.pid
    },
    
    // 公開情報（検証者も知っている）
    publicInputs: {
      allowedCountries: shippingRequest.allowedCountries,
      allowedRegions: shippingRequest.allowedRegions,
      requesterDID: shippingRequest.requesterDID,
      timestamp: shippingRequest.timestamp
    }
  });

  return {
    proof: proof.proof,
    publicSignals: proof.publicSignals,
    verification: {
      canDeliver: true,
      country: userAddress.country, // 国コードのみ公開
      region: userAddress.admin1, // 地域コードのみ公開
      // 詳細な住所は公開しない
    }
  };
}

// ECサイト側
async function verifyShippingEligibility(
  zkProof: ZKProof
): Promise<VerificationResult> {
  
  const zkp = new ZKPAddressProof({
    circuit: 'address-verification-v1'
  });

  // 証明を検証（生住所を見ずに検証可能）
  const isValid = await zkp.verify({
    proof: zkProof.proof,
    publicSignals: zkProof.publicSignals
  });

  if (!isValid) {
    throw new Error('Invalid ZK proof');
  }

  // 証明が有効なら、配送可能と判断
  return {
    valid: true,
    canDeliver: zkProof.verification.canDeliver,
    estimatedRegion: zkProof.verification.region,
    // 生住所は取得できない（プライバシー保護）
  };
}

// キャリア側（配送時のみ住所を開示）
async function accessAddressForDelivery(
  trackingNumber: string,
  courierCredentials: CourierCredentials
): Promise<FullAddress> {
  
  // キャリアの認証情報を検証
  const isAuthorized = await verifyCarrierCredentials(courierCredentials);
  if (!isAuthorized) {
    throw new Error('Unauthorized carrier');
  }

  // 配送に必要な完全な住所を取得
  const address = await VeyExpress.getFullAddress({
    trackingNumber,
    carrierDID: courierCredentials.did,
    accessReason: 'LAST_MILE_DELIVERY'
  });

  // アクセスログを記録（監査用）
  await logAddressAccess({
    trackingNumber,
    carrierDID: courierCredentials.did,
    timestamp: new Date(),
    accessType: 'FULL_ADDRESS',
    encrypted: true
  });

  return address;
}
```

---

このSDKドキュメントは、VeyExpressプラットフォームの実装例を網羅的に示しています。各プラットフォームやフレームワークでの統合方法、ZKPによるプライバシー保護、Webhook処理など、実践的なコード例を提供しています。
