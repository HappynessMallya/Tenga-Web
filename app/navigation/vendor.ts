// @ts-nocheck
import { VendorTabParamList, VendorStackParamList } from './types';

// Vendor Tab Navigation Configuration
export const vendorTabScreens: Array<{
  name: keyof VendorTabParamList;
  title: string;
  iconName: string;
  component?: string;
}> = [
  {
    name: 'Dashboard',
    title: 'Dashboard',
    iconName: 'speedometer',
    component: 'VendorDashboardScreen',
  },
  {
    name: 'Orders',
    title: 'Orders',
    iconName: 'list',
    component: 'VendorOrdersScreen',
  },
  {
    name: 'Analytics',
    title: 'Analytics',
    iconName: 'analytics',
    component: 'VendorAnalyticsScreen',
  },
  {
    name: 'user',
    title: 'user',
    iconName: 'person',
    component: 'Vendoruserscreen',
  },
];

// Vendor Stack Navigation Configuration
export const vendorStackScreens: Array<{
  name: keyof VendorStackParamList;
  title: string;
  headerShown?: boolean;
  component?: string;
}> = [
  {
    name: 'Tabs',
    title: 'Vendor Dashboard',
    headerShown: false,
  },
  {
    name: 'OrderDetails',
    title: 'Order Details',
    headerShown: true,
    component: 'OrderDetailsScreen',
  },
  {
    name: 'ServiceManagement',
    title: 'Manage Services',
    headerShown: true,
    component: 'ServiceManagementScreen',
  },
  {
    name: 'EarningsReport',
    title: 'Earnings Report',
    headerShown: true,
    component: 'EarningsReportScreen',
  },
  {
    name: 'CustomerReviews',
    title: 'Customer Reviews',
    headerShown: true,
    component: 'CustomerReviewsScreen',
  },
  {
    name: 'BusinessSettings',
    title: 'Business Settings',
    headerShown: true,
    component: 'BusinessSettingsScreen',
  },
  {
    name: 'VerificationStatus',
    title: 'Verification Status',
    headerShown: true,
    component: 'VerificationStatusScreen',
  },
  {
    name: 'ServiceAreaMap',
    title: 'Service Area',
    headerShown: true,
    component: 'ServiceAreaMapScreen',
  },
  {
    name: 'PricingSettings',
    title: 'Pricing Settings',
    headerShown: true,
    component: 'PricingSettingsScreen',
  },
];

// Vendor Navigation Options
export const vendorNavigationOptions = {
  headerStyle: {
    backgroundColor: '#059669',
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
  tabBarActiveTintColor: '#059669',
  tabBarInactiveTintColor: '#6b7280',
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
};
