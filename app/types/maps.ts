// Basic coordinate types for maps
export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Event types for Mapbox compatibility
export interface MapPressEvent {
  nativeEvent: {
    coordinate: LatLng;
    position: Point;
  };
}

// Basic location type
export interface MapLocation {
  latitude: number;
  longitude: number;
}

// Service area type
export interface ServiceArea {
  id: string;
  vendor_id: string;
  location: MapLocation;
  radius_meters: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Extended Region type for map views
export interface MapRegion extends Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Delivery location type
export interface DeliveryLocation {
  id: string;
  order_id: string;
  delivery_agent_id: string;
  location: MapLocation;
  created_at: string;
}

// Vendor location type
export interface VendorLocation {
  id: string;
  vendor_id: string;
  location: MapLocation;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Map marker type
export interface MapMarker {
  id: string;
  location: MapLocation;
  title?: string;
  description?: string;
  type: 'vendor' | 'customer' | 'delivery' | 'service_area';
}

// Map view props type
export interface MapViewProps {
  initialRegion: MapRegion;
  onRegionChange?: (region: MapRegion) => void;
  markers?: MapMarker[];
  showUserLocation?: boolean;
  showMyLocationButton?: boolean;
}

// Map cluster type
export interface MapCluster {
  id: string;
  location: MapLocation;
  count: number;
  markers: MapMarker[];
}

// Map bounds type
export interface MapBounds {
  northEast: MapLocation;
  southWest: MapLocation;
}

// Map camera type
export interface MapCamera {
  center: MapLocation;
  zoom: number;
  heading?: number;
  pitch?: number;
  altitude?: number;
}

// Map style type
export interface MapStyle {
  id: string;
  name: string;
  style: any; // Google Maps style JSON
}

// Map theme type
export interface MapTheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
}

// Map interaction type
export interface MapInteraction {
  type: 'pan' | 'zoom' | 'rotate' | 'tilt';
  enabled: boolean;
}

// Map gesture type
export interface MapGesture {
  type: 'tap' | 'longPress' | 'drag' | 'pinch';
  enabled: boolean;
}

// Map event type
export interface MapEvent {
  nativeEvent: {
    coordinate: MapLocation;
    position: {
      x: number;
      y: number;
    };
    action: 'marker-press' | 'marker-select' | 'marker-deselect' | 'callout-press';
    id?: string;
  };
}

// Map region change event type
export interface MapRegionChangeEvent {
  nativeEvent: {
    region: Region;
    isGesture: boolean;
  };
}

// Map user location change event type
export interface MapUserLocationChangeEvent {
  nativeEvent: {
    coordinate: MapLocation;
    timestamp: number;
    accuracy: number;
    altitude: number;
    heading: number;
    speed: number;
  };
}

// Map error event type
export interface MapErrorEvent {
  nativeEvent: {
    code: string;
    message: string;
    details?: any;
  };
}

// Map loading state type
export interface MapLoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

// Map permission type
export interface MapPermission {
  type: 'location' | 'background' | 'precise';
  status: 'granted' | 'denied' | 'undetermined';
}

// Map configuration type
export interface MapConfig {
  provider: 'google' | 'apple';
  apiKey?: string;
  style?: MapStyle;
  theme?: MapTheme;
  interactions?: MapInteraction[];
  gestures?: MapGesture[];
  clustering?: boolean;
  clusteringRadius?: number;
  maxZoom?: number;
  minZoom?: number;
  initialZoom?: number;
  compassEnabled?: boolean;
  scaleEnabled?: boolean;
  rotateEnabled?: boolean;
  scrollEnabled?: boolean;
  pitchEnabled?: boolean;
  zoomEnabled?: boolean;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  showsScale?: boolean;
  showsTraffic?: boolean;
  showsBuildings?: boolean;
  showsIndoors?: boolean;
  showsIndoorLevelPicker?: boolean;
}

// Map state type
export interface MapState {
  region: MapRegion;
  markers: MapMarker[];
  clusters: MapCluster[];
  selectedMarker?: MapMarker;
  selectedCluster?: MapCluster;
  loading: MapLoadingState;
  error?: MapErrorEvent;
  permissions: MapPermission[];
}

// Map context type
export interface MapContextType {
  state: MapState;
  config: MapConfig;
  setRegion: (region: MapRegion) => void;
  setMarkers: (markers: MapMarker[]) => void;
  setSelectedMarker: (marker?: MapMarker) => void;
  setSelectedCluster: (cluster?: MapCluster) => void;
  setLoading: (loading: MapLoadingState) => void;
  setError: (error?: MapErrorEvent) => void;
  setPermissions: (permissions: MapPermission[]) => void;
  handleRegionChange: (region: MapRegion) => void;
  handleMarkerPress: (marker: MapMarker) => void;
  handleClusterPress: (cluster: MapCluster) => void;
  handleUserLocationChange: (location: MapLocation) => void;
  handleError: (error: MapErrorEvent) => void;
}

// Map view component props type for Mapbox
export interface MapViewComponentProps {
  initialRegion: Region;
  onRegionChange?: (region: Region) => void;
  children?: React.ReactNode;
  style?: any;
  showsUserLocation?: boolean;
  zoomEnabled?: boolean;
  rotateEnabled?: boolean;
  scrollEnabled?: boolean;
  pitchEnabled?: boolean;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  onPress?: (event: MapPressEvent) => void;
  onLongPress?: (event: MapPressEvent) => void;
  onRegionChangeComplete?: (region: Region) => void;
  onMapReady?: () => void;
  onError?: (error: any) => void;
}
