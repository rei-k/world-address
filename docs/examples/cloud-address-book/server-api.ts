/**
 * クラウド住所帳システム - サーバーサイドAPI実装例
 * Cloud Address Book System - Server-side API Implementation
 * 
 * このファイルは、cloud-address-book-architecture.md の
 * Section 6 (APIエンドポイント設計) で定義された
 * サーバーサイド API の実装例です。
 * 
 * This file provides server-side API implementation examples
 * defined in Section 6 (API Endpoint Design) of
 * cloud-address-book-architecture.md
 * 
 * 注意: これは実装例です。本番環境では以下が必要です:
 * - 実際のデータベース接続
 * - 適切な認証・認可
 * - エラーハンドリング
 * - レート制限
 * - ロギング
 * 
 * Note: This is example code. Production use requires:
 * - Actual database connections
 * - Proper authentication/authorization
 * - Error handling
 * - Rate limiting
 * - Logging
 */

import {
  normalizeAddress,
  encodePID,
  decodePID,
  validatePID,
  createAddressPIDCredential,
  signCredential,
  verifyCredential,
  encryptAddress,
  decryptAddress,
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
  validateShippingRequest,
  createZKPWaybill,
  resolvePID,
  validateAccessPolicy,
  createAuditLogEntry,
  createRevocationEntry,
  createRevocationList,
  isPIDRevoked,
  signRevocationList,
} from '@vey/core';

import type {
  AddressEntry,
  FriendEntry,
  RevocationEntry,
  AccessLogEntry,
  NormalizedAddress,
  VerifiableCredential,
  ZKCircuit,
  ZKProof,
  ZKPWaybill,
  ShippingCondition,
  ShippingValidationRequest,
  ShippingValidationResponse,
  PIDResolutionRequest,
  PIDResolutionResponse,
  AccessControlPolicy,
} from '@vey/core';

// ============================================================================
// Section 6.1: Address Provider API
// ============================================================================

/**
 * Address Provider API クラス
 * 
 * cloud-address-book-architecture.md の Section 6.1 に対応
 */
export class AddressProviderAPI {
  private db: Map<string, AddressEntry> = new Map();
  private vcStore: Map<string, VerifiableCredential> = new Map();
  private revocationList: RevocationEntry[] = [];
  private auditLogs: AccessLogEntry[] = [];
  
