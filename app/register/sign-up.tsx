import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

export default function SignUpScreen() {
  const router = useRouter();

  const handleOpenOnboarding = async () => {
    const onboardingUrl = 'https://www.haemologix.in/donor/onboard?utm_source=donor_app&utm_medium=events&utm_campaign=donor_page_view';
    
    try {
      const supported = await Linking.canOpenURL(onboardingUrl);
      if (supported) {
        await Linking.openURL(onboardingUrl);
      } else {
        Alert.alert('Error', 'Unable to open the onboarding page. Please check your internet connection.');
      }
    } catch (error: any) {
      console.error('Error opening onboarding URL:', error);
      Alert.alert('Error', 'Failed to open the onboarding page. Please try again.');
    }
  };

  return (
    <GradientBackground colors={['#E9D8A6', '#94D2BD']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-12">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full border-2 border-primary bg-white items-center justify-center mb-6"
          >
            <Ionicons name="arrow-back" size={20} color="#9B2226" />
          </TouchableOpacity>

          {/* Content Card */}
          <View className="bg-white/80 rounded-2xl p-6 backdrop-blur-sm flex-1 justify-center">
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
                <Ionicons name="person-add" size={40} color="#9B2226" />
              </View>
              <Text className="text-primary text-3xl font-bold mb-2 text-center">
                Become a Donor
              </Text>
              <Text className="text-gray-600 text-base text-center mb-2">
                Complete your donor registration
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                You&apos;ll be redirected to our web portal to complete your donor profile and verification.
              </Text>
            </View>

            {/* Onboarding Button */}
            <Button
              title="Complete Registration"
              onPress={handleOpenOnboarding}
              variant="primary"
              icon="arrow-forward"
              iconPosition="right"
            />

            <Text className="text-gray-500 text-md text-center mt-6">
              Already registered?{' '}
              <Text
                className="text-primary font-semibold"
                onPress={() => router.push('/register/sign-in')}
              >
                Sign in here
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
