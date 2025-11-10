/**
 * Secure Storage Utilities
 * Handles secure storage of sensitive data like JWT tokens and user information
 * Falls back to AsyncStorage on web platform
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform-aware storage adapter
const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

// Token management
export const saveToken = async (token: string): Promise<void> => {
  try {
    await storage.setItem('userToken', token);
  } catch (error) {
    console.error('Failed to save token:', error);
    throw new Error('Failed to save authentication token');
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await storage.getItem('userToken');
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await storage.removeItem('userToken');
  } catch (error) {
    console.error('Failed to remove token:', error);
    throw new Error('Failed to remove authentication token');
  }
};

// User data management
export const saveUser = async (user: any): Promise<void> => {
  try {
    await storage.setItem('userData', JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw new Error('Failed to save user data');
  }
};

export const getUser = async (): Promise<any | null> => {
  try {
    const data = await storage.getItem('userData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await storage.removeItem('userData');
  } catch (error) {
    console.error('Failed to remove user data:', error);
    throw new Error('Failed to remove user data');
  }
};

// Clear all stored data (logout)
export const clearAllData = async (): Promise<void> => {
  try {
    console.log('🔄 Clearing all stored data...');
    
    // Clear token and user data in parallel
    const results = await Promise.allSettled([
      removeToken(),
      removeUser(),
    ]);
    
    // Check if any operations failed
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      console.warn('⚠️ Some storage operations failed:', failures);
      
      // If all operations failed, throw an error
      if (failures.length === results.length) {
        throw new Error('Failed to clear all stored data');
      }
      
      // If only some failed, log warnings but don't throw
      console.warn('⚠️ Partial storage cleanup completed');
    }
    
    console.log('✅ All stored data cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear all data:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to clear stored data';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    throw new Error(errorMessage);
  }
};

// Check if user is logged in
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    return !!token;
  } catch (error) {
    console.error('Failed to check login status:', error);
    return false;
  }
};