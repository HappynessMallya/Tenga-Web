/**
 * Garment Configuration Hook
 * Custom hook for easy access to garment configuration store
 */

import { useGarmentConfigStore } from '../store/garmentConfigStore';
import { SimplifiedGarmentCategory, SimplifiedGarmentType, ServiceType, SelectedGarment } from '../types/garment';

export const useGarmentConfig = () => {
  const store = useGarmentConfigStore();

  // Helper functions
  const getCategories = (): SimplifiedGarmentCategory[] => {
    console.log('📁 useGarmentConfig: Getting categories:', store.categories.length);
    return store.categories;
  };

  const getCategoryById = (categoryId: string): SimplifiedGarmentCategory | null => {
    console.log('🔍 useGarmentConfig: Getting category by ID:', categoryId);
    const category = store.categories.find(cat => cat.id === categoryId);
    if (category) {
      console.log('✅ useGarmentConfig: Found category:', category.name);
    } else {
      console.log('❌ useGarmentConfig: Category not found');
    }
    return category || null;
  };

  const getGarmentTypeById = (categoryId: string, garmentTypeId: string): SimplifiedGarmentType | null => {
    console.log('🔍 useGarmentConfig: Getting garment type by ID:', categoryId, garmentTypeId);
    return store.getGarmentTypeById(categoryId, garmentTypeId);
  };

  const getAvailableServices = (garmentType: SimplifiedGarmentType): ServiceType[] => {
    console.log('🔍 useGarmentConfig: Getting available services for:', garmentType.name);
    const services = Object.keys(garmentType.pricing) as ServiceType[];
    console.log('📋 Available services:', services);
    return services;
  };

  const getServicePricing = (garmentType: SimplifiedGarmentType, serviceType: ServiceType): number | null => {
    console.log('💰 useGarmentConfig: Getting pricing for:', garmentType.name, serviceType);
    const pricing = garmentType.pricing[serviceType];
    if (pricing) {
      console.log('💵 Price found:', pricing.amount, pricing.currency);
      return pricing.amount;
    }
    console.log('❌ No pricing found');
    return null;
  };

  const calculateItemTotal = (garmentType: SimplifiedGarmentType, serviceType: ServiceType, quantity: number): number => {
    console.log('🧮 useGarmentConfig: Calculating item total:', garmentType.name, serviceType, quantity);
    const unitPrice = getServicePricing(garmentType, serviceType);
    if (unitPrice !== null) {
      const total = unitPrice * quantity;
      console.log('💵 Item total:', total);
      return total;
    }
    console.log('❌ Cannot calculate total - no pricing found');
    return 0;
  };

  const getTotalPrice = (): number => {
    console.log('🧮 useGarmentConfig: Getting total price');
    return store.calculateTotalPrice();
  };

  const getSelectedGarments = (): SelectedGarment[] => {
    console.log('📋 useGarmentConfig: Getting selected garments:', store.selectedGarments.length);
    return store.selectedGarments;
  };

  const hasSelectedGarments = (): boolean => {
    const hasGarments = store.selectedGarments.length > 0;
    console.log('📋 useGarmentConfig: Has selected garments:', hasGarments);
    return hasGarments;
  };

  const addGarmentToSelection = (garmentType: SimplifiedGarmentType, serviceType: ServiceType, quantity: number = 1): void => {
    console.log('➕ useGarmentConfig: Adding garment to selection:', garmentType.name, serviceType, quantity);
    
    const unitPrice = getServicePricing(garmentType, serviceType);
    if (unitPrice !== null) {
      // Check if this garment type and service type combination already exists
      const existingIndex = store.selectedGarments.findIndex(
        item => item.garmentTypeId === garmentType.id && item.serviceType === serviceType
      );
      
      if (existingIndex !== -1) {
        // If it exists, increment the quantity
        console.log('🔄 useGarmentConfig: Incrementing existing garment quantity');
        const existingGarment = store.selectedGarments[existingIndex];
        const newQuantity = existingGarment.quantity + quantity;
        store.updateGarmentQuantity(existingIndex, newQuantity);
        console.log('✅ useGarmentConfig: Quantity updated to:', newQuantity);
      } else {
        // If it doesn't exist, add as new garment
        console.log('🆕 useGarmentConfig: Adding new garment');
        const selectedGarment: SelectedGarment = {
          categoryId: garmentType.category,
          categoryName: garmentType.categoryName,
          garmentTypeId: garmentType.id,
          garmentTypeName: garmentType.name,
          serviceType,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };
        
        store.addGarment(selectedGarment);
        console.log('✅ useGarmentConfig: New garment added successfully');
      }
    } else {
      console.log('❌ useGarmentConfig: Cannot add garment - no pricing found');
    }
  };

  const removeGarmentFromSelection = (index: number): void => {
    console.log('➖ useGarmentConfig: Removing garment from selection at index:', index);
    store.removeGarment(index);
  };

  const updateGarmentQuantity = (index: number, quantity: number): void => {
    console.log('🔢 useGarmentConfig: Updating garment quantity at index:', index, 'to:', quantity);
    store.updateGarmentQuantity(index, quantity);
  };

  const updateGarmentService = (index: number, serviceType: ServiceType): void => {
    console.log('🔄 useGarmentConfig: Updating garment service at index:', index, 'to:', serviceType);
    store.updateGarmentService(index, serviceType);
  };

  const clearSelection = (): void => {
    console.log('🗑️ useGarmentConfig: Clearing garment selection');
    store.clearSelectedGarments();
  };

  const isConfigLoaded = (): boolean => {
    const isLoaded = store.categories.length > 0 && !store.isLoading;
    console.log('📊 useGarmentConfig: Config loaded:', isLoaded);
    return isLoaded;
  };

  const needsRefresh = (): boolean => {
    if (!store.lastUpdated) return true;
    
    const lastUpdated = new Date(store.lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    const needsRefresh = hoursSinceUpdate > 24; // Refresh if older than 24 hours
    console.log('🕒 useGarmentConfig: Needs refresh:', needsRefresh, 'Hours since update:', hoursSinceUpdate);
    return needsRefresh;
  };

  return {
    // State
    categories: store.categories,
    selectedGarments: store.selectedGarments,
    isLoading: store.isLoading,
    error: store.error,
    lastUpdated: store.lastUpdated,
    businessId: store.businessId,
    
    // Actions
    fetchGarmentConfig: store.fetchGarmentConfig,
    refreshGarmentConfig: store.refreshGarmentConfig,
    clearError: store.clearError,
    resetGarmentConfig: store.resetGarmentConfig,
    
    // Helper functions
    getCategories,
    getCategoryById,
    getGarmentTypeById,
    getAvailableServices,
    getServicePricing,
    calculateItemTotal,
    getTotalPrice,
    getSelectedGarments,
    hasSelectedGarments,
    addGarmentToSelection,
    removeGarmentFromSelection,
    updateGarmentQuantity,
    updateGarmentService,
    clearSelection,
    isConfigLoaded,
    needsRefresh,
  };
};
