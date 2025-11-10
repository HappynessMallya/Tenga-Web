/**
 * Axios Instance Configuration
 * Centralized API client with interceptors for authentication and error handling
 */

import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get API base URL from environment
// On web, use proxy server to avoid CORS issues
const getApiBaseUrl = (): string => {
  // On web platform, use proxy server (runs on same origin, no CORS issues)
  if (Platform.OS === 'web') {
    // Check if we're in development (proxy should be running)
    const isDev = __DEV__ || process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // Use local proxy server (bypasses CORS)
      const proxyUrl = 'http://localhost:3001/api';
      console.log('🌐 [Web Dev] Using proxy server to avoid CORS:', proxyUrl);
      console.log('💡 Make sure proxy is running: npm run web:proxy');
      console.log('💡 Or run both together: npm run web:dev');
      return proxyUrl;
    }
    
    // In production, use direct URL or relative path (for Vercel/Netlify rewrites)
    const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL;
    if (fromEnv) {
      // If using Vercel/Netlify rewrites, you can use relative path '/api'
      // Otherwise use full URL from env
      console.log('🌐 [Web Production] Using API URL:', fromEnv);
      return fromEnv;
    }
  }
  
  // For native platforms, use direct API URL
  // Try from expo constants first (for non-EXPO_PUBLIC_ vars)
  const fromConstants = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL;
  if (fromConstants) {
    console.log('🌐 Using API URL from Constants:', fromConstants);
    return fromConstants;
  }
  
  // Fallback to process.env for EXPO_PUBLIC_ variables
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    console.log('🌐 Using API URL from process.env:', fromEnv);
    return fromEnv;
  }
  
  // Final fallback
  const fallback = 'https://lk-7ly1.onrender.com/api';
  console.log('🌐 Using fallback API URL:', fallback);
  return fallback;
};

// Create Axios instance with web-specific CORS configuration
const axiosConfig: any = {
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // Increased to 15 seconds for better reliability
};

// Add CORS configuration for web (don't send credentials)
if (Platform.OS === 'web') {
  axiosConfig.withCredentials = false;
}

const API = axios.create(axiosConfig);

// Log the API base URL for debugging
console.log('🌐 API Base URL configured:', getApiBaseUrl());
console.log('🔍 Environment variables:', {
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  fromConstants: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL
});

// Platform-aware storage for tokens
const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem('userToken');
    } else {
      return await SecureStore.getItemAsync('userToken');
    }
  } catch (error) {
    console.warn('Failed to get token:', error);
    return null;
  }
};

// Request interceptor - Attach token automatically if available
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();

      const fullUrl = `${config.baseURL}${config.url}`;
      console.log('🔐 AxiosInterceptor: Request interceptor triggered');
      console.log('🌐 Request URL:', config.url);
      console.log('🌐 Full URL:', fullUrl);
      console.log('📝 Request method:', config.method);
      console.log('🌍 Platform:', Platform.OS);
      console.log('📦 Request headers:', config.headers);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ AxiosInterceptor: Token attached to request');
        console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');
      } else {
        console.log('❌ AxiosInterceptor: No token found');
      }
      
      // Log request data for debugging
      if (config.data) {
        console.log('📤 Request data:', typeof config.data === 'string' ? config.data : JSON.stringify(config.data));
      }
    } catch (error) {
      console.warn('❌ AxiosInterceptor: Failed to retrieve token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ AxiosInterceptor: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors globally
API.interceptors.response.use(
  (response) => {
    console.log('📦 AxiosInterceptor: Response received');
    console.log('📊 Response status:', response.status);
    console.log('🌐 Response URL:', response.config.url);
    return response;
  },
  async (error) => {
    console.log('❌ AxiosInterceptor: Response error occurred');
    console.log('📊 Error status:', error.response?.status);
    console.log('🌐 Error URL:', error.config?.url);
    console.log('📄 Error data:', error.response?.data);
    
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Clear stored token (platform-aware)
        if (Platform.OS === 'web') {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
        } else {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userData');
        }
        
        // You can dispatch a logout action here if using Redux/Zustand
        console.log('Token expired, user should be logged out');
        
        // Optionally redirect to login screen
        // This would need to be handled by your navigation system
        
      } catch (clearError) {
        console.warn('Failed to clear stored credentials:', clearError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error:', error.message);
      console.error('🔍 Network error details:', {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
        timeout: error.config?.timeout,
        platform: Platform.OS,
      });
      
      // Test API connectivity
      console.log('🔍 Testing API connectivity...');
      console.log('🌐 Base URL:', error.config?.baseURL);
      console.log('🌐 Full URL:', error.config?.baseURL + error.config?.url);
      
      // Provide more specific error messages
      const isCorsError = 
        error.code === 'NETWORK_ERROR' || 
        error.message === 'Network Error' || 
        error.message.includes('CORS') ||
        error.message.includes('Failed to fetch') ||
        (Platform.OS === 'web' && !error.response);
        
      if (isCorsError) {
        // CORS error on web
        if (Platform.OS === 'web') {
          error.userMessage = 'Unable to connect to the server. This may be a CORS (Cross-Origin) issue. Please check if the API server allows requests from this domain.';
          console.error('🚫 CORS Error Detected!');
          console.error('📋 Error details:', {
            code: error.code,
            message: error.message,
            url: error.config?.baseURL + error.config?.url,
            method: error.config?.method,
          });
          console.error('💡 Solution: The server needs to include CORS headers:');
          console.error('   Access-Control-Allow-Origin: * (or your domain)');
          console.error('   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
          console.error('   Access-Control-Allow-Headers: Content-Type, Authorization');
          console.error('🔍 Check browser Network tab for OPTIONS preflight request');
          console.error('🌐 Try testing the API directly:', error.config?.baseURL + error.config?.url);
        } else {
          error.userMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        }
      } else if (error.code === 'ECONNABORTED') {
        error.userMessage = 'Request timed out. The server is taking too long to respond. Please try again.';
      } else if (error.code === 'ENOTFOUND') {
        error.userMessage = 'Server not found. Please check your internet connection and API URL configuration.';
      } else {
        error.userMessage = 'Network error occurred. Please check your connection and try again.';
      }
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status, error.response.data);
      // You can show a server error toast here
    }

    return Promise.reject(error);
  }
);

export default API;
