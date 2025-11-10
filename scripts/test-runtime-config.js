const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log(' Testing Runtime Configuration\n');

const getEnvVar = (key, defaultValue = null) => {
  const value = process.env[key];
  return value || defaultValue;
};

const bongoPayApiKey = getEnvVar('BONGO_PAY_API_KEY');
const bongoPayBaseUrl = getEnvVar('BONGO_PAY_BASE_URL', 'https://bongopay.vastlabs.co.tz/api/v1');

console.log('Environment Variables:');
console.log(`  BONGO_PAY_API_KEY: ${bongoPayApiKey ? 'SET' : 'NOT_SET'}`);
console.log(`  BONGO_PAY_BASE_URL: ${bongoPayBaseUrl}`);

const isBongoPayConfigured = !!(bongoPayApiKey && bongoPayBaseUrl);
console.log(`\nBongoPay Configuration Status: ${isBongoPayConfigured ? ' READY' : ' NOT READY'}`);

if (isBongoPayConfigured) {
  console.log(' BongoPay should work in the app!');
} else {
  console.log(' BongoPay will NOT work - API key missing');
}