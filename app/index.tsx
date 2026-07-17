import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '../components/GradientBackground';
import Logo from '../components/Logo';
import { useDemoSandbox } from '../contexts/DemoSandboxContext';

export default function SplashScreen() {
  const router = useRouter();
  const { active, initializing } = useDemoSandbox();

  useEffect(() => {
    if (initializing) return;
    if (active) {
      router.replace('/(tabs)/dashboard');
      return;
    }
    const timer = setTimeout(() => {
      router.replace('/register');
    }, 2000);

    return () => clearTimeout(timer);
  }, [active, initializing, router]);

  return (
    <GradientBackground colors={['#E9D8A6', '#94D2BD']}>
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-6">
          <Logo showLabel={true} size="medium" />
          
          {/* FOR DONORS Button */}
          <TouchableOpacity
            className="bg-primary px-6 py-2 rounded-full mt-4"
            onPress={() => router.replace('/register')}
          >
            <Text className="text-white font-semibold text-sm">FOR DONORS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}
