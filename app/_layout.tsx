// Fixed imports for better type safety
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
// Services
// UI-only build: backend/services removed

// Components
import ErrorBoundary from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
// import { NotificationSystem } from './components/NotificationSystem'; // Removed - using NotificationProvider instead
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { QueryProvider } from './providers/QueryProvider';

// Styles
import '../global.css';

// NativeWind StyleSheet - Configure at module level with proper fallback
try {
  const { NativeWindStyleSheet } = require('nativewind');
  NativeWindStyleSheet.setOutput({
    default: 'native',
  });
  console.log('✅ NativeWind configured successfully');
} catch (error: any) {
  console.warn(
    '⚠️ NativeWind configuration failed, continuing without it:',
    error?.message || error
  );
  // App should continue working without NativeWind
}


// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

// Global OAuth token storage for cross-component access
(global as any).oauthTokens = null;

// Component that uses theme and renders the Stack
function ThemedStack() {
  // Default fallback colors
  const fallbackColors = {
    backgroundSecondary: '#F9FAFB',
    background: '#FFFFFF',
    primary: '#9334ea',
    text: '#2D3436',
    textSecondary: '#636E72',
    border: '#DFE6E9',
    card: '#FFFFFF',
  };

  let colors = fallbackColors;

  try {
    const theme = useTheme();
    if (theme && theme.colors) {
      colors = { ...fallbackColors, ...theme.colors };
    }
  } catch (error: any) {
    console.warn(
      'ThemedStack: Theme context not available, using fallback colors:',
      error?.message || error
    );
    colors = fallbackColors;
  }

  return (
    <ErrorBoundary>
      <StatusBar style="dark" backgroundColor="white" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.backgroundSecondary || '#F9FAFB' },
          animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="(auth)"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="(customer)" />
        <Stack.Screen
          name="+not-found"
          options={{
            title: 'Page Not Found',
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [loaded] = useFonts({
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
  });

  // Handle deep links for OAuth callbacks - moved outside useEffect
  // const handleDeepLink = useCallback(async () => {
  //   // UI-only: ignore OAuth deep links
  //   return;
  // }, [isAppReady]);

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing Tenga Laundry App...');

        // AuthManager initializes automatically when imported
        console.log('✅ Auth manager ready');

        // UI-only: skip network, permissions, notifications initialization

        console.log('✅ App initialization complete');
      } catch (error: any) {
        console.error('❌ App initialization error:', error);
        console.error('❌ Error details for APK debugging:', {
          message: error?.message || 'Unknown error',
          stack: error?.stack || 'No stack trace',
          name: error?.name || 'UnknownError',
        });
        // App should still work with limited functionality
      } finally {
        if (isMounted) {
          setIsAppReady(true);
          // Don't hide splash screen here - let the router handle it
          console.log('✅ App ready, splash screen will be hidden by router');
        }
      }
    };

    // Add delay to ensure router is ready
    const timer = setTimeout(() => {
      initializeApp();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []); // Removed isAppReady dependency to avoid infinite loop

  // Deep link handling temporarily disabled to isolate trim error
  useEffect(() => {
    if (!isAppReady) return;
    console.log('🔗 Deep link handling disabled for debugging');
    // TODO: Re-enable after fixing trim error
  }, [isAppReady]);

  // Hide splash screen when app is ready and fonts are loaded
  useEffect(() => {
    const maybeHide = async () => {
      if (isAppReady && loaded) {
        try {
          await SplashScreen.hideAsync();
          console.log('🟢 Splash screen hidden');
        } catch (e) {
          console.warn('SplashScreen.hideAsync failed:', (e as any)?.message || e);
        }
      }
    };
    maybeHide();
  }, [isAppReady, loaded]);

  // Show splash screen until app is ready and fonts are loaded
  if (!isAppReady || !loaded) {
    // Keep splash screen visible until everything is ready
    return null; // This keeps the native splash screen visible
  }

  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <GlobalErrorHandler>
            <ThemeProvider>
              <NotificationProvider>
                <ErrorBoundary>
                  <SafeAreaProvider>
                    <ThemedStack />
                  </SafeAreaProvider>
                </ErrorBoundary>
              </NotificationProvider>
            </ThemeProvider>
          </GlobalErrorHandler>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
