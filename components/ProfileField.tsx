import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

export default function ProfileField({ icon, label, value }: ProfileFieldProps) {
  return (
    <View className="bg-gray-200 rounded-xl p-4 flex-row items-center gap-3 mb-3">
      <Ionicons name={icon} size={24} color="#1E1E1E" />
      <View className="flex-1">
        <Text className="text-gray-600 text-xs mb-1">{label}</Text>
        <Text className="text-dark text-base font-semibold">{value}</Text>
      </View>
    </View>
  );
}

