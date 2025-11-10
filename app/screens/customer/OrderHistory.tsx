import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { OrderCard } from '../../components/OrderCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorView } from '../../components/ErrorView';
import { Header } from '../../components/common/Header';
import { useTheme } from '../../providers/ThemeProvider';
import { Order as NewOrder } from '../../types/order';
// @ts-ignore
import { router } from 'expo-router';




export const OrderHistoryScreen = () => {
  const { colors } = useTheme();
  
  console.log('🏠 OrderHistoryScreen: Component rendered');

  // Use real auth system instead of mock
  const { user, isLoading: userLoading, error: userError } = useAuth();
  
  console.log('👤 OrderHistoryScreen: User data:', {
    user: user ? { id: user.id, name: user.fullName } : null,
    isLoading: userLoading,
    error: userError
  });

  // Use our new orders API
  const {
    orders: apiOrders,
    isLoading: ordersLoading,
    isLoadingMore,
    error: ordersError,
    fetchOrders,
    refreshOrders,
    loadMoreOrders,
    hasOrders,
  } = useOrders();
  
  console.log('📊 OrderHistoryScreen: Orders state:', {
    ordersCount: apiOrders.length,
    isLoading: ordersLoading,
    isLoadingMore,
    error: ordersError,
    hasOrders
  });

  // Fetch orders on component mount
  useEffect(() => {
    console.log('🔄 OrderHistoryScreen: useEffect triggered');
    console.log('👤 User ID:', user?.id);
    
    if (user?.id) {
      console.log('✅ OrderHistoryScreen: User authenticated, fetching orders...');
      fetchOrders();
    } else {
      console.log('⏸️ OrderHistoryScreen: No user ID, skipping order fetch');
    }
  }, [user?.id, fetchOrders]);

  // Use only real API orders - no mock data
  const allOrders = useMemo(() => {
    console.log('🔄 OrderHistory: Processing orders...');
    console.log('📊 API Orders received:', apiOrders.length);
    console.log('📋 API Orders data:', JSON.stringify(apiOrders, null, 2));
    
    if (apiOrders.length > 0) {
      console.log('✅ Using real API orders:', apiOrders.length);
      return apiOrders;
    }
    
    console.log('📭 No API orders found, returning empty array');
    return [];
  }, [apiOrders]);

  const handleRefresh = async () => {
    console.log('🔄 OrderHistoryScreen: handleRefresh called');
    await refreshOrders();
  };

  const handleLoadMore = async () => {
    console.log('📄 OrderHistoryScreen: handleLoadMore called');
    await loadMoreOrders();
  };

  const handleOrderPress = (order: NewOrder) => {
    console.log('Order pressed:', order.id);
    // Navigate to order details
    router.push(`/(customer)/order/${order.id}/details`);
  };

  const handleReOrder = (order: NewOrder) => {
    console.log('Re-order pressed:', order.id);
    // Navigate to schedule pickup with pre-filled data from this order
    router.push('/(customer)/schedule-pickup');
  };

  const renderEmptyState = () => {
    // If no user ID, show authentication error
    if (!user) {
      return (
        <EmptyState title="Authentication Required" message="Please sign in to view your orders" />
      );
    }

    return (
      <EmptyState
        title="No Orders Yet"
        message="Start by placing your first order from the Home tab"
      />
    );
  };

  // Error state
  if (userError || ordersError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Orders" showBackButton={true} />
        <ErrorView
          message="There was an error loading your orders. Please try again."
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  // Loading state
  if (userLoading || ordersLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Orders" showBackButton={true} />
        <LoadingSpinner message="Loading your orders..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Orders" showBackButton={true} />
      <FlatList
        data={allOrders}
        renderItem={({ item }: { item: NewOrder }) => (
          <OrderCard
            order={item}
            onPress={() => handleOrderPress(item)}
            onReOrder={() => handleReOrder(item)}
          />
        )}
        keyExtractor={(item: NewOrder) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={ordersLoading && !hasOrders}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={() => {
          if (isLoadingMore) {
            return (
              <View style={styles.footer}>
                <LoadingSpinner message="Loading more orders..." />
              </View>
            );
          }
          return null;
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
});
