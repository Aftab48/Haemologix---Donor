import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InfoCardProps {
  hospitalName: string;
  urgency: 'Critical' | 'Urgent' | 'Normal';
  bloodType: string;
  distance: string;
  time: string;
  units: number;
  description: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onDirections?: () => void;
  onCall?: () => void;
  disabled?: boolean;
  responded?: boolean;
  response?: 'accept' | 'decline';
}

export default function InfoCard({
  hospitalName,
  urgency,
  bloodType,
  distance,
  time,
  units,
  description,
  onAccept,
  onDecline,
  onDirections,
  onCall,
  disabled = false,
  responded = false,
  response,
}: InfoCardProps) {
  const urgencyColor = urgency === 'Critical' ? 'bg-primary' : 'bg-orange-500';
  const isDisabled = disabled || responded;
  
  return (
    <View className="bg-black/30 rounded-2xl p-4 mb-4 backdrop-blur-sm">
      <View className="mb-3">
        <Text className="text-white text-lg font-bold mb-2">{hospitalName}</Text>
        <View className="flex-row gap-2 mb-2">
          <View className={`${urgencyColor} px-3 py-1 rounded-full`}>
            <Text className="text-white text-xs font-semibold">{urgency}</Text>
          </View>
          <View className="bg-gray-700/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs">Blood type: {bloodType}</Text>
          </View>
          {responded && response && (
            <View className={`${response === 'accept' ? 'bg-green-500' : 'bg-red-500'} px-3 py-1 rounded-full`}>
              <Text className="text-white text-xs font-semibold">
                {response === 'accept' ? 'Accepted' : 'Declined'}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-white/80 text-sm mb-3">{description}</Text>
      </View>

      <View className="flex-row flex-wrap gap-2 mb-4">
        <View className="flex-row items-center gap-1">
          <Ionicons name="location" size={14} color="#FFFFFF" />
          <Text className="text-white/70 text-xs">{distance}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons name="time" size={14} color="#FFFFFF" />
          <Text className="text-white/70 text-xs">{time}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons name="water" size={14} color="#FFFFFF" />
          <Text className="text-white/70 text-xs">{units} units needed</Text>
        </View>
      </View>

      {responded && response === 'accept' ? (
        <View className="bg-green-500/20 border border-green-500 rounded-xl p-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-green-200 text-sm font-semibold">
              You have accepted this request. The hospital will contact you shortly.
            </Text>
          </View>
        </View>
      ) : responded && response === 'decline' ? (
        <View className="bg-gray-500/20 border border-gray-500 rounded-xl p-3">
          <Text className="text-gray-300 text-sm text-center">
            You have declined this request.
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity
            onPress={onAccept}
            disabled={isDisabled}
            className={`rounded-xl px-4 py-3 flex-1 min-w-[45%] ${isDisabled ? 'bg-gray-500/50 opacity-50' : 'bg-highlight'}`}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="checkmark-circle" size={18} color={isDisabled ? "#9CA3AF" : "#1E1E1E"} />
              <Text className={`font-semibold text-sm ${isDisabled ? 'text-gray-400' : 'text-dark'}`}>
                Accept and Donate
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onDecline}
            disabled={isDisabled}
            className={`rounded-xl px-4 py-3 flex-1 min-w-[45%] ${isDisabled ? 'bg-gray-500/50 opacity-50' : 'bg-gray-300'}`}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="close-circle" size={18} color={isDisabled ? "#9CA3AF" : "#1E1E1E"} />
              <Text className={`font-semibold text-sm ${isDisabled ? 'text-gray-400' : 'text-dark'}`}>
                Can't Donate
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onDirections}
            className="bg-gray-300 rounded-xl px-4 py-3 flex-1 min-w-[45%]"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="map" size={18} color="#1E1E1E" />
              <Text className="text-dark font-semibold text-sm">Get directions</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onCall}
            className="bg-highlight rounded-xl px-4 py-3 flex-1 min-w-[45%]"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="call" size={18} color="#1E1E1E" />
              <Text className="text-dark font-semibold text-sm">Call us</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

