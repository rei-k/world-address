# Alipay Mini-Program AI Capabilities / Alipay ミニプログラム AI機能

このドキュメントでは、Alipay（支付宝）ミニプログラムに搭載されるべきAI機能とアルゴリズムについて説明します。

This document describes the AI capabilities and algorithms that should be integrated into the Alipay Mini-Program.

---

## 概要 / Overview

Alipay ミニプログラムで成立させるべきAIは、住所入力を消すAI、提出権だけ扱うAI、期限キャンセルを理解するAI、配送互換だけ抽出するAI、決済IDだけ引用するAI、用途意図分類AI、復元QR生成AI、解除保証AI、地域クラスタ圧縮AI、互換フィルタAIです。

これらが走ると、**スキャン → 選択 → 決済 → 発送 → 解除** が驚くほど速くて安全になります。

The AI systems in the Alipay Mini-Program eliminate address input forms, handle submission rights only, understand deadline cancellations, extract delivery-compatible options, reference payment IDs only, classify usage intent, generate restoration QR codes, guarantee revocation, compress regional clusters, and filter compatibility.

When these run, the flow of **Scan → Select → Pay → Ship → Revoke** becomes remarkably fast and secure.

---

## 主要機能 / Key Features

### 基盤 + 体験 / Foundation + Experience

Alipay ミニプログラムでは、以下の体験を実現する必要があります：

The Alipay Mini-Program needs to realize the following experiences:

1. **GAP QR / NFCスキャンで友達の受取設定が開く**
   - スキャンしたコードから、受取場所選択画面（Pending Gift Setting）に直接遷移
   - 住所入力欄は出さない
   - Directly navigate to pickup location selection screen from scanned code
   - No address input fields displayed

2. **受取期限とキャンセル管理の知性**
   - 期限内に受取場所が確定しなければ「注文キャンセル」まで自動で導線を守るAI
   - 解除も権限だけで完結
   - AI automatically guides to "order cancellation" if pickup location is not confirmed within deadline
   - Revocation completes with permissions only

3. **キャリア互換のある住所だけ候補表示**
   - 中華圏で強い配送仕様にも即対応できるよう、互換性のない住所はAI側で出す前に除外
   - Exclude incompatible addresses before AI presents them to support strong delivery specifications in Chinese regions

4. **支払いはトークンIDだけで引用**
   - ユーザーが事前保存した決済トークンID（Stored Payment Tokens）だけを使って決済が成立
   - カード番号入力UIは出さない
   - Payment completes using only pre-saved payment token IDs
   - No card number input UI displayed

5. **送り状QRをAlipay Walletで再生成できる**
   - 購入後のWaybill / 伝票QRをアプリ内で復元・表示・シェアできる
   - Restore, display, and share waybill/invoice QR codes within the app after purchase

6. **サービス適合の検索エンジンAI**
   - 買い物・旅行予約・ホテル・宅配など文脈をスキャン後すぐ分類し、候補を一番上だけに絞る
   - Immediately classify context after scan (shopping, travel booking, hotel, delivery) and narrow candidates to top choices only

7. **友達住所の提出権リンクの共有/解除**
   - 住所そのものではなく提出権だけをサイトへ渡し、提携解除後は候補から完全に消える
   - Share submission rights link only (not the address itself) to sites, and completely remove from candidates after partnership revocation

8. **ホテルチェックインでQR/NFC住所引用**
   - 物流以外にも旅行先予約などで使った住所をQR/NFCで提出できる状態を作れる
   - Enable submission of addresses used for travel bookings via QR/NFC for hotel check-in

9. **地域クラスタ優先と近傍類似検索を自動で統合**
   - 友達住所候補が多い時、地理的に近い/使われやすいグルーピングだけ自動で圧縮
   - Automatically compress only geographically close/frequently used groupings when many friend address candidates exist

---

## AI機能詳細 / AI Capabilities Details

### 1. GAP QR/NFC Scan Intent AI
**住所入力を消すAI / AI that eliminates address input**

#### 目的 / Purpose
QR/NFCをスキャンした瞬間に、友達の受取設定画面に直接遷移し、住所入力フォームを完全に排除する。

Immediately navigate to friend's pickup settings screen upon QR/NFC scan, completely eliminating address input forms.

