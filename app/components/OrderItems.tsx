// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { OrderItem } from '../types/order';

interface OrderItemsProps {
  items: OrderItem[];
  showPricing?: boolean;
}

export const OrderItems: React.FC<OrderItemsProps> = ({ items, showPricing = true }) => {
  const { colors } = useTheme();

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'TZS 0';
    }
    return `TZS ${amount.toLocaleString()}`;
  };

  const renderItem = ({ item }: { item: OrderItem }) => (
    <View style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.item_name}</Text>
        <Text style={[styles.itemDetails, { color: colors.textSecondary }]}>
          Quantity: {item.quantity}
        </Text>
        {item.special_instructions && (
          <Text style={[styles.instructions, { color: colors.textSecondary }]}>
            Instructions: {item.special_instructions}
          </Text>
        )}
      </View>
      {showPricing && (
        <View style={styles.pricing}>
          <Text style={[styles.price, { color: colors.text }]}>{formatCurrency(item.price)}</Text>
          <Text style={[styles.subtotal, { color: colors.textSecondary }]}>
            Subtotal: {formatCurrency(item.price * item.quantity)}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Items</Text>
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.item_name}-${index}`}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  instructions: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  pricing: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtotal: {
    fontSize: 12,
    marginTop: 2,
  },
});
