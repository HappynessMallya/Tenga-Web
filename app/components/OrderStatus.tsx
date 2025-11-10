// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { OrderStatus as OrderStatusType } from '../types/order';

interface OrderStatusProps {
  status: OrderStatusType;
  size?: 'small' | 'medium' | 'large';
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ status, size = 'medium' }) => {
  const { colors } = useTheme();

  const getStatusColor = (status: OrderStatusType) => {
    const statusColors = {
      pending: colors.warning,
      accepted: colors.info,
      in_progress: colors.primary,
      ready: colors.secondary,
      ready_for_pickup: colors.secondary,
      picked_up: colors.primary,
      delivered: colors.success,
      cancelled: colors.error,
    };
    return statusColors[status] || colors.text;
  };

  const getStatusText = (status: OrderStatusType) => {
    const statusTexts = {
      pending: 'Pending',
      accepted: 'Accepted',
      in_progress: 'In Progress',
      ready: 'Ready',
      ready_for_pickup: 'Ready for Pickup',
      picked_up: 'Picked Up',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusTexts[status] || status;
  };

  const sizeStyles = {
    small: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
    medium: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
    large: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 16 },
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor(status) }, sizeStyles[size]]}>
      <Text
        style={[styles.text, { color: colors.background, fontSize: sizeStyles[size].fontSize }]}
      >
        {getStatusText(status)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
