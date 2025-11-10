import { LocationObject } from 'expo-location';

export const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const calculateDeliveryFee = (distance: number): number => {
  const baseFee = 5000; // 5000 TZS base fee
  const perKmRate = 1000; // 1000 TZS per kilometer
  return baseFee + (distance / 1000) * perKmRate;
};

export const formatLocation = (location: LocationObject): string => {
  return `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
};
