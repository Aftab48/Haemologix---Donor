// Authentication utilities and context

import * as SecureStore from 'expo-secure-store';
import { userApi, authApi } from './api';
import type { DonorData } from './types';

const TOKEN_KEY = 'auth_token';
const USER_EMAIL_KEY = 'user_email';
const USER_DATA_KEY = 'user_data';

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const email = await SecureStore.getItemAsync(USER_EMAIL_KEY);
    return !!(token && email);
  } catch {
    return false;
  }
}

/**
 * Get stored user data
 */
export async function getStoredUser(): Promise<DonorData | null> {
  try {
    const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

/**
 * Store user data
 */
export async function storeUser(user: DonorData): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
}

/**
 * Clear stored user data
 */
export async function clearStoredUser(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string): Promise<{ success: boolean; user?: DonorData; error?: string }> {
  try {
    const response = await authApi.signIn(email, password);
    
    if (response.success && response.data) {
      await storeUser(response.data.user);
      return {
        success: true,
        user: response.data.user,
      };
    }

    return {
      success: false,
      error: response.error || 'Sign in failed',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Sign in failed',
    };
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  await authApi.signOut();
  await clearStoredUser();
}

/**
 * Get current user (from API or cache)
 */
export async function getCurrentUser(forceRefresh = false): Promise<DonorData | null> {
  try {
    if (!forceRefresh) {
      const cached = await getStoredUser();
      if (cached) return cached;
    }

    const response = await userApi.getCurrentUser();
    if (response.success && response.data) {
      await storeUser(response.data);
      return response.data;
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    // Return cached user if API fails
    return await getStoredUser();
  }
}

/**
 * Update user availability
 */
export async function updateAvailability(isAvailable: boolean): Promise<boolean> {
  try {
    const response = await userApi.updateAvailability(isAvailable);
    if (response.success) {
      // Update cached user data
      const user = await getStoredUser();
      if (user) {
        user.isAvailable = isAvailable;
        await storeUser(user);
      }
    }
    return response.success;
  } catch (error) {
    console.error('Error updating availability:', error);
    return false;
  }
}

