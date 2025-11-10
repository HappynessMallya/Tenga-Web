/**
 * Garment Configuration Service
 * Handles API calls for garment categories, types, and pricing
 */

import API from '../api/axiosInstance';
import { GarmentConfigResponse, GarmentConfig, SimplifiedGarmentCategory, SimplifiedGarmentType, ServiceType } from '../types/garment';

// Service type names for display
export const SERVICE_TYPE_NAMES: Record<ServiceType, string> = {
  WASH_FOLD: 'Wash & Fold',
  DRY_CLEAN: 'Dry Clean',
  HANG_DRY: 'Hang Dry',
  IRON_ONLY: 'Iron Only',
};

// Service type descriptions
export const SERVICE_TYPE_DESCRIPTIONS: Record<ServiceType, string> = {
  WASH_FOLD: 'Standard washing and folding service',
  DRY_CLEAN: 'Professional dry cleaning service',
  HANG_DRY: 'Wash and hang dry service',
  IRON_ONLY: 'Ironing service only',
};

// Garment configuration service functions
export const garmentConfigService = {
  /**
   * Get garment configuration for a business
   */
  getGarmentConfig: async (businessId: string): Promise<GarmentConfigResponse> => {
    try {
      console.log('🌐 GarmentConfigService: getGarmentConfig called');
      console.log('🏢 Business ID:', businessId);
      
      const url = `/garment-config/${businessId}`;
      console.log('🔗 GarmentConfigService: Making request to URL:', url);
      
      const response = await API.get(url);
      
      console.log('📦 GarmentConfigService: Raw response received:');
      console.log('📊 Status:', response.status);
      console.log('📋 Headers:', response.headers);
      console.log('📄 Data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ GarmentConfigService: Failed to fetch garment config:', error);
      console.error('❌ GarmentConfigService: Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        console.log('🔐 GarmentConfigService: 401 Unauthorized - Authentication required');
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        console.log('🚫 GarmentConfigService: 403 Forbidden - Access denied');
        throw new Error('Access denied. You do not have permission to view garment configuration.');
      } else if (error.response?.status === 404) {
        console.log('🔍 GarmentConfigService: 404 Not Found - Garment config not found');
        throw new Error('Garment configuration not found for this business.');
      } else if (error.response?.status === 500) {
        console.log('💥 GarmentConfigService: 500 Server Error');
        throw new Error('Server error while fetching garment configuration.');
      } else {
        console.log('❓ GarmentConfigService: Unknown error occurred');
        throw new Error('Failed to fetch garment configuration. Please try again.');
      }
    }
  },

  /**
   * Transform raw API response to simplified format for easier usage
   */
  transformToSimplified: (config: GarmentConfig): SimplifiedGarmentCategory[] => {
    console.log('🔄 GarmentConfigService: Transforming config to simplified format');
    
    const categories: SimplifiedGarmentCategory[] = [];
    
    Object.entries(config.categories).forEach(([categoryId, category]) => {
      console.log(`📁 Processing category: ${category.name} (${categoryId})`);
      
      const garmentTypes: SimplifiedGarmentType[] = [];
      
      Object.entries(category.garmentTypes).forEach(([garmentTypeId, garmentType]) => {
        console.log(`👕 Processing garment type: ${garmentType.name} (${garmentTypeId})`);
        console.log(`🔍 Garment type ID: "${garmentTypeId}", Name: "${garmentType.name}"`);
        
        garmentTypes.push({
          id: garmentTypeId,
          name: garmentType.name,
          description: garmentType.description,
          category: categoryId,
          categoryName: category.name,
          displayOrder: garmentType.displayOrder,
          pricing: garmentType.pricing,
        });
      });
      
      // Sort garment types by display order
      garmentTypes.sort((a, b) => a.displayOrder - b.displayOrder);
      
      categories.push({
        id: categoryId,
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        garmentTypes,
      });
    });
    
    // Sort categories by display order
    categories.sort((a, b) => a.displayOrder - b.displayOrder);
    
    console.log('✅ GarmentConfigService: Transformation complete');
    console.log('📊 Categories count:', categories.length);
    console.log('👕 Total garment types:', categories.reduce((sum, cat) => sum + cat.garmentTypes.length, 0));
    
    return categories;
  },

  /**
   * Get available service types for a garment type
   */
  getAvailableServices: (garmentType: SimplifiedGarmentType): ServiceType[] => {
    console.log(`🔍 GarmentConfigService: Getting available services for ${garmentType.name}`);
    
    const availableServices = Object.keys(garmentType.pricing) as ServiceType[];
    console.log('📋 Available services:', availableServices);
    
    return availableServices;
  },

  /**
   * Get service pricing for a specific garment type and service
   */
  getServicePricing: (garmentType: SimplifiedGarmentType, serviceType: ServiceType): number | null => {
    console.log(`💰 GarmentConfigService: Getting pricing for ${garmentType.name} - ${serviceType}`);
    
    const pricing = garmentType.pricing[serviceType];
    if (pricing) {
      console.log('💵 Price found:', pricing.amount, pricing.currency);
      return pricing.amount;
    }
    
    console.log('❌ No pricing found for this service type');
    return null;
  },

  /**
   * Calculate total price for multiple garments
   */
  calculateTotalPrice: (garments: Array<{
    garmentType: SimplifiedGarmentType;
    serviceType: ServiceType;
    quantity: number;
  }>): number => {
    console.log('🧮 GarmentConfigService: Calculating total price for', garments.length, 'garments');
    
    let total = 0;
    
    garments.forEach((garment, index) => {
      const price = garmentConfigService.getServicePricing(garment.garmentType, garment.serviceType);
      if (price !== null) {
        const itemTotal = price * garment.quantity;
        total += itemTotal;
        console.log(`💰 Item ${index + 1}: ${garment.garmentType.name} (${garment.serviceType}) x${garment.quantity} = ${itemTotal}`);
      }
    });
    
    console.log('💵 Total price calculated:', total);
    return total;
  },

  /**
   * Get service type display name
   */
  getServiceTypeName: (serviceType: ServiceType): string => {
    return SERVICE_TYPE_NAMES[serviceType] || serviceType;
  },

  /**
   * Get service type description
   */
  getServiceTypeDescription: (serviceType: ServiceType): string => {
    return SERVICE_TYPE_DESCRIPTIONS[serviceType] || '';
  },
};
