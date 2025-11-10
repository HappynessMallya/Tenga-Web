// @ts-nocheck
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';

interface NetworkBannerProps {
  isVisible?: boolean;
  message?: string;
}

export const NetworkBanner: React.FC<NetworkBannerProps> = ({
  isVisible = false,
  message = 'No internet connection',
}) => {
  const { colors } = useTheme();

  if (!isVisible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.error }]}> 
      <Ionicons name="cloud-offline-outline" size={20} color="white" />
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.card }]} onPress={() => {}}>
        <Text style={[styles.retryText, { color: colors.error }]}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 26,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  retryButton: {
    position: 'absolute',
    bottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  retryText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
