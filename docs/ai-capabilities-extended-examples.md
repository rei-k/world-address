# 拡張AI機能使用例 / Extended AI Capabilities Usage Examples

このドキュメントでは、10個の拡張AI機能の実践的な使用例を提供します。

---

## 目次 / Table of Contents

1. [Atlas Routing AI](#1-atlas-routing-ai)
2. [GAP Oracle](#2-gap-oracle)
3. [Schema Resolve AI](#3-schema-resolve-ai)
4. [Noise Block AI](#4-noise-block-ai)
5. [Ledger Link AI](#5-ledger-link-ai)
6. [Fraud Radar AI](#6-fraud-radar-ai)
7. [Edge Normalize AI](#7-edge-normalize-ai)
8. [Checkout Cast AI](#8-checkout-cast-ai)
9. [Revocation Sense AI](#9-revocation-sense-ai)
10. [Context Locale AI](#10-context-locale-ai)

---

## 1. Atlas Routing AI

### 配送ルートの最適化

```typescript
import { ExtendedAIService } from '@vey/core';

const aiService: ExtendedAIService = createExtendedAIService({
  apiKey: process.env.VEY_AI_API_KEY,
});

// ラストワンマイル配送の最適化
const routeRequest = {
  addressPID: 'JP-13-113-01-T07-B12-BN02-R342',
  systemType: 'last_mile' as const,
  timeWindow: {
    start: '2024-12-02T14:00:00+09:00',
    end: '2024-12-02T18:00:00+09:00',
  },
  package: {
    weight: 2.5,
    dimensions: { width: 30, height: 20, depth: 15 },
    fragile: false,
  },
};

const routeResponse = await aiService.optimizeRoute(routeRequest);

if (routeResponse.success && routeResponse.formats.lastMile) {
  console.log(`配送順序: ${routeResponse.formats.lastMile.sequence}`);
  console.log(`座標: ${routeResponse.formats.lastMile.coordinates.lat}, ${routeResponse.formats.lastMile.coordinates.lon}`);
  console.log(`アクセス方法: ${routeResponse.formats.lastMile.accessInstructions}`);
  console.log(`推定配送時間: ${routeResponse.estimatedDeliveryTime}`);
  console.log(`効率スコア: ${routeResponse.efficiencyScore * 100}%`);
}
```

### ホテル予約システムとの統合

```typescript
// ホテル予約でのアクセス情報提供
const bookingRequest = {
  addressPID: 'JP-13-113-01',
  bookingType: 'hotel' as const,
  reservationTime: '2024-12-10T15:00:00+09:00',
  partySize: 2,
  specialRequests: ['早期チェックイン希望'],
};

const bookingResponse = await aiService.integrateBookingSystem(bookingRequest);

if (bookingResponse.success) {
  // 交通手段の提案
  bookingResponse.accessInstructions.transportation.forEach(method => {
    console.log(`${method.method}: ${method.duration}分, ${method.cost}円`);
    console.log(`  ${method.instructions}`);
  });

  // 駐車場情報
  if (bookingResponse.accessInstructions.parking?.available) {
    console.log(`駐車場: ${bookingResponse.accessInstructions.parking.type}`);
  }
}
```

---

## 2. GAP Oracle

### コンテキストベースの住所優先判定

```typescript
import { ExtendedAIService } from '@vey/core';

const aiService: ExtendedAIService = createExtendedAIService({
  apiKey: process.env.VEY_AI_API_KEY,
});

// ユーザーのコンテキストを取得
const userContext = {
  location: {
    latitude: 35.6812,
    longitude: 139.7671,
    accuracy: 10,
    country: 'JP',
  },
  timestamp: new Date().toISOString(),
  timeOfDay: 'afternoon' as const,
  dayOfWeek: 'monday' as const,
  deviceType: 'mobile' as const,
  serviceCategory: 'ecommerce' as const,
  userState: 'home' as const,
};

// 優先度判定リクエスト
const priorityRequest = {
  context: userContext,
  candidateAddresses: [
    'JP-13-113-01',  // 自宅
    'JP-13-101-02',  // 会社
    'JP-14-201-03',  // 実家
  ],
  maxResults: 3,
  includeExplanations: true,
};

const priorityResponse = await aiService.determinePriority(priorityRequest);

if (priorityResponse.success) {
  // ランク付けされた住所を表示
  priorityResponse.rankedAddresses.forEach((addr, index) => {
    console.log(`${index + 1}. ${addr.addressPID} (スコア: ${addr.score})`);
    console.log(`   理由: ${addr.reasons.join(', ')}`);
    console.log(`   信頼度: ${addr.confidence * 100}%`);
  });

  // 次に使う可能性が高い住所
  if (priorityResponse.predictedNextAddress) {
    console.log(`\n予測: ${priorityResponse.predictedNextAddress} を使う可能性が高いです`);
  }
}
```

### 決済トークンの優先判定

```typescript
// ECサイトでの決済手段の優先判定
const paymentContext = {
  ...userContext,
  serviceCategory: 'ecommerce' as const,
};

// 住所が決まったら、その住所に最適な決済手段を提案
const selectedAddressPID = priorityResponse.rankedAddresses[0].addressPID;

// この機能はLedger Link AIと組み合わせて使用
```

---

## 3. Schema Resolve AI

### 多様な住所形式の自動解決

```typescript
import { ExtendedAIService } from '@vey/core';

const aiService: ExtendedAIService = createExtendedAIService({
  apiKey: process.env.VEY_AI_API_KEY,
});

// 日本の住所を解決
const jpRequest = {
  rawAddress: '〒100-0001 東京都千代田区千代田1-1',
  countryHint: 'JP',
  languageHint: 'ja',
  resolutionLevel: 'full' as const,
};

const jpResponse = await aiService.resolveSchema(jpRequest);

if (jpResponse.success) {
  console.log('検出国:', jpResponse.detectedCountry);
  console.log('生成PID:', jpResponse.generatedPID);
  console.log('階層:');
  console.log('  国:', jpResponse.resolvedHierarchy.country);
  console.log('  都道府県:', jpResponse.resolvedHierarchy.admin1);
  console.log('  市区町村:', jpResponse.resolvedHierarchy.admin2);
  console.log('  郵便番号:', jpResponse.resolvedHierarchy.postalCode);
}

// アメリカの住所を解決
const usRequest = {
  rawAddress: '1600 Pennsylvania Avenue NW, Washington, DC 20500',
  resolutionLevel: 'full' as const,
};

const usResponse = await aiService.resolveSchema(usRequest);

if (usResponse.success) {
  console.log('検出国:', usResponse.detectedCountry);
  console.log('生成PID:', usResponse.generatedPID);
  console.log('階層:');
  console.log('  国:', usResponse.resolvedHierarchy.country);
  console.log('  州:', usResponse.resolvedHierarchy.admin1);
  console.log('  市:', usResponse.resolvedHierarchy.admin2);
  console.log('  通り:', usResponse.resolvedHierarchy.street);
}
```

---

## 4. Noise Block AI

### 検索結果のノイズ除去

```typescript
import { ExtendedAIService } from '@vey/core';

const aiService: ExtendedAIService = createExtendedAIService({
  apiKey: process.env.VEY_AI_API_KEY,
});

// ノイズフィルタリングリクエスト
const filterRequest = {
  query: '東京 配送',
  candidates: [
    { id: 'addr_1', type: 'address' as const, data: { pid: 'JP-13-113-01' } },
    { id: 'addr_2', type: 'address' as const, data: { pid: 'US-CA-SF-01' } },  // 配送エリア外
    { id: 'addr_3', type: 'address' as const, data: { pid: 'JP-14-201-02' } },
    { id: 'site_1', type: 'site' as const, data: { url: 'example.com' } },
    { id: 'site_2', type: 'site' as const, data: { url: 'invalid-site.com' } },  // サービス終了
  ],
  userContext: {
    timestamp: new Date().toISOString(),
    timeOfDay: 'afternoon' as const,
    dayOfWeek: 'monday' as const,
    deviceType: 'mobile' as const,
    location: { latitude: 35.6812, longitude: 139.7671, accuracy: 10 },
  },
  threshold: 0.5,
  includeBlocked: true,
};

const filterResponse = await aiService.filterNoise(filterRequest);

if (filterResponse.success) {
  console.log(`総候補数: ${filterResponse.statistics.totalCandidates}`);
  console.log(`フィルタ後: ${filterResponse.statistics.filteredCount}`);
  console.log(`除外: ${filterResponse.statistics.blockedCount}`);

  // 関連性の高い結果
  console.log('\n関連性の高い結果:');
  filterResponse.filteredResults.forEach(result => {
    console.log(`  ${result.id}: スコア ${result.relevanceScore.score}`);
    console.log(`    理由: ${result.relevanceScore.reasons.join(', ')}`);
  });

  // 除外された項目
  if (filterResponse.blockedItems && filterResponse.blockedItems.length > 0) {
    console.log('\n除外された項目:');
    filterResponse.blockedItems.forEach(blocked => {
      console.log(`  ${blocked.id}: ${blocked.blockReason} (重大度: ${blocked.severity})`);
    });
  }
}
```

---

## 5. Ledger Link AI

### 住所と決済・契約データの自動リンク

```typescript
import { ExtendedAIService } from '@vey/core';

const aiService: ExtendedAIService = createExtendedAIService({
  apiKey: process.env.VEY_AI_API_KEY,
});

// レジャーリンクリクエスト
const linkRequest = {
  addressPID: 'JP-13-113-01',
  includePayments: true,
  includeContracts: true,
  includeReservations: true,
  includeSubscriptions: true,
  minConfidence: 0.7,
};

const linkResponse = await aiService.linkLedgerData(linkRequest);

if (linkResponse.success) {
  console.log(`住所: ${linkResponse.addressPID}`);
  console.log('\nリンク済みデータ:');
  console.log(`  決済トークン: ${linkResponse.linkedDataSummary.paymentCount}件`);
  console.log(`  契約: ${linkResponse.linkedDataSummary.contractCount}件`);
  console.log(`  予約: ${linkResponse.linkedDataSummary.reservationCount}件`);
  console.log(`  サブスク: ${linkResponse.linkedDataSummary.subscriptionCount}件`);

  // 決済トークンの詳細
  if (linkResponse.linkedPayments && linkResponse.linkedPayments.length > 0) {
    console.log('\n推奨決済手段:');
    linkResponse.linkedPayments.forEach(payment => {
      console.log(`  ${payment.displayName}`);
      console.log(`    理由: ${payment.linkReason}`);
      console.log(`    信頼度: ${payment.confidence * 100}%`);
      console.log(`    相性スコア: ${payment.compatibilityScore * 100}%`);
    });
  }

  // 契約情報
  if (linkResponse.linkedContracts && linkResponse.linkedContracts.length > 0) {
    console.log('\n関連契約:');
    linkResponse.linkedContracts.forEach(contract => {
      console.log(`  ${contract.type}: ${contract.provider} (${contract.status})`);
    });
  }

  // 推奨アクション
  if (linkResponse.recommendations && linkResponse.recommendations.length > 0) {
    console.log('\n推奨アクション:');
    linkResponse.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
}
```

---

## 6. Fraud Radar AI

### リアルタイム不正検知

```typescript
import { ExtendedAIService } from '@vey/core';

const aiService: ExtendedAIService = createExtendedAIService({
  apiKey: process.env.VEY_AI_API_KEY,
});

// 不正検知リクエスト
const fraudRequest = {
  requestType: 'checkout' as const,
  metadata: {
    sourceIP: '203.0.113.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    sessionId: 'sess_123456',
    userId: 'user_789',
    timestamp: new Date().toISOString(),
  },
  payload: {
    addressPID: 'JP-13-113-01',
    paymentTokenId: 'tok_xxx',
    amount: 50000,
    currency: 'JPY',
  },
  historicalContext: {
    previousRequests: 50,
    previousFailures: 2,
    accountAge: 365,
  },
};

const fraudResponse = await aiService.detectFraud(fraudRequest);

console.log(`リスクレベル: ${fraudResponse.riskLevel}`);
console.log(`リスクスコア: ${fraudResponse.riskScore * 100}%`);
console.log(`推奨アクション: ${fraudResponse.recommendedAction}`);

// 検出された脅威
if (fraudResponse.threats && fraudResponse.threats.length > 0) {
  console.log('\n検出された脅威:');
  fraudResponse.threats.forEach(threat => {
    console.log(`  ${threat.pattern} (重大度: ${threat.severity})`);
    console.log(`    信頼度: ${threat.confidence * 100}%`);
    console.log(`    推奨: ${threat.recommendedAction}`);
  });
}

// アクションの実行
if (fraudResponse.recommendedAction === 'challenge') {
  console.log(`\nチャレンジが必要: ${fraudResponse.challengeType}`);
  // ユーザーに2FAやCAPTCHAを要求
} else if (fraudResponse.recommendedAction === 'block') {
  console.log('\nアクセスをブロックしました');
  // アクセスを拒否
} else {
  console.log('\nアクセスを許可');
  // 処理を続行
}
```

---

## 7. Edge Normalize AI

### 住所表記の正規化

```typescript
import { ExtendedAIService } from '@vey/core';

const aiService: ExtendedAIService = createExtendedAIService({
  apiKey: process.env.VEY_AI_API_KEY,
});

// 様々な表記の正規化
const variants = [
  '東京都 渋谷区 1-2-3',
  'Tokyo Shibuya 1-2-3',
  'とうきょうと しぶやく 1丁目2番3号',
  '東京都渋谷区1丁目2番3号',
];

for (const variant of variants) {
  const normRequest = {
    addressText: variant,
    countryHint: 'JP',
    options: {
      expandAbbreviations: true,
      standardizeNumbers: true,
    },
  };

  const normResponse = await aiService.normalizeAddress(normRequest);

  if (normResponse.success) {
    console.log(`\n入力: ${normResponse.original}`);
    console.log(`正規化: ${normResponse.normalized}`);
    console.log(`PID: ${normResponse.canonicalPID}`);
    console.log(`言語: ${normResponse.detectedLanguages.join(', ')}`);
  }
}
```

### 多言語対応

```typescript
// 多言語での住所表示
const multiLangRequest = {
  addressText: '東京都渋谷区1-2-3',
  countryHint: 'JP',
  languageHints: ['ja', 'en', 'zh', 'ko'],
};

const multiLangResponse = await aiService.normalizeAddress(multiLangRequest);

if (multiLangResponse.success) {
  console.log('多言語バリアント:');
  multiLangResponse.variants.forEach(variant => {
    console.log(`  ${variant.language}: ${variant.normalized}`);
  });
}
```

---

## 8. Checkout Cast AI

### ワンクリックチェックアウトの実現

```typescript
import { ExtendedAIService } from '@vey/core';

const aiService: ExtendedAIService = createExtendedAIService({
  apiKey: process.env.VEY_AI_API_KEY,
});

// UI最適化リクエスト
const uiRequest = {
  siteId: 'example-shop.com',
  siteCategory: 'ecommerce' as const,
  userContext: {
    timestamp: new Date().toISOString(),
    timeOfDay: 'afternoon' as const,
    dayOfWeek: 'monday' as const,
    deviceType: 'mobile' as const,
  },
  transactionData: {
    totalAmount: 5000,
    currency: 'JPY',
    itemCount: 3,
    deliveryRequired: true,
  },
  deviceCapabilities: {
    screenSize: 'small' as const,
    touchEnabled: true,
    oneClickEnabled: true,
  },
};

const uiResponse = await aiService.optimizeCheckoutUI(uiRequest);

if (uiResponse.success) {
  console.log('最適化されたチェックアウトフロー:');
  console.log(`  総ステップ数: ${uiResponse.checkoutFlow.steps.length}`);
  console.log(`  推定時間: ${uiResponse.checkoutFlow.estimatedTotalTime}秒`);
  console.log(`  クリック数: ${uiResponse.checkoutFlow.totalClicks}`);

  // 各ステップの詳細
  uiResponse.checkoutFlow.steps.forEach(step => {
    const prefilledMark = step.prefilled ? '✓' : '○';
    console.log(`  ${prefilledMark} Step ${step.step}: ${step.displayName}`);
    if (step.prefilled && step.prefilledData) {
      console.log(`      事前入力: ${JSON.stringify(step.prefilledData)}`);
    }
  });

  // 事前選択されたオプション
  if (uiResponse.preselectedOptions) {
    console.log('\n事前選択:');
    if (uiResponse.preselectedOptions.addressPID) {
      console.log(`  住所: ${uiResponse.preselectedOptions.addressPID}`);
    }
    if (uiResponse.preselectedOptions.paymentTokenId) {
      console.log(`  決済: ${uiResponse.preselectedOptions.paymentTokenId}`);
    }
  }
}
```

### フォーム自動入力

```typescript
// ホテル予約フォームの自動入力
const autoFillRequest = {
  formType: 'booking' as const,
  siteId: 'hotel-booking.com',
  formFields: [
    { fieldName: 'firstName', fieldType: 'text', required: true },
    { fieldName: 'lastName', fieldType: 'text', required: true },
    { fieldName: 'email', fieldType: 'email', required: true },
    { fieldName: 'phone', fieldType: 'tel', required: true },
    { fieldName: 'address', fieldType: 'address', required: true },
  ],
  userContext: {
    timestamp: new Date().toISOString(),
    timeOfDay: 'afternoon' as const,
    dayOfWeek: 'monday' as const,
    deviceType: 'mobile' as const,
  },
};

const autoFillResponse = await aiService.autoFillForm(autoFillRequest);

if (autoFillResponse.success) {
  console.log('自動入力されたフィールド:');
  Object.entries(autoFillResponse.filledFields).forEach(([field, data]) => {
    console.log(`  ${field}: ${data.value} (信頼度: ${data.confidence * 100}%)`);
    console.log(`    ソース: ${data.source}`);
  });

  if (autoFillResponse.missingFields.length > 0) {
    console.log('\n未入力フィールド:');
    autoFillResponse.missingFields.forEach(field => console.log(`  - ${field}`));
  }
}
```

---

## 9. Revocation Sense AI

### 解除候補の自動検出

```typescript
import { ExtendedAIService } from '@vey/core';

const aiService: ExtendedAIService = createExtendedAIService({
  apiKey: process.env.VEY_AI_API_KEY,
});

// 解除予測リクエスト
const revocationRequest = {
  userId: 'user_123',
  includeAllPartnerships: true,
  minRiskThreshold: 0.5,
  analysisDepth: 'standard' as const,
};

const revocationResponse = await aiService.predictRevocation(revocationRequest);

if (revocationResponse.success) {
  console.log(`解除候補: ${revocationResponse.candidates.length}件\n`);

  // 解除候補の詳細
  revocationResponse.candidates.forEach(candidate => {
    console.log(`サイト: ${candidate.siteName}`);
    console.log(`  リスクスコア: ${candidate.riskScore * 100}%`);
    console.log(`  推奨アクション: ${candidate.recommendedAction}`);
    console.log(`  未使用期間: ${candidate.daysInactive}日`);
    console.log(`  理由:`);
    candidate.reasons.forEach(reason => {
      console.log(`    - ${reason.reason} (重大度: ${reason.severity})`);
    });
    console.log('');
  });

  // ユーザーの解除意図
  if (revocationResponse.intentPrediction) {
    console.log('解除意図予測:');
    console.log(`  解除の可能性: ${revocationResponse.intentPrediction.likelyToRevoke ? 'はい' : 'いいえ'}`);
    console.log(`  信頼度: ${revocationResponse.intentPrediction.confidence * 100}%`);
    console.log(`  予測時期: ${revocationResponse.intentPrediction.predictedTimeline}`);
  }
}
```

### 一括解除の実行

```typescript
// ユーザーが解除を決定した場合
const sitesToRevoke = revocationResponse.candidates
  .filter(c => c.recommendedAction === 'revoke' && c.riskScore > 0.7)
  .map(c => c.siteId);

if (sitesToRevoke.length > 0) {
  const executeRequest = {
    siteIds: sitesToRevoke,
    revocationType: 'soft' as const,  // ソフト解除（データは保持）
    reason: 'ユーザーによる一括解除',
  };

  const executeResponse = await aiService.executeRevocation(executeRequest);

  if (executeResponse.success) {
    console.log(`解除完了: ${executeResponse.revokedSites.length}件`);
    
    executeResponse.revokedSites.forEach(site => {
      console.log(`\n${site.siteId}: ${site.status}`);
      if (site.impact) {
        console.log('影響:');
        console.log('  プラス:', site.impact.positiveImpacts.join(', '));
        if (site.impact.negativeImpacts.length > 0) {
          console.log('  マイナス:', site.impact.negativeImpacts.join(', '));
        }
      }
    });
  }
}
```

---

## 10. Context Locale AI

### コンテキスト認識による住所フィルタリング

```typescript
import { ExtendedAIService } from '@vey/core';

const aiService: ExtendedAIService = createExtendedAIService({
  apiKey: process.env.VEY_AI_API_KEY,
});

// 多次元コンテキストの定義
const context = {
  geographic: {
    currentCountry: 'JP',
    currentRegion: '13',
    timezone: 'Asia/Tokyo',
    language: 'ja',
  },
  temporal: {
    timestamp: new Date().toISOString(),
    dayOfWeek: 'Monday',
    season: 'winter' as const,
    holiday: false,
    businessHours: true,
  },
  service: {
    category: 'ecommerce',
    subcategory: 'electronics',
    deliveryMethod: 'standard',
    paymentCurrency: 'JPY',
  },
  device: {
    type: 'mobile' as const,
    os: 'iOS',
    browser: 'Safari',
    screenSize: 'small' as const,
  },
  user: {
    preferredLanguage: 'ja',
    homeCountry: 'JP',
    currentLocation: 'home' as const,
  },
};

// コンテキストフィルタリングリクエスト
const filterRequest = {
  context,
  candidateAddresses: [
    'JP-13-113-01',  // 東京の自宅
    'US-CA-SF-01',   // サンフランシスコの住所
    'JP-14-201-02',  // 大阪の住所
    'JP-27-101-03',  // 大阪の別の住所
  ],
  strictMode: true,
  maxResults: 5,
};

const filterResponse = await aiService.filterByContext(filterRequest);

if (filterResponse.success) {
  console.log(`総候補数: ${filterResponse.statistics.totalCandidates}`);
  console.log(`フィルタ後: ${filterResponse.statistics.filteredCount}`);
  console.log(`除外: ${filterResponse.statistics.excludedCount}\n`);

  // 適用されたコンテキスト
  console.log('検出シナリオ:', filterResponse.appliedContext.detectedScenario);
  console.log(`信頼度: ${filterResponse.appliedContext.confidence * 100}%\n`);

  // フィルタリング結果
  console.log('絞り込まれた住所:');
  filterResponse.filteredAddresses.forEach(addr => {
    console.log(`\n${addr.addressPID}`);
    console.log(`  表示: ${addr.display.primaryDisplay}`);
    console.log(`  ローマ字: ${addr.display.romanizedDisplay}`);
    console.log(`  関連性: ${addr.relevanceScore * 100}%`);
    console.log(`  マッチルール: ${addr.matchedRules.join(', ')}`);
  });

  // 通貨情報
  if (filterResponse.currencyInfo) {
    console.log(`\n表示通貨: ${filterResponse.currencyInfo.displayCurrency}`);
    if (filterResponse.currencyInfo.exchangeRate) {
      console.log(`為替レート: ${filterResponse.currencyInfo.exchangeRate}`);
    }
  }
}
```

### カスタムフィルタリングルール

```typescript
// カスタムルールを追加
const customFilterRequest = {
  context,
  candidateAddresses: ['JP-13-113-01', 'JP-14-201-02', 'JP-27-101-03'],
  customRules: [
    {
      name: 'business_hours_delivery_only',
      type: 'exclude' as const,
      conditions: [
        {
          field: 'businessHours',
          operator: 'equals' as const,
          value: false,
        },
      ],
      priority: 1,
    },
    {
      name: 'prefer_tokyo_addresses',
      type: 'prioritize' as const,
      conditions: [
        {
          field: 'region',
          operator: 'equals' as const,
          value: '13',
        },
      ],
      priority: 2,
    },
  ],
  maxResults: 3,
};

const customFilterResponse = await aiService.filterByContext(customFilterRequest);

if (customFilterResponse.success) {
  console.log('カスタムルール適用後の結果:');
  customFilterResponse.filteredAddresses.forEach(addr => {
    console.log(`  ${addr.addressPID}: ${addr.relevanceScore * 100}%`);
  });
}
```

---

## まとめ / Summary

これらの使用例は、10個の拡張AI機能の実践的な活用方法を示しています。各機能は単独でも強力ですが、組み合わせることでさらに高度な住所管理システムを構築できます。

### 推奨される組み合わせ

1. **配送最適化**: Atlas Routing AI + Context Locale AI
2. **ユーザー体験向上**: GAP Oracle + Checkout Cast AI + Ledger Link AI
3. **セキュリティ強化**: Fraud Radar AI + Noise Block AI
4. **データ品質**: Schema Resolve AI + Edge Normalize AI
5. **プライバシー管理**: Revocation Sense AI + Context Locale AI

詳細は各AI機能のドキュメントをご参照ください。

---

## 関連ドキュメント / Related Documentation

- [AI機能拡張戦略](./ai-capabilities-extended.md) - 10個の拡張AI機能の詳細
- [AI機能強化戦略](./ai-capabilities.md) - 基本5つのAI機能
- [TypeScript API Reference](../sdk/core/src/ai-extended.ts) - 型定義
- [Test Examples](../sdk/core/tests/ai-extended.test.ts) - テストコード

---

**🚀 Extended AI-Powered Features** - Building the Future of Address Management