#### 機能 / Features
- **コード解析**: GAP（Gift Address Protocol）QRコードまたはNFCタグの内容を解析
- **意図判定**: スキャンの目的（ギフト受取、住所共有、送り状確認など）を即座に分類
- **直接遷移**: 受取場所選択画面（Pending Gift Setting）に直接ジャンプ
- **フォーム回避**: 住所入力UIを一切表示しない

- **Code Analysis**: Parse GAP (Gift Address Protocol) QR code or NFC tag content
- **Intent Determination**: Instantly classify scan purpose (gift receipt, address sharing, waybill confirmation, etc.)
- **Direct Navigation**: Jump directly to pickup location selection screen
- **Form Avoidance**: Never display address input UI

#### 技術実装 / Technical Implementation
```typescript
interface GAPScanIntent {
  scanType: 'QR' | 'NFC';
  protocol: 'GAP' | 'WAYBILL' | 'ADDRESS_SHARE';
  action: 'GIFT_RECEIPT' | 'ADDRESS_SUBMIT' | 'TRACKING' | 'CHECK_IN';
  recipientPID: string;
  metadata: {
    expiryDate?: string;
    serviceType?: 'SHOPPING' | 'HOTEL' | 'DELIVERY';
  };
}

async function processGAPScan(scanData: string): Promise<GAPScanIntent> {
  // AI-powered intent classification
  const intent = await classifyGAPIntent(scanData);
  
  // Navigate directly to appropriate screen
  if (intent.action === 'GIFT_RECEIPT') {
    navigateTo('/pages/gift/pending-settings', {
      recipientPID: intent.recipientPID
    });
  }
  
  return intent;
}
```

---

### 2. Deadline Cancellation Intelligence AI
**期限キャンセルを理解するAI / AI that understands deadline cancellations**

#### 目的 / Purpose
受取期限内に受取場所が確定しなければ、自動的に注文キャンセルまで導線を守り、権限だけで解除を完結させる。

If pickup location is not confirmed within deadline, automatically guide to order cancellation and complete revocation with permissions only.

#### 機能 / Features
- **期限監視**: 受取設定の期限をリアルタイムで監視
- **自動キャンセル導線**: 期限切れ時に注文キャンセルフローに自動遷移
- **権限ベース解除**: ユーザー権限のみで提出権の解除を完結
- **候補からの除外**: 解除後は検索インデックスから完全に削除

- **Deadline Monitoring**: Real-time monitoring of pickup setting deadlines
- **Auto-Cancellation Flow**: Automatically transition to order cancellation flow on expiry
- **Permission-Based Revocation**: Complete submission rights revocation with user permissions only
- **Candidate Exclusion**: Complete removal from search index after revocation

#### 技術実装 / Technical Implementation
```typescript
interface DeadlineManager {
  giftId: string;
  recipientPID: string;
  deadline: Date;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
}

class DeadlineCancellationAI {
  async monitorDeadlines(): Promise<void> {
    const pendingGifts = await getPendingGifts();
    
    for (const gift of pendingGifts) {
      if (new Date() > gift.deadline && gift.status === 'PENDING') {
        // Auto-guide to cancellation
        await this.initiateCancellationFlow(gift);
        
        // Remove from search index
        await this.revokeSubmissionRights(gift);
      }
    }
  }
  
  async revokeSubmissionRights(gift: DeadlineManager): Promise<void> {
    // Permission-based revocation
    await removeFromSearchIndex(gift.recipientPID);
    await updateGiftStatus(gift.giftId, 'CANCELLED');
  }
}
```

---

### 3. Carrier Compatibility Filter AI
**配送互換だけ抽出するAI / AI that extracts only delivery-compatible options**

#### 目的 / Purpose
中華圏で強い配送仕様（SF Express、JD Logisticsなど）に即対応できるよう、互換性のない住所を候補から事前に除外する。

Pre-exclude incompatible addresses from candidates to immediately support strong delivery specifications in Chinese regions (SF Express, JD Logistics, etc.).

#### 機能 / Features
- **キャリア仕様チェック**: 各配送業者の対応地域・制約を事前検証
- **互換性フィルタ**: 互換性のない住所をAI側で候補から除外
- **中華圏最適化**: SF Express、JD Logistics、YTO Express等の仕様に特化
- **リアルタイム更新**: キャリア仕様変更時に自動で候補を更新

