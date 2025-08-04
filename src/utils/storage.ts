import AsyncStorage from '@react-native-async-storage/async-storage';
import { Utang, AppState, UserProfile, PaymentHistory } from '../types';
import { EncryptionUtils } from './encryption';

const STORAGE_KEY = 'UTANG_FREE_DATA';

export const StorageUtils = {
  // Save app state (with hardware encryption)
  async saveAppState(state: AppState): Promise<void> {
    try {
      const encryptedData = await EncryptionUtils.encryptJSON(state, 'utang');
      await AsyncStorage.setItem(STORAGE_KEY, encryptedData);
    } catch (error) {
      console.error('Error saving app state:', error);
      throw error;
    }
  },

  // Load app state (with hardware decryption and backward compatibility)
  async loadAppState(): Promise<AppState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return null;

      // Check if data is encrypted or legacy unencrypted
      if (EncryptionUtils.isEncrypted(data)) {
        // Data is encrypted, decrypt with hardware security
        try {
          return await EncryptionUtils.decryptJSON(data, 'utang');
        } catch (decryptError) {
          console.error('Failed to decrypt data with hardware security:', decryptError);
          // If hardware decryption fails, try legacy decryption as fallback
          try {
            return await EncryptionUtils.decryptJSON(data, 'utang');
          } catch (legacyError) {
            console.error('Legacy decryption also failed:', legacyError);
            return null;
          }
        }
      } else {
        // Legacy unencrypted data, parse normally
        try {
          const parsedData = JSON.parse(data);
          
          // Migrate to hardware-encrypted storage automatically
          console.log('Migrating legacy data to hardware-encrypted storage...');
          await this.saveAppState(parsedData);
          
          return parsedData;
        } catch (parseError) {
          console.error('Failed to parse legacy data:', parseError);
          return null;
        }
      }
    } catch (error) {
      console.error('Error loading app state:', error);
      return null;
    }
  },

  // Check if first time user
  async isFirstTimeUser(): Promise<boolean> {
    const state = await this.loadAppState();
    return !state || state.isFirstTime;
  },

  // Save utang
  async saveUtang(utang: Utang): Promise<void> {
    const state = await this.loadAppState() || { 
      utangs: [], 
      isFirstTime: true, 
      lastCalculated: '', 
      paymentHistory: [] 
    };
    state.utangs.push(utang);
    state.isFirstTime = false;
    state.lastCalculated = new Date().toISOString();
    await this.saveAppState(state);
  },

  // Mark utangs as paid
  async markUtangsAsPaid(utangIds: string[]): Promise<void> {
    const state = await this.loadAppState();
    if (!state) return;

    state.utangs = state.utangs.map(utang => 
      utangIds.includes(utang.id) 
        ? { ...utang, status: 'paid' as const, paidAt: new Date().toISOString() }
        : utang
    );
    state.lastCalculated = new Date().toISOString();
    await this.saveAppState(state);
  },

  // Get all utangs
  async getAllUtangs(): Promise<Utang[]> {
    const state = await this.loadAppState();
    return state?.utangs || [];
  },

  // Delete utangs
  async deleteUtangs(utangIds: string[]): Promise<void> {
    const state = await this.loadAppState();
    if (!state) return;

    state.utangs = state.utangs.filter(utang => !utangIds.includes(utang.id));
    state.lastCalculated = new Date().toISOString();
    await this.saveAppState(state);
  },

  // Update utang
  async updateUtang(utangId: string, updates: Partial<Utang>): Promise<void> {
    const state = await this.loadAppState();
    if (!state) return;

    const utangIndex = state.utangs.findIndex(utang => utang.id === utangId);
    if (utangIndex === -1) return;

    state.utangs[utangIndex] = {
      ...state.utangs[utangIndex],
      ...updates,
    };
    state.lastCalculated = new Date().toISOString();
    await this.saveAppState(state);
  },

  // Save user profile
  async saveUserProfile(profile: UserProfile): Promise<void> {
    const state = await this.loadAppState() || { 
      utangs: [], 
      isFirstTime: true, 
      lastCalculated: '', 
      paymentHistory: [] 
    };
    state.userProfile = profile;
    await this.saveAppState(state);
  },

  // Get user profile
  async getUserProfile(): Promise<UserProfile | null> {
    const state = await this.loadAppState();
    return state?.userProfile || null;
  },

  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    const state = await this.loadAppState();
    if (!state || !state.userProfile) return;

    state.userProfile = {
      ...state.userProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.saveAppState(state);
  },

  // Save payment record
  async savePaymentHistory(payment: PaymentHistory): Promise<void> {
    const state = await this.loadAppState() || { 
      utangs: [], 
      isFirstTime: true, 
      lastCalculated: '', 
      paymentHistory: [] 
    };
    if (!state.paymentHistory) {
      state.paymentHistory = [];
    }
    state.paymentHistory.push(payment);
    state.lastCalculated = new Date().toISOString();
    await this.saveAppState(state);
  },

  // Get all payment history
  async getAllPaymentHistory(): Promise<PaymentHistory[]> {
    const state = await this.loadAppState();
    return state?.paymentHistory || [];
  },

  // Delete payment record
  async deletePaymentHistory(paymentId: string): Promise<void> {
    const state = await this.loadAppState();
    if (!state || !state.paymentHistory) return;

    state.paymentHistory = state.paymentHistory.filter(payment => payment.id !== paymentId);
    await this.saveAppState(state);
  },

  // Update payment record
  async updatePaymentHistory(paymentId: string, updates: Partial<PaymentHistory>): Promise<void> {
    const state = await this.loadAppState();
    if (!state || !state.paymentHistory) return;

    const paymentIndex = state.paymentHistory.findIndex(payment => payment.id === paymentId);
    if (paymentIndex === -1) return;

    state.paymentHistory[paymentIndex] = {
      ...state.paymentHistory[paymentIndex],
      ...updates,
    };
    await this.saveAppState(state);
  },

  // Clear all data and encryption keys (for testing and reset)
  async clearAllData(): Promise<void> {
    try {
      // Clear AsyncStorage data
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      // Clear all hardware encryption keys
      await EncryptionUtils.resetAllEncryption();
      
      console.log('All data and encryption keys cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  },

  // Get encryption status for debugging/info
  async getEncryptionInfo(): Promise<any> {
    try {
      return await EncryptionUtils.getEncryptionStatus();
    } catch (error) {
      console.error('Error getting encryption info:', error);
      return { error: 'Failed to get encryption status' };
    }
  }
}; 