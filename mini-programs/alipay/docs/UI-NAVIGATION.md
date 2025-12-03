# Alipay Mini Program UI ナビゲーション設計 / UI Navigation Design

このドキュメントは、検索・スキャン中心の思想に基づくAlipay Mini ProgramのUI/UX詳細設計を定義します。

---

## 左サイドメニュー実装 / Left Side Menu Implementation

### メニュー構造 / Menu Structure

```typescript
interface AlipayMenuConfig {
  position: 'left';
  style: 'icon-with-label';
  theme: 'alipay-blue';
  
  items: [
    {
      id: 'overview',
      label: '最近',
      icon: 'clock-history',
      route: '/pages/overview/index',
      badge: 0
    },
    {
      id: 'addresses',
      label: '住所',
      icon: 'location-pin',
      route: '/pages/addresses/index',
      badge: 0
    },
    {
      id: 'payments',
      label: '決済',
      icon: 'wallet-card',
      route: '/pages/payments/index',
      badge: 0
    },
    {
      id: 'contacts',
      label: '友達',
      icon: 'people-group',
      route: '/pages/contacts/index',
      badge: 0
    },
    {
      id: 'gifts',
      label: 'ギフト',
      icon: 'gift-tag',
      route: '/pages/gifts/index',
      badge: 3 // Pending受取数
    },
    {
      id: 'waybills',
      label: '送り状',
      icon: 'document-qr',
      route: '/pages/waybills/index',
      badge: 0
    },
    {
      id: 'permissions',
      label: '権限',
      icon: 'shield-lock',
      route: '/pages/permissions/index',
      badge: 0
    },
    {
      id: 'settings',
      label: '設定',
      icon: 'gear-settings',
      route: '/pages/settings/index',
      badge: 0
    }
  ];
}
```

### アイコン実装 / Icon Implementation

Ant Design Miniアイコンセットを使用:

```typescript
interface IconMapping {
  'clock-history': 'ClockCircleOutline',
  'location-pin': 'EnvironmentOutline',
  'wallet-card': 'PayCircleOutline',
  'people-group': 'TeamOutline',
  'gift-tag': 'GiftOutline',
  'document-qr': 'QrcodeOutline',
  'shield-lock': 'SafetyOutline',
  'gear-settings': 'SettingOutline'
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

### Alipay Mini Program固有実装 / Alipay-Specific Implementation

```typescript
interface AlipayHomeScreen {
  // 画面構成
  layout: {
    header: false; // ヘッダーなし（スッキリ）
    scanButton: {
      position: 'top-center';
      size: 'large';
      color: '#1677FF'; // Alipayブルー
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
    alipaySDK: 'my.scan';
  };
  
  // その他は表示しない
  noOtherElements: true;
}
```

### AXML実装例 / AXML Implementation

```xml
<!-- pages/home/index.axml -->
<view class="home-container">
  <!-- スキャンボタン -->
  <view class="scan-section">
    <button 
      class="scan-button" 
      onTap="handleScan"
      hover-class="scan-button-hover"
    >
      <icon type="scan" size="40" color="#1677FF" />
      <text class="scan-label">スキャン</text>
    </button>
  </view>
  
  <!-- 住所検索ボタン -->
  <view class="search-section">
    <button 
      class="search-button" 
      onTap="handleSearchAddress"
      hover-class="search-button-hover"
    >
      <icon type="search" size="24" color="#1677FF" />
      <text class="search-label">住所を検索</text>
    </button>
  </view>
</view>
```

### ACSS実装例 / ACSS Implementation

```css
/* pages/home/index.acss */
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
  background: #1677FF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 16rpx rgba(22, 119, 255, 0.3);
}

.scan-button-hover {
  transform: scale(0.95);
  box-shadow: 0 4rpx 8rpx rgba(22, 119, 255, 0.2);
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
  border: 2rpx solid #1677FF;
  border-radius: 48rpx;
  background: #ffffff;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.search-button-hover {
  background: #f0f5ff;
}

