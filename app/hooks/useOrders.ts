/**
 * Custom hook for orders management
 * Provides convenient access to orders store with additional utilities
 */

import { useCallback } from 'react';
import { useOrdersStore } from '../store/ordersStore';
import { GetOrdersParams } from '../services/orderService';

export const useOrders = () => {
  const {
    orders,
    currentOrder,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    fetchOrders,
    fetchOrderById,
    refreshOrders,
    loadMoreOrders,
    cancelOrder,
    clearError,
    resetOrders,
    updateOrderStatus,
  } = useOrdersStore();

  // Convenience methods
  const getOrdersByStatus = useCallback((status: string) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getOrderById = useCallback((orderId: string) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const hasOrders = orders.length > 0;
  const canLoadMore = pagination.hasMore && !isLoadingMore;

  // Enhanced fetch with automatic error handling
  const fetchOrdersWithErrorHandling = useCallback(async (params?: GetOrdersParams, append?: boolean) => {
    try {
      await fetchOrders(params, append);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Error is already set in the store
    }
  }, [fetchOrders]);

  // Enhanced refresh with error handling
  const refreshOrdersWithErrorHandling = useCallback(async () => {
    try {
      await refreshOrders();
    } catch (error) {
      console.error('Error refreshing orders:', error);
    }
  }, [refreshOrders]);

  // Enhanced load more with error handling
  const loadMoreOrdersWithErrorHandling = useCallback(async () => {
    try {
      await loadMoreOrders();
    } catch (error) {
      console.error('Error loading more orders:', error);
    }
  }, [loadMoreOrders]);

  // Enhanced cancel order with error handling
  const cancelOrderWithErrorHandling = useCallback(async (orderId: string) => {
    try {
      await cancelOrder(orderId);
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  }, [cancelOrder]);

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    hasOrders,
    canLoadMore,

    // Actions
    fetchOrders: fetchOrdersWithErrorHandling,
    fetchOrderById,
    refreshOrders: refreshOrdersWithErrorHandling,
    loadMoreOrders: loadMoreOrdersWithErrorHandling,
    cancelOrder: cancelOrderWithErrorHandling,
    clearError,
    resetOrders,
    updateOrderStatus,

    // Utility methods
    getOrdersByStatus,
    getOrderById,
  };
};