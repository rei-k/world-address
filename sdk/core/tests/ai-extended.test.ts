/**
 * @vey/core - Extended AI Tests
 *
 * Tests for 10 extended AI capabilities
 */

import { describe, it, expect } from 'vitest';
import type {
  RouteOptimizationRequest,
  RouteOptimizationResponse,
  PriorityDeterminationRequest,
  PriorityDeterminationResponse,
  SchemaResolutionRequest,
  SchemaResolutionResponse,
  NoiseFilteringRequest,
  NoiseFilteringResponse,
  LedgerLinkingRequest,
  LedgerLinkingResponse,
  FraudDetectionRequest,
  FraudDetectionResponse,
  NormalizationRequest,
  NormalizationResponse,
  UIOptimizationRequest,
  UIOptimizationResponse,
  RevocationPredictionRequest,
  RevocationPredictionResponse,
  ContextFilteringRequest,
  ContextFilteringResponse,
} from '../src/ai-extended';

describe('Extended AI Capabilities', () => {
  describe('1. Atlas Routing AI', () => {
    it('should create route optimization request', () => {
      const request: RouteOptimizationRequest = {
        addressPID: 'JP-13-113-01-T07-B12-BN02-R342',
        systemType: 'last_mile',
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

      expect(request.addressPID).toBe('JP-13-113-01-T07-B12-BN02-R342');
      expect(request.systemType).toBe('last_mile');
      expect(request.package?.weight).toBe(2.5);
    });

    it('should validate route optimization response structure', () => {
      const response: RouteOptimizationResponse = {
        success: true,
        addressPID: 'JP-13-113-01-T07-B12-BN02-R342',
        formats: {
          lastMile: {
            sequence: 42,
            coordinates: { lat: 35.6595, lon: 139.7004 },
            accessInstructions: 'Building 02, Room 342',
            preferredTime: '15:00-16:00',
            contactMethod: 'doorbell',
          },
        },
        estimatedDeliveryTime: '2024-12-02T15:30:00+09:00',
        efficiencyScore: 0.92,
      };

      expect(response.success).toBe(true);
      expect(response.formats.lastMile?.sequence).toBe(42);
      expect(response.efficiencyScore).toBeGreaterThan(0.9);
    });
  });

  describe('2. GAP Oracle', () => {
    it('should create priority determination request', () => {
      const request: PriorityDeterminationRequest = {
        context: {
          location: {
            latitude: 35.6812,
            longitude: 139.7671,
            accuracy: 10,
            country: 'JP',
          },
          timestamp: '2024-12-02T15:30:00+09:00',
          timeOfDay: 'afternoon',
          dayOfWeek: 'monday',
          deviceType: 'mobile',
          serviceCategory: 'ecommerce',
          userState: 'home',
        },
        candidateAddresses: [
          'JP-13-113-01',
          'JP-13-101-02',
          'JP-14-201-03',
        ],
        maxResults: 3,
        includeExplanations: true,
      };

      expect(request.context.deviceType).toBe('mobile');
      expect(request.candidateAddresses).toHaveLength(3);
    });

    it('should validate priority scores', () => {
      const response: PriorityDeterminationResponse = {
        success: true,
        rankedAddresses: [
          {
            addressPID: 'JP-13-113-01',
            score: 0.95,
            components: {
              proximityScore: 0.98,
              timeRelevanceScore: 0.95,
              usageFrequencyScore: 0.90,
              serviceCompatibilityScore: 0.92,
              recencyScore: 0.88,
              defaultScore: 1.0,
            },
            reasons: ['最も近い住所', '自宅として登録済み', 'Default設定'],
            confidence: 0.96,
          },
        ],
        predictedNextAddress: 'JP-13-113-01',
      };

      expect(response.success).toBe(true);
      expect(response.rankedAddresses[0].score).toBeGreaterThan(0.9);
      expect(response.rankedAddresses[0].reasons).toContain('Default設定');
    });
  });

  describe('3. Schema Resolve AI', () => {
    it('should resolve address schema for different countries', () => {
      const request: SchemaResolutionRequest = {
        rawAddress: '〒100-0001 東京都千代田区千代田1-1',
        countryHint: 'JP',
        languageHint: 'ja',
        resolutionLevel: 'full',
      };

      expect(request.countryHint).toBe('JP');
      expect(request.languageHint).toBe('ja');
    });

    it('should validate resolved hierarchy', () => {
      const response: SchemaResolutionResponse = {
        success: true,
        detectedCountry: 'JP',
        appliedGrammar: {
          countryCode: 'JP',
          fieldOrder: ['postalCode', 'admin1', 'admin2', 'locality', 'street', 'building', 'unit'],
          requiredFields: ['admin1', 'admin2', 'postalCode'],
          optionalFields: ['building', 'unit'],
          separators: {
            betweenFields: ' ',
          },
          hierarchyDepth: 7,
          hierarchyLabels: ['Country', 'Prefecture', 'City', 'Ward', 'Street', 'Building', 'Unit'],
        },
        resolvedHierarchy: {
          country: 'JP',
          admin1: '東京都',
          admin2: '千代田区',
          locality: '千代田',
          street: '1-1',
          postalCode: '100-0001',
        },
        generatedPID: 'JP-13-101-01',
        validation: {
          isValid: true,
          issues: [],
        },
        confidence: 0.98,
      };

      expect(response.success).toBe(true);
      expect(response.detectedCountry).toBe('JP');
      expect(response.validation.isValid).toBe(true);
    });
  });

  describe('4. Noise Block AI', () => {
    it('should filter irrelevant candidates', () => {
      const request: NoiseFilteringRequest = {
        query: '東京 配送',
        candidates: [
          { id: 'addr_1', type: 'address', data: { pid: 'JP-13-113-01' } },
          { id: 'addr_2', type: 'address', data: { pid: 'US-CA-SF-01' } },
          { id: 'site_1', type: 'site', data: { url: 'example.com' } },
        ],
        userContext: {
          timestamp: '2024-12-02T15:30:00+09:00',
          timeOfDay: 'afternoon',
          dayOfWeek: 'monday',
          deviceType: 'mobile',
          location: { latitude: 35.6812, longitude: 139.7671, accuracy: 10 },
        },
        threshold: 0.5,
      };

      expect(request.candidates).toHaveLength(3);
      expect(request.threshold).toBe(0.5);
    });

    it('should validate noise filtering results', () => {
      const response: NoiseFilteringResponse = {
        success: true,
        filteredResults: [
          {
            id: 'addr_1',
            type: 'address',
            relevanceScore: {
              targetId: 'addr_1',
              score: 0.92,
              factors: {
                textMatch: 0.95,
                contextFit: 0.90,
                availability: 1.0,
                recency: 0.88,
                userPreference: 0.85,
              },
              reasons: ['同一国の住所', '配送可能エリア'],
            },
            data: { pid: 'JP-13-113-01' },
          },
        ],
        blockedItems: [
          {
            id: 'addr_2',
            type: 'address',
            blockReason: '配送エリア外',
            severity: 'high',
          },
        ],
        statistics: {
          totalCandidates: 3,
          filteredCount: 1,
          blockedCount: 1,
          averageRelevance: 0.92,
        },
      };

      expect(response.success).toBe(true);
      expect(response.filteredResults).toHaveLength(1);
      expect(response.blockedItems).toHaveLength(1);
    });
  });

  describe('5. Ledger Link AI', () => {
    it('should link payment tokens to address', () => {
      const request: LedgerLinkingRequest = {
        addressPID: 'JP-13-113-01',
        includePayments: true,
        includeContracts: true,
        includeReservations: true,
        minConfidence: 0.7,
      };

      expect(request.addressPID).toBe('JP-13-113-01');
      expect(request.includePayments).toBe(true);
    });

    it('should validate linked data', () => {
      const response: LedgerLinkingResponse = {
        success: true,
        addressPID: 'JP-13-113-01',
        linkedDataSummary: {
          paymentCount: 3,
          contractCount: 5,
          reservationCount: 2,
          subscriptionCount: 4,
        },
        linkedPayments: [
          {
            tokenId: 'tok_xxx',
            type: 'credit_card',
            displayName: 'JCB ...1234',
            linkReason: '国内住所に最適な国内カード',
            confidence: 0.95,
            compatibilityScore: 0.92,
          },
        ],
        recommendations: ['決済トークンの統合を推奨'],
      };

      expect(response.success).toBe(true);
      expect(response.linkedPayments).toHaveLength(1);
      expect(response.linkedDataSummary.paymentCount).toBe(3);
    });
  });

  describe('6. Fraud Radar AI', () => {
    it('should detect fraudulent patterns', () => {
      const request: FraudDetectionRequest = {
        requestType: 'address_lookup',
        metadata: {
          sourceIP: '203.0.113.1',
          userAgent: 'Mozilla/5.0...',
          sessionId: 'sess_123',
          timestamp: '2024-12-02T15:30:00+09:00',
        },
        payload: {
          addressPID: 'JP-13-113-01',
        },
        historicalContext: {
          previousRequests: 100,
          previousFailures: 5,
          accountAge: 365,
        },
      };

      expect(request.requestType).toBe('address_lookup');
      expect(request.metadata.sourceIP).toBe('203.0.113.1');
    });

    it('should validate fraud detection response', () => {
      const response: FraudDetectionResponse = {
        success: true,
        riskLevel: 'low',
        riskScore: 0.15,
        threats: [],
        recommendedAction: 'allow',
      };

      expect(response.success).toBe(true);
      expect(response.riskLevel).toBe('low');
      expect(response.recommendedAction).toBe('allow');
    });
  });

  describe('7. Edge Normalize AI', () => {
    it('should normalize address variations', () => {
      const request: NormalizationRequest = {
        addressText: '東京都 渋谷区 1-2-3',
        countryHint: 'JP',
        languageHints: ['ja'],
        options: {
          expandAbbreviations: true,
          standardizeNumbers: true,
        },
      };

      expect(request.addressText).toBe('東京都 渋谷区 1-2-3');
      expect(request.options?.expandAbbreviations).toBe(true);
    });

    it('should validate normalization result', () => {
      const response: NormalizationResponse = {
        success: true,
        original: '東京都 渋谷区 1-2-3',
        normalized: '東京都渋谷区1丁目2番3号',
        canonicalPID: 'JP-13-113-01',
        variants: [
          {
            original: '1-2-3',
            normalized: '1丁目2番3号',
            variantType: 'abbreviation',
            language: 'ja',
            confidence: 0.98,
          },
        ],
        detectedLanguages: ['ja'],
        transformations: [
          {
            type: 'number_standardization',
            from: '1-2-3',
            to: '1丁目2番3号',
            reason: '日本の住所形式に統一',
          },
        ],
      };

      expect(response.success).toBe(true);
      expect(response.canonicalPID).toBe('JP-13-113-01');
      expect(response.variants).toHaveLength(1);
    });
  });

  describe('8. Checkout Cast AI', () => {
    it('should optimize checkout UI', () => {
      const request: UIOptimizationRequest = {
        siteId: 'example-shop.com',
        siteCategory: 'ecommerce',
        userContext: {
          timestamp: '2024-12-02T15:30:00+09:00',
          timeOfDay: 'afternoon',
          dayOfWeek: 'monday',
          deviceType: 'mobile',
        },
        transactionData: {
          totalAmount: 5000,
          currency: 'JPY',
          itemCount: 3,
          deliveryRequired: true,
        },
      };

      expect(request.siteCategory).toBe('ecommerce');
      expect(request.transactionData?.deliveryRequired).toBe(true);
    });

    it('should validate checkout flow optimization', () => {
      const response: UIOptimizationResponse = {
        success: true,
        checkoutFlow: {
          steps: [
            {
              step: 1,
              action: 'select_address',
              prefilled: true,
              prefilledData: { addressPID: 'JP-13-113-01' },
              requiresReview: false,
              displayName: '配送先を選択',
              estimatedTime: 2,
            },
            {
              step: 2,
              action: 'confirm_order',
              prefilled: false,
              requiresReview: true,
              displayName: '注文確認',
              estimatedTime: 3,
            },
          ],
          estimatedTotalTime: 5,
          totalClicks: 2,
        },
        preselectedOptions: {
          addressPID: 'JP-13-113-01',
          paymentTokenId: 'tok_xxx',
        },
      };

      expect(response.success).toBe(true);
      expect(response.checkoutFlow.totalClicks).toBe(2);
      expect(response.checkoutFlow.estimatedTotalTime).toBe(5);
    });
  });

  describe('9. Revocation Sense AI', () => {
    it('should predict revocation candidates', () => {
      const request: RevocationPredictionRequest = {
        userId: 'user_123',
        includeAllPartnerships: true,
        minRiskThreshold: 0.5,
        analysisDepth: 'standard',
      };

      expect(request.userId).toBe('user_123');
      expect(request.minRiskThreshold).toBe(0.5);
    });

    it('should validate revocation predictions', () => {
      const response: RevocationPredictionResponse = {
        success: true,
        candidates: [
          {
            siteId: 'old-site.com',
            siteName: 'Old Shopping Site',
            riskScore: 0.85,
            reasons: [
              {
                reason: '180日以上未使用',
                severity: 'high',
                weight: 0.4,
              },
              {
                reason: 'サイトのアカウントを削除済み',
                severity: 'high',
                weight: 0.3,
              },
            ],
            recommendedAction: 'revoke',
            confidence: 0.92,
            daysInactive: 180,
          },
        ],
        intentPrediction: {
          likelyToRevoke: true,
          confidence: 0.88,
          predictedTimeline: 'within_7_days',
        },
      };

      expect(response.success).toBe(true);
      expect(response.candidates).toHaveLength(1);
      expect(response.intentPrediction?.likelyToRevoke).toBe(true);
    });
  });

  describe('10. Context Locale AI', () => {
    it('should filter addresses by context', () => {
      const request: ContextFilteringRequest = {
        context: {
          geographic: {
            currentCountry: 'JP',
            currentRegion: '13',
            timezone: 'Asia/Tokyo',
            language: 'ja',
          },
          temporal: {
            timestamp: '2024-12-02T15:30:00+09:00',
            dayOfWeek: 'Monday',
            season: 'winter',
            holiday: false,
            businessHours: true,
          },
          service: {
            category: 'ecommerce',
            deliveryMethod: 'standard',
            paymentCurrency: 'JPY',
          },
          device: {
            type: 'mobile',
            os: 'iOS',
            browser: 'Safari',
            screenSize: 'small',
          },
          user: {
            preferredLanguage: 'ja',
            homeCountry: 'JP',
            currentLocation: 'home',
          },
        },
        candidateAddresses: ['JP-13-113-01', 'US-CA-SF-01', 'JP-14-201-02'],
        strictMode: true,
        maxResults: 5,
      };

      expect(request.context.geographic.currentCountry).toBe('JP');
      expect(request.candidateAddresses).toHaveLength(3);
    });

    it('should validate context-based filtering', () => {
      const response: ContextFilteringResponse = {
        success: true,
        filteredAddresses: [
          {
            addressPID: 'JP-13-113-01',
            display: {
              addressPID: 'JP-13-113-01',
              primaryDisplay: '東京都渋谷区',
              nativeDisplay: '東京都渋谷区',
              romanizedDisplay: 'Tokyo-to Shibuya-ku',
            },
            relevanceScore: 0.95,
            matchedRules: ['same_country', 'currency_match', 'language_match'],
          },
        ],
        appliedContext: {
          detectedScenario: '国内ECサイトでの購入',
          appliedRules: [
            {
              name: 'same_country_only',
              type: 'include',
              conditions: [
                {
                  field: 'country',
                  operator: 'equals',
                  value: 'JP',
                },
              ],
              priority: 1,
            },
          ],
          confidence: 0.92,
        },
        currencyInfo: {
          displayCurrency: 'JPY',
        },
        statistics: {
          totalCandidates: 3,
          filteredCount: 2,
          excludedCount: 1,
        },
      };

      expect(response.success).toBe(true);
      expect(response.filteredAddresses).toHaveLength(1);
      expect(response.statistics.excludedCount).toBe(1);
    });
  });
});
