import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LogoProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ showLabel = true, size = 'medium' }: LogoProps) {
  const iconSizes = {
    small: { location: 50, water: 30, radio: 20, text: 'text-2xl' },
    medium: { location: 80, water: 50, radio: 30, text: 'text-4xl' },
    large: { location: 100, water: 60, radio: 40, text: 'text-5xl' },
  };

  const sizes = iconSizes[size];

  return (
    <View className="items-center">
      <View className="relative mb-4">
        {/* Teal outline/pin shape */}
        <View className="absolute inset-0 items-center justify-center">
          <Ionicons name="location" size={sizes.location} color="#005F73" />
        </View>
        {/* Red blood drop with ECG line */}
        <View className="items-center justify-center">
          <Ionicons
            name="water"
            size={sizes.water}
            color="#9B2226"
            style={{ marginTop: sizes.location * 0.2 }}
          />
          <View
            className="absolute bg-white"
            style={{
              width: sizes.water * 0.6,
              height: 2,
              marginTop: sizes.location * 0.25,
            }}
          />
        </View>
        {/* Signal waves */}
        <View className="absolute -right-8 top-2">
          <Ionicons name="radio" size={sizes.radio} color="#005F73" />
        </View>
      </View>

      {/* App Name */}
      {showLabel && (
        <View className="flex-row items-center">
          <Text className={`text-primary ${sizes.text} font-bold`}>Haemo</Text>
          <Text className={`text-secondary ${sizes.text} font-bold`}>logix</Text>
        </View>
      )}
    </View>
  );
}

