#!/usr/bin/env node

/**
 * Debug Build Helper Script
 *
 * This script helps you build and debug different versions of the Tenga Laundry app
 * for testing environment variables and resolving APK crashes.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TENGA LAUNDRY - Debug Build Helper');
console.log('='.repeat(50));

// Helper function to run commands
function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`💻 Running: ${command}`);

  try {
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      encoding: 'utf8',
    });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Check if EAS CLI is installed
function checkEasCli() {
  try {
    execSync('eas --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log('📦 EAS CLI not found, installing...');
    return runCommand('npm install -g @expo/eas-cli', 'Installing EAS CLI');
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const buildType = args[0] || 'help';

  console.log(`\n🎯 Build Type: ${buildType}`);

  switch (buildType) {
    case 'dev':
    case 'development':
      console.log('\n🔧 Building Development Client (for debugging)');
      console.log('This build includes debugging tools and better error reporting');

      if (!checkEasCli()) return;

      // Validate environment
      if (!runCommand('node scripts/validate-config.js', 'Validating environment configuration')) {
        console.log('⚠️  Environment validation failed, but continuing with development build...');
      }

      // Build development client
      runCommand(
        'eas build --profile development --platform android --local',
        'Building development APK locally'
      );
      break;

    case 'preview':
      console.log('\n📱 Building Preview APK (production-like)');
      console.log('This build tests production environment variables');

      if (!checkEasCli()) return;

      // Validate environment
      if (!runCommand('node scripts/validate-config.js', 'Validating environment configuration')) {
        console.log('❌ Environment validation failed! Preview build may crash.');
        process.exit(1);
      }

      // Build preview APK
      runCommand(
        'eas build --profile preview --platform android',
        'Building preview APK on EAS servers'
      );
      break;

    case 'local-preview':
      console.log('\n🏠 Building Preview APK Locally');

      if (!checkEasCli()) return;

      runCommand(
        'eas build --profile preview --platform android --local',
        'Building preview APK locally'
      );
      break;

    case 'validate':
      console.log('\n🔍 Validating Configuration Only');
      runCommand('node scripts/validate-config.js', 'Validating environment configuration');
      break;

    case 'clean':
      console.log('\n🧹 Cleaning Build Cache');
      runCommand('npx expo install --fix', 'Fixing dependencies');
      runCommand('rm -rf node_modules && npm install', 'Reinstalling node modules');
      runCommand('npx expo r -c', 'Clearing Expo cache');
      break;

    case 'help':
    default:
      console.log('\n📖 USAGE:');
      console.log('  node scripts/build-debug.js <command>');
      console.log('\n📋 AVAILABLE COMMANDS:');
      console.log('  dev          - Build development client APK (best for debugging)');
      console.log('  preview      - Build preview APK on EAS servers');
      console.log('  local-preview- Build preview APK locally');
      console.log('  validate     - Only validate environment configuration');
      console.log('  clean        - Clean all caches and reinstall dependencies');
      console.log('  help         - Show this help message');

      console.log('\n💡 DEBUGGING TIPS:');
      console.log('  1. Use "dev" build to debug APK crashes with better error reporting');
      console.log('  2. Use "preview" to test production environment variables');
      console.log('  3. Always validate configuration before building');
      console.log('  4. Development builds include debugging tools and logs');

      console.log('\n🔧 TROUBLESHOOTING APK CRASHES:');
      console.log('  • Install development APK on device');
      console.log('  • Connect device via USB and enable USB debugging');
      console.log('  • Run: adb logcat | grep -i "tenga\\|expo\\|react"');
      console.log('  • Look for JavaScript errors and environment variable issues');
      break;
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Build helper completed!');
}

main().catch(console.error);