  /**
   * POST /v1/addresses - 新規住所登録
   * 
   * @param request - 住所登録リクエスト
   * @returns 作成された住所エントリ
   */
  async createAddress(request: {
    user_did: string;
    user_private_key: string;
    raw_address: any;
    label?: string;
  }): Promise<{ id: string; pid: string; vc: VerifiableCredential }> {
    // Step 1: 住所正規化
    const normalized = await normalizeAddress(request.raw_address, request.raw_address.country);
    
    // Step 2: PID 生成
    const pid = encodePID(normalized);
    
    // Step 3: VC 発行
    const providerDid = 'did:web:vey.example';
    const vc = createAddressPIDCredential(
      request.user_did,
      providerDid,
      pid,
      normalized.countryCode,
      normalized.admin1,
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    );
    
    // Step 4: VC に署名
    const signedVC = await signCredential(
      vc,
      request.user_private_key,
      `${request.user_did}#key-1`
    );
    
    // Step 5: 暗号化
    const encryptedLocal = await encryptAddress(
      JSON.stringify(request.raw_address),
      request.user_private_key
    );
    const encryptedEn = await encryptAddress(
      JSON.stringify(normalized),
      request.user_private_key
    );
    
    // Step 6: 保存
    const id = `addr-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const addressEntry: AddressEntry = {
      id,
      user_did: request.user_did,
      pid,
      encrypted_address_local: encryptedLocal.ciphertext,
      encrypted_address_en: encryptedEn.ciphertext,
      encryption_algorithm: 'AES-256-GCM',
      encryption_iv: encryptedLocal.iv,
      country_code: normalized.countryCode,
      admin1_code: normalized.admin1,
      admin2_code: normalized.admin2,
      signature: signedVC.proof?.proofValue || '',
      vc_id: signedVC.id,
      is_revoked: false,
      is_primary: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      label: request.label,
    };
    
    this.db.set(id, addressEntry);
    this.vcStore.set(signedVC.id, signedVC);
    
    return { id, pid, vc: signedVC };
  }
  
  /**
   * GET /v1/addresses - 住所一覧取得
   * 
   * @param user_did - ユーザー DID
   * @returns 住所エントリの配列
   */
  async listAddresses(user_did: string): Promise<AddressEntry[]> {
    const addresses: AddressEntry[] = [];
    for (const entry of this.db.values()) {
      if (entry.user_did === user_did) {
        addresses.push(entry);
      }
    }
    return addresses;
  }
  
  /**
   * GET /v1/addresses/{id} - 特定住所取得
   * 
   * @param id - 住所エントリ ID
   * @returns 住所エントリまたは null
   */
  async getAddress(id: string): Promise<AddressEntry | null> {
    return this.db.get(id) || null;
  }
  
  /**
   * PUT /v1/addresses/{id} - 住所更新
   * 
   * @param id - 住所エントリ ID
   * @param updates - 更新内容
   * @returns 更新された住所エントリ
   */
  async updateAddress(id: string, updates: Partial<AddressEntry>): Promise<AddressEntry | null> {
    const existing = this.db.get(id);
    if (!existing) {
      return null;
    }
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    this.db.set(id, updated);
    return updated;
  }
  
  /**
   * DELETE /v1/addresses/{id} - 住所削除（論理削除）
   * 
   * @param id - 住所エントリ ID
   * @returns 成功/失敗
   */
  async deleteAddress(id: string): Promise<{ success: boolean }> {
    const existing = this.db.get(id);
    if (!existing) {
      return { success: false };
    }
    
    // 論理削除
    existing.is_revoked = true;
    existing.revoked_at = new Date().toISOString();
    this.db.set(id, existing);
    
    return { success: true };
  }
  
  /**
   * POST /v1/addresses/normalize - 住所正規化
   * 
   * @param raw_address - 生住所
   * @param country_code - 国コード
   * @returns 正規化された住所
   */
  async normalizeAddressAPI(
    raw_address: any,
    country_code: string
  ): Promise<NormalizedAddress> {
    return await normalizeAddress(raw_address, country_code);
  }
  
  /**
   * POST /v1/addresses/validate - 住所検証
   * 
   * @param address - 住所データ
   * @param country_code - 国コード
   * @returns 検証結果
   */
  async validateAddress(
    address: any,
    country_code: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const normalized = await normalizeAddress(address, country_code);
      return { valid: true, errors: [] };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

// ============================================================================
// Section 6.2: PID Management API
// ============================================================================

/**
 * PID Management API クラス
 */
export class PIDManagementAPI {
  private revocationList: RevocationEntry[] = [];
  private auditLogs: AccessLogEntry[] = [];
  
  /**
   * POST /v1/pid/generate - PID 生成
   * 
   * @param normalized - 正規化された住所
   * @returns 生成された PID
   */
  async generatePID(normalized: NormalizedAddress): Promise<{ pid: string }> {
    const pid = encodePID(normalized);
    return { pid };
  }
  
  /**
   * GET /v1/pid/{pid} - PID 検証
   * 
   * @param pid - PID
   * @returns 検証結果
   */
  async verifyPID(pid: string): Promise<{
    valid: boolean;
    components?: any;
    errors?: string[];
  }> {
    const validation = validatePID(pid);
    
    if (validation.valid) {
      const components = decodePID(pid);
      return { valid: true, components };
    } else {
      return {
        valid: false,
        errors: validation.errors?.map(e => e.message) || [],
      };
    }
  }
  
  /**
   * POST /v1/pid/resolve - PID 解決（要認証）
   * 
   * @param request - PID 解決リクエスト
   * @returns 解決結果
   */
  async resolvePIDAPI(request: PIDResolutionRequest): Promise<PIDResolutionResponse> {
    // アクセス権チェック
    const policy: AccessControlPolicy = {
      id: 'resolve-policy',
      principal: request.requesterId,
      resource: request.pid,
      action: 'resolve',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    
    const allowed = validateAccessPolicy(
      policy,
      request.requesterId,
      request.pid,
      'resolve'
    );
    
    if (!allowed) {
      // 監査ログ記録（拒否）
      const auditLog = createAuditLogEntry(
        request.pid,
        request.requesterId,
        'resolve',
        'denied',
        {
          reason: 'Access denied',
          timestamp: new Date().toISOString(),
        }
      );
      this.auditLogs.push(auditLog);
      
      return {
        success: false,
        error: 'Access denied',
      };
    }
    
    // 監査ログ記録（成功）
    const auditLog = createAuditLogEntry(
      request.pid,
      request.requesterId,
      'resolve',
      'success',
      {
        reason: request.reason || 'PID resolution',
        timestamp: new Date().toISOString(),
      }
    );
    this.auditLogs.push(auditLog);
    
    // 実際の解決処理
    const result = await resolvePID(
      request.pid,
      request.requesterId,
      request.accessToken,
      request.reason || '',
      policy
    );
    
    return result;
  }
  
  /**
   * GET /v1/pid/{pid}/revocation - 失効状態確認
   * 
   * @param pid - PID
   * @returns 失効状態
   */
  async getRevocationStatus(pid: string): Promise<{
    isRevoked: boolean;
    entry?: RevocationEntry;
  }> {
    const isRevoked = await isPIDRevoked(pid, this.revocationList);
    
    if (isRevoked) {
      const entry = this.revocationList.find(e => e.pid === pid);
      return { isRevoked: true, entry };
    }
    
    return { isRevoked: false };
  }
}

// ============================================================================
// Section 6.3: VC Management API
// ============================================================================

/**
 * VC (Verifiable Credential) Management API クラス
 */
export class VCManagementAPI {
  private vcStore: Map<string, VerifiableCredential> = new Map();
  
  /**
   * POST /v1/credentials/issue - VC 発行
   * 
   * @param request - VC 発行リクエスト
   * @returns 発行された VC
   */
  async issueCredential(request: {
    user_did: string;
    user_private_key: string;
    pid: string;
    country_code: string;
    admin1_code?: string;
  }): Promise<VerifiableCredential> {
    const providerDid = 'did:web:vey.example';
    
    const vc = createAddressPIDCredential(
      request.user_did,
      providerDid,
      request.pid,
      request.country_code,
      request.admin1_code,
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    );
    
    const signedVC = await signCredential(
      vc,
      request.user_private_key,
      `${request.user_did}#key-1`
    );
    
