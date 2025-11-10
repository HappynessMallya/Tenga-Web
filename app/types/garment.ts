/**
 * Garment Configuration Types
 * TypeScript interfaces for the garment configuration API response
 */

// Service types for pricing
export type ServiceType = 'WASH_FOLD' | 'DRY_CLEAN' | 'HANG_DRY' | 'IRON_ONLY';

// Pricing information for each service type
export interface ServicePricing {
  amount: number;
  currency: string;
}

// Pricing configuration for a garment type
export interface GarmentTypePricing {
  [key: string]: ServicePricing;
}

// Individual garment type (e.g., Shirts, Pants, Dress)
export interface GarmentType {
  name: string;
  description: string;
  displayOrder: number;
  pricing: GarmentTypePricing;
}

// Garment types within a category
export interface GarmentTypes {
  [key: string]: GarmentType;
}

// Garment category (e.g., Tops, Bottoms, Full body)
export interface GarmentCategory {
  name: string;
  description: string;
  displayOrder: number;
  garmentTypes: GarmentTypes;
}

// All categories
export interface GarmentCategories {
  [key: string]: GarmentCategory;
}

// Main configuration object
export interface GarmentConfig {
  categories: GarmentCategories;
}

// Complete API response structure
export interface GarmentConfigResponse {
  success: boolean;
  data: {
    id: string;
    businessId: string;
    config: GarmentConfig;
    version: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Simplified types for easier usage
export interface SimplifiedGarmentType {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryName: string;
  displayOrder: number;
  pricing: GarmentTypePricing;
}

export interface SimplifiedGarmentCategory {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  garmentTypes: SimplifiedGarmentType[];
}

// Service type with pricing
export interface ServiceWithPricing {
  type: ServiceType;
  name: string;
  description: string;
  pricing?: ServicePricing;
}

// Helper type for garment selection
export interface SelectedGarment {
  categoryId: string;
  categoryName: string;
  garmentTypeId: string;
  garmentTypeName: string;
  serviceType: ServiceType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
