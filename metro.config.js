// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true, // Enables CSS for web builds
});

// Add SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// Add custom asset extensions (optional)
config.resolver.assetExts.push(
  'db', 'sqlite', 'sql',
  'pdf', 'doc', 'docx',
  'csv', 'txt'
);

// Add custom resolver to mock react-native-maps on web
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, realModuleName, platform, moduleName) => {
  const moduleToResolve = realModuleName || moduleName;
  
  // Mock react-native-maps on web
  if (platform === 'web' && moduleToResolve === 'react-native-maps') {
    return {
      filePath: path.resolve(__dirname, 'web-mocks', 'react-native-maps.tsx'),
      type: 'sourceFile',
    };
  }
  
  // Use original resolver for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, realModuleName, platform, moduleName);
  }
  
  return context.resolveRequest(context, realModuleName, platform);
};

// Add optional path aliases (if you're using them)
config.resolver.alias = {
  '@': './app',
  '@components': './app/components',
  '@utils': './app/utils',
  '@services': './app/lib/services',
  '@types': './app/types',
  '@constants': './app/constants',
  '@hooks': './app/hooks',
};

module.exports = config;
