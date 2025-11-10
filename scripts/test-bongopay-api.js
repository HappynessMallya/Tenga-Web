// Test data
const testData = {
  phone: '255755512190',
  amount: 5000, // Changed from 103 to 5000 to meet minimum requirement
  order_id: 'TEST-123456',
  callback_url: 'https://tengalaundry.app/api/payment/callback',
};

async function testBongoPayAPI() {
  console.log('🧪 Testing BongoPay API...');
  console.log('Config:', {
    baseUrl: BONGO_PAY_CONFIG.baseUrl,
    apiKeyLength: BONGO_PAY_CONFIG.apiKey.length,
    apiKeyPreview: `${BONGO_PAY_CONFIG.apiKey.substring(0, 8)}...${BONGO_PAY_CONFIG.apiKey.substring(BONGO_PAY_CONFIG.apiKey.length - 4)}`,
  });
  console.log('Test data:', testData);

  // Test different endpoints and data formats
  const endpoints = ['/payment/create', '/payments/create', '/api/payment/create'];

  const authMethods = [
    { 'X-API-KEY': BONGO_PAY_CONFIG.apiKey },
    { Authorization: `Bearer ${BONGO_PAY_CONFIG.apiKey}` },
    { Authorization: `ApiKey ${BONGO_PAY_CONFIG.apiKey}` },
  ];

  for (const authMethod of authMethods) {
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔄 Testing: ${endpoint} with auth: ${Object.keys(authMethod)[0]}`);
        console.log('Request data:', testData);

        const response = await fetch(`${BONGO_PAY_CONFIG.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            ...authMethod,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'TengaLaundry/1.0',
          },
          body: JSON.stringify(testData),
        });

        console.log('Response:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          url: response.url,
        });

        const responseText = await response.text();
        console.log('Response body:', responseText.substring(0, 500));

        if (response.ok) {
          console.log('✅ SUCCESS! Found working combination');
          console.log('Working config:', {
            endpoint: `${BONGO_PAY_CONFIG.baseUrl}${endpoint}`,
            authMethod: Object.keys(authMethod)[0],
            requestData: testData,
          });
          return;
        }
      } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
      }
    }
  }

  console.log('\n❌ No working combination found');
}

// Run the test
testBongoPayAPI().catch(console.error);
