/**
 * Vendor/Office Service
 * Handles API calls for searching nearby vendors/offices
 */

import API from '../api/axiosInstance';

export interface OfficeAddress {
  latitude: string;
  longitude: string;
  description: string;
  city: string;
  country: string;
  houseNumber?: string;
  streetName?: string;
  postCode?: string;
  landMark?: string;
  type?: string;
  geoHash?: string;
}

export interface Office {
  id: string;
  businessId: string;
  name: string;
  isMainOffice: boolean;
  phoneNumber: string;
  email: string;
  managerName: string;
  capacity: number;
  isActive: boolean;
  address: OfficeAddress;
  distance: number;
  business?: {
    id: string;
    name: string;
    status: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface NearbyOfficesResponse {
  offices: Office[];
  searchParams: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export const vendorService = {
  /**
   * Search for nearby offices/vendors within a specified radius
   * @param latitude - Customer latitude
   * @param longitude - Customer longitude
   * @param radius - Search radius in meters (default: 10000)
   * @returns List of nearby offices
   */
  searchNearbyOffices: async (
    latitude: number,
    longitude: number,
    radius: number = 10000
  ): Promise<NearbyOfficesResponse> => {
    try {
      console.log('🔍 VendorService: Searching for nearby offices', {
        latitude,
        longitude,
        radius,
      });

      const url = `/offices/search/nearest`;
      const params = {
        latitude,
        longitude,
        radius,
      };

      console.log('🔗 VendorService: Making GET request to:', url, 'with params:', params);
      console.log('🔗 VendorService: Axios baseURL:', API.defaults.baseURL);
      console.log('🔗 VendorService: Full URL will be:', `${API.defaults.baseURL}${url}`);
      console.log('🔗 VendorService: Query string:', new URLSearchParams(params as any).toString());

      const startTime = Date.now();
      const response = await API.get(url, { params });
      const endTime = Date.now();
      
      console.log(`✅ VendorService: Request completed in ${endTime - startTime}ms`);

      console.log('✅ VendorService: Nearby offices found:', {
        count: response.data.offices?.length || 0,
        offices: response.data.offices,
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ VendorService: Failed to search nearby offices:', error);
      console.error('❌ VendorService: Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
      });

      // If it's a network error, timeout, or no offices found, return empty array instead of throwing
      if (
        error.response?.status === 404 || 
        error.response?.status === 200 ||
        error.code === 'ECONNABORTED' || // Timeout
        error.code === 'ENOTFOUND' || // DNS error
        error.code === 'ERR_NETWORK' || // Network error
        !error.response // No response (network issue)
      ) {
        console.warn('⚠️ VendorService: Returning empty offices array due to error');
        return {
          offices: [],
          searchParams: { latitude, longitude, radius },
        };
      }

      // For other errors, still return empty array to allow order creation
      console.warn('⚠️ VendorService: Unexpected error, returning empty offices array');
      return {
        offices: [],
        searchParams: { latitude, longitude, radius },
      };
    }
  },

  /**
   * Check if there are any nearby vendors within the specified radius
   * @param latitude - Customer latitude
   * @param longitude - Customer longitude
   * @param radius - Search radius in meters (default: 10000)
   * @returns true if vendors are found, false otherwise
   */
  hasNearbyVendors: async (
    latitude: number,
    longitude: number,
    radius: number = 10000
  ): Promise<boolean> => {
    try {
      const result = await vendorService.searchNearbyOffices(latitude, longitude, radius);
      return result.offices && result.offices.length > 0;
    } catch (error) {
      console.error('❌ VendorService: Error checking nearby vendors:', error);
      return false;
    }
  },
};

