/**
 * API Test Utility
 * Simple utility to test API connectivity and authentication
 */

import API from '../api/axiosInstance';

export const testApiConnection = async (): Promise<boolean> => {
  try {
    // Test basic connectivity
    const response = await API.get('/health');
    console.log('✅ API connection test successful:', response.status);
    return true;
  } catch (error: any) {
    console.log('❌ API connection test failed:', error.message);
    return false;
  }
};

export const testAuthEndpoints = async (): Promise<void> => {
  try {
    console.log('🧪 Testing auth endpoints...');
    
    // Test signup endpoint (this will fail with validation error, but that's expected)
    try {
      await API.post('/auth/signup', {
        fullName: 'Test User',
        phoneNumber: '123456789',
        email: 'test@example.com',
        password: 'testpassword123',
        countryCode: '+255',
        roles: 'CUSTOMER',
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Signup endpoint is accessible (validation error expected)');
      } else {
        console.log('❌ Signup endpoint error:', error.message);
      }
    }

    // Test signin endpoint (this will fail with auth error, but that's expected)
    try {
      await API.post('/auth/signIn', {
        phoneNumber: '123456789',
        password: 'testpassword123',
        countryCode: '+255',
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Signin endpoint is accessible (auth error expected)');
      } else {
        console.log('❌ Signin endpoint error:', error.message);
      }
    }

    console.log('✅ Auth endpoints test complete');
  } catch (error: any) {
    console.error('❌ Auth endpoints test failed:', error.message);
  }
};
