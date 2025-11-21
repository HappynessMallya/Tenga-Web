// @ts-ignore
import { router } from 'expo-router';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';

// Components
import { NetworkBanner } from '../../components/NetworkBanner';
import { NotificationBadge } from '../../components/notification/NotificationBadge';
import { DevTools } from '../../components/DevTools';

// Check if we're in development mode
const __DEV__ = process.env.NODE_ENV === 'development';

export default function CustomerHomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isFetchingCompleteOrder, setIsFetchingCompleteOrder] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  
  // Use real orders data
  const { 
    orders, 
    currentOrder,
    isLoading: ordersLoading, 
    error: ordersError, 
    fetchOrders, 
    fetchOrderById,
    refreshOrders 
  } = useOrders();

  // Fetch orders on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('🏠 HomeScreen: Fetching orders for user:', user.id);
      console.log('🏠 HomeScreen: User details:', {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      });
      fetchOrders({ limit: 10 }); // Fetch recent orders
    } else {
      console.log('🏠 HomeScreen: No user ID available, skipping orders fetch');
    }
  }, [user?.id, fetchOrders]);

  // Debug logging for orders and fetch complete order details
  useEffect(() => {
    console.log('🏠 HomeScreen: Orders state changed:', {
      ordersCount: orders?.length || 0,
      isLoading: ordersLoading,
      error: ordersError,
      hasUser: !!user?.id,
      hasCurrentOrder: !!currentOrder?.id
    });
    
    if (orders && orders.length > 0) {
      console.log('🏠 HomeScreen: Orders loaded:', {
        totalOrders: orders.length,
        lastOrder: {
          id: orders[0]?.id,
          status: orders[0]?.status,
          createdAt: orders[0]?.createdAt
        },
        allOrders: orders.map(order => ({
          id: order.id,
          status: order.status,
          createdAt: order.createdAt
        }))
      });
      
      // Fetch complete order details for the last placed order
      const lastOrderId = orders[0]?.id;
      if (lastOrderId && (!currentOrder || currentOrder.id !== lastOrderId) && !ordersLoading && !isFetchingCompleteOrder) {
        console.log('🏠 HomeScreen: Fetching complete order details for:', lastOrderId);
        setIsFetchingCompleteOrder(true);
        fetchOrderById(lastOrderId).then(() => {
          setIsFetchingCompleteOrder(false);
        }).catch((error) => {
          console.error('🏠 HomeScreen: Failed to fetch complete order details:', error);
          setIsFetchingCompleteOrder(false);
        });
      }
    } else if (!ordersLoading && !ordersError) {
      console.log('🏠 HomeScreen: No orders found for user');
    }
    
    if (ordersError) {
      console.error('🏠 HomeScreen: Orders error:', ordersError);
    }
  }, [orders, ordersLoading, ordersError, user?.id, currentOrder, fetchOrderById, isFetchingCompleteOrder]);

  // Mock network check
  useEffect(() => {
    const checkNetworkStatus = () => {
      setIsOnline(true); // Always online for now
    };

    checkNetworkStatus();
    const interval = setInterval(checkNetworkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get the last placed order (most recent by creation date) - use complete order data
  const lastPlacedOrder = useMemo(() => {
    // Use currentOrder if available (complete order data with delivery times)
    if (currentOrder) {
      console.log('🏠 HomeScreen: Using complete order data:', currentOrder.id, 'Status:', currentOrder.status);
      return currentOrder;
    }
    
    // Fallback to orders list if no complete order data yet
    if (!orders || orders.length === 0) return null;
    
    // Sort orders by creation date (most recent first) and get the first one
    const sortedOrders = [...orders].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.created_at);
      const dateB = new Date(b.createdAt || b.created_at);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
    
    console.log('🏠 HomeScreen: Using basic order data:', sortedOrders[0]?.id, 'Status:', sortedOrders[0]?.status);
    return sortedOrders[0];
  }, [currentOrder, orders]);

  // Check if the last placed order is active (for UI purposes)
  const isLastOrderActive = useMemo(() => {
    if (!lastPlacedOrder) return false;
    
    return [
      'pending',
      'accepted',
      'vendor_assigned',
      'temporary_assigned',
      'TEMPORARILY_ASSIGNED',
      'PICKUP',
      'washing',
      'washing_completed',
      'ready_for_delivery',
      'out_for_delivery',
    ].includes(lastPlacedOrder.status);
  }, [lastPlacedOrder]);

  const handleRefresh = useCallback(async () => {
    if (!isOnline) {
      Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
      return;
    }
    
    console.log('🔄 HomeScreen: Refreshing orders...');
    await refreshOrders();
  }, [isOnline, refreshOrders]);

  const handleSchedulePickup = useCallback(() => {
    router.push('/(customer)/schedule-pickup');
  }, []);

  const handleOrderPress = useCallback(() => {
    if (lastPlacedOrder?.id) {
      router.push(`/(customer)/order/${lastPlacedOrder.id}/details`);
    }
  }, [lastPlacedOrder?.id]);

  const handleTrackOrder = useCallback(() => {
    if (lastPlacedOrder?.id) {
      router.push(`/(customer)/order-tracking?orderId=${lastPlacedOrder.id}`);
    }
  }, [lastPlacedOrder?.id]);

  const capitalizeFirstLetter = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Order received',
      accepted: 'Order confirmed',
      vendor_assigned: 'Vendor assigned',
      temporary_assigned: 'Scheduled',
      TEMPORARILY_ASSIGNED: 'Scheduled',
      PICKUP: 'Pickup in progress',
      washing: 'In progress',
      washing_completed: 'Washing complete',
      ready_for_delivery: 'Ready for delivery',
      out_for_delivery: 'Out for delivery',
      completed: 'Order completed',
      cancelled: 'Order cancelled',
      CANCELED: 'Order cancelled', // Add uppercase version
      delivered: 'Order delivered',
    };
    return statusMap[status] || 'Order status';
  };

  const getOrderMessage = (status: string) => {
    const statusMessages: Record<string, string> = {
      pending: 'Order placed successfully',
      accepted: 'Order confirmed by vendor',
      vendor_assigned: 'Vendor assigned to your order',
      temporary_assigned: 'Order scheduled for pickup',
      TEMPORARILY_ASSIGNED: 'Order scheduled for pickup',
      PICKUP: 'Your order is being picked up',
      washing: 'Your laundry is being washed',
      washing_completed: 'Washing completed',
      ready_for_delivery: 'Ready for pickup/delivery',
      out_for_delivery: 'Out for delivery',
      completed: 'Your order has been completed',
      cancelled: 'This order was cancelled',
      CANCELED: 'This order was cancelled', // Add uppercase version
      delivered: 'Your order has been delivered',
    };
    return statusMessages[status] || 'Processing your order';
  };

  const getDeliveryTime = (order: any) => {
    if (!order) return 'Delivery time not available';
    
    // Debug: Log the order data to see what delivery time fields are available
    console.log('🕒 HomeScreen: Order delivery time data:', {
      orderId: order.id,
      status: order.status,
      preferredDeliveryTimeStart: order.preferredDeliveryTimeStart,
      preferredDeliveryTimeEnd: order.preferredDeliveryTimeEnd,
      preferredPickupTimeStart: order.preferredPickupTimeStart,
      preferredPickupTimeEnd: order.preferredPickupTimeEnd,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      hasCompleteData: !!(order.preferredDeliveryTimeStart && order.preferredPickupTimeStart)
    });
    
    // Helper function to safely parse dates
    const safeParseDate = (dateString: string | undefined | null) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };
    
    // ALWAYS use preferredDeliveryTimeStart if available (all orders should have this)
    if (order.preferredDeliveryTimeStart) {
      const deliveryDate = safeParseDate(order.preferredDeliveryTimeStart);
      if (deliveryDate) {
        const now = new Date();
        
        // Format delivery time using EXACT order data
        const isToday = deliveryDate.toDateString() === now.toDateString();
        const isTomorrow = deliveryDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
        
        if (isToday) {
          return `Delivery today ${deliveryDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}`;
        } else if (isTomorrow) {
          return `Delivery tomorrow ${deliveryDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}`;
        } else {
          return `Delivery ${deliveryDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true
          })}`;
        }
      }
    }
    
    // Only fall back to creation/update date for cancelled/completed orders if no delivery time
    if (order.status === 'completed' || order.status === 'delivered') {
      const completionDate = safeParseDate(order.updatedAt || order.updated_at || order.createdAt || order.created_at);
      if (completionDate) {
        return `Completed on ${completionDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        })}`;
      }
    }
    
    if (order.status === 'cancelled' || order.status === 'CANCELED') {
      const cancellationDate = safeParseDate(order.updatedAt || order.updated_at || order.createdAt || order.created_at);
      if (cancellationDate) {
        return `Cancelled on ${cancellationDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        })}`;
      }
    }
    
    // Last resort: show order creation date (should rarely happen)
    const orderDate = safeParseDate(order.createdAt || order.created_at);
    if (orderDate) {
      return `Order placed on ${orderDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      })}`;
    }
    
    // If all date parsing fails
    return 'Delivery time not available';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={ordersLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Bell */}
        <View style={styles.notificationContainer}>
          <NotificationBadge
            size="medium"
            onPress={() => router.push('/(customer)/notifications')}
          />
        </View>

        {/* Header with greeting */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hi, {capitalizeFirstLetter(user?.fullName?.split(' ')[0] || 'Customer')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Ready for your next laundry day
            </Text>
          </View>
        </View>

        {/* Schedule Pickup Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.scheduleButton, { backgroundColor: colors.primary }]}
            onPress={handleSchedulePickup}
            activeOpacity={0.8}
          >
            <Text style={styles.scheduleButtonText}>Schedule a pickup</Text>
          </TouchableOpacity>
          
        </View>

        {/* Order Card - ALWAYS SHOW (either with last order or empty state) */}
        <View style={styles.orderContainer}>
          {lastPlacedOrder ? (
            // Show last placed order
            <TouchableOpacity
              style={[styles.orderCard, { backgroundColor: colors.card }]}
              onPress={handleOrderPress}
              activeOpacity={0.8}
            >
              {/* Order Image with Background */}
              <View style={styles.orderImageContainer}>
                <Image
                  source={require('../../../assets/Washing-Machine.png')}
                  style={styles.orderBackgroundImage}
                  resizeMode="cover"
                />

                {/* Overlay */}
                <View style={styles.orderImageOverlay}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {getStatusText(lastPlacedOrder.status)}
                    </Text>
                  </View>
                  <Text style={styles.orderOverlayTitle}>
                    {getOrderMessage(lastPlacedOrder.status)}
                  </Text>
                  <Text style={styles.orderOverlaySubtitle}>
                    {getDeliveryTime(lastPlacedOrder)}
                  </Text>
                </View>
              </View>

              {/* Track Order Footer */}
              <TouchableOpacity
                style={styles.orderFooter}
                onPress={handleTrackOrder}
                activeOpacity={0.7}
              >
                <Text style={[styles.trackText, { color: colors.primary }]}>
                  {isLastOrderActive ? 'Track order details' : 'View order details'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            // Show empty state card
            <View style={[styles.orderCard, { backgroundColor: colors.card }]}>
              {/* Order Image with Background */}
              <View style={styles.orderImageContainer}>
                <Image
                  source={require('../../../assets/Washing-Machine.png')}
                  style={styles.orderBackgroundImage}
                  resizeMode="cover"
                />

                {/* Overlay */}
                <View style={styles.orderImageOverlay}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      Ready to start
                    </Text>
                  </View>
                  <Text style={styles.orderOverlayTitle}>
                    No orders yet
                  </Text>
                  <Text style={styles.orderOverlaySubtitle}>
                    Schedule your first pickup to get started
                  </Text>
                </View>
              </View>

              {/* Schedule Pickup Footer */}
              <TouchableOpacity
                style={styles.orderFooter}
                onPress={handleSchedulePickup}
                activeOpacity={0.7}
              >
                <Text style={[styles.trackText, { color: colors.primary }]}>
                  Schedule your first order
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Error state - Show below the card */}
        {ordersError && !ordersLoading && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              Failed to load orders
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading state */}
        {ordersLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {currentOrder ? 'Loading order details...' : 'Loading orders...'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Network Status Banner */}
      <NetworkBanner isVisible={!isOnline} />

      {/* Dev Tools Floating Button - Only in Development */}
      {__DEV__ && (
        <TouchableOpacity
          style={[styles.devToolsButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowDevTools(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="bug" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Dev Tools Modal */}
      <DevTools visible={showDevTools} onClose={() => setShowDevTools(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  notificationContainer: { paddingHorizontal: 24, paddingTop: 40, alignItems: 'flex-end' },
  header: { paddingHorizontal: 24, paddingTop: 90, paddingBottom: 32 },
  greeting: { fontSize: 28, fontWeight: '700', fontFamily: 'Roboto-Bold', marginBottom: 4 },
  subtitle: { fontSize: 16, fontFamily: 'Roboto-Regular' },
  buttonContainer: { paddingHorizontal: 24, marginBottom: 32 },
  scheduleButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: { color: 'white', fontSize: 16, fontWeight: '600', fontFamily: 'Roboto-Medium' },
  orderContainer: { paddingHorizontal: 24, marginBottom: 24 },
  orderCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderImageContainer: { position: 'relative', height: 200 },
  orderBackgroundImage: { width: '100%', height: '100%' },
  orderImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  orderOverlayTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
    marginBottom: 4,
    marginTop: 90,
  },
  orderOverlaySubtitle: { color: 'white', fontSize: 14, fontFamily: 'Roboto-Regular', opacity: 0.9 },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: '#DEEDFE',
  },
  statusBadgeText: { color: '#007AFF', fontSize: 12, fontWeight: '600', fontFamily: 'Roboto-Medium' },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  trackText: { fontSize: 14, fontWeight: '600', fontFamily: 'Roboto-Medium', flex: 1 },
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 60 },
  emptyStateText: { fontSize: 18, fontWeight: '600', fontFamily: 'Roboto-Medium', marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, fontFamily: 'Roboto-Regular', textAlign: 'center' },
  errorContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  errorText: { fontSize: 16, fontWeight: '500', fontFamily: 'Roboto-Medium', marginBottom: 16, textAlign: 'center' },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: 'white', fontSize: 14, fontWeight: '600', fontFamily: 'Roboto-Medium' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 8, fontSize: 14, fontFamily: 'Roboto-Regular' },
  devToolsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
