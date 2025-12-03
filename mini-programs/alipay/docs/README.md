# Alipay Mini-Program Documentation

## 概要 / Overview

Alipay（支付宝）ミニプログラム用のVEY住所・配送システムSDKです。

This is the VEY Address and Shipping System SDK for Alipay Mini-Programs.

## 🚀 クイックスタート / Quick Start

### インストール / Installation

```bash
npm install @vey/mini-alipay
```

### 初期化 / Initialization

```typescript
import { initAlipay } from '@vey/mini-alipay';

// app.js or app.ts
App({
  onLaunch() {
    initAlipay({
      appId: 'your-alipay-appid',
      apiBaseUrl: 'https://api.vey.example.com',
    });
  }
});
```

## 📦 主要機能 / Key Features

### 1. 配送サービス / Shipping Service

```typescript
import { AlipayShippingService } from '@vey/mini-alipay';

const shippingService = new AlipayShippingService('https://api.vey.example.com');

// 配送バリデーション
const validation = await shippingService.validateShipment({
  recipientPID: 'CN-11-01-T07-B12-BN02-R342',
  items: [{ name: '化妆品', quantity: 2, weight: 0.5 }],
  carrier: 'SF_EXPRESS',
});

// 集荷依頼
const order = await shippingService.createPickup(formData);

// 追跡
const tracking = await shippingService.trackShipment(waybillNumber);

// QRコードスキャンして追跡
const tracking = await shippingService.scanAndTrack();

// 芝麻信用チェック（Alipay固有）
const creditScore = await shippingService.checkSesameCredit();
```

### 2. 住所帳サービス / Address Book Service

```typescript
import { AlipayAddressBookService } from '@vey/mini-alipay';

const addressBook = new AlipayAddressBookService('https://api.vey.example.com');

// 住所一覧取得
const addresses = await addressBook.getAddresses();

// Alipay ネイティブアドレスピッカー使用
const address = await addressBook.pickFromNative();

// Alipay 認証済み住所取得
const authAddress = await addressBook.getAuthorizedAddress();

// 住所追加
const newAddress = await addressBook.addAddress({
  recipientName: '张三',
  phoneNumber: '138-0000-0000',
  countryCode: 'CN',
  // ...
});

// Alipay経由で共有
await addressBook.shareViaAlipay(pid);
```

### 3. Alipay API ユーティリティ

```typescript
import {
  loginAlipay,
  getAlipayUserInfo,
  payWithAlipay,
  navigateToPage,
  storage,
  getSesameCredit,
} from '@vey/mini-alipay';

// ログイン
const authCode = await loginAlipay();

// ユーザー情報取得
const userInfo = await getAlipayUserInfo();

// Alipay決済
const paid = await payWithAlipay(tradeNo);

// 芝麻信用取得（Alipay固有）
const creditScore = await getSesameCredit();

// ページ遷移
navigateToPage('/pages/shipping/shipping');

// ストレージ
storage.set('user', userData);
const user = storage.get('user');
```

### 4. Alipay UI ユーティリティ

```typescript
import {
  AlipayTheme,
  showSuccess,
  showError,
  confirm,
  showActionSheet,
  copyToClipboard,
  getLocation,
  openScan,
} from '@vey/mini-alipay';

// 成功メッセージ
showSuccess('取件请求已完成');

// エラーメッセージ
showError('地址添加失败');

// 確認ダイアログ
const confirmed = await confirm('确认', '是否删除此地址？');

// アクションシート
const index = await showActionSheet(['编辑', '删除', '取消']);

// クリップボードにコピー
await copyToClipboard(waybillNumber);

// 位置情報取得（Alipay固有）
const location = await getLocation();

// スキャン
const qrCode = await openScan();
```

## 🎨 Alipay Design System

このSDKは、Alipayの公式デザインシステム（Ant Design Mini）に準拠しています。

### カラーパレット

