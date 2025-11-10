// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { Order, OrderStatus } from '../types/order';

interface OrderTrackingProps {
  order: Order;
}

interface TrackingStep {
  key: OrderStatus;
  label: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ order }) => {
  const { colors } = useTheme();

  const steps: TrackingStep[] = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'accepted', label: 'Order Accepted' },
    { key: 'in_progress', label: 'Processing' },
    { key: 'ready', label: 'Ready for Pickup' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === order.status);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={step.key} style={styles.stepContainer}>
          <View style={styles.stepLine}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: index <= currentStepIndex ? colors.primary : colors.textTertiary,
                },
              ]}
            />
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      index < currentStepIndex ? colors.primary : colors.textTertiary,
                  },
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              {
                color: index <= currentStepIndex ? colors.text : colors.textSecondary,
              },
            ]}
          >
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepLine: {
    width: 2,
    height: 24,
    marginLeft: 8,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
