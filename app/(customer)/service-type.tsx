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
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { useOrderStore, ServiceType } from '../store/orderStore';
import { ServiceTypeChip } from '../components/ServiceTypeChip';
import { formatCurrency } from '../utils/orderCalculations';

export default function ServiceTypeScreen() {
  const { colors } = useTheme();
  const { 
    serviceTypes, 
    laundryItems,
    toggleServiceType,
    calculateTotal,
    calculateDeliveryDate,
    total 
  } = useOrderStore();

  const [localServiceTypes, setLocalServiceTypes] = useState<ServiceType[]>(serviceTypes);

  useEffect(() => {
    setLocalServiceTypes(serviceTypes);
  }, [serviceTypes]);

  const handleServiceToggle = (serviceId: string) => {
    const updatedServices = localServiceTypes.map(service =>
      service.id === serviceId
        ? { ...service, selected: !service.selected }
        : service
    );
    setLocalServiceTypes(updatedServices);
    
    // Update store
    toggleServiceType(serviceId);
  };

  const handleContinue = () => {
    const selectedServices = localServiceTypes.filter(service => service.selected);
    
    if (selectedServices.length === 0) {
      Alert.alert(
        'No Service Selected',
        'Please select at least one service type to continue.'
      );
      return;
    }

    // Navigate to time and location screen
    router.push('/(customer)/time-location');
  };

  const selectedServicesCount = localServiceTypes.filter(service => service.selected).length;
  const selectedItemsCount = laundryItems.length;
  const maxProcessingHours = selectedServicesCount > 0 
    ? Math.max(...localServiceTypes.filter(s => s.selected).map(s => s.processingHours))
    : 24;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            Select Service Type
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Step 2 of 6
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.card }]}>
          <Ionicons name="construct" size={20} color={colors.primary} />
          <Text style={[styles.instructionsText, { color: colors.text }]}>
            Choose one or more services for your laundry. You can select multiple services for different items.
          </Text>
        </View>

        {/* Service Types */}
        <View style={styles.servicesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Services
          </Text>
          
          {localServiceTypes.map((service) => (
            <ServiceTypeChip
              key={service.id}
              service={service}
              onToggle={handleServiceToggle}
            />
          ))}
        </View>

        {/* Processing Time Info */}
        {selectedServicesCount > 0 && (
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Processing Time
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Your laundry will be ready in {maxProcessingHours} hours after pickup.
                {selectedServicesCount > 1 && ' (Longest processing time applies)'}
              </Text>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Order Summary
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Items Selected
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {selectedItemsCount} item{selectedItemsCount !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Services Selected
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {selectedServicesCount} service{selectedServicesCount !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>
              Total Amount
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primary, fontWeight: 'bold' }]}>
              {formatCurrency(total)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: selectedServicesCount > 0 ? colors.primary : colors.border,
            },
          ]}
          onPress={handleContinue}
          disabled={selectedServicesCount === 0}
        >
          <Text
            style={[
              styles.continueButtonText,
              {
                color: selectedServicesCount > 0 ? 'white' : colors.textSecondary,
              },
            ]}
          >
            Continue ({selectedServicesCount} service{selectedServicesCount !== 1 ? 's' : ''})
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={selectedServicesCount > 0 ? 'white' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
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
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  servicesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
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
  footer: {
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
