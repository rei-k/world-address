/**
 * クラウド住所帳システム - クライアント統合例
 * Cloud Address Book System - Client Integration Example
 * 
 * このファイルは、クライアントアプリケーション（Web/Mobile）での
 * クラウド住所帳システムの統合例を示します。
 * 
 * This file demonstrates how to integrate the Cloud Address Book System
 * into client applications (Web/Mobile).
 */

import React from 'react';
import {
  createAddressClient,
  normalizeAddress,
  encodePID,
  encryptAddress,
  decryptAddress,
  generateFriendQR,
  scanFriendQR,
  createFriendFromQR,
  generateAddressQR,
  type AddressEntry,
  type FriendEntry,
} from '@vey/core';

/**
 * クラウド住所帳クライアントラッパー
 * 
 * クライアントアプリケーションで使用する主要な機能をラップしたクラス
 */
export class CloudAddressBookClient {
  private client: any;
  private userDid: string | null = null;
  private userPrivateKey: string | null = null;
  private authenticated: boolean = false;
  
  /**
   * コンストラクタ
   * 
   * @param apiKey - API キー
   * @param apiEndpoint - API エンドポイント
   */
  constructor(
    private apiKey: string,
    private apiEndpoint: string = 'https://api.vey.example'
  ) {
    this.client = createAddressClient({
      apiKey: this.apiKey,
      apiEndpoint: this.apiEndpoint,
      environment: 'production',
    });
  }
  
  // ==========================================================================
  // 認証
  // ==========================================================================
  
  /**
   * ユーザー認証
   * 
   * @param did - ユーザーの DID
   * @param privateKey - ユーザーの秘密鍵
   */
  async authenticate(did: string, privateKey: string): Promise<void> {
    await this.client.authenticate({
      did,
      privateKey,
    });
    
    this.userDid = did;
    this.userPrivateKey = privateKey;
    this.authenticated = true;
    
    console.log('✅ Authenticated successfully');
  }
  
  /**
   * 認証状態を確認
   */
  isAuthenticated(): boolean {
    return this.authenticated;
  }
  
