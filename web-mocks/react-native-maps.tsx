// Web-compatible mock for react-native-maps module
// This file is used by Metro resolver to replace react-native-maps on web
import { View, Text, StyleSheet } from 'react-native';

// Try to import useTheme, but make it optional for web builds
let useTheme: any;
try {
  useTheme = require('../app/providers/ThemeProvider').useTheme;
} catch (e) {
  // Fallback if theme provider is not available
  useTheme = () => ({ colors: { backgroundSecondary: '#F9FAFB', textSecondary: '#6B7280' } });
}

// Mock MapView component
export const MapView = ({ 
  children, 
  style, 
  initialRegion, 
  region,
}: any) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.mapContainer, style, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.placeholder}>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          🗺️ Map View (Web)
        </Text>
        {region && (
          <Text style={[styles.coords, { color: colors.textSecondary }]}>
            {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
};

// Mock Marker component
export const Marker = ({ children }: any) => {
  return <View>{children}</View>;
};

// Mock Polyline component
export const Polyline = () => {
  return null;
};

// Export Region type
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

// Default export
export default MapView;

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    padding: 20,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  coords: {
    fontSize: 12,
    marginTop: 8,
  },
});

