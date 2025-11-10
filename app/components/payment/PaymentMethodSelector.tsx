// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { PaymentMethod } from '../../types/payment';
import { Icon } from '../common/Icon';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const { colors } = useTheme();

  const methods: { id: PaymentMethod; label: string; icon: string; description: string }[] = [
    {
      id: 'mobile_money',
      label: 'Mobile Money',
      icon: 'cellphone',
      description: 'M-Pesa, Airtel Money, Tigo Pesa',
    },
    // Bank transfer temporarily disabled - no proof of payment system yet
    // {
    //   id: 'card',
    //   label: 'Bank Transfer',
    //   icon: 'card',
    //   description: 'CRDB Bank Transfer',
    // },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Payment Method</Text>
      <View style={styles.methods}>
        {methods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.method,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => onSelect(method.id)}
          >
            <Icon name={method.icon} size={24} color={colors.primary} />
            <Text style={[styles.methodLabel, { color: colors.text }]}>{method.label}</Text>
            <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
              {method.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  methods: {
    // Single method, no need for row layout
  },
  method: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodLabel: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  methodDescription: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
  },
});