    this.vcStore.set(signedVC.id, signedVC);
    
    return signedVC;
  }
  
  /**
   * GET /v1/credentials/{id} - VC 取得
   * 
   * @param id - VC ID
   * @returns VC または null
   */
  async getCredential(id: string): Promise<VerifiableCredential | null> {
    return this.vcStore.get(id) || null;
  }
  
  /**
   * POST /v1/credentials/verify - VC 検証
   * 
   * @param vc - 検証する VC
   * @returns 検証結果
   */
  async verifyCredentialAPI(vc: VerifiableCredential): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    try {
      const result = verifyCredential(vc);
      return { valid: result.valid, errors: result.errors };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
  
  /**
   * POST /v1/credentials/revoke - VC 失効
   * 
   * @param id - VC ID
   * @returns 成功/失敗
   */
  async revokeCredential(id: string): Promise<{ success: boolean }> {
    const vc = this.vcStore.get(id);
    if (!vc) {
      return { success: false };
    }
    
    // VC を失効リストに追加（実装は簡略化）
    this.vcStore.delete(id);
    
    return { success: true };
  }
}

// ============================================================================
// Section 6.4: ZKP API
// ============================================================================

/**
 * ZKP (Zero-Knowledge Proof) API クラス
 */
export class ZKPAPI {
  private circuits: Map<string, ZKCircuit> = new Map();
  
  /**
   * POST /v1/zkp/circuits - ZK 回路登録
   * 
   * @param circuit - ZK 回路
   * @returns 登録された回路 ID
   */
  async registerCircuit(circuit: ZKCircuit): Promise<{ id: string }> {
    this.circuits.set(circuit.id, circuit);
    return { id: circuit.id };
  }
  
  /**
   * POST /v1/zkp/prove - ZK 証明生成
   * 
   * @param request - 証明生成リクエスト
   * @returns 生成された ZK 証明
   */
  async generateProof(request: {
    circuit_id: string;
    inputs: any;
    conditions: any;
  }): Promise<ZKProof> {
    const circuit = this.circuits.get(request.circuit_id);
    if (!circuit) {
      throw new Error('Circuit not found');
    }
    
    const proof = generateZKProof(circuit, request.inputs, request.conditions);
    return proof;
  }
  
