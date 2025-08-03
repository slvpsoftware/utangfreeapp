import AsyncStorage from '@react-native-async-storage/async-storage';
import { Utang, AppState, UserProfile, PaymentHistory } from '../types';

const STORAGE_KEY = 'UTANG_FREE_DATA';

export const StorageUtils = {
  // Save app state
  async saveAppState(state: AppState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  },

  // Load app state
  async loadAppState(): Promise<AppState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
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

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}; 