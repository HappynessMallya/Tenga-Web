// @ts-ignore
import { router } from 'expo-router';
import { useState } from 'react';
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
import { formatCurrency } from '../utils/orderCalculations';
import { orderCreationService } from '../services/orderCreationService';
import { CreateOrderRequest } from '../types/orderCreation';
import { vendorService } from '../services/vendorService';

export default function OrderSummaryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Get order data from order store
  const { 
    pickupDate,
    location,
    notes,
    resetOrder,
    setOrderId,
  } = useOrderStore();

  // Get garment data from garment config store
  const { 
    selectedGarments,
    getTotalPrice,
  } = useGarmentConfig();

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Calculate totals
  const total = getTotalPrice();
  const selectedItemsCount = selectedGarments.reduce((sum, item) => sum + item.quantity, 0);

  if (__DEV__) {
    console.log('📊 Order Summary State:', {
      selectedGarments: selectedGarments.length,
      total,
      selectedItemsCount,
      pickupDate: pickupDate ? 'Set' : 'Not set',
      location: location ? {
        hasLocation: true,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.city,
        country: location.country
      } : 'Not set',
      buttonDisabled: isCreatingOrder || !location || location.latitude === undefined || location.latitude === null || location.longitude === undefined || location.longitude === null || location.latitude === 0 || location.longitude === 0
    });
  }

  const handleEditItems = () => {
    router.push('/(customer)/schedule-pickup');
  };

  const handleEditTimeLocation = () => {
    router.push('/(customer)/time-location');
  };

  // Helper function to convert garment type names to short form IDs
  const getGarmentTypeShortId = (garmentTypeName: string): string => {
    const mapping: { [key: string]: string } = {
      'Shirts': 'shirts',
      'Sweater': 'sweater', 
      'Jacket': 'jacket',
      'Tshirt': 'tshirt',
      'Blouse': 'blouse',
      'Pants': 'pants',
      'Dress': 'dress',
      'T-Shirt': 'tshirt',
      'T-Shirts': 'tshirt',
    };
    
    const mappedId = mapping[garmentTypeName];
    console.log(`🔍 Garment mapping: "${garmentTypeName}" → "${mappedId}"`);
    
    return mappedId || garmentTypeName.toLowerCase().replace(/\s+/g, '_');
  };

  // Separate function for order creation to allow retry after vendor check
  const proceedWithOrderCreation = async () => {
    setIsCreatingOrder(true);
    try {
      console.log('🛒 Creating order from order summary...');
      
      if (!location) {
        throw new Error('Location is required');
      }
      
      // Prepare order data from stores
      const orderData: CreateOrderRequest = {
        items: selectedGarments.map(garment => ({
          garmentTypeId: getGarmentTypeShortId(garment.garmentTypeName), // Convert to short form ID
          serviceType: garment.serviceType,
          description: `${garment.garmentTypeName} - ${garment.serviceType.replace('_', ' ')}`,
          quantity: garment.quantity,
          weightLbs: 0.5, // Default weight per item
          price: garment.unitPrice
        })),
        customerLocation: {
          latitude: location.latitude?.toString() || '0',
          longitude: location.longitude?.toString() || '0',
          description: location.address || `Location at ${location.latitude}, ${location.longitude}`,
          city: location.city || location.address?.split(',')?.[1]?.trim() || 'Dar es Salaam', // Use stored city or extract from address
          country: location.country || location.address?.split(',')?.[2]?.trim() || 'Tanzania'
        },
        preferredPickupTimeStart: pickupDate?.toISOString() || new Date().toISOString(),
        preferredPickupTimeEnd: new Date((pickupDate?.getTime() || Date.now()) + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        preferredDeliveryTimeStart: new Date((pickupDate?.getTime() || Date.now()) + 24 * 60 * 60 * 1000).toISOString(), // 24 hours later
        preferredDeliveryTimeEnd: new Date((pickupDate?.getTime() || Date.now()) + 26 * 60 * 60 * 1000).toISOString(), // 26 hours later (2-hour delivery window)
        notes: notes || '',
        tags: []
      };

      console.log('📦 Order data prepared:', JSON.stringify(orderData, null, 2));
      console.log('🔍 Selected garments debug:', selectedGarments.map(g => ({
        garmentTypeId: g.garmentTypeId,
        garmentTypeName: g.garmentTypeName,
        serviceType: g.serviceType,
        categoryId: g.categoryId,
        categoryName: g.categoryName,
        convertedGarmentTypeId: getGarmentTypeShortId(g.garmentTypeName)
      })));
      console.log('🔍 Full garment objects:', selectedGarments);
      
      // Create order via API
      const orderResponse = await orderCreationService.createOrder(orderData);
      console.log('✅ Order created successfully:', orderResponse);
      
      const orderId = orderResponse.order.id;
      setCreatedOrderId(orderId);
      
      // Store orderId in Zustand for persistence across screens
      setOrderId(orderId);
      console.log('💾 OrderId stored in Zustand:', orderId);
      
      // Show success modal
      setShowOrderSuccessModal(true);
      setIsCreatingOrder(false);
      
    } catch (error: any) {
      console.error('❌ Order creation failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Show detailed error information
      let errorMessage = 'There was an error creating your order. Please try again.';
      
      if (error.response?.data) {
        console.log('📄 API Error Response:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = `Order validation failed:\n${error.response.data.errors.join('\n')}`;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Order Creation Failed', 
        errorMessage,
        [
          { text: 'OK', style: 'default' }
        ]
      );
      setIsCreatingOrder(false);
    }
  };

  const handleProceedToPayment = async () => {
    // Validate order data
    if (selectedGarments.length === 0) {
      Alert.alert('Error', 'Please select at least one garment item.');
      return;
    }

    if (!pickupDate) {
      Alert.alert('Error', 'Please select a pickup date and time.');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please provide a pickup location.');
      return;
    }

    // Validate that location has coordinates (required for order creation)
    if (!location.latitude || !location.longitude) {
      Alert.alert(
        'Location Required', 
        'Please go back and use "Get My Location" to get your precise coordinates. This is required for order processing.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
      return;
    }

    // Check for nearby vendors before creating order
    setIsCreatingOrder(true);
    console.log('🔍 Starting vendor check process...');
    
    try {
      console.log('🔍 Checking for nearby vendors...');
      console.log('📍 Location coordinates:', { 
        latitude: location.latitude, 
        longitude: location.longitude,
        type: typeof location.latitude,
        isNumber: !isNaN(Number(location.latitude))
      });
      
      // Validate coordinates are numbers
      const lat = Number(location.latitude);
      const lng = Number(location.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.error('❌ Invalid coordinates:', { latitude: location.latitude, longitude: location.longitude });
        setIsCreatingOrder(false);
        Alert.alert(
          'Invalid Location',
          'The location coordinates are invalid. Please try getting your location again.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Search for nearby vendors within 10000m radius with timeout
      let nearbyVendors;
      try {
        console.log('⏱️ Starting vendor search with 15-second timeout...');
        
        // Add timeout to vendor search (15 seconds)
        const vendorSearchPromise = vendorService.searchNearbyOffices(
          lat,
          lng,
          10000
        );
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => {
            console.error('⏰ Vendor search timeout reached!');
            reject(new Error('Vendor search timed out after 15 seconds'));
          }, 15000)
        );
        
        nearbyVendors = await Promise.race([vendorSearchPromise, timeoutPromise]) as any;
        console.log('✅ Vendor search completed successfully');
      } catch (vendorError: any) {
        console.error('❌ Vendor search failed:', vendorError);
        console.error('❌ Error type:', vendorError.constructor.name);
        console.error('❌ Error message:', vendorError.message);
        console.error('❌ Error stack:', vendorError.stack);
        
        setIsCreatingOrder(false);
        
        // Determine error message based on error type
        let errorDetails = 'Network error or timeout. Please check your internet connection.';
        if (vendorError.message?.includes('timeout')) {
          errorDetails = 'The request took too long. The server might be busy.';
        } else if (vendorError.code === 'ERR_NETWORK') {
          errorDetails = 'Network connection failed. Please check your internet.';
        } else if (vendorError.response?.status) {
          errorDetails = `Server error (${vendorError.response.status}). Please try again.`;
        }
        
        // If vendor search fails, show error but allow user to proceed anyway
        Alert.alert(
          'Vendor Check Failed',
          `We couldn't verify nearby vendors: ${errorDetails}\n\nYou can still proceed with your order, or try again later.`,
          [
            { 
              text: 'Cancel', 
              style: 'cancel',
              onPress: () => {
                console.log('🚫 User cancelled order after vendor check failure');
                setIsCreatingOrder(false);
              }
            },
            { 
              text: 'Proceed Anyway', 
              onPress: () => {
                console.log('✅ User chose to proceed despite vendor check failure');
                // Continue with order creation even without vendor check
                proceedWithOrderCreation();
              }
            }
          ]
        );
        return;
      }

      console.log('🔍 Vendor search result:', nearbyVendors);

      // Check if any vendors were found
      if (!nearbyVendors || !nearbyVendors.offices || nearbyVendors.offices.length === 0) {
        console.warn('⚠️ No vendors found in the area');
        setIsCreatingOrder(false);
        Alert.alert(
          'No Nearby Vendors',
          'We couldn\'t find any nearby vendors within 10km of your location. Please try a different location or contact support for assistance.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        return;
      }

      console.log(`✅ Found ${nearbyVendors.offices.length} nearby vendor(s):`, nearbyVendors.offices);
      
      // Proceed with order creation
      console.log('🎯 Proceeding to order creation...');
      proceedWithOrderCreation();
      
    } catch (error: any) {
      console.error('❌ Unexpected error in handleProceedToPayment:', error);
      setIsCreatingOrder(false);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? All your selections will be lost.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: () => {
            resetOrder();
            router.push('/(customer)/tabs/home');
          },
        },
      ]
    );
  };

  const handleProceedToPaymentAfterOrder = () => {
    setShowOrderSuccessModal(false);
    // Navigate to payment - orderId is now stored in Zustand
    router.push('/(customer)/payment');
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
            Order Summary
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            Step 4 of 5
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleCancelOrder} style={styles.cancelButton}>
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
              Review Your Order
            </Text>
          </View>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            Please review your order details below. You can edit items or schedule if needed.
          </Text>
        </View> */}

        {/* Edit Options */}
        <View style={[styles.editCard, { backgroundColor: colors.card }]}>
          <View style={styles.editCardHeader}>
            <View style={styles.editIconContainer}>
              <Ionicons name="create" size={24} color="white" />
            </View>
            <View style={styles.editCardInfo}>
              <Text style={[styles.editCardTitle, { color: colors.text }]}>
                Need to Make Changes?
              </Text>
              <Text style={[styles.editCardSubtitle, { color: colors.textSecondary }]}>
                Edit your selections if needed
              </Text>
            </View>
          </View>
          
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={[styles.editButton, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
              }]}
              onPress={handleEditItems}
              activeOpacity={0.7}
            >
              <Ionicons name="shirt" size={20} color={colors.primary} />
              <Text style={[styles.editButtonText, { color: colors.text }]}>
                Edit Items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.editButton, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
              }]}
              onPress={handleEditTimeLocation}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.editButtonText, { color: colors.text }]}>
                Edit Schedule
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.itemsCard, { backgroundColor: colors.card }]}>
          <View style={styles.itemsCardHeader}>
            <View style={styles.itemsIconContainer}>
              <Ionicons name="list" size={24} color="white" />
            </View>
            <View style={styles.itemsCardInfo}>
              <Text style={[styles.itemsCardTitle, { color: colors.text }]}>
                Selected Items
              </Text>
              <Text style={[styles.itemsCardSubtitle, { color: colors.textSecondary }]}>
                {selectedItemsCount} item{selectedItemsCount !== 1 ? 's' : ''} selected
              </Text>
            </View>
          </View>
          
          <View style={styles.itemsList}>
            {selectedGarments.map((garment, index) => (
              <View key={index} style={[styles.itemRow, { backgroundColor: colors.background }]}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]}>
                    {garment.garmentTypeName}
                  </Text>
                  <Text style={[styles.itemService, { color: colors.textSecondary }]}>
                    {garment.serviceType.replace('_', ' ')} - Qty: {garment.quantity}
                  </Text>
                </View>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                  {formatCurrency(garment.totalPrice)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pickup Details */}
        <View style={[styles.pickupCard, { backgroundColor: colors.card }]}>
          <View style={styles.pickupCardHeader}>
            <View style={styles.pickupIconContainer}>
              <Ionicons name="location" size={24} color="white" />
            </View>
            <View style={styles.pickupCardInfo}>
              <Text style={[styles.pickupCardTitle, { color: colors.text }]}>
                Pickup Details
              </Text>
              <Text style={[styles.pickupCardSubtitle, { color: colors.textSecondary }]}>
                When and where to collect
              </Text>
            </View>
          </View>
          
          <View style={styles.pickupDetails}>
            <View style={[styles.pickupItem, { backgroundColor: colors.background }]}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <View style={styles.pickupItemInfo}>
                <Text style={[styles.pickupItemLabel, { color: colors.text }]}>
                  Date & Time
                </Text>
                <Text style={[styles.pickupItemValue, { color: colors.textSecondary }]}>
                  {pickupDate ? `${pickupDate.toLocaleDateString()} at ${pickupDate.toLocaleTimeString()}` : 'Not set'}
                </Text>
              </View>
            </View>
            
            <View style={[styles.pickupItem, { backgroundColor: colors.background }]}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <View style={styles.pickupItemInfo}>
                <Text style={[styles.pickupItemLabel, { color: colors.text }]}>
                  Address
                </Text>
                <Text style={[styles.pickupItemValue, { color: colors.textSecondary }]}>
                  {location ? location.address : 'Not set'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Notes */}
        {notes && (
          <View style={[styles.notesCard, { backgroundColor: colors.card }]}>
            <View style={styles.notesCardHeader}>
              <View style={styles.notesIconContainer}>
                <Ionicons name="document-text" size={24} color="white" />
              </View>
              <View style={styles.notesCardInfo}>
                <Text style={[styles.notesCardTitle, { color: colors.text }]}>
                  Special Instructions
                </Text>
                <Text style={[styles.notesCardSubtitle, { color: colors.textSecondary }]}>
                  Additional requirements
                </Text>
              </View>
            </View>
            
            <View style={[styles.notesContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                {notes}
              </Text>
            </View>
          </View>
        )}

        {/* Total */}
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
                Final amount to pay
              </Text>
            </View>
          </View>
          
          <View style={[styles.totalAmount, { backgroundColor: colors.background }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatCurrency(total)}
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
              backgroundColor: isCreatingOrder ? '#e8e8e8' : '#2c3e50',
              shadowColor: isCreatingOrder ? 'transparent' : '#2c3e50',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isCreatingOrder ? 0 : 0.2,
              shadowRadius: 8,
              elevation: isCreatingOrder ? 0 : 4,
            },
          ]}
          onPress={handleProceedToPayment}
          disabled={isCreatingOrder || !location || location.latitude === undefined || location.latitude === null || location.longitude === undefined || location.longitude === null || location.latitude === 0 || location.longitude === 0}
          activeOpacity={0.8}
        >
          <View style={styles.paymentButtonContent}>
            <View style={styles.paymentButtonLeft}>
              <Text
                style={[
                  styles.paymentButtonText,
                  {
                    color: isCreatingOrder ? '#6b7280' : 'white',
                    fontWeight: isCreatingOrder ? '500' : '600',
                    letterSpacing: 0.5,
                  },
                ]}
              >
                {isCreatingOrder ? 'Creating Order...' : 'Create Order & Pay'}
              </Text>
              <Text style={[
                styles.paymentButtonTotal,
                { color: isCreatingOrder ? '#6b7280' : 'rgba(255, 255, 255, 0.8)' }
              ]}>
                {formatCurrency(total)}
              </Text>
            </View>
            <View style={styles.paymentButtonArrow}>
              <Ionicons
                name={isCreatingOrder ? "hourglass" : "card"}
                size={20}
                color={isCreatingOrder ? '#6b7280' : 'white'}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Order Success Modal */}
      <Modal
        visible={showOrderSuccessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOrderSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#27ae60" />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Order Created Successfully!
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Order #{createdOrderId?.slice(-4)} has been created and is ready for payment.
              </Text>
            </View>
            
            <View style={styles.modalContent}>
              <View style={[styles.orderInfoCard, { backgroundColor: colors.background }]}>
                <View style={styles.orderInfoRow}>
                  <Text style={[styles.orderInfoLabel, { color: colors.textSecondary }]}>
                    Order ID:
                  </Text>
                  <Text style={[styles.orderInfoValue, { color: colors.text }]}>
                    #{createdOrderId?.slice(-4)}
                  </Text>
                </View>
                <View style={styles.orderInfoRow}>
                  <Text style={[styles.orderInfoLabel, { color: colors.textSecondary }]}>
                    Total Amount:
                  </Text>
                  <Text style={[styles.orderInfoValue, { color: colors.primary }]}>
                    {formatCurrency(total)}
                  </Text>
                </View>
                <View style={styles.orderInfoRow}>
                  <Text style={[styles.orderInfoLabel, { color: colors.textSecondary }]}>
                    Items:
                  </Text>
                  <Text style={[styles.orderInfoValue, { color: colors.text }]}>
                    {selectedItemsCount} item{selectedItemsCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.proceedButton, { backgroundColor: colors.primary }]}
                onPress={handleProceedToPaymentAfterOrder}
              >
                <Text style={styles.modalButtonText}>
                  Proceed to Payment
                </Text>
                <Ionicons name="card" size={20} color="white" />
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
  editCard: {
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
  editCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  editIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f39c12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#f39c12',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editCardInfo: {
    flex: 1,
  },
  editCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  editCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  editButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  itemsCard: {
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
  itemsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  itemsIconContainer: {
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
  itemsCardInfo: {
    flex: 1,
  },
  itemsCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  itemsCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  itemsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemService: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickupCard: {
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
  pickupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  pickupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pickupCardInfo: {
    flex: 1,
  },
  pickupCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  pickupCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  pickupDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pickupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  pickupItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  pickupItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  pickupItemValue: {
    fontSize: 14,
    color: '#666',
  },
  notesCard: {
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
  notesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  notesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9b59b6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#9b59b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notesCardInfo: {
    flex: 1,
  },
  notesCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  notesCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  notesContent: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContent: {
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
    paddingVertical: 8,
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
  modalActions: {
    padding: 24,
    paddingTop: 16,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  proceedButton: {
    // backgroundColor set dynamically
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});