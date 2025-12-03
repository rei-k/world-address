# WeChat Mini Program UI ナビゲーション設計 / UI Navigation Design

このドキュメントは、検索・スキャン中心の思想に基づくWeChat Mini ProgramのUI/UX詳細設計を定義します。

---

## 左サイドメニュー実装 / Left Side Menu Implementation

### メニュー構造 / Menu Structure

```typescript
interface WeChatMenuConfig {
  position: 'left';
  style: 'icon-with-label';
  theme: 'wechat-green';
  
  items: [
    {
      id: 'overview',
      label: '最近',
      icon: 'clock',
      route: '/pages/overview/index',
      badge: 0
    },
    {
      id: 'addresses',
      label: '住所',
      icon: 'location',
      route: '/pages/addresses/index',
      badge: 0
    },
    {
      id: 'payments',
      label: '決済',
      icon: 'card',
      route: '/pages/payments/index',
      badge: 0
    },
    {
      id: 'contacts',
      label: '友達',
      icon: 'friends',
      route: '/pages/contacts/index',
      badge: 0
    },
    {
      id: 'gifts',
      label: 'ギフト',
      icon: 'gift',
      route: '/pages/gifts/index',
      badge: 3 // Pending受取数
    },
    {
      id: 'waybills',
      label: '送り状',
      icon: 'qrcode',
      route: '/pages/waybills/index',
      badge: 0
    },
    {
      id: 'permissions',
      label: '権限',
      icon: 'safety',
      route: '/pages/permissions/index',
      badge: 0
    },
    {
      id: 'settings',
      label: '設定',
      icon: 'setting',
      route: '/pages/settings/index',
      badge: 0
    }
  ];
}
```

### アイコン実装 / Icon Implementation

WeUI アイコンセットを使用:

```typescript
interface IconMapping {
  'clock': 'weui-icon-clock',
  'location': 'weui-icon-location',
  'card': 'weui-icon-card',
  'friends': 'weui-icon-friends',
  'gift': 'weui-icon-gift',
  'qrcode': 'weui-icon-qrcode',
  'safety': 'weui-icon-safe',
  'setting': 'weui-icon-setting'
}
```

### メニュー動作 / Menu Behavior

```typescript
interface MenuBehavior {
  // タップ時の動作
  onTap: {
    action: 'NAVIGATE';
    animation: 'SLIDE_IN_RIGHT';
    keepMenuOpen: false;
  };
  
  // バッジ更新
  badgeUpdate: {
    realtime: true;
    source: 'CLOUD_SYNC';
  };
  
  // 認知負荷削減
  cognitiveLoad: {
    maxVisibleItems: 8;
    iconSize: '24px';
    labelLength: '4-6文字';
  };
}
```

---

## ホーム画面実装 / Home Screen Implementation

### WeChat Mini Program固有実装 / WeChat-Specific Implementation

```typescript
interface WeChatHomeScreen {
  // 画面構成
  layout: {
    header: false; // ヘッダーなし（スッキリ）
    scanButton: {
      position: 'top-center';
      size: 'large';
      color: '#07C160'; // WeChatグリーン
      icon: 'scan';
      label: 'スキャン';
    };
    searchButton: {
      position: 'below-scan';
      size: 'medium';
      style: 'outlined';
      icon: 'search';
      label: '住所を検索';
    };
  };
  
  // スキャン機能
  scan: {
    modes: ['QR', 'NFC'];
    aiPrediction: true;
    wechatAPI: 'wx.scanCode';
  };
  
  // その他は表示しない
  noOtherElements: true;
}
```

### WXML実装例 / WXML Implementation

