/**
 * Orders Store (Zustand)
 * Global state management for customer orders
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderService, Order, OrdersResponse, GetOrdersParams } from '../services/orderService';

interface OrdersState {
  // State
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };

  // Actions
  setOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<OrdersState['pagination']>) => void;
  
  // Async actions
  fetchOrders: (params?: GetOrdersParams, append?: boolean) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  loadMoreOrders: () => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  resetOrders: () => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pagination: {
    limit: 20,
    offset: 0,
    total: 0,
    hasMore: false,
  },
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setOrders: (orders) => {
        set({ orders });
      },

      setCurrentOrder: (order) => {
        set({ currentOrder: order });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setLoadingMore: (loading) => {
        set({ isLoadingMore: loading });
      },

      setError: (error) => {
        set({ error });
      },

      setPagination: (pagination) => {
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        }));
      },

      fetchOrders: async (params = {}, append = false) => {
        const { isLoading, isLoadingMore } = get();
        
        console.log('🚀 OrdersStore: fetchOrders called');
        console.log('📝 Request params:', params);
        console.log('🔄 Append mode:', append);
        console.log('⏳ Current loading states:', { isLoading, isLoadingMore });
        
        // Prevent multiple simultaneous requests
        if (isLoading || isLoadingMore) {
          console.log('⏸️ OrdersStore: Request already in progress, skipping');
          return;
        }

        try {
          if (append) {
            console.log('📄 OrdersStore: Setting isLoadingMore = true');
            set({ isLoadingMore: true });
          } else {
            console.log('🔄 OrdersStore: Setting isLoading = true');
            set({ isLoading: true, error: null });
          }

          const currentPagination = get().pagination;
          const requestParams: GetOrdersParams = {
            limit: params.limit || currentPagination.limit,
            offset: append ? currentPagination.offset : (params.offset || 0),
            ...params,
          };

          console.log('🌐 OrdersStore: Making API request with params:', requestParams);
          const response: OrdersResponse = await orderService.getOrders(requestParams);
          console.log('📦 OrdersStore: API response received:', JSON.stringify(response, null, 2));
          
          set((state) => {
            const newOrders = append ? [...state.orders, ...response.orders] : response.orders;
            const hasMore = response.pagination.offset + response.pagination.limit < response.pagination.total;
            
            console.log('📊 OrdersStore: Processing response data');
            console.log('📋 New orders count:', newOrders.length);
            console.log('📄 Pagination info:', {
              limit: response.pagination.limit,
              offset: response.pagination.offset,
              total: response.pagination.total,
              hasMore
            });
            
            return {
              orders: newOrders,
              pagination: {
                limit: response.pagination.limit,
                offset: response.pagination.offset + response.pagination.limit,
                total: response.pagination.total,
                hasMore,
              },
            };
          });
          console.log('✅ OrdersStore: Orders updated successfully');
        } catch (error: any) {
          console.error('❌ OrdersStore: Failed to fetch orders:', error);
          console.error('❌ OrdersStore: Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          });
          set({ error: error.message });
        } finally {
          console.log('🏁 OrdersStore: Setting loading states to false');
          set({ isLoading: false, isLoadingMore: false });
        }
      },

      fetchOrderById: async (orderId: string) => {
        try {
          console.log('🔄 OrdersStore: fetchOrderById called for:', orderId);
          set({ isLoading: true, error: null });
          const order = await orderService.getOrderById(orderId);
          console.log('✅ OrdersStore: fetchOrderById received order:', order);
          set({ currentOrder: order });
          console.log('✅ OrdersStore: currentOrder set successfully');
        } catch (error: any) {
          console.error('❌ OrdersStore: fetchOrderById failed:', error);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      refreshOrders: async () => {
        const { fetchOrders } = get();
        await fetchOrders({ offset: 0 }, false);
      },

      loadMoreOrders: async () => {
        const { pagination, fetchOrders } = get();
        if (pagination.hasMore && !get().isLoadingMore) {
          await fetchOrders({}, true);
        }
      },

      cancelOrder: async (orderId: string) => {
        try {
          set({ isLoading: true, error: null });
          const updatedOrder = await orderService.cancelOrder(orderId);
          
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? updatedOrder : order
            ),
            currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
          }));
        } catch (error: any) {
          set({ error: error.message });
          console.error('Failed to cancel order:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      resetOrders: () => {
        set(initialState);
      },

      updateOrderStatus: (orderId: string, status: string) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
          currentOrder: state.currentOrder?.id === orderId 
            ? { ...state.currentOrder, status } 
            : state.currentOrder,
        }));
      },
    }),
    {
      name: 'orders-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        orders: state.orders,
        pagination: state.pagination,
        currentOrder: state.currentOrder,
      }),
    }
  )
);
