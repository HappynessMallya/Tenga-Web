import * as Location from 'expo-location';
import { Platform } from 'react-native';

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

      // On web, expo-location reverse geocoding doesn't work well, use alternative
      if (Platform.OS === 'web') {
        return await this.reverseGeocodeWeb(latitude, longitude);
      }

      // Try to reverse geocode, but don't fail if it doesn't work
      let addresses: Location.LocationGeocodedAddress[] = [];
      try {
        addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed, using fallback:', geocodeError);
        // Continue with fallback data
      }

      // If reverse geocoding failed or returned no results, use fallback
      if (addresses.length === 0) {
        console.warn('No address found from reverse geocoding, using coordinates as fallback');
        // Return location data with coordinates but minimal address info
        return {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          city: 'Unknown',
          country: 'Unknown',
          streetName: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          houseNumber: '',
          postCode: '',
          landMark: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        };
      }

      const addr = addresses[0];
      console.log('Reverse geocoding result:', addr);

      return {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        city: addr?.city || addr?.district || addr?.region || 'Unknown',
        country: addr?.country || 'Unknown',
        streetName: addr?.street || addr?.name || `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        houseNumber: addr?.streetNumber || '',
        postCode: addr?.postalCode || '',
        landMark: addr?.name || addr?.street || `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Even if there's an error, return coordinates so user can proceed
      return {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        city: 'Unknown',
        country: 'Unknown',
        streetName: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        houseNumber: '',
        postCode: '',
        landMark: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
    }
  }

  /**
   * Reverse geocode using web-based service (for web platform)
   */
  private static async reverseGeocodeWeb(
    latitude: number,
    longitude: number
  ): Promise<LocationData> {
    try {
      // Use OpenStreetMap Nominatim API (free, no API key required)
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      
      console.log('Using web geocoding service:', url);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TengaLaundryApp/1.0', // Required by Nominatim
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('Web geocoding result:', data);

      if (data && data.address) {
        const addr = data.address;
        return {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          city: addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Unknown',
          country: addr.country || 'Unknown',
          streetName: addr.road || addr.street || addr.pedestrian || `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          houseNumber: addr.house_number || addr.house || '',
          postCode: addr.postcode || '',
          landMark: addr.name || addr.display_name?.split(',')[0] || `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        };
      }

      // Fallback if no address data
      throw new Error('No address data in response');
    } catch (error) {
      console.warn('Web geocoding failed, using coordinates fallback:', error);
      // Return coordinates with minimal info
      return {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        city: 'Unknown',
        country: 'Unknown',
        streetName: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        houseNumber: '',
        postCode: '',
        landMark: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
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