```xml
<!-- pages/home/index.wxml -->
<view class="home-container">
  <!-- スキャンボタン -->
  <view class="scan-section">
    <button 
      class="scan-button" 
      bindtap="handleScan"
      hover-class="scan-button-hover"
    >
      <icon type="scan" size="40" color="#07C160" />
      <text class="scan-label">スキャン</text>
    </button>
  </view>
  
  <!-- 住所検索ボタン -->
  <view class="search-section">
    <button 
      class="search-button" 
      bindtap="handleSearchAddress"
      hover-class="search-button-hover"
    >
      <icon type="search" size="24" color="#07C160" />
      <text class="search-label">住所を検索</text>
    </button>
  </view>
</view>
```

### WXSS実装例 / WXSS Implementation

```css
/* pages/home/index.wxss */
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.scan-section {
  margin-bottom: 40rpx;
}

.scan-button {
  width: 320rpx;
  height: 320rpx;
  border-radius: 160rpx;
  background: #07C160;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 16rpx rgba(7, 193, 96, 0.3);
  border: none;
}

.scan-button::after {
  border: none;
}

.scan-button-hover {
  transform: scale(0.95);
  box-shadow: 0 4rpx 8rpx rgba(7, 193, 96, 0.2);
}

.scan-label {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 16rpx;
}

.search-button {
  width: 560rpx;
  height: 96rpx;
  border: 2rpx solid #07C160;
  border-radius: 48rpx;
  background: #ffffff;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.search-button::after {
  border: none;
}

.search-button-hover {
  background: #e6fff2;
}

.search-label {
  color: #07C160;
  font-size: 28rpx;
  margin-left: 12rpx;
}
```

---

## 住所検索画面実装 / Address Search Screen Implementation

### 縦一列レイアウト / Vertical Layout

```typescript
interface AddressSearchLayout {
  // 検索ボックス（上部固定）
  searchBox: {
    position: 'sticky-top';
    placeholder: '名前 / 国 / タグ / グループ';
    clearable: true;
    debounce: 300; // ms
  };
  
  // Default住所（ピン固定）
  defaultAddress: {
    position: 'top-of-list';
    style: 'highlighted';
    pinned: true;
    backgroundColor: '#e6fff2';
  };
  
  // 友達住所リスト（縦一列）
  friendAddressList: {
    layout: 'vertical-list';
    itemHeight: 'auto';
    separator: true;
  };
}
```

### WXML実装例 / WXML Implementation

```xml
<!-- pages/address-search/index.wxml -->
<view class="search-container">
  <!-- 検索ボックス -->
  <view class="search-box-container">
    <input 
      class="search-input"
      placeholder="名前 / 国 / タグ / グループ"
      value="{{searchQuery}}"
      bindinput="handleSearchInput"
      confirm-type="search"
    />
    <icon 
      wx:if="{{searchQuery}}" 
      type="clear" 
      size="20" 
      bindtap="handleClearSearch"
    />
  </view>
  
  <!-- Default住所（ピン固定） -->
  <view 
    wx:if="{{defaultAddress}}"
    class="address-item default-address"
    bindtap="handleSelectAddress"
    data-address="{{defaultAddress}}"
  >
    <view class="address-header">
      <icon type="location" size="20" color="#07C160" />
      <text class="address-name">Default</text>
      <view class="pin-badge">📌</view>
    </view>
    <text class="address-display">{{defaultAddress.displayName}}</text>
    <view class="address-tags">
      <view 
        wx:for="{{defaultAddress.tags}}" 
        wx:for-item="tag"
        wx:key="*this"
        class="tag"
      >
        {{tag}}
      </view>
    </view>
  </view>
  
  <!-- 友達住所リスト -->
  <view class="address-list">
    <view 
      wx:for="{{friendAddresses}}" 
      wx:for-item="address"
      wx:key="pid"
      class="address-item"
      bindtap="handleSelectAddress"
      data-address="{{address}}"
    >
      <view class="address-header">
        <icon type="user" size="20" color="#07C160" />
        <text class="address-name">{{address.friendName}}</text>
        <icon 
          wx:if="{{address.verified}}" 
          type="success" 
          size="16" 
          color="#07C160"
        />
      </view>
      <text class="address-display">{{address.displayName}}</text>
      <view class="address-tags">
        <view 
          wx:for="{{address.tags}}" 
          wx:for-item="tag"
          wx:key="*this"
          class="tag"
        >
          {{tag}}
        </view>
      </view>
    </view>
  </view>
</view>
```

