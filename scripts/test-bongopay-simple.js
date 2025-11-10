const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// BongoPay configuration
const BONGO_PAY_CONFIG = {
  apiKey: '804490fd8b80d8b80d8b80d8b80d8b80d8b80d8b80d8b80d8b80d8b80d8b80d',
  baseUrl: 'https://bongopay.vastlabs.co.tz/api/v1',
};

// Test data - using valid amount
const testData = {
  phone: '255755512190',
  amount: 5000,
  order_id: 'TEST-123456',
  callback_url: 'https://tengalaundry.app/api/payment/callback',
};

async function testBongoPaySimple() {
  console.log('🧪 Testing BongoPay API - Simple Test');
  console.log('=====================================');

  console.log('\n📋 Configuration:');
  console.log(`Base URL: ${BONGO_PAY_CONFIG.baseUrl}`);
  console.log(
    `API Key: ${BONGO_PAY_CONFIG.apiKey.substring(0, 8)}...${BONGO_PAY_CONFIG.apiKey.substring(BONGO_PAY_CONFIG.apiKey.length - 4)}`
  );

  console.log('\n📦 Request Data:');
  Object.entries(testData).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  const endpoint = `${BONGO_PAY_CONFIG.baseUrl}/payment/create`;

  console.log('\n🚀 Making Request:');
  console.log(`URL: ${endpoint}`);
  console.log(`Method: POST`);
  console.log(`Auth: X-API-KEY`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-KEY': BONGO_PAY_CONFIG.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'TengaLaundry/1.0',
      },
      body: JSON.stringify(testData),
    });

    console.log('\n📥 Response:');
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);

    const responseText = await response.text();
    console.log('\n📄 Response Body:');

    try {
      const responseJson = JSON.parse(responseText);
      Object.entries(responseJson).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    } catch {
      console.log(responseText);
    }

    if (response.ok) {
      console.log('\n✅ SUCCESS! Payment request created successfully');
    } else {
      console.log('\n❌ FAILED! Payment request failed');
    }
  } catch (error) {
    console.log('\n💥 ERROR:');
    console.log(error.message);
  }
}

// Run the test
testBongoPaySimple().catch(console.error);
