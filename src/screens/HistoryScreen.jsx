import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import DreamCard from '../components/DreamCard';

export default function HistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [dreams, setDreams] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStyle, setFilterStyle] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  const analysisStyles = [
    { value: 'all', label: 'All Styles' },
    { value: 'jungian', label: 'Jungian' },
    { value: 'freudian', label: 'Freudian' },
    { value: 'emotional', label: 'Emotional' },
    { value: 'general', label: 'General' }
  ];

  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  useEffect(() => {
    loadUserDreams();
  }, []);

  const loadUserDreams = async () => {
    try {
      // Load user's dreams for demo
      const userDreams = [
        {
          id: '1',
          userId: user?.id,
          username: user?.username,
          title: 'My Flying Dream',
          content: 'I was soaring through clouds, feeling completely free and weightless.',
          mood: 'peaceful',
          tags: ['flying', 'freedom'],
          isPublic: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          likes: 5,
          comments: 2,
          hasAnalysis: true,
          analysisStyle: 'jungian',
          hasImage: true
        }
      ];
      setDreams(userDreams);
    } catch (error) {
      console.error('Error loading user dreams:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserDreams();
    setRefreshing(false);
  };

  const filteredDreams = dreams.filter(dream => {
    // Style filter
    if (filterStyle !== 'all' && dream.analysisStyle !== filterStyle) {
      return false;
    }

    // Date filter
    if (filterDate !== 'all') {
      const dreamDate = new Date(dream.createdAt);
      const now = new Date();
      
      switch (filterDate) {
        case 'today':
          return dreamDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return dreamDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return dreamDate >= monthAgo;
        default:
          return true;
      }
    }

    return true;
  });

  return (
    <ScrollView 
      className="flex-1 bg-gray-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
      }
    >
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center mb-4">
          <Ionicons name="time-outline" size={32} color="#8b5cf6" />
          <View className="ml-3">
            <Text className="text-2xl font-bold text-white">Dream History</Text>
            <Text className="text-gray-300">View and re-analyze your past dreams</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="px-6 mb-6">
        <View className="flex-row space-x-4">
          <View className="flex-1 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
            <View className="flex-row items-center">
              <View className="bg-purple-500/20 p-3 rounded-lg">
                <Ionicons name="book-outline" size={24} color="#8b5cf6" />
              </View>
              <View className="ml-3">
                <Text className="text-gray-400 text-sm">Total Dreams</Text>
                <Text className="text-2xl font-bold text-white">{dreams.length}</Text>
              </View>
            </View>
          </View>
          
          <View className="flex-1 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
            <View className="flex-row items-center">
              <View className="bg-blue-500/20 p-3 rounded-lg">
                <Ionicons name="analytics-outline" size={24} color="#3b82f6" />
              </View>
              <View className="ml-3">
                <Text className="text-gray-400 text-sm">Analyzed</Text>
                <Text className="text-2xl font-bold text-white">
                  {dreams.filter(d => d.hasAnalysis).length}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View className="px-6 mb-6">
        <View className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
          <Text className="text-white font-medium mb-3">Filters</Text>
          
          {/* Style Filter */}
          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2">Analysis Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {analysisStyles.map((style) => (
                  <TouchableOpacity
                    key={style.value}
                    onPress={() => setFilterStyle(style.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      filterStyle === style.value
                        ? 'bg-purple-500/30 border-purple-500'
                        : 'bg-gray-700/50 border-gray-600'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      filterStyle === style.value ? 'text-purple-300' : 'text-gray-300'
                    }`}>
                      {style.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Date Filter */}
          <View>
            <Text className="text-gray-300 text-sm mb-2">Date Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {dateFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter.value}
                    onPress={() => setFilterDate(filter.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      filterDate === filter.value
                        ? 'bg-blue-500/30 border-blue-500'
                        : 'bg-gray-700/50 border-gray-600'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      filterDate === filter.value ? 'text-blue-300' : 'text-gray-300'
                    }`}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Dreams List */}
      <View className="px-6">
        <Text className="text-xl font-bold text-white mb-4">
          Your Dreams ({filteredDreams.length})
        </Text>
        
        {filteredDreams.length === 0 ? (
          <View className="bg-gray-800/30 p-8 rounded-xl border border-gray-700/50">
            <Ionicons name="moon-outline" size={48} color="#6b7280" style={{ alignSelf: 'center' }} />
            <Text className="text-gray-400 text-lg text-center mt-4">
              {dreams.length === 0 ? 'No dreams recorded yet' : 'No dreams match your filters'}
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              {dreams.length === 0 ? 'Start your dream journey today!' : 'Try adjusting your filter settings'}
            </Text>
            {dreams.length === 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Record')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 py-3 px-6 rounded-lg mt-4"
              >
                <Text className="text-white font-medium text-center">Record Your First Dream</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="space-y-4">
            {filteredDreams.map((dream) => (
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
          Dream analysis powered by Pica OneTool • Built with Bolt.new
        </Text>
      </View>
    </ScrollView>
  );
}