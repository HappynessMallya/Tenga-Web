// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { Order } from '../../types/order';
import { OrderStatus } from '../OrderStatus';
import { Ionicons } from '@expo/vector-icons';

interface OrderListProps {
  orders: Order[];
  onOrderPress?: (order: Order) => void;
  showStatus?: boolean;
  emptyMessage?: string;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onOrderPress,
  showStatus = true,
  emptyMessage = 'No orders found',
}) => {
  const { colors } = useTheme();

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'TZS 0';
    }
    return `TZS ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = ({ item: order }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onOrderPress?.(order)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderId, { color: colors.text }]}>Order #{order.id.slice(-8)}</Text>
          <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
            {formatDate(order.created_at)}
          </Text>
        </View>
        {showStatus && <OrderStatus status={order.status} size="small" />}
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.customerInfo}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.customerAddress, { color: colors.textSecondary }]}>
            {order.delivery_address}
          </Text>
        </View>

        {order.special_instructions && (
          <View style={styles.instructions}>
            <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
              {order.special_instructions}
            </Text>
          </View>
        )}

        <View style={styles.orderFooter}>
          <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
            {order.order_items?.length || 0} items
          </Text>
          <Text style={[styles.orderTotal, { color: colors.primary }]}>
            {formatCurrency(order.total_amount_tsh)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      renderItem={renderOrderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  orderCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  orderDetails: {
    gap: 8,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerAddress: {
    fontSize: 14,
    flex: 1,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionsText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemCount: {
    fontSize: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