.search-label {
  color: #1677FF;
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
    backgroundColor: '#e6f7ff';
  };
  
  // 友達住所リスト（縦一列）
  friendAddressList: {
    layout: 'vertical-list';
    itemHeight: 'auto';
    separator: true;
  };
}
```

### AXML実装例 / AXML Implementation

```xml
<!-- pages/address-search/index.axml -->
<view class="search-container">
  <!-- 検索ボックス -->
  <view class="search-box-container">
    <input 
      class="search-input"
      placeholder="名前 / 国 / タグ / グループ"
      value="{{searchQuery}}"
      onInput="handleSearchInput"
      confirmType="search"
    />
    <icon 
      a:if="{{searchQuery}}" 
      type="clear" 
      size="20" 
      onTap="handleClearSearch"
    />
  </view>
  
  <!-- Default住所（ピン固定） -->
  <view 
    a:if="{{defaultAddress}}"
    class="address-item default-address"
    onTap="handleSelectAddress"
    data-address="{{defaultAddress}}"
  >
    <view class="address-header">
      <icon type="location" size="20" color="#1677FF" />
      <text class="address-name">Default</text>
      <view class="pin-badge">📌</view>
    </view>
    <text class="address-display">{{defaultAddress.displayName}}</text>
    <view class="address-tags">
      <view 
        a:for="{{defaultAddress.tags}}" 
        a:for-item="tag"
        class="tag"
      >
        {{tag}}
      </view>
    </view>
  </view>
  
  <!-- 友達住所リスト -->
  <view class="address-list">
    <view 
      a:for="{{friendAddresses}}" 
      a:for-item="address"
      class="address-item"
      onTap="handleSelectAddress"
      data-address="{{address}}"
    >
      <view class="address-header">
        <icon type="user" size="20" color="#52c41a" />
        <text class="address-name">{{address.friendName}}</text>
        <icon 
          a:if="{{address.verified}}" 
          type="success" 
          size="16" 
          color="#52c41a"
        />
      </view>
      <text class="address-display">{{address.displayName}}</text>
      <view class="address-tags">
        <view 
          a:for="{{address.tags}}" 
          a:for-item="tag"
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

### AI推薦の実装 / AI Recommendation Implementation

```typescript
interface AIPaymentRecommendation {
  // 推薦ロジック
  recommendation: {
    input: {
      selectedAddressPID: string;
      userPaymentHistory: PaymentHistory[];
      currentTime: Date;
    };
    
    processing: {
      algorithm: 'FREQUENCY_BASED';
      linkedAddressBoost: 2.0;
      recentUsageBoost: 1.5;
    };
    
    output: {
      recommendedToken: PaymentToken;
      confidence: number;
      reason: string;
    };
  };
  
  // UI表示
  display: {
    position: 'top-of-list';
    badge: 'おすすめ';
    backgroundColor: '#fff7e6';
    borderColor: '#ffa940';
  };
}
```

### AXML実装例 / AXML Implementation

```xml
<!-- pages/payment-select/index.axml -->
<view class="payment-container">
  <view class="header">
    <text class="title">決済方法を選択</text>
    <text class="subtitle">カード番号の入力は不要です</text>
  </view>
  
  <!-- AI推薦トークン -->
  <view 
    a:if="{{recommendedToken}}"
    class="payment-item recommended"
    onTap="handleSelectToken"
    data-token="{{recommendedToken}}"
  >
    <view class="recommended-badge">おすすめ</view>
    <view class="token-info">
      <icon type="{{recommendedToken.icon}}" size="32" />
      <view class="token-details">
        <text class="token-name">{{recommendedToken.displayName}}</text>
        <text class="token-number">****{{recommendedToken.lastFourDigits}}</text>
      </view>
    </view>
    <icon type="right" size="20" color="#999" />
  </view>
  
  <!-- その他のトークン -->
  <view class="token-list">
    <view 
      a:for="{{otherTokens}}" 
      a:for-item="token"
      class="payment-item"
      onTap="handleSelectToken"
      data-token="{{token}}"
    >
      <view class="token-info">
        <icon type="{{token.icon}}" size="32" />
        <view class="token-details">
          <text class="token-name">{{token.displayName}}</text>
          <text class="token-number">****{{token.lastFourDigits}}</text>
        </view>
      </view>
      <icon type="right" size="20" color="#999" />
    </view>
  </view>
  
  <!-- 検索のみ可能（入力フォームなし） -->
  <view class="search-hint">
    <icon type="info" size="16" color="#999" />
    <text>新しい決済方法は検索から追加できます</text>
  </view>
</view>
```

