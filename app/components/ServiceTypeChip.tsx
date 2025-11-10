import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { ServiceType } from '../store/orderStore';

interface ServiceTypeChipProps {
  service: ServiceType;
  onToggle: (serviceId: string) => void;
}

export const ServiceTypeChip: React.FC<ServiceTypeChipProps> = ({
  service,
  onToggle,
}) => {
  const { colors } = useTheme();

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

  const getServiceColor = (serviceId: string): string => {
    switch (serviceId) {
      case 'wash-fold':
        return '#3B82F6'; // Blue
      case 'dry-clean':
        return '#9334ea'; // Purple
      case 'iron-only':
        return '#F59E0B'; // Orange
      default:
        return colors.primary;
    }
  };

  const serviceColor = getServiceColor(service.id);
  const iconName = getServiceIcon(service.id);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: service.selected ? serviceColor : colors.card,
          borderColor: service.selected ? serviceColor : colors.border,
        },
      ]}
      onPress={() => onToggle(service.id)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: service.selected ? 'white' : serviceColor + '20',
            },
          ]}
        >
          <Ionicons
            name={iconName as any}
            size={20}
            color={service.selected ? serviceColor : serviceColor}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.serviceName,
              {
                color: service.selected ? 'white' : colors.text,
              },
            ]}
          >
            {service.name}
          </Text>
          <Text
            style={[
              styles.processingTime,
              {
                color: service.selected ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
              },
            ]}
          >
            {service.processingHours}h processing
          </Text>
        </View>

        {service.selected && (
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  processingTime: {
    fontSize: 14,
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
});
