// @ts-ignore
import { router } from 'expo-router';
import { useAuth } from './hooks/useAuth';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading, initialize } = useAuth();

  // Initialize auth on app start
  React.useEffect(() => {
    initialize();
  }, [initialize]);

  // Route based on authentication state
  React.useEffect(() => {
    if (!isLoading) {
      // Add a small delay to ensure Root Layout is fully mounted
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(customer)/tabs/home');
        } else {
          router.replace('/(auth)/welcome');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

  // Always return the same JSX structure
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#9334ea" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