- **Carrier Spec Check**: Pre-verify each carrier's supported regions and constraints
- **Compatibility Filter**: AI-side exclusion of incompatible addresses from candidates
- **Chinese Region Optimization**: Specialized for SF Express, JD Logistics, YTO Express, etc.
- **Real-time Updates**: Automatically update candidates when carrier specs change

#### 技術実装 / Technical Implementation
```typescript
interface CarrierSpec {
  carrierId: 'SF_EXPRESS' | 'JD_LOGISTICS' | 'YTO_EXPRESS' | 'ZTO_EXPRESS';
  supportedRegions: string[];
  restrictions: {
    maxWeight?: number;
    prohibitedItems?: string[];
    deliveryDays?: number;
  };
}

class CarrierCompatibilityAI {
  async filterCompatibleAddresses(
    addresses: string[],
    carrier: CarrierSpec
  ): Promise<string[]> {
    return addresses.filter(pid => {
      const region = extractRegion(pid);
      return carrier.supportedRegions.includes(region);
    });
  }
  
  async getOptimalCarrier(pid: string): Promise<CarrierSpec> {
    // AI selects best carrier for given address
    const region = extractRegion(pid);
    const carriers = await getAvailableCarriers(region);
    
    return carriers.sort((a, b) => 
      a.restrictions.deliveryDays - b.restrictions.deliveryDays
    )[0];
  }
}
```

---

### 4. Payment Token Reference AI
**決済IDだけ引用するAI / AI that references payment IDs only**

#### 目的 / Purpose
ユーザーが事前保存した決済トークンID（Stored Payment Tokens）だけを使って決済を成立させ、カード番号入力UIを完全に排除する。

Complete payment using only pre-saved payment token IDs, completely eliminating card number input UI.

#### 機能 / Features
- **トークン管理**: Alipay保存済み決済トークンの管理
- **ワンクリック決済**: トークンIDだけで決済完了
- **カード情報非表示**: カード番号入力UIを一切表示しない
- **セキュリティ**: トークン化による安全な決済処理

- **Token Management**: Manage Alipay saved payment tokens
- **One-Click Payment**: Complete payment with token ID only
- **Card Info Hidden**: Never display card number input UI
- **Security**: Secure payment processing through tokenization

#### 技術実装 / Technical Implementation
```typescript
interface PaymentToken {
  tokenId: string;
  type: 'ALIPAY_BALANCE' | 'BANK_CARD' | 'CREDIT_CARD';
  lastFourDigits?: string;
  expiryDate?: string;
  isDefault: boolean;
}

class PaymentTokenAI {
  async payWithToken(
    orderId: string,
    tokenId: string
  ): Promise<PaymentResult> {
    // No card UI - direct token payment
    const token = await getStoredToken(tokenId);
    
    return await alipay.trade.pay({
      outTradeNo: orderId,
      paymentToken: token.tokenId,
      // No card details exposed
    });
  }
  
  async getDefaultPaymentToken(): Promise<PaymentToken> {
    const tokens = await getStoredPaymentTokens();
    return tokens.find(t => t.isDefault) || tokens[0];
  }
}
```

---

### 5. Waybill QR Restore AI
**復元QR生成AI / AI for restoration QR generation**

#### 目的 / Purpose
購入後の送り状（Waybill）/ 伝票QRをAlipay Wallet内で復元・表示・シェアできるようにする。

Enable restoration, display, and sharing of post-purchase waybill/invoice QR codes within Alipay Wallet.

#### 機能 / Features
- **QR復元**: 過去の送り状からQRコードを再生成
- **Wallet統合**: Alipay Wallet内で表示・管理
- **シェア機能**: WeChat、SMS、メールでQRコードを共有
- **オフライン対応**: ネットワーク接続なしでもQR表示可能

- **QR Restoration**: Regenerate QR codes from past waybills
- **Wallet Integration**: Display and manage within Alipay Wallet
- **Share Function**: Share QR codes via WeChat, SMS, email
- **Offline Support**: Display QR without network connection

