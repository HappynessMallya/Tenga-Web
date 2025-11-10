// @ts-nocheck
import { CustomerTabParamList, CustomerStackParamList } from './types';

// Customer Tab Navigation Configuration
export const customerTabScreens: Array<{
  name: keyof CustomerTabParamList;
  title: string;
  iconName: string;
  component?: string;
}> = [
  {
    name: 'Home',
    title: 'Home',
    iconName: 'home',
    component: 'CustomerHomeScreen',
  },
  {
    name: 'Orders',
    title: 'Orders',
    iconName: 'list',
    component: 'CustomerOrdersScreen',
  },
  {
    name: 'user',
    title: 'user',
    iconName: 'person',
    component: 'Customeruserscreen',
  },
];

// Customer Stack Navigation Configuration
export const customerStackScreens: Array<{
  name: keyof CustomerStackParamList;
  title: string;
  headerShown?: boolean;
  component?: string;
}> = [
  {
    name: 'Tabs',
    title: 'Tenga Laundry',
    headerShown: false,
  },
  {
    name: 'OrderDetails',
    title: 'Order Details',
    headerShown: true,
    component: 'OrderDetailsScreen',
  },
  {
    name: 'OrderTracking',
    title: 'Track Order',
    headerShown: true,
    component: 'OrderTrackingScreen',
  },
  {
    name: 'Payment',
    title: 'Payment',
    headerShown: true,
    component: 'PaymentScreen',
  },
  {
    name: 'VendorDetails',
    title: 'Vendor Details',
    headerShown: true,
    component: 'VendorDetailsScreen',
  },
  {
    name: 'ServiceSelection',
    title: 'Select Services',
    headerShown: true,
    component: 'ServiceSelectionScreen',
  },
  {
    name: 'OrderSummary',
    title: 'Order Summary',
    headerShown: true,
    component: 'OrderSummaryScreen',
  },
  {
    name: 'ServiceItems',
    title: 'Select Items',
    headerShown: true,
    component: 'ServiceItemsScreen',
  },
  {
    name: 'SchedulePickup',
    title: 'Schedule Pickup',
    headerShown: true,
    component: 'SchedulePickupScreen',
  },
  {
    name: 'AddressSelection',
    title: 'Select Address',
    headerShown: true,
    component: 'AddressSelectionScreen',
  },
  {
    name: 'OrderConfirmation',
    title: 'Order Confirmation',
    headerShown: true,
    component: 'OrderConfirmationScreen',
  },
  {
    name: 'PaymentMethods',
    title: 'Payment Methods',
    headerShown: true,
    component: 'PaymentMethodsScreen',
  },
  {
    name: 'NotificationSettings',
    title: 'Notifications',
    headerShown: true,
    component: 'NotificationSettingsScreen',
  },
  {
    name: 'Support',
    title: 'Support',
    headerShown: true,
    component: 'SupportScreen',
  },
  {
    name: 'OrderHistory',
    title: 'Order History',
    headerShown: true,
    component: 'OrderHistoryScreen',
  },
];

// Customer Navigation Options
export const customerNavigationOptions = {
  headerStyle: {
    backgroundColor: '#2563eb',
  },
  headerTintColor: '#ffffff',
  headerTitleStyle: {
    fontWeight: 'bold' as const,
  },
  tabBarStyle: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
  },
  tabBarActiveTintColor: '#2563eb',
  tabBarInactiveTintColor: '#6b7280',
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
};
