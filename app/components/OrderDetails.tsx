// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { Order } from '../types/order';
import { OrderStatus } from './OrderStatus';
import { OrderItems } from './OrderItems';
import { OrderSummary } from './OrderSummary';

interface OrderDetailsProps {
  order: Order;
  showItems?: boolean;
  showSummary?: boolean;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  showItems = true,
  showSummary = true,
}) => {
  const { colors } = useTheme();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.orderId, { color: colors.text }]}>Order #{order.id.slice(-8)}</Text>
          <OrderStatus status={order.status} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Information</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {order.delivery_address}
          </Text>
          {order.customer_phone && (
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Phone: {order.customer_phone}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Timeline</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Created: {formatDate(order.created_at)}
          </Text>
          {order.pickup_time && (
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Pickup: {formatDate(order.pickup_time)}
            </Text>
          )}
          {order.estimated_delivery_time && (
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Est. Delivery: {formatDate(order.estimated_delivery_time)}
            </Text>
          )}
        </View>

        {order.special_instructions && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Special Instructions</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {order.special_instructions}
            </Text>
          </View>
        )}
      </View>

      {showItems && order.order_items && <OrderItems items={order.order_items} />}

      {showSummary && <OrderSummary order={order} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});