---

## ギフト受取設定画面実装（友達側）/ Gift Receipt Screen Implementation

### 期限ゲージの実装 / Deadline Gauge Implementation

```typescript
interface DeadlineGaugeImplementation {
  // データ計算
  calculation: {
    deadline: Date;
    now: Date;
    
    remaining: {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };
    
    percentage: number; // 0-100
    urgent: boolean; // 24時間以内
  };
  
  // UI表示
  display: {
    progressBar: {
      color: urgentWarning ? '#ff4d4f' : '#52c41a';
      animation: 'SMOOTH_DECREASE';
      updateInterval: 1000; // ms
    };
    
    countdown: {
      format: 'あと {days}日 {hours}時間 {minutes}分';
      color: urgentWarning ? '#ff4d4f' : '#000000';
      fontSize: urgentWarning ? '36rpx' : '32rpx';
    };
  };
}
```

### AXML実装例 / AXML Implementation

```xml
<!-- pages/gift-receipt/index.axml -->
<view class="receipt-container">
  <!-- 期限ゲージ -->
  <view class="deadline-section">
    <view class="deadline-header">
      <icon type="clock" size="24" color="{{urgent ? '#ff4d4f' : '#52c41a'}}" />
      <text class="deadline-title">受取期限</text>
    </view>
    
    <view class="deadline-gauge">
      <progress 
        percent="{{remainingPercentage}}" 
        stroke-width="12" 
        activeColor="{{urgent ? '#ff4d4f' : '#52c41a'}}"
        backgroundColor="#f0f0f0"
      />
    </view>
    
    <text class="deadline-countdown {{urgent ? 'urgent' : ''}}">
      あと {{remainingDays}}日 {{remainingHours}}時間 {{remainingMinutes}}分
    </text>
    
    <text a:if="{{urgent}}" class="urgent-warning">
      ⚠️ まもなく期限切れになります
    </text>
  </view>
  
  <!-- 受取場所候補 -->
  <view class="location-section">
    <text class="section-title">受け取る場所を選択</text>
    
    <view class="location-list">
      <view 
        a:for="{{pickupLocations}}" 
        a:for-item="location"
        class="location-item {{selectedLocation.pid === location.pid ? 'selected' : ''}}"
        onTap="handleSelectLocation"
        data-location="{{location}}"
      >
        <view class="location-header">
          <icon type="location" size="24" color="#1677FF" />
          <text class="location-name">{{location.displayName}}</text>
        </view>
        
        <view class="location-examples">
          <text 
            a:for="{{location.examples}}" 
            a:for-item="example"
            class="example"
          >
            {{example}}
          </text>
        </view>
        
        <text class="delivery-estimate">
          配送予定: {{location.estimatedDelivery}}
        </text>
        
        <icon 
          a:if="{{selectedLocation.pid === location.pid}}" 
          type="success-circle" 
          size="24" 
          color="#52c41a"
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
      onTap="handleConfirm"
    >
      場所を選択して確定
    </button>
  </view>
</view>
```

---

## Waybillプレビュー画面実装 / Waybill Preview Screen Implementation

### 互換性チェックUI / Compatibility Check UI

```typescript
interface CompatibilityCheckUI {
  // チェック結果の表示
  display: {
    compatible: {
      icon: 'success-circle';
      color: '#52c41a';
      message: '配送可能です';
    };
    
    incompatible: {
      icon: 'close-circle';
      color: '#ff4d4f';
      message: '配送できません';
      showAlternatives: true;
    };
    
    warning: {
      icon: 'exclamation-circle';
      color: '#faad14';
      message: '注意が必要です';
      showDetails: true;
    };
  };
  
  // 住所互換NGの場合、画面でストップ
  stopOnIncompatible: {
    preventNavigation: true;
    showErrorModal: true;
    suggestAlternatives: true;
  };
}
```

