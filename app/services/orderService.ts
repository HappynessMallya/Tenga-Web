/**
 * Order Service
 * Handles all order-related API calls
 */

import API from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';

// Types for the API response
export interface OrderItem {
  id: string;
  serviceType: string;
  description: string;
  quantity: number;
  weightLbs: number;
  price: number;
  externalTagId: string | null;
}

export interface Address {
  latitude: string;
  longitude: string;
  description: string;
  city: string;
  country: string;
  houseNumber: string | null;
  streetName: string | null;
  postCode: string | null;
  landMark: string | null;
  type: string;
  geoHash: string | null;
  cityGeoHash: string | null;
  locationGeoHash: string | null;
  regionGeoHash: string | null;
  slotId: string | null;
  images: any[];
  customerCare: any[];
  storageSpace: any;
  openingHours: any;
  locationTypeUuid: string | null;
  street: string | null;
  state: string | null;
  zipCode: string | null;
  geo: any;
  unit: string | null;
  formatted: string | null;
}

export interface AddressWithId {
  id: string;
  address: Address;
}

export interface Trip {
  id: string;
  status: string;
  driver: any;
}

export interface Order {
  id: string;
  uuid: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  pickupAddress: AddressWithId;
  deliveryAddress: AddressWithId;
  trips: Trip[];
  cleaner: any;
  payment: any;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface GetOrdersParams {
  limit?: number;
  offset?: number;
  status?: string;
}

// Order service functions
export const orderService = {
  /**
   * Get orders for the authenticated customer
   */
  getOrders: async (params: GetOrdersParams = {}): Promise<OrdersResponse> => {
    try {
      console.log('🌐 OrderService: getOrders called with params:', params);
      
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.status) queryParams.append('status', params.status);

      const queryString = queryParams.toString();
      const url = queryString ? `${API_ENDPOINTS.ORDERS.LIST}?${queryString}` : API_ENDPOINTS.ORDERS.LIST;
      
      console.log('🔗 OrderService: Making request to URL:', url);
      console.log('📝 OrderService: Query string:', queryString);
      
      const response = await API.get(url);
      
      console.log('📦 OrderService: Raw response received:');
      console.log('📊 Status:', response.status);
      console.log('📋 Headers:', response.headers);
      console.log('📄 Data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ OrderService: Failed to fetch orders:', error);
      console.error('❌ OrderService: Error details:', {
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
        console.log('🔐 OrderService: 401 Unauthorized - Authentication required');
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        console.log('🚫 OrderService: 403 Forbidden - Access denied');
        throw new Error('Access denied. You do not have permission to view orders.');
      } else if (error.response?.status === 404) {
        console.log('🔍 OrderService: 404 Not Found - Orders not found');
        throw new Error('Orders not found.');
      } else if (error.response?.status === 500) {
        console.log('💥 OrderService: 500 Server Error');
        throw new Error('Server error while fetching orders.');
      } else {
        console.log('❓ OrderService: Unknown error occurred');
        throw new Error('Failed to fetch orders. Please try again.');
      }
    }
  },

  /**
   * Get a specific order by ID
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    try {
      const response = await API.get(API_ENDPOINTS.ORDERS.DETAILS.replace(':id', orderId));
      console.log('🔍 OrderService: getOrderById response:', response.data);
      
      // Extract order from response (API returns { order: {...} })
      const orderData = response.data.order || response.data;
      console.log('🔍 OrderService: Extracted order data:', orderData);
      
      return orderData;
    } catch (error: any) {
      console.error('Failed to fetch order:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to view this order.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error while fetching order.');
      } else {
        throw new Error('Failed to fetch order. Please try again.');
      }
    }
  },

  /**
   * Create a new order
   */
  createOrder: async (orderData: any): Promise<Order> => {
    try {
      const response = await API.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create order:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid order data');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error while creating order.');
      } else {
        throw new Error('Failed to create order. Please try again.');
      }
    }
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    try {
      console.log('🔄 OrderService: Updating order status');
      console.log('📦 Order ID:', orderId);
      console.log('📊 New status:', status);
      
      const response = await API.patch(API_ENDPOINTS.ORDERS.UPDATE_STATUS.replace(':id', orderId), { status });
      
      console.log('✅ OrderService: Status updated successfully');
      console.log('📄 Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ OrderService: Failed to update order status:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid status update');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to update this order.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error while updating order status.');
      } else {
        throw new Error('Failed to update order status. Please try again.');
      }
    }
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string): Promise<Order> => {
    try {
      console.log('🔄 OrderService: Cancelling order');
      console.log('📦 Order ID:', orderId);
      
      const response = await API.patch(API_ENDPOINTS.ORDERS.CANCEL.replace(':id', orderId));
      
      console.log('✅ OrderService: Order cancelled successfully');
      console.log('📄 Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ OrderService: Failed to cancel order:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Cannot cancel this order');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to cancel this order.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error while canceling order.');
      } else {
        throw new Error('Failed to cancel order. Please try again.');
      }
    }
  },

  /**
   * Track an order
   */
  trackOrder: async (orderId: string): Promise<any> => {
    try {
      const response = await API.get(API_ENDPOINTS.ORDERS.TRACK.replace(':id', orderId));
      return response.data;
    } catch (error: any) {
      console.error('Failed to track order:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to track this order.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error while tracking order.');
      } else {
        throw new Error('Failed to track order. Please try again.');
      }
    }
  },
};
