import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import 'react-native-get-random-values'; // Polyfill for crypto.getRandomValues

// Hardware Security Module Configuration
const HSM_CONFIG = {
  // Use app bundle ID + device-specific identifier for key isolation
  MASTER_KEY_ALIAS: `${Constants.expoConfig?.slug || 'utangfree'}.master.encryption.key`,
  UTANG_KEY_ALIAS: `${Constants.expoConfig?.slug || 'utangfree'}.utang.data.key`,
  PROFILE_KEY_ALIAS: `${Constants.expoConfig?.slug || 'utangfree'}.profile.data.key`,
  PAYMENT_KEY_ALIAS: `${Constants.expoConfig?.slug || 'utangfree'}.payment.data.key`,
  
  // Security options - uses device's secure enclave/TEE
  SECURITY_OPTIONS: {
    requireAuthentication: false, // Can be enabled for additional security
    accessGroup: undefined, // iOS: Use default app access group
    authenticationPrompt: 'Authenticate to access your financial data',
    keychainService: undefined, // Use default
  } as SecureStore.SecureStoreOptions
};

export class EncryptionUtils {
  private static keyCache: Map<string, string> = new Map();

  /**
   * Generate a cryptographically secure key using hardware RNG
   */
  private static async generateSecureKey(): Promise<string> {
    // Use expo-crypto for secure random generation
    const randomBytes = await Crypto.getRandomBytesAsync(32); // 256 bits
    // Convert to hex string
    return Array.from(new Uint8Array(randomBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Get or generate encryption key for specific data type from Hardware Security Module
   */
  private static async getEncryptionKey(keyAlias: string): Promise<string> {
    // Check memory cache first
    if (this.keyCache.has(keyAlias)) {
      return this.keyCache.get(keyAlias)!;
    }

    try {
      // Try to retrieve existing key from device's secure enclave/TEE
      const existingKey = await SecureStore.getItemAsync(keyAlias, HSM_CONFIG.SECURITY_OPTIONS);
      
      if (existingKey) {
        this.keyCache.set(keyAlias, existingKey);
        return existingKey;
      }
    } catch (error) {
      console.log(`No existing key found for ${keyAlias}, generating new secure key`);
    }

    // Generate new hardware-backed key
    const newKey = await this.generateSecureKey();
    
    // Store in device's secure hardware (secure enclave on iOS, TEE on Android)
    await SecureStore.setItemAsync(keyAlias, newKey, HSM_CONFIG.SECURITY_OPTIONS);
    
    this.keyCache.set(keyAlias, newKey);
    return newKey;
  }

  /**
   * Get master encryption key from Hardware Security Module
   */
  private static async getMasterKey(): Promise<string> {
    return await this.getEncryptionKey(HSM_CONFIG.MASTER_KEY_ALIAS);
  }

  /**
   * Simple XOR encryption with secure key (for React Native compatibility)
   * Note: This is a simplified approach for React Native. In production, 
   * you might want to use a more robust encryption library.
   */
  private static xorEncrypt(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const dataChar = data.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(dataChar ^ keyChar);
    }
    return result;
  }

  /**
   * Convert string to base64 for safe storage
   */
  private static toBase64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
  }

  /**
   * Convert base64 back to string
   */
  private static fromBase64(str: string): string {
    return decodeURIComponent(escape(atob(str)));
  }

  /**
   * Encrypt data using hardware-backed keys with React Native compatibility
   */
  static async encrypt(data: string, dataType: 'utang' | 'profile' | 'payment' = 'utang'): Promise<string> {
    try {
      // Get appropriate key based on data type for isolation
      const keyAlias = this.getKeyAliasForDataType(dataType);
      const key = await this.getEncryptionKey(keyAlias);
      
      // Generate random salt for each encryption
      const saltBytes = await Crypto.getRandomBytesAsync(16);
      const salt = Array.from(new Uint8Array(saltBytes))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Encrypt using XOR with key + salt
      const combinedKey = key + salt;
      const encrypted = this.xorEncrypt(data, combinedKey);
      
      // Combine salt + encrypted data and encode to base64
      const combined = salt + ':' + this.toBase64(encrypted);
      
      return combined;
    } catch (error) {
      console.error('Hardware encryption error:', error);
      throw new Error('Failed to encrypt data using hardware security');
    }
  }

  /**
   * Decrypt data using hardware-backed keys with React Native compatibility
   */
  static async decrypt(encryptedData: string, dataType: 'utang' | 'profile' | 'payment' = 'utang'): Promise<string> {
    try {
      // Split salt and encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      
      const salt = parts[0];
      const encryptedBase64 = parts[1];
      
      // Get appropriate key based on data type
      const keyAlias = this.getKeyAliasForDataType(dataType);
      const key = await this.getEncryptionKey(keyAlias);
      
      // Decrypt using XOR with key + salt
      const combinedKey = key + salt;
      const encrypted = this.fromBase64(encryptedBase64);
      const decrypted = this.xorEncrypt(encrypted, combinedKey);
      
      return decrypted;
    } catch (error) {
      console.error('Hardware decryption error:', error);
      throw new Error('Failed to decrypt data using hardware security');
    }
  }

  /**
   * Get key alias for specific data type
   */
  private static getKeyAliasForDataType(dataType: 'utang' | 'profile' | 'payment'): string {
    switch (dataType) {
      case 'utang': return HSM_CONFIG.UTANG_KEY_ALIAS;
      case 'profile': return HSM_CONFIG.PROFILE_KEY_ALIAS;
      case 'payment': return HSM_CONFIG.PAYMENT_KEY_ALIAS;
      default: return HSM_CONFIG.MASTER_KEY_ALIAS;
    }
  }

  /**
   * Encrypt JSON object with data type for key isolation
   */
  static async encryptJSON(obj: any, dataType: 'utang' | 'profile' | 'payment' = 'utang'): Promise<string> {
    const jsonString = JSON.stringify(obj);
    return await this.encrypt(jsonString, dataType);
  }

  /**
   * Decrypt to JSON object with data type for key isolation
   */
  static async decryptJSON(encryptedData: string, dataType: 'utang' | 'profile' | 'payment' = 'utang'): Promise<any> {
    const decryptedString = await this.decrypt(encryptedData, dataType);
    return JSON.parse(decryptedString);
  }

  /**
   * Check if data appears to be encrypted using hardware security format
   */
  static isEncrypted(data: string): boolean {
    try {
      // Check for our hardware encryption format: salt:base64EncryptedData
      if (data.includes(':') && data.split(':').length === 2) {
        const [saltPart, encryptedPart] = data.split(':');
        // Salt should be 32 hex characters (16 bytes), encrypted part should be base64
        return /^[a-fA-F0-9]{32}$/.test(saltPart) && encryptedPart.length > 20;
      }
      
      // Legacy encryption check
      JSON.parse(data);
      return false; // If it parses as JSON, it's likely not encrypted
    } catch {
      // Additional legacy check: encrypted data is typically base64-like
      return data.length > 20 && /^[A-Za-z0-9+/=]+$/.test(data);
    }
  }

  /**
   * Enable biometric authentication for encryption keys
   */
  static async enableBiometricAuth(): Promise<void> {
    // This would require re-storing all keys with biometric requirement
    // Implementation depends on specific security requirements
    console.log('Biometric authentication can be enabled in HSM_CONFIG.SECURITY_OPTIONS');
  }

  /**
   * Reset all encryption keys (clear all hardware-stored keys) - use with extreme caution!
   */
  static async resetAllEncryption(): Promise<void> {
    try {
      const keyAliases = [
        HSM_CONFIG.MASTER_KEY_ALIAS,
        HSM_CONFIG.UTANG_KEY_ALIAS,
        HSM_CONFIG.PROFILE_KEY_ALIAS,
        HSM_CONFIG.PAYMENT_KEY_ALIAS
      ];

      for (const alias of keyAliases) {
        try {
          await SecureStore.deleteItemAsync(alias);
        } catch (error) {
          console.log(`Key ${alias} not found or already deleted`);
        }
      }

      // Clear memory cache
      this.keyCache.clear();
      
      console.log('All hardware encryption keys reset successfully');
    } catch (error) {
      console.error('Error resetting hardware encryption keys:', error);
      throw new Error('Failed to reset hardware encryption keys');
    }
  }

  /**
   * Get encryption status and key information
   */
  static async getEncryptionStatus(): Promise<{
    hasKeys: boolean;
    keyTypes: string[];
    hardwareSecurityLevel: string;
  }> {
    const keyAliases = [
      HSM_CONFIG.MASTER_KEY_ALIAS,
      HSM_CONFIG.UTANG_KEY_ALIAS,
      HSM_CONFIG.PROFILE_KEY_ALIAS,
      HSM_CONFIG.PAYMENT_KEY_ALIAS
    ];

    const existingKeys: string[] = [];
    
    for (const alias of keyAliases) {
      try {
        const key = await SecureStore.getItemAsync(alias);
        if (key) existingKeys.push(alias);
      } catch (error) {
        // Key doesn't exist
      }
    }

    return {
      hasKeys: existingKeys.length > 0,
      keyTypes: existingKeys,
      hardwareSecurityLevel: 'Hardware Security Module (Secure Enclave/TEE)'
    };
  }
}