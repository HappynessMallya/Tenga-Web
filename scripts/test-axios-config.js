#!/usr/bin/env node

/**
 * Test Axios Configuration
 * Simulates the axiosInstance.ts configuration
 */

// Load dotenv first
require('dotenv/config');

// Simulate Constants from expo-constants
const Constants = {
  expoConfig: {
    extra: {
      EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://lk-7ly1.onrender.com/api',
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://lk-7ly1.onrender.com/api',
    }
  }
};

// Simulate the getApiBaseUrl function from axiosInstance.ts
const getApiBaseUrl = () => {
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

console.log('🔍 Axios Configuration Test');
console.log('============================');

console.log('\n📋 Available Environment Variables:');
console.log('process.env.EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
console.log('process.env.EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);

console.log('\n📱 Constants.expoConfig.extra:');
console.log('EXPO_PUBLIC_API_BASE_URL:', Constants.expoConfig.extra.EXPO_PUBLIC_API_BASE_URL);
console.log('EXPO_PUBLIC_API_URL:', Constants.expoConfig.extra.EXPO_PUBLIC_API_URL);

console.log('\n🌐 getApiBaseUrl() result:');
const apiUrl = getApiBaseUrl();
console.log('Final API URL:', apiUrl);

console.log('\n✅ Development App Should Use:', apiUrl);
