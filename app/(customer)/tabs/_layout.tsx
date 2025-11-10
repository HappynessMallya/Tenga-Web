// @ts-nocheck
import { Tabs } from 'expo-router/tabs';
import { useSafeTheme } from '../../hooks/useSafeTheme';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import JSX icon components
import HomeIcon from '../../../assets/icons/home.jsx';
import OrdersIcon from '../../../assets/icons/orders.jsx';
import ProfileIcon from '../../../assets/icons/profile.jsx';
import ServicesPricingIcon from '../../../assets/icons/services&pricing.jsx';

export default function CustomerTabsLayout() {
  const { colors } = useSafeTheme();

  // No navigation hooks here; this component is a layout wrapper

  return (
    <>
      <StatusBar style="dark" backgroundColor="white" />
      <Tabs
        screenOptions={{
          headerShown: false, // Hide the top navigation header
          tabBarActiveTintColor: '#9334ea', // Purple for active
          tabBarInactiveTintColor: '#6B7280', // Dark grey for inactive
          tabBarStyle: {
            height: 80,
            paddingBottom: 1,
            paddingTop: 8,
            backgroundColor: 'white',
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
          tabBarIconStyle: {
            marginBottom: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 2,
            marginBottom: 4,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size = 24, focused }) => (
              <View style={{ alignItems: 'center', position: 'relative' }}>
                {/* Indicator bar above icon */}
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: -10,
                      right: -10,
                      height: 3,
                      backgroundColor: '#9334ea',
                      borderRadius: 2,
                      zIndex: 1,
                    }}
                  />
                )}
                <View style={{ width: size, height: size, marginTop: focused ? 4 : 0 }}>
                  <HomeIcon width={size} height={size} color={color} />
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, size = 24, focused }) => (
              <View style={{ alignItems: 'center', position: 'relative' }}>
                {/* Indicator bar above icon */}
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: -10,
                      right: -10,
                      height: 3,
                      backgroundColor: '#9334ea',
                      borderRadius: 2,
                      zIndex: 1,
                    }}
                  />
                )}
                <View style={{ width: size, height: size, marginTop: focused ? 4 : 0 }}>
                  <OrdersIcon width={size} height={size} color={color} />
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="service-pricing"
          options={{
            title: 'Service & Pricing',
            tabBarIcon: ({ color, size = 24, focused }) => (
              <View style={{ alignItems: 'center', position: 'relative' }}>
                {/* Indicator bar above icon */}
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: -10,
                      right: -10,
                      height: 3,
                      backgroundColor: '#9334ea',
                      borderRadius: 2,
                      zIndex: 1,
                    }}
                  />
                )}
                <View style={{ width: size, height: size, marginTop: focused ? 4 : 0 }}>
                  <ServicesPricingIcon width={size} height={size} color={color} />
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size = 24, focused }) => (
              <View style={{ alignItems: 'center', position: 'relative' }}>
                {/* Indicator bar above icon */}
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: -10,
                      right: -10,
                      height: 3,
                      backgroundColor: '#9334ea',
                      borderRadius: 2,
                      zIndex: 1,
                    }}
                  />
                )}
                <View style={{ width: size, height: size, marginTop: focused ? 4 : 0 }}>
                  <ProfileIcon width={size} height={size} color={color} />
                </View>
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
