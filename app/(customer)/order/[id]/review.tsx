// @ts-nocheck
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// TanStack Query Hooks
import { useOrder } from '../../../hooks/useServiceQueries';

// Components
import { ReviewSystem } from '../../../components/review/ReviewSystem';
import { useTheme } from '../../../providers/ThemeProvider';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { ErrorView } from '../../../components/ErrorView';

export default function ReviewScreen() {
  const { id, vendorId } = useLocalSearchParams();
  const { colors } = useTheme();

  // Extract orderId from the route parameter
  const orderId = id as string;

  // Validate order exists and is eligible for review
  const { data: order, isLoading, error, refetch } = useOrder(orderId, !!orderId);

  const handleReviewSubmitted = () => {
    router.back();
  };

  const handleRetry = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <LoadingSpinner size="large" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading order details...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorView
          error={error || new Error('Order not found')}
          onRetry={handleRetry}
          title="Review Error"
          message="Unable to load order for review"
        />
      </View>
    );
  }

  // Check if order is eligible for review
  if (!['delivered', 'completed'].includes(order.status)) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.ineligibleTitle, { color: colors.text }]}>Review Not Available</Text>
        <Text style={[styles.ineligibleMessage, { color: colors.textSecondary }]}>
          You can only review orders that have been completed or delivered.
        </Text>
        <Text style={[styles.statusText, { color: colors.primary }]}>
          Current status: {order.status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ReviewSystem
        orderId={orderId as string}
        vendorId={vendorId as string}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  ineligibleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  ineligibleMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
