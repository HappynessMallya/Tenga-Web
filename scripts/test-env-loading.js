#!/usr/bin/env node

/**
 * Test Environment Loading
 * Simulates how Expo loads environment variables
 */

// Load dotenv first (same as app.config.js)
require('dotenv/config');

console.log('🔍 Environment Variables After dotenv/config:');
console.log('==============================================');

console.log('EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL || 'NOT SET');
console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Test the getEnvVar function from app.config.js
const getEnvVar = (key, defaultValue = null, required = false) => {
  const value = process.env[key];

  if (required && (!value || value.trim() === '')) {
    console.error(`❌ Missing required environment variable: ${key}`);
    console.error(`💡 Please add ${key}=your_value to your .env file`);
    if (!defaultValue) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return value || defaultValue;
};

console.log('\n🧪 Testing getEnvVar function:');
console.log('getEnvVar("EXPO_PUBLIC_API_BASE_URL"):', getEnvVar('EXPO_PUBLIC_API_BASE_URL'));
console.log('getEnvVar("EXPO_PUBLIC_API_URL"):', getEnvVar('EXPO_PUBLIC_API_URL'));
console.log('getEnvVar("NODE_ENV"):', getEnvVar('NODE_ENV'));

console.log('\n📱 What the app.config.js will expose:');
console.log('Constants.expoConfig.extra.EXPO_PUBLIC_API_BASE_URL:', getEnvVar('EXPO_PUBLIC_API_BASE_URL', 'https://lk-7ly1.onrender.com/api'));
console.log('Constants.expoConfig.extra.EXPO_PUBLIC_API_URL:', getEnvVar('EXPO_PUBLIC_API_URL', 'https://lk-7ly1.onrender.com/api'));
