import { OrderTrackingScreen } from '../screens/customer/OrderTracking';
import { SafeAreaView } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

export default function OrderTrackingRoute() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <OrderTrackingScreen />
    </SafeAreaView>
  );
}