  /**
   * POST /v1/zkp/verify - ZK 証明検証
   * 
   * @param request - 証明検証リクエスト
   * @returns 検証結果
   */
  async verifyProof(request: {
    proof: ZKProof;
    circuit_id: string;
    conditions: any;
  }): Promise<{ valid: boolean }> {
    const circuit = this.circuits.get(request.circuit_id);
    if (!circuit) {
      throw new Error('Circuit not found');
    }
    
    const valid = verifyZKProof(request.proof, circuit, request.conditions);
    return { valid };
  }
}

// ============================================================================
// Section 6.5: Shipping API
// ============================================================================

/**
 * Shipping API クラス
 */
export class ShippingAPI {
  private waybills: Map<string, ZKPWaybill> = new Map();
  private zkpAPI: ZKPAPI;
  
  constructor(zkpAPI: ZKPAPI) {
    this.zkpAPI = zkpAPI;
  }
  
  /**
   * POST /v1/shipping/validate - 配送先検証
   * 
   * @param request - 配送検証リクエスト
   * @returns 検証結果
   */
  async validateShipping(
    request: ShippingValidationRequest
  ): Promise<ShippingValidationResponse> {
    // ZK 回路を作成
    const circuit = createZKCircuit(
      'shipping-validation-v1',
      'Shipping Address Validation',
      'Validates shipping address against conditions'
    );
    
    // 検証実行
    const response = await validateShippingRequest(
      request,
      circuit,
      // 実際の住所データ（Address Provider のみが持つ）
      {
        pid: request.pid,
        countryCode: 'JP',
        admin1: '13',
        admin2: '113',
      }
    );
    
    return response;
  }
  
  /**
   * POST /v1/shipping/waybill - 送り状発行
   * 
   * @param request - 送り状発行リクエスト
   * @returns 発行された送り状
   */
  async createWaybillAPI(request: {
    pid: string;
    zkProof: ZKProof;
    trackingNumber: string;
    metadata?: any;
  }): Promise<ZKPWaybill> {
    const waybillId = `WB-${Date.now()}`;
    
    const waybill = createZKPWaybill(
      waybillId,
      request.pid,
      request.zkProof,
      request.trackingNumber,
      request.metadata
    );
    
    this.waybills.set(waybillId, waybill);
    
    return waybill;
  }
  
  /**
   * GET /v1/shipping/waybill/{id} - 送り状取得
   * 
   * @param id - 送り状 ID
   * @returns 送り状または null
   */
  async getWaybill(id: string): Promise<ZKPWaybill | null> {
    return this.waybills.get(id) || null;
  }
  
  /**
   * POST /v1/shipping/track - 配送追跡
   * 
   * @param tracking_number - 追跡番号
   * @returns 配送状況
   */
  async trackShipment(tracking_number: string): Promise<{
    status: string;
    events: any[];
  }> {
    // 実装は簡略化
    return {
      status: 'in_transit',
      events: [],
    };
  }
}

// ============================================================================
// Section 6.6: Carrier API
// ============================================================================

/**
 * Carrier (配送業者) API クラス
 */
export class CarrierAPI {
  private pidAPI: PIDManagementAPI;
  private auditLogs: AccessLogEntry[] = [];
  
  constructor(pidAPI: PIDManagementAPI) {
    this.pidAPI = pidAPI;
  }
  
  /**
   * POST /v1/carrier/resolve - PID 解決（配送業者用）
   * 
   * @param request - PID 解決リクエスト
   * @param policy - アクセス制御ポリシー
   * @returns 解決結果
   */
  async resolveForCarrier(
    request: PIDResolutionRequest,
    policy: AccessControlPolicy
  ): Promise<PIDResolutionResponse> {
    // アクセス権検証
    const allowed = validateAccessPolicy(
      policy,
      request.requesterId,
      request.pid,
      'resolve'
    );
    
    if (!allowed) {
      const auditLog = createAuditLogEntry(
        request.pid,
        request.requesterId,
        'resolve',
        'denied',
        {
          reason: 'Access denied - invalid policy',
          timestamp: new Date().toISOString(),
        }
      );
      this.auditLogs.push(auditLog);
      
      return {
        success: false,
        error: 'Access denied',
      };
    }
    
    // 監査ログ記録
    const auditLog = createAuditLogEntry(
      request.pid,
      request.requesterId,
      'resolve',
      'success',
      {
        reason: request.reason || 'Carrier delivery',
        timestamp: new Date().toISOString(),
        carrier: request.requesterId,
      }
    );
    this.auditLogs.push(auditLog);
    
    // PID 解決
    const result = await resolvePID(
      request.pid,
      request.requesterId,
      request.accessToken,
      request.reason || '',
      policy
    );
    
    return result;
  }
  
