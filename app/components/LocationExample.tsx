import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LocationPicker } from '../components/LocationPicker';
import { LocationData } from '../services/locationService';

/**
 * Example usage of the new LocationPicker component
 * This shows how to integrate it into forms and handle location updates
 */
export const LocationExample: React.FC = () => {
  const handleLocationUpdate = (locationData: LocationData) => {
    console.log('Location updated:', locationData);
    
    // You can now use this data to:
    // 1. Auto-fill form fields
    // 2. Save to your backend
    // 3. Update your order state
    // 4. Show on maps
    
    // Example: Auto-fill form fields
    const formData = {
      streetName: locationData.streetName,
      houseNumber: locationData.houseNumber,
      city: locationData.city,
      postCode: locationData.postCode,
      landmark: locationData.landMark,
      coordinates: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      },
    };
    
    console.log('Form data ready:', formData);
  };

  return (
    <View style={styles.container}>
      {/* Basic usage without map */}
      <LocationPicker 
        onLocationUpdate={handleLocationUpdate}
        showMap={false}
      />
      
      {/* Advanced usage with map */}
      <LocationPicker 
        onLocationUpdate={handleLocationUpdate}
        showMap={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
