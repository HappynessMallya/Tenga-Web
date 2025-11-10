// @ts-nocheck
// UI-only stubs: remove TanStack Query dependency during prototype phase
import { useMemo, useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';

export const queryKeys = {
  user: { all: ['users'], current: () => ['users', 'current'] },
  order: { all: ['orders'], byId: (id: string) => ['orders', 'byId', id] },
  vendor: { all: ['vendors'] },
  garment: { all: ['garments'], categories: () => ['garments', 'categories'] },
  photo: { all: ['photos'] },
} as const;

export function useCurrentUser() {
  // Return a mocked user for UI flows
  const data = useMemo(() => ({ id: 'user_mock', full_name: 'Demo Customer' }), []);
  return { data, isLoading: false, error: null };
}

export function useUser(userId: string, enabled = true) {
  return { data: userId ? { id: userId } : null, isLoading: false, error: null };
}

export function useUserProfile(userId: string, enabled = true) {
  return { data: null, isLoading: false, error: null };
}

export function useUpdateUser() {
  return { mutateAsync: async () => null };
}

export function useUpdateUserProfile() { return { mutateAsync: async () => null }; }

export function useDeactivateUser() { return { mutateAsync: async () => null }; }

export function useUserOrders(userId?: string, status?: string, limit = 20) {
  const data = useMemo(() => [], []);
  return { data, isLoading: false, error: null, refetch: async () => {} };
}

export function useOrder(orderId: string, enabled = true) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate MongoDB ObjectID format (24 hex characters)
  const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const fetchOrder = useCallback(async () => {
    if (!orderId || !enabled) return;
    
    // Validate orderId format
    if (!isValidObjectId(orderId)) {
      console.error('❌ useOrder: Invalid order ID format:', orderId);
      setError(new Error(`Invalid order ID format. Expected 24-character hex string, got: "${orderId}"`));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 useOrder: Fetching order details for ID:', orderId);
      const response = await orderService.getOrderById(orderId);
      console.log('✅ useOrder: API response received:', response);
      
      // Extract order from response (API returns { order: {...} })
      const orderData = response.order || response;
      console.log('✅ useOrder: Extracted order data:', orderData);
      setData(orderData);
    } catch (err: any) {
      console.error('❌ useOrder: Failed to fetch order:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, enabled]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const refetch = useCallback(async () => {
    await fetchOrder();
  }, [fetchOrder]);

  return { data, isLoading, error, refetch };
}

export function useOrdersByStatus(status: string, limit = 50, enabled = true) { return { data: [], isLoading: false, error: null }; }

export function useAvailableOrdersByStatus(status: string, limit = 50, enabled = true) { return { data: [], isLoading: false, error: null }; }

export function usePendingOrdersForVendors(enabled = true) { return { data: [], isLoading: false, error: null }; }

export function useVendorOrders(vendorId: string, status?: string, limit = 50) { return { data: [], isLoading: false, error: null }; }

export function useDeliveryOrders(agentId: string, status?: string, limit = 50) { return { data: [], isLoading: false, error: null }; }

export function useOrderTracking(orderId: string, enabled = true) { return { data: null, isLoading: false, error: null }; }

export function useCreateOrder() { return { mutateAsync: async (_orderData: any) => ({ id: 'ORDER_PLACEHOLDER' }) }; }

export function useAcceptOrder() { return { mutateAsync: async (vars: any) => ({ ...vars }) }; }

export function useUpdateOrderStatus() { return { mutateAsync: async (p: any) => p }; }

export function useVendorStats(vendorId: string, enabled = true) { return { data: null, isLoading: false, error: null }; }

export function useVendorEarnings(vendorId: string, period = '30d', enabled = true) { return { data: [], isLoading: false, error: null }; }

export function useVendorsByLocation(area: string, enabled = true) { return { data: [], isLoading: false, error: null }; }

export function useGarmentCategories() { return { data: [], isLoading: false, error: null }; }

export function useGarmentsByCategory(categoryId: string, enabled = true) { return { data: [], isLoading: false, error: null }; }

export function useAllGarments() { return { data: [], isLoading: false, error: null }; }

export function useVendorPricing(vendorId: string, enabled = true) { return { data: [], isLoading: false, error: null }; }

export function useOrderPhotos(orderId: string, photoType?: string, enabled = true) { return { data: [], isLoading: false, error: null }; }

export function useUploadPhoto() { return { mutateAsync: async (_options: any) => ({ id: 'PHOTO_PLACEHOLDER' }) }; }

export function useReviewByOrderId(orderId: string, enabled = true) { return { data: null, isLoading: false, error: null }; }

export function useVendorReviews(vendorId: string, limit = 20, enabled = true) { return { data: [], isLoading: false, error: null }; }

export function useSubmitReview() { return { mutateAsync: async (_reviewData: any) => ({ id: 'REVIEW_PLACEHOLDER' }) }; }

export function useUpdateReview() { return { mutateAsync: async ({ reviewId, data }: any) => ({ id: reviewId, ...data }) }; }
