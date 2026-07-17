import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import ProfileField from '../../components/ProfileField';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { useDemoSandbox } from '../../contexts/DemoSandboxContext';
import { calculateNextEligible, getEligibilityProgress, formatLastActivity } from '../../lib/utils';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, isAuth } = useAuth();
  const { user, updateUserAvailability } = useUser();
  const demo = useDemoSandbox();
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  useEffect(() => {
    if (isAuth && user) {
      setIsAvailable(user.isAvailable ?? true);
      setLoading(false);
    } else if (!isAuth) {
      router.replace('/register');
    }
  }, [user, isAuth, router]);

  const handleToggleAvailability = async (value: boolean) => {
    setUpdatingAvailability(true);
    setIsAvailable(value);
    
    const success = await updateUserAvailability(value);
    
    if (!success) {
      // Revert on failure
      setIsAvailable(!value);
      Alert.alert('Error', 'Failed to update availability. Please try again.');
    } else {
      Alert.alert(
        value ? 'Available' : 'Unavailable',
        `You are now ${value ? 'available' : 'unavailable'} to receive donation alerts.`
      );
    }
    
    setUpdatingAvailability(false);
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen when implemented
    Alert.alert('Coming Soon', 'Profile editing will be available soon.');
  };

  const handleDonationHistory = () => {
    // Navigate to donation history screen
    router.push('/donation-history');
  };

  const handleManageAccount = () => {
    if (demo.active) {
      Alert.alert(
        'Shared Demo',
        'This app controls the same global sandbox as the donor, hospital, and admin web demos.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset Shared Demo',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Reset for Everyone?',
                'This resets the shared sandbox for every mobile app and all open web demo dashboards.',
                [
                  { text: 'Keep Demo', style: 'cancel' },
                  {
                    text: 'Reset Demo',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await demo.reset();
                        Alert.alert('Demo Reset', 'The shared demo has returned to its baseline data.');
                      } catch (error) {
                        Alert.alert('Reset Unavailable', error instanceof Error ? error.message : 'Please try again.');
                      }
                    },
                  },
                ]
              );
            },
          },
          {
            text: 'Exit Demo',
            onPress: async () => {
              await demo.exitDemo();
              router.replace('/register');
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Manage Account',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/register');
          },
        },
      ]
    );
  };

  const calculateAge = (dateOfBirth?: string): number | null => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading || !user) {
    return (
      <GradientBackground colors={['#005F73', '#9B2226']}>
        <SafeAreaView className="flex-1" edges={['top']}>
          <LoadingSpinner message="Loading profile..." />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const age = calculateAge(user.dateOfBirth);
  const eligibilityProgress = getEligibilityProgress(user.lastDonation);
  const nextEligible = calculateNextEligible(user.lastDonation);
  const eligibilityStatus = eligibilityProgress >= 100 ? 'Eligible' : 'Not Eligible Yet';
  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || user.email?.split('@')[0] || 'Donor';

  return (
    <GradientBackground colors={['#005F73', '#9B2226']}>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="bg-primary px-6 py-4 mb-6">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full border-2 border-white items-center justify-center">
                <Ionicons name="water" size={20} color="#FFFFFF" />
              </View>
              <Text className="text-white text-xl font-bold">Donor Profile</Text>
            </View>
          </View>

          {/* Profile Card */}
          <View className="mx-6 mb-6 bg-white/90 rounded-2xl p-6">
            {/* Avatar */}
            <View className="items-center mb-6">
              <View className="w-24 h-24 rounded-full bg-secondary items-center justify-center mb-4">
                <Ionicons name="person" size={50} color="#FFFFFF" />
              </View>
              <Text className="text-dark text-2xl font-bold mb-1">
                {fullName}
              </Text>
              <Text className="text-gray-600 text-base">
                {user.email}
              </Text>
              {user.status && (
                <View className={`mt-2 px-3 py-1 rounded-full ${
                  user.status === 'APPROVED' ? 'bg-green-500' : 
                  user.status === 'REJECTED' ? 'bg-red-500' : 
                  'bg-yellow-500'
                }`}>
                  <Text className="text-white text-xs font-semibold">
                    {user.status}
                  </Text>
                </View>
              )}
            </View>

            {/* Profile Fields */}
            <View className="mb-6">
              {user.bloodGroup && (
                <ProfileField
                  icon="water"
                  label="Blood type"
                  value={user.bloodGroup}
                />
              )}
              {age !== null && (
                <ProfileField
                  icon="calendar"
                  label="Age"
                  value={`${age} years`}
                />
              )}
              {user.address && (
                <ProfileField
                  icon="location"
                  label="Location"
                  value={user.address}
                />
              )}
              <ProfileField
                icon="checkmark-circle"
                label="Eligibility Status"
                value={eligibilityStatus}
              />
              {user.lastDonation && (
                <ProfileField
                  icon="time"
                  label="Last Donation"
                  value={formatLastActivity(user.lastDonation, false)}
                />
              )}
              <ProfileField
                icon="calendar-outline"
                label="Next Eligible"
                value={nextEligible}
              />
            </View>

            {/* Eligibility Progress */}
            {user.lastDonation && (
              <View className="mb-6">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Eligibility Progress</Text>
                  <Text className="text-gray-600 text-sm">{Math.round(eligibilityProgress)}%</Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${eligibilityProgress}%` }}
                  />
                </View>
              </View>
            )}

            {/* The shared synthetic profile is intentionally read-only. */}
            {!demo.active && (
              <Button
                title="Edit Profile"
                onPress={handleEditProfile}
                variant="primary"
              />
            )}
          </View>

          {/* Additional Options */}
          <View className="mx-6 gap-3">
            {/* Toggle Availability */}
            <TouchableOpacity 
              className="bg-white/90 rounded-2xl p-4 flex-row items-center justify-between"
              disabled={updatingAvailability}
            >
              <View className="flex-1">
                <Text className="text-dark text-base font-semibold">
                  Toggle availability
                </Text>
                <Text className="text-gray-600 text-xs mt-1">
                  {isAvailable ? 'You will receive donation alerts' : 'You will not receive alerts'}
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={handleToggleAvailability}
                disabled={updatingAvailability}
                trackColor={{ false: '#E5E7EB', true: '#9B2226' }}
                thumbColor={isAvailable ? '#FFFFFF' : '#9CA3AF'}
              />
            </TouchableOpacity>

            {/* Donation History */}
            <TouchableOpacity
              className="bg-white/90 rounded-2xl p-4 flex-row items-center justify-between"
              onPress={handleDonationHistory}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="time-outline" size={24} color="#1E1E1E" />
                <Text className="text-dark text-base font-semibold">
                  Donation history
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1E1E1E" />
            </TouchableOpacity>

            {/* Manage Account */}
            <TouchableOpacity
              className="bg-white/90 rounded-2xl p-4 flex-row items-center justify-between"
              onPress={handleManageAccount}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="settings-outline" size={24} color="#1E1E1E" />
                <Text className="text-dark text-base font-semibold">
                  Manage account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1E1E1E" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
