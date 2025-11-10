/**
 * Authentication Initializer
 * Optimized component that handles authentication state initialization on app startup
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { initialize, isLoading, isAuthenticated, user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize initialization to prevent unnecessary re-runs
  const initializeAuth = useCallback(async () => {
    if (isInitialized) return; // Prevent double initialization
    
    console.log('🔐 AuthInitializer: Starting initialization...');
    try {
      await initialize();
      console.log('✅ AuthInitializer: Initialization complete');
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Memoize loading state to prevent unnecessary re-renders
  const shouldShowLoading = useMemo(() => {
    return !isInitialized || isLoading;
  }, [isInitialized, isLoading]);

  // Memoize auth state for logging
  const authState = useMemo(() => ({
    isAuthenticated,
    user: user?.fullName || 'No user',
    isLoading
  }), [isAuthenticated, user, isLoading]);

  // Log auth state changes only when meaningful
  useEffect(() => {
    if (isInitialized && !isLoading) {
      console.log('📊 AuthInitializer: Auth state:', authState);
    }
  }, [authState, isInitialized, isLoading]);

  // Show loading screen while initializing
  if (shouldShowLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9334ea" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
