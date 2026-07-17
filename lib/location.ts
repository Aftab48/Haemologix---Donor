// Location services for getting user location and calculating distances

import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { calculateDistance, formatDistance } from './utils';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
}

/**
 * Check if location permissions are granted
 */
export async function hasLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permissions:', error);
    return false;
  }
}

/**
 * Get current location
 */
export async function getCurrentLocation(): Promise<LocationCoordinates | null> {
  try {
    const hasPermission = await hasLocationPermissions();
    if (!hasPermission) {
      const granted = await requestLocationPermissions();
      if (!granted) {
        return null;
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Calculate distance from current location to target coordinates
 */
export async function calculateDistanceToLocation(
  targetLat: number,
  targetLon: number
): Promise<string | null> {
  try {
    const currentLocation = await getCurrentLocation();
    if (!currentLocation) {
      return null;
    }

    const distanceKm = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      targetLat,
      targetLon
    );

    return formatDistance(distanceKm);
  } catch (error) {
    console.error('Error calculating distance:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates
 */
export function getDistanceBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
  return formatDistance(distanceKm);
}

/**
 * Open maps app with directions to location
 */
export async function openDirections(latitude: number, longitude: number): Promise<void> {
  try {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    await Linking.openURL(url);
  } catch (error) {
    console.error('Error opening directions:', error);
  }
}

/**
 * Call phone number
 */
export async function callPhone(phoneNumber: string): Promise<void> {
  try {
    await Linking.openURL(`tel:${phoneNumber}`);
  } catch (error) {
    console.error('Error calling phone:', error);
  }
}

