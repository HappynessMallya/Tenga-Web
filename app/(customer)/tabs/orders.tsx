import { OrderHistoryScreen } from '../../screens/customer/OrderHistory';
import { SafeAreaView } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

export default function OrdersScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <OrderHistoryScreen />
    </SafeAreaView>
  );
}
