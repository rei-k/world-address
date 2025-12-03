# WeChat Mini-Program AI Capabilities / WeChat ミニプログラム AI機能

このドキュメントでは、WeChat（微信）ミニプログラムに搭載されるべきAI機能とアルゴリズムについて説明します。

This document describes the AI capabilities and algorithms that should be integrated into the WeChat Mini-Program.

---

## 概要 / Overview

WeChatのミニプログラムに必要なのは**「スキャン意図分類・友達住所だけの索引・近傍クラスタ圧縮・キャリア互換フィルタ・署名付きGAP生成・Waybill復元・期限キャンセル保証・言語差吸収・解除伝播最適化・シーン適合候補抽出」**。これをAIで強くすると破綻せず送れるし革命級になります。

What the WeChat Mini-Program needs: **"Scan intent classification, friend-address-only indexing, nearby cluster compression, carrier compatibility filtering, signed GAP generation, waybill restoration, deadline cancellation guarantee, language variance absorption, revocation propagation optimization, scene-appropriate candidate extraction"**. When strengthened with AI, shipping becomes failure-proof and revolutionary.

---

## 主要機能 / Key Features

### 搭載するといいAI・アルゴリズム / AI & Algorithms to Implement

WeChat Mini Program 想定で、QR/NFC/住所×ギフトの未来フローで活かせるAI/アルゴリズムを、スッキリ文章だけで提案します。

For WeChat Mini-Program, we propose AI/algorithms that can be leveraged in the future flow of QR/NFC/Address × Gifts, clearly described in text only.

---

## AI機能詳細 / AI Capabilities Details

### 1. Smart Scan Intent AI
**スキャン意図分類AI / AI for scan intent classification**

#### 目的 / Purpose
QR/NFCを読み取った瞬間に「ギフト受取」「住所呼び出し」「送り状復元」「予約チェックアウト」など目的を即分類し、正しい画面だけを開く。

Instantly classify purpose upon QR/NFC scan ("gift receipt", "address retrieval", "waybill restoration", "reservation checkout", etc.) and open only the correct screen.

#### 機能 / Features
- **即座の意図分類**: スキャン瞬間に目的を判定
- **コンテキスト理解**: 利用シーンを自動認識
- **最適画面遷移**: 必要な画面に直接ジャンプ
- **誤分類防止**: 高精度な意図判定で誤操作を排除

- **Instant Intent Classification**: Determine purpose at moment of scan
- **Context Understanding**: Automatically recognize usage scene
- **Optimal Screen Navigation**: Jump directly to necessary screen
- **Misclassification Prevention**: Eliminate misoperations with high-precision intent determination

#### 技術実装 / Technical Implementation
```typescript
interface ScanIntent {
  intentType: 'GIFT_RECEIPT' | 'ADDRESS_CALL' | 'WAYBILL_RESTORE' | 'CHECKOUT';
  confidence: number;
  targetScreen: string;
  metadata: Record<string, any>;
}

class SmartScanIntentAI {
  async classifyIntent(scanData: string): Promise<ScanIntent> {
    // AI analyzes QR/NFC content
    const features = this.extractFeatures(scanData);
    
    // Machine learning classification
    const prediction = await this.mlModel.predict(features);
    
    // Map to correct screen
    const targetScreen = this.mapToScreen(prediction.intentType);
    
    return {
      intentType: prediction.intentType,
      confidence: prediction.confidence,
      targetScreen,
      metadata: this.extractMetadata(scanData)
    };
  }
  
  private mapToScreen(intent: string): string {
    const screenMap = {
      'GIFT_RECEIPT': '/pages/gift/receive',
      'ADDRESS_CALL': '/pages/address/select',
      'WAYBILL_RESTORE': '/pages/waybill/restore',
      'CHECKOUT': '/pages/hotel/checkout'
    };
    return screenMap[intent];
  }
}
```

---

### 2. Friend-Address Index AI
**友達住所だけの索引AI / AI for friend-address-only indexing**

#### 目的 / Purpose
住所フォームがある加盟サイトとリンクされた友達住所だけを検索対象とし、自己住所を検索候補から自動で除外して表示。

Index only friend addresses linked to partner sites with address forms, automatically excluding self addresses from search candidates.

