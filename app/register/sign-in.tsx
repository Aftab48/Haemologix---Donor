import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function SignInScreen() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        router.replace('/(tabs)/dashboard');
      } else {
        Alert.alert('Sign In Failed', result.error || 'Invalid email or password. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Coming Soon', 'Google sign-in will be available soon. Please use email and password for now.');
  };

  if (isLoading || loading) {
    return (
      <GradientBackground colors={['#E9D8A6', '#94D2BD']}>
        <View className="flex-1 justify-center items-center">
          <LoadingSpinner message="Signing in..." />
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground colors={['#E9D8A6', '#94D2BD']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
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
            <View className="bg-white/80 rounded-2xl p-6 backdrop-blur-sm">
              <Text className="text-primary text-3xl font-bold mb-2">
                Sign in to your account
              </Text>
              <Text className="text-gray-600 text-sm mb-6">
                Welcome back! Please sign in to continue.
              </Text>

              {/* Google Button */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                className="bg-primary rounded-2xl p-4 mb-6 flex-row items-center justify-center gap-3"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-2">
                  <View className="w-5 h-5 bg-white rounded-full items-center justify-center">
                    <Text className="text-primary font-bold text-xs">G</Text>
                  </View>
                  <Text className="text-white font-semibold text-base">
                    Continue with Google
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Separator */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="px-4 text-gray-500 text-sm">OR</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Form Fields */}
              <View className="gap-4 mb-6">
                <View>
                  <TextInput
                    placeholder="Email address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="border-b-2 border-gray-300 pb-2 text-base"
                    placeholderTextColor="#9CA3AF"
                    editable={!isLoading}
                  />
                  {errors.email && (
                    <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
                  )}
                </View>
                <View>
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    secureTextEntry
                    autoComplete="password"
                    className="border-b-2 border-gray-300 pb-2 text-base"
                    placeholderTextColor="#9CA3AF"
                    editable={!isLoading}
                  />
                  {errors.password && (
                    <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
                  )}
                </View>
              </View>

              {/* Sign In Button */}
              <Button
                title="Sign In"
                onPress={handleSignIn}
                variant="primary"
                icon="arrow-forward"
                iconPosition="right"
              />

              <Text className="text-gray-500 text-xs text-center mt-4">
                Note: You must be registered as a donor through the web application first.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
