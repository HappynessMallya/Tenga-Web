// @ts-nocheck
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../providers/ThemeProvider';
import { useOrderStore } from '../store/orderStore';
import { useGarmentConfig } from '../hooks/useGarmentConfig';
import { orderCreationService } from '../services/orderCreationService';
import { orderService } from '../services/orderService';
import { CreateOrderRequest } from '../types/orderCreation';
import { formatCurrency } from '../utils/orderCalculations';

const PAYMENT_METHODS = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    icon: 'phone-portrait',
    color: '#00A86B',
    description: 'Pay with M-Pesa mobile money',
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    icon: 'phone-portrait',
    color: '#E60012',
    description: 'Pay with Airtel Money',
  },
  {
    id: 'tigo',
    name: 'Tigo Pesa',
    icon: 'phone-portrait',
    color: '#FF6B00',
    description: 'Pay with Tigo Pesa',
  },
  {
    id: 'mixx',
    name: 'Mixx by Yas',
    icon: 'card',
    color: '#9334ea',
    description: 'Pay with Mixx by Yas',
  },
];

export default function PaymentScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Get order data from order store
  const { 
    pickupDate,
    location,
    notes,
    setPaymentMethod,
    resetOrder,
    orderId,
  } = useOrderStore();

  // Get garment data from garment config store
  const { 
    selectedGarments,
    getTotalPrice,
  } = useGarmentConfig();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);

  // Calculate totals
  const total = getTotalPrice();
  const selectedItemsCount = selectedGarments.reduce((sum, item) => sum + item.quantity, 0);
  const selectedServicesCount = new Set(selectedGarments.map(garment => garment.serviceType)).size;
  const canProceed = selectedPaymentMethod !== null;

  console.log('💳 Payment Screen State:', {
    selectedGarments: selectedGarments.length,
    total,
    selectedItemsCount,
    selectedServicesCount,
    pickupDate: pickupDate ? 'Set' : 'Not set',
    location: location ? 'Set' : 'Not set'
  });

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method.');
      return;
    }

    if (!orderId) {
      Alert.alert('Error', 'Order ID is missing. Please go back and try again.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('💳 Processing payment for existing order:', orderId);
      
      // Set payment method in store
      setPaymentMethod(selectedPaymentMethod);
      
      // Mock payment processing (simulate API call)
      console.log('🔄 Mocking payment processing...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      
      // Mock successful payment
      console.log('✅ Payment processed successfully (mocked)');
      
      // Note: Skipping order status update since the API endpoint doesn't exist yet
      // In a real implementation, you would update the order status here:
      // await orderService.updateOrderStatus(orderId, 'confirmed');
      
      console.log('✅ Payment successful (mocked) - Order status update skipped');
      
      // Close payment modal and show success modal
      setShowPaymentModal(false);
      setShowPaymentSuccessModal(true);
      
    } catch (error: any) {
      console.error('❌ Payment processing failed:', error);
      
      // Note: Skipping order cancellation since the API endpoint doesn't exist yet
      // In a real implementation, you would cancel the order here:
      // await orderService.cancelOrder(orderId);
      
      console.log('💳 Payment failed (mocked) - Order cancellation skipped');
      
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel? You can complete your order later.',
      [
        { text: 'Continue Payment', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  const handleProceedToTracking = () => {
    setShowPaymentSuccessModal(false);
    // Navigate to order tracking - orderId is now stored in Zustand
    router.replace('/(customer)/order-tracking');
  };

  const handleProceedToPayment = () => {
    if (!canProceed) {
      Alert.alert('Error', 'Please select a payment method to continue.');
      return;
    }
    setShowPaymentModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.card,
        paddingTop: insets.top + 16,
        paddingBottom: 16
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            Payment
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            Step 3 of 5
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleCancelPayment} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        {/* <View style={[styles.instructionsCard, { backgroundColor: colors.card }]}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              Complete Your Payment
            </Text>
          </View>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            Choose your preferred payment method to complete your order. Your payment is secure and encrypted.
          </Text>
        </View> */}

        {/* Order Total */}
        <View style={[styles.totalCard, { backgroundColor: colors.card }]}>
          <View style={styles.totalCardHeader}>
            <View style={styles.totalIconContainer}>
              <Ionicons name="calculator" size={24} color="white" />
            </View>
            <View style={styles.totalCardInfo}>
              <Text style={[styles.totalCardTitle, { color: colors.text }]}>
                Order Total
              </Text>
              <Text style={[styles.totalCardSubtitle, { color: colors.textSecondary }]}>
                {selectedItemsCount} item{selectedItemsCount !== 1 ? 's' : ''} • {selectedServicesCount} service{selectedServicesCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          
          <View style={[styles.totalAmount, { backgroundColor: colors.background }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Amount to Pay
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatCurrency(total)}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
          <View style={styles.paymentCardHeader}>
            <View style={styles.paymentIconContainer}>
              <Ionicons name="card" size={24} color="white" />
            </View>
            <View style={styles.paymentCardInfo}>
              <Text style={[styles.paymentCardTitle, { color: colors.text }]}>
                Payment Methods
              </Text>
              <Text style={[styles.paymentCardSubtitle, { color: colors.textSecondary }]}>
                Choose your preferred payment option
              </Text>
            </View>
          </View>
          
          <View style={styles.paymentMethodsList}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodRow,
                  {
                    backgroundColor: selectedPaymentMethod === method.id ? colors.background : colors.background,
                    borderColor: selectedPaymentMethod === method.id ? method.color : colors.border,
                    borderWidth: selectedPaymentMethod === method.id ? 2 : 1,
                  },
                ]}
                onPress={() => handlePaymentMethodSelect(method.id)}
                activeOpacity={0.7}
              >
                <View style={styles.paymentMethodContent}>
                  <View style={[
                    styles.paymentMethodIcon, 
                    { 
                      backgroundColor: method.color + '20',
                      borderColor: method.color,
                      borderWidth: 1,
                    }
                  ]}>
                    <Ionicons name={method.icon as any} size={20} color={method.color} />
                  </View>
                  
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[
                      styles.paymentMethodName, 
                      { 
                        color: selectedPaymentMethod === method.id ? method.color : colors.text,
                        fontWeight: selectedPaymentMethod === method.id ? '600' : '500',
                      }
                    ]}>
                      {method.name}
                    </Text>
                    <Text style={[styles.paymentMethodDescription, { color: colors.textSecondary }]}>
                      {method.description}
                    </Text>
                  </View>
                  
                  <View style={styles.paymentMethodAction}>
                    {selectedPaymentMethod === method.id ? (
                      <Ionicons name="checkmark-circle" size={24} color={method.color} />
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Security Notice */}
        <View style={[styles.securityCard, { backgroundColor: colors.card }]}>
          <View style={styles.securityCardHeader}>
            <View style={styles.securityIconContainer}>
              <Ionicons name="shield-checkmark" size={24} color="white" />
            </View>
            <View style={styles.securityCardInfo}>
              <Text style={[styles.securityCardTitle, { color: colors.text }]}>
                Secure Payment
              </Text>
              <Text style={[styles.securityCardSubtitle, { color: colors.textSecondary }]}>
                Your payment is protected
              </Text>
            </View>
          </View>
          
          <View style={[styles.securityContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.securityText, { color: colors.textSecondary }]}>
              Your payment information is secure and encrypted. We never store your payment details and use industry-standard security measures.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={[
        styles.footer, 
        { 
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            {
              backgroundColor: canProceed ? '#2c3e50' : '#e8e8e8',
              shadowColor: canProceed ? '#2c3e50' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: canProceed ? 0.2 : 0,
              shadowRadius: 8,
              elevation: canProceed ? 4 : 0,
            },
          ]}
          onPress={handleProceedToPayment}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          <View style={styles.paymentButtonContent}>
            <View style={styles.paymentButtonLeft}>
              <Text
                style={[
                  styles.paymentButtonText,
                  {
                    color: canProceed ? 'white' : '#6b7280',
                    fontWeight: canProceed ? '600' : '500',
                    letterSpacing: 0.5,
                  },
                ]}
              >
                {canProceed ? 'Process Payment' : 'Select payment method'}
              </Text>
              {canProceed && (
                <Text style={[
                  styles.paymentButtonTotal,
                  { color: 'rgba(255, 255, 255, 0.8)' }
                ]}>
                  {formatCurrency(total)}
                </Text>
              )}
            </View>
            <View style={styles.paymentButtonArrow}>
              <Ionicons
                name={canProceed ? "card" : "card-outline"}
                size={20}
                color={canProceed ? 'white' : '#6b7280'}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Confirm Payment
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={[styles.modalAmount, { color: colors.text }]}>
                {formatCurrency(total)}
              </Text>
              <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                Pay with {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name}
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: isProcessing ? colors.border : colors.primary },
                ]}
                onPress={handleConfirmPayment}
                disabled={isProcessing}
              >
                <Text style={styles.modalButtonText}>
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Success Modal */}
      <Modal
        visible={showPaymentSuccessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.successModalHeader}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#27ae60" />
              </View>
              <Text style={[styles.successModalTitle, { color: colors.text }]}>
                Payment Successful!
              </Text>
              <Text style={[styles.successModalSubtitle, { color: colors.textSecondary }]}>
                Your payment has been processed successfully.
              </Text>
            </View>
            
            <View style={styles.successModalContent}>
              <View style={[styles.orderInfoCard, { backgroundColor: colors.background }]}>
                <View style={styles.orderInfoRow}>
                  <Text style={[styles.orderInfoLabel, { color: colors.textSecondary }]}>
                    Order ID:
                  </Text>
                  <Text style={[styles.orderInfoValue, { color: colors.text }]}>
                    #{orderId?.slice(-4)}
                  </Text>
                </View>
                <View style={styles.orderInfoRow}>
                  <Text style={[styles.orderInfoLabel, { color: colors.textSecondary }]}>
                    Amount Paid:
                  </Text>
                  <Text style={[styles.orderInfoValue, { color: colors.primary }]}>
                    {formatCurrency(total)}
                  </Text>
                </View>
                <View style={styles.orderInfoRow}>
                  <Text style={[styles.orderInfoLabel, { color: colors.textSecondary }]}>
                    Payment Method:
                  </Text>
                  <Text style={[styles.orderInfoValue, { color: colors.text }]}>
                    {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name}
                  </Text>
                </View>
                <View style={styles.orderInfoRow}>
                  <Text style={[styles.orderInfoLabel, { color: colors.textSecondary }]}>
                    Status:
                  </Text>
                  <Text style={[styles.orderInfoValue, { color: '#27ae60' }]}>
                    Confirmed
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.successModalActions}>
              <TouchableOpacity
                style={[styles.successModalButton, { backgroundColor: colors.primary }]}
                onPress={handleProceedToTracking}
              >
                <Text style={styles.successModalButtonText}>
                  Track Order
                </Text>
                <Ionicons name="location" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 16,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  garmentSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  garmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  garmentInfo: {
    flex: 1,
  },
  garmentName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  garmentService: {
    fontSize: 12,
  },
  garmentPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentMethodCard: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
  },
  paymentMethodAction: {
    marginLeft: 8,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  instructionsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  totalCard: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  totalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27ae60',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  totalCardInfo: {
    flex: 1,
  },
  totalCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  totalCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  totalAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  paymentCard: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentCardInfo: {
    flex: 1,
  },
  paymentCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  paymentCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  paymentMethodsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentMethodRow: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
  },
  paymentMethodAction: {
    paddingLeft: 8,
  },
  securityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  securityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2ecc71',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  securityCardInfo: {
    flex: 1,
  },
  securityCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  securityCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  securityContent: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  footer: {
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  paymentButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  paymentButtonLeft: {
    flex: 1,
    paddingRight: 8,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  paymentButtonTotal: {
    fontSize: 14,
    marginTop: 2,
  },
  paymentButtonArrow: {
    paddingLeft: 8,
  },
  // Success Modal Styles
  successModalHeader: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  successModalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  successModalContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  orderInfoCard: {
    borderRadius: 12,
    padding: 16,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  successModalActions: {
    padding: 24,
    paddingTop: 16,
  },
  successModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  successModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});