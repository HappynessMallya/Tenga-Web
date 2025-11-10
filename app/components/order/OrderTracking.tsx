// @ts-nocheck
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

interface OrderTrackingProps {
  orderId: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = () => {
  const { colors } = useTheme();
  return <View style={[styles.container, { backgroundColor: colors.card }]} />;
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    margin: 8,
  },
});
