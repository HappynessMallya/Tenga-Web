// @ts-nocheck
import React from 'react';
import { View, StyleSheet } from 'react-native';

export const NotificationSystem: React.FC = () => {
  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