### AXML実装例 / AXML Implementation

```xml
<!-- pages/waybill-preview/index.axml -->
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
    
    <view a:if="{{!compatibility.compatible}}" class="error-details">
      <text class="error-title">配送できない理由:</text>
      <view 
        a:for="{{compatibility.reasons}}" 
        a:for-item="reason"
        class="reason-item"
      >
        <text>• {{reason}}</text>
      </view>
      
      <view a:if="{{compatibility.alternatives}}" class="alternatives">
        <text class="alternatives-title">代替案:</text>
        <button 
          a:if="{{compatibility.alternatives.suggestedCarrier}}"
          class="alternative-button"
          onTap="handleUseSuggestedCarrier"
        >
          {{compatibility.alternatives.suggestedCarrier}} を使用
        </button>
        <button 
          a:if="{{compatibility.alternatives.suggestedLocation}}"
          class="alternative-button"
          onTap="handleUseSuggestedLocation"
        >
          {{compatibility.alternatives.suggestedLocation}} を選択
        </button>
      </view>
    </view>
  </view>
  
  <!-- Waybill情報（互換性OKの場合のみ表示） -->
  <view a:if="{{compatibility.compatible}}" class="waybill-info">
    <!-- 宛先PID -->
    <view class="info-item">
      <text class="info-label">宛先PID</text>
      <view class="info-value">
        <text>{{recipientPID}}</text>
        <icon 
          a:if="{{pidVerified}}" 
          type="success" 
          size="16" 
          color="#52c41a"
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
    
    <!-- QRコード -->
    <view class="qr-section">
      <image src="{{qrCodeUrl}}" class="qr-code" mode="aspectFit" />
      <text class="qr-hint">配達員はこのQRコードをスキャンします</text>
    </view>
  </view>
  
  <!-- アクションボタン -->
  <view class="action-section">
    <button 
      a:if="{{compatibility.compatible}}"
      class="primary-button"
      onTap="handleConfirmWaybill"
    >
      送り状を確定
    </button>
    <button 
      a:else
      class="secondary-button"
      onTap="handleGoBack"
    >
      戻って修正
    </button>
  </view>
</view>
```

---

## 権限管理画面実装 / Permissions Screen Implementation

### 解除理由のAI抽出 / AI Revocation Reason Extraction

```typescript
interface AIRevocationReasons {
  // AI抽出ロジック
  extraction: {
    input: {
      permissionHistory: Permission[];
      userBehavior: UserBehavior[];
      commonReasons: string[];
    };
    
    processing: {
      frequencyAnalysis: boolean;
      contextualAnalysis: boolean;
      topN: 5;
    };
    
    output: {
      suggestedReasons: RevocationReason[];
      customInputAllowed: boolean;
    };
  };
}
```

### AXML実装例 / AXML Implementation

