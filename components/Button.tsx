import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'right',
  className = '',
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-2xl p-4 ${isPrimary ? 'bg-primary' : 'bg-white'} ${className}`}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center gap-2">
        {icon && iconPosition === 'left' && (
          <Ionicons
            name={icon}
            size={20}
            color={isPrimary ? '#FFFFFF' : '#9B2226'}
          />
        )}
        <Text
          className={`text-base font-semibold ${isPrimary ? 'text-white' : 'text-primary'}`}
        >
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <Ionicons
            name={icon}
            size={20}
            color={isPrimary ? '#FFFFFF' : '#9B2226'}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