### 選択時の動作 / Selection Behavior

```typescript
interface SelectionBehavior {
  // 選択した瞬間の処理
  onSelect: {
    // 内部でPID照合確定
    pidVerification: {
      automatic: true;
      duration: 300; // ms
      showLoading: true;
    };
    
    // 次画面へ自動遷移
    autoNavigation: {
      target: '/pages/payment-select/index';
      animation: 'SLIDE_IN_RIGHT';
      delay: 300; // ms（PID照合完了後）
    };
  };
}
```

---

## 決済トークン選択画面実装 / Payment Token Selection Screen Implementation

### WeChat Pay統合 / WeChat Pay Integration

```typescript
interface WeChatPayIntegration {
  // 決済方法の種類
  paymentTypes: [
    'WECHAT_BALANCE',    // WeChat残高
    'BANK_CARD',         // 銀行カード
    'CREDIT_CARD'        // クレジットカード
  ];
  
  // WeChat Pay API
  api: {
    requestPayment: 'wx.requestPayment';
    chooseInvoiceTitle: 'wx.chooseInvoiceTitle';
  };
  
  // AI推薦
  recommendation: {
    algorithm: 'FREQUENCY_BASED';
    wechatPayPreferred: true;
  };
}
```

### WXML実装例 / WXML Implementation

```xml
<!-- pages/payment-select/index.wxml -->
<view class="payment-container">
  <view class="header">
    <text class="title">決済方法を選択</text>
    <text class="subtitle">カード番号の入力は不要です</text>
  </view>
  
  <!-- AI推薦トークン -->
  <view 
    wx:if="{{recommendedToken}}"
    class="payment-item recommended"
    bindtap="handleSelectToken"
    data-token="{{recommendedToken}}"
  >
    <view class="recommended-badge">おすすめ</view>
    <view class="token-info">
      <image src="{{recommendedToken.icon}}" class="token-icon" />
      <view class="token-details">
        <text class="token-name">{{recommendedToken.displayName}}</text>
        <text class="token-number">****{{recommendedToken.lastFourDigits}}</text>
      </view>
    </view>
    <icon type="success" size="20" color="#07C160" />
  </view>
  
  <!-- その他のトークン -->
  <view class="token-list">
    <view 
      wx:for="{{otherTokens}}" 
      wx:for-item="token"
      wx:key="tokenId"
      class="payment-item"
      bindtap="handleSelectToken"
      data-token="{{token}}"
    >
      <view class="token-info">
        <image src="{{token.icon}}" class="token-icon" />
        <view class="token-details">
          <text class="token-name">{{token.displayName}}</text>
          <text class="token-number">****{{token.lastFourDigits}}</text>
        </view>
      </view>
      <icon type="success_no_circle" size="20" color="#999" />
    </view>
  </view>
  
  <!-- 検索のみ可能（入力フォームなし） -->
  <view class="search-hint">
    <icon type="info_circle" size="16" color="#999" />
    <text>新しい決済方法は検索から追加できます</text>
  </view>
</view>
```

---

## ギフト受取設定画面実装（友達側）/ Gift Receipt Screen Implementation

### WeChat友達共有 / WeChat Friend Sharing

```typescript
interface WeChatShareIntegration {
  // 共有機能
  share: {
    // WeChat友達への共有
    shareToFriends: {
      api: 'wx.shareAppMessage';
      title: 'ギフトが届いています';
      path: '/pages/gift-receipt/index';
      imageUrl: '/assets/gift-share.png';
    };
    
    // Moments（モーメンツ）への共有
    shareToMoments: {
      api: 'wx.shareTimeline';
      title: 'ギフトを受け取りました';
      query: 'giftId=xxx';
    };
  };
  
  // 期限管理
  deadline: {
    wechatNotification: true;
    templateMessage: true;
  };
}
```

