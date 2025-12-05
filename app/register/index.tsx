import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import Logo from '../../components/Logo';

export default function RegisterIndex() {
  const router = useRouter();

  return (
    <GradientBackground colors={['#E9D8A6', '#94D2BD']}>
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo */}
        <View className="items-center mb-8">
          <Logo showLabel={true} size="medium" />
          
          <TouchableOpacity className="bg-primary px-6 py-2 rounded-full mt-4 mb-6">
            <Text className="text-white font-semibold text-sm">FOR DONORS</Text>
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <View className="w-full h-px bg-gray-300 mb-8" />

        {/* Action Buttons */}
        <View className="w-full gap-4">
          <TouchableOpacity
            className="bg-primary rounded-2xl p-4 w-full"
            onPress={() => router.push('/register/sign-up')}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Register as a Donor
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-600 text-center text-sm mb-2">
            Already have an account?
          </Text>

          <TouchableOpacity
            className="bg-white rounded-2xl p-4 w-full border-2 border-primary"
            onPress={() => router.push('/register/sign-in')}
            activeOpacity={0.8}
          >
            <Text className="text-primary text-center font-semibold text-lg">
              Sign-In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}

