import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DreamCard({ dream, onPress }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getMoodColor = (mood) => {
    const colors = {
      peaceful: 'bg-green-500/20 text-green-300',
      exciting: 'bg-orange-500/20 text-orange-300',
      scary: 'bg-red-500/20 text-red-300',
      strange: 'bg-purple-500/20 text-purple-300',
      romantic: 'bg-pink-500/20 text-pink-300',
      sad: 'bg-blue-500/20 text-blue-300',
    };
    return colors[mood] || colors.peaceful;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-4"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full items-center justify-center">
            <Text className="text-white text-sm font-bold">
              {dream.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="ml-3">
            <Text className="text-white font-semibold">{dream.username}</Text>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={12} color="#9ca3af" />
              <Text className="text-gray-400 text-sm ml-1">{formatDate(dream.createdAt)}</Text>
            </View>
          </View>
        </View>
        
        <View className="flex-row items-center space-x-2">
          {dream.hasImage && (
            <View className="bg-purple-500/20 px-2 py-1 rounded-full">
              <Ionicons name="color-palette-outline" size={12} color="#8b5cf6" />
            </View>
          )}
          {dream.hasAnalysis && (
            <View className="bg-blue-500/20 px-2 py-1 rounded-full">
              <Ionicons name="brain-outline" size={12} color="#3b82f6" />
            </View>
          )}
          <View className={`px-3 py-1 rounded-full ${getMoodColor(dream.mood)}`}>
            <Text className="text-xs font-medium capitalize">{dream.mood}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="mb-3">
        <Text className="text-xl font-bold text-white mb-2">{dream.title}</Text>
        <Text className="text-gray-300 leading-relaxed" numberOfLines={3}>
          {dream.content}
        </Text>
      </View>

      {/* Tags */}
      {dream.tags && dream.tags.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {dream.tags.slice(0, 3).map((tag, index) => (
            <View key={index} className="bg-gray-700/50 px-2 py-1 rounded-full mr-2 mb-1">
              <Text className="text-gray-300 text-xs">#{tag}</Text>
            </View>
          ))}
          {dream.tags.length > 3 && (
            <View className="bg-gray-700/50 px-2 py-1 rounded-full">
              <Text className="text-gray-400 text-xs">+{dream.tags.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {/* Engagement */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-4">
          <View className="flex-row items-center">
            <Ionicons name="heart-outline" size={16} color="#9ca3af" />
            <Text className="text-gray-400 text-sm ml-1">{dream.likes}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="chatbubble-outline" size={16} color="#9ca3af" />
            <Text className="text-gray-400 text-sm ml-1">{dream.comments}</Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward-outline" size={20} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );
}