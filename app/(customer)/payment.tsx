// @ts-nocheck
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
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
import { detectTanzaniaNetwork, normalizeTanzaniaPhone, isValidTanzaniaPhone } from '../utils/phoneUtils';
import API from '../api/axiosInstance';

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
    orderUuid,
    setOrderId,
    setOrderUuid,
  } = useOrderStore();

  // Get garment data from garment config store
  const { 
    selectedGarments,
    getTotalPrice,
  } = useGarmentConfig();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [detectedNetwork, setDetectedNetwork] = useState<string | null>(null);
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Calculate totals from fetched order or fallback to garment config
  const total = orderData?.totalAmount || getTotalPrice();
  const selectedItemsCount = orderData?.items?.length || selectedGarments.reduce((sum, item) => sum + item.quantity, 0);
  const selectedServicesCount = orderData?.items ? new Set(orderData.items.map((item: any) => item.serviceType)).size : new Set(selectedGarments.map(garment => garment.serviceType)).size;
  const canProceed = phoneNumber.trim() !== '' && isValidTanzaniaPhone(phoneNumber) && normalizedPhone !== null && orderData && !orderError;

  // Fetch fresh order data when screen loads
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        console.error('❌ No order ID found');
        setOrderError('No order found. Please create an order first.');
        setIsLoadingOrder(false);
        return;
      }

      try {
        setIsLoadingOrder(true);
        setOrderError(null);
        
        console.log('🔄 Payment Screen: Fetching fresh order data...');
        console.log('📋 Using Order ID:', orderId);
        
        const fetchedOrder = await orderService.getOrderById(orderId);
        
        console.log('✅ Payment Screen: Order fetched successfully');
        console.log('📦 Order Details:', {
          id: fetchedOrder.id,
          uuid: fetchedOrder.uuid,
          status: fetchedOrder.status,
          totalAmount: fetchedOrder.totalAmount,
          itemsCount: fetchedOrder.items?.length
        });
        
        // Verify order is in valid state for payment
        if (fetchedOrder.status === 'CANCELED' || fetchedOrder.status === 'CANCELLED') {
          console.error('❌ Order is canceled');
          setOrderError('This order has been canceled and cannot accept payment.');
          Alert.alert(
            'Order Canceled',
            'This order has been canceled. Please create a new order.',
            [
              {
                text: 'Create New Order',
                onPress: () => {
                  resetOrder();
                  router.replace('/(customer)/tabs/home');
                }
              }
            ]
          );
          setIsLoadingOrder(false);
          return;
        }
        
        // Update stored UUID if it doesn't match
        if (fetchedOrder.uuid && fetchedOrder.uuid !== orderUuid) {
          console.log('🔄 Updating stored UUID:', fetchedOrder.uuid);
          setOrderUuid(fetchedOrder.uuid);
        }
        
        setOrderData(fetchedOrder);
        setIsLoadingOrder(false);
        
      } catch (error: any) {
        console.error('❌ Failed to fetch order:', error);
        setOrderError(error.message || 'Failed to load order details');
        setIsLoadingOrder(false);
        
        Alert.alert(
          'Error Loading Order',
          'Could not load order details. Please try again.',
          [
            { text: 'Retry', onPress: () => fetchOrderData() },
            { text: 'Go Back', onPress: () => router.back() }
          ]
        );
      }
    };

    fetchOrderData();
  }, [orderId]);

  console.log('💳 Payment Screen State:', {
    orderId,
    orderUuid: orderData?.uuid || orderUuid,
    orderStatus: orderData?.status,
    isLoadingOrder,
    orderError,
    total,
    selectedItemsCount,
    selectedServicesCount,
    hasOrderData: !!orderData
  });

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    
    // Auto-detect network as user types
    const network = detectTanzaniaNetwork(text);
    const normalized = normalizeTanzaniaPhone(text);
    
    setDetectedNetwork(network);
    setNormalizedPhone(normalized);
    
    console.log('📱 Phone input changed:', {
      input: text,
      detectedNetwork: network,
      normalized,
      isValid: isValidTanzaniaPhone(text)
    });
  };

  const handleConfirmPayment = async () => {
    if (!normalizedPhone) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    if (!isValidTanzaniaPhone(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Tanzania mobile number.');
      return;
    }

    if (!orderData) {
      Alert.alert('Error', 'Order data is not loaded. Please wait or go back and try again.');
      return;
    }

    const useUuid = orderData.uuid || orderUuid;
    
    if (!useUuid) {
      Alert.alert('Error', 'Order UUID is missing. Please go back and try again.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('💳 Processing payment for existing order:');
      console.log('📋 Order ID (MongoDB):', orderData.id);
      console.log('🆔 Order UUID:', useUuid);
      console.log('📊 Order Status:', orderData.status);
      console.log('💰 Order Amount:', orderData.totalAmount);
      console.log('📱 Phone number:', normalizedPhone);
      console.log('📶 Detected network:', detectedNetwork);
      
      // Call payment initiation API (using UUID from fetched order)
      const paymentEndpoint = `/payments/initiate/${useUuid}`;
      console.log('🔗 Calling payment API:', paymentEndpoint);
      
      const response = await API.post(paymentEndpoint, {
        phoneNumber: normalizedPhone
      });
      
      console.log('✅ Payment initiation response:', response.data);
      
      // Store payment response
      setPaymentResponse(response.data);
      
      // Set payment method in store (using detected network)
      setPaymentMethod(detectedNetwork?.toLowerCase() || 'mobile_money');
      
      // Close payment modal and show success modal
      setShowPaymentModal(false);
      setShowPaymentSuccessModal(true);
      
    } catch (error: any) {
      console.error('❌ Payment processing failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = 'There was an error processing your payment. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Payment Failed', errorMessage);
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
      Alert.alert('Error', 'Please enter a valid phone number to continue.');
      return;
    }
    
    if (!normalizedPhone) {
      Alert.alert('Error', 'Please enter a valid Tanzania mobile number.');
      return;
    }
    
    if (detectedNetwork === 'Unknown') {
      Alert.alert(
        'Unknown Network',
        'We couldn\'t detect your mobile network. Please verify your phone number is correct.',
        [
          { text: 'Check Number', style: 'cancel' },
          { text: 'Continue Anyway', onPress: () => setShowPaymentModal(true) }
        ]
      );
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

      {/* Loading State */}
      {isLoadingOrder && (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text, marginTop: 16 }]}>
            Loading order details...
          </Text>
        </View>
      )}

      {/* Error State */}
      {orderError && !isLoadingOrder && (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error, marginTop: 16 }]}>
            {orderError}
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: colors.primary, marginTop: 20 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content - Only show when order is loaded */}
      {!isLoadingOrder && !orderError && orderData && (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status Badge */}
        {orderData.status && (
          <View style={[styles.statusBanner, { backgroundColor: colors.card, marginBottom: 16, padding: 16, borderRadius: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.statusTitle, { color: colors.text, fontSize: 16, fontWeight: '600' }]}>
                  Order #{orderData.id.slice(-6)}
                </Text>
                <Text style={[styles.statusSubtitle, { color: colors.textSecondary, fontSize: 14, marginTop: 4 }]}>
                  Status: {orderData.status}
                </Text>
              </View>
            </View>
          </View>
        )}

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

        {/* Phone Number Input */}
        <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
          <View style={styles.paymentCardHeader}>
            <View style={styles.paymentIconContainer}>
              <Ionicons name="phone-portrait" size={24} color="white" />
            </View>
            <View style={styles.paymentCardInfo}>
              <Text style={[styles.paymentCardTitle, { color: colors.text }]}>
                Mobile Money Payment
              </Text>
              <Text style={[styles.paymentCardSubtitle, { color: colors.textSecondary }]}>
                Enter your phone number to complete payment
              </Text>
            </View>
          </View>
          
          <View style={styles.phoneInputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Phone Number
            </Text>
            <TextInput
              style={[
                styles.phoneInput,
                { 
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: detectedNetwork && detectedNetwork !== 'Invalid number' && detectedNetwork !== 'Unknown' 
                    ? '#10B981' 
                    : colors.border
                }
              ]}
              placeholder="Enter phone number (e.g., 0755123456, 0655123456)"
              placeholderTextColor={colors.textSecondary}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
              maxLength={13}
              autoFocus={false}
            />
            
            {/* Network Detection Feedback */}
            {detectedNetwork && detectedNetwork !== 'Invalid number' && detectedNetwork !== 'Unknown' && (
              <View style={[styles.networkBadge, { backgroundColor: '#10B981' + '15', borderColor: '#10B981' }]}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={[styles.networkText, { color: '#10B981' }]}>
                  {detectedNetwork} 
                </Text>
              </View>
            )}
            
            {phoneNumber && phoneNumber.length >= 3 && detectedNetwork === 'Invalid number' && (
              <View style={[styles.networkBadge, { backgroundColor: '#EF4444' + '15', borderColor: '#EF4444' }]}>
                <Ionicons name="close-circle" size={18} color="#EF4444" />
                <Text style={[styles.networkText, { color: '#EF4444' }]}>
                  Invalid phone number format
                </Text>
              </View>
            )}
            
            {phoneNumber && phoneNumber.length >= 3 && detectedNetwork === 'Unknown' && (
              <View style={[styles.networkBadge, { backgroundColor: '#F59E0B' + '15', borderColor: '#F59E0B' }]}>
                <Ionicons name="warning" size={18} color="#F59E0B" />
                <Text style={[styles.networkText, { color: '#F59E0B' }]}>
                  Unknown network - verify your number
                </Text>
              </View>
            )}
            
            {normalizedPhone && (
              <View style={styles.normalizedInfo}>
                <Text style={[styles.normalizedLabel, { color: colors.textSecondary }]}>
                  Formatted: <Text style={{ color: colors.text, fontWeight: '500' }}>{normalizedPhone}</Text>
                </Text>
              </View>
            )}
            
            {/* Supported Networks Info */}
            <View style={[styles.supportedNetworks, { backgroundColor: colors.background }]}>
              <Text style={[styles.supportedLabel, { color: colors.textSecondary }]}>
                Supported Networks:
              </Text>
              <View style={styles.networkChips}>
                <View style={[styles.networkChip, { backgroundColor: '#00A86B' + '15' }]}>
                  <Text style={[styles.networkChipText, { color: '#00A86B' }]}>Vodacom</Text>
                </View>
                <View style={[styles.networkChip, { backgroundColor: '#FF6B00' + '15' }]}>
                  <Text style={[styles.networkChipText, { color: '#FF6B00' }]}>Tigo</Text>
                </View>
                <View style={[styles.networkChip, { backgroundColor: '#E60012' + '15' }]}>
                  <Text style={[styles.networkChipText, { color: '#E60012' }]}>Airtel</Text>
                </View>
                <View style={[styles.networkChip, { backgroundColor: '#9C27B0' + '15' }]}>
                  <Text style={[styles.networkChipText, { color: '#9C27B0' }]}>Halotel</Text>
                </View>
                <View style={[styles.networkChip, { backgroundColor: '#2196F3' + '15' }]}>
                  <Text style={[styles.networkChipText, { color: '#2196F3' }]}>TTCL</Text>
                </View>
                <View style={[styles.networkChip, { backgroundColor: '#FFC107' + '15' }]}>
                  <Text style={[styles.networkChipText, { color: '#FFC107' }]}>Smile</Text>
                </View>
              </View>
            </View>
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
      )}

      {/* Payment Button - Only show when order is loaded */}
      {!isLoadingOrder && !orderError && orderData && (
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
                {canProceed ? 'Proceed to Payment' : 'Enter phone number'}
              </Text>
              {canProceed && detectedNetwork && (
                <Text style={[
                  styles.paymentButtonSubtext,
                  { color: 'rgba(255, 255, 255, 0.7)' }
                ]}>
                  via {detectedNetwork} • {formatCurrency(total)}
                </Text>
              )}
            </View>
            <View style={styles.paymentButtonArrow}>
              <Ionicons
                name={canProceed ? "phone-portrait" : "phone-portrait-outline"}
                size={20}
                color={canProceed ? 'white' : '#6b7280'}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
      )}

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
                Payment via {detectedNetwork || 'Mobile Money'}
              </Text>
              <View style={[styles.modalPhoneInfo, { backgroundColor: colors.background, marginTop: 16, padding: 12, borderRadius: 8 }]}>
                <Text style={[styles.modalPhoneLabel, { color: colors.textSecondary, fontSize: 12 }]}>
                  Phone Number:
                </Text>
                <Text style={[styles.modalPhoneNumber, { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 4 }]}>
                  {normalizedPhone}
                </Text>
              </View>
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
                    {detectedNetwork || 'Mobile Money'}
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
  // Phone Input Styles
  phoneInputContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneInput: {
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    fontWeight: '500',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  networkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  normalizedInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  normalizedLabel: {
    fontSize: 13,
  },
  supportedNetworks: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  supportedLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  networkChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  networkChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  networkChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paymentButtonSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  modalPhoneInfo: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  modalPhoneLabel: {
    fontSize: 12,
  },
  modalPhoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBanner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    // Styles defined inline
  },
  statusSubtitle: {
    // Styles defined inline
  },
});