import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';

interface LogoProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ showLabel = true, size = 'medium' }: LogoProps) {
  const sizes = {
    small: { image: 60, text: 'text-2xl' },
    medium: { image: 100, text: 'text-4xl' },
    large: { image: 150, text: 'text-5xl' },
  };

  const sizeConfig = sizes[size];

  return (
    <View className="items-center">
      <Image
        source={require('../assets/assets/Logos - transparent bg/primary 1.png')}
        style={{ width: sizeConfig.image, height: sizeConfig.image }}
        contentFit="contain"
      />
      {/* App Name */}
      {showLabel && (
        <View className="flex-row items-center mt-2">
          <Text className={`text-primary ${sizeConfig.text} font-bold`}>Haemo</Text>
          <Text className={`text-secondary ${sizeConfig.text} font-bold`}>logix</Text>
        </View>
      )}
    </View>
  );
}

