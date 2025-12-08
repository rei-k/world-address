/**
 * Passkey Manager - Utilities for managing stored passkeys
 */

import type { PasskeyCredential } from './types';

/**
 * Storage key for passkeys
 */
const STORAGE_KEY = 'vey_passkeys';

/**
 * Passkey Manager for storing and managing passkey metadata
 * 
 * Note: This stores metadata only. The actual private keys are stored
 * securely by the authenticator (e.g., in Secure Enclave, TPM).
 * 
 * @example
 * ```typescript
 * const manager = new PasskeyManager();
 * 
 * // Save passkey metadata after registration
 * await manager.savePasskey({
 *   id: credentialId,
 *   name: 'iPhone 13 Face ID',
 *   deviceName: 'iPhone 13',
 *   createdAt: new Date().toISOString(),
 *   authenticatorAttachment: 'platform',
 *   transports: ['internal']
 * });
 * 
 * // List all passkeys
 * const passkeys = await manager.listPasskeys();
 * 
 * // Delete a passkey
 * await manager.deletePasskey(credentialId);
 * ```
 */
export class PasskeyManager {
  private storage: Storage | null;

  constructor() {
    // Try to use localStorage, but gracefully handle environments without it
    try {
      this.storage = typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
      this.storage = null;
      console.warn('localStorage is not available. Passkey metadata will not persist.');
    }
  }

  /**
   * Save passkey metadata
   * 
   * @param passkey - Passkey credential information
   */
  async savePasskey(passkey: PasskeyCredential): Promise<void> {
    if (!this.storage) {
      console.warn('Storage not available. Passkey metadata cannot be saved.');
      return;
    }

    try {
      const passkeys = await this.listPasskeys();
      const existing = passkeys.findIndex((p) => p.id === passkey.id);

      if (existing >= 0) {
        // Update existing
        passkeys[existing] = passkey;
      } else {
        // Add new
        passkeys.push(passkey);
      }

      this.storage.setItem(STORAGE_KEY, JSON.stringify(passkeys));
    } catch (error) {
      console.error('Failed to save passkey metadata:', error);
      throw new Error('Failed to save passkey metadata');
    }
  }

  /**
   * List all stored passkeys
   * 
   * @returns Array of passkey credentials
   */
  async listPasskeys(): Promise<PasskeyCredential[]> {
    if (!this.storage) {
      return [];
    }

    try {
      const data = this.storage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }

      return JSON.parse(data) as PasskeyCredential[];
    } catch (error) {
      console.error('Failed to load passkey metadata:', error);
      return [];
    }
  }

  /**
   * Get a specific passkey by ID
   * 
   * @param credentialId - Credential ID
   * @returns Passkey credential or null if not found
   */
  async getPasskey(credentialId: string): Promise<PasskeyCredential | null> {
    const passkeys = await this.listPasskeys();
    return passkeys.find((p) => p.id === credentialId) || null;
  }

  /**
   * Delete a passkey
   * 
   * @param credentialId - Credential ID to delete
   * @returns True if deleted, false if not found
   */
  async deletePasskey(credentialId: string): Promise<boolean> {
    if (!this.storage) {
      console.warn('Storage not available. Cannot delete passkey metadata.');
      return false;
    }

    try {
      const passkeys = await this.listPasskeys();
      const filtered = passkeys.filter((p) => p.id !== credentialId);

      if (filtered.length === passkeys.length) {
        // Not found
        return false;
      }

      this.storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete passkey metadata:', error);
      throw new Error('Failed to delete passkey metadata');
    }
  }

  /**
   * Update last used timestamp for a passkey
   * 
   * @param credentialId - Credential ID
   */
  async updateLastUsed(credentialId: string): Promise<void> {
    const passkey = await this.getPasskey(credentialId);
    if (passkey) {
      passkey.lastUsedAt = new Date().toISOString();
      await this.savePasskey(passkey);
    }
  }

  /**
   * Rename a passkey
   * 
   * @param credentialId - Credential ID
   * @param newName - New name for the passkey
   */
  async renamePasskey(credentialId: string, newName: string): Promise<void> {
    const passkey = await this.getPasskey(credentialId);
    if (!passkey) {
      throw new Error('Passkey not found');
    }

    passkey.name = newName;
    await this.savePasskey(passkey);
  }

  /**
   * Clear all passkeys
   * 
   * Warning: This only clears metadata. The actual credentials remain
   * in the authenticator and must be removed through system settings.
   */
  async clearAllPasskeys(): Promise<void> {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear passkey metadata:', error);
      throw new Error('Failed to clear passkey metadata');
    }
  }

  /**
   * Get passkey count
   */
  async getPasskeyCount(): Promise<number> {
    const passkeys = await this.listPasskeys();
    return passkeys.length;
  }

  /**
   * Check if a passkey exists
   * 
   * @param credentialId - Credential ID
   */
  async hasPasskey(credentialId: string): Promise<boolean> {
    const passkey = await this.getPasskey(credentialId);
    return passkey !== null;
  }

  /**
   * Export passkeys as JSON
   * 
   * @returns JSON string of all passkeys
   */
  async exportPasskeys(): Promise<string> {
    const passkeys = await this.listPasskeys();
    return JSON.stringify(passkeys, null, 2);
  }

  /**
   * Import passkeys from JSON
   * 
   * Warning: This overwrites existing passkeys
   * 
   * @param json - JSON string of passkeys
   */
  async importPasskeys(json: string): Promise<void> {
    if (!this.storage) {
      throw new Error('Storage not available');
    }

    try {
      const passkeys = JSON.parse(json) as PasskeyCredential[];

      // Validate structure
      if (!Array.isArray(passkeys)) {
        throw new Error('Invalid passkey data format');
      }

      for (const passkey of passkeys) {
        if (!passkey.id || !passkey.name || !passkey.createdAt) {
          throw new Error('Invalid passkey structure');
        }
      }

      this.storage.setItem(STORAGE_KEY, JSON.stringify(passkeys));
    } catch (error) {
      console.error('Failed to import passkey metadata:', error);
      throw new Error('Failed to import passkey metadata');
    }
  }
}