#### 機能 / Features
- **友達住所限定**: 友達の住所のみを検索対象に
- **自己住所除外**: 自分の住所は候補から自動除外
- **加盟サイト連動**: 提携サイトの住所だけを表示
- **プライバシー保護**: 不要な住所情報の露出を防止

- **Friend Address Only**: Target only friends' addresses for search
- **Self Address Exclusion**: Automatically exclude own addresses from candidates
- **Partner Site Integration**: Display only addresses for partnered sites
- **Privacy Protection**: Prevent exposure of unnecessary address information

#### 技術実装 / Technical Implementation
```typescript
interface FriendAddressIndex {
  friendId: string;
  addressPID: string;
  partnerSiteId: string;
  permissions: string[];
  indexed: boolean;
}

class FriendAddressIndexAI {
  async searchFriendAddresses(
    userId: string,
    partnerSiteId: string
  ): Promise<FriendAddressIndex[]> {
    // Get friend addresses only
    const friendAddresses = await this.getFriendAddresses(userId);
    
    // Exclude self addresses
    const filtered = friendAddresses.filter(
      addr => addr.friendId !== userId
    );
    
    // Filter by partner site
    const partnered = filtered.filter(
      addr => addr.partnerSiteId === partnerSiteId
    );
    
    return partnered;
  }
  
  async indexFriendAddress(
    friendId: string,
    addressPID: string,
    partnerSiteId: string
  ): Promise<void> {
    // Add to friend address index
    await this.addToIndex({
      friendId,
      addressPID,
      partnerSiteId,
      permissions: ['READ', 'VALIDATE'],
      indexed: true
    });
  }
  
  async removeSelfFromCandidates(userId: string): Promise<void> {
    // Automatically exclude self addresses
    await this.updateIndexQuery(`friendId != "${userId}"`);
  }
}
```

---

### 3. Geo-Cluster Rank AI
**近傍クラスタ圧縮AI / AI for nearby cluster compression**

#### 目的 / Purpose
受取候補（ホテル/ロッカー/自宅/店舗など）を、地理的な近さ×過去履歴×キャリア互換でクラスタ化し、本当に使える場所だけ上位に圧縮する。

Cluster pickup candidates (hotel/locker/home/store, etc.) by geographic proximity × past history × carrier compatibility, compressing only truly usable locations to top.

#### 機能 / Features
- **地理的クラスタリング**: 近接地点を自動グルーピング
- **履歴スコアリング**: 過去の利用頻度を重視
- **キャリア適合性**: 配送業者対応地点を優先
- **上位圧縮**: 最適な候補だけを上位表示

- **Geographic Clustering**: Auto-group nearby points
- **History Scoring**: Prioritize past usage frequency
- **Carrier Compatibility**: Prioritize carrier-supported locations
- **Top Compression**: Display only optimal candidates at top

#### 技術実装 / Technical Implementation
```typescript
interface GeoCluster {
  clusterId: string;
  centerPoint: { latitude: number; longitude: number };
  locations: PickupLocation[];
  score: number;
  carrierSupport: string[];
}

interface PickupLocation {
  pid: string;
  type: 'HOTEL' | 'LOCKER' | 'HOME' | 'STORE';
  coordinates: { latitude: number; longitude: number };
  usageCount: number;
  lastUsed: Date;
}

class GeoClusterRankAI {
  async rankPickupLocations(
    userLocation: { latitude: number; longitude: number },
    carrier: string
  ): Promise<GeoCluster[]> {
    // Get all pickup candidates
    const locations = await this.getPickupCandidates();
    
    // Geographic clustering
    const clusters = await this.geographicClustering(locations, userLocation);
    
    // Score each cluster
    const scored = clusters.map(cluster => ({
      ...cluster,
      score: this.calculateClusterScore(cluster, carrier)
    }));
    
    // Sort by score and return top clusters
    return scored.sort((a, b) => b.score - a.score);
  }
  
  private calculateClusterScore(
    cluster: GeoCluster,
    carrier: string
  ): number {
    let score = 0;
    
    // Geographic proximity score (0-40 points)
    score += this.proximityScore(cluster.centerPoint);
    
    // Usage history score (0-30 points)
    score += this.historyScore(cluster.locations);
    
    // Carrier compatibility score (0-30 points)
    score += cluster.carrierSupport.includes(carrier) ? 30 : 0;
    
    return score;
  }
}
```

