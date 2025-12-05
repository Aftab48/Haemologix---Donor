// Error alert component

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export default function ErrorAlert({ message, onDismiss, onRetry }: ErrorAlertProps) {
  return (
    <View className="bg-red-500/20 border border-red-500 rounded-2xl p-4 mb-4">
      <View className="flex-row items-start gap-3">
        <Ionicons name="alert-circle" size={24} color="#EF4444" />
        <View className="flex-1">
          <Text className="text-red-400 font-semibold text-base mb-1">
            Error
          </Text>
          <Text className="text-red-300 text-sm">{message}</Text>
          {(onDismiss || onRetry) && (
            <View className="flex-row gap-3 mt-3">
              {onRetry && (
                <TouchableOpacity
                  onPress={onRetry}
                  className="bg-red-500 rounded-lg px-4 py-2"
                >
                  <Text className="text-white text-sm font-semibold">Retry</Text>
                </TouchableOpacity>
              )}
              {onDismiss && (
                <TouchableOpacity
                  onPress={onDismiss}
                  className="bg-red-500/50 rounded-lg px-4 py-2"
                >
                  <Text className="text-white text-sm font-semibold">Dismiss</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

