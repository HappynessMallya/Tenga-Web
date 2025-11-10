// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { useTheme } from '../providers/ThemeProvider';
import { Order } from '../types/order';

interface OrderMapProps {
  order: Order;
  trackingData?: any;
  showRoute?: boolean;
}

export const OrderMap: React.FC<OrderMapProps> = ({ order, trackingData, showRoute = true }) => {
  const { colors } = useTheme();
  const [region, setRegion] = useState({
    latitude: order.customer_latitude || -6.7924,
    longitude: order.customer_longitude || 39.2083,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const customerLocation = {
    latitude: order.customer_latitude || -6.7924,
    longitude: order.customer_longitude || 39.2083,
  };

  const vendorLocation = trackingData?.vendorLocation || {
    latitude: -6.7924,
    longitude: 39.2083,
  };

  const deliveryLocation = trackingData?.deliveryLocation || null;

  useEffect(() => {
    // Calculate region to fit all markers
    if (trackingData) {
      const coordinates = [
        customerLocation,
        vendorLocation,
        ...(deliveryLocation ? [deliveryLocation] : []),
      ];

      const minLat = Math.min(...coordinates.map(c => c.latitude));
      const maxLat = Math.max(...coordinates.map(c => c.latitude));
      const minLng = Math.min(...coordinates.map(c => c.longitude));
      const maxLng = Math.max(...coordinates.map(c => c.longitude));

      const latDelta = (maxLat - minLat) * 1.2;
      const lngDelta = (maxLng - minLng) * 1.2;

      setRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(latDelta, 0.01),
        longitudeDelta: Math.max(lngDelta, 0.01),
      });
    }
  }, [trackingData]);

  // Polyline for route
  const routeCoords = trackingData?.route
    ? trackingData.route.map((c: any) => ({ latitude: c.latitude, longitude: c.longitude }))
    : [];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: region.latitude,
          longitude: region.longitude,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        }}
        region={region as unknown as Region}
      >
        {/* Customer Location */}
        <Marker
          identifier="customer"
          coordinate={{
            latitude: customerLocation.latitude,
            longitude: customerLocation.longitude,
          }}
          title="Customer"
        />

        {/* Vendor Location */}
        {trackingData?.vendorLocation && (
          <Marker
            identifier="vendor"
            coordinate={{ latitude: vendorLocation.latitude, longitude: vendorLocation.longitude }}
            title="Vendor"
            pinColor={colors.primary}
          />
        )}

        {/* Delivery Agent Location */}
        {deliveryLocation && (
          <Marker
            identifier="delivery"
            coordinate={{ latitude: deliveryLocation.latitude, longitude: deliveryLocation.longitude }}
            title="Delivery"
            pinColor={colors.text}
          />
        )}

        {/* Route Polyline */}
        {showRoute && routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.primary}
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    margin: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