---

### 4. Carrier Compatibility Resolver
**キャリア互換フィルタ / Carrier compatibility filter**

#### 目的 / Purpose
SF Express など配送キャリア仕様に適合しない候補をスキャン/検索前に除外し、破綻ゼロの候補だけ返す。

Pre-exclude candidates incompatible with delivery carrier specifications like SF Express before scan/search, returning only failure-proof candidates.

#### 機能 / Features
- **キャリア仕様検証**: 各配送業者の対応範囲を事前チェック
- **破綻防止**: 配送不可能な候補を事前除外
- **リアルタイム更新**: キャリア仕様変更に即座に対応
- **多キャリア対応**: SF Express、順豊、京東物流など対応

- **Carrier Spec Verification**: Pre-check coverage of each delivery carrier
- **Failure Prevention**: Pre-exclude undeliverable candidates
- **Real-time Updates**: Immediately respond to carrier spec changes
- **Multi-Carrier Support**: Support SF Express, Shunfeng, JD Logistics, etc.

#### 技術実装 / Technical Implementation
```typescript
interface CarrierCapability {
  carrierId: string;
  name: string;
  coverageRegions: string[];
  restrictions: {
    maxWeight?: number;
    maxSize?: { length: number; width: number; height: number };
    prohibitedItems?: string[];
    serviceLevel?: 'STANDARD' | 'EXPRESS' | 'ECONOMY';
  };
}

class CarrierCompatibilityResolver {
  async filterCompatibleCandidates(
    candidates: string[],
    carrier: string,
    shipmentDetails: any
  ): Promise<string[]> {
    const carrierSpec = this.carriers.get(carrier);
    if (!carrierSpec) {
      throw new Error(`Carrier ${carrier} not found`);
    }
    
    // Filter out incompatible addresses
    return candidates.filter(pid => {
      return this.isCompatible(pid, carrierSpec, shipmentDetails);
    });
  }
  
  private isCompatible(
    pid: string,
    carrier: CarrierCapability,
    shipment: any
  ): boolean {
    // Check region coverage
    const region = this.extractRegion(pid);
    if (!carrier.coverageRegions.includes(region)) {
      return false;
    }
    
    // Check weight restrictions
    if (carrier.restrictions.maxWeight && 
        shipment.weight > carrier.restrictions.maxWeight) {
      return false;
    }
    
    return true;
  }
}
```

---

### 5. Signed GAP Token Generator
**署名付きGAP生成 / Signed GAP token generation**

#### 目的 / Purpose
住所/送り状/受取設定に署名付きGAPトークンを使い、改ざんや重複受け取りが起きないIDをWeChat内で生成。

Use signed GAP tokens for addresses/waybills/pickup settings to generate IDs within WeChat that prevent tampering and duplicate receipts.

#### 機能 / Features
- **署名付きトークン**: デジタル署名による改ざん防止
- **ユニークID生成**: 重複受け取り防止
- **有効期限管理**: トークンの自動失効
- **検証機能**: トークンの正当性を即座に確認

- **Signed Tokens**: Prevent tampering with digital signatures
- **Unique ID Generation**: Prevent duplicate receipts
- **Expiry Management**: Automatic token expiration
- **Validation Function**: Instantly verify token legitimacy

#### 技術実装 / Technical Implementation
```typescript
interface GAPToken {
  tokenId: string;
  type: 'ADDRESS' | 'WAYBILL' | 'PICKUP_SETTING';
  recipientPID: string;
  issuedAt: Date;
  expiresAt: Date;
  signature: string;
  metadata: Record<string, any>;
}

class SignedGAPTokenGenerator {
  async generateToken(
    type: 'ADDRESS' | 'WAYBILL' | 'PICKUP_SETTING',
    recipientPID: string,
    expiryHours: number = 24
  ): Promise<GAPToken> {
    const tokenId = await this.generateUniqueId();
    
    const now = new Date();
    const token: GAPToken = {
      tokenId,
      type,
      recipientPID,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + expiryHours * 60 * 60 * 1000),
      signature: '',
      metadata: {}
    };
    
    token.signature = await this.signToken(token);
    
    return token;
  }
  
  async validateToken(token: GAPToken): Promise<boolean> {
    if (new Date() > token.expiresAt) {
      return false;
    }
    
    const isValid = await this.verifySignature(token);
    if (!isValid) {
      return false;
    }
    
    const isDuplicate = await this.checkDuplicateUsage(token.tokenId);
    if (isDuplicate) {
      return false;
    }
    
    return true;
  }
}
```

