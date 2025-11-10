// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { Payment } from '../../types/payment';
import { formatCurrency } from '../../utils/format';

interface PaymentHistoryProps {
  payments: Payment[];
  onPaymentPress?: (payment: Payment) => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments, onPaymentPress }) => {
  const { colors } = useTheme();

  const renderPaymentItem = ({ item: payment }: { item: Payment }) => (
    <View
      style={[styles.paymentItem, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.paymentHeader}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(payment.amount)}
        </Text>
        <Text
          style={[
            styles.status,
            { color: payment.status === 'completed' ? colors.success : colors.warning },
          ]}
        >
          {payment.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={[styles.method, { color: colors.textSecondary }]}>
          {payment.payment_method.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date(payment.created_at).toLocaleDateString()}
        </Text>
      </View>

      {payment.transaction_id && (
        <Text style={[styles.transactionId, { color: colors.textSecondary }]}>
          Transaction ID: {payment.transaction_id}
        </Text>
      )}
    </View>
  );

  return (
    <FlatList
      data={payments}
      renderItem={renderPaymentItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  paymentItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  method: {
    fontSize: 14,
  },
  date: {
    fontSize: 14,
  },
  transactionId: {
    fontSize: 12,
  },
});
