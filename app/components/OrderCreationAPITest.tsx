/**
 * Order Creation API Test Component
 * Demonstrates the order creation API integration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { useOrderCreation } from '../hooks/useOrderCreation';
import { OrderCreation } from './OrderCreation';
import { CreateOrderItem, CustomerLocation } from '../types/orderCreation';

export const OrderCreationAPITest: React.FC = () => {
  const { colors } = useTheme();
  const {
    isLoading,
    error,
    success,
    orderId,
    order,
    pricing,
    selectedItems,
    customerLocation,
    formData,
    validationErrors,
    addGarmentToOrder,
    setCustomerLocationFromAddress,
    setPickupTimeSlot,
    setDeliveryTimeSlot,
    setOrderNotes,
    setOrderTags,
    getOrderSummary,
    getValidationErrors,
    hasValidationErrors,
    getTotalWeight,
    getTotalItems,
    estimatedTotal,
    canSubmit,
    clearOrder,
  } = useOrderCreation();

  const [showOrderCreation, setShowOrderCreation] = useState(false);

  // Sample data for testing
  const sampleLocation: CustomerLocation = {
    latitude: '-6.7924',
    longitude: '39.2083',
    description: '123 Main Street, Dar es Salaam',
    city: 'Dar es Salaam',
    country: 'Tanzania',
  };

  const sampleItems: CreateOrderItem[] = [
    {
      garmentTypeId: 'shirt',
      serviceType: 'WASH_FOLD',
      description: 'Red dress — dry clean',
      quantity: 1,
      weightLbs: 0.5,
      price: 15.99,
    },
  ];

  // Handle test order creation
  const handleTestOrderCreation = () => {
    console.log('🧪 OrderCreationAPITest: Testing order creation');
    
    // Set sample data
    setCustomerLocationFromAddress(
      sampleLocation.latitude,
      sampleLocation.longitude,
      sampleLocation.description,
      sampleLocation.city,
      sampleLocation.country
    );

    // Add sample items
    sampleItems.forEach(item => {
      addGarmentToOrder(
        item.garmentTypeId,
        item.serviceType,
        item.description,
        item.quantity,
        item.weightLbs,
        item.price
      );
    });

    // Set time slots (tomorrow for pickup, day after for delivery)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const tomorrowEnd = new Date();
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(12, 0, 0, 0);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);

    const dayAfterEnd = new Date();
    dayAfterEnd.setDate(dayAfterEnd.getDate() + 2);
    dayAfterEnd.setHours(18, 0, 0, 0);

    setPickupTimeSlot(tomorrow, tomorrowEnd);
    setDeliveryTimeSlot(dayAfter, dayAfterEnd);

    // Set notes and tags
    setOrderNotes('Handle with care');
    setOrderTags(['fragile', 'do-not-mix']);

    Alert.alert(
      'Test Data Loaded',
      'Sample order data has been loaded. You can now test the order creation.',
      [{ text: 'OK' }]
    );
  };

  // Handle clear test data
  const handleClearTestData = () => {
    console.log('🗑️ OrderCreationAPITest: Clearing test data');
    clearOrder();
    Alert.alert('Test Data Cleared', 'All test data has been cleared.');
  };

  // Handle order created
  const handleOrderCreated = (orderId: string) => {
    console.log('✅ OrderCreationAPITest: Order created:', orderId);
    Alert.alert(
      'Order Created Successfully!',
      `Order ID: ${orderId}\n\nYou can now view the order in the orders list.`,
      [{ text: 'OK' }]
    );
  };

  // Render order summary
  const renderOrderSummary = () => {
    if (selectedItems.length === 0 && !customerLocation) {
      return (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Ionicons name="shirt-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            No order data loaded
          </Text>
        </View>
      );
    }

    const summary = getOrderSummary();

    return (
      <View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          Current Order Summary
        </Text>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Location:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {summary.customerLocation}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Items:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {summary.itemsCount}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Weight:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {getTotalWeight()} lbs
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Items:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {getTotalItems()}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Estimated Total:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            ${summary.estimatedTotal}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Pickup Time:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {summary.pickupTime}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Delivery Time:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {summary.deliveryTime}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Notes:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {summary.notes}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Tags:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {summary.tags.join(', ') || 'None'}
          </Text>
        </View>
      </View>
    );
  };

  // Render validation errors
  const renderValidationErrors = () => {
    if (!hasValidationErrors()) return null;

    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>
          Validation Errors:
        </Text>
        {getValidationErrors().map((error, index) => (
          <Text key={index} style={[styles.errorText, { color: colors.error }]}>
            • {error}
          </Text>
        ))}
      </View>
    );
  };

  // Render order details
  const renderOrderDetails = () => {
    if (!order) return null;

    return (
      <View style={[styles.orderDetails, { backgroundColor: colors.card }]}>
        <Text style={[styles.orderDetailsTitle, { color: colors.text }]}>
          Order Details
        </Text>
        
        <View style={styles.orderDetailsRow}>
          <Text style={[styles.orderDetailsLabel, { color: colors.textSecondary }]}>
            Order ID:
          </Text>
          <Text style={[styles.orderDetailsValue, { color: colors.text }]}>
            {order.id}
          </Text>
        </View>
        
        <View style={styles.orderDetailsRow}>
          <Text style={[styles.orderDetailsLabel, { color: colors.textSecondary }]}>
            Status:
          </Text>
          <Text style={[styles.orderDetailsValue, { color: colors.primary }]}>
            {order.status}
          </Text>
        </View>
        
        <View style={styles.orderDetailsRow}>
          <Text style={[styles.orderDetailsLabel, { color: colors.textSecondary }]}>
            Customer:
          </Text>
          <Text style={[styles.orderDetailsValue, { color: colors.text }]}>
            {order.customer.user.fullName}
          </Text>
        </View>
        
        <View style={styles.orderDetailsRow}>
          <Text style={[styles.orderDetailsLabel, { color: colors.textSecondary }]}>
            Total Amount:
          </Text>
          <Text style={[styles.orderDetailsValue, { color: colors.primary }]}>
            {pricing?.currency} {pricing?.totalAmount}
          </Text>
        </View>
        
        <View style={styles.orderDetailsRow}>
          <Text style={[styles.orderDetailsLabel, { color: colors.textSecondary }]}>
            Created At:
          </Text>
          <Text style={[styles.orderDetailsValue, { color: colors.text }]}>
            {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Order Creation API Test
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Test the order creation API with sample data
          </Text>
        </View>

        {/* API Status */}
        <View style={[styles.statusContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            API Status
          </Text>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Loading:
            </Text>
            <Text style={[styles.statusValue, { color: isLoading ? colors.warning : colors.success }]}>
              {isLoading ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Success:
            </Text>
            <Text style={[styles.statusValue, { color: success ? colors.success : colors.textSecondary }]}>
              {success ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Order ID:
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              {orderId || 'None'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Can Submit:
            </Text>
            <Text style={[styles.statusValue, { color: canSubmit ? colors.success : colors.error }]}>
              {canSubmit ? 'Yes' : 'No'}
            </Text>
          </View>
          
          {error && (
            <View style={styles.errorRow}>
              <Text style={[styles.errorLabel, { color: colors.error }]}>
                Error:
              </Text>
              <Text style={[styles.errorValue, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleTestOrderCreation}
            disabled={isLoading}
          >
            <Ionicons name="flask" size={20} color="white" />
            <Text style={styles.actionButtonText}>Load Test Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => setShowOrderCreation(!showOrderCreation)}
          >
            <Ionicons name="create" size={20} color="white" />
            <Text style={styles.actionButtonText}>
              {showOrderCreation ? 'Hide Creation Form' : 'Show Creation Form'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleClearTestData}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.actionButtonText}>Clear Test Data</Text>
          </TouchableOpacity>
        </View>

        {/* Order Creation Form */}
        {showOrderCreation && (
          <View style={styles.orderCreationContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Order Creation Form
            </Text>
            <OrderCreation
              businessId="68d2971b2fc5bd3f6a4b5ed9"
              onOrderCreated={handleOrderCreated}
              initialLocation={sampleLocation}
            />
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Order Summary
          </Text>
          {renderOrderSummary()}
        </View>

        {/* Validation Errors */}
        {renderValidationErrors()}

        {/* Order Details */}
        {renderOrderDetails()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  content: {
    padding: 16,
  },
  
  header: {
    marginBottom: 24,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  
  statusContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 12,
  },
  
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  statusLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  
  errorLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  
  errorValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    flex: 1,
    textAlign: 'right',
  },
  
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  orderCreationContainer: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 16,
  },
  
  summarySection: {
    marginBottom: 24,
  },
  
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
  },
  
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 16,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginTop: 12,
  },
  
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 8,
  },
  
  errorText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 4,
  },
  
  orderDetails: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  
  orderDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 16,
  },
  
  orderDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  orderDetailsLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  
  orderDetailsValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
});
