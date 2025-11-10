/**
 * Production Build Configuration
 * Script to configure the app for production builds
 */

const fs = require('fs');
const path = require('path');

// Production environment variables
const productionEnv = `# Production Environment Configuration
# This file contains production environment variables

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://lk-7ly1.onrender.com/api

# App Configuration
NODE_ENV=production
EXPO_PUBLIC_ENVIRONMENT=production

# Build Configuration
EXPO_PUBLIC_BUILD_TYPE=production

# Logging Configuration
EXPO_PUBLIC_LOG_LEVEL=error
EXPO_PUBLIC_ENABLE_LOGGING=false

# Performance Configuration
EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
EXPO_PUBLIC_ENABLE_ANALYTICS=true

# Security Configuration
EXPO_PUBLIC_ENABLE_SECURITY_CHECKS=true
EXPO_PUBLIC_ENABLE_SSL_PINNING=true
`;

// Write production environment file
fs.writeFileSync('.env.production', productionEnv);

console.log('✅ Production environment file created: .env.production');
console.log('📝 To use production environment, run: cp .env.production .env');
