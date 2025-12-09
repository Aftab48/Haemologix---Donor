import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { donationApi } from '../lib/api';
import type { DonationHistory } from '../lib/types';

export default function DonationHistoryScreen() {
  const router = useRouter();
  const { user, isAuth } = useAuth();
  const [donations, setDonations] = useState<DonationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuth) {
      router.replace('/register');
      return;
    }

    if (user?.id) {
      fetchDonationHistory();
    }
  }, [user, isAuth, router]);

  async function fetchDonationHistory() {
    try {
      setError(null);
      if (!user?.id) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const response = await donationApi.getDonationHistory(user.id);

      if (response.success && response.data) {
        setDonations(response.data);
      } else {
        setError(response.error || 'Failed to load donation history');
        // Set empty array as fallback
        setDonations([]);
      }
    } catch (err: any) {
      console.error('Error fetching donation history:', err);
      setError(err.message || 'Failed to load donation history');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <GradientBackground colors={['#005F73', '#9B2226']}>
        <SafeAreaView className="flex-1" edges={['top']}>
          <LoadingSpinner message="Loading donation history..." />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground colors={['#005F73', '#9B2226']}>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1">
          {/* Header */}
          <View className="bg-primary px-6 py-4 flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Donation History</Text>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 96 }}
            showsVerticalScrollIndicator={false}
          >
            {error && (
              <View className="px-6 mt-4">
                <ErrorAlert message={error} onDismiss={() => setError(null)} onRetry={fetchDonationHistory} />
              </View>
            )}

            {donations.length === 0 ? (
              <View className="flex-1 justify-center items-center px-6 py-12">
                <Logo showLabel={false} size="small" />
                <Text className="text-white text-xl font-semibold mt-6 mb-2">
                  No Donation History
                </Text>
                <Text className="text-white/70 text-center text-sm">
                  Your donation history will appear here once you start donating.
                </Text>
              </View>
            ) : (
              <View className="px-6 mt-4">
                {donations.map((donation) => (
                  <View
                    key={donation.id}
                    className="bg-white/90 rounded-2xl p-4 mb-4"
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-dark text-lg font-bold mb-1">
                          {donation.hospital}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {new Date(donation.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View className={`${getStatusColor(donation.status)} px-3 py-1 rounded-full`}>
                        <Text className="text-white text-xs font-semibold">
                          {donation.status}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row gap-4 mt-3">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="water" size={16} color="#9B2226" />
                        <Text className="text-gray-600 text-sm">
                          {donation.bloodType}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="flask" size={16} color="#9B2226" />
                        <Text className="text-gray-600 text-sm">
                          {donation.units} unit{donation.units !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

