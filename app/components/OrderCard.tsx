// @ts-nocheck
import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { Order, OrderStatus } from '../types/order';
import { formatCurrency } from '../utils/format';
import { formatDate } from '../utils/format';

interface OrderCardProps {
  order: Order;
  onPress?: (order: Order) => void;
  onReOrder?: (order: Order) => void;
}

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: '#3B82F6', // blue
    accepted: '#3B82F6',
    vendor_assigned: '#3B82F6',
    washing: '#3B82F6',
    washing_completed: '#3B82F6',
    ready_for_delivery: '#3B82F6',
    out_for_delivery: '#3B82F6',
    delivered: '#10B981', // green
    cancelled: '#EF4444', // red
    AWAITING_PICKUP: '#3B82F6',
    IN_PROGRESS: '#3B82F6',
    COMPLETED: '#10B981',
    CANCELLED: '#EF4444',
  };

  return statusColors[status] || '#6B7280';
};

const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    accepted: 'In progress',
    vendor_assigned: 'In progress',
    washing: 'In progress',
    washing_completed: 'In progress',
    ready_for_delivery: 'In progress',
    out_for_delivery: 'In progress',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    AWAITING_PICKUP: 'Awaiting Pickup',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  return statusLabels[status] || status;
};

const OrderCardComponent: React.FC<OrderCardProps> = ({ order, onPress, onReOrder }) => {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    onPress?.(order);
  }, [onPress, order]);

  const handleReOrder = useCallback(() => {
    onReOrder?.(order);
  }, [onReOrder, order]);

  // Format services for display
  const formatServices = () => {
    if (!order.items || order.items.length === 0) {
      return 'No items';
    }

    return order.items
      .map(item => {
        const serviceName = item.description || 'Unknown Service';
        const quantity = item.quantity || 1;
        return `${serviceName} - ${quantity} item(s)`;
      })
      .join(', ');
  };

  // Format date as DD-MM-YYYY
  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Date */}
      <Text style={[styles.date, { color: colors.textSecondary }]}>
        {formatOrderDate(order.createdAt)}
      </Text>

      {/* Order ID */}
      <Text style={[styles.orderId, { color: colors.text }]}>Order #{order.id.slice(0, 8)}</Text>

      {/* Services */}
      <Text style={[styles.services, { color: colors.text }]} numberOfLines={2}>
        {formatServices()}
      </Text>

      {/* Price and Status Row */}
      <View style={styles.bottomRow}>
        <Text style={[styles.price, { color: colors.text }]}>
          {formatCurrency(order.totalAmount)}
        </Text>

        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusLabel(order.status)}
          </Text>
        </View>
      </View>

      {/* Re-Order Button */}
      <TouchableOpacity
        style={[styles.reOrderButton, { backgroundColor: colors.primary }]}
        onPress={handleReOrder}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={16} color="white" />
        <Text style={styles.reOrderText}>Re-Order</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Memoize component to prevent unnecessary re-renders
export const OrderCard = memo(OrderCardComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  services: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  reOrderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
