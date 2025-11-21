/**
 * Cache Clearing Utility
 * Helps clear all stored data for debugging
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const clearAllCache = async () => {
  try {
    console.log('🧹 Starting cache clear...');
    
    // Clear AsyncStorage
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage cleared');
    
    // Clear SecureStore (only on native platforms)
    if (Platform.OS !== 'web') {
      const keys = [
        'order-storage',
        'garment-config-storage',
        'auth-storage',
        'user-storage'
      ];
      
      for (const key of keys) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          // Key might not exist, ignore
        }
      }
      console.log('✅ SecureStore cleared');
    }
    
    // Clear web localStorage and sessionStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
      console.log('✅ Web storage cleared');
    }
    
    console.log('🎉 All cache cleared successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return false;
  }
};

export const clearOrderCache = async () => {
  try {
    console.log('🧹 Clearing order cache only...');
    
    // Clear order-related storage keys
    await AsyncStorage.removeItem('order-storage');
    await AsyncStorage.removeItem('garment-config-storage');
    
    if (Platform.OS !== 'web') {
      try {
        await SecureStore.deleteItemAsync('order-storage');
        await SecureStore.deleteItemAsync('garment-config-storage');
      } catch (error) {
        // Ignore if keys don't exist
      }
    }
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem('order-storage');
      window.localStorage.removeItem('garment-config-storage');
    }
    
    console.log('✅ Order cache cleared!');
    return true;
  } catch (error) {
    console.error('❌ Error clearing order cache:', error);
    return false;
  }
};

export const debugStorageContents = async () => {
  try {
    console.log('🔍 Debugging storage contents...');
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      console.log('📦 LocalStorage contents:');
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          const value = window.localStorage.getItem(key);
          console.log(`  ${key}:`, value?.substring(0, 100) + '...');
        }
      }
    } else {
      const keys = await AsyncStorage.getAllKeys();
      console.log('📦 AsyncStorage keys:', keys);
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`  ${key}:`, value?.substring(0, 100) + '...');
      }
    }
  } catch (error) {
    console.error('❌ Error debugging storage:', error);
  }
};