#### 技術実装 / Technical Implementation
```typescript
interface WaybillQR {
  waybillNumber: string;
  carrier: string;
  recipientPID: string;
  qrData: string;
  generatedAt: Date;
}

class WaybillRestoreAI {
  async restoreWaybillQR(waybillNumber: string): Promise<WaybillQR> {
    // Retrieve waybill data
    const waybill = await getWaybillData(waybillNumber);
    
    // AI regenerates QR with same data
    const qrData = await generateWaybillQR(waybill);
    
    // Save to Alipay Wallet
    await saveToAlipayWallet({
      type: 'WAYBILL_QR',
      data: qrData,
      metadata: waybill
    });
    
    return {
      waybillNumber,
      carrier: waybill.carrier,
      recipientPID: waybill.recipientPID,
      qrData,
      generatedAt: new Date()
    };
  }
  
  async shareWaybillQR(qrData: string): Promise<void> {
    await alipay.shareSheet({
      title: '送り状QRコード',
      imageUrl: qrData,
      targets: ['WECHAT', 'SMS', 'EMAIL']
    });
  }
}
```

---

### 6. Service Intent Classification AI
**用途意図分類AI / AI for service intent classification**

#### 目的 / Purpose
買い物・旅行予約・ホテル・宅配など文脈をスキャン後すぐ分類し、候補を一番上だけに絞る。

Immediately classify context after scan (shopping, travel booking, hotel, delivery) and narrow candidates to top choices only.

#### 機能 / Features
- **文脈分類**: スキャン内容から利用シーンを即座に判定
- **優先候補抽出**: 文脈に最適な候補を最上位に表示
- **学習機能**: ユーザーの利用パターンから学習
- **精度向上**: 継続的な利用で分類精度が向上

- **Context Classification**: Instantly determine usage scene from scan content
- **Priority Candidate Extraction**: Display most suitable candidates at top for context
- **Learning Function**: Learn from user usage patterns
- **Accuracy Improvement**: Classification accuracy improves with continued use

#### 技術実装 / Technical Implementation
```typescript
interface ServiceIntent {
  type: 'SHOPPING' | 'TRAVEL' | 'HOTEL' | 'DELIVERY' | 'RESTAURANT';
  confidence: number;
  suggestedAddresses: string[];
}

class ServiceIntentAI {
  async classifyIntent(scanData: string): Promise<ServiceIntent> {
    // AI analyzes scan content
    const features = extractFeatures(scanData);
    
    // Machine learning classification
    const intent = await mlModel.predict(features);
    
    // Get top candidates for this service type
    const addresses = await this.getTopCandidates(intent.type);
    
    return {
      type: intent.type,
      confidence: intent.confidence,
      suggestedAddresses: addresses.slice(0, 3) // Top 3 only
    };
  }
  
  async getTopCandidates(serviceType: string): Promise<string[]> {
    // Retrieve addresses optimized for service type
    return await searchAddressesByServiceType(serviceType);
  }
}
```

---

### 7. Submission Rights Link AI
**提出権だけ扱うAI / AI that handles submission rights only**

#### 目的 / Purpose
住所そのものではなく提出権だけをサイトへ渡し、提携解除後は候補から完全に消える仕組みを実現する。

Share submission rights link only (not the address itself) to sites, and ensure complete removal from candidates after partnership revocation.

#### 機能 / Features
- **権限リンク生成**: 住所ではなく提出権限トークンを生成
- **サイト提携管理**: ECサイト等との提携状態を管理
- **自動解除**: 提携解除時に権限を即座に無効化
- **完全除外**: 解除後は検索候補から完全に削除

- **Permission Link Generation**: Generate submission permission tokens, not addresses
- **Site Partnership Management**: Manage partnership status with EC sites, etc.
- **Auto Revocation**: Instantly invalidate permissions upon partnership revocation
- **Complete Exclusion**: Complete removal from search candidates after revocation

#### 技術実装 / Technical Implementation
```typescript
interface SubmissionRights {
  rightId: string;
  addressPID: string;
  partnerId: string;
  expiryDate: Date;
  status: 'ACTIVE' | 'REVOKED';
  permissions: string[];
}

class SubmissionRightsAI {
  async generateRightsLink(
    addressPID: string,
    partnerId: string
  ): Promise<SubmissionRights> {
    // Generate rights token, not address
    const rightId = await generateSecureToken();
    
    return {
      rightId,
      addressPID, // Not exposed to partner
      partnerId,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      permissions: ['READ_PID', 'VALIDATE_SHIPMENT']
    };
  }
  
  async revokePartnership(partnerId: string): Promise<void> {
    // Revoke all rights for this partner
    await updateRightsStatus(partnerId, 'REVOKED');
    
    // Remove from search index completely
    await removeFromSearchCandidates(partnerId);
  }
}
```