---

### 6. Waybill Restore AI
**送り状復元AI / Waybill restoration AI**

#### 目的 / Purpose
WeChat内のQRやNFCから、送り状（伝票）を完全に復元・再表示・シェア可能にするAI復元層。

AI restoration layer that enables complete restoration, re-display, and sharing of waybills from QR or NFC within WeChat.

#### 機能 / Features
- **完全復元**: 過去の送り状を完全に再現
- **QR/NFC対応**: QRコードとNFCタグから復元
- **WeChat統合**: WeChat内で表示・管理
- **シェア機能**: 友達や業者とシェア可能

- **Complete Restoration**: Fully reproduce past waybills
- **QR/NFC Support**: Restore from QR codes and NFC tags
- **WeChat Integration**: Display and manage within WeChat
- **Share Function**: Shareable with friends and carriers

#### 技術実装 / Technical Implementation
```typescript
interface Waybill {
  waybillNumber: string;
  carrier: string;
  senderPID: string;
  recipientPID: string;
  items: WaybillItem[];
  status: string;
  qrCode: string;
  nfcData?: string;
  createdAt: Date;
}

class WaybillRestoreAI {
  async restoreFromQR(qrData: string): Promise<Waybill> {
    const waybillId = this.decodeQRData(qrData);
    const waybill = await this.fetchWaybill(waybillId);
    const restored = await this.aiRestore(waybill);
    await this.cacheWaybill(restored);
    
    return restored;
  }
  
  async shareWaybill(
    waybillNumber: string,
    shareType: 'FRIEND' | 'CARRIER' | 'MOMENT'
  ): Promise<void> {
    const waybill = await this.getWaybill(waybillNumber);
    
    const shareContent = {
      title: `送り状 ${waybillNumber}`,
      desc: `${waybill.carrier} - ${waybill.status}`,
      path: `/pages/waybill/detail?id=${waybillNumber}`,
      imageUrl: waybill.qrCode
    };
    
    if (shareType === 'FRIEND') {
      await wx.shareAppMessage(shareContent);
    } else if (shareType === 'MOMENT') {
      await wx.shareTimeline(shareContent);
    }
  }
}
```

---

### 7. Indefinite Location Guard AI
**期限キャンセル保証AI / Deadline cancellation guarantee AI**

#### 目的 / Purpose
友達が期限内に受取場所を確定しなかった場合 → 注文キャンセル、その後は検索インデックスにも二度と現れない状態をAIが保証。

AI guarantees that if friend doesn't confirm pickup location within deadline → order cancellation, and never appears in search index again.

#### 機能 / Features
- **期限監視**: 受取期限をリアルタイムで監視
- **自動キャンセル**: 期限超過時に自動注文キャンセル
- **インデックス削除**: 検索候補から完全に除外
- **二度と表示しない**: 解除後は永久に非表示

- **Deadline Monitoring**: Real-time monitoring of pickup deadlines
- **Auto Cancellation**: Automatic order cancellation on deadline expiry
- **Index Deletion**: Complete exclusion from search candidates
- **Never Show Again**: Permanently hidden after revocation

#### 技術実装 / Technical Implementation
```typescript
interface LocationGuard {
  orderId: string;
  friendId: string;
  recipientPID: string;
  deadline: Date;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  notificationsSent: number;
}

class IndefiniteLocationGuardAI {
  async monitorDeadlines(): Promise<void> {
    setInterval(async () => {
      for (const [orderId, guard] of this.guards) {
        if (guard.status === 'PENDING' && new Date() > guard.deadline) {
          await this.handleExpiredGuard(guard);
        }
      }
    }, 60 * 1000);
  }
  
  private async handleExpiredGuard(guard: LocationGuard): Promise<void> {
    await this.cancelOrder(guard.orderId);
    await this.removeFromSearchIndex(guard.recipientPID, guard.friendId);
    guard.status = 'CANCELLED';
    await this.notifyFriend(guard.friendId, 'ORDER_CANCELLED_DUE_TO_TIMEOUT');
  }
}
```

