/**
 * Test script to check if the CORS proxy is running
 * 
 * Usage: node scripts/test-proxy.js
 */

const http = require('http');

const PROXY_URL = 'http://localhost:3001';
const HEALTH_ENDPOINT = '/health';

console.log('🧪 Testing CORS Proxy Server...\n');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: HEALTH_ENDPOINT,
  method: 'GET',
  timeout: 2000,
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        console.log('✅ Proxy is RUNNING!\n');
        console.log('📊 Proxy Status:');
        console.log(`   Port: ${response.proxyPort}`);
        console.log(`   Target API: ${response.targetApi}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Time: ${response.timestamp}\n`);
        console.log('💡 You can now use the web app - CORS will be handled by the proxy!');
        process.exit(0);
      } catch (e) {
        console.log('✅ Proxy is RUNNING! (but response format unexpected)');
        console.log('Response:', data);
        process.exit(0);
      }
    } else {
      console.log(`❌ Proxy responded with status ${res.statusCode}`);
      console.log('Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Proxy is NOT running!\n');
  console.log('Error:', error.message);
  console.log('\n💡 To start the proxy, run:');
  console.log('   npm run web:proxy');
  console.log('   OR');
  console.log('   npm run web:dev  (starts both proxy and web app)\n');
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Proxy test timed out - proxy is likely not running\n');
  req.destroy();
  process.exit(1);
});

req.end();

