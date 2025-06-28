import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../hooks/useSubscription';

export default function PaywallModal({ isOpen, onClose, feature, onSubscribeSuccess }) {
  const { subscribe, isSubscribing } = useSubscription({
    onSubscriptionChange: (status) => {
      if (status.isSubscribed) {
        onSubscribeSuccess?.();
        onClose();
      }
    }
  });

  const featureInfo = {
    jungian: {
      title: 'Jungian Dream Analysis',
      description: 'Unlock deep archetypal insights and symbolic interpretations',
      icon: 'analytics-outline',
      color: 'from-purple-500 to-indigo-500'
    },
    freudian: {
      title: 'Freudian Dream Analysis',
      description: 'Explore unconscious desires and psychoanalytic interpretations',
      icon: 'analytics-outline',
      color: 'from-red-500 to-pink-500'
    },
    narration: {
      title: 'Voice Narration',
      description: 'Listen to your dream analyses with AI-powered voice narration',
      icon: 'volume-high-outline',
      color: 'from-green-500 to-emerald-500'
    }
  };

  const currentFeature = featureInfo[feature];

  const premiumFeatures = [
    { icon: 'analytics-outline', text: 'Jungian & Freudian Analysis Styles' },
    { icon: 'volume-high-outline', text: 'AI Voice Narration with Multiple Voices' },
    { icon: 'flash-outline', text: 'Priority AI Processing' },
    { icon: 'crown-outline', text: 'Premium Support' },
    { icon: 'star-outline', text: 'Early Access to New Features' },
    { icon: 'infinite-outline', text: 'Unlimited Dream Analysis' }
  ];

  const handleSubscribe = async (productId) => {
    try {
      await subscribe(productId);
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-900">
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-700">
            <View className="flex-row items-center">
              <View className={`bg-gradient-to-r ${currentFeature?.color} w-10 h-10 rounded-lg items-center justify-center`}>
                <Ionicons name={currentFeature?.icon} size={20} color="white" />
              </View>
              <View className="ml-3">
                <Text className="text-xl font-bold text-white">Unlock Premium</Text>
                <Text className="text-gray-400 text-sm">{currentFeature?.title}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Feature Highlight */}
          <View className="p-6">
            <View className={`bg-gradient-to-r ${currentFeature?.color} bg-opacity-20 border border-purple-500/30 rounded-xl p-6 mb-6`}>
              <View className="flex-row items-center mb-4">
                <View className={`bg-gradient-to-r ${currentFeature?.color} w-12 h-12 rounded-lg items-center justify-center`}>
                  <Ionicons name={currentFeature?.icon} size={24} color="white" />
                </View>
                <View className="ml-4">
                  <Text className="text-lg font-semibold text-white">{currentFeature?.title}</Text>
                  <Text className="text-gray-300 text-sm">{currentFeature?.description}</Text>
                </View>
              </View>
              <View className="bg-black/20 rounded-lg p-4">
                <Text className="text-white text-sm leading-relaxed">
                  {feature === 'jungian' && "Dive deep into archetypal symbols, the collective unconscious, and your individuation process with expert Jungian analysis powered by advanced AI."}
                  {feature === 'freudian' && "Explore the hidden meanings in your dreams through psychoanalytic interpretation, uncovering unconscious desires and symbolic representations."}
                  {feature === 'narration' && "Transform your written dream analyses into immersive audio experiences with high-quality AI voices from ElevenLabs."}
                </Text>
              </View>
            </View>

            {/* Premium Features List */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="crown-outline" size={20} color="#fbbf24" />
                <Text className="text-white font-semibold ml-2">Premium Features Included</Text>
              </View>
              <View className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <View key={index} className="flex-row items-center p-3 bg-gray-700/30 rounded-lg">
                    <View className="bg-gradient-to-r from-purple-500 to-blue-500 w-8 h-8 rounded-lg items-center justify-center">
                      <Ionicons name={feature.icon} size={16} color="white" />
                    </View>
                    <Text className="text-gray-300 text-sm ml-3 flex-1">{feature.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Pricing Plans */}
            <View className="space-y-4">
              <Text className="text-white font-semibold text-center mb-4">Choose Your Plan</Text>
              
              {/* Monthly Plan */}
              <View className="border border-gray-600 rounded-xl p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-white font-semibold">Premium Monthly</Text>
                    <Text className="text-gray-400 text-sm">Perfect for trying premium features</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-white">$9.99</Text>
                    <Text className="text-gray-400 text-sm">per month</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleSubscribe('premium_monthly')}
                  disabled={isSubscribing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg"
                >
                  <View className="flex-row items-center justify-center">
                    {isSubscribing && (
                      <Ionicons name="refresh-outline" size={20} color="white" className="mr-2" />
                    )}
                    <Text className="text-white font-medium">
                      {isSubscribing ? 'Processing...' : 'Subscribe Monthly'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Yearly Plan */}
              <View className="border-2 border-purple-500 rounded-xl p-6 relative">
                <View className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 rounded-bl-lg rounded-tr-xl">
                  <Text className="text-white text-xs font-bold">BEST VALUE</Text>
                </View>
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-white font-semibold">Premium Yearly</Text>
                    <Text className="text-gray-400 text-sm">Save 17% with annual billing</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-white">$99.99</Text>
                    <Text className="text-gray-400 text-sm">per year</Text>
                    <Text className="text-green-400 text-xs">Save $20</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleSubscribe('premium_yearly')}
                  disabled={isSubscribing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg"
                >
                  <View className="flex-row items-center justify-center">
                    {isSubscribing && (
                      <Ionicons name="refresh-outline" size={20} color="white" className="mr-2" />
                    )}
                    <Text className="text-white font-medium">
                      {isSubscribing ? 'Processing...' : 'Subscribe Yearly'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Benefits */}
            <View className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
                <Text className="text-green-300 font-medium text-sm ml-2">30-Day Money Back Guarantee</Text>
              </View>
              <Text className="text-green-200 text-xs">
                Try premium features risk-free. Cancel anytime within 30 days for a full refund.
              </Text>
            </View>

            {/* Footer */}
            <View className="mt-6 text-center">
              <Text className="text-gray-400 text-xs">
                Secure payment processing • Cancel anytime • No hidden fees
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}