---

### 8. Hotel Check-in QR/NFC AI
**ホテルチェックインでQR/NFC住所引用 / AI for hotel check-in QR/NFC address citation**

#### 目的 / Purpose
物流以外にも旅行先予約などで使った住所をQR/NFCで提出できる状態を作る。

Enable submission of addresses used for travel bookings via QR/NFC for hotel check-in beyond logistics.

#### 機能 / Features
- **旅行住所管理**: 旅行・ホテル予約で使用した住所を管理
- **QR/NFC生成**: チェックイン用のQR/NFCコードを生成
- **非物流対応**: 配送以外のユースケースに対応
- **プライバシー保護**: 必要最小限の情報のみ共有

- **Travel Address Management**: Manage addresses used for travel/hotel bookings
- **QR/NFC Generation**: Generate QR/NFC codes for check-in
- **Non-Logistics Support**: Support use cases beyond delivery
- **Privacy Protection**: Share only minimum necessary information

#### 技術実装 / Technical Implementation
```typescript
interface HotelCheckInAddress {
  addressPID: string;
  hotelId: string;
  bookingId: string;
  checkInDate: Date;
  qrCode: string;
}

class HotelCheckInAI {
  async generateCheckInQR(
    bookingId: string
  ): Promise<HotelCheckInAddress> {
    const booking = await getBookingDetails(bookingId);
    
    // Generate QR with minimal info
    const qrData = {
      pid: booking.addressPID,
      hotelId: booking.hotelId,
      checkIn: booking.checkInDate,
      // No full address exposed
    };
    
    const qrCode = await generateQRCode(qrData);
    
    return {
      addressPID: booking.addressPID,
      hotelId: booking.hotelId,
      bookingId,
      checkInDate: booking.checkInDate,
      qrCode
    };
  }
  
  async submitViaQR(qrCode: string): Promise<void> {
    // Hotel scans QR to get PID reference only
    await submitToHotel(qrCode);
  }
}
```

---

### 9. Regional Cluster Compression AI
**地域クラスタ圧縮AI / AI for regional cluster compression**

#### 目的 / Purpose
友達住所候補が多い時、地理的に近い/使われやすいグルーピングだけ自動で圧縮する。

Automatically compress only geographically close/frequently used groupings when many friend address candidates exist.

#### 機能 / Features
- **地理的クラスタリング**: 近接住所を自動グルーピング
- **利用頻度分析**: よく使われる住所グループを優先
- **自動圧縮**: 候補数が多い時に自動で圧縮表示
- **展開機能**: 必要時にクラスタを展開して詳細表示

- **Geographic Clustering**: Auto-group nearby addresses
- **Usage Frequency Analysis**: Prioritize frequently used address groups
- **Auto Compression**: Automatically compress display when many candidates
- **Expand Function**: Expand clusters for detailed view when needed

#### 技術実装 / Technical Implementation
```typescript
interface AddressCluster {
  clusterId: string;
  centerPID: string;
  addresses: string[];
  region: string;
  usageFrequency: number;
}

class RegionalClusterAI {
  async compressCandidates(
    addresses: string[]
  ): Promise<AddressCluster[]> {
    if (addresses.length < 10) {
      // No compression needed
      return addresses.map(pid => ({
        clusterId: pid,
        centerPID: pid,
        addresses: [pid],
        region: extractRegion(pid),
        usageFrequency: 1
      }));
    }
    
    // AI-powered geographic clustering
    const clusters = await geographicClustering(addresses);
    
    // Sort by usage frequency
    return clusters.sort((a, b) => 
      b.usageFrequency - a.usageFrequency
    );
  }
  
  async expandCluster(clusterId: string): Promise<string[]> {
    const cluster = await getCluster(clusterId);
    return cluster.addresses;
  }
}
```

---

### 10. Compatibility Resolver AI
**互換フィルタAI / AI for compatibility filtering**

#### 目的 / Purpose
すべてのAI機能を統合し、互換性のない要素を事前に除外して、スムーズな体験を保証する。

