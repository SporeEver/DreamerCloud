import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from '../components/PaywallModal';
import PremiumBadge from '../components/PremiumBadge';

export default function DreamViewScreen({ route, navigation }) {
  const { dream } = route.params;
  const { subscriptionStatus, isPremiumFeature } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState(null);
  const [selectedAnalysisStyle, setSelectedAnalysisStyle] = useState('general');

  const analysisStyles = [
    { value: 'general', label: 'General', isPremium: false, color: 'bg-blue-500' },
    { value: 'emotional', label: 'Emotional', isPremium: false, color: 'bg-green-500' },
    { value: 'jungian', label: 'Jungian', isPremium: true, color: 'bg-purple-500' },
    { value: 'freudian', label: 'Freudian', isPremium: true, color: 'bg-red-500' },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood) => {
    const colors = {
      peaceful: 'bg-green-500/20 text-green-300 border-green-500/30',
      exciting: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      scary: 'bg-red-500/20 text-red-300 border-red-500/30',
      strange: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      romantic: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      sad: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    };
    return colors[mood] || colors.peaceful;
  };

  const handleAnalyze = (style) => {
    if (style === 'jungian' || style === 'freudian') {
      if (isPremiumFeature(style)) {
        setPaywallFeature(style);
        setShowPaywall(true);
        return;
      }
    }
    
    setSelectedAnalysisStyle(style);
    Alert.alert('Analysis', `Starting ${style} analysis...`);
  };

  const handleNarration = () => {
    if (isPremiumFeature('narration')) {
      setPaywallFeature('narration');
      setShowPaywall(true);
      return;
    }
    
    Alert.alert('Narration', 'Starting voice narration...');
  };

  return (
    <ScrollView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full items-center justify-center">
              <Text className="text-white text-lg font-bold">
                {dream.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="ml-3">
              <Text className="text-white font-semibold text-lg">{dream.username}</Text>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#9ca3af" />
                <Text className="text-gray-400 text-sm ml-1">{formatDate(dream.createdAt)}</Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center space-x-2">
            {subscriptionStatus.isSubscribed && <PremiumBadge variant="small" />}
            <View className={`px-3 py-1 rounded-full border ${getMoodColor(dream.mood)}`}>
              <Text className="text-xs font-medium capitalize">{dream.mood}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Dream Content */}
      <View className="px-6 mb-6">
        <View className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
          <Text className="text-2xl font-bold text-white mb-4">{dream.title}</Text>
          <Text className="text-gray-300 leading-relaxed text-lg">{dream.content}</Text>
          
          {/* Tags */}
          {dream.tags && dream.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-4">
              {dream.tags.map((tag, index) => (
                <View key={index} className="bg-gray-700/50 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-gray-300 text-sm">#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Analysis Section */}
      <View className="px-6 mb-6">
        <Text className="text-xl font-bold text-white mb-4">Dream Analysis</Text>
        
        {/* Analysis Style Selection */}
        <View className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-4">
          <Text className="text-white font-medium mb-3">Choose Analysis Style</Text>
          <View className="space-y-3">
            {analysisStyles.map((style) => (
              <TouchableOpacity
                key={style.value}
                onPress={() => handleAnalyze(style.value)}
                className={`flex-row items-center justify-between p-4 rounded-lg border ${
                  selectedAnalysisStyle === style.value
                    ? 'bg-purple-500/20 border-purple-500'
                    : 'bg-gray-700/50 border-gray-600'
                }`}
              >
                <View className="flex-row items-center">
                  <View className={`w-10 h-10 ${style.color} rounded-lg items-center justify-center mr-3`}>
                    <Ionicons name="analytics-outline" size={20} color="white" />
                  </View>
                  <View>
                    <View className="flex-row items-center">
                      <Text className="text-white font-medium">{style.label} Analysis</Text>
                      {style.isPremium && <PremiumBadge variant="small" showIcon={false} />}
                    </View>
                    <Text className="text-gray-400 text-sm">
                      {style.value === 'jungian' && 'Archetypal symbols & collective unconscious'}
                      {style.value === 'freudian' && 'Unconscious desires & psychoanalytic interpretation'}
                      {style.value === 'emotional' && 'Feelings-based analysis & emotional processing'}
                      {style.value === 'general' && 'Comprehensive psychological & symbolic analysis'}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center">
                  {style.isPremium && !subscriptionStatus.entitlements[`${style.value}Analysis`] && (
                    <Ionicons name="lock-closed-outline" size={20} color="#fbbf24" />
                  )}
                  <Ionicons name="chevron-forward-outline" size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Voice Narration */}
        <View className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-green-500 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="volume-high-outline" size={20} color="white" />
              </View>
              <View>
                <View className="flex-row items-center">
                  <Text className="text-white font-medium">Voice Narration</Text>
                  <PremiumBadge variant="small" showIcon={false} />
                </View>
                <Text className="text-gray-400 text-sm">Listen to your analysis with AI voice</Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={handleNarration}
              className="flex-row items-center"
            >
              {isPremiumFeature('narration') && (
                <Ionicons name="lock-closed-outline" size={20} color="#fbbf24" />
              )}
              <Ionicons name="chevron-forward-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Engagement */}
      <View className="px-6 mb-8">
        <View className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-6">
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="heart-outline" size={24} color="#9ca3af" />
                <Text className="text-gray-400 ml-2">{dream.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="chatbubble-outline" size={24} color="#9ca3af" />
                <Text className="text-gray-400 ml-2">{dream.comments}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity className="flex-row items-center bg-purple-600/20 px-4 py-2 rounded-lg">
              <Ionicons name="share-outline" size={20} color="#8b5cf6" />
              <Text className="text-purple-300 ml-2 font-medium">Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          feature={paywallFeature}
          onSubscribeSuccess={() => {
            setShowPaywall(false);
            // Continue with the action after successful subscription
          }}
        />
      )}
    </ScrollView>
  );
}