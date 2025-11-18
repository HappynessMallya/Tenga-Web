import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationService, LocationData } from '../services/locationService';
import { useLocationStore } from '../store/locationStore';
import { useTheme } from '../providers/ThemeProvider';
import { LocationMap } from './LocationMap';

interface LocationPickerProps {
  onLocationUpdate?: (locationData: LocationData) => void;
  showMap?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationUpdate,
  showMap = false,
}: LocationPickerProps) => {
  const { colors } = useTheme();
  const { locationData, setLocationData, clearLocationData } = useLocationStore();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showMapView, setShowMapView] = useState(false);

  // Load saved location data on component mount
  useEffect(() => {
    if (locationData) {
      setCurrentLocation(locationData);
    }
  }, [locationData]);

  /**
   * Get current location and update state
   */
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const locationData = await LocationService.getCompleteLocationData();
      
      setCurrentLocation(locationData);
      setLocationData(locationData);
      
      if (onLocationUpdate) {
        onLocationUpdate(locationData);
      }

      console.log('Location data saved:', locationData);
      
      // Show success message if reverse geocoding used fallback
      if (locationData.city === 'Unknown' || locationData.streetName.includes('Location at')) {
        Alert.alert(
          'Location Retrieved',
          'We got your coordinates, but couldn\'t find the exact address. You can still proceed with your order using these coordinates.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Location error:', error);
      const errorMessage = error.message || 'Failed to get location';
      setLocationError(errorMessage);
      
      // Only show alert for critical errors (permission denied, etc.)
      if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access to use this feature. You can enable it in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  /**
   * Refresh location data
   */
  const refreshLocation = async () => {
    await getCurrentLocation();
  };

  /**
   * Toggle map view
   */
  const toggleMap = () => {
    setShowMapView(!showMapView);
  };

  /**
   * Clear location data
   */
  const clearLocation = () => {
    setCurrentLocation(null);
    clearLocationData();
    setLocationError(null);
  };

  return (
    <View style={styles.container}>
      {/* Location Button */}
      <TouchableOpacity
        style={[styles.locationButton, { backgroundColor: colors.primary }]}
        onPress={getCurrentLocation}
        disabled={isGettingLocation}
      >
        <View style={styles.buttonContent}>
          {isGettingLocation ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="location" size={20} color="white" />
          )}
          <Text style={styles.buttonText}>
            {isGettingLocation ? 'Getting Location...' : 'Get My Location'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Error Display */}
      {locationError && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '10' }]}>
          <Ionicons name="warning" size={16} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{locationError}</Text>
        </View>
      )}

      {/* Location Display */}
      {currentLocation && (
        <View style={[styles.locationContainer, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}>
          <View style={styles.coordinatesContainer}>
            <Text style={[styles.coordinatesTitle, { color: colors.text }]}>📍 Coordinates</Text>
            <Text style={[styles.coordinatesText, { color: colors.textSecondary }]}>
              Lat: {currentLocation.latitude}
            </Text>
            <Text style={[styles.coordinatesText, { color: colors.textSecondary }]}>
              Lng: {currentLocation.longitude}
            </Text>
            {/* {currentLocation.accuracy && (
              <Text style={[styles.accuracyText, { color: colors.textSecondary }]}>
                Accuracy: {Math.round(currentLocation.accuracy)}m
              </Text>
            )} */}
          </View>

          <View style={styles.addressContainer}>
            <Text style={[styles.addressTitle, { color: colors.text }]}>🏠 Detected Address</Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              Street: {currentLocation.streetName}
            </Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              City: {currentLocation.city}
            </Text>
            {/* <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              Postcode: {currentLocation.postCode}
            </Text> */}
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              Landmark: {currentLocation.landMark}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {showMap && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={toggleMap}
              >
                <Ionicons name="map" size={16} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                  {showMapView ? 'Hide Map' : 'Show on Map'}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={refreshLocation}
            >
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Refresh Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={clearLocation}
            >
              <Ionicons name="trash" size={16} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Auto-fill Notice */}
          {/* <View style={[styles.noticeContainer, { backgroundColor: colors.info + '10' }]}>
            <Ionicons name="information-circle" size={16} color={colors.info} />
            <Text style={[styles.noticeText, { color: colors.info }]}>
              Address fields have been auto-filled from your location
            </Text>
          </View> */}
        </View>
      )}

      {/* Map View (Optional) */}
      {showMapView && currentLocation && showMap && (
        <LocationMap
          latitude={parseFloat(currentLocation.latitude)}
          longitude={parseFloat(currentLocation.longitude)}
          height={200}
          address={currentLocation.streetName}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  locationButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  locationContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  coordinatesContainer: {
    marginBottom: 16,
  },
  coordinatesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  accuracyText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  noticeText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});