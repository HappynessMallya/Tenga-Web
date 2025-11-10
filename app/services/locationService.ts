import * as Location from 'expo-location';

export interface LocationData {
  latitude: string;
  longitude: string;
  city: string;
  country: string;
  streetName: string;
  houseNumber: string;
  postCode: string;
  landMark: string;
  accuracy?: number | undefined;
}

export class LocationService {
  /**
   * Check if location permissions are granted
   */
  static async checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  /**
   * Request location permissions
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Get current location with high accuracy
   */
  static async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error('Location permission denied');
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 1,
      });

      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  static async reverseGeocode(
    latitude: number, 
    longitude: number
  ): Promise<LocationData> {
    try {
      // Validate coordinates
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new Error(`Invalid coordinates: latitude=${latitude}, longitude=${longitude}`);
      }

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error(`NaN coordinates: latitude=${latitude}, longitude=${longitude}`);
      }

      console.log('Reverse geocoding coordinates:', { latitude, longitude });

      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length === 0) {
        throw new Error('No address found for coordinates');
      }

      const addr = addresses[0];
      console.log('Reverse geocoding result:', addr);

      return {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        city: addr?.city || addr?.district || 'Unknown',
        country: addr?.country || 'Unknown',
        streetName: addr?.street || addr?.name || 'Unknown',
        houseNumber: addr?.streetNumber || '',
        postCode: addr?.postalCode || '',
        landMark: addr?.name || '',
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  /**
   * Get complete location data (coordinates + address)
   */
  static async getCompleteLocationData(): Promise<LocationData> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) {
        throw new Error('Could not get location');
      }

      // Extract coordinates from the location object
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;
      
      console.log('Location coordinates:', { latitude, longitude });
      
      const addressData = await this.reverseGeocode(latitude, longitude);

      return {
        ...addressData,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      console.error('Error getting complete location data:', error);
      throw error;
    }
  }
}

