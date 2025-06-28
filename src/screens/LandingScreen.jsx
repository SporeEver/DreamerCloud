import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LandingScreen({ navigation }) {
  const features = [
    {
      icon: 'book-outline',
      title: 'Dream Journal',
      description: 'Record and organize your dreams with our intuitive mobile interface'
    },
    {
      icon: 'mic-outline',
      title: 'Voice Recording',
      description: 'Speak your dreams naturally with ElevenLabs speech-to-text technology'
    },
    {
      icon: 'color-palette-outline',
      title: 'Custom FLUX.1 Art',
      description: 'Create personalized dream art with customizable styles via Pica OneTool'
    },
    {
      icon: 'brain-outline',
      title: 'Dream Analysis',
      description: 'Get deep psychological insights with AI-powered analysis'
    },
    {
      icon: 'people-outline',
      title: 'Community',
      description: 'Share your dreams and discover others\' experiences'
    },
    {
      icon: 'volume-high-outline',
      title: 'Voice Narration',
      description: 'Listen to your analyses with premium AI voice narration'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-8 pb-12">
          <View className="flex-row items-center justify-center mb-6">
            <Ionicons name="cloud-outline" size={40} color="#8b5cf6" />
            <Text className="text-3xl font-bold text-white ml-2">DreamerCloud</Text>
          </View>
          
          <Text className="text-4xl font-bold text-white text-center mb-4">
            Your Dreams,{'\n'}
            <Text className="text-purple-400">Customized</Text>
          </Text>
          
          <Text className="text-lg text-gray-300 text-center mb-8 leading-relaxed">
            Capture, analyze, and visualize your dreams with AI-powered mobile platform featuring voice recording, custom art generation, and deep psychological analysis.
          </Text>

          <View className="space-y-4">
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 py-4 px-8 rounded-lg"
            >
              <Text className="text-white text-lg font-semibold text-center">Start Dreaming</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="border-2 border-purple-500 py-4 px-8 rounded-lg"
            >
              <Text className="text-purple-300 text-lg font-semibold text-center">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View className="bg-gray-800/50 py-12">
          <Text className="text-3xl font-bold text-white text-center mb-4">
            Unlock the Power of Your Dreams
          </Text>
          <Text className="text-lg text-gray-300 text-center mb-8 px-6">
            Everything you need to capture, understand, and visualize your dreams
          </Text>

          <View className="px-6 space-y-6">
            {features.map((feature, index) => (
              <View key={index} className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                <View className="flex-row items-center mb-3">
                  <View className="bg-gradient-to-r from-purple-500 to-blue-500 w-12 h-12 rounded-lg items-center justify-center mr-4">
                    <Ionicons name={feature.icon} size={24} color="white" />
                  </View>
                  <Text className="text-xl font-semibold text-white flex-1">{feature.title}</Text>
                </View>
                <Text className="text-gray-300 leading-relaxed">{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Premium Features Highlight */}
        <View className="px-6 py-12">
          <View className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
            <View className="flex-row items-center justify-center mb-4">
              <Ionicons name="color-palette-outline" size={48} color="#8b5cf6" />
              <Ionicons name="settings-outline" size={36} color="#ec4899" />
            </View>
            <Text className="text-2xl font-bold text-white text-center mb-4">
              Premium Features
            </Text>
            <Text className="text-gray-300 text-center mb-6">
              Unlock advanced Jungian & Freudian analysis styles, AI voice narration, and priority processing with our premium subscription.
            </Text>
            <View className="flex-row flex-wrap justify-center space-x-2">
              <View className="bg-purple-500/20 px-3 py-2 rounded-full mb-2">
                <Text className="text-purple-300 text-sm font-medium">Advanced Analysis</Text>
              </View>
              <View className="bg-blue-500/20 px-3 py-2 rounded-full mb-2">
                <Text className="text-blue-300 text-sm font-medium">Voice Narration</Text>
              </View>
              <View className="bg-pink-500/20 px-3 py-2 rounded-full mb-2">
                <Text className="text-pink-300 text-sm font-medium">Custom Art</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="bg-gray-800/80 py-8 px-6">
          <View className="flex-row items-center justify-center mb-4">
            <Ionicons name="cloud-outline" size={24} color="#8b5cf6" />
            <Text className="text-lg font-bold text-white ml-2">DreamerCloud</Text>
          </View>
          <Text className="text-gray-400 text-sm text-center">
            Voice technology powered by ElevenLabs • Custom AI art via Pica OneTool & Replicate FLUX.1
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-1">
            Built with Bolt.new
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}