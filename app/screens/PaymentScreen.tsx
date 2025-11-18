// @ts-nocheck
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TextInput, ScrollView } from 'react-native';

// TanStack Query Hooks
import {
  useOrder,
  useCreatePayment,
  useUpdateOrderStatus,
  useCreateOrder,
} from '../hooks/useServiceQueries';

// Components and Services
import { useTheme } from '../providers/ThemeProvider';
import { PaymentMethodSelector } from '../components/payment/PaymentMethodSelector';
import { PaymentProcessor } from '../components/payment/PaymentProcessor';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { PaymentMethod, CreatePaymentData } from '../types/payment';
import { logger } from '../utils/logger';
import { usePayment } from '../hooks/usePayment';
import { PaymentSuccessModal } from '../components/payment/PaymentSuccessModal';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage';
import {
  recoverPaymentStatus,
  showPaymentRecoveryAlert,
  createOrderForCompletedPayment,
} from '../utils/payment-recovery';
import { detectTanzaniaNetwork, normalizeTanzaniaPhone, isValidTanzaniaPhone } from '../utils/phoneUtils';
import { useOrderStore } from '../store/orderStore';
import API from '../api/axiosInstance';

export default function PaymentScreen() {
  const { colors } = useTheme();
  const {
    orderData: orderDataString,
    amount,
    phoneNumber: initialPhoneNumber,
    paymentMethod: initialPaymentMethod,
  } = useLocalSearchParams<{
    orderData: string;
    amount: string;
    phoneNumber?: string;
    paymentMethod?: string;
  }>();

  // Get orderId from order store (stored before payment)
  const { orderId } = useOrderStore();

  // Parse order data
  const orderData = orderDataString ? JSON.parse(orderDataString) : null;

  // Local state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    (initialPaymentMethod as PaymentMethod) || 'mobile_money'
  );
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(orderId);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string>('');
  const [detectedNetwork, setDetectedNetwork] = useState<string | null>(null);
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);

  // Payment hook
  const { processPayment } = usePayment();

  // TanStack Query hooks
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrderStatus();

  // Prepare payment data
  const paymentData: CreatePaymentData = {
    order_id: orderId || undefined, // Use orderId from store (stored before payment)
    amount: parseFloat(amount),
    payment_method: selectedMethod,
    phone: normalizedPhone || phoneNumber, // Use normalized phone number
    user_id: orderData?.customer_id,
  };

  const handlePayment = async () => {
    if (!orderData || !amount) {
      Alert.alert('Error', 'Invalid payment information');
      return;
    }

    // Validate phone number for mobile money payments
    if (selectedMethod === 'mobile_money' && !phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number for mobile money payment');
      return;
    }

    // For mobile money, the PaymentProcessor will handle everything
    // The actual payment processing is now handled by the PaymentProcessor component
  };

  const handlePaymentSuccess = async (payment: any) => {
    try {
      logger.info('Payment completed successfully, creating order', {
        paymentId: payment.id,
        paymentStatus: payment.status,
        orderId: payment.order_id,
      });

      // Create the actual order using the same order_id that was used for payment
      const order = await createOrderMutation.mutateAsync({
        ...orderData,
        id: payment.order_id,
        status: 'confirmed',
        notes: `Payment completed via ${selectedMethod} - Transaction: ${payment.transaction_id}`,
      });

      setCreatedOrderId(order.id);
      setSuccessOrderId(order.id);
      setShowSuccessModal(true);

      logger.info('Order created after successful payment', {
        orderId: order.id,
        paymentId: payment.id,
        paymentOrderId: payment.order_id,
      });

      // No need to update payment record since order_id is already set correctly
      logger.info('Payment and order records are properly linked', {
        paymentId: payment.id,
        orderId: order.id,
        paymentOrderId: payment.order_id,
      });

      // Clear cart data
      const clearCartData = async () => {
        try {
          await Promise.all([
            storage.remove(`${STORAGE_KEYS.DRAFT_ORDER}_cart`),
            storage.remove(`${STORAGE_KEYS.DRAFT_ORDER}_address`),
          ]);
          console.log('🧹 Cleared cart and address data after successful payment');
        } catch (error) {
          console.error('❌ Failed to clear cart data:', error);
        }
      };

      await clearCartData();

      // // Show success message and redirect
      // Alert.alert(
      //   'Payment Successful! 🎉',
      //   `Your payment of ${parseFloat(amount).toLocaleString()} TSH has been processed successfully.\n\nOrder ID: ${order.id}\n\nYou will receive a confirmation email shortly.`,
      //   [
      //     {
      //       text: 'View Order',
      //       onPress: () => router.replace(`/(customer)/tabs/orders`),
      //     },
      //   ]
      // );
    } catch (error) {
      logger.error('Failed to create order after payment', { error: error.message });
      Alert.alert(
        'Payment Successful but Order Creation Failed',
        'Your payment was processed successfully, but there was an issue creating your order. Please contact support with your payment reference.',
        [
          {
            text: 'Contact Support',
            onPress: () => router.replace('/(customer)/tabs/account'),
          },
        ]
      );
    }
  };

  const handlePaymentCancel = () => {
    logger.info('Payment cancelled by user');
    // User can go back to modify their order
  };

  const handlePaymentError = async (error: string) => {
    logger.error('Payment error received', { error });

    // Show an alert with recovery option
    Alert.alert(
      'Payment Issue',
      `${error}\n\nIf you believe your payment was successful, you can check the status.`,
      [
        {
          text: 'Check Payment Status',
          onPress: handleRecoverPayment,
        },
        {
          text: 'Try Again',
          onPress: () => {
            // Reset and allow retry
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRecoverPayment = async () => {
    // This function can be called when user suspects payment went through
    // but UI shows failed
    Alert.alert('Check Payment Status', 'Do you have a payment reference (Order ID) to check?', [
      {
        text: 'I have Order ID',
        onPress: () => promptForOrderId(),
      },
      {
        text: 'Use Current Order',
        onPress: () => recoverCurrentPayment(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const promptForOrderId = () => {
    // For now, we'll use the current payment data
    // In a more complete implementation, you might want to show a text input
    recoverCurrentPayment();
  };

  const recoverCurrentPayment = async () => {
    if (!paymentData.order_id) {
      Alert.alert('Error', 'No payment reference found to check.');
      return;
    }

    try {
      const result = await recoverPaymentStatus(paymentData.order_id);

      if (result.success && result.payment?.status === 'completed') {
        if (result.order) {
          // Payment and order both exist
          setCreatedOrderId(result.order.id);
          setSuccessOrderId(result.order.id);
          setShowSuccessModal(true);
        } else {
          // Payment exists but no order - try to create it
          const orderResult = await createOrderForCompletedPayment(
            result.payment,
            orderData,
            selectedMethod
          );

          if (orderResult.success && orderResult.order) {
            setCreatedOrderId(orderResult.order.id);
            setSuccessOrderId(orderResult.order.id);
            setShowSuccessModal(true);
          } else {
            showPaymentRecoveryAlert(orderResult);
          }
        }
      } else {
        showPaymentRecoveryAlert(result);
      }
    } catch (error) {
      Alert.alert('Recovery Failed', 'Unable to check payment status. Please contact support.');
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    
    // Auto-detect network and normalize phone number
    const network = detectTanzaniaNetwork(text);
    const normalized = normalizeTanzaniaPhone(text);
    
    setDetectedNetwork(network);
    setNormalizedPhone(normalized);
  };

  const handleViewOrder = () => {
    setShowSuccessModal(false);
    router.replace(`/(customer)/order/${successOrderId}`);
  };

  const handleViewAllOrders = () => {
    setShowSuccessModal(false);
    router.replace('/(customer)/tabs/orders');
  };

  if (createdOrderId) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Order Summary */}
        <View
          style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Order #</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {createdOrderId.slice(-8)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Order Total</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {orderData.total_amount_tsh || 0} TSH
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {parseFloat(amount || '0').toLocaleString()} TSH
            </Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <PaymentMethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />

        {/* Phone Number Input for Mobile Money */}
        {selectedMethod === 'mobile_money' && (
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Enter your phone number (e.g., 0755, 0655, 0685, 0715...)"
              placeholderTextColor={colors.textSecondary}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
              maxLength={12}
            />
            {detectedNetwork && detectedNetwork !== 'Invalid number' && detectedNetwork !== 'Unknown' && (
              <Text style={[styles.networkInfo, { color: colors.success || '#10B981' }]}>
                ✅ Detected Network: {detectedNetwork}
              </Text>
            )}
            {phoneNumber && phoneNumber.length >= 3 && detectedNetwork === 'Invalid number' && (
              <Text style={[styles.networkInfo, { color: colors.error || '#EF4444' }]}>
                ❌ Invalid phone number format
              </Text>
            )}
            {phoneNumber && phoneNumber.length >= 3 && detectedNetwork === 'Unknown' && (
              <Text style={[styles.networkInfo, { color: colors.warning || '#F59E0B' }]}>
                ⚠️ Unknown network. Please verify your number.
              </Text>
            )}
            {normalizedPhone && (
              <Text style={[styles.normalizedPhone, { color: colors.textSecondary }]}>
                Format: {normalizedPhone}
              </Text>
            )}
          </View>
        )}

        {/* Payment Button */}
        <View style={styles.buttonContainer}>
          <PaymentProcessor
            paymentData={paymentData}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          >
            {({ startPayment, isProcessing, state }) => (
              <Button
                title={isProcessing ? 'Processing Payment...' : 'Proceed to Payment'}
                onPress={startPayment}
                disabled={!phoneNumber.trim() || !isValidTanzaniaPhone(phoneNumber) || !normalizedPhone || isProcessing}
                style={styles.payButton}
              />
            )}
          </PaymentProcessor>
        </View>

        <PaymentSuccessModal
          visible={showSuccessModal}
          amount={parseFloat(amount)}
          orderId={successOrderId}
          onViewOrder={handleViewOrder}
          onViewAllOrders={handleViewAllOrders}
          onClose={() => setShowSuccessModal(false)}
        />
      </ScrollView>
    );
  }

  if (createdOrderId === null) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Order Summary */}
        <View
          style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Order #</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {createdOrderId ? createdOrderId.slice(-8) : 'Pending...'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Order Total</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {orderData.total_amount_tsh || 0} TSH
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {parseFloat(amount || '0').toLocaleString()} TSH
            </Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <PaymentMethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />

        {/* Phone Number Input for Mobile Money */}
        {selectedMethod === 'mobile_money' && (
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Enter your phone number (e.g., 0755, 0655, 0685, 0715...)"
              placeholderTextColor={colors.textSecondary}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
              maxLength={12}
            />
            {detectedNetwork && detectedNetwork !== 'Invalid number' && detectedNetwork !== 'Unknown' && (
              <Text style={[styles.networkInfo, { color: colors.success || '#10B981' }]}>
                ✅ Detected Network: {detectedNetwork}
              </Text>
            )}
            {phoneNumber && phoneNumber.length >= 3 && detectedNetwork === 'Invalid number' && (
              <Text style={[styles.networkInfo, { color: colors.error || '#EF4444' }]}>
                ❌ Invalid phone number format
              </Text>
            )}
            {phoneNumber && phoneNumber.length >= 3 && detectedNetwork === 'Unknown' && (
              <Text style={[styles.networkInfo, { color: colors.warning || '#F59E0B' }]}>
                ⚠️ Unknown network. Please verify your number.
              </Text>
            )}
            {normalizedPhone && (
              <Text style={[styles.normalizedPhone, { color: colors.textSecondary }]}>
                Format: {normalizedPhone}
              </Text>
            )}
          </View>
        )}

        {/* Payment Button */}
        <View style={styles.buttonContainer}>
          <PaymentProcessor
            paymentData={paymentData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          >
            {({ startPayment, isProcessing, state }) => (
              <Button
                title={isProcessing ? 'Processing Payment...' : 'Proceed to Payment'}
                onPress={startPayment}
                disabled={!phoneNumber.trim() || !isValidTanzaniaPhone(phoneNumber) || !normalizedPhone || isProcessing}
                style={styles.payButton}
              />
            )}
          </PaymentProcessor>
        </View>

        <PaymentSuccessModal
          visible={showSuccessModal}
          amount={parseFloat(amount)}
          orderId={successOrderId}
          onViewOrder={handleViewOrder}
          onViewAllOrders={handleViewAllOrders}
          onClose={() => setShowSuccessModal(false)}
        />
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LoadingSpinner />
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
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payButton: {
    marginTop: 8,
  },
  inputContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    padding: 8,
  },
  errorText: {
    marginTop: 8,
    color: 'red',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  networkInfo: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  normalizedPhone: {
    marginTop: 4,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
