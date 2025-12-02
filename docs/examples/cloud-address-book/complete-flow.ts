/**
 * クラウド住所帳システム完全実装例
 * Complete Cloud Address Book System Implementation Example
 * 
 * このファイルは、cloud-address-book-architecture.md で定義された
 * すべてのデータフローを実装した完全な例です。
 * 
 * This file provides a complete implementation of all data flows
 * defined in cloud-address-book-architecture.md
 */

import {
  // Address normalization and PID
  normalizeAddress,
  encodePID,
  decodePID,
  validatePID,
  
  // DID/VC
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  verifyCredential,
  
  // Encryption
  encryptAddress,
  decryptAddress,
  signData,
  hashData,
  
  // ZKP
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
  validateShippingRequest,
  
  // Shipping
  createZKPWaybill,
  resolvePID,
  validateAccessPolicy,
  
  // Revocation
  createRevocationEntry,
  createRevocationList,
  isPIDRevoked,
  signRevocationList,
  
  // Audit
  createAuditLogEntry,
  createTrackingEvent,
  
  // Client
  createAddressClient,
  
  // Friends
  generateFriendQR,
  scanFriendQR,
  createFriendFromQR,
  generateAddressQR,
  generateId,
} from '@vey/core';

import type {
  NormalizedAddress,
  VerifiableCredential,
  ZKCircuit,
  ZKProof,
  ZKPWaybill,
  ShippingCondition,
} from '@vey/core';

// ============================================================================
// データモデル定義 (5. データモデル from architecture document)
// ============================================================================

/**
 * Address Entry - クラウド住所帳のアドレスエントリ
 * 
 * cloud-address-book-architecture.md の 5.1 Address Entry に対応
 */
interface AddressEntry {
  // 識別子
  id: string;
  user_did: string;
  pid: string;
  
  // 住所データ（暗号化）
  encrypted_address_local: string;
  encrypted_address_en: string;
  encryption_algorithm: string;
  encryption_iv: string;
  
  // メタデータ（平文）
  country_code: string;
  admin1_code?: string;
  admin2_code?: string;
  
  // セキュリティ
  signature: string;
  vc_id?: string;
  
  // 地理情報
  geo_hash?: string;
  geo_restriction_flags?: string[];
  
  // 状態管理
  is_revoked: boolean;
  is_primary: boolean;
  
  // タイムスタンプ
  created_at: string;
  updated_at: string;
  revoked_at?: string;
  
  // ラベル
  label?: string;
  notes?: string;
}

/**
 * Friend Entry - 友達エントリ
 * 
 * cloud-address-book-architecture.md の 5.2 Friend Entry に対応
 */
interface FriendEntry {
  id: string;
  owner_did: string;
  friend_did: string;
  friend_pid: string;
  friend_label_qr_hash: string;
  verified: boolean;
  label: string;
  avatar_url?: string;
  is_revoked: boolean;
  can_use_for_shipping: boolean;
  added_at: string;
  last_used_at?: string;
  notes?: string;
}

/**
 * Revocation Entry - 失効エントリ
 * 
 * cloud-address-book-architecture.md の 5.3 Revocation Entry に対応
 */
interface RevocationEntry {
  id: string;
  pid: string;
  reason: string;
  new_pid?: string;
  revoked_by: string;
  revoked_at: string;
  merkle_proof?: string[];
  merkle_index?: number;
}

/**
 * Access Log Entry - アクセスログエントリ
 * 
 * cloud-address-book-architecture.md の 5.4 Access Log Entry に対応
 */
interface AccessLogEntry {
  id: string;
  pid: string;
  accessor_did: string;
  action: string;
  result: 'success' | 'denied' | 'error';
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  geo_location?: string;
  reason?: string;
  metadata?: Record<string, any>;
  accessed_at: string;
}

// ============================================================================
// Flow 1: 住所登録フロー (2.1 住所登録フロー from architecture document)
// ============================================================================

/**
 * ユーザーが住所を登録するフロー
 * 
 * アーキテクチャドキュメントの「2.1 住所登録フロー」に対応
 * 
 * Steps:
 * 1. ユーザーが住所を入力
 * 2. Address Provider が AMF で正規化
 * 3. PID 生成
 * 4. ユーザーが署名
 * 5. VC 発行
 * 6. 暗号化して保存
 * 7. QR コード生成
 */
