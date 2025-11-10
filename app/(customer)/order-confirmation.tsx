// @ts-ignore
import { router } from 'expo-router';
import { TouchableOpacity, View, Text, SafeAreaView, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';

// Mocked order details (can later be replaced by API response)
const mockOrder = {
  pickupTime: "Tonight, 7PM-9PM",
  paymentStatus: "Confirmed",
  status: "Scheduled",
};

export default function OrderConfirmationScreen() {
  const { colors } = useTheme();

  const handleViewOrders = () => {
    router.push('/(customer)/tabs/orders');
  };

  const handleGoHome = () => {
    router.push('/(customer)/tabs/home');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={60} color="white" />
        </View>

        {/* Success Message */}
        <Text style={[styles.title, { color: colors.text }]}>Order Confirmed!</Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your laundry order has been successfully placed. We'll notify you when your pickup is
          scheduled.
        </Text>

        {/* Order Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>Order Details</Text>
          <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
            • Pickup: {mockOrder.pickupTime}
          </Text>
          <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
            • Payment: {mockOrder.paymentStatus}
          </Text>
          <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
            • Status: {mockOrder.status}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleViewOrders}
          >
            <Text style={styles.primaryButtonText}>View Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={handleGoHome}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Roboto-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  detailsCard: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 8,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
  },
});
