/**
 * Authentication Service
 * Handles user registration, login, and authentication-related API calls
 */

import API from '../api/axiosInstance';

// Types for API requests and responses
export interface SignUpPayload {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  countryCode: string;
  roles: 'CUSTOMER' | 'DRIVER' | 'CLEANER';
}

export interface SignInPayload {
  phoneNumber: string;
  password: string;
  countryCode: string;
}

export interface User {
  id: string;
  uuid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  role: 'CUSTOMER' | 'DRIVER' | 'CLEANER';
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  customerProfile?: {
    id: string;
    userId: string;
    loyaltyPoints: number;
    defaultPaymentMethod: string | null;
    createdAt: string;
    updatedAt: string;
  };
  driverProfile?: any;
  cleanerProfile?: any;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user: User;
}

// Auth service functions
export const authService = {
  /**
   * Register a new user
   */
  registerUser: async (payload: SignUpPayload): Promise<AuthResponse> => {
    try {
      const response = await API.post('/auth/signup', payload);
      return response.data;
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid registration data');
      } else if (error.response?.status === 409) {
        throw new Error('User already exists with this phone number or email');
      } else if (error.response?.status === 500) {
        throw new Error('Server error during registration');
      } else if (!error.response) {
        // Network error
        const userMessage = error.userMessage || 'Unable to connect to the server. Please check your internet connection and try again.';
        throw new Error(userMessage);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  },

  /**
   * Sign in an existing user
   */
  loginUser: async (payload: SignInPayload): Promise<AuthResponse> => {
    try {
      console.log('🔄 Attempting to sign in user...');
      console.log('📱 Phone number:', payload.phoneNumber);
      console.log('🌐 API endpoint: /auth/signIn');
      
      const response = await API.post('/auth/signIn', payload);
      
      console.log('✅ Sign in successful');
      console.log('📊 Response status:', response.status);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid phone number or password');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.status === 500) {
        throw new Error('Server error during login');
      } else if (!error.response) {
        // Network error
        const userMessage = error.userMessage || 'Unable to connect to the server. Please check your internet connection and try again.';
        throw new Error(userMessage);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  },

  /**
   * Verify user token (optional - for token validation)
   */
  verifyToken: async (): Promise<{ valid: boolean; user?: User }> => {
    try {
      const response = await API.get('/auth/verify');
      return { valid: true, user: response.data.user };
    } catch (error: any) {
      console.error('Token verification failed:', error);
      return { valid: false };
    }
  },

  /**
   * Logout user (clear local data)
   */
  logout: async (): Promise<void> => {
    try {
      console.log('🔄 Starting logout process...');
      
      // Clear local storage
      const { clearAllData } = await import('../utils/storage');
      await clearAllData();
      
      // Optionally call logout endpoint if available
      // await API.post('/auth/logout');
      
      console.log('✅ Logout completed successfully');
    } catch (error: any) {
      console.error('❌ Logout failed:', error);
      
      // Provide specific error messages
      let errorMessage = 'Logout failed';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      throw new Error(errorMessage);
    }
  },
};
