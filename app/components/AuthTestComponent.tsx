/**
 * Authentication Test Component
 * Simple component to test the authentication flow
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export const AuthTestComponent: React.FC = () => {
  const { user, isAuthenticated, isLoading, error, signOut } = useAuth();

  const handleTestSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'You have been signed out successfully.', [
        { text: 'OK', onPress: () => console.log('User confirmed logout') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Status</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.text}>
          Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
        </Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.text}>User: {user.fullName}</Text>
            <Text style={styles.text}>Email: {user.email}</Text>
            <Text style={styles.text}>Phone: {user.phoneNumber}</Text>
            <Text style={styles.text}>Country: {user.countryCode}</Text>
            <Text style={styles.text}>Role: {user.role}</Text>
          </View>
        )}
        
        {error && (
          <Text style={styles.errorText}>Error: {error}</Text>
        )}
      </View>

      {isAuthenticated && (
        <TouchableOpacity style={styles.button} onPress={handleTestSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
