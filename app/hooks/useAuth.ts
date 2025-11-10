/**
 * Authentication Hook
 * Custom hook that integrates auth service with user store
 */

import { useCallback } from 'react';
import { useUserStore } from '../store/userStore';
import { authService, SignUpPayload, SignInPayload } from '../services/authService';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
    setError,
    clearError,
    initializeAuth,
  } = useUserStore();

  // Register new user
  const register = useCallback(async (payload: SignUpPayload) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await authService.registerUser(payload);
      
      if (response.token && response.user) {
        await storeLogin(response.user, response.token);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storeLogin, setLoading, setError, clearError]);

  // Sign in existing user
  const signIn = useCallback(async (payload: SignInPayload) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await authService.loginUser(payload);
      
      if (response.token && response.user) {
        await storeLogin(response.user, response.token);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storeLogin, setLoading, setError, clearError]);

  // Sign out user
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      clearError(); // Clear any existing errors
      
      // Perform logout operations
      await authService.logout();
      await storeLogout();
      
      console.log('✅ Sign out completed successfully');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      
      // Provide specific error messages
      let errorMessage = 'Sign out failed';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      throw error; // Re-throw to allow calling components to handle
    } finally {
      setLoading(false);
    }
  }, [storeLogout, setLoading, setError, clearError]);

  // Initialize authentication on app start
  const initialize = useCallback(async () => {
    try {
      await initializeAuth();
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      setError('Failed to initialize authentication');
    }
  }, [initializeAuth, setError]);

  // Clear error message
  const clearAuthError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    register,
    signIn,
    signOut,
    initialize,
    clearAuthError,
  };
};