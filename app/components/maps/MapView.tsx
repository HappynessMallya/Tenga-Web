// @ts-nocheck
import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import RNMapView, { Marker, Polyline, Region } from 'react-native-maps';
import Constants from 'expo-constants';
import { MapViewComponentProps } from '../../types/maps';
import { useTheme } from '../../providers/ThemeProvider';

// Simple readiness check (RN Maps doesn't require token init)
const isMapReady = () => true;

export const CustomMapView: React.FC<MapViewComponentProps> = ({
  initialRegion,
  onRegionChange,
  children,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  // Check if map is ready
  if (!isMapReady()) {
    console.warn('⚠️ Map not ready, rendering placeholder view');
    return (
      <View style={[styles.container, style, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.placeholder}>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            Loading Map...
          </Text>
        </View>
      </View>
    );
  }

  // Default to Dar es Salaam if no initialRegion
  const region: Region = initialRegion
    ? (initialRegion as unknown as Region)
    : { latitude: -6.7924, longitude: 39.2083, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  useEffect(() => {
    // Placeholder for any permission handling if needed
  }, []);

  return (
    <View style={[styles.container, style, { backgroundColor: colors.background }]}>
      <RNMapView
        style={styles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={onRegionChange}
        {...props}
      >
        {children}
      </RNMapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
