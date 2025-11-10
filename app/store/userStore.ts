/**
 * User Store (Zustand)
 * Global state management for user authentication and profile data
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../services/authService';
import { saveToken, getToken, removeToken, saveUser, getUser, removeUser } from '../utils/storage';

interface UserState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        set({ token });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      login: async (user: User, token: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Save to secure storage
          await saveToken(token);
          await saveUser(user);
          
          // Update state
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Login state update failed:', error);
          set({
            isLoading: false,
            error: 'Failed to save login data',
          });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          
          // Clear secure storage
          await removeToken();
          await removeUser();
          
          // Clear state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout failed:', error);
          set({
            isLoading: false,
            error: 'Logout failed',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true });
          
          // Check for stored credentials
          const token = await getToken();
          const user = await getUser();
          
          if (token && user) {
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Failed to initialize authentication',
          });
        }
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        user: state.user ? {
          id: state.user.id,
          uuid: state.user.uuid,
          fullName: state.user.fullName,
          email: state.user.email,
          phoneNumber: state.user.phoneNumber,
          countryCode: state.user.countryCode,
          role: state.user.role,
          verified: state.user.verified,
        } : null,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
