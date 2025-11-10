import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { LaundryItem, ServiceType, Location } from '../store/orderStore';
import { formatCurrency, formatDate, formatTime } from '../utils/orderCalculations';

interface SummaryCardProps {
  laundryItems: LaundryItem[];
  serviceTypes: ServiceType[];
  pickupDate: Date | null;
  deliveryDate: Date | null;
  location: Location | null;
  notes: string;
  total: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  laundryItems,
  serviceTypes,
  pickupDate,
  deliveryDate,
  location,
  notes,
  total,
}) => {
  const { colors } = useTheme();

  const selectedServices = serviceTypes.filter(service => service.selected);
  const selectedItems = laundryItems.filter(item => item.quantity > 0);

  const getServiceIcon = (serviceId: string): string => {
    switch (serviceId) {
      case 'wash-fold':
        return 'water';
      case 'dry-clean':
        return 'shirt';
      case 'iron-only':
        return 'flame';
      default:
        return 'checkmark-circle';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Laundry Items */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shirt" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Laundry Items
          </Text>
        </View>
        
        {selectedItems.length > 0 ? (
          selectedItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemDetails, { color: colors.textSecondary }]}>
                  {item.quantity} × {formatCurrency(item.price)}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.text }]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No items selected
          </Text>
        )}
      </View>

      {/* Service Types */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="construct" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Services
          </Text>
        </View>
        
        {selectedServices.length > 0 ? (
          selectedServices.map((service) => (
            <View key={service.id} style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
                <Ionicons 
                  name={getServiceIcon(service.id) as any} 
                  size={16} 
                  color={colors.primary} 
                />
                <Text style={[styles.serviceName, { color: colors.text }]}>
                  {service.name}
                </Text>
              </View>
              <Text style={[styles.processingTime, { color: colors.textSecondary }]}>
                {service.processingHours}h
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No services selected
          </Text>
        )}
      </View>

      {/* Schedule */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Schedule
          </Text>
        </View>
        
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleInfo}>
            <Ionicons name="arrow-up" size={16} color={colors.success} />
            <Text style={[styles.scheduleLabel, { color: colors.text }]}>
              Pickup
            </Text>
          </View>
          <Text style={[styles.scheduleTime, { color: colors.text }]}>
            {pickupDate ? `${formatDate(pickupDate)}, ${formatTime(pickupDate)}` : 'Not set'}
          </Text>
        </View>
        
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleInfo}>
            <Ionicons name="arrow-down" size={16} color={colors.primary} />
            <Text style={[styles.scheduleLabel, { color: colors.text }]}>
              Delivery
            </Text>
          </View>
          <Text style={[styles.scheduleTime, { color: colors.text }]}>
            {deliveryDate ? `${formatDate(deliveryDate)}, ${formatTime(deliveryDate)}` : 'Not set'}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Location
          </Text>
        </View>
        
        <Text style={[styles.locationText, { color: colors.text }]}>
          {location?.address || 'No location set'}
        </Text>
        
        {location?.isCurrentLocation && (
          <View style={styles.currentLocationBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={[styles.currentLocationText, { color: colors.success }]}>
              Current Location
            </Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {notes && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Special Instructions
            </Text>
          </View>
          
          <Text style={[styles.notesText, { color: colors.text }]}>
            {notes}
          </Text>
        </View>
      )}

      {/* Total */}
      <View style={[styles.totalSection, { backgroundColor: colors.primary }]}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  processingTime: {
    fontSize: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  scheduleTime: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  currentLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  currentLocationText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  totalSection: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  totalAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});