async function registerAddressFlow() {
  console.log('=== Flow 1: 住所登録フロー ===\n');
  
  // Step 1: ユーザーが住所を入力
  const rawAddress = {
    country: 'JP',
    postalCode: '150-0043',
    province: '東京都',
    city: '渋谷区',
    streetAddress: '道玄坂1-2-3',
    building: 'ビルディング名',
    room: '101',
  };
  
  console.log('Step 1: 住所入力');
  console.log('  Raw Address:', rawAddress);
  
  // Step 2: Address Provider が AMF で正規化
  console.log('\nStep 2: AMF正規化');
  const normalized = await normalizeAddress(rawAddress, 'JP');
  console.log('  Normalized:', normalized);
  
  // Step 3: PID 生成
  console.log('\nStep 3: PID生成');
  const pid = encodePID(normalized);
  console.log('  PID:', pid);
  
  // Step 4: ユーザーが秘密鍵で署名
  console.log('\nStep 4: ユーザー署名');
  const userDid = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
  const userPrivateKey = 'user-private-key-example-12345';
  
  // Step 5: VC (Verifiable Credential) 発行
  console.log('\nStep 5: VC発行');
  const providerDid = 'did:web:vey.example';
  const vc = createAddressPIDCredential(
    userDid,
    providerDid,
    pid,
    normalized.countryCode,
    normalized.admin1,
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1年後
  );
  
  // VC に署名
  const signedVC = await signCredential(vc, userPrivateKey, `${userDid}#key-1`);
  console.log('  VC ID:', signedVC.id);
  console.log('  VC Issuer:', signedVC.issuer);
  
  // Step 6: 暗号化して保存
  console.log('\nStep 6: 暗号化保存');
  const encryptedLocal = await encryptAddress(
    JSON.stringify(rawAddress),
    userPrivateKey
  );
  const encryptedEn = await encryptAddress(
    JSON.stringify(normalized),
    userPrivateKey
  );
  
  // Address Entry 作成
  const addressEntry: AddressEntry = {
    id: generateId(),
    user_did: userDid,
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
    is_primary: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    label: '自宅',
  };
  
  console.log('  Address Entry created');
  console.log('  Entry ID:', addressEntry.id);
  console.log('  Encrypted:', addressEntry.encrypted_address_local.substring(0, 50) + '...');
  
  // Step 7: QR コード生成（端末内で暗号化）
  console.log('\nStep 7: QRコード生成');
  const qrPayload = await generateAddressQR(
    pid,
    encryptedLocal.ciphertext,
    addressEntry.signature,
    encryptedLocal.authTag,
    30 // 30日間有効
  );
  console.log('  QR Payload generated (length:', qrPayload.length, 'chars)');
  
  console.log('\n✅ 住所登録フロー完了\n');
  
  return {
    addressEntry,
    signedVC,
    pid,
    qrPayload,
    userDid,
    userPrivateKey,
  };
}

// ============================================================================
// Flow 2: 送り状発行フロー (2.2 送り状発行フロー from architecture document)
// ============================================================================

/**
 * EC サイトが配送先を検証して送り状を発行するフロー
 * 
 * アーキテクチャドキュメントの「2.2 送り状発行フロー」に対応
 * 
 * Steps:
 * 1. ユーザーが EC で注文
 * 2. EC が配送先 PID を選択
 * 3. Address Provider が失効チェック
 * 4. ZK 証明生成
 * 5. EC が検証 OK
 * 6. 送り状発行
 * 7. キャリアが配送開始
 * 8. キャリアが PID 解決要求
 * 9. アクセス権確認と監査ログ記録
 * 10. 生住所取得して配達実行
 */
