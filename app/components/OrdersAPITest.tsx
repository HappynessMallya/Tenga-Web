/**
 * Orders API Test Component
 * Simple test component to verify the orders API integration
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { orderService } from '../services/orderService';
import { useUserStore } from '../store/userStore';

export const OrdersAPITest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const { isAuthenticated, user } = useUserStore();

  const testOrdersAPI = async () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to test the orders API');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing orders API...');

    try {
      // Test fetching orders
      const response = await orderService.getOrders({ limit: 5 });
      
      setTestResult(`✅ Success! Found ${response.orders.length} orders\n` +
        `Total orders: ${response.pagination.total}\n` +
        `Limit: ${response.pagination.limit}\n` +
        `Offset: ${response.pagination.offset}\n\n` +
        `Sample order:\n` +
        `- ID: ${response.orders[0]?.id || 'N/A'}\n` +
        `- Status: ${response.orders[0]?.status || 'N/A'}\n` +
        `- Total: TSh ${response.orders[0]?.totalAmount || 'N/A'}\n` +
        `- Items: ${response.orders[0]?.items?.length || 0}\n` +
        `- Created: ${response.orders[0]?.createdAt ? new Date(response.orders[0].createdAt).toLocaleDateString() : 'N/A'}`);
      
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
      console.error('Orders API test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testOrderById = async () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to test the orders API');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing get order by ID...');

    try {
      // First get orders to have an ID to test with
      const ordersResponse = await orderService.getOrders({ limit: 1 });
      
      if (ordersResponse.orders.length === 0) {
        setTestResult('❌ No orders found to test with');
        return;
      }

      const orderId = ordersResponse.orders[0].id;
      const order = await orderService.getOrderById(orderId);
      
      setTestResult(`✅ Success! Retrieved order by ID\n` +
        `- ID: ${order.id}\n` +
        `- Status: ${order.status}\n` +
        `- Total: TSh ${order.totalAmount}\n` +
        `- Items: ${order.items.length}\n` +
        `- Pickup Address: ${order.pickupAddress.address.description}\n` +
        `- Delivery Address: ${order.deliveryAddress.address.description}`);
      
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
      console.error('Get order by ID test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders API Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Authentication Status:</Text>
        <Text style={[styles.statusValue, { color: isAuthenticated ? '#34C759' : '#FF3B30' }]}>
          {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
        </Text>
        {user && (
          <Text style={styles.userInfo}>
            User: {user.full_name || user.email || 'Unknown'}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={testOrdersAPI}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test Get Orders'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testOrderById}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test Get Order by ID'}
          </Text>
        </TouchableOpacity>
      </View>

      {testResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Test Result:</Text>
          <Text style={styles.resultText}>{testResult}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