---

### 8. Fuzzy Locale Merge AI
**言語差吸収AI / Language variance absorption AI**

#### 目的 / Purpose
住所が中国語/英語/現地語で登録されても、すべて同一PIDとして近傍類似検索できるよう揺れ・言語差を吸収。

Absorb variations and language differences so addresses registered in Chinese/English/local languages can all be searched as the same PID in nearby similarity search.

#### 機能 / Features
- **多言語正規化**: 中国語・英語・現地語を統一PIDに変換
- **揺れ吸収**: 表記の揺れを自動で吸収
- **同一PID判定**: 異なる言語でも同一住所と認識
- **近傍検索対応**: 類似住所の検索精度向上

- **Multi-language Normalization**: Convert Chinese/English/local languages to unified PID
- **Variation Absorption**: Automatically absorb notation variations
- **Same PID Determination**: Recognize as same address even in different languages
- **Nearby Search Support**: Improve similar address search accuracy

#### 技術実装 / Technical Implementation
```typescript
interface LocaleVariant {
  pid: string;
  variants: {
    zh: string;
    en: string;
    local: string;
  };
  normalized: string;
}

class FuzzyLocaleMergeAI {
  async normalizeAddress(
    address: string,
    language: 'zh' | 'en' | 'local'
  ): Promise<string> {
    const components = await this.parseAddress(address, language);
    const normalized = await this.normalize(components);
    return await this.generatePID(normalized);
  }
  
  async findSimilarAddresses(
    address: string,
    language: 'zh' | 'en' | 'local'
  ): Promise<LocaleVariant[]> {
    const normalizedPID = await this.normalizeAddress(address, language);
    const similar = await this.fuzzySearch(normalizedPID);
    return similar;
  }
}
```

---

### 9. Revocation Propagation AI
**解除伝播最適化AI / Revocation propagation optimization AI**

#### 目的 / Purpose
ユーザーが受取/提出の権限を解除したら、検索候補・キャッシュ・提出権の3層すべてから即座に排除され誤送信を防ぐ。

When user revokes receipt/submission rights, immediately exclude from all 3 layers (search candidates, cache, submission rights) to prevent misdelivery.

#### 機能 / Features
- **3層同時削除**: 検索・キャッシュ・権限を一斉削除
- **即座の反映**: 解除後すぐに全システムに反映
- **誤送信防止**: 古い情報による誤配送を防止
- **完全性保証**: 解除の完全性をAIが保証

- **3-Layer Simultaneous Deletion**: Delete search, cache, and rights simultaneously
- **Immediate Reflection**: Reflect across all systems immediately after revocation
- **Misdelivery Prevention**: Prevent misdelivery due to old information
- **Completeness Guarantee**: AI guarantees completeness of revocation

#### 技術実装 / Technical Implementation
```typescript
class RevocationPropagationAI {
  async revokeSubmissionRights(
    userId: string,
    partnerId: string,
    addressPID: string
  ): Promise<void> {
    // Execute all revocations in parallel
    await Promise.all([
      this.removeFromSearch(addressPID, partnerId),
      this.clearCache(addressPID, partnerId),
      this.revokeRights(userId, partnerId, addressPID)
    ]);
    
    // Verify completeness
    await this.verifyRevocation();
  }
  
  private async removeFromSearch(
    addressPID: string,
    partnerId: string
  ): Promise<void> {
    await deleteFromSearchIndex({ addressPID, partnerId });
    await addToExclusionList(addressPID, partnerId);
  }
}
```

---

### 10. Checkout/Biz-scene Optimizer
**シーン適合候補抽出AI / Scene-appropriate candidate extraction AI**

#### 目的 / Purpose
買い物・予約・ホテルチェックインなどWeChat内のサービス文脈ごとに最適な候補だけ1発で表示し、入力UI工程を作らせない。

Display only optimal candidates in one shot for each service context (shopping, reservation, hotel check-in, etc.) within WeChat, eliminating input UI steps.

#### 機能 / Features
- **文脈認識**: 利用シーンを自動判定
- **最適候補抽出**: シーンに合った候補だけを表示
- **1発表示**: 入力工程を完全排除
- **学習機能**: ユーザーの好みを学習して精度向上