### WXML実装例 / WXML Implementation

```xml
<!-- pages/gift-receipt/index.wxml -->
<view class="receipt-container">
  <!-- 期限ゲージ -->
  <view class="deadline-section">
    <view class="deadline-header">
      <icon type="warn" size="24" color="{{urgent ? '#FA5151' : '#07C160'}}" />
      <text class="deadline-title">受取期限</text>
    </view>
    
    <view class="deadline-gauge">
      <progress 
        percent="{{remainingPercentage}}" 
        stroke-width="12" 
        activeColor="{{urgent ? '#FA5151' : '#07C160'}}"
        backgroundColor="#EEEEEE"
      />
    </view>
    
    <text class="deadline-countdown {{urgent ? 'urgent' : ''}}">
      あと {{remainingDays}}日 {{remainingHours}}時間 {{remainingMinutes}}分
    </text>
    
    <view wx:if="{{urgent}}" class="urgent-warning">
      <icon type="warn" size="20" color="#FA5151" />
      <text>まもなく期限切れになります</text>
    </view>
  </view>
  
  <!-- 受取場所候補 -->
  <view class="location-section">
    <text class="section-title">受け取る場所を選択</text>
    
    <view class="location-list">
      <view 
        wx:for="{{pickupLocations}}" 
        wx:for-item="location"
        wx:key="pid"
        class="location-item {{selectedLocation.pid === location.pid ? 'selected' : ''}}"
        bindtap="handleSelectLocation"
        data-location="{{location}}"
      >
        <view class="location-header">
          <icon type="location" size="24" color="#07C160" />
          <text class="location-name">{{location.displayName}}</text>
        </view>
        
        <view class="location-examples">
          <text 
            wx:for="{{location.examples}}" 
            wx:for-item="example"
            wx:key="*this"
            class="example"
          >
            {{example}}
          </text>
        </view>
        
        <text class="delivery-estimate">
          配送予定: {{location.estimatedDelivery}}
        </text>
        
        <icon 
          wx:if="{{selectedLocation.pid === location.pid}}" 
          type="success" 
          size="24" 
          color="#07C160"
          class="selected-icon"
        />
      </view>
    </view>
  </view>
  
  <!-- 確定ボタン -->
  <view class="confirm-section">
    <button 
      class="confirm-button {{!selectedLocation ? 'disabled' : ''}}"
      disabled="{{!selectedLocation}}"
      bindtap="handleConfirm"
    >
      場所を選択して確定
    </button>
    
    <!-- WeChat友達への共有ボタン -->
    <button 
      class="share-button"
      open-type="share"
    >
      <icon type="share" size="20" color="#07C160" />
      <text>友達に教える</text>
    </button>
  </view>
</view>
```

---

## Waybillプレビュー画面実装 / Waybill Preview Screen Implementation

### WeChat QRコード生成 / WeChat QR Code Generation

```typescript
interface WeChatQRGeneration {
  // 小程序码生成
  miniProgramCode: {
    api: 'getUnlimitedQRCode';
    scene: 'waybillId=xxx';
    page: 'pages/waybill-preview/index';
    width: 280;
  };
  
  // 通常QRコード
  qrCode: {
    api: 'createQRCode';
    path: '/pages/waybill-preview/index?id=xxx';
    width: 280;
  };
}
```

### WXML実装例 / WXML Implementation

