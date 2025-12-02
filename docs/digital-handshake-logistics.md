# Digital Handshake Logistics（デジタル・ハンドシェイク物流）

## 概要 / Overview

Digital Handshake Logistics は、配送業者（SF Express、JD Logistics等）の法人直契約APIを活用し、ユーザーとクーリエが対面した瞬間にQR/NFCで情報の整合性を100%保証する物流システムです。

Digital Handshake Logistics is a logistics system that uses direct corporate contract APIs with carriers (SF Express, JD Logistics, etc.) and guarantees 100% information integrity through QR/NFC when users and couriers meet face-to-face.

---

## 目次 / Table of Contents

1. [システムコンセプト](#1-システムコンセプト)
2. [強化版ユーザーフロー](#2-強化版ユーザーフロー)
3. [技術スタック](#3-技術スタック)
4. [配送業者統合](#4-配送業者統合)
5. [QR/NFCハンドシェイクプロトコル](#5-qrnfcハンドシェイクプロトコル)
6. [住所標準化エンジン](#6-住所標準化エンジン)
7. [コミュニティ物流機能](#7-コミュニティ物流機能)
8. [クロスボーダー・ソーシャルコマース（Daigou 2.0）](#8-クロスボーダーソーシャルコマースdaigou-20)
9. [Taro.js統合](#9-tarojs統合)

---

## 1. システムコンセプト

### 1.1 デジタル・ハンドシェイクとは

**定義**: ユーザーとクーリエの対面時に、QR/NFCを用いて配送情報の整合性を保証し、責任の所在を明確にする技術プロトコル

**目的**:
- 口頭説明や手書きによるミスをゼロにする
- 「渡した」「受け取ってない」の水掛け論を技術的に排除
- 配送品質を最大化し、トラブルを未然に防止

### 1.2 従来の配送との違い

| 項目 | 従来の配送 | Digital Handshake Logistics |
|------|-----------|----------------------------|
| 住所入力 | クーリエが手入力または読み上げ | アプリからAPI経由で自動入力 |
| 集荷確認 | 口頭確認 | QR/NFCスキャンで電子確認 |
| データ精度 | 人的ミスあり | 100%データ整合性保証 |
| 責任移転 | 曖昧 | デジタル署名で明確化 |
| 追跡 | 配送業者サイト | 自社アプリ内で統合追跡 |

### 1.3 主要な価値提供

1. **ユーザー体験**: クラウド住所録から選ぶだけ、QRを見せるだけで完了
2. **配送品質**: 住所不備による返送をゼロに
3. **透明性**: すべての配送ステータスをリアルタイム追跡
4. **信頼性**: 不正配達を技術的に防止

---

## 2. 強化版ユーザーフロー

### 2.1 Draft & Selection（下書き・選択）

**アクション**: ユーザーはTaroアプリでクラウド住所録から送付先を選択

```typescript
// ユーザーが住所を選択
const selectedAddress = await addressBook.selectAddress('friend-pid-123');

// 商品情報を入力
const shipment = {
  recipient: selectedAddress,
  items: [
    { name: '化粧品', quantity: 2, weight: 0.5 },
    { name: '衣類', quantity: 1, weight: 0.8 }
  ],
  preferredCarrier: 'SF_EXPRESS'
};
```

**事前検証（Pre-Validation）**:

```typescript
// 配送業者APIで事前チェック
const validation = await carrier.validateShipment({
  address: selectedAddress,
  items: shipment.items
});

if (!validation.deliverable) {
  // 「この住所は配送不可エリアです」
  showError(validation.reason);
  return;
}

if (validation.prohibitedItems.length > 0) {
  // 「化粧品は航空便では送れません」
  showError(`禁制品: ${validation.prohibitedItems.join(', ')}`);
  return;
}
```

**メリット**: クーリエが来てから「送れません」と言われるトラブルをゼロに

### 2.2 Order Generation（正規API発注）

**アクション**: ユーザーが「集荷を呼ぶ」ボタンを押す

```typescript
// SF Express/JD Logistics APIへ正式発注
const order = await carrier.createPickupOrder({
  shipment: shipment,
  pickupTime: 'ASAP', // または指定時間
  paymentMethod: 'SENDER_PAY'
});

// 結果: 正規の運送状番号を取得
console.log(order.waybillNumber); // "SF1234567890"
```

**ユーザー画面**: 「集荷待ちQRコード」を表示

```typescript
// QRコード生成（兼NFCトークン）
const handshakeToken = generateHandshakeToken({
  waybillNumber: order.waybillNumber,
  pickupId: order.pickupId,
  timestamp: Date.now(),
  signature: sign(order, userPrivateKey)
});

// QRコード表示
showQRCode(handshakeToken);
```

### 2.3 Handover（デジタル・ハンドシェイク）

**これが最大の独自ポイント**

#### ステップ1: Identification（本人確認）

クーリエが到着し、ユーザーは荷物を見せる（法的に中身確認が必要）

#### ステップ2: Digital Inject（情報の注入）

```typescript
// ユーザーがQRコードを提示
// またはNFCでクーリエ端末にタッチ

// クーリエ端末側の処理
const scannedToken = await courierDevice.scanQR();

// トークンを検証し、運送状データを取得
const orderData = await carrier.verifyHandshakeToken(scannedToken);

if (orderData.valid) {
  // 事前にAPI発行されていたデータが端末に読み込まれる
  courierDevice.loadOrderData(orderData);
}
```

**仕組み**: これにより、運送状データがクーリエの端末に瞬時に呼び出される

#### ステップ3: Quality Check（品質担保）

```typescript
// クーリエが端末で「確認完了」操作
await courierDevice.confirmPickup({
  waybillNumber: orderData.waybillNumber,
  actualItems: scanedItems,
  courierSignature: courierDevice.getSignature()
});

// ユーザーアプリにリアルタイム通知
userApp.receiveNotification({
  type: 'PICKUP_CONFIRMED',
  message: '受け渡し完了（責任移転済み）',
  timestamp: Date.now(),
  courierInfo: {
    name: 'Wang Courier',
    employeeId: 'SF-12345'
  }
});
```

**重要**: これが「デジタル・ハンドシェイク」- 責任移転が技術的に記録される

### 2.4 Labeling（その場でラベル発行）

```typescript
// クーリエは腰のポータブルプリンターからラベル出力
courierDevice.printLabel({
  waybillNumber: orderData.waybillNumber,
  sender: orderData.sender,
  recipient: orderData.recipient,
  barcode: orderData.barcode
});
```

**コントロール**: データは自社アプリからAPI経由で流し込んだため、入力ミスは100%発生しない

### 2.5 Tracking（自社アプリ内追跡）

```typescript
// 配送業者からWebhookで詳細ステータスを受信
app.on('carrier-webhook', (event) => {
  switch (event.status) {
    case 'PICKED_UP':
      notifyUser('荷物が集荷されました');
      break;
    case 'IN_TRANSIT':
      notifyUser(`輸送中: ${event.location}`);
      break;
    case 'OUT_FOR_DELIVERY':
      notifyUser('配達員が配達に向かっています');
      break;
    case 'DELIVERED':
      notifyUser('配達完了');
      break;
  }
});
```

### 2.6 Reception（NFC/QR着荷証明）

```typescript
// 受取人のアプリに通知
recipientApp.receiveNotification({
  type: 'OUT_FOR_DELIVERY',
  eta: '30分以内'
});

// 受取人がQRコードを表示
const receptionToken = generateReceptionToken({
  waybillNumber: order.waybillNumber,
  recipientDID: recipient.did
});

// クーリエがスキャン
courierDevice.scanReceptionQR(receptionToken);

// これが電子署名代わり - 配達完了
await carrier.confirmDelivery({
  waybillNumber: order.waybillNumber,
  receptionToken: receptionToken,
  signature: courierDevice.getSignature()
});
```

---

## 3. 技術スタック

### 3.1 Frontend（Taro.js）

**プラットフォーム**: WeChat/Alipay ミニプログラム、iOS/Android アプリ、デスクトップアプリ

**主要機能**:

```typescript
// QR/NFCハードウェアアクセス
import Taro from '@tarojs/taro';

// QRスキャン
const scanQR = async () => {
  const result = await Taro.scanCode({
    scanType: ['qrCode']
  });
  return result.result;
};

// NFC読み取り
const readNFC = async () => {
  const nfcAdapter = Taro.getNFCAdapter();
  nfcAdapter.startDiscovery({
    success: () => {
      nfcAdapter.onDiscovered((res) => {
        console.log('NFC Tag:', res);
      });
    }
  });
};

// オフライン対応
const cacheAddress = async (address) => {
  await Taro.setStorage({
    key: 'cached-addresses',
    data: address
  });
};
```

### 3.2 Backend（Logistics Core）

**アーキテクチャ**: マイクロサービス型

```typescript
// Carrier Adapter Interface
interface CarrierAdapter {
  validateShipment(shipment: Shipment): Promise<ValidationResult>;
  createPickupOrder(order: PickupOrder): Promise<OrderResult>;
  trackShipment(waybillNumber: string): Promise<TrackingInfo>;
  cancelOrder(waybillNumber: string): Promise<CancelResult>;
}

// SF Express Adapter
class SFExpressAdapter implements CarrierAdapter {
  private apiEndpoint = 'https://sfapi.sf-express.com/std/service';
  private apiKey: string;
  
  async validateShipment(shipment: Shipment): Promise<ValidationResult> {
    // SF Express API呼び出し
    const response = await this.callAPI('validateAddress', {
      address: shipment.recipient.address
    });
    
    return {
      deliverable: response.deliverable,
      prohibitedItems: response.prohibitedItems,
      estimatedCost: response.estimatedCost
    };
  }
  
  async createPickupOrder(order: PickupOrder): Promise<OrderResult> {
    const response = await this.callAPI('createOrder', {
      consignee: order.recipient,
      cargo: order.items,
      pickupTime: order.pickupTime
    });
    
    return {
      waybillNumber: response.waybillNo,
      pickupId: response.orderId,
      estimatedPickupTime: response.pickupTime
    };
  }
}

// JD Logistics Adapter
class JDLogisticsAdapter implements CarrierAdapter {
  // 同様の実装
}
```

### 3.3 Address Standardization Engine

**目的**: ユーザー入力の「あいまいな住所」を配送業者の4級住所（省/市/区/街道）に正規化

```typescript
class AddressStandardizationEngine {
  async normalize(rawAddress: string, countryCode: string): Promise<NormalizedAddress> {
    // 1. 国別の住所パーサーを選択
    const parser = this.getParser(countryCode);
    
    // 2. 住所を構造化
    const parsed = await parser.parse(rawAddress);
    
    // 3. 配送業者マスターデータと照合
    const matched = await this.matchWithCarrierData(parsed, countryCode);
    
    // 4. 正規化された住所を返す
    return {
      country: countryCode,
      province: matched.admin1,
      city: matched.admin2,
      district: matched.admin3,
      street: matched.street,
      building: matched.building,
      unit: matched.unit,
      postalCode: matched.postalCode,
      standardized: true,
      confidence: matched.confidence
    };
  }
  
  // 中国住所の4級標準化
  private async normalizeChinaAddress(address: string): Promise<ChinaAddress> {
    // 省/市/区/街道 の階層構造に分解
    const hierarchy = await this.parseChinaHierarchy(address);
    
    // SF Express/JD Logistics のマスターデータと照合
    const verified = await this.verifyWithCarrierMaster(hierarchy);
    
    return verified;
  }
}
```

---

## 4. 配送業者統合

### 4.1 SF Express（順豊速運）統合

**概要**: 中国で最も品質が高く、APIも整備されている配送業者

**API エンドポイント**:
- サンドボックス: `https://sfapi-sbox.sf-express.com/std/service`
- 本番: `https://sfapi.sf-express.com/std/service`

**主要API**:

```typescript
interface SFExpressAPI {
  // 1. 配送可能性チェック
  validateAddress(params: {
    destCode: string;      // 目的地コード
    destAddress: string;   // 詳細住所
  }): Promise<{
    deliverable: boolean;
    reason?: string;
  }>;
  
  // 2. 運賃見積もり
  getQuote(params: {
    origCode: string;      // 発送地コード
    destCode: string;      // 目的地コード
    weight: number;        // 重量（kg）
    paymentMethod: string; // 支払方法
  }): Promise<{
    fee: number;
    currency: string;
  }>;
  
  // 3. 集荷依頼
  createOrder(params: {
    orderId: string;       // 注文番号
    consignee: Consignee;  // 受取人情報
    cargo: Cargo[];        // 荷物情報
    expressType: string;   // 配送タイプ
  }): Promise<{
    waybillNo: string;     // 運送状番号
    orderId: string;       // 注文番号
    filterResult: number;  // フィルター結果
  }>;
  
  // 4. 追跡
  track(params: {
    waybillNo: string;     // 運送状番号
  }): Promise<{
    routes: Route[];       // 配送ルート
  }>;
  
  // 5. キャンセル
  cancelOrder(params: {
    orderId: string;       // 注文番号
    waybillNo: string;     // 運送状番号
  }): Promise<{
    success: boolean;
  }>;
}
```

**認証方式**:

```typescript
// MD5署名認証
function generateSFSignature(params: any, secretKey: string): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const signString = sortedParams + secretKey;
  return md5(signString).toUpperCase();
}
```

### 4.2 JD Logistics（京東物流）統合

**概要**: eコマース物流に強く、APIレスポンスが良好

**API エンドポイント**:
- 本番: `https://api.jdl.com/`

**主要API**:

```typescript
interface JDLogisticsAPI {
  // 1. サービス確認
  checkService(params: {
    senderCity: string;
    receiverCity: string;
    productType: string;
  }): Promise<{
    available: boolean;
    serviceCode: string;
  }>;
  
  // 2. 注文作成
  createOrder(params: {
    customerCode: string;
    sender: Address;
    receiver: Address;
    goods: Goods[];
  }): Promise<{
    waybillCode: string;
    orderId: string;
  }>;
  
  // 3. 追跡
  queryTrack(params: {
    waybillCode: string;
  }): Promise<{
    tracks: Track[];
  }>;
}
```

---

## 5. QR/NFCハンドシェイクプロトコル

### 5.1 ハンドシェイクトークン構造

```typescript
interface HandshakeToken {
  version: string;           // プロトコルバージョン
  type: 'PICKUP' | 'DELIVERY'; // トークンタイプ
  waybillNumber: string;     // 運送状番号
  orderId: string;           // 注文ID
  timestamp: number;         // タイムスタンプ
  expiresAt: number;         // 有効期限
  signature: string;         // デジタル署名
  nonce: string;             // ワンタイムトークン
}

// トークン生成
function generateHandshakeToken(order: Order): string {
  const token: HandshakeToken = {
    version: '1.0',
    type: 'PICKUP',
    waybillNumber: order.waybillNumber,
    orderId: order.orderId,
    timestamp: Date.now(),
    expiresAt: Date.now() + 3600000, // 1時間有効
    nonce: generateNonce(),
    signature: '' // 後で署名
  };
  
  // 署名を生成
  token.signature = signToken(token, privateKey);
  
  // QRコード用にエンコード
  return base64Encode(JSON.stringify(token));
}

// トークン検証
function verifyHandshakeToken(tokenString: string): TokenVerification {
  try {
    const token = JSON.parse(base64Decode(tokenString));
    
    // 1. 有効期限チェック
    if (Date.now() > token.expiresAt) {
      return { valid: false, reason: 'TOKEN_EXPIRED' };
    }
    
    // 2. 署名検証
    const isValidSignature = verifySignature(token, publicKey);
    if (!isValidSignature) {
      return { valid: false, reason: 'INVALID_SIGNATURE' };
    }
    
    // 3. Nonceの一意性確認（リプレイ攻撃防止）
    if (isNonceUsed(token.nonce)) {
      return { valid: false, reason: 'NONCE_REUSED' };
    }
    
    markNonceAsUsed(token.nonce);
    
    return { valid: true, token };
  } catch (error) {
    return { valid: false, reason: 'INVALID_TOKEN' };
  }
}
```

### 5.2 NFCプロトコル

```typescript
// NFC Data Exchange Format (NDEF)
interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFRecord {
  recordType: 'text' | 'uri' | 'smart-poster';
  data: any;
}

// Taro.js でのNFC実装
class NFCHandshake {
  private adapter: any;
  
  async initialize() {
    this.adapter = Taro.getNFCAdapter();
  }
  
  async writePickupToken(token: HandshakeToken) {
    await this.adapter.startDiscovery({
      success: async () => {
        this.adapter.onDiscovered(async (res: any) => {
          // NFCタグにトークンを書き込み
          const ndef = this.adapter.getNdef();
          await ndef.writeNdefMessage({
            records: [{
              recordType: 'text',
              data: JSON.stringify(token)
            }]
          });
        });
      }
    });
  }
  
  async readPickupToken(): Promise<HandshakeToken> {
    return new Promise((resolve, reject) => {
      this.adapter.startDiscovery({
        success: () => {
          this.adapter.onDiscovered(async (res: any) => {
            const ndef = this.adapter.getNdef();
            const message = await ndef.readNdefMessage();
            const token = JSON.parse(message.records[0].data);
            resolve(token);
          });
        },
        fail: reject
      });
    });
  }
}
```

---

## 6. 住所標準化エンジン

### 6.1 中国住所の4級階層

```typescript
interface ChinaAddress {
  // 第1級: 省/直轄市/自治区
  province: {
    code: string;    // 例: "11" (北京市)
    name: string;    // 例: "北京市"
  };
  
  // 第2級: 市/区
  city: {
    code: string;    // 例: "01" (市轄区)
    name: string;    // 例: "市轄区"
  };
  
  // 第3級: 区/県
  district: {
    code: string;    // 例: "01" (東城区)
    name: string;    // 例: "東城区"
  };
  
  // 第4級: 街道/郷鎮
  street: {
    code: string;    // 例: "001" (東華門街道)
    name: string;    // 例: "東華門街道"
  };
  
  // 詳細住所
  detail: {
    community: string;  // 小区
    building: string;   // 楼棟
    unit: string;       // 単元
    room: string;       // 室号
  };
  
  // 郵便番号
  postalCode: string;  // 例: "100000"
}
```

### 6.2 住所マッピングフレームワーク（AMF）連携

```typescript
import { normalizeAddress, encodePID } from '@vey/core';

class AddressMapper {
  async mapToCarrierFormat(
    userAddress: any,
    carrier: 'SF_EXPRESS' | 'JD_LOGISTICS'
  ): Promise<CarrierAddress> {
    // 1. AMFで正規化
    const normalized = await normalizeAddress(userAddress, 'CN');
    
    // 2. PID生成
    const pid = encodePID(normalized);
    
    // 3. 配送業者フォーマットに変換
    if (carrier === 'SF_EXPRESS') {
      return this.toSFFormat(normalized);
    } else if (carrier === 'JD_LOGISTICS') {
      return this.toJDFormat(normalized);
    }
  }
  
  private toSFFormat(address: NormalizedAddress): SFAddress {
    return {
      province: address.admin1.name,
      city: address.admin2.name,
      county: address.admin3?.name || '',
      address: `${address.street} ${address.building} ${address.unit}`,
      postalCode: address.postalCode
    };
  }
  
  private toJDFormat(address: NormalizedAddress): JDAddress {
    return {
      provinceId: address.admin1.code,
      cityId: address.admin2.code,
      countyId: address.admin3?.code || '',
      detailAddress: `${address.street} ${address.building} ${address.unit}`,
      zipCode: address.postalCode
    };
  }
}
```

---

## 7. コミュニティ物流機能

### 7.1 ご近所シェア配送（Consolidated Shipping）

**コンセプト**: 同じマンション・オフィスビル内で同時期に発送したい人をマッチング

```typescript
interface ConsolidatedShipment {
  id: string;
  location: {
    pid: string;           // 建物のPID
    building: string;      // 建物名
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  organizer: {
    userId: string;        // 代表者
    name: string;
  };
  participants: Participant[];
  shipments: Shipment[];
  status: 'RECRUITING' | 'READY' | 'PICKED_UP' | 'COMPLETED';
  pickupTime: Date;
  estimatedSavings: number; // 割引額
}

class ConsolidatedShippingService {
  // マッチング検索
  async findNearbyGroups(userLocation: Location): Promise<ConsolidatedShipment[]> {
    // 半径500m以内の募集中グループを検索
    const groups = await this.db.findGroups({
      location: {
        $near: {
          $geometry: userLocation.coordinates,
          $maxDistance: 500
        }
      },
      status: 'RECRUITING',
      pickupTime: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 86400000) // 24時間以内
      }
    });
    
    return groups;
  }
  
  // グループ作成
  async createGroup(organizer: User, location: Location): Promise<ConsolidatedShipment> {
    const group = await this.db.createGroup({
      organizer: {
        userId: organizer.id,
        name: organizer.name
      },
      location: location,
      status: 'RECRUITING',
      participants: [organizer],
      shipments: []
    });
    
    // 近隣ユーザーに通知
    await this.notifyNearbyUsers(location, group);
    
    return group;
  }
  
  // グループ参加
  async joinGroup(groupId: string, user: User, shipment: Shipment): Promise<void> {
    const group = await this.db.findGroup(groupId);
    
    // 参加人数制限チェック
    if (group.participants.length >= 10) {
      throw new Error('グループは満員です');
    }
    
    // グループに追加
    await this.db.updateGroup(groupId, {
      $push: {
        participants: user,
        shipments: shipment
      }
    });
    
    // 割引計算
    const savings = this.calculateSavings(group.shipments.length + 1);
    
    // 参加者全員に通知
    await this.notifyParticipants(group, {
      type: 'NEW_MEMBER',
      message: `${user.name}さんが参加しました。現在の割引額: ¥${savings}`
    });
  }
  
  // 割引計算
  private calculateSavings(participantCount: number): number {
    // 人数に応じた割引率
    const discountRate = Math.min(participantCount * 0.05, 0.3); // 最大30%
    const baseFee = 20; // 基本料金
    return baseFee * discountRate * participantCount;
  }
}
```

### 7.2 「ついでに持って行って」機能（Crowdsourcing Delivery）

**コンセプト**: 同じ方向へ移動するユーザーが荷物を運ぶ「Uberのような物流版」

```typescript
interface CrowdsourcedDelivery {
  id: string;
  package: {
    shipmentId: string;
    weight: number;
    size: 'SMALL' | 'MEDIUM' | 'LARGE';
    fragile: boolean;
  };
  route: {
    from: Location;
    to: Location;
    distance: number;      // km
  };
  timeWindow: {
    pickupBefore: Date;
    deliverBefore: Date;
  };
  compensation: {
    amount: number;        // 報酬額
    currency: string;
    points?: number;       // ポイント
  };
  carrier: {
    userId: string;
    name: string;
    creditScore: number;   // 芝麻信用スコア
    rating: number;        // 評価
  };
  status: 'AVAILABLE' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED';
}

class CrowdsourcingService {
  // 運び手として登録
  async registerAsCarrier(user: User, route: Route, timeWindow: TimeWindow): Promise<void> {
    // Alipay芝麻信用スコアで本人確認
    const creditScore = await this.verifyAlipayCredit(user.alipayId);
    
    if (creditScore < 600) {
      throw new Error('信用スコアが不足しています（最低600点必要）');
    }
    
    await this.db.createCarrierAvailability({
      userId: user.id,
      route: route,
      timeWindow: timeWindow,
      creditScore: creditScore,
      vehicleType: user.vehicleType // 徒歩/自転車/車
    });
  }
  
  // マッチング
  async matchDelivery(delivery: CrowdsourcedDelivery): Promise<User[]> {
    // ルートが一致する運び手を検索
    const carriers = await this.db.findCarriers({
      'route.from': {
        $near: {
          $geometry: delivery.route.from.coordinates,
          $maxDistance: 2000 // 2km以内
        }
      },
      'route.to': {
        $near: {
          $geometry: delivery.route.to.coordinates,
          $maxDistance: 2000
        }
      },
      'timeWindow.start': { $lte: delivery.timeWindow.pickupBefore },
      'timeWindow.end': { $gte: delivery.timeWindow.deliverBefore },
      creditScore: { $gte: 600 }
    });
    
    // 評価順にソート
    return carriers.sort((a, b) => b.rating - a.rating);
  }
  
  // 配達完了・報酬支払い
  async completeDelivery(deliveryId: string, proof: DeliveryProof): Promise<void> {
    const delivery = await this.db.findDelivery(deliveryId);
    
    // QR/NFC受取証明の検証
    const verified = await this.verifyDeliveryProof(proof);
    
    if (!verified) {
      throw new Error('受取証明が無効です');
    }
    
    // 報酬支払い
    await this.paymentService.transfer({
      from: delivery.sender.userId,
      to: delivery.carrier.userId,
      amount: delivery.compensation.amount,
      reason: `配達報酬: ${deliveryId}`
    });
    
    // ポイント付与
    if (delivery.compensation.points) {
      await this.pointsService.award(
        delivery.carrier.userId,
        delivery.compensation.points
      );
    }
    
    // ステータス更新
    await this.db.updateDelivery(deliveryId, {
      status: 'DELIVERED',
      completedAt: new Date()
    });
  }
}
```

---

## 8. クロスボーダー・ソーシャルコマース（Daigou 2.0）

### 8.1 WeChatモーメンツ連携カタログ

**コンセプト**: クラウド住所帳の送信履歴から商品カタログを自動生成

```typescript
interface DaigouCatalog {
  id: string;
  seller: {
    userId: string;
    wechatId: string;
    storeName: string;
  };
  products: Product[];
  shippingHistory: ShippingRecord[];
  autoGenerated: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: {
    amount: number;
    currency: string;
  };
  category: string;
  stock: number;
  frequentlyShipped: boolean; // よく送る商品
}

class DaigouCatalogService {
  // 送信履歴から商品カタログを生成
  async generateCatalog(userId: string): Promise<DaigouCatalog> {
    // 過去の送信履歴を取得
    const shippingHistory = await this.db.getShippingHistory(userId, {
      limit: 100,
      sortBy: 'frequency'
    });
    
    // 商品を抽出・集計
    const productMap = new Map<string, ProductStats>();
    
    for (const shipment of shippingHistory) {
      for (const item of shipment.items) {
        const key = this.normalizeProductName(item.name);
        const stats = productMap.get(key) || { count: 0, images: [] };
        stats.count++;
        if (item.image) stats.images.push(item.image);
        productMap.set(key, stats);
      }
    }
    
    // 頻度の高い商品をカタログ化
    const products = Array.from(productMap.entries())
      .filter(([_, stats]) => stats.count >= 3) // 3回以上送った商品
      .map(([name, stats]) => ({
        id: generateId(),
        name: name,
        description: '',
        images: stats.images.slice(0, 5),
        price: { amount: 0, currency: 'CNY' },
        category: this.categorizeProduct(name),
        stock: 0,
        frequentlyShipped: true
      }));
    
    return {
      id: generateId(),
      seller: await this.getUserInfo(userId),
      products: products,
      shippingHistory: shippingHistory,
      autoGenerated: true
    };
  }
  
  // WeChatモーメンツに投稿
  async postToWeChatMoments(catalog: DaigouCatalog, productId: string): Promise<void> {
    const product = catalog.products.find(p => p.id === productId);
    
    // WeChatミニプログラムカードを生成
    const miniProgramCard = {
      title: product.name,
      path: `/pages/product/detail?id=${productId}&seller=${catalog.seller.wechatId}`,
      thumbUrl: product.images[0],
      description: product.description
    };
    
    // WeChat APIで投稿（実際にはWeChatのシェア機能を使用）
    await this.wechatService.shareToMoments(miniProgramCard);
  }
  
  // ワンタップ注文（住所入力済み）
  async createQuickOrder(productId: string, buyerPID: string): Promise<Order> {
    // 買い手の住所をPIDから取得
    const buyerAddress = await this.addressService.resolveAddress(buyerPID);
    
    // 注文を作成（住所は既に入力済み）
    const order = await this.orderService.createOrder({
      productId: productId,
      buyer: {
        pid: buyerPID,
        address: buyerAddress // 自動入力
      },
      status: 'PENDING_PAYMENT'
    });
    
    return order;
  }
}
```

### 8.2 簡易WMS（在庫管理 × 発送）

**コンセプト**: 自宅在庫を写真管理し、選ぶだけで送り状発行

```typescript
interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  images: string[];
  quantity: number;
  location: {
    room: string;      // 部屋
    shelf: string;     // 棚
    box: string;       // 箱
  };
  purchaseDate: Date;
  expiryDate?: Date;
  notes: string;
}

class SimpleWMS {
  // 在庫追加
  async addInventory(item: InventoryItem, photos: File[]): Promise<void> {
    // 写真をアップロード
    const imageUrls = await this.uploadImages(photos);
    
    item.images = imageUrls;
    
    await this.db.createInventoryItem(item);
  }
  
  // 在庫検索（写真から）
  async searchByImage(photo: File): Promise<InventoryItem[]> {
    // 画像認識で類似商品を検索
    const imageVector = await this.imageRecognition.analyze(photo);
    
    const results = await this.db.searchInventory({
      imageVector: imageVector,
      similarity: { $gte: 0.8 }
    });
    
    return results;
  }
  
  // 発送＆在庫減少
  async shipInventory(
    items: { id: string, quantity: number }[],
    recipientPID: string
  ): Promise<Shipment> {
    // 在庫チェック
    for (const item of items) {
      const inventory = await this.db.getInventoryItem(item.id);
      if (inventory.quantity < item.quantity) {
        throw new Error(`在庫不足: ${inventory.name}`);
      }
    }
    
    // 送り状発行
    const recipientAddress = await this.addressService.resolveAddress(recipientPID);
    
    const shipment = await this.shippingService.createShipment({
      items: items,
      recipient: recipientAddress
    });
    
    // 在庫減少
    for (const item of items) {
      await this.db.updateInventoryItem(item.id, {
        $inc: { quantity: -item.quantity }
      });
      
      // 在庫ログ記録
      await this.db.createInventoryLog({
        itemId: item.id,
        action: 'SHIPPED',
        quantity: -item.quantity,
        shipmentId: shipment.id,
        timestamp: new Date()
      });
    }
    
    return shipment;
  }
  
  // 在庫アラート
  async checkLowStock(): Promise<InventoryItem[]> {
    // 在庫が少ない商品を検索
    const lowStockItems = await this.db.findInventoryItems({
      quantity: { $lte: 5 }
    });
    
    // アラート通知
    if (lowStockItems.length > 0) {
      await this.notificationService.send({
        type: 'LOW_STOCK_ALERT',
        items: lowStockItems,
        message: `${lowStockItems.length}個の商品の在庫が少なくなっています`
      });
    }
    
    return lowStockItems;
  }
}
```

---

## 9. Taro.js統合

### 9.1 Taro.jsアプリケーション構造

```typescript
// app.config.ts
export default {
  pages: [
    'pages/index/index',           // ホーム
    'pages/address/list',          // 住所一覧
    'pages/shipping/create',       // 発送作成
    'pages/shipping/track',        // 追跡
    'pages/community/groups',      // コミュニティ配送
    'pages/crowdsource/carrier',   // 運び手登録
    'pages/daigou/catalog',        // Daigouカタログ
    'pages/inventory/manage'       // 在庫管理
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'Digital Handshake Logistics',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    list: [
      {
        pagePath: 'pages/index/index',
        text: 'ホーム',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home-active.png'
      },
      {
        pagePath: 'pages/shipping/create',
        text: '発送',
        iconPath: 'assets/ship.png',
        selectedIconPath: 'assets/ship-active.png'
      },
      {
        pagePath: 'pages/community/groups',
        text: 'コミュニティ',
        iconPath: 'assets/community.png',
        selectedIconPath: 'assets/community-active.png'
      },
      {
        pagePath: 'pages/inventory/manage',
        text: '在庫',
        iconPath: 'assets/inventory.png',
        selectedIconPath: 'assets/inventory-active.png'
      }
    ]
  }
}
```

### 9.2 発送作成ページ

```typescript
// pages/shipping/create.tsx
import { View, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';

export default function CreateShipping() {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [items, setItems] = useState([]);
  const [carrier, setCarrier] = useState('SF_EXPRESS');
  
  // 住所選択
  const selectAddress = async () => {
    const result = await Taro.navigateTo({
      url: '/pages/address/select'
    });
    setSelectedAddress(result.address);
  };
  
  // 商品追加
  const addItem = () => {
    Taro.navigateTo({
      url: '/pages/shipping/add-item'
    });
  };
  
  // 事前検証
  const validate = async () => {
    Taro.showLoading({ title: '検証中...' });
    
    try {
      const response = await Taro.request({
        url: 'https://api.example.com/shipping/validate',
        method: 'POST',
        data: {
          address: selectedAddress,
          items: items,
          carrier: carrier
        }
      });
      
      Taro.hideLoading();
      
      if (response.data.deliverable) {
        Taro.showToast({
          title: '配送可能です',
          icon: 'success'
        });
        return true;
      } else {
        Taro.showModal({
          title: '配送不可',
          content: response.data.reason,
          showCancel: false
        });
        return false;
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: 'エラーが発生しました',
        icon: 'error'
      });
      return false;
    }
  };
  
  // 集荷依頼
  const createPickup = async () => {
    // 事前検証
    const isValid = await validate();
    if (!isValid) return;
    
    Taro.showLoading({ title: '集荷依頼中...' });
    
    try {
      const response = await Taro.request({
        url: 'https://api.example.com/shipping/create',
        method: 'POST',
        data: {
          address: selectedAddress,
          items: items,
          carrier: carrier
        }
      });
      
      Taro.hideLoading();
      
      // 集荷待ちQRコードを表示
      Taro.navigateTo({
        url: `/pages/shipping/qr?token=${response.data.handshakeToken}`
      });
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: '集荷依頼に失敗しました',
        icon: 'error'
      });
    }
  };
  
  return (
    <View className="create-shipping">
      <View className="section">
        <Text className="title">配送先</Text>
        <Button onClick={selectAddress}>
          {selectedAddress ? selectedAddress.name : '住所を選択'}
        </Button>
      </View>
      
      <View className="section">
        <Text className="title">商品</Text>
        {items.map((item, index) => (
          <View key={index} className="item">
            <Text>{item.name} × {item.quantity}</Text>
          </View>
        ))}
        <Button onClick={addItem}>商品を追加</Button>
      </View>
      
      <View className="section">
        <Text className="title">配送業者</Text>
        <Picker
          mode="selector"
          range={['SF Express', 'JD Logistics']}
          value={carrier === 'SF_EXPRESS' ? 0 : 1}
          onChange={(e) => setCarrier(e.detail.value === 0 ? 'SF_EXPRESS' : 'JD_LOGISTICS')}
        >
          <View className="picker">
            {carrier === 'SF_EXPRESS' ? 'SF Express' : 'JD Logistics'}
          </View>
        </Picker>
      </View>
      
      <Button className="primary" onClick={createPickup}>
        集荷を呼ぶ
      </Button>
    </View>
  );
}
```

### 9.3 QRコード表示ページ

```typescript
// pages/shipping/qr.tsx
import { View, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function ShippingQR() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('WAITING');
  
  useEffect(() => {
    // URLパラメータからトークンを取得
    const params = Taro.getCurrentInstance().router?.params;
    const handshakeToken = params?.token;
    
    if (handshakeToken) {
      setToken(handshakeToken);
      generateQRCode(handshakeToken);
      
      // ステータス監視
      startStatusPolling(handshakeToken);
    }
  }, []);
  
  const generateQRCode = async (token: string) => {
    try {
      const url = await QRCode.toDataURL(token);
      setQrCodeUrl(url);
    } catch (error) {
      console.error('QRコード生成エラー:', error);
    }
  };
  
  const startStatusPolling = (token: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await Taro.request({
          url: `https://api.example.com/shipping/status?token=${token}`
        });
        
        setStatus(response.data.status);
        
        if (response.data.status === 'PICKED_UP') {
          clearInterval(interval);
          
          // 集荷完了通知
          Taro.showModal({
            title: '集荷完了',
            content: '荷物が集荷されました',
            showCancel: false,
            success: () => {
              Taro.navigateBack();
            }
          });
        }
      } catch (error) {
        console.error('ステータス取得エラー:', error);
      }
    }, 5000); // 5秒ごとにポーリング
  };
  
  // NFCで共有
  const shareViaNFC = async () => {
    try {
      const nfcAdapter = Taro.getNFCAdapter();
      await nfcAdapter.startDiscovery();
      
      nfcAdapter.onDiscovered(async () => {
        const ndef = nfcAdapter.getNdef();
        await ndef.writeNdefMessage({
          records: [{
            recordType: 'text',
            data: token
          }]
        });
        
        Taro.showToast({
          title: 'NFC書き込み完了',
          icon: 'success'
        });
      });
    } catch (error) {
      Taro.showToast({
        title: 'NFC非対応端末です',
        icon: 'error'
      });
    }
  };
  
  return (
    <View className="shipping-qr">
      <View className="status">
        {status === 'WAITING' && '集荷待ち...'}
        {status === 'PICKED_UP' && '集荷完了！'}
      </View>
      
      <View className="qr-container">
        {qrCodeUrl && (
          <Image src={qrCodeUrl} mode="widthFix" className="qr-code" />
        )}
      </View>
      
      <View className="instructions">
        <Text>クーリエにこのQRコードを見せてください</Text>
      </View>
      
      <Button onClick={shareViaNFC}>NFCで共有</Button>
    </View>
  );
}
```

### 9.4 オフライン対応

```typescript
// utils/offline-storage.ts
import Taro from '@tarojs/taro';

class OfflineStorage {
  // 住所をキャッシュ
  async cacheAddresses(addresses: Address[]) {
    try {
      await Taro.setStorage({
        key: 'cached-addresses',
        data: addresses
      });
    } catch (error) {
      console.error('キャッシュ失敗:', error);
    }
  }
  
  // キャッシュから読み込み
  async getCachedAddresses(): Promise<Address[]> {
    try {
      const result = await Taro.getStorage({
        key: 'cached-addresses'
      });
      return result.data || [];
    } catch (error) {
      return [];
    }
  }
  
  // 下書きを保存
  async saveDraft(draft: ShipmentDraft) {
    const drafts = await this.getDrafts();
    drafts.push(draft);
    
    await Taro.setStorage({
      key: 'shipment-drafts',
      data: drafts
    });
  }
  
  // 下書きを取得
  async getDrafts(): Promise<ShipmentDraft[]> {
    try {
      const result = await Taro.getStorage({
        key: 'shipment-drafts'
      });
      return result.data || [];
    } catch (error) {
      return [];
    }
  }
  
  // オンライン復帰時に同期
  async syncWhenOnline() {
    // ネットワーク状態を監視
    Taro.onNetworkStatusChange((res) => {
      if (res.isConnected) {
        this.uploadDrafts();
      }
    });
  }
  
  private async uploadDrafts() {
    const drafts = await this.getDrafts();
    
    for (const draft of drafts) {
      try {
        await Taro.request({
          url: 'https://api.example.com/shipping/draft/sync',
          method: 'POST',
          data: draft
        });
        
        // 成功したら削除
        await this.removeDraft(draft.id);
      } catch (error) {
        console.error('同期失敗:', error);
      }
    }
  }
  
  private async removeDraft(draftId: string) {
    const drafts = await this.getDrafts();
    const filtered = drafts.filter(d => d.id !== draftId);
    
    await Taro.setStorage({
      key: 'shipment-drafts',
      data: filtered
    });
  }
}

export default new OfflineStorage();
```

### 9.5 デスクトップアプリ（Electron）対応

```typescript
// electron/main.ts
import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  // Taroビルド済みHTMLを読み込み
  mainWindow.loadFile('dist/index.html');
  
  // DevTools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

---

## まとめ / Summary

Digital Handshake Logistics は、以下の技術要素を統合した次世代物流システムです：

1. **QR/NFCハンドシェイク**: 対面時の情報整合性を100%保証
2. **配送業者直契約API**: SF Express/JD Logistics等との統合
3. **住所標準化エンジン**: クラウド住所録 + AMF + 4級住所体系
4. **コミュニティ物流**: シェア配送とクラウドソーシング
5. **Daigou 2.0**: WeChatモーメンツ + 簡易WMS
6. **Taro.js**: マルチプラットフォーム対応（ミニプログラム/アプリ/デスクトップ）

このシステムにより、**「完璧なオーダー情報をクーリエの端末に注入し、物理的な受け渡しの証拠を残すコントローラー」**として機能します。