async function waybillIssuanceFlow(addressData: {
  pid: string;
  userDid: string;
  userPrivateKey: string;
}) {
  console.log('=== Flow 2: 送り状発行フロー ===\n');
  
  // Step 1-2: ユーザーが EC で注文し、配送先 PID を選択
  console.log('Step 1-2: 注文と配送先選択');
  const ecDid = 'did:web:ec-site.example';
  const { pid, userDid } = addressData;
  console.log('  EC Site DID:', ecDid);
  console.log('  Delivery PID:', pid);
  
  // Step 3: Address Provider が失効チェック
  console.log('\nStep 3: 失効チェック');
  const isRevoked = await isPIDRevoked(pid, []);
  console.log('  Is Revoked:', isRevoked);
  
  if (isRevoked) {
    throw new Error('PID is revoked');
  }
  
  // Step 4: ZK 証明生成
  console.log('\nStep 4: ZK証明生成');
  const shippingConditions: ShippingCondition = {
    allowedCountries: ['JP'],
    allowedRegions: ['13', '14', '27'], // 関東エリア
    excludedAreas: [],
    minDeliveryLevel: 'admin2',
  };
  
  // ZK Circuit 作成
  const circuit = createZKCircuit(
    'shipping-validation-v1',
    'Shipping Address Validation',
    'Validates shipping address against EC conditions'
  );
  
  // ZK Proof 生成（実際には Address Provider が行う）
  const zkProof = generateZKProof(
    circuit,
    {
      pid,
      countryCode: 'JP',
      admin1: '13',
      admin2: '113',
    },
    shippingConditions
  );
  
  console.log('  ZK Proof generated');
  console.log('  Proof Type:', zkProof.proofType);
  
  // Step 5: EC が検証 OK
  console.log('\nStep 5: ZK証明検証');
  const isValid = verifyZKProof(zkProof, circuit, shippingConditions);
  console.log('  Verification Result:', isValid);
  
  if (!isValid) {
    throw new Error('ZK proof verification failed');
  }
  
  // Step 6: 送り状発行
  console.log('\nStep 6: 送り状発行');
  const trackingNumber = `TN-${Date.now()}`;
  const waybill = createZKPWaybill(
    `WB-${Date.now()}`,
    pid,
    zkProof,
    trackingNumber,
    {
      parcelWeight: 2.5,
      parcelSize: '60',
      carrierZone: 'KANTO-01',
      senderName: 'EC Store',
      recipientName: 'Customer', // 実名は含まない
      carrierInfo: {
        id: 'carrier-001',
        name: 'Example Delivery Co.',
      },
    }
  );
  
  console.log('  Waybill ID:', waybill.id);
  console.log('  Tracking Number:', trackingNumber);
  console.log('  PID Token:', waybill.pidToken);
  
  // Step 7: キャリアが配送開始
  console.log('\nStep 7: 配送開始');
  const carrierDid = 'did:web:carrier.example';
  console.log('  Carrier DID:', carrierDid);
  
  // Step 8: キャリアが PID 解決要求（ラストワンマイル）
  console.log('\nStep 8: PID解決要求（ラストワンマイル）');
  
  // Step 9: アクセス権確認と監査ログ記録
  console.log('\nStep 9: アクセス権確認');
  const accessPolicy = {
    id: 'carrier-access-policy',
    principal: carrierDid,
    resource: `${pid.split('-').slice(0, 3).join('-')}*`,
    action: 'resolve',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  
  const accessValid = validateAccessPolicy(
    accessPolicy,
    carrierDid,
    pid,
    'resolve'
  );
  console.log('  Access Allowed:', accessValid);
  
  if (!accessValid) {
    // アクセス拒否のログ
    const deniedLog = createAuditLogEntry(
      pid,
      carrierDid,
      'resolve',
      'denied',
      {
        reason: 'Invalid access policy',
        timestamp: new Date().toISOString(),
      }
    );
    console.log('  Access Denied - Log ID:', deniedLog.id);
    throw new Error('Access denied');
  }
  
  // 監査ログ記録
  const auditLog = createAuditLogEntry(
    pid,
    carrierDid,
    'resolve',
    'success',
    {
      reason: 'Last mile delivery',
      waybillId: waybill.id,
      trackingNumber,
      timestamp: new Date().toISOString(),
    }
  );
  console.log('  Audit Log ID:', auditLog.id);
  
  // Step 10: 生住所取得して配達実行
  console.log('\nStep 10: 生住所取得と配達実行');
  // キャリアは PID を解決して生住所を取得
  // （実際には暗号化されたデータを復号）
  const resolvedAddress = await resolvePID(
    pid,
    carrierDid,
    'delivery-token',
    'Last mile delivery',
    accessPolicy
  );
  console.log('  Address Resolved:', resolvedAddress.success);
  
  // 配送追跡イベント
  const trackingEvent = createTrackingEvent(
    trackingNumber,
    'out_for_delivery',
    {
      location: 'Tokyo Distribution Center',
      timestamp: new Date().toISOString(),
      carrierDid,
    }
  );
  console.log('  Tracking Event:', trackingEvent.status);
  
  console.log('\n✅ 送り状発行フロー完了\n');
  
  return {
    waybill,
    trackingNumber,
    auditLog,
  };
}

// ============================================================================
// Flow 3: 友達登録フロー (2.3 友達登録フロー from architecture document)
// ============================================================================

/**
 * 友達を QR コードで登録するフロー
 * 
 * アーキテクチャドキュメントの「2.3 友達登録フロー」に対応
 * 
 * Steps:
 * 1. ユーザーA が友達追加を開始
 * 2. ユーザーB が QR コードを表示
 * 3. ユーザーA が QR をスキャン
 * 4. PID 取得
 * 5. PID 検証要求
 * 6. 有効性確認
 * 7. FriendEntry 作成
 * 8. 登録完了
 * 
 * 重要: 生住所は一切送信されない。PID と DID のみが交換される。
 */
async function friendRegistrationFlow(userAData: {
  userDid: string;
  userPrivateKey: string;
}) {
  console.log('=== Flow 3: 友達登録フロー ===\n');
  
  // ユーザーB のデータ（友達）
  const userBDid = 'did:key:z6MkfD6ccYE22Y3tJS9rLvvd5JYDCDQBnLYLdPzPgWJwPQ4x';
  const userBPid = 'JP-14-201-05-T03-B08-BN01-R201';
  const userBPrivateKey = 'user-b-private-key-example-67890';
  
  // Step 1: ユーザーA が友達追加を開始
  console.log('Step 1: ユーザーAが友達追加を開始');
  const { userDid: userADid } = userAData;
  console.log('  User A DID:', userADid);
  
  // Step 2: ユーザーB が QR コードを生成して表示
  console.log('\nStep 2: ユーザーBがQRコードを表示');
  const friendQR = await generateFriendQR(
    userBDid,
    userBPid,
    userBPrivateKey,
    365 // 1年間有効
  );
  console.log('  Friend QR generated (User B)');
  console.log('  QR Payload length:', friendQR.length, 'chars');
  
  // Step 3: ユーザーA が QR をスキャン
  console.log('\nStep 3: ユーザーAがQRスキャン');
  const scannedData = await scanFriendQR(friendQR);
  console.log('  Scanned DID:', scannedData.did);
  console.log('  Scanned PID:', scannedData.pid);
  
  // Step 4: PID 取得完了
  console.log('\nStep 4: PID取得');
  const friendPid = scannedData.pid;
  const friendDid = scannedData.did;
  
  // Step 5-6: PID 検証要求と有効性確認
  console.log('\nStep 5-6: PID検証と有効性確認');
  const pidValidation = validatePID(friendPid);
  console.log('  PID Valid:', pidValidation.valid);
  
  if (!pidValidation.valid) {
    throw new Error('Invalid friend PID');
  }
  
  // 失効チェック
  const isRevoked = await isPIDRevoked(friendPid, []);
  console.log('  Is Revoked:', isRevoked);
  
  if (isRevoked) {
    throw new Error('Friend PID is revoked');
  }
  
  // Step 7: FriendEntry 作成
  console.log('\nStep 7: FriendEntry作成');
  const friendEntry = await createFriendFromQR(
    friendQR,
    userADid,
    '田中さん' // 表示用ラベル
  );
  
  console.log('  Friend Entry ID:', friendEntry.id);
  console.log('  Friend Label:', friendEntry.label);
  console.log('  Friend PID:', friendEntry.friend_pid);
  console.log('  Friend DID:', friendEntry.friend_did);
  console.log('  QR Hash:', friendEntry.friend_label_qr_hash.substring(0, 20) + '...');
  
  // Step 8: 登録完了
  console.log('\nStep 8: 登録完了');
  console.log('  ✅ 友達登録成功');
  console.log('  重要: 生住所は一切保存されていません');
  console.log('  保存データ: PID, DID, QRハッシュのみ');
  
  console.log('\n✅ 友達登録フロー完了\n');
  
  return {
    friendEntry,
    friendDid,
    friendPid,
  };
}

// ============================================================================
// Flow 4: 住所更新・失効フロー (引越し)
// ============================================================================

/**
 * ユーザーが引っ越しして住所を更新するフロー
 * 
 * Steps:
 * 1. 新住所入力
 * 2. 新 PID 発行
 * 3. 旧 PID 失効
 * 4. 失効リスト更新
 */
async function addressUpdateFlow(oldPid: string, userDid: string, userPrivateKey: string) {
  console.log('=== Flow 4: 住所更新・失効フロー（引越し） ===\n');
  
  // Step 1: 新住所入力
  console.log('Step 1: 新住所入力');
  const newAddress = {
    country: 'JP',
    postalCode: '100-0001',
    province: '東京都',
    city: '千代田区',
    streetAddress: '千代田1-1',
    building: '新ビル',
    room: '201',
  };
  console.log('  New Address:', newAddress);
  
  // Step 2: 新 PID 発行
  console.log('\nStep 2: 新PID発行');
  const normalizedNew = await normalizeAddress(newAddress, 'JP');
  const newPid = encodePID(normalizedNew);
  console.log('  New PID:', newPid);
  console.log('  Old PID:', oldPid);
  
  // Step 3: 旧 PID 失効
  console.log('\nStep 3: 旧PID失効');
  const revocationEntry = createRevocationEntry(
    oldPid,
    'relocation', // 引越し
    userDid,
    newPid
  );
  console.log('  Revocation Entry ID:', revocationEntry.id);
  console.log('  Reason:', revocationEntry.reason);
  console.log('  New PID:', revocationEntry.newPid);
  console.log('  Revoked At:', revocationEntry.revokedAt);
  
  // Step 4: 失効リスト更新
  console.log('\nStep 4: 失効リスト更新');
  const revocationList = createRevocationList([revocationEntry]);
  console.log('  Revocation List ID:', revocationList.id);
  console.log('  Entries:', revocationList.entries.length);
  
  // 失効リストに署名
  const signedRevocationList = await signRevocationList(
    revocationList,
    userPrivateKey,
    userDid
  );
  console.log('  Revocation List Signed');
  console.log('  Signature:', signedRevocationList.signature?.substring(0, 30) + '...');
  
  console.log('\n✅ 住所更新・失効フロー完了');
  console.log('  旧PID は失効され、新PID が発行されました\n');
  
  return {
    newPid,
    revocationEntry,
    signedRevocationList,
  };
}

// ============================================================================
// 完全なシナリオ実行
// ============================================================================

/**
 * クラウド住所帳システムの完全なライフサイクルを実行
 * 
 * このシナリオは以下のフローを順番に実行します:
 * 1. 住所登録フロー
 * 2. 送り状発行フロー
 * 3. 友達登録フロー
 * 4. 住所更新・失効フロー
 */
async function completeScenario() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   クラウド住所帳システム 完全実装例                        ║');
  console.log('║   Complete Cloud Address Book System Implementation      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log();
  console.log('このシナリオは cloud-address-book-architecture.md で');
  console.log('定義されたすべてのデータフローを実装しています。');
  console.log();
  
  try {
    // Flow 1: 住所登録
    const registrationResult = await registerAddressFlow();
    
    // Flow 2: 送り状発行
    await waybillIssuanceFlow({
      pid: registrationResult.pid,
      userDid: registrationResult.userDid,
      userPrivateKey: registrationResult.userPrivateKey,
    });
    
    // Flow 3: 友達登録
    await friendRegistrationFlow({
      userDid: registrationResult.userDid,
      userPrivateKey: registrationResult.userPrivateKey,
    });
    
    // Flow 4: 住所更新・失効（引越し）
    await addressUpdateFlow(
      registrationResult.pid,
      registrationResult.userDid,
      registrationResult.userPrivateKey
    );
    
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ すべてのフローが正常に完了しました                     ║');
    console.log('║   All flows completed successfully                        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log();
    console.log('実装されたフロー:');
    console.log('  ✓ Flow 1: 住所登録フロー (Section 2.1)');
    console.log('  ✓ Flow 2: 送り状発行フロー (Section 2.2)');
    console.log('  ✓ Flow 3: 友達登録フロー (Section 2.3)');
    console.log('  ✓ Flow 4: 住所更新・失効フロー');
    console.log();
    console.log('データモデル:');
    console.log('  ✓ AddressEntry (Section 5.1)');
    console.log('  ✓ FriendEntry (Section 5.2)');
    console.log('  ✓ RevocationEntry (Section 5.3)');
    console.log('  ✓ AccessLogEntry (Section 5.4)');
    console.log();
    console.log('セキュリティ機能:');
    console.log('  ✓ エンドツーエンド暗号化 (AES-256-GCM)');
    console.log('  ✓ ゼロ知識証明 (ZKP)');
    console.log('  ✓ DID/VC による認証');
    console.log('  ✓ アクセス制御とポリシー');
    console.log('  ✓ 完全な監査ログ');
    console.log();
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// エントリーポイント
if (require.main === module) {
  completeScenario()
    .then(() => {
      console.log('Program completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Program failed:', error);
      process.exit(1);
    });
}

export {
  registerAddressFlow,
  waybillIssuanceFlow,
  friendRegistrationFlow,
  addressUpdateFlow,
  completeScenario,
};
