import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import InfoCard from '../../components/InfoCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import Logo from '../../components/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { alertsApi } from '../../lib/api';
import { getCurrentLocation, calculateDistanceToLocation, openDirections, callPhone } from '../../lib/location';
import { isCompatible, formatUrgency, type BloodTypeFormat } from '../../lib/utils';
import type { Alert as AlertType } from '../../lib/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isAuth } = useAuth();
  const { user: userData, updateUserAvailability } = useUser();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [respondingAlerts, setRespondingAlerts] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuth) {
      router.replace('/register');
    }
  }, [isAuth, loading, router]);

  // Get user location on mount
  useEffect(() => {
    loadUserLocation();
  }, []);

  // Fetch alerts
  useEffect(() => {
    if (isAuth) {
      fetchAlerts();
      // Set up polling every 30 seconds
      const interval = setInterval(fetchAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuth]);

  async function loadUserLocation() {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation({ lat: location.latitude, lon: location.longitude });
      }
    } catch (error) {
      console.error('Error loading user location:', error);
    }
  }

  async function fetchAlerts() {
    try {
      setError(null);
      const response = await alertsApi.getAllAlerts();

      if (response.success && response.data) {
        let processedAlerts = response.data;

        // Calculate distances if we have user location
        if (userLocation && userData) {
          processedAlerts = await Promise.all(
            response.data.map(async (alert) => {
              if (alert.latitude && alert.longitude) {
                try {
                  const distance = await calculateDistanceToLocation(
                    parseFloat(alert.latitude),
                    parseFloat(alert.longitude)
                  );
                  if (distance) {
                    return { ...alert, distance };
                  }
                } catch (error) {
                  console.error('Error calculating distance:', error);
                }
              }
              return alert;
            })
          );
        }

        // Filter alerts by blood type compatibility
        if (userData?.bloodGroup) {
          processedAlerts = processedAlerts.filter((alert) =>
            isCompatible(userData.bloodGroup as BloodTypeFormat, alert.bloodType)
          );
        }

        // Sort by urgency and distance
        processedAlerts.sort((a, b) => {
          const urgencyOrder = { Critical: 0, Urgent: 1, Normal: 2 };
          const aUrgency = formatUrgency(a.urgency);
          const bUrgency = formatUrgency(b.urgency);
          if (urgencyOrder[aUrgency] !== urgencyOrder[bUrgency]) {
            return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
          }
          // Then by distance
          const aDist = parseFloat(a.distance) || Infinity;
          const bDist = parseFloat(b.distance) || Infinity;
          return aDist - bDist;
        });

        setAlerts(processedAlerts);
      } else {
        setError(response.error || 'Failed to load alerts');
      }
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      setError(err.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUserLocation();
    fetchAlerts();
  }, []);

  const handleAccept = async (alert: AlertType) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    if (alert.responded) {
      Alert.alert('Already Responded', 'You have already responded to this alert.');
      return;
    }

    // Check blood type compatibility
    if (userData?.bloodGroup && !isCompatible(userData.bloodGroup as BloodTypeFormat, alert.bloodType)) {
      Alert.alert(
        'Incompatible Blood Type',
        `Your blood type (${userData.bloodGroup}) is not compatible with the required type (${alert.bloodType}).`
      );
      return;
    }

    setRespondingAlerts((prev) => new Set(prev).add(alert.id));

    try {
      const response = await alertsApi.respondToAlert(alert.id, 'accept', user.id, 45);

      if (response.success) {
        Alert.alert(
          'Thank You!',
          response.data?.message || 'You have accepted this donation request. The hospital will contact you shortly.'
        );
        // Update alert status
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alert.id ? { ...a, responded: true, response: 'accept' } : a
          )
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to accept alert. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept alert. Please try again.');
    } finally {
      setRespondingAlerts((prev) => {
        const next = new Set(prev);
        next.delete(alert.id);
        return next;
      });
    }
  };

  const handleDecline = async (alert: AlertType) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    if (alert.responded) {
      Alert.alert('Already Responded', 'You have already responded to this alert.');
      return;
    }

    Alert.alert(
      'Decline Request',
      'Are you sure you cannot donate for this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setRespondingAlerts((prev) => new Set(prev).add(alert.id));

            try {
              const response = await alertsApi.respondToAlert(alert.id, 'decline', user.id);

              if (response.success) {
                // Update alert status
                setAlerts((prev) =>
                  prev.map((a) =>
                    a.id === alert.id ? { ...a, responded: true, response: 'decline' } : a
                  )
                );
              } else {
                Alert.alert('Error', response.error || 'Failed to decline alert. Please try again.');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to decline alert. Please try again.');
            } finally {
              setRespondingAlerts((prev) => {
                const next = new Set(prev);
                next.delete(alert.id);
                return next;
              });
            }
          },
        },
      ]
    );
  };

  const handleDirections = async (alert: AlertType) => {
    if (alert.latitude && alert.longitude) {
      try {
        await openDirections(parseFloat(alert.latitude), parseFloat(alert.longitude));
      } catch (error) {
        Alert.alert('Error', 'Failed to open directions. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Location information not available for this hospital.');
    }
  };

  const handleCall = async (alert: AlertType) => {
    if (alert.contactPhone) {
      try {
        await callPhone(alert.contactPhone);
      } catch (error) {
        Alert.alert('Error', 'Failed to make call. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Contact phone number not available.');
    }
  };

  const toggleAvailability = async () => {
    if (!userData) return;

    const newAvailability = !userData.isAvailable;
    const success = await updateUserAvailability(newAvailability);

    if (success) {
      Alert.alert(
        newAvailability ? 'Available' : 'Unavailable',
        `You are now ${newAvailability ? 'available' : 'unavailable'} to receive donation alerts.`
      );
    } else {
      Alert.alert('Error', 'Failed to update availability. Please try again.');
    }
  };

  if (loading) {
    return (
      <GradientBackground colors={['#005F73', '#9B2226']}>
        <SafeAreaView className="flex-1" edges={['top']}>
          <LoadingSpinner message="Loading alerts..." />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (!isAuth) {
    return null; // Will redirect
  }

  const activeAlerts = alerts.filter((alert) => !alert.responded || alert.response !== 'decline');

  return (
    <GradientBackground colors={['#005F73', '#9B2226']}>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
        >
          {/* Header */}
          <View className="bg-highlight rounded-b-3xl px-6 py-4 mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full border-2 border-secondary items-center justify-center">
                  <Ionicons name="water" size={20} color="#005F73" />
                </View>
                <Text className="text-dark text-xl font-bold">Donor Dashboard</Text>
              </View>
              <TouchableOpacity
                onPress={toggleAvailability}
                className={`px-4 py-2 rounded-full ${userData?.isAvailable ? 'bg-green-500' : 'bg-gray-500'}`}
              >
                <Text className="text-white text-xs font-semibold">
                  {userData?.isAvailable ? 'Available' : 'Unavailable'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome Section */}
          <View className="px-6 mb-6">
            <Text className="text-white text-3xl font-bold mb-2">
              Welcome back, {userData?.firstName || userData?.email?.split('@')[0] || 'Donor'}!
            </Text>
            <Text className="text-white/80 text-lg mb-6">
              Ready to save a life today?
            </Text>

            {/* Active Alerts Tag */}
            <TouchableOpacity className="bg-secondary rounded-2xl px-4 py-3 self-start">
              <Text className="text-white font-semibold">
                Active Alerts ({activeAlerts.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Alert */}
          {error && (
            <View className="px-6 mb-4">
              <ErrorAlert message={error} onDismiss={() => setError(null)} onRetry={fetchAlerts} />
            </View>
          )}

          {/* Availability Warning */}
          {!userData?.isAvailable && (
            <View className="mx-6 mb-4 bg-yellow-500/20 border border-yellow-500 rounded-2xl p-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="information-circle" size={20} color="#FBBF24" />
                <Text className="text-yellow-200 text-sm flex-1">
                  You are marked as unavailable. Turn on availability to receive alerts.
                </Text>
              </View>
            </View>
          )}

          {/* Alerts List */}
          <View className="px-6 mt-4">
            {activeAlerts.length === 0 ? (
              <View className="bg-white/10 rounded-2xl p-8 items-center">
                <Logo showLabel={false} size="small" />
                <Text className="text-white text-lg font-semibold mt-4 mb-2">
                  No Active Alerts
                </Text>
                <Text className="text-white/70 text-center text-sm">
                  {userData?.isAvailable
                    ? "You'll be notified when hospitals in your area need your blood type."
                    : 'Turn on availability to receive alerts.'}
                </Text>
              </View>
            ) : (
              activeAlerts.map((alert) => {
                const isResponding = respondingAlerts.has(alert.id);
                const urgency = formatUrgency(alert.urgency);
                const isCompatibleType = userData?.bloodGroup
                  ? isCompatible(userData.bloodGroup as BloodTypeFormat, alert.bloodType)
                  : true;

                return (
                  <InfoCard
                    key={alert.id}
                    hospitalName={alert.hospitalName}
                    urgency={urgency}
                    bloodType={alert.bloodType}
                    distance={alert.distance}
                    time={alert.timePosted}
                    units={alert.unitsNeeded}
                    description={alert.description}
                    onAccept={() => !isResponding && handleAccept(alert)}
                    onDecline={() => !isResponding && handleDecline(alert)}
                    onDirections={() => handleDirections(alert)}
                    onCall={() => handleCall(alert)}
                    disabled={isResponding || alert.responded || !isCompatibleType}
                    responded={alert.responded}
                    response={alert.response}
                  />
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