```xml
<!-- pages/waybill-preview/index.wxml -->
<view class="waybill-container">
  <!-- 互換性チェック結果 -->
  <view class="compatibility-section">
    <view class="compatibility-result {{compatibility.result}}">
      <icon 
        type="{{compatibilityIcon}}" 
        size="32" 
        color="{{compatibilityColor}}"
      />
      <text class="compatibility-message">{{compatibilityMessage}}</text>
    </view>
    
    <view wx:if="{{!compatibility.compatible}}" class="error-details">
      <text class="error-title">配送できない理由:</text>
      <view 
        wx:for="{{compatibility.reasons}}" 
        wx:for-item="reason"
        wx:key="*this"
        class="reason-item"
      >
        <text>• {{reason}}</text>
      </view>
      
      <view wx:if="{{compatibility.alternatives}}" class="alternatives">
        <text class="alternatives-title">代替案:</text>
        <button 
          wx:if="{{compatibility.alternatives.suggestedCarrier}}"
          class="alternative-button"
          bindtap="handleUseSuggestedCarrier"
        >
          {{compatibility.alternatives.suggestedCarrier}} を使用
        </button>
        <button 
          wx:if="{{compatibility.alternatives.suggestedLocation}}"
          class="alternative-button"
          bindtap="handleUseSuggestedLocation"
        >
          {{compatibility.alternatives.suggestedLocation}} を選択
        </button>
      </view>
    </view>
  </view>
  
  <!-- Waybill情報（互換性OKの場合のみ表示） -->
  <view wx:if="{{compatibility.compatible}}" class="waybill-info">
    <!-- 宛先PID -->
    <view class="info-item">
      <text class="info-label">宛先PID</text>
      <view class="info-value">
        <text>{{recipientPID}}</text>
        <icon 
          wx:if="{{pidVerified}}" 
          type="success" 
          size="16" 
          color="#07C160"
        />
      </view>
    </view>
    
    <!-- 決済トークンID -->
    <view class="info-item">
      <text class="info-label">決済方法</text>
      <text class="info-value">{{paymentTokenDisplay}}</text>
    </view>
    
    <!-- 追跡ハッシュ -->
    <view class="info-item">
      <text class="info-label">追跡番号</text>
      <text class="info-value">{{trackingHash}}</text>
    </view>
    
    <!-- QRコード（WeChat小程序码） -->
    <view class="qr-section">
      <image src="{{miniProgramCodeUrl}}" class="qr-code" mode="aspectFit" />
      <text class="qr-hint">配達員はこのQRコードをスキャンします</text>
      
      <button 
        class="save-qr-button"
        bindtap="handleSaveQRCode"
      >
        <icon type="download" size="20" color="#07C160" />
        <text>QRコードを保存</text>
      </button>
    </view>
  </view>
  
  <!-- アクションボタン -->
  <view class="action-section">
    <button 
      wx:if="{{compatibility.compatible}}"
      class="primary-button"
      bindtap="handleConfirmWaybill"
    >
      送り状を確定
    </button>
    <button 
      wx:else
      class="secondary-button"
      bindtap="handleGoBack"
    >
      戻って修正
    </button>
    
    <!-- WeChat友達への共有 -->
    <button 
      class="share-button"
      open-type="share"
    >
      <icon type="share" size="20" color="#07C160" />
      <text>友達に共有</text>
    </button>
  </view>
</view>
```

---

## 権限管理画面実装 / Permissions Screen Implementation

### WeChat Template Message / WeChat テンプレートメッセージ

```typescript
interface WeChatTemplateMessage {
  // 提出権解除通知
  revocationNotification: {
    templateId: 'xxx',
    data: {
      thing1: { value: '提出権が解除されました' },
      thing2: { value: partnerName },
      time3: { value: revokedAt },
      thing4: { value: '再提出は不可です' }
    }
  };
  
  // 期限接近通知
  deadlineWarning: {
    templateId: 'yyy',
    data: {
      thing1: { value: 'ギフトの受取期限が近づいています' },
      time2: { value: deadline },
      thing3: { value: '受取場所を選択してください' }
    }
  };
}
```

### WXML実装例 / WXML Implementation

