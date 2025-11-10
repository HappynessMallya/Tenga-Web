#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Shows which environment variables are available
 */

console.log('🔍 Environment Variables Check');
console.log('================================');

// Check process.env
console.log('\n📋 Process Environment Variables:');
console.log('EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL || 'NOT SET');
console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Check if .env file exists
const fs = require('fs');
const path = require('path');

console.log('\n📁 File System Check:');
const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => 
        line.trim() && !line.startsWith('#') && line.includes('=')
      );
      
      console.log(`   Contains ${lines.length} environment variables:`);
      lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          console.log(`   ${key.trim()}=${value.trim()}`);
        }
      });
    } catch (error) {
      console.log(`   Error reading ${file}:`, error.message);
    }
  } else {
    console.log(`❌ ${file} does not exist`);
  }
});

console.log('\n🌐 Expected API URL Priority:');
console.log('1. Constants.expoConfig.extra.EXPO_PUBLIC_API_BASE_URL');
console.log('2. process.env.EXPO_PUBLIC_API_BASE_URL');
console.log('3. process.env.EXPO_PUBLIC_API_URL');
console.log('4. Fallback: https://lk-7ly1.onrender.com/api');
