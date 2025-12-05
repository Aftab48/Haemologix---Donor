// Loading spinner component

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export default function LoadingSpinner({
  message,
  size = 'large',
  color = '#9B2226',
}: LoadingSpinnerProps) {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-white/80 text-base mt-4 text-center">
          {message}
        </Text>
      )}
    </View>
  );
}