```xml
<!-- pages/permissions/index.wxml -->
<view class="permissions-container">
  <!-- アクティブな権限 -->
  <view class="section">
    <text class="section-title">アクティブな提出権</text>
    
    <view class="permission-list">
      <view 
        wx:for="{{activePermissions}}" 
        wx:for-item="permission"
        wx:key="permissionId"
        class="permission-item"
      >
        <view class="permission-header">
          <icon type="shop" size="24" color="#07C160" />
          <text class="partner-name">{{permission.partnerName}}</text>
        </view>
        
        <view class="permission-details">
          <view class="detail-row">
            <text class="detail-label">住所PID:</text>
            <text class="detail-value">{{permission.addressPID}}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">提出日:</text>
            <text class="detail-value">{{permission.grantedAt}}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">使用回数:</text>
            <text class="detail-value">{{permission.usageCount}}回</text>
          </view>
        </view>
        
        <button 
          class="revoke-button"
          bindtap="handleRevokePermission"
          data-permission="{{permission}}"
        >
          提出権を解除
        </button>
      </view>
    </view>
  </view>
  
  <!-- 解除理由選択モーダル -->
  <modal 
    wx:if="{{showRevocationModal}}" 
    bindcancel="handleCloseModal"
    bindconfirm="handleConfirmRevocation"
  >
    <view class="modal-content">
      <text class="modal-title">解除理由を選択</text>
      
      <radio-group bindchange="handleReasonChange">
        <label 
          wx:for="{{revocationReasons}}" 
          wx:for-item="reason"
          wx:key="id"
          class="reason-item"
        >
          <radio value="{{reason.id}}" checked="{{selectedReason === reason.id}}" />
          <view class="reason-label">
            <text>{{reason.label}}</text>
            <view wx:if="{{reason.aiSuggested}}" class="ai-badge">AI推薦</view>
          </view>
        </label>
      </radio-group>
      
      <view class="custom-input">
        <textarea 
          placeholder="その他の理由を入力"
          value="{{customReason}}"
          bindinput="handleCustomReasonInput"
          maxlength="200"
        />
      </view>
    </view>
  </modal>
  
  <!-- 解除済みの権限 -->
  <view class="section">
    <text class="section-title">解除済みの提出権</text>
    
    <view class="permission-list">
      <view 
        wx:for="{{revokedPermissions}}" 
        wx:for-item="permission"
        wx:key="permissionId"
        class="permission-item revoked"
      >
        <view class="permission-header">
          <icon type="shop" size="24" color="#999" />
          <text class="partner-name">{{permission.partnerName}}</text>
          <view class="revoked-badge">解除済み</view>
        </view>
        
        <view class="permission-details">
          <view class="detail-row">
            <text class="detail-label">解除日:</text>
            <text class="detail-value">{{permission.revokedAt}}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">再提出:</text>
            <text class="detail-value">不可</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</view>
```

---

## ナビゲーション実装 / Navigation Implementation

### WeChat Mini Program API

```javascript
// app.js
App({
  onLaunch: function (options) {
    // アプリ起動時の初期化
    console.log('WeChat Mini Program launched');
  },
  
  globalData: {
    userInfo: null,
    addressSearchCache: {},
  }
});

// pages/home/index.js
Page({
  data: {
    scanMode: null,
  },
  
  // スキャン処理
  handleScan: function() {
    wx.scanCode({
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        // AI意図予測
        this.predictIntent(res.result);
      },
      fail: (err) => {
        wx.showToast({
          title: 'スキャンに失敗しました',
          icon: 'none'
        });
      }
    });
  },
  
  // AI意図予測
  predictIntent: function(scanData) {
    wx.showLoading({
      title: '解析中...',
    });
    
    // AIサービス呼び出し
    wx.request({
      url: 'https://api.vey.example/predict-intent',
      method: 'POST',
      data: {
        scanData: scanData
      },
      success: (res) => {
        wx.hideLoading();
        
        const prediction = res.data;
        
        // 適切な画面へ遷移
        if (prediction.intent === 'GIFT_SETUP') {
          wx.navigateTo({
            url: `/pages/gift-receipt/index?data=${scanData}`
          });
        } else if (prediction.intent === 'TRACKING') {
          wx.navigateTo({
            url: `/pages/waybill-preview/index?hash=${scanData}`
          });
        }
      }
    });
  },
  
  // 住所検索へ遷移
  handleSearchAddress: function() {
    wx.navigateTo({
      url: '/pages/address-search/index'
    });
  },
  
  // WeChat友達共有（ページレベル）
  onShareAppMessage: function() {
    return {
      title: 'Vey Wallet - 住所を検索して送る',
      path: '/pages/home/index',
      imageUrl: '/assets/share-image.png'
    };
  }
});
```

