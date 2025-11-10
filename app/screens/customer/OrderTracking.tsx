// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// TanStack Query Hooks
import { useOrder } from '../../hooks/useServiceQueries';
import { useOrders } from '../../hooks/useOrders';

// Components
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorView } from '../../components/ErrorView';
import { Header } from '../../components/common/Header';
import { useTheme } from '../../providers/ThemeProvider';
import { logger } from '../../utils/logger';
import { Order, OrderStatus } from '../../types/order';
import { orderService } from '../../services/orderService';
import { useOrderStore } from '../../store/orderStore';

interface TrackingStep {
  key: string;
  label: string;
  icon: string;
  completed: boolean;
  timestamp?: string;
}

export const OrderTrackingScreen = () => {
  const { orderId: urlOrderId } = useLocalSearchParams<{ orderId: string }>();
  const { colors } = useTheme();
  const { orderId: zustandOrderId } = useOrderStore();
  const [isCancelling, setIsCancelling] = useState(false);

  // Get orders to find the last placed order if no specific order ID is provided
  const { orders } = useOrders();

  // Use orderId from URL params if available, otherwise use Zustand, otherwise use last placed order
  const orderId = urlOrderId || zustandOrderId || (orders.length > 0 ? orders[0].id : null);

  // TanStack Query hooks
  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useOrder(orderId, !!orderId);

  useEffect(() => {
    console.log('🔍 OrderTracking Debug Info:', {
      urlOrderId,
      zustandOrderId,
      lastPlacedOrderId: orders.length > 0 ? orders[0].id : null,
      finalOrderId: orderId,
      hasOrderId: !!orderId,
      orderData: order ? 'Present' : 'Missing',
      orderStatus: order?.status || 'N/A',
      totalOrders: orders.length
    });
    
    if (orderId) {
      logger.info('Order tracking screen accessed', { orderId });
    } else {
      logger.warn('Order tracking screen accessed without orderId', { 
        urlOrderId, 
        zustandOrderId,
        lastPlacedOrderId: orders.length > 0 ? orders[0].id : null,
        finalOrderId: orderId 
      });
    }
  }, [orderId, urlOrderId, zustandOrderId, orders]);

  const handleRefresh = async () => {
    await refetchOrder();
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              console.log('🔄 OrderTracking: Cancelling order:', orderId);
              await orderService.cancelOrder(orderId);
              console.log('✅ OrderTracking: Order cancelled successfully');
              
              Alert.alert(
                'Order Cancelled',
                'Your order has been cancelled successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.back();
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('❌ OrderTracking: Failed to cancel order:', error);
              Alert.alert(
                'Cancellation Failed',
                error.message || 'Failed to cancel order. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleDone = () => {
    router.back();
  };

  // Get tracking steps based on order status with realistic timestamps
  const getTrackingSteps = (order: Order | null): TrackingStep[] => {
    if (!order) return [];
    
    const now = new Date();
    const orderDate = new Date(order.createdAt || order.created_at || new Date());
    const updatedDate = new Date(order.updatedAt || order.updated_at || new Date());

    // Use actual timestamps from database when available
    const scheduledTime = order.acceptedAt ? new Date(order.acceptedAt) : 
                         order.isTemporarilyAssigned ? updatedDate : 
                         new Date(orderDate.getTime() + 30 * 60 * 1000);
    
    const pickupTime = order.pickupAddress ? new Date(order.preferredPickupTimeStart) :
                      new Date(orderDate.getTime() + 2 * 60 * 60 * 1000);
    
    const cleaningTime = new Date(orderDate.getTime() + 4 * 60 * 60 * 1000);
    const readyTime = new Date(orderDate.getTime() + 6 * 60 * 60 * 1000);
    const deliveryTime = new Date(order.preferredDeliveryTimeStart || orderDate.getTime() + 8 * 60 * 60 * 1000);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    const formatDate = (date: Date) => {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      if (date.toDateString() === today.toDateString()) {
        return `Today ${formatTime(date)}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow ${formatTime(date)}`;
      } else {
        return (
          date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }) + ` ${formatTime(date)}`
        );
      }
    };

  const steps: TrackingStep[] = [
    {
      key: 'scheduled',
      label: 'Scheduled',
      icon: 'calendar',
      completed: [
        'pending',
        'accepted',
        'vendor_assigned',
        'temporary_assigned',
        'TEMPORARILY_ASSIGNED',
        'PICKUP',
        'picked_up',
        'washing',
        'washing_completed',
        'ready_for_delivery',
        'out_for_delivery',
        'delivered',
      ].includes(order.status),
      timestamp: !['pending'].includes(order.status) ? formatDate(scheduledTime) : undefined,
    },
    {
      key: 'pickup',
      label: 'Pickup',
      icon: 'bicycle',
      completed: [
        'PICKUP',
        'picked_up',
        'washing',
        'washing_completed',
        'ready_for_delivery',
        'out_for_delivery',
        'delivered',
      ].includes(order.status),
      timestamp: [
        'PICKUP',
        'picked_up',
        'washing',
        'washing_completed',
        'ready_for_delivery',
        'out_for_delivery',
        'delivered',
      ].includes(order.status)
        ? formatDate(pickupTime)
        : undefined,
    },
    {
      key: 'cleaning',
      label: 'In cleaning',
      icon: 'shirt',
      completed: [
        'washing_completed',
        'ready_for_delivery',
        'out_for_delivery',
        'delivered',
      ].includes(order.status),
      timestamp: [
        'washing_completed',
        'ready_for_delivery',
        'out_for_delivery',
        'delivered',
      ].includes(order.status)
        ? formatDate(cleaningTime)
        : undefined,
    },
    {
      key: 'ready',
      label: 'Ready for delivery',
      icon: 'cube',
      completed: ['out_for_delivery', 'delivered'].includes(order.status),
      timestamp: ['out_for_delivery', 'delivered'].includes(order.status)
        ? formatDate(readyTime)
        : undefined,
    },
    {
      key: 'delivery',
      label: 'Delivery',
      icon: 'checkmark-circle',
      completed: order.status === 'delivered',
      timestamp: order.status === 'delivered' ? formatDate(deliveryTime) : undefined,
    },
  ];

    return steps;
  };

  // Get delivery date/time based on order creation
  const getDeliveryDateTime = () => {
    const orderDate = new Date(order?.created_at || new Date());
    const deliveryDate = new Date(orderDate.getTime() + 8 * 60 * 60 * 1000); // 8 hours after order

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    let dateLabel;
    if (deliveryDate.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    } else if (deliveryDate.toDateString() === tomorrow.toDateString()) {
      dateLabel = 'Tomorrow';
    } else {
      dateLabel = deliveryDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      });
    }

    return `${dateLabel}, 8:00 - 10:00 PM`;
  };

  // Loading state
  if (orderLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Loading order tracking..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (orderError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorView
          title="Failed to load order"
          message="There was an error loading the order tracking information."
          onRetry={handleRefresh}
          retryText="Retry"
        />
      </SafeAreaView>
    );
  }

  // Order not found or invalid orderId
  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {!orderId ? 'No Order ID' : 'Order not found'}
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
            {!orderId 
              ? 'Please navigate to order tracking from a valid order.'
              : 'The order you\'re looking for doesn\'t exist or has been removed.'
            }
          </Text>
          {!orderId && (
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              Debug: URL={urlOrderId || 'none'}, Zustand={zustandOrderId || 'none'}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const trackingSteps = getTrackingSteps(order);

  // Debug the tracking steps and status
  console.log('🔍 Tracking Debug:', {
    orderObject: order,
    orderStatus: order?.status,
    orderId: order?.id,
    isTemporarilyAssigned: order?.status === 'TEMPORARILY_ASSIGNED',
    stepsCount: trackingSteps.length,
    scheduledStep: trackingSteps.find(s => s.key === 'scheduled'),
    allSteps: trackingSteps.map(s => ({ key: s.key, completed: s.completed }))
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Header title="Order tracking" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Tracking Card */}
        <View style={[styles.trackingCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.orderId, { color: colors.text }]}>
            Order #{order?.id?.slice(-4) || 'N/A'}
          </Text>
          <Text style={[styles.trackingSubtitle, { color: colors.textSecondary }]}>
            Track the progress of your laundry
          </Text>

          {order.status === 'TEMPORARILY_ASSIGNED' && (
            <View style={styles.progressIndicator}>
              <View style={[styles.progressBar, { backgroundColor: '#9333ea' }]} />
              <Text style={[styles.progressText, { color: '#9333ea' }]}>
                Order scheduled for pickup
              </Text>
            </View>
          )}

          {/* Timeline */}
          <View style={styles.timeline}>
            {trackingSteps.map((step, index) => (
              <View key={step.key} style={styles.timelineStep}>
                {/* Step Icon */}
                <View style={styles.stepIconContainer}>
                  {(() => {
                    const isPurple = order.status === 'TEMPORARILY_ASSIGNED' && step.key === 'scheduled';
                    console.log(`🎨 Step ${step.key} color debug:`, {
                      orderStatus: order.status,
                      stepKey: step.key,
                      stepCompleted: step.completed,
                      isPurple,
                      backgroundColor: step.completed ? (isPurple ? '#9333ea' : colors.primary) : '#F3F4F6'
                    });
                    return null;
                  })()}
                  <View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor: step.completed 
                          ? (order.status === 'TEMPORARILY_ASSIGNED' && step.key === 'scheduled' 
                              ? '#9333ea' // Purple for TEMPORARILY_ASSIGNED
                              : colors.primary)
                          : '#F3F4F6',
                        borderColor: step.completed 
                          ? (order.status === 'TEMPORARILY_ASSIGNED' && step.key === 'scheduled' 
                              ? '#9333ea' // Purple for TEMPORARILY_ASSIGNED
                              : colors.primary)
                          : '#E5E7EB',
                      },
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={20}
                      color={step.completed ? 'white' : '#9CA3AF'}
                    />
                  </View>

                  {/* Connecting Line */}
                  {index < trackingSteps.length - 1 && (
                    <View
                      style={[
                        styles.connectingLine,
                        { backgroundColor: step.completed ? colors.primary : '#E5E7EB' },
                      ]}
                    />
                  )}
                </View>

                {/* Step Content */}
                <View style={styles.stepContent}>
                  <Text
                    style={[
                      styles.stepLabel,
                      { color: step.completed ? colors.text : colors.textSecondary },
                    ]}
                  >
                    {step.label}
                  </Text>
                  {step.timestamp && (
                    <Text style={[styles.stepTimestamp, { color: colors.textSecondary }]}>
                      {step.timestamp}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Card */}
        <View style={[styles.deliveryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.deliveryTitle, { color: colors.text }]}>Delivery</Text>
          <Text style={[styles.deliveryDateTime, { color: colors.text }]}>
            {getDeliveryDateTime()}
          </Text>
        </View>

        {/* Cancel Order Button - Only show if order can be cancelled */}
        {order && ['CREATED', 'PENDING', 'ACCEPTED', 'temporary_assigned', 'TEMPORARILY_ASSIGNED'].includes(order.status) && (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: '#e74c3c' }]}
            onPress={handleCancelOrder}
            disabled={isCancelling}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle" size={20} color="white" />
            <Text style={styles.cancelButtonText}>
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Done Button */}
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: colors.primary }]}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  debugText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
    opacity: 0.7,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  trackingCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackingSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  progressIndicator: {
    marginTop: -16,
    marginBottom: 16,
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  timeline: {
    gap: 24,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  connectingLine: {
    width: 2,
    height: 32,
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
    paddingTop: 8,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepTimestamp: {
    fontSize: 14,
    fontWeight: '400',
  },
  deliveryCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  deliveryDateTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    margin: 16,
    marginBottom: 8,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
