// @ts-ignore
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../providers/ThemeProvider';
import { useOrderStore } from '../store/orderStore';
import { DateTimePickerModal } from '../components/DateTimePickerModal';
import { LocationPicker } from '../components/LocationPicker';
import { formatDate, formatTime, getInitialPickupDate } from '../utils/orderCalculations';

export default function TimeLocationScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { 
    pickupDate,
    deliveryDate,
    location,
    notes,
    setOrderData,
    calculateDeliveryDate,
  } = useOrderStore();

  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);

  const canContinue = pickupDate && location && location.latitude !== undefined && location.longitude !== undefined && location.latitude !== 0 && location.longitude !== 0;

  useEffect(() => {
    // Set initial pickup date if not set
    if (!pickupDate) {
      const initialDate = getInitialPickupDate();
      setOrderData('pickupDate', initialDate);
      calculateDeliveryDate();
    }
  }, []);

  // Debug current state
  useEffect(() => {
    console.log('🔍 Time-Location Screen State:', {
      pickupDate: pickupDate ? formatDateTime(pickupDate) : 'Not set',
      location: location ? {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        isCurrentLocation: location.isCurrentLocation
      } : 'Not set'
    });
  }, [pickupDate, location]);

  const handleDateTimeConfirm = (date: Date, timeSlot: string) => {
    // Set time based on selected slot
    const timeSlots = {
      morning: { hour: 9, minute: 0 },
      afternoon: { hour: 14, minute: 0 },
      evening: { hour: 18, minute: 0 },
    };
    
    const selectedTime = timeSlots[timeSlot as keyof typeof timeSlots] || timeSlots.morning;
    date.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
    
    setOrderData('pickupDate', date);
    calculateDeliveryDate();
  };

  const handleLocationSelect = (locationData: any) => {
    console.log('📍 Location data received:', locationData);
    
    // Convert LocationData to Location format for Zustand store
    const locationForStore = {
      address: `${locationData.streetName}, ${locationData.city}, ${locationData.country}`,
      latitude: parseFloat(locationData.latitude),
      longitude: parseFloat(locationData.longitude),
      isCurrentLocation: true,
    };
    
    console.log('📍 Location converted for store:', locationForStore);
    setOrderData('location', locationForStore);
  };


  const handleContinue = () => {
    console.log('🚀 Continue button pressed');
    console.log('📅 Pickup date:', pickupDate);
    console.log('📍 Location:', location);
    
    if (!pickupDate) {
      Alert.alert('Error', 'Please select a pickup date and time.');
      return;
    }
    
    if (!location) {
      Alert.alert('Error', 'Please provide a pickup location.');
      return;
    }

    // Validate that location has valid GPS coordinates (required for pickup)
    if (location.latitude === undefined || location.longitude === undefined || 
        location.latitude === 0 || location.longitude === 0) {
      Alert.alert(
        'GPS Location Required', 
        'Please use "Get My Location" to get your precise GPS coordinates. This is required for accurate pickup service.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
      return;
    }

    console.log('✅ All validations passed, proceeding to summary');
    
    // Save notes
    setOrderData('notes', localNotes);
    
    // Navigate to order summary
    router.push('/(customer)/order-summary');
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Not set';
    return `${formatDate(date)}, ${formatTime(date)}`;
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
            Time & Location
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            Step 2 of 5
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        {/* <View style={[styles.instructionsCard, { backgroundColor: colors.card }]}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              Schedule Your Service
            </Text>
          </View>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            Choose your preferred pickup time and location. We'll calculate the estimated delivery based on your selected services.
          </Text>
        </View> */}

        {/* Pickup Date & Time */}
        <View style={[styles.timeCard, { backgroundColor: colors.card }]}>
          <View style={styles.timeCardHeader}>
            <View style={styles.timeIconContainer}>
              <Ionicons name="calendar" size={24} color="white" />
            </View>
            <View style={styles.timeCardInfo}>
              <Text style={[styles.timeCardTitle, { color: colors.text }]}>
                Pickup Schedule
              </Text>
              <Text style={[styles.timeCardSubtitle, { color: colors.textSecondary }]}>
                When would you like us to collect your items?
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.timeButton, { 
              backgroundColor: colors.background,
              borderColor: colors.border,
            }]}
            onPress={() => setShowDateTimePicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.timeButtonContent}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <View style={styles.timeButtonInfo}>
                <Text style={[styles.timeButtonLabel, { color: colors.text }]}>
                  {formatDateTime(pickupDate)}
                </Text>
                <Text style={[styles.timeButtonHint, { color: colors.textSecondary }]}>
                  Tap to change
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Delivery Estimate */}
        {deliveryDate && (
          <View style={[styles.deliveryCard, { backgroundColor: colors.card }]}>
            <View style={styles.deliveryCardHeader}>
              <View style={styles.deliveryIconContainer}>
                <Ionicons name="checkmark-circle" size={24} color="white" />
              </View>
              <View style={styles.deliveryCardInfo}>
                <Text style={[styles.deliveryCardTitle, { color: colors.text }]}>
                  Estimated Delivery
                </Text>
                <Text style={[styles.deliveryCardSubtitle, { color: colors.textSecondary }]}>
                  Based on your selected services
                </Text>
              </View>
            </View>
            
            <View style={[styles.deliveryInfo, { backgroundColor: colors.background }]}>
              <View style={styles.deliveryDateInfo}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <View style={styles.deliveryDateDetails}>
                  <Text style={[styles.deliveryDateLabel, { color: colors.text }]}>
                    {formatDateTime(deliveryDate)}
                  </Text>
                  <Text style={[styles.deliveryDateHint, { color: colors.textSecondary }]}>
                    Estimated delivery time
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Location */}
        <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
          <View style={styles.locationCardHeader}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="location" size={24} color="white" />
            </View>
            <View style={styles.locationCardInfo}>
              <Text style={[styles.locationCardTitle, { color: colors.text }]}>
                Pickup Location
              </Text>
              <Text style={[styles.locationCardSubtitle, { color: colors.textSecondary }]}>
                Where should we collect your items?
              </Text>
            </View>
          </View>
          
          <LocationPicker
            onLocationUpdate={handleLocationSelect}
          />
        </View>

        {/* Notes */}
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
                Any specific requirements? (Optional)
              </Text>
            </View>
          </View>
          
          <View style={[styles.notesInputContainer, { backgroundColor: colors.background }]}>
            <TextInput
              style={[styles.notesInput, { color: colors.text }]}
              placeholder="Add any special instructions..."
              placeholderTextColor={colors.textSecondary}
              value={localNotes}
              onChangeText={setLocalNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
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
            styles.continueButton,
            {
              backgroundColor: canContinue ? '#2c3e50' : '#e8e8e8',
              shadowColor: canContinue ? '#2c3e50' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: canContinue ? 0.2 : 0,
              shadowRadius: 8,
              elevation: canContinue ? 4 : 0,
            },
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <View style={styles.continueButtonContent}>
            <View style={styles.continueButtonLeft}>
              <Text
                style={[
                  styles.continueButtonText,
                  {
                    color: canContinue ? 'white' : '#6b7280',
                    fontWeight: canContinue ? '600' : '500',
                    letterSpacing: 0.5,
                  },
                ]}
              >
                {canContinue ? 'Continue to Payment' : 'Complete required fields'}
              </Text>
            </View>
            <View style={styles.continueButtonArrow}>
              <Ionicons
                name={canContinue ? "arrow-forward" : "arrow-forward-outline"}
                size={20}
                color={canContinue ? 'white' : '#6b7280'}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* DateTime Picker Modal */}
      <DateTimePickerModal
        visible={showDateTimePicker}
        onClose={() => setShowDateTimePicker(false)}
        onConfirm={handleDateTimeConfirm}
        initialDate={pickupDate || getInitialPickupDate()}
      />
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
  helpButton: {
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
  timeCard: {
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
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  timeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#2c3e50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeCardInfo: {
    flex: 1,
  },
  timeCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  timeCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeButtonInfo: {
    marginLeft: 12,
  },
  timeButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  timeButtonHint: {
    fontSize: 12,
    marginTop: 2,
  },
  deliveryCard: {
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
  deliveryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  deliveryIconContainer: {
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
  deliveryCardInfo: {
    flex: 1,
  },
  deliveryCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  deliveryCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  deliveryInfo: {
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  deliveryDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryDateDetails: {
    marginLeft: 12,
  },
  deliveryDateLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  deliveryDateHint: {
    fontSize: 12,
    marginTop: 2,
  },
  locationCard: {
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
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  locationIconContainer: {
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
  locationCardInfo: {
    flex: 1,
  },
  locationCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  locationCardSubtitle: {
    fontSize: 14,
    lineHeight: 18,
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
  notesInputContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  notesInput: {
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  continueButtonLeft: {
    flex: 1,
    paddingRight: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  continueButtonArrow: {
    paddingLeft: 8,
  },
});