### 遷移フローの実装 / Transition Flow Implementation

```typescript
interface NavigationFlow {
  // ギフト送信フロー
  giftSending: {
    steps: [
      {
        page: '/pages/home/index',
        action: 'handleSearchAddress',
        next: '/pages/address-search/index'
      },
      {
        page: '/pages/address-search/index',
        action: 'handleSelectAddress',
        pidVerification: true,
        loading: {
          title: 'PID照合中...',
          duration: 300
        },
        next: '/pages/payment-select/index'
      },
      {
        page: '/pages/payment-select/index',
        action: 'handleSelectToken',
        next: '/pages/gift-setup/index'
      },
      {
        page: '/pages/gift-setup/index',
        action: 'handleConfirm',
        next: '/pages/waybill-preview/index'
      }
    ]
  };
}
```

---

## WeChat友達統合 / WeChat Friends Integration

### 友達リスト取得 / Friends List Retrieval

```typescript
interface WeChatFriendsIntegration {
  // 友達情報取得
  getFriends: {
    // WeChat APIでは直接友達リストを取得できないため、
    // Veyサーバー経由で友達関係を管理
    veyServerAPI: '/api/contacts/friends';
    
    // WeChat友達との連携
    wechatBinding: {
      openId: string;
      unionId: string;
      nickname: string;
      avatarUrl: string;
    };
  };
  
  // 友達追加
  addFriend: {
    // QRコードスキャンで友達追加
    scanQR: true;
    
    // WeChat連絡先から選択
    selectFromContacts: false; // WeChat APIの制限により不可
    
    // URL/リンクで招待
    inviteLink: true;
  };
}
```

---

## まとめ / Summary

### WeChat Mini Program固有の特徴 / WeChat-Specific Features

1. **WeUI**: UIコンポーネントライブラリ
2. **WeChat API**: スキャン、決済、共有機能
3. **Template Message**: プッシュ通知
4. **WeChatグリーン**: ブランドカラー (#07C160)
5. **友達共有**: WeChat Momentsへの共有

### 実装のポイント / Implementation Points

- **WXML/WXSS/JS**: WeChat Mini Programの標準技術スタック
- **wx API**: WeChat固有API（wx.scanCode, wx.navigateTo等）
- **open-type**: ボタンの特殊動作（share等）
- **認知負荷削減**: アイコン+短いラベル
- **一画面一アクション**: 画面内分岐を減らす

### 破綻しない設計 / Failure-Proof Design

- **PID照合**: 選択時に自動実行
- **互換性チェック**: 事前に配送可否判定
- **期限管理**: Template Messageで通知
- **失効の伝播**: 3層からの即座な排除
- **WeChat統合**: 友達共有、Template Message

---

## 関連ドキュメント / Related Documents

- [UI/UX Design (共通)](../../UI-UX-DESIGN.md)
- [WeChat Mini-Program README](./README.md)
- [WeChat AI Capabilities](./AI-CAPABILITIES.md)

---

## ライセンス / License

MIT License