```xml
<!-- pages/permissions/index.axml -->
<view class="permissions-container">
  <!-- アクティブな権限 -->
  <view class="section">
    <text class="section-title">アクティブな提出権</text>
    
    <view class="permission-list">
      <view 
        a:for="{{activePermissions}}" 
        a:for-item="permission"
        class="permission-item"
      >
        <view class="permission-header">
          <icon type="shop" size="24" color="#1677FF" />
          <text class="partner-name">{{permission.partnerName}}</text>
        </view>
        
        <view class="permission-details">
          <text class="detail-item">住所PID: {{permission.addressPID}}</text>
          <text class="detail-item">提出日: {{permission.grantedAt}}</text>
          <text class="detail-item">使用回数: {{permission.usageCount}}回</text>
        </view>
        
        <button 
          class="revoke-button"
          onTap="handleRevokePermission"
          data-permission="{{permission}}"
        >
          提出権を解除
        </button>
      </view>
    </view>
  </view>
  
  <!-- 解除理由選択モーダル -->
  <modal 
    visible="{{showRevocationModal}}" 
    onClose="handleCloseModal"
  >
    <view class="modal-content">
      <text class="modal-title">解除理由を選択</text>
      
      <view class="reason-list">
        <view 
          a:for="{{revocationReasons}}" 
          a:for-item="reason"
          class="reason-item {{selectedReason === reason.id ? 'selected' : ''}}"
          onTap="handleSelectReason"
          data-reason="{{reason}}"
        >
          <view class="reason-label">
            <text>{{reason.label}}</text>
            <view a:if="{{reason.aiSuggested}}" class="ai-badge">AI推薦</view>
          </view>
          <icon 
            a:if="{{selectedReason === reason.id}}" 
            type="success" 
            size="20" 
            color="#52c41a"
          />
        </view>
      </view>
      
      <view class="custom-input">
        <input 
          placeholder="その他の理由を入力"
          value="{{customReason}}"
          onInput="handleCustomReasonInput"
        />
      </view>
      
      <view class="modal-actions">
        <button class="cancel-button" onTap="handleCloseModal">
          キャンセル
        </button>
        <button 
          class="confirm-button"
          disabled="{{!selectedReason && !customReason}}"
          onTap="handleConfirmRevocation"
        >
          解除を確定
        </button>
      </view>
    </view>
  </modal>
  
  <!-- 解除済みの権限 -->
  <view class="section">
    <text class="section-title">解除済みの提出権</text>
    
    <view class="permission-list">
      <view 
        a:for="{{revokedPermissions}}" 
        a:for-item="permission"
        class="permission-item revoked"
      >
        <view class="permission-header">
          <icon type="shop" size="24" color="#999" />
          <text class="partner-name">{{permission.partnerName}}</text>
          <view class="revoked-badge">解除済み</view>
        </view>
        
        <view class="permission-details">
          <text class="detail-item">解除日: {{permission.revokedAt}}</text>
          <text class="detail-item">再提出: 不可</text>
        </view>
      </view>
    </view>
  </view>
</view>
```

---

## ナビゲーション実装 / Navigation Implementation

### Alipay Mini Program API

```typescript
// app.js
App({
  onLaunch(options) {
    // アプリ起動時の初期化
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
  handleScan() {
    my.scan({
      type: 'qr',
      success: (res) => {
        // AI意図予測
        this.predictIntent(res.code);
      }
    });
  },
  
  // AI意図予測
  async predictIntent(scanData) {
    try {
      const prediction = await this.callAIService({
        action: 'PREDICT_INTENT',
        data: scanData
      });
      
      // 適切な画面へ遷移
      if (prediction.intent === 'GIFT_SETUP') {
        my.navigateTo({
          url: `/pages/gift-receipt/index?data=${scanData}`
        });
      } else if (prediction.intent === 'TRACKING') {
        my.navigateTo({
          url: `/pages/waybill-preview/index?hash=${scanData}`
        });
      }
    } catch (error) {
      my.showToast({
        content: 'スキャンデータの解析に失敗しました',
        type: 'fail'
      });
    }
  },
  
  // 住所検索へ遷移
  handleSearchAddress() {
    my.navigateTo({
      url: '/pages/address-search/index'
    });
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

## まとめ / Summary

### Alipay Mini Program固有の特徴 / Alipay-Specific Features

1. **Ant Design Mini**: UIコンポーネント
2. **Alipay SDK**: スキャン、決済機能
3. **芝麻信用**: 信用スコア連携
4. **Alipayブルー**: ブランドカラー (#1677FF)

### 実装のポイント / Implementation Points

- **AXML/ACSS/JS**: Alipay Mini Programの標準技術スタック
- **my API**: Alipay固有API（my.scan, my.navigateTo等）
- **認知負荷削減**: アイコン+短いラベル
- **一画面一アクション**: 画面内分岐を減らす

### 破綻しない設計 / Failure-Proof Design

- **PID照合**: 選択時に自動実行
- **互換性チェック**: 事前に配送可否判定
- **期限管理**: 自動通知とキャンセル
- **失効の伝播**: 3層からの即座な排除

---

## 関連ドキュメント / Related Documents

- [UI/UX Design (共通)](../../UI-UX-DESIGN.md)
- [Screen Structure](./SCREEN-STRUCTURE.md)
- [UX Flow](./UX-FLOW.md)
- [AI Capabilities](./AI-CAPABILITIES.md)

---

## ライセンス / License

MIT License
