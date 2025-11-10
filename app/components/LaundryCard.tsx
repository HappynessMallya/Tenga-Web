import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { LaundryItem } from '../store/orderStore';
import { formatCurrency } from '../utils/orderCalculations';

interface LaundryCardProps {
  item: LaundryItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove?: (itemId: string) => void;
}

export const LaundryCard: React.FC<LaundryCardProps> = ({
  item,
  onQuantityChange,
  onRemove,
}) => {
  const { colors } = useTheme();

  const handleIncrement = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 0) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.id);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Item Icon */}
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={item.icon as any} size={24} color={colors.primary} />
      </View>

      {/* Item Details */}
      <View style={styles.detailsContainer}>
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.category, { color: colors.textSecondary }]}>
          {item.category}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {formatCurrency(item.price)} each
        </Text>
      </View>

      {/* Quantity Controls */}
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={[styles.quantityButton, { backgroundColor: colors.border }]}
          onPress={handleDecrement}
          disabled={item.quantity === 0}
        >
          <Ionicons
            name="remove"
            size={16}
            color={item.quantity === 0 ? colors.textSecondary : colors.text}
          />
        </TouchableOpacity>

        <Text style={[styles.quantityText, { color: colors.text }]}>
          {item.quantity}
        </Text>

        <TouchableOpacity
          style={[styles.quantityButton, { backgroundColor: colors.primary }]}
          onPress={handleIncrement}
        >
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Remove Button */}
      {item.quantity > 0 && onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemove}
        >
          <Ionicons name="close-circle" size={20} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
  },
});
