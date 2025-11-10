import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from '../services/locationService';

// Platform-aware storage for Zustand
const secureStorage = createJSONStorage(() => ({
  setItem: async (name: string, value: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(name, value);
    } else {
      await SecureStore.setItemAsync(name, value);
    }
  },
  getItem: async (name: string) => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(name);
    } else {
      return await SecureStore.getItemAsync(name);
    }
  },
  removeItem: async (name: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(name);
    } else {
      await SecureStore.deleteItemAsync(name);
    }
  },
}));

interface LocationState {
  locationData: LocationData | null;
  
  // Actions
  setLocationData: (locationData: LocationData) => void;
  clearLocationData: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      locationData: null,
      
      setLocationData: (locationData) => set({ locationData }),
      clearLocationData: () => set({ locationData: null }),
    }),
    {
      name: 'location-storage',
      storage: secureStorage,
      partialize: (state) => ({
        locationData: state.locationData,
      }),
    }
  )
);

