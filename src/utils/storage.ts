import AsyncStorage from '@react-native-async-storage/async-storage';
import { Utang, AppState } from '../types';

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
    const state = await this.loadAppState() || { utangs: [], isFirstTime: true, lastCalculated: '' };
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

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}; 