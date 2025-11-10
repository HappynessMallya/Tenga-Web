// @ts-nocheck
import { DeliveryTabParamList, DeliveryStackParamList } from './types';

// Delivery Tab Navigation Configuration
export const deliveryTabScreens: Array<{
  name: keyof DeliveryTabParamList;
  title: string;
  iconName: string;
  component?: string;
}> = [
  {
    name: 'Dashboard',
    title: 'Dashboard',
    iconName: 'speedometer',
    component: 'DeliveryDashboardScreen',
  },
  {
    name: 'Orders',
    title: 'Orders',
    iconName: 'list',
    component: 'DeliveryOrdersScreen',
  },
  {
    name: 'Map',
    title: 'Map',
    iconName: 'map',
    component: 'DeliveryMapScreen',
  },
  {
    name: 'user',
    title: 'user',
    iconName: 'person',
    component: 'Deliveryuserscreen',
  },
];

// Delivery Stack Navigation Configuration
export const deliveryStackScreens: Array<{
  name: keyof DeliveryStackParamList;
  title: string;
  headerShown?: boolean;
  component?: string;
}> = [
  {
    name: 'Tabs',
    title: 'Delivery Dashboard',
    headerShown: false,
  },
  {
    name: 'OrderDetails',
    title: 'Order Details',
    headerShown: true,
    component: 'OrderDetailsScreen',
  },
  {
    name: 'Navigation',
    title: 'Navigation',
    headerShown: false,
    component: 'NavigationScreen',
  },
  {
    name: 'EarningsReport',
    title: 'Earnings Report',
    headerShown: true,
    component: 'EarningsReportScreen',
  },
  {
    name: 'DeliveryHistory',
    title: 'Delivery History',
    headerShown: true,
    component: 'DeliveryHistoryScreen',
  },
  {
    name: 'VehicleSettings',
    title: 'Vehicle Settings',
    headerShown: true,
    component: 'VehicleSettingsScreen',
  },
  {
    name: 'RouteOptimization',
    title: 'Route Optimization',
    headerShown: true,
    component: 'RouteOptimizationScreen',
  },
];

// Delivery Navigation Options
export const deliveryNavigationOptions = {
  headerStyle: {
    backgroundColor: '#dc2626',
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
  tabBarActiveTintColor: '#dc2626',
  tabBarInactiveTintColor: '#6b7280',
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
}; 