  /**
   * 認証されているか確認（エラーを投げる）
   */
  private ensureAuthenticated(): void {
    if (!this.authenticated || !this.userDid || !this.userPrivateKey) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }
  }
  
  // ==========================================================================
  // 住所管理
  // ==========================================================================
  
  /**
   * 住所を追加
   * 
   * @param rawAddress - 生住所データ
   * @param label - ラベル（例: "自宅"、"職場"）
   * @returns 住所エントリと PID
   */
  async addAddress(
    rawAddress: any,
    label: string = '住所'
  ): Promise<{ id: string; pid: string }> {
    this.ensureAuthenticated();
    
    console.log('📍 Adding address...');
    
    // Step 1: 住所正規化
    console.log('  - Normalizing address...');
    const normalized = await normalizeAddress(rawAddress, rawAddress.country);
    
    // Step 2: PID 生成
    console.log('  - Generating PID...');
    const pid = encodePID(normalized);
    
    // Step 3: 暗号化
    console.log('  - Encrypting address...');
    const encryptedLocal = await encryptAddress(
      JSON.stringify(rawAddress),
      this.userPrivateKey!
    );
    const encryptedEn = await encryptAddress(
      JSON.stringify(normalized),
      this.userPrivateKey!
    );
    
    // Step 4: サーバーに保存
    console.log('  - Saving to server...');
    const addressEntry = {
      user_did: this.userDid!,
      pid,
      encrypted_address_local: encryptedLocal.ciphertext,
      encrypted_address_en: encryptedEn.ciphertext,
      encryption_algorithm: 'AES-256-GCM',
      encryption_iv: encryptedLocal.iv,
      country_code: normalized.countryCode,
      admin1_code: normalized.admin1,
      admin2_code: normalized.admin2,
      signature: '', // 実際には VC の署名
      is_revoked: false,
      is_primary: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      label,
    };
    
    const result = await this.client.addresses.create(addressEntry);
    
    console.log('✅ Address added:', pid);
    
    return { id: result.id, pid };
  }
  
  /**
   * 住所一覧を取得
   * 
   * @returns 住所エントリの配列
   */
  async listAddresses(): Promise<AddressEntry[]> {
    this.ensureAuthenticated();
    
    console.log('📋 Listing addresses...');
    const addresses = await this.client.addresses.list({
      user_did: this.userDid,
    });
    
    console.log(`✅ Found ${addresses.length} address(es)`);
    return addresses;
  }
  
  /**
   * 住所を取得して復号
   * 
   * @param id - 住所エントリ ID
   * @returns 復号された住所データ
   */
  async getAddress(id: string): Promise<any> {
    this.ensureAuthenticated();
    
    console.log('🔍 Getting address...');
    const addressEntry = await this.client.addresses.get(id);
    
    if (!addressEntry) {
      throw new Error('Address not found');
    }
    
    // 復号
    console.log('  - Decrypting address...');
    const decrypted = await decryptAddress(
      addressEntry.encrypted_address_local,
      addressEntry.encryption_iv,
      this.userPrivateKey!,
      addressEntry.auth_tag
    );
    
    const address = JSON.parse(decrypted);
    console.log('✅ Address retrieved');
    
    return address;
  }
  
  /**
   * 住所を削除（論理削除）
   * 
   * @param id - 住所エントリ ID
   */
  async deleteAddress(id: string): Promise<void> {
    this.ensureAuthenticated();
    
    console.log('🗑️  Deleting address...');
    await this.client.addresses.delete(id);
    console.log('✅ Address deleted');
  }
  
  /**
   * 住所の QR コードを生成
   * 
   * @param pid - 住所 PID
   * @returns QR コードデータ（JSON 文字列）
   */
  async generateAddressQRCode(pid: string): Promise<string> {
    this.ensureAuthenticated();
    
    console.log('📱 Generating address QR code...');
    
    // 住所を取得
    const addressEntry = await this.client.addresses.getByPid(pid);
    
    if (!addressEntry) {
      throw new Error('Address not found');
    }
    
    // QR ペイロード生成
    const qrData = await generateAddressQR(
      pid,
      addressEntry.encrypted_address_local,
      addressEntry.signature,
      addressEntry.auth_tag,
      30 // 30日間有効
    );
    
    console.log('✅ QR code generated');
    
    return qrData;
  }
  
  // ==========================================================================
  // 友達管理
  // ==========================================================================
  
  /**
   * 友達を追加（QR スキャン）
   * 
   * @param qrData - スキャンした QR データ
   * @param label - 友達の表示名
   * @returns 友達エントリ
   */
  async addFriend(qrData: string, label: string): Promise<FriendEntry> {
    this.ensureAuthenticated();
    
    console.log('👥 Adding friend...');
    
    // QR データをパース
    console.log('  - Scanning QR code...');
    const friendData = await scanFriendQR(qrData);
    
    // 友達エントリ作成
    console.log('  - Creating friend entry...');
    const friendEntry = await createFriendFromQR(
      qrData,
      this.userDid!,
      label
    );
    
    // サーバーに保存
    console.log('  - Saving to server...');
    await this.client.friends.create(friendEntry);
    
    console.log('✅ Friend added:', label);
    
    return friendEntry;
  }
  
  /**
   * 友達一覧を取得
   * 
   * @returns 友達エントリの配列
   */
  async listFriends(): Promise<FriendEntry[]> {
    this.ensureAuthenticated();
    
    console.log('👥 Listing friends...');
    const friends = await this.client.friends.list({
      owner_did: this.userDid,
    });
    
    console.log(`✅ Found ${friends.length} friend(s)`);
    return friends;
  }
  
  /**
   * 友達を削除
   * 
   * @param id - 友達エントリ ID
   */
  async deleteFriend(id: string): Promise<void> {
    this.ensureAuthenticated();
    
    console.log('🗑️  Deleting friend...');
    await this.client.friends.delete(id);
    console.log('✅ Friend deleted');
  }
  
  /**
   * 自分の友達 QR コードを生成
   * 
   * @param pid - 自分の住所 PID
   * @returns 友達 QR データ（JSON 文字列）
   */
  async generateMyFriendQRCode(pid: string): Promise<string> {
    this.ensureAuthenticated();
    
    console.log('📱 Generating friend QR code...');
    
    const qrData = await generateFriendQR(
      this.userDid!,
      pid,
      this.userPrivateKey!,
      365 // 1年間有効
    );
    
    console.log('✅ Friend QR code generated');
    
    return qrData;
  }
  
  // ==========================================================================
  // 配送関連
  // ==========================================================================
  
  /**
   * 配送先として友達を選択
   * 
   * @param friendId - 友達エントリ ID
   * @returns 友達の PID
   */
  async selectFriendForShipping(friendId: string): Promise<string> {
    this.ensureAuthenticated();
    
    console.log('📦 Selecting friend for shipping...');
    
    const friend = await this.client.friends.get(friendId);
    
    if (!friend) {
      throw new Error('Friend not found');
    }
    
    if (!friend.can_use_for_shipping) {
      throw new Error('Friend cannot be used for shipping');
    }
    
    console.log('✅ Friend selected:', friend.label);
    
    return friend.friend_pid;
  }
}

