#!/usr/bin/env node

/**
 * API Connectivity Test Script
 * Tests if the Tenga API is accessible
 */

const https = require('https');

const API_BASE_URL = 'https://lk-7ly1.onrender.com/api';

console.log('🔍 Testing API connectivity...');
console.log('🌐 API Base URL:', API_BASE_URL);

// Test basic connectivity
const testUrl = `${API_BASE_URL}/auth/signIn`;

console.log('📡 Testing endpoint:', testUrl);

const req = https.request(testUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000
}, (res) => {
  console.log('✅ API is reachable!');
  console.log('📊 Status Code:', res.statusCode);
  console.log('📋 Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response:', data);
    
    if (res.statusCode === 400) {
      console.log('✅ Expected 400 - API is working (missing credentials)');
    } else if (res.statusCode === 401) {
      console.log('✅ Expected 401 - API is working (unauthorized)');
    } else {
      console.log('⚠️  Unexpected status code:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ API connection failed:');
  console.error('🔍 Error code:', error.code);
  console.error('📝 Error message:', error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.error('💡 DNS resolution failed - check internet connection');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('💡 Connection refused - server might be down');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('💡 Connection timeout - server might be slow');
  }
});

req.on('timeout', () => {
  console.error('⏰ Request timeout - server is not responding');
  req.destroy();
});

// Send a test request
req.write(JSON.stringify({
  email: 'test@example.com',
  password: 'test123'
}));

req.end();
