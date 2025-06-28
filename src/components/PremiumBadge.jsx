import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PremiumBadge({ variant = 'default', showIcon = true }) {
  const variants = {
    small: 'px-2 py-1',
    default: 'px-3 py-1',
    large: 'px-4 py-2'
  };

  const textSizes = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-base'
  };

  const iconSizes = {
    small: 12,
    default: 14,
    large: 16
  };

  return (
    <View className={`
      flex-row items-center space-x-1 
      bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
      border border-yellow-500/30 
      rounded-full
      ${variants[variant]}
    `}>
      {showIcon && <Ionicons name="crown-outline" size={iconSizes[variant]} color="#fbbf24" />}
      <Text className={`text-yellow-300 font-medium ${textSizes[variant]}`}>
        Premium
      </Text>
    </View>
  );
}