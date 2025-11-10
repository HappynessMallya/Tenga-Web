// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { Order } from '../types/order';

interface OrderSummaryProps {
  order: Order;
  showBreakdown?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order, showBreakdown = true }) => {
  const { colors } = useTheme();

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'TZS 0';
    }
    return `TZS ${amount.toLocaleString()}`;
  };

  const calculateSubtotal = () => {
    return order.order_items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = order.delivery_fee || 0;
  const total = order.total_amount || subtotal + deliveryFee;

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Order Summary</Text>

      {showBreakdown && (
        <>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.value, { color: colors.text }]}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </>
      )}

      <View style={styles.row}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(total)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});