Integrate all AI functions and pre-exclude incompatible elements to guarantee smooth experience.

#### 機能 / Features
- **統合フィルタリング**: すべてのAI機能の結果を統合
- **互換性チェック**: キャリア、決済、地域の互換性を検証
- **エラー予防**: 不整合を事前に検出して除外
- **最適化**: ユーザーに最適な候補のみを提示

- **Integrated Filtering**: Integrate results from all AI functions
- **Compatibility Check**: Verify carrier, payment, and regional compatibility
- **Error Prevention**: Pre-detect and exclude inconsistencies
- **Optimization**: Present only optimal candidates to users

#### 技術実装 / Technical Implementation
```typescript
class CompatibilityResolverAI {
  async resolveCompatibility(
    addressPID: string,
    carrier: string,
    paymentToken: string,
    serviceType: string
  ): Promise<boolean> {
    // Check carrier compatibility
    const carrierOk = await checkCarrierCompatibility(addressPID, carrier);
    
    // Check payment compatibility
    const paymentOk = await checkPaymentCompatibility(paymentToken);
    
    // Check service compatibility
    const serviceOk = await checkServiceCompatibility(addressPID, serviceType);
    
    return carrierOk && paymentOk && serviceOk;
  }
  
  async filterCompatibleOptions(
    candidates: any[]
  ): Promise<any[]> {
    return candidates.filter(async candidate => {
      return await this.resolveCompatibility(
        candidate.addressPID,
        candidate.carrier,
        candidate.paymentToken,
        candidate.serviceType
      );
    });
  }
}
```

---

## まとめ / Summary

### 1文でまとめ / One-Line Summary

ミニプログラムで成立させるべきAIは、**住所入力を消すAI、提出権だけ扱うAI、期限キャンセルを理解するAI、配送互換だけ抽出するAI、決済IDだけ引用するAI、用途意図分類AI、復元QR生成AI、解除保証AI、地域クラスタ圧縮AI、互換フィルタAI**。

これらが走ると、**スキャン → 選択 → 決済 → 発送 → 解除** が驚くほど速くて安全になります。

The AI that should be implemented in mini-programs: **AI that eliminates address input, AI that handles submission rights only, AI that understands deadline cancellations, AI that extracts only delivery-compatible options, AI that references payment IDs only, service intent classification AI, restoration QR generation AI, revocation guarantee AI, regional cluster compression AI, compatibility filter AI**.

When these run, **Scan → Select → Pay → Ship → Revoke** becomes remarkably fast and secure.

---

## 実装ロードマップ / Implementation Roadmap

### Phase 1: 基礎AI / Foundation AI
- ✅ GAP QR/NFC Scan Intent AI
- ✅ Service Intent Classification AI
- ✅ Carrier Compatibility Filter AI

### Phase 2: 決済・送り状 / Payment & Waybill
- ✅ Payment Token Reference AI
- ✅ Waybill QR Restore AI
- ✅ Submission Rights Link AI

### Phase 3: 高度な機能 / Advanced Features
- ✅ Deadline Cancellation Intelligence AI
- ✅ Hotel Check-in QR/NFC AI
- ✅ Regional Cluster Compression AI
- ✅ Compatibility Resolver AI

---

## 技術スタック / Technology Stack

### AI/ML Framework
- TensorFlow.js - ブラウザ内機械学習
- ONNX Runtime - 軽量推論エンジン
- Alipay Cloud AI - Alipayクラウド機能

### 検索・インデックス / Search & Indexing
- Elasticsearch - 高速検索エンジン
- Redis - キャッシュ・インデックス管理

### セキュリティ / Security
- JWT - トークン管理
- AES-256 - データ暗号化
- TLS 1.3 - 通信暗号化

### Alipay SDK
- Alipay Mini-Program SDK
- Alipay Payment SDK
- Alipay Sesame Credit SDK

---

## 関連ドキュメント / Related Documents

- [Alipay Mini-Program README](./README.md)
- [VEY Common Module](../../common/docs/README.md)
- [AI Capabilities (General)](../../../docs/ai/ai-capabilities.md)
- [Waybill AI Capabilities](../../../docs/ai/waybill-ai-capabilities.md)

---

## ライセンス / License

MIT License - 詳細は [LICENSE](../../../LICENSE) を参照してください。