```typescript
import { AlipayTheme } from '@vey/mini-alipay';

// Ant Design Blue
AlipayTheme.primary // '#1677FF'
AlipayTheme.success // '#52C41A'
AlipayTheme.warning // '#FAAD14'
AlipayTheme.error   // '#FF4D4F'
```

## 🔧 コンポーネント / Components

### Address Picker

```typescript
import { AddressPickerComponent } from '@vey/mini-alipay';

const picker = new AddressPickerComponent({
  onSelect: (address) => {
    console.log('Selected:', address);
  },
  onCancel: () => {
    console.log('Cancelled');
  },
});

await picker.loadAddresses();

// Alipayネイティブピッカー使用
const nativeAddress = await picker.useNativePicker();
```

### QR Display

```typescript
import { QRDisplayComponent } from '@vey/mini-alipay';

const qrDisplay = new QRDisplayComponent({
  waybillNumber: 'SF1234567890',
  pickupId: 'PICKUP123',
  secret: 'your-secret-key',
});

// 保存
await qrDisplay.saveToAlbum();

// 共有
qrDisplay.shareQRCode();

// 運送状番号コピー
await qrDisplay.copyWaybillNumber();
```

## 🔐 Alipay固有機能 / Alipay-Specific Features

### Alipay決済統合

```typescript
import { payWithAlipay } from '@vey/mini-alipay';

// バックエンドでトレード番号を取得後
const success = await payWithAlipay('2024123112345678');
if (success) {
  console.log('支払い成功');
} else {
  console.log('支払いキャンセル');
}
```

### 芝麻信用（Sesame Credit）統合

```typescript
import { getSesameCredit } from '@vey/mini-alipay';

// ユーザーの芝麻信用スコアを取得
const creditScore = await getSesameCredit();
if (creditScore && creditScore > 600) {
  // 高信用ユーザー向けの特典を提供
  console.log('高信用用户，享受免运费');
}
```

### Alipay住所API

```typescript
import { AlipayAddressBookService } from '@vey/mini-alipay';

const addressBook = new AlipayAddressBookService(apiUrl);

// Alipay認証済み住所を使用
const address = await addressBook.getAuthorizedAddress();
```

### 位置情報サービス

```typescript
import { getLocation, chooseLocation } from '@vey/mini-alipay';

// 現在位置取得
const location = await getLocation();
console.log(`緯度: ${location.latitude}, 経度: ${location.longitude}`);

// 地図から位置選択
const selectedLocation = await chooseLocation();
```

## 📱 ベストプラクティス / Best Practices

### 1. エラーハンドリング

```typescript
try {
  const order = await shippingService.createPickup(data);
} catch (error) {
  showError(error.message || '取件请求失败');
  console.error('Shipping error:', error);
}
```

### 2. ローディング状態

```typescript
import { showLoading, hideLoading } from '@vey/mini-alipay';

showLoading('加载中...');
try {
  const data = await fetchData();
  hideLoading();
} catch (error) {
  hideLoading();
  showError('加载失败');
}
```

### 3. パフォーマンス最適化

- データをローカルストレージにキャッシュ
- 頻繁なAPI呼び出しを避ける
- 画像を適切に圧縮
- Alipayクラウド機能を活用

### 4. ユーザープライバシー

- 位置情報の使用目的を明示
- ユーザーの同意を得る
- 必要最小限のデータのみ収集

## 🌟 Alipay限定機能

### 芝麻信用による信用スコアリング

```typescript
const creditScore = await getSesameCredit();
if (creditScore) {
  // 信用スコアに基づいた配送オプション
  if (creditScore > 700) {
    // プレミアム配送無料
  } else if (creditScore > 600) {
    // 標準配送無料
  }
}
```

### Alipay生活号統合

Alipay生活号（公式アカウント）と統合して、ユーザーにプッシュ通知を送信可能。

## 🔗 関連リンク / Related Links

- [Alipay Mini-Program 開発ドキュメント](https://opendocs.alipay.com/mini/developer)
- [Ant Design Mini](https://mini.ant.design/)
- [VEY Common Module](../common/docs/README.md)

## 📝 ライセンス / License

MIT License
