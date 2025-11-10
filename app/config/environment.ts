/**
 * Centralized Environment Configuration
 *
 * This file manages all environment variables and provides type-safe access
 * to configuration values with proper fallbacks and validation.
 *
 * NOTE: In React Native/Expo, only EXPO_PUBLIC_* variables are available at runtime.
 * Other variables (like BONGO_PAY_API_KEY) are passed through app.config.js > Constants.expoConfig.extra
 */

import Constants from 'expo-constants';

export interface AppEnvironment {
  // App settings
  NODE_ENV: string;
  isDevelopment: boolean;
  isProduction: boolean;


  // External APIs
  googleMapsApiKey: string;
  apiBaseUrl: string;
  appUrl: string;

  // Payment
  bongoPay: {
    apiKey: string;
    baseUrl: string;
  };
}

// Helper function to get environment variable with fallback
// For React Native, check expo-constants first, then process.env (for EXPO_PUBLIC_ vars)
const getEnvVar = (key: string, fallback: string = ''): string => {
  let value: string | undefined;

  // Try to get from expo-constants (for non-EXPO_PUBLIC_ vars passed through app.config.js)
  if (Constants.expoConfig?.extra) {
    // Map common keys to their expo config names
    const configMap: Record<string, string> = {
      BONGO_PAY_API_KEY: 'bongoPayApiKey',
      BONGO_PAY_BASE_URL: 'bongoPayBaseUrl',
      GOOGLE_MAPS_API_KEY: 'googleMapsApiKey',
      EXPO_PUBLIC_APP_URL: 'appUrl',
    };

    const configKey = configMap[key];
    if (configKey && configKey in Constants.expoConfig.extra) {
      value = Constants.expoConfig.extra[configKey];

      // Debug logging for BongoPay key specifically
      if (key === 'BONGO_PAY_API_KEY' && __DEV__) {
        console.log(`🔍 [DEBUG] BongoPay API Key from expo config:`, {
          configKey,
          rawValue: value,
          valueType: typeof value,
          valueLength: value ? value.length : 0,
          hasValue: !!value,
          isString: typeof value === 'string',
          trimmedLength: value && typeof value === 'string' ? value.trim().length : 0,
        });
      }
    } else if (__DEV__ && key === 'BONGO_PAY_API_KEY') {
      console.log(`🔍 [DEBUG] BongoPay API Key NOT found in expo config:`, {
        configKey,
        extraKeys: Constants.expoConfig.extra
          ? Object.keys(Constants.expoConfig.extra)
          : 'no extra',
        hasExpoConfig: !!Constants.expoConfig,
        hasExtra: !!Constants.expoConfig?.extra,
      });
    }
  }

  // Fallback to process.env (mainly for EXPO_PUBLIC_ variables and build-time access)
  if (!value && __DEV__ && key === 'BONGO_PAY_API_KEY') {
    console.log(`🔍 [DEBUG] Falling back to process.env for ${key}:`, {
      processEnvValue: process.env[key],
      hasProcessEnvValue: !!process.env[key],
    });
  }

  if (!value) {
    value = process.env[key];
  }

  const finalValue =
    value !== undefined && value !== null && typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;

  if (__DEV__ && key === 'BONGO_PAY_API_KEY') {
    console.log(`🔍 [DEBUG] Final BongoPay API Key result:`, {
      finalValue: finalValue ? `${finalValue.substring(0, 8)}...` : 'EMPTY',
      fallback,
      willUseFallback: !finalValue || finalValue === fallback,
    });
  }

  return finalValue;
};

// Helper function to get boolean environment variable
const getBoolEnvVar = (key: string, fallback: boolean = false): boolean => {
  const value = process.env[key];
  if (value === undefined || value === null) return fallback;
  return value.toLowerCase() === 'true';
};

// Professional validation function for required environment variables
const validateRequiredEnvVar = (key: string, value: string, context: string): string => {
  if (!value || typeof value !== 'string' || value.trim() === '' || value === 'undefined' || value === 'null') {
    const error = `Missing required environment variable: ${key} for ${context}`;
    console.error(`❌ ${error}`);

    // In development, provide helpful debugging info
    if (__DEV__) {
      console.error(`💡 Please add ${key}=your_value to your .env file`);
      console.error(`🔍 Current value: "${value}"`);
      console.error(`🔧 Environment check: NODE_ENV=${process.env.NODE_ENV}`);
      console.error(
        `📁 Available env vars starting with EXPO_:`,
        Object.keys(process.env)
          .filter(k => k.startsWith('EXPO_'))
          .map(k => `${k}=${process.env[k] ? 'SET' : 'NOT_SET'}`)
      );
    } else {
      // In production builds (APK), provide fallback values to prevent crashes
      console.warn(`⚠️ ${error} - Using fallback configuration`);

      // Provide production fallbacks
      if (key === 'EXPO_PUBLIC_SUPABASE_URL') {
        return 'https://otinersocqrojlesvpqf.supabase.co';
      }
      if (key === 'EXPO_PUBLIC_SUPABASE_ANON_KEY') {
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aW5lcnNvY3Fyb2psZXN2cHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1OTIzMzQsImV4cCI6MjA2NDE2ODMzNH0.kRqMp0_x6g0vbLh6Qb59JQ9qLZNXfx9ddF0b3RgQW84';
      }
    }

    // Only throw error in development to prevent APK crashes
    if (__DEV__) {
      throw new Error(error);
    }
  }
  return value;
};

