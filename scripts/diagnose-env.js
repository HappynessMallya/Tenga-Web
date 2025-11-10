#!/usr/bin/env node

/**
 * Environment Diagnosis Script
 *
 * This script helps diagnose environment variable loading issues
 * Run with: node scripts/diagnose-env.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = (color, message) => {
  console.log(`${color}${message}${colors.reset}`);
};

console.log('\n' + '='.repeat(60));
log(colors.bold + colors.blue, '🔍 ENVIRONMENT DIAGNOSIS TOOL');
console.log('='.repeat(60));

// Check if .env file exists
const envPath = path.resolve(__dirname, '../.env');
const envExamplePath = path.resolve(__dirname, '../env.example');

console.log('\n📁 FILE SYSTEM CHECK:');
if (fs.existsSync(envPath)) {
  const stats = fs.statSync(envPath);
  log(colors.green, `✅ .env file exists (${stats.size} bytes)`);

  // Check file encoding
  const content = fs.readFileSync(envPath, 'utf8');
  const hasNullChars = content.includes('\u0000');
  const hasCarriageReturns = content.includes('\r');

  if (hasNullChars) {
    log(colors.red, '❌ .env file has encoding issues (contains null characters)');
    log(colors.yellow, '💡 Try recreating the .env file with proper UTF-8 encoding');
  } else {
    log(colors.green, '✅ .env file encoding appears correct');
  }

  if (hasCarriageReturns) {
    log(colors.yellow, '⚠️  .env file has Windows line endings (\\r\\n)');
  }

  console.log(`📊 File stats: ${content.split('\n').length} lines, ${content.length} characters`);
} else {
  log(colors.red, '❌ .env file not found');

  if (fs.existsSync(envExamplePath)) {
    log(colors.yellow, '💡 env.example found - copy it to .env and update values');
  } else {
    log(colors.red, '❌ env.example not found either');
  }
}

// Try to load environment variables
console.log('\n🔧 DOTENV LOADING TEST:');
try {
  require('dotenv').config({ path: envPath });
  log(colors.green, '✅ dotenv loaded successfully');
} catch (error) {
  log(colors.red, `❌ dotenv loading failed: ${error.message}`);
}

// Check specific environment variables
console.log('\n🔍 ENVIRONMENT VARIABLES CHECK:');
const requiredVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'BONGO_PAY_API_KEY',
  'BONGO_PAY_BASE_URL',
];

const optionalVars = [
  'NODE_ENV',
  'GOOGLE_MAPS_API_KEY',
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_APP_URL',
  'DEBUG',
];

console.log('\n📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value.trim() !== '') {
    const preview =
      varName.includes('KEY') || varName.includes('SECRET')
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value.length > 50
          ? `${value.substring(0, 47)}...`
          : value;
    log(colors.green, `✅ ${varName}: ${preview}`);
  } else {
    log(colors.red, `❌ ${varName}: NOT SET`);
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value.trim() !== '') {
    const preview =
      varName.includes('KEY') || varName.includes('SECRET')
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value.length > 50
          ? `${value.substring(0, 47)}...`
          : value;
    log(colors.green, `✅ ${varName}: ${preview}`);
  } else {
    log(colors.yellow, `⚠️  ${varName}: NOT SET`);
  }
});

// Show all EXPO_ prefixed variables
console.log('\n🔍 ALL EXPO_ VARIABLES:');
const expoVars = Object.keys(process.env).filter(key => key.startsWith('EXPO_'));
if (expoVars.length > 0) {
  expoVars.forEach(key => {
    const value = process.env[key];
    const preview = value && value.length > 50 ? `${value.substring(0, 47)}...` : value;
    log(colors.blue, `  ${key}: ${preview || 'NOT SET'}`);
  });
} else {
  log(colors.yellow, '  No EXPO_ variables found');
}

// Platform and runtime info
console.log('\n💻 RUNTIME INFORMATION:');
console.log(`  Node.js: ${process.version}`);
console.log(`  Platform: ${process.platform}`);
console.log(`  Working Directory: ${process.cwd()}`);
console.log(`  Script Location: ${__dirname}`);

// Recommendations
console.log('\n💡 RECOMMENDATIONS:');
const missingRequired = requiredVars.filter(
  varName => !process.env[varName] || process.env[varName].trim() === ''
);

if (missingRequired.length === 0) {
  log(colors.green, '🎉 All required environment variables are set!');
  log(colors.green, '   You can now start your Expo development server');
} else {
  log(colors.red, `❌ ${missingRequired.length} required variables missing:`);
  missingRequired.forEach(varName => {
    log(colors.yellow, `   • ${varName}`);
  });

  console.log('\n📝 To fix:');
  log(colors.yellow, '1. Make sure .env file exists in the project root');
  log(colors.yellow, '2. Add the missing variables to your .env file');
  log(colors.yellow, '3. Restart your development server');
  log(colors.yellow, '4. Run this script again to verify');
}

console.log('\n' + '='.repeat(60));
log(colors.blue, '🔧 For more help, check the README or env.example file');
console.log('='.repeat(60) + '\n');
