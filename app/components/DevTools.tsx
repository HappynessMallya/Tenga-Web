/**
 * Development Tools Component
 * Provides debugging utilities for development
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { clearAllCache, clearOrderCache, debugStorageContents } from '../utils/clearCache';
import { useOrderStore } from '../store/orderStore';
import { useGarmentConfig } from '../hooks/useGarmentConfig';

interface DevToolsProps {
  visible: boolean;
  onClose: () => void;
}

export const DevTools: React.FC<DevToolsProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { resetOrder, orderId, orderUuid } = useOrderStore();
  const { clearAllGarments } = useGarmentConfig();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all cached data including orders, garments, and user data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearAllCache();
              resetOrder();
              clearAllGarments();
              Alert.alert('Success', 'All cache cleared! App will reload.', [
                { 
                  text: 'OK', 
                  onPress: () => {
                    onClose();
                    // Reload the app
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  } 
                }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleClearOrders = async () => {
    setIsClearing(true);
    try {
      await clearOrderCache();
      resetOrder();
      clearAllGarments();
      Alert.alert('Success', 'Order cache cleared!');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear order cache');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDebugStorage = async () => {
    await debugStorageContents();
    Alert.alert('Debug Info', 'Check console for storage contents');
  };

  const handleShowOrderInfo = () => {
    Alert.alert(
      'Current Order Info',
      `Order ID: ${orderId || 'None'}\nOrder UUID: ${orderUuid || 'None'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>🛠️ Dev Tools</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Current Order Info */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
              onPress={handleShowOrderInfo}
            >
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={[styles.buttonText, { color: colors.primary }]}>
                Show Order Info
              </Text>
            </TouchableOpacity>

            {/* Clear Order Cache */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#f59e0b20', borderColor: '#f59e0b' }]}
              onPress={handleClearOrders}
              disabled={isClearing}
            >
              <Ionicons name="refresh" size={20} color="#f59e0b" />
              <Text style={[styles.buttonText, { color: '#f59e0b' }]}>
                {isClearing ? 'Clearing...' : 'Clear Order Cache'}
              </Text>
            </TouchableOpacity>

            {/* Debug Storage */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#3b82f620', borderColor: '#3b82f6' }]}
              onPress={handleDebugStorage}
            >
              <Ionicons name="terminal" size={20} color="#3b82f6" />
              <Text style={[styles.buttonText, { color: '#3b82f6' }]}>
                Debug Storage (Console)
              </Text>
            </TouchableOpacity>

            {/* Clear All Cache */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#ef444420', borderColor: '#ef4444' }]}
              onPress={handleClearAll}
              disabled={isClearing}
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
              <Text style={[styles.buttonText, { color: '#ef4444' }]}>
                {isClearing ? 'Clearing...' : 'Clear All Cache & Reload'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                💡 Use these tools to debug issues with orders and cached data.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