  /**
   * POST /v1/carrier/track - 配送追跡更新
   * 
   * @param request - 追跡更新リクエスト
   * @returns 更新結果
   */
  async updateTracking(request: {
    tracking_number: string;
    status: string;
    location?: string;
    carrier_did: string;
  }): Promise<{ success: boolean }> {
    // 追跡イベント作成（簡略化）
    // 実際の実装では createTrackingEvent を使用
    const trackingEvent = {
      tracking_number: request.tracking_number,
      status: request.status,
      location: request.location,
      timestamp: new Date().toISOString(),
      carrier_did: request.carrier_did,
    };
    
    // 実装は簡略化
    return { success: true };
  }
  
  /**
   * GET /v1/carrier/access-logs - アクセスログ取得
   * 
   * @param carrier_did - 配送業者 DID
   * @returns アクセスログ配列
   */
  async getAccessLogs(carrier_did: string): Promise<AccessLogEntry[]> {
    return this.auditLogs.filter(log => log.accessor_did === carrier_did);
  }
}

// ============================================================================
// 統合 API サーバー
// ============================================================================

/**
 * クラウド住所帳システム API サーバー
 * 
 * すべての API を統合したサーバークラス
 */
export class CloudAddressBookAPIServer {
  public addressProvider: AddressProviderAPI;
  public pidManagement: PIDManagementAPI;
  public vcManagement: VCManagementAPI;
  public zkp: ZKPAPI;
  public shipping: ShippingAPI;
  public carrier: CarrierAPI;
  
  constructor() {
    this.addressProvider = new AddressProviderAPI();
    this.pidManagement = new PIDManagementAPI();
    this.vcManagement = new VCManagementAPI();
    this.zkp = new ZKPAPI();
    this.shipping = new ShippingAPI(this.zkp);
    this.carrier = new CarrierAPI(this.pidManagement);
  }
  
  /**
   * API サーバーを起動
   */
  async start(port: number = 3000): Promise<void> {
    console.log(`Cloud Address Book API Server started on port ${port}`);
    console.log('Available APIs:');
    console.log('  - Address Provider API (Section 6.1)');
    console.log('  - PID Management API (Section 6.2)');
    console.log('  - VC Management API (Section 6.3)');
    console.log('  - ZKP API (Section 6.4)');
    console.log('  - Shipping API (Section 6.5)');
    console.log('  - Carrier API (Section 6.6)');
  }
}

// ============================================================================
// 使用例
// ============================================================================

/**
 * API サーバーの使用例
 */
async function exampleUsage() {
  const server = new CloudAddressBookAPIServer();
  
  // 住所登録
  const registerResult = await server.addressProvider.createAddress({
    user_did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
    user_private_key: 'user-private-key-example',
    raw_address: {
      country: 'JP',
      postalCode: '150-0043',
      province: '東京都',
      city: '渋谷区',
      streetAddress: '道玄坂1-2-3',
    },
    label: '自宅',
  });
  
  console.log('Address registered:', registerResult.pid);
  
  // PID 検証
  const verifyResult = await server.pidManagement.verifyPID(registerResult.pid);
  console.log('PID valid:', verifyResult.valid);
  
  // VC 発行
  const vc = await server.vcManagement.issueCredential({
    user_did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
    user_private_key: 'user-private-key-example',
    pid: registerResult.pid,
    country_code: 'JP',
    admin1_code: '13',
  });
  
  console.log('VC issued:', vc.id);
  
  // API サーバー起動
  await server.start(3000);
}

// Export
export default CloudAddressBookAPIServer;