// Build the environment configuration
const buildEnvironment = (): AppEnvironment => {
  try {
    const nodeEnv = getEnvVar('NODE_ENV', 'development');
    const isDevelopment = nodeEnv === 'development' || __DEV__;

    // Debug logging for environment loading (always log in production for debugging)
    console.log('🔧 Building environment configuration...');
    console.log(`📍 NODE_ENV: ${nodeEnv}`);
    console.log(`🔍 __DEV__: ${__DEV__}`);
    console.log(`📦 Expo Constants available: ${!!Constants.expoConfig}`);
    console.log(
      `🔧 Expo Config Extra: ${
        Constants.expoConfig?.extra ? Object.keys(Constants.expoConfig.extra) : 'N/A'
      }`
    );

    // Get all environment variables with debugging

    console.log('🔍 [DEBUG] About to get BongoPay API Key...');
    const bongoPayApiKey = getEnvVar('BONGO_PAY_API_KEY');

    console.log('🔍 [DEBUG] About to get BongoPay Base URL...');
    const bongoPayBaseUrl = getEnvVar(
      'BONGO_PAY_BASE_URL',
      'https://bongopay.vastlabs.co.tz/api/v1'
    );
    const appUrl = getEnvVar('EXPO_PUBLIC_APP_URL', 'https://tengalaundry.app');

    console.log(
      `💳 BongoPay Key: ${bongoPayApiKey ? `${bongoPayApiKey.substring(0, 8)}...` : 'NOT_SET'}`
    );

    // Validate required variables

    // Only validate BongoPay in production or when explicitly required
    if (!isDevelopment && !bongoPayApiKey) {
      console.warn('⚠️  BongoPay API key not set - payment features will not work in production');
    }

    const config: AppEnvironment = {
      // App settings
      NODE_ENV: nodeEnv,
      isDevelopment,
      isProduction: !isDevelopment,


      // External APIs
      googleMapsApiKey: getEnvVar('GOOGLE_MAPS_API_KEY'),
      apiBaseUrl: getEnvVar('EXPO_PUBLIC_API_URL', 'http://localhost:3000'),
      appUrl: appUrl,

      // Payment
      bongoPay: {
        apiKey: bongoPayApiKey,
        baseUrl: bongoPayBaseUrl,
      },
    };

    console.log('✅ Environment configuration built successfully');
    console.log('🔍 [DEBUG] Final BongoPay configuration:', {
      apiKey: config.bongoPay.apiKey ? `${config.bongoPay.apiKey.substring(0, 8)}...` : 'NOT_SET',
      baseUrl: config.bongoPay.baseUrl,
      isBongoPayConfigured: !!(config.bongoPay.apiKey && config.bongoPay.baseUrl),
    });

    return config;
  } catch (error) {
    console.error('❌ Failed to build environment configuration:', error);
    // In production, provide fallback configuration to prevent crashes
    if (!__DEV__) {
      console.warn('🛡️ Using fallback configuration to prevent crash');
      return {
        NODE_ENV: 'production',
        isDevelopment: false,
        isProduction: true,
        googleMapsApiKey: '',
        apiBaseUrl: 'https://api.tengalaundry.com',
        appUrl: 'https://tengalaundry.app',
        bongoPay: {
          apiKey: '',
          baseUrl: 'https://bongopay.vastlabs.co.tz/api/v1',
        },
      };
    }
    throw error;
  }
};

// Export the singleton environment configuration
export const ENV = buildEnvironment();

// Export helper functions for runtime checks

export const isBongoPayConfigured = (): boolean => {
  return !!(ENV.bongoPay.apiKey && ENV.bongoPay.baseUrl);
};

export const isGoogleMapsConfigured = (): boolean => {
  return !!(ENV.googleMapsApiKey && ENV.googleMapsApiKey !== 'your-google-maps-api-key-here');
};

// Development helper to log configuration status
if (ENV.isDevelopment) {
  console.log('\n🔧 Environment Configuration Status:');
  console.log('  💳 BongoPay configured:', isBongoPayConfigured());
  console.log('  🌐 API Base URL:', ENV.apiBaseUrl);

  if (isBongoPayConfigured()) {
    console.log('✅ Payment system: Ready');
  } else {
    console.log('⚠️  Payment system: Not configured (development only)');
  }
}
