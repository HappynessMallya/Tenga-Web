// Navigation types for Tenga Laundry App

export type RootStackParamList = {
  // Auth screens
  '(auth)': undefined;
  '(auth)/welcome': undefined;
  '(auth)/signin': undefined;
  '(auth)/signup': undefined;
  
  // Customer screens
  '(customer)': undefined;
  '(customer)/tabs': undefined;
  '(customer)/tabs/home': undefined;
  '(customer)/tabs/orders': undefined;
  '(customer)/tabs/service-pricing': undefined;
  '(customer)/tabs/account': undefined;
  '(customer)/schedule-pickup': undefined;
  '(customer)/service-type': undefined;
  '(customer)/time-location': undefined;
  '(customer)/order-summary': undefined;
  '(customer)/payment': undefined;
  '(customer)/order-confirmation': undefined;
  '(customer)/order-tracking': undefined;
  '(customer)/notifications': undefined;
  '(customer)/service-items': undefined;
  '(customer)/order/[id]/review': { id: string };
  
  // Vendor screens
  '(vendor)': undefined;
  '(vendor)/tabs': undefined;
  '(vendor)/dashboard': undefined;
  '(vendor)/orders': undefined;
  '(vendor)/profile': undefined;
  
  // Delivery screens
  '(delivery)': undefined;
  '(delivery)/tabs': undefined;
  '(delivery)/dashboard': undefined;
  '(delivery)/orders': undefined;
  '(delivery)/profile': undefined;
  
  // Root screens
  index: undefined;
  '+not-found': undefined;
};

export type AuthStackParamList = {
  welcome: undefined;
  signin: undefined;
  signup: undefined;
};

export type CustomerStackParamList = {
  tabs: undefined;
  'schedule-pickup': undefined;
  'service-type': undefined;
  'time-location': undefined;
  'order-summary': undefined;
  payment: undefined;
  'order-confirmation': undefined;
  'order-tracking': undefined;
  notifications: undefined;
  'service-items': undefined;
  'order/[id]/review': { id: string };
};

export type CustomerTabsParamList = {
  home: undefined;
  orders: undefined;
  'service-pricing': undefined;
  account: undefined;
};

export type VendorStackParamList = {
  tabs: undefined;
  dashboard: undefined;
  orders: undefined;
  profile: undefined;
};

export type DeliveryStackParamList = {
  tabs: undefined;
  dashboard: undefined;
  orders: undefined;
  profile: undefined;
};

// Navigation prop types
export type NavigationProp<T extends keyof RootStackParamList> = {
  navigate: (screen: T, params?: RootStackParamList[T]) => void;
  goBack: () => void;
  replace: (screen: T, params?: RootStackParamList[T]) => void;
  push: (screen: T, params?: RootStackParamList[T]) => void;
  pop: () => void;
  popToTop: () => void;
  canGoBack: () => boolean;
  isFocused: () => boolean;
};

// Route prop types
export type RouteProp<T extends keyof RootStackParamList> = {
  key: string;
  name: T;
  params?: RootStackParamList[T];
};

// Screen options type
export type ScreenOptions = {
  title?: string;
  headerShown?: boolean;
  headerTitle?: string;
  headerBackTitle?: string;
  headerBackTitleVisible?: boolean;
  headerLeft?: () => React.ReactNode;
  headerRight?: () => React.ReactNode;
  headerStyle?: object;
  headerTitleStyle?: object;
  headerTintColor?: string;
  headerBackImage?: () => React.ReactNode;
  presentation?: 'card' | 'modal' | 'transparentModal' | 'containedModal' | 'containedTransparentModal' | 'fullScreenModal' | 'formSheet';
  animation?: 'default' | 'fade' | 'flip' | 'none' | 'simple_push' | 'slide_from_bottom' | 'slide_from_right' | 'slide_from_left';
  gestureEnabled?: boolean;
  gestureDirection?: 'horizontal' | 'vertical' | 'horizontal-inverted' | 'vertical-inverted';
};
