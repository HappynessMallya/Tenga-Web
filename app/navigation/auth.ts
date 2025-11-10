// @ts-nocheck
import { AuthStackParamList } from './types';

// Auth Stack Navigation Configuration
export const authStackScreens: Array<{
  name: keyof AuthStackParamList;
  title: string;
  headerShown?: boolean;
  component?: string;
}> = [
  {
    name: 'Welcome',
    title: 'Welcome',
    headerShown: false,
    component: 'WelcomeScreen',
  },
  {
    name: 'Auth',
    title: 'Authentication',
    headerShown: false,
    component: 'AuthScreen',
  },
];

// Auth Navigation Options
export const authNavigationOptions = {
  headerStyle: {
    backgroundColor: '#ffffff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTintColor: '#374151',
  headerTitleStyle: {
    fontWeight: 'bold' as const,
    fontSize: 18,
  },
  headerBackTitleVisible: false,
  cardStyle: {
    backgroundColor: '#ffffff',
  },
  gestureEnabled: true,
  animation: 'slide_from_right' as const,
};

// Auth Screen Options
export const authScreenOptions = {
  headerTransparent: false,
  headerBackTitle: '',
  headerLeftContainerStyle: {
    paddingLeft: 16,
  },
  headerRightContainerStyle: {
    paddingRight: 16,
  },
  headerTitleContainerStyle: {
    paddingHorizontal: 16,
  },
};
