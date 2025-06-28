import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import DreamCard from '../components/DreamCard';
import PremiumBadge from '../components/PremiumBadge';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { subscriptionStatus } = useSubscription();
  const [dreams, setDreams] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {
      // Load sample dreams for demo
      const sampleDreams = [
        {
          id: '1',
          userId: 'sample1',
          username: 'DreamWeaver',
          title: 'Flying Over the Ocean',
          content: 'I found myself soaring above crystal-clear waters, the wind carrying me effortlessly. Below, I could see dolphins dancing in the waves.',
          mood: 'peaceful',
          tags: ['flying', 'ocean', 'dolphins'],
          isPublic: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          likes: 23,
          comments: 5,
          hasAnalysis: true,
          hasImage: true
        },
        {
          id: '2',
          userId: 'sample2',
          username: 'StarGazer',
          title: 'The Cosmic Library',
          content: 'I wandered through an infinite library where each book contained the dreams of different people. The shelves stretched to the stars.',
          mood: 'strange',
          tags: ['library', 'books', 'stars'],
          isPublic: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          likes: 34,
          comments: 8,
          hasAnalysis: false,
          hasImage: false
        }
      ];
      setDreams(sampleDreams);
    } catch (error) {
      console.error('Error loading dreams:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDreams();
    setRefreshing(false);
  };

  const userDreams = dreams.filter(dream => dream.userId === user?.id) || [];
  const publicDreams = dreams.filter(dream => dream.isPublic);

  return (
    <ScrollView 
      className="flex-1 bg-gray-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
      }
    >
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-white">
              Welcome back, {user?.username}!
            </Text>
            <Text className="text-gray-300">
              Discover what the community has been dreaming about
            </Text>
          </View>
          {subscriptionStatus.isSubscribed && (
            <PremiumBadge variant="default" />
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Record')}
          className="bg-gradient-to-r from-purple-600 to-blue-600 py-4 px-6 rounded-lg flex-row items-center justify-center"
        >
          <Ionicons name="add-outline" size={24} color="white" />
          <Text className="text-white text-lg font-medium ml-2">Record Dream</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View className="px-6 mb-6">
        <View className="flex-row space-x-4">
          <View className="flex-1 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
            <View className="flex-row items-center">
              <View className="bg-purple-500/20 p-3 rounded-lg">
                <Ionicons name="trending-up-outline" size={24} color="#8b5cf6" />
              </View>
              <View className="ml-3">
                <Text className="text-gray-400 text-sm">Total Dreams</Text>
                <Text className="text-2xl font-bold text-white">{publicDreams.length}</Text>
              </View>
            </View>
          </View>
          
          <View className="flex-1 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
            <View className="flex-row items-center">
              <View className="bg-blue-500/20 p-3 rounded-lg">
                <Ionicons name="person-outline" size={24} color="#3b82f6" />
              </View>
              <View className="ml-3">
                <Text className="text-gray-400 text-sm">Your Dreams</Text>
                <Text className="text-2xl font-bold text-white">{userDreams.length}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Premium Features Showcase */}
      {!subscriptionStatus.isSubscribed && (
        <View className="px-6 mb-6">
          <View className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
            <View className="flex-row items-center mb-4">
              <Ionicons name="star-outline" size={32} color="#8b5cf6" />
              <Text className="text-xl font-bold text-white ml-3">Unlock Premium</Text>
            </View>
            <Text className="text-gray-300 mb-4">
              Get advanced Jungian & Freudian analysis, AI voice narration, and priority processing.
            </Text>
            <TouchableOpacity className="bg-gradient-to-r from-purple-600 to-blue-600 py-3 px-6 rounded-lg">
              <Text className="text-white font-medium text-center">Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Dreams Feed */}
      <View className="px-6">
        <Text className="text-2xl font-bold text-white mb-4">Community Dreams</Text>
        
        {publicDreams.length === 0 ? (
          <View className="bg-gray-800/30 p-8 rounded-xl border border-gray-700/50">
            <Ionicons name="moon-outline" size={48} color="#6b7280" style={{ alignSelf: 'center' }} />
            <Text className="text-gray-400 text-lg text-center mt-4">
              No dreams to display yet.
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Be the first to share your dream!
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {publicDreams.map((dream) => (
              <DreamCard 
                key={dream.id} 
                dream={dream} 
                onPress={() => navigation.navigate('DreamView', { dream })}
              />
            ))}
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="px-6 py-8 mt-8 border-t border-gray-700/50">
        <Text className="text-gray-400 text-xs text-center">
          AI analysis powered by Pica OneTool • Art generation via Replicate FLUX.1
        </Text>
        <Text className="text-gray-400 text-xs text-center mt-1">
          Built with Bolt.new
        </Text>
      </View>
    </ScrollView>
  );
}