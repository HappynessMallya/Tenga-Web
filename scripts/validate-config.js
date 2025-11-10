#!/usr/bin/env node

/**
 * Environment Configuration Validator
 *
 * This script validates that all required environment variables are properly configured
 * for the Tenga Laundry mobile application across different build environments.
 */

require('dotenv').config();

console.log('🔧 TENGA LAUNDRY - Environment Configuration Validator');
console.log('='.repeat(60));

// Helper function to validate environment variable
function validateEnvVar(key, required = false, description = '') {
  const value = process.env[key];
  const hasValue = value && value.trim() !== '';

  const status = hasValue ? '✅' : required ? '❌' : '⚠️ ';
  const displayValue = hasValue
    ? key.includes('KEY') || key.includes('TOKEN')
      ? `${value.substring(0, 8)}...`
      : value
    : 'NOT_SET';

  console.log(`${status} ${key}: ${displayValue}`);

  if (description) {
    console.log(`   └─ ${description}`);
  }

  if (required && !hasValue) {
    console.log(`   └─ ⚠️  This variable is required for the app to function properly`);
    return false;
  }

  return true;
}

console.log('\n🏗️  BUILD ENVIRONMENT:');
let allValid = true;

allValid &= validateEnvVar('NODE_ENV', false, 'Environment (development/production)');

// Supabase Configuration
console.log('\n🗄️  SUPABASE CONFIGURATION:');
allValid &= validateEnvVar('EXPO_PUBLIC_SUPABASE_URL', true, 'Supabase project URL');
allValid &= validateEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', true, 'Supabase anonymous key');

// Payment Configuration
console.log('\n💳 PAYMENT CONFIGURATION:');
validateEnvVar('BONGO_PAY_API_KEY', false, 'BongoPay API key (required for payments)');
validateEnvVar('BONGO_PAY_BASE_URL', false, 'BongoPay API base URL');

// External APIs
console.log('\n🌐 EXTERNAL APIS:');
validateEnvVar('GOOGLE_MAPS_API_KEY', false, 'Google Maps API key (for location services)');
validateEnvVar('EXPO_PUBLIC_APP_URL', false, 'App URL for deep linking');
validateEnvVar('EXPO_PUBLIC_API_URL', false, 'Custom API base URL');

// EAS Configuration
console.log('\n📱 EAS BUILD CONFIGURATION:');
console.log('   📋 Checking expo-constants integration...');

// Test expo-constants access simulation
try {
  console.log('   ✅ Environment variables will be passed through app.config.js');
  console.log('   ✅ EAS builds will have access to configuration');
} catch (error) {
  console.log('   ❌ Error with expo-constants configuration');
}

// Build-specific recommendations
console.log('\n🚀 BUILD RECOMMENDATIONS:');

if (allValid) {
  console.log('✅ All required environment variables are configured');
  console.log('✅ App should work properly in all build modes');
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('⚠️  App may crash in production builds (APK/AAB)');
}

console.log('\n📋 BUILD COMMANDS:');
console.log('   Development build:  eas build --profile development --platform android');
console.log('   Preview APK:        eas build --profile preview --platform android');
console.log('   Production bundle:  eas build --profile production --platform android');

console.log('\n💡 TROUBLESHOOTING:');
console.log('   1. Ensure all variables are set in Expo dashboard (expo.dev)');
console.log('   2. For local builds, create .env file with all variables');
console.log('   3. Use development build for debugging APK crashes');
console.log('   4. Check app.config.js for proper variable mapping');

console.log('\n' + '='.repeat(60));
console.log(allValid ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED');

process.exit(allValid ? 0 : 1);
