/**
 * Database Test Helpers
 * データベーステストヘルパー
 */

import type { AddressEntry, FriendEntry } from '../../../docs/examples/cloud-address-book/database-schema';

/**
 * Generate test address entry
 * テスト用住所エントリを生成
 */
export function generateTestAddress(overrides?: Partial<AddressEntry>): AddressEntry {
  const now = new Date().toISOString();
  return {
    id: `test_addr_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    user_did: 'did:key:test_user_123',
    pid: 'JP-13-113-01-T07-B12',
    encrypted_address_local: 'encrypted_data_local',
    encrypted_address_en: 'encrypted_data_en',
    encryption_algorithm: 'AES-256-GCM',
    encryption_iv: 'test_iv_12345',
    country_code: 'JP',
    admin1_code: '13',
    admin2_code: '113',
    signature: 'test_signature',
    is_revoked: false,
    is_primary: false,
    created_at: now,
    updated_at: now,
    label: 'Test Address',
    ...overrides,
  };
}

/**
 * Generate test friend entry
 * テスト用友達エントリを生成
 */
export function generateTestFriend(overrides?: Partial<FriendEntry>): FriendEntry {
  const now = new Date().toISOString();
  return {
    id: `test_friend_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    owner_did: 'did:key:test_owner_123',
    friend_did: 'did:key:test_friend_456',
    friend_pid: 'JP-27-100-05',
    friend_label_qr_hash: 'test_qr_hash',
    verified: true,
    label: 'Test Friend',
    is_revoked: false,
    can_use_for_shipping: true,
    added_at: now,
    ...overrides,
  };
}

/**
 * Wait for a condition to be true
 * 条件が真になるまで待機
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('Timeout waiting for condition');
}

/**
 * Retry an async function
 * 非同期関数をリトライ
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Sleep for a duration
 * 指定時間スリープ
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random string
 * ランダム文字列を生成
 */
export function randomString(length: number = 10): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Generate random PID
 * ランダムなPIDを生成
 */
export function randomPID(country: string = 'JP'): string {
  const segments = [
    country,
    Math.floor(Math.random() * 100).toString().padStart(2, '0'),
    Math.floor(Math.random() * 999).toString().padStart(3, '0'),
    Math.floor(Math.random() * 99).toString().padStart(2, '0'),
  ];
  return segments.join('-');
}

/**
 * Compare objects for equality (deep comparison)
 * オブジェクトの同一性を比較（深い比較）
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

export default {
  generateTestAddress,
  generateTestFriend,
  waitFor,
  retry,
  sleep,
  randomString,
  randomPID,
  deepEqual,
};
