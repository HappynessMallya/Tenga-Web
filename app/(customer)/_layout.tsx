import { Stack } from 'expo-router/stack';
import { useTheme } from '../providers/ThemeProvider';

export default function CustomerLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="tabs"
        options={{
          title: 'Customer Dashboard',
        }}
      />
      <Stack.Screen
        name="schedule-pickup"
        options={{
          title: 'Schedule Pickup',
        }}
      />
      <Stack.Screen
        name="service-type"
        options={{
          title: 'Select Service Type',
        }}
      />
      <Stack.Screen
        name="time-location"
        options={{
          title: 'Time & Location',
        }}
      />
      <Stack.Screen
        name="order-summary"
        options={{
          title: 'Order Summary',
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Payment',
        }}
      />
      <Stack.Screen
        name="order-confirmation"
        options={{
          title: 'Order Confirmation',
        }}
      />
      <Stack.Screen
        name="order-tracking"
        options={{
          title: 'Order Tracking',
        }}
      />
      <Stack.Screen
        name="service-items"
        options={{
          title: 'Service Items',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="order/[id]/review"
        options={{
          title: 'Review Order',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
