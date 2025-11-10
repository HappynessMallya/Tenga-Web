require('dotenv/config');

// Helper function to get environment variable with validation
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

export default ({ config }) => ({
  ...config,
  name: 'Tenga',
  slug: 'tenga-laundry',
  version: '1.1.0',
  orientation: 'portrait',
  scheme: 'com.tengalaundry.app',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#9334ea',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.tengalaundry.app',
    buildNumber: '4',
  },
  android: {
    package: 'com.tengalaundry.app',
    versionCode: 5,
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#9334ea',
    },
    permissions: ['INTERNET'],
    intentFilters: [
      {
        action: 'VIEW',
        data: {
          scheme: 'com.tengalaundry.app',
          host: 'auth',
          pathPrefix: '/callback',
        },
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-splash-screen',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow Tenga to use your location to find nearby services.',
        locationAlwaysPermission: 'Allow Tenga to use your location in the background.',
        locationWhenInUsePermission: 'Allow Tenga to use your location to find nearby services.',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true
      }
    ],
  ],
  extra: {
    eas: {
      projectId: 'd9eb0553-4402-4fed-87b1-d324bcf57f8a',
    },
    expoRouter: {
      origin: 'app',
    },
    // Environment variables exposed to the app
    EXPO_PUBLIC_API_BASE_URL: getEnvVar('EXPO_PUBLIC_API_BASE_URL', 'https://lk-7ly1.onrender.com/api'),
    EXPO_PUBLIC_API_URL: getEnvVar('EXPO_PUBLIC_API_URL', 'https://lk-7ly1.onrender.com/api'),
  },
  updates: {
    url: "https://u.expo.dev/d9eb0553-4402-4fed-87b1-d324bcf57f8a"
  },
  runtimeVersion: {
    policy: "appVersion"
  },
});
