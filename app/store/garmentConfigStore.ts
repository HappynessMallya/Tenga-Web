/**
 * Garment Configuration Store (Zustand)
 * Global state management for garment categories, types, and pricing
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  garmentConfigService, 
  GarmentConfigResponse, 
  SimplifiedGarmentCategory, 
  SimplifiedGarmentType, 
  ServiceType,
  SelectedGarment 
} from '../services/garmentConfigService';

interface GarmentConfigState {
  // State
  categories: SimplifiedGarmentCategory[];
  selectedGarments: SelectedGarment[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  businessId: string | null;

  // Actions
  setCategories: (categories: SimplifiedGarmentCategory[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: string) => void;
  setBusinessId: (businessId: string) => void;
  
  // Async actions
  fetchGarmentConfig: (businessId: string) => Promise<void>;
  refreshGarmentConfig: () => Promise<void>;
  
  // Garment selection actions
  addGarment: (garment: SelectedGarment) => void;
  removeGarment: (index: number) => void;
  updateGarmentQuantity: (index: number, quantity: number) => void;
  updateGarmentService: (index: number, serviceType: ServiceType) => void;
  clearSelectedGarments: () => void;
  
  // Utility actions
  clearError: () => void;
  resetGarmentConfig: () => void;
  calculateTotalPrice: () => number;
  getGarmentTypeById: (categoryId: string, garmentTypeId: string) => SimplifiedGarmentType | null;
}

const initialState = {
  categories: [],
  selectedGarments: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  businessId: null,
};

export const useGarmentConfigStore = create<GarmentConfigState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCategories: (categories) => {
        console.log('📁 GarmentConfigStore: Setting categories:', categories.length);
        set({ categories });
      },

      setLoading: (loading) => {
        console.log('⏳ GarmentConfigStore: Setting loading:', loading);
        set({ isLoading: loading });
      },

      setError: (error) => {
        console.log('❌ GarmentConfigStore: Setting error:', error);
        set({ error });
      },

      setLastUpdated: (date) => {
        console.log('🕒 GarmentConfigStore: Setting last updated:', date);
        set({ lastUpdated: date });
      },

      setBusinessId: (businessId) => {
        console.log('🏢 GarmentConfigStore: Setting business ID:', businessId);
        set({ businessId });
      },

      fetchGarmentConfig: async (businessId: string) => {
        const { isLoading } = get();
        
        console.log('🚀 GarmentConfigStore: fetchGarmentConfig called');
        console.log('🏢 Business ID:', businessId);
        console.log('⏳ Current loading state:', isLoading);
        
        // Prevent multiple simultaneous requests
        if (isLoading) {
          console.log('⏸️ GarmentConfigStore: Request already in progress, skipping');
          return;
        }

        try {
          console.log('🔄 GarmentConfigStore: Setting loading = true');
          set({ isLoading: true, error: null });

          console.log('🌐 GarmentConfigStore: Making API request');
          const response: GarmentConfigResponse = await garmentConfigService.getGarmentConfig(businessId);
          
          console.log('📦 GarmentConfigStore: API response received:', JSON.stringify(response, null, 2));
          
          if (response.success && response.data) {
            console.log('✅ GarmentConfigStore: Response successful, transforming data');
            
            const simplifiedCategories = garmentConfigService.transformToSimplified(response.data.config);
            
            console.log('📊 GarmentConfigStore: Processing response data');
            console.log('📋 Categories count:', simplifiedCategories.length);
            console.log('👕 Total garment types:', simplifiedCategories.reduce((sum, cat) => sum + cat.garmentTypes.length, 0));
            
            set({
              categories: simplifiedCategories,
              businessId: businessId,
              lastUpdated: new Date().toISOString(),
            });
            
            console.log('✅ GarmentConfigStore: Garment config updated successfully');
          } else {
            console.log('❌ GarmentConfigStore: Invalid response format');
            set({ error: 'Invalid response format from server' });
          }
        } catch (error: any) {
          console.error('❌ GarmentConfigStore: Failed to fetch garment config:', error);
          console.error('❌ GarmentConfigStore: Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          });
          set({ error: error.message });
        } finally {
          console.log('🏁 GarmentConfigStore: Setting loading states to false');
          set({ isLoading: false });
        }
      },

      refreshGarmentConfig: async () => {
        const { businessId, fetchGarmentConfig } = get();
        console.log('🔄 GarmentConfigStore: Refreshing garment config');
        
        if (businessId) {
          await fetchGarmentConfig(businessId);
        } else {
          console.log('❌ GarmentConfigStore: No business ID available for refresh');
          set({ error: 'No business ID available for refresh' });
        }
      },

      addGarment: (garment) => {
        console.log('➕ GarmentConfigStore: Adding garment:', garment);
        
        set((state) => {
          const newGarments = [...state.selectedGarments, garment];
          console.log('📋 GarmentConfigStore: Total garments:', newGarments.length);
          return { selectedGarments: newGarments };
        });
      },

      removeGarment: (index) => {
        console.log('➖ GarmentConfigStore: Removing garment at index:', index);
        
        set((state) => {
          const newGarments = state.selectedGarments.filter((_, i) => i !== index);
          console.log('📋 GarmentConfigStore: Remaining garments:', newGarments.length);
          return { selectedGarments: newGarments };
        });
      },

      updateGarmentQuantity: (index, quantity) => {
        console.log('🔢 GarmentConfigStore: Updating garment quantity at index:', index, 'to:', quantity);
        
        set((state) => {
          const newGarments = [...state.selectedGarments];
          if (newGarments[index]) {
            newGarments[index].quantity = quantity;
            newGarments[index].totalPrice = newGarments[index].unitPrice * quantity;
            console.log('💰 GarmentConfigStore: Updated total price:', newGarments[index].totalPrice);
          }
          return { selectedGarments: newGarments };
        });
      },

      updateGarmentService: (index, serviceType) => {
        console.log('🔄 GarmentConfigStore: Updating garment service at index:', index, 'to:', serviceType);
        
        set((state) => {
          const newGarments = [...state.selectedGarments];
          if (newGarments[index]) {
            const garment = newGarments[index];
            const garmentType = get().getGarmentTypeById(garment.categoryId, garment.garmentTypeId);
            
            if (garmentType) {
              const newPrice = garmentConfigService.getServicePricing(garmentType, serviceType);
              if (newPrice !== null) {
                newGarments[index].serviceType = serviceType;
                newGarments[index].unitPrice = newPrice;
                newGarments[index].totalPrice = newPrice * garment.quantity;
                console.log('💰 GarmentConfigStore: Updated service and price:', serviceType, newPrice);
              }
            }
          }
          return { selectedGarments: newGarments };
        });
      },

      clearSelectedGarments: () => {
        console.log('🗑️ GarmentConfigStore: Clearing all selected garments');
        set({ selectedGarments: [] });
      },

      clearError: () => {
        console.log('🧹 GarmentConfigStore: Clearing error');
        set({ error: null });
      },

      resetGarmentConfig: () => {
        console.log('🔄 GarmentConfigStore: Resetting garment config');
        set(initialState);
      },

      calculateTotalPrice: () => {
        const { selectedGarments } = get();
        console.log('🧮 GarmentConfigStore: Calculating total price for', selectedGarments.length, 'garments');
        
        const total = selectedGarments.reduce((sum, garment) => sum + garment.totalPrice, 0);
        console.log('💵 GarmentConfigStore: Total price:', total);
        
        return total;
      },

      getGarmentTypeById: (categoryId, garmentTypeId) => {
        console.log('🔍 GarmentConfigStore: Getting garment type by ID:', categoryId, garmentTypeId);
        
        const { categories } = get();
        const category = categories.find(cat => cat.id === categoryId);
        
        if (category) {
          const garmentType = category.garmentTypes.find(gt => gt.id === garmentTypeId);
          if (garmentType) {
            console.log('✅ GarmentConfigStore: Found garment type:', garmentType.name);
            return garmentType;
          }
        }
        
        console.log('❌ GarmentConfigStore: Garment type not found');
        return null;
      },
    }),
    {
      name: 'garment-config-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        categories: state.categories,
        selectedGarments: state.selectedGarments,
        lastUpdated: state.lastUpdated,
        businessId: state.businessId,
      }),
    }
  )
);