// ============================================================================
// React フック例
// ============================================================================

/**
 * React フックの使用例
 */
export function useCloudAddressBook(apiKey: string, apiEndpoint?: string) {
  const [client] = React.useState(() => 
    new CloudAddressBookClient(apiKey, apiEndpoint)
  );
  const [authenticated, setAuthenticated] = React.useState(false);
  const [addresses, setAddresses] = React.useState<AddressEntry[]>([]);
  const [friends, setFriends] = React.useState<FriendEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  /**
   * 認証
   */
  const authenticate = async (did: string, privateKey: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await client.authenticate(did, privateKey);
      setAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 住所一覧を読み込み
   */
  const loadAddresses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await client.listAddresses();
      setAddresses(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 住所を追加
   */
  const addAddress = async (rawAddress: any, label: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await client.addAddress(rawAddress, label);
      await loadAddresses(); // リロード
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add address');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 友達一覧を読み込み
   */
  const loadFriends = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await client.listFriends();
      setFriends(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 友達を追加
   */
  const addFriend = async (qrData: string, label: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await client.addFriend(qrData, label);
      await loadFriends(); // リロード
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add friend');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    client,
    authenticated,
    addresses,
    friends,
    loading,
    error,
    authenticate,
    loadAddresses,
    addAddress,
    loadFriends,
    addFriend,
  };
}

// ============================================================================
// 使用例
// ============================================================================

/**
 * 基本的な使用例
 */
async function basicUsageExample() {
  // クライアント作成
  const client = new CloudAddressBookClient(
    'your-api-key',
    'https://api.vey.example'
  );
  
  // 認証
  await client.authenticate(
    'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
    'user-private-key'
  );
  
  // 住所追加
  const { id, pid } = await client.addAddress(
    {
      country: 'JP',
      postalCode: '150-0043',
      province: '東京都',
      city: '渋谷区',
      streetAddress: '道玄坂1-2-3',
    },
    '自宅'
  );
  
  console.log('Address added:', pid);
  
  // 住所一覧取得
  const addresses = await client.listAddresses();
  console.log('My addresses:', addresses);
  
  // QR コード生成
  const qrData = await client.generateAddressQRCode(pid);
  console.log('QR code:', qrData);
  
  // 友達追加（QR スキャン）
  const friendQR = '...'; // 他のユーザーの QR データ
  await client.addFriend(friendQR, '田中さん');
  
  // 友達一覧取得
  const friends = await client.listFriends();
  console.log('My friends:', friends);
}

/**
 * React コンポーネントでの使用例
 */
function AddressBookComponent() {
  const {
    authenticated,
    addresses,
    friends,
    loading,
    error,
    authenticate,
    loadAddresses,
    addAddress,
    loadFriends,
    addFriend,
  } = useCloudAddressBook('your-api-key');
  
  React.useEffect(() => {
    if (authenticated) {
      loadAddresses();
      loadFriends();
    }
  }, [authenticated]);
  
  if (!authenticated) {
    return (
      <div>
        <button onClick={() => authenticate('did:key:...', 'private-key')}>
          Login
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h1>My Cloud Address Book</h1>
      
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      
      <section>
        <h2>My Addresses ({addresses.length})</h2>
        <ul>
          {addresses.map(addr => (
            <li key={addr.id}>
              {addr.label} - {addr.pid}
            </li>
          ))}
        </ul>
        <button onClick={() => addAddress({ /* ... */ }, '新しい住所')}>
          Add Address
        </button>
      </section>
      
      <section>
        <h2>My Friends ({friends.length})</h2>
        <ul>
          {friends.map(friend => (
            <li key={friend.id}>
              {friend.label} - {friend.friend_pid}
            </li>
          ))}
        </ul>
        <button onClick={() => {/* QR スキャン */}}>
          Add Friend
        </button>
      </section>
    </div>
  );
}

// Export
export default CloudAddressBookClient;

// Note: This is a client-side example. In production, you would:
// 1. Use proper state management (Redux, Zustand, etc.)
// 2. Implement proper error handling
// 3. Add loading states and UI feedback
// 4. Implement QR code scanning with camera
// 5. Add offline support with local caching
// 6. Implement proper security measures
