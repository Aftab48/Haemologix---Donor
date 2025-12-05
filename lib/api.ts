// API service layer for connecting to haemologix-main backend

import * as SecureStore from 'expo-secure-store';
import type { DonorData, Alert, AlertResponse, ApiResponse, UserProfile, DonationHistory } from './types';

// Production API base URL
const API_BASE_URL = 'https://www.haemologix.in';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_EMAIL_KEY = 'user_email';

/**
 * Get stored auth token
 */
async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Store auth token
 */
async function setAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
}

/**
 * Remove auth token
 */
async function removeAuthToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
}

/**
 * Get stored user email
 */
async function getUserEmail(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(USER_EMAIL_KEY);
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

/**
 * Store user email
 */
async function setUserEmail(email: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
  } catch (error) {
    console.error('Error storing user email:', error);
  }
}

/**
 * Make API request with authentication
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      await removeAuthToken();
      throw new Error('Unauthorized - please sign in again');
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Request failed',
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error(`API request error [${endpoint}]:`, error);
    console.error(`[API] Full URL: ${API_BASE_URL}${endpoint}`);
    console.error(`[API] Error details:`, error);
    
    // Provide helpful error messages
    let errorMessage = error.message || 'Network error';
    if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
      errorMessage = 'Network request failed. Please check your internet connection and ensure the backend is accessible at https://www.haemologix.in';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Sign in with email and password
   * Note: This is a placeholder - actual implementation depends on backend auth system
   */
  async signIn(email: string, password: string): Promise<ApiResponse<{ token: string; user: DonorData }>> {
    try {
      // For now, we'll use email-based lookup since haemologix-main uses Clerk
      // In production, you'd have a proper auth endpoint
      const response = await apiRequest<{ user: DonorData }>(`/api/user?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        // Store email for future API calls
        await setUserEmail(email);
        // In a real implementation, you'd get a token from the auth endpoint
        // For now, we'll use email as identifier
        return {
          success: true,
          data: {
            token: email, // Placeholder - replace with actual token
            user: response.data.user,
          },
        };
      }

      return response as any;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign in failed',
      };
    }
  },

  /**
   * Sign up new donor
   */
  async signUp(userData: Partial<DonorData>): Promise<ApiResponse<{ user: DonorData }>> {
    // This would call the donor registration endpoint
    // For now, return error as registration should go through web app
    return {
      success: false,
      error: 'Please register through the web application first',
    };
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await removeAuthToken();
  },
};

/**
 * User API
 */
export const userApi = {
  /**
   * Get current user profile
   * Note: Requires API route wrapper at /api/user in haemologix-main
   */
  async getCurrentUser(): Promise<ApiResponse<DonorData>> {
    const email = await getUserEmail();
    if (!email) {
      return {
        success: false,
        error: 'No user email found',
      };
    }

    // Call the getCurrentUser endpoint
    // This requires an API route wrapper in haemologix-main: app/api/user/route.ts
    const response = await apiRequest<{ role: string; user: DonorData }>(`/api/user?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.user,
      };
    }

    return {
      success: false,
      error: response.error || 'Failed to get user',
    };
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<DonorData>): Promise<ApiResponse<DonorData>> {
    return apiRequest<DonorData>(`/api/user-update`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        ...data,
      }),
    });
  },

  /**
   * Update availability status
   */
  async updateAvailability(isAvailable: boolean): Promise<ApiResponse<void>> {
    const email = await getUserEmail();
    if (!email) {
      return {
        success: false,
        error: 'No user email found',
      };
    }

    // This would update the donor's availability status
    // Implementation depends on backend structure
    return apiRequest<void>(`/api/user-update`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        isAvailable,
      }),
    });
  },
};

/**
 * Alerts API
 */
export const alertsApi = {
  /**
   * Get all available alerts
   * Note: Requires API route wrapper at /api/alerts/donor in haemologix-main
   */
  async getAllAlerts(): Promise<ApiResponse<Alert[]>> {
    // Call the getAllAvailableAlerts server action via API route
    // This requires an API route wrapper in haemologix-main: app/api/alerts/donor/route.ts
    const response = await apiRequest<Alert[]>(`/api/alerts/donor`, {
      method: 'GET',
    });

    if (response.success && response.data) {
      // Transform alerts to match our Alert type
      const alerts: Alert[] = response.data.map((alert: any) => ({
        id: alert.id,
        hospitalName: alert.hospitalName || 'Unknown Hospital',
        hospitalId: alert.hospitalId,
        bloodType: alert.bloodType,
        urgency: alert.urgency,
        unitsNeeded: alert.unitsNeeded || 0,
        description: alert.description || '',
        location: alert.location || '',
        contactPhone: alert.contactPhone || '',
        timePosted: alert.timePosted || '',
        distance: alert.distance || '0 km',
        responded: alert.responded || false,
        response: alert.response,
        latitude: alert.latitude,
        longitude: alert.longitude,
        status: alert.status,
      }));

      return {
        success: true,
        data: alerts,
      };
    }

    return response;
  },

  /**
   * Respond to an alert (accept or decline)
   */
  async respondToAlert(
    alertId: string,
    status: 'accept' | 'decline',
    donorId: string,
    etaMinutes?: number
  ): Promise<ApiResponse<AlertResponse>> {
    return apiRequest<AlertResponse>(`/api/donor/respond`, {
      method: 'POST',
      body: JSON.stringify({
        donor_id: donorId,
        request_id: alertId,
        status: status === 'accept' ? 'accepted' : 'declined',
        eta_minutes: etaMinutes || 45,
      }),
    });
  },
};

/**
 * Donation History API
 */
export const donationApi = {
  /**
   * Get donation history for current user
   */
  async getDonationHistory(donorId: string): Promise<ApiResponse<DonationHistory[]>> {
    // This would fetch from the response history or donations table
    // Implementation depends on backend structure
    return apiRequest<DonationHistory[]>(`/api/donor/history?donorId=${donorId}`, {
      method: 'GET',
    });
  },
};

// Export token management functions
export { getAuthToken, setAuthToken, removeAuthToken, getUserEmail, setUserEmail };