- **Context Recognition**: Automatically determine usage scene
- **Optimal Candidate Extraction**: Display only scene-appropriate candidates
- **One-Shot Display**: Completely eliminate input steps
- **Learning Function**: Learn user preferences to improve accuracy

#### 技術実装 / Technical Implementation
```typescript
interface BizScene {
  type: 'SHOPPING' | 'RESERVATION' | 'HOTEL_CHECKIN' | 'RESTAURANT' | 'DELIVERY';
  context: Record<string, any>;
  priority: string[];
}

class CheckoutBizSceneOptimizer {
  async extractOptimalCandidates(
    scene: BizScene,
    userId: string
  ): Promise<string[]> {
    const history = await this.getUserHistory(userId);
    const scored = await this.scoreCandidates(history, scene);
    const sorted = scored.sort((a, b) => b.score - a.score);
    
    return sorted.slice(0, 3).map(c => c.addressPID);
  }
  
  private async calculateSceneScore(
    pid: string,
    scene: BizScene
  ): Promise<{ total: number; reason: string }> {
    let total = 0;
    const reasons: string[] = [];
    
    switch (scene.type) {
      case 'SHOPPING':
        if (await this.isHomeOrOffice(pid)) {
          total += 40;
          reasons.push('Home/Office address');
        }
        break;
      case 'HOTEL_CHECKIN':
        if (await this.isHotelAddress(pid)) {
          total += 50;
          reasons.push('Hotel address');
        }
        break;
    }
    
    return { total, reason: reasons.join(', ') };
  }
}
```

---

## まとめ / Summary

### 1文でまとめ / One-Line Summary

WeChatのミニプログラムに必要なのは**「スキャン意図分類・友達住所だけの索引・近傍クラスタ圧縮・キャリア互換フィルタ・署名付きGAP生成・Waybill復元・期限キャンセル保証・言語差吸収・解除伝播最適化・シーン適合候補抽出」**。これをAIで強くすると破綻せず送れるし革命級になります。

What the WeChat Mini-Program needs: **"Scan intent classification, friend-address-only indexing, nearby cluster compression, carrier compatibility filtering, signed GAP generation, waybill restoration, deadline cancellation guarantee, language variance absorption, revocation propagation optimization, scene-appropriate candidate extraction"**. When strengthened with AI, shipping becomes failure-proof and revolutionary.

---

## 実装ロードマップ / Implementation Roadmap

### Phase 1: 基礎AI / Foundation AI
- ✅ Smart Scan Intent AI
- ✅ Friend-Address Index AI
- ✅ Carrier Compatibility Resolver

### Phase 2: セキュリティ・信頼性 / Security & Reliability
- ✅ Signed GAP Token Generator
- ✅ Indefinite Location Guard AI
- ✅ Revocation Propagation AI

### Phase 3: UX最適化 / UX Optimization
- ✅ Geo-Cluster Rank AI
- ✅ Fuzzy Locale Merge AI
- ✅ Checkout/Biz-scene Optimizer

### Phase 4: 高度な機能 / Advanced Features
- ✅ Waybill Restore AI

---

## 技術スタック / Technology Stack

### AI/ML Framework
- TensorFlow.js - ブラウザ内機械学習
- ONNX Runtime - 軽量推論エンジン
- WeChat Cloud AI - WeChatクラウド機能

### 検索・インデックス / Search & Indexing
- Elasticsearch - 高速検索エンジン
- Redis - キャッシュ・インデックス管理

### セキュリティ / Security
- JWT - トークン管理
- AES-256 - データ暗号化
- TLS 1.3 - 通信暗号化
- Digital Signatures - 署名検証

### WeChat SDK
- WeChat Mini-Program SDK
- WeChat Pay SDK
- WeChat Cloud Development

---

## 関連ドキュメント / Related Documents

- [WeChat Mini-Program README](./README.md)
- [VEY Common Module](../../common/docs/README.md)
- [AI Capabilities (General)](../../../docs/ai/ai-capabilities.md)
- [Waybill AI Capabilities](../../../docs/ai/waybill-ai-capabilities.md)

---

## ライセンス / License

MIT License - 詳細は [LICENSE](../../../LICENSE) を参照してください。
