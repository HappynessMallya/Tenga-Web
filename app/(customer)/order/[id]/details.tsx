import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
// @ts-ignore
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../providers/ThemeProvider';
import { useOrders } from '../../../hooks/useOrders';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { ErrorView } from '../../../components/ErrorView';
import { Header } from '../../../components/common/Header';
import { formatCurrency } from '../../../utils/format';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const orderId = id as string;
  
  const { 
    currentOrder, 
    isLoading, 
    error, 
    fetchOrderById 
  } = useOrders();

  // Fetch order details if not already loaded
  useEffect(() => {
    if (orderId && (!currentOrder || currentOrder.id !== orderId)) {
      console.log('📋 OrderDetailsScreen: Fetching order details for:', orderId);
      fetchOrderById(orderId);
    }
  }, [orderId, currentOrder, fetchOrderById]);

  const handleTrackOrder = () => {
    router.push(`/(customer)/order-tracking?orderId=${orderId}`);
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': colors.warning,
      'accepted': colors.info,
      'TEMPORARILY_ASSIGNED': colors.info,
      'PICKUP': colors.primary,
      'washing': colors.primary,
      'washing_completed': colors.success,
      'ready_for_delivery': colors.success,
      'out_for_delivery': colors.success,
      'delivered': colors.success,
      'completed': colors.success,
      'cancelled': colors.error,
      'CANCELED': colors.error,
    };
    return statusColors[status] || colors.textSecondary;
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'TEMPORARILY_ASSIGNED': 'Temporarily Assigned',
      'PICKUP': 'Pickup Scheduled',
      'washing': 'Washing',
      'washing_completed': 'Washing Completed',
      'ready_for_delivery': 'Ready for Delivery',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'CANCELED': 'Cancelled',
    };
    return statusMap[status] || status.replace('_', ' ').toUpperCase();
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Order Details" showBackButton={true} onBackPress={handleBack} />
        <View style={styles.centered}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !currentOrder) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Order Details" showBackButton={true} onBackPress={handleBack} />
        <ErrorView
          error={error || new Error('Order not found')}
          onRetry={() => fetchOrderById(orderId)}
          title="Order Error"
          message="Unable to load order details"
        />
      </SafeAreaView>
    );
  }

  const order = currentOrder as any;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Order Details" showBackButton={true} onBackPress={handleBack} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <View style={styles.statusCardHeader}>
            <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons name="receipt" size={24} color="white" />
            </View>
            <View style={styles.statusCardInfo}>
              <Text style={[styles.statusCardTitle, { color: colors.text }]}>
                Order Details
              </Text>
              <Text style={[styles.statusCardSubtitle, { color: colors.textSecondary }]}>
                Order #{order.id.slice(-8).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusBadgeText}>
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusDetails}>
            <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
              Placed on {formatDate(order.createdAt)}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.itemsCard, { backgroundColor: colors.card }]}>
          <View style={styles.itemsCardHeader}>
            <View style={styles.itemsIconContainer}>
              <Ionicons name="list" size={24} color="white" />
            </View>
            <View style={styles.itemsCardInfo}>
              <Text style={[styles.itemsCardTitle, { color: colors.text }]}>
                Order Items
              </Text>
              <Text style={[styles.itemsCardSubtitle, { color: colors.textSecondary }]}>
                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} selected
              </Text>
            </View>
          </View>
          
          <View style={styles.itemsList}>
            {order.items?.map((item: any, index: number) => {
              console.log('📦 OrderDetailsScreen: Item data:', {
                id: item.id,
                description: item.description,
                price: item.price,
                quantity: item.quantity,
                weightLbs: item.weightLbs,
                garmentTypeId: item.garmentTypeId,
                serviceType: item.serviceType
              });
              
              return (
                <View key={item.id || index} style={[styles.itemRow, { backgroundColor: colors.background }]}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>
                      {item.description || `${item.garmentTypeId} - ${item.serviceType}`}
                    </Text>
                    <Text style={[styles.itemService, { color: colors.textSecondary }]}>
                      {item.serviceType?.replace('_', ' ')} • Qty: {item.quantity}
                    </Text>
                  </View>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>
                    {item.price ? formatCurrency(item.price) : 'Price not available'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Pickup & Delivery Times */}
        <View style={[styles.timesCard, { backgroundColor: colors.card }]}>
          <View style={styles.timesCardHeader}>
            <View style={styles.timesIconContainer}>
              <Ionicons name="time" size={24} color="white" />
            </View>
            <View style={styles.timesCardInfo}>
              <Text style={[styles.timesCardTitle, { color: colors.text }]}>
                Schedule
              </Text>
              <Text style={[styles.timesCardSubtitle, { color: colors.textSecondary }]}>
                Pickup and delivery times
              </Text>
            </View>
          </View>
          
          <View style={styles.timesDetails}>
            {order.preferredPickupTimeStart && (
              <View style={styles.timeRow}>
                <Ionicons name="arrow-up" size={20} color={colors.success} />
                <View style={styles.timeInfo}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Pickup</Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>
                    {formatDate(order.preferredPickupTimeStart)}
                  </Text>
                </View>
              </View>
            )}
            
            {order.preferredDeliveryTimeStart && (
              <View style={styles.timeRow}>
                <Ionicons name="arrow-down" size={20} color={colors.primary} />
                <View style={styles.timeInfo}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Delivery</Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>
                    {formatDate(order.preferredDeliveryTimeStart)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.summaryCardHeader}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="receipt" size={24} color="white" />
            </View>
            <View style={styles.summaryCardInfo}>
              <Text style={[styles.summaryCardTitle, { color: colors.text }]}>
                Order Summary
              </Text>
              <Text style={[styles.summaryCardSubtitle, { color: colors.textSecondary }]}>
                Payment breakdown
              </Text>
            </View>
          </View>
          
          <View style={styles.summaryDetails}>
            {console.log('💰 OrderDetailsScreen: Order pricing data:', {
              subtotal: order.subtotal,
              discountAmount: order.discountAmount,
              taxAmount: order.taxAmount,
              totalAmount: order.totalAmount,
              itemsCount: order.items?.length,
              itemsTotal: order.items?.reduce((sum: number, item: any) => sum + (item.price || 0), 0)
            })}
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {order.subtotal ? formatCurrency(order.subtotal) : 'Not available'}
              </Text>
            </View>
            
            {order.discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  -{formatCurrency(order.discountAmount)}
                </Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {order.taxAmount ? formatCurrency(order.taxAmount) : 'Not available'}
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {order.totalAmount ? formatCurrency(order.totalAmount) : 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={[styles.notesCard, { backgroundColor: colors.card }]}>
            <View style={styles.notesCardHeader}>
              <View style={styles.notesIconContainer}>
                <Ionicons name="document-text" size={24} color="white" />
              </View>
              <View style={styles.notesCardInfo}>
                <Text style={[styles.notesCardTitle, { color: colors.text }]}>
                  Special Notes
                </Text>
                <Text style={[styles.notesCardSubtitle, { color: colors.textSecondary }]}>
                  Additional instructions
                </Text>
              </View>
            </View>
            
            <View style={styles.notesContent}>
              <Text style={[styles.notesText, { color: colors.text }]}>
                {order.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.trackButton, { backgroundColor: colors.primary }]}
            onPress={handleTrackOrder}
            activeOpacity={0.8}
          >
            <Ionicons name="location" size={20} color="white" />
            <Text style={styles.trackButtonText}>Track Order</Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Status Card
  statusCard: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusCardInfo: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statusCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  statusDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 14,
  },
  
  // Card Styles
  itemsCard: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  itemsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemsCardInfo: {
    flex: 1,
  },
  itemsCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  itemsCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  itemsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  
  timesCard: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  timesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f39c12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#f39c12',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timesCardInfo: {
    flex: 1,
  },
  timesCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  timesCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  timesDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  
  summaryCard: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27ae60',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardInfo: {
    flex: 1,
  },
  summaryCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  summaryCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  summaryDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  
  notesCard: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  notesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9b59b6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#9b59b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notesCardInfo: {
    flex: 1,
  },
  notesCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  notesCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  notesContent: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  
  // Item Rows
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemService: {
    fontSize: 14,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Time Rows
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  timeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    lineHeight: 18,
  },
  
  // Summary Rows
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Notes
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Action Buttons
  actionButtons: {
    marginBottom: 24,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
});
