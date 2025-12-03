# WeChat Mini-Program Documentation

## 概要 / Overview

WeChat（微信）ミニプログラム用のVEY住所・配送システムSDKです。

This is the VEY Address and Shipping System SDK for WeChat Mini-Programs.

## 🚀 クイックスタート / Quick Start

### インストール / Installation

```bash
npm install @vey/mini-wechat
```

### 初期化 / Initialization

```typescript
import { initWeChat } from '@vey/mini-wechat';

// app.js or app.ts
App({
  onLaunch() {
    initWeChat({
      appId: 'your-wechat-appid',
      apiBaseUrl: 'https://api.vey.example.com',
    });
  }
});
```

## 📦 主要機能 / Key Features

### 1. 配送サービス / Shipping Service

```typescript
import { WeChatShippingService } from '@vey/mini-wechat';

const shippingService = new WeChatShippingService('https://api.vey.example.com');

// 配送バリデーション
const validation = await shippingService.validateShipment({
  recipientPID: 'JP-13-113-01-T07-B12-BN02-R342',
  items: [{ name: '化粧品', quantity: 2, weight: 0.5 }],
  carrier: 'SF_EXPRESS',
});

// 集荷依頼
const order = await shippingService.createPickup(formData);

// 追跡
const tracking = await shippingService.trackShipment(waybillNumber);

// QRコードスキャンして追跡
const tracking = await shippingService.scanAndTrack();
```

### 2. 住所帳サービス / Address Book Service

```typescript
import { WeChatAddressBookService } from '@vey/mini-wechat';

const addressBook = new WeChatAddressBookService('https://api.vey.example.com');

// 住所一覧取得
const addresses = await addressBook.getAddresses();

// WeChat ネイティブアドレスピッカー使用
const address = await addressBook.pickFromNative();

// 住所追加
const newAddress = await addressBook.addAddress({
  recipientName: '山田太郎',
  phoneNumber: '090-1234-5678',
  countryCode: 'JP',
  // ...
});

// WeChat経由で共有
await addressBook.shareViaWeChat(pid);
```

### 3. WeChat API ユーティリティ

```typescript
import {
  loginWeChat,
  getWeChatUserInfo,
  payWithWeChat,
  navigateToPage,
  storage,
} from '@vey/mini-wechat';

// ログイン
const code = await loginWeChat();

// ユーザー情報取得
const userInfo = await getWeChatUserInfo();

// WeChat Pay決済
const paid = await payWithWeChat(paymentParams);

// ページ遷移
navigateToPage('/pages/shipping/shipping');

// ストレージ
storage.set('user', userData);
const user = storage.get('user');
```

### 4. WeChat UI ユーティリティ

```typescript
import {
  WeChatTheme,
  showSuccess,
  showError,
  confirm,
  showActionSheet,
  copyToClipboard,
} from '@vey/mini-wechat';

// 成功メッセージ
showSuccess('集荷依頼が完了しました');

// エラーメッセージ
showError('住所の追加に失敗しました');

// 確認ダイアログ
const confirmed = await confirm('確認', 'この住所を削除しますか？');

// アクションシート
const index = await showActionSheet(['編集', '削除', 'キャンセル']);

// クリップボードにコピー
await copyToClipboard(waybillNumber);
```

## 🎨 WeChat Design System

このSDKは、WeChatの公式デザインシステム（WeUI）に準拠しています。

### カラーパレット

```typescript
import { WeChatTheme } from '@vey/mini-wechat';

// WeChat Green
WeChatTheme.primary // '#07C160'
WeChatTheme.success // '#07C160'
WeChatTheme.warning // '#FFC300'
WeChatTheme.error   // '#FA5151'
```

## 🔧 コンポーネント / Components

### Address Picker

```typescript
import { AddressPickerComponent } from '@vey/mini-wechat';

const picker = new AddressPickerComponent({
  onSelect: (address) => {
    console.log('Selected:', address);
  },
  onCancel: () => {
    console.log('Cancelled');
  },
});

await picker.loadAddresses();
```

### QR Display

```typescript
import { QRDisplayComponent } from '@vey/mini-wechat';

const qrDisplay = new QRDisplayComponent({
  waybillNumber: 'SF1234567890',
  pickupId: 'PICKUP123',
  secret: 'your-secret-key',
});

// 保存
await qrDisplay.saveToAlbum();

// 共有
qrDisplay.shareQRCode();
```

## 🔐 WeChat固有機能 / WeChat-Specific Features

### WeChat Pay統合

```typescript
import { payWithWeChat } from '@vey/mini-wechat';

const paymentParams = {
  timeStamp: '1234567890',
  nonceStr: 'abc123',
  package: 'prepay_id=xxx',
  signType: 'MD5',
  paySign: 'signature',
};

const success = await payWithWeChat(paymentParams);
```

### WeChat友達共有

```typescript
// Page.js
Page({
  onShareAppMessage() {
    return {
      title: '住所を共有',
      path: '/pages/address/share?pid=xxx',
      imageUrl: '/images/share-icon.png',
    };
  }
});
```

## 📱 ベストプラクティス / Best Practices

### 1. エラーハンドリング

```typescript
try {
  const order = await shippingService.createPickup(data);
} catch (error) {
  showError(error.message || '集荷依頼に失敗しました');
  console.error('Shipping error:', error);
}
```

### 2. ローディング状態

```typescript
import { showLoading, hideLoading } from '@vey/mini-wechat';

showLoading('読み込み中...');
try {
  const data = await fetchData();
  hideLoading();
} catch (error) {
  hideLoading();
  showError('読み込みに失敗しました');
}
```

### 3. パフォーマンス最適化

- データをローカルストレージにキャッシュ
- 頻繁なAPI呼び出しを避ける
- 画像を適切に圧縮

## 🔗 関連リンク / Related Links

- [WeChat Mini-Program 開発ドキュメント](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [WeUI デザインガイド](https://weui.io/)
- [VEY Common Module](../common/docs/README.md)

## 📝 ライセンス / License

MIT License
