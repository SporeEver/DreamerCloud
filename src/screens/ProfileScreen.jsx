import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import PremiumBadge from '../components/PremiumBadge';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { subscriptionStatus, restorePurchases, isLoading } = useSubscription();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleRestorePurchases = async () => {
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert('Success', 'Your purchases have been restored!');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="px-6 pt-6 pb-8">
        <View className="items-center">
          <View className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <Text className="text-2xl font-bold text-white mb-2">{user?.username}</Text>
          <Text className="text-gray-300 mb-4">{user?.email}</Text>
          
          {subscriptionStatus.isSubscribed && (
            <PremiumBadge variant="large" />
          )}
        </View>
      </View>

      {/* Stats */}
      <View className="px-6 mb-6">
        <View className="flex-row space-x-4">
          <View className="flex-1 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
            <View className="items-center">
              <Ionicons name="book-outline" size={24} color="#8b5cf6" />
              <Text className="text-2xl font-bold text-white mt-2">{user?.dreamCount || 0}</Text>
              <Text className="text-gray-400 text-sm">Dreams</Text>
            </View>
          </View>
          
          <View className="flex-1 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
            <View className="items-center">
              <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold text-white mt-2">
                {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </Text>
              <Text className="text-gray-400 text-sm">Days</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Subscription Section */}
      <View className="px-6 mb-6">
        <View className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-white">Subscription</Text>
            {subscriptionStatus.isSubscribed && <PremiumBadge variant="default" />}
          </View>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-300">Status</Text>
              <Text className={`font-medium capitalize ${
                subscriptionStatus.status === 'active' ? 'text-green-300' : 'text-gray-400'
              }`}>
                {subscriptionStatus.status}
              </Text>
            </View>
            
            {subscriptionStatus.startedAt && (
              <View className="flex-row justify-between">
                <Text className="text-gray-300">Started</Text>
                <Text className="text-gray-400">{formatDate(subscriptionStatus.startedAt)}</Text>
              </View>
            )}
            
            <View className="pt-3 border-t border-gray-700">
              <Text className="text-gray-300 text-sm mb-2">Premium Features</Text>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Ionicons 
                    name={subscriptionStatus.entitlements.jungianAnalysis ? 'checkmark-circle' : 'close-circle'} 
                    size={16} 
                    color={subscriptionStatus.entitlements.jungianAnalysis ? '#10b981' : '#6b7280'} 
                  />
                  <Text className="text-gray-400 text-sm ml-2">Jungian Analysis</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={subscriptionStatus.entitlements.freudianAnalysis ? 'checkmark-circle' : 'close-circle'} 
                    size={16} 
                    color={subscriptionStatus.entitlements.freudianAnalysis ? '#10b981' : '#6b7280'} 
                  />
                  <Text className="text-gray-400 text-sm ml-2">Freudian Analysis</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={subscriptionStatus.entitlements.voiceNarration ? 'checkmark-circle' : 'close-circle'} 
                    size={16} 
                    color={subscriptionStatus.entitlements.voiceNarration ? '#10b981' : '#6b7280'} 
                  />
                  <Text className="text-gray-400 text-sm ml-2">Voice Narration</Text>
                </View>
              </View>
            </View>
          </View>
          
          {!subscriptionStatus.isSubscribed && (
            <TouchableOpacity className="bg-gradient-to-r from-purple-600 to-blue-600 py-3 px-6 rounded-lg mt-4">
              <Text className="text-white font-medium text-center">Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Settings */}
      <View className="px-6 mb-6">
        <Text className="text-xl font-bold text-white mb-4">Settings</Text>
        
        <View className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <TouchableOpacity 
            onPress={handleRestorePurchases}
            disabled={isLoading}
            className="flex-row items-center justify-between p-4 border-b border-gray-700/50"
          >
            <View className="flex-row items-center">
              <Ionicons name="refresh-outline" size={20} color="#8b5cf6" />
              <Text className="text-white ml-3">Restore Purchases</Text>
            </View>
            {isLoading && <Ionicons name="refresh-outline" size={20} color="#6b7280" />}
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-700/50">
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={20} color="#8b5cf6" />
              <Text className="text-white ml-3">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-700/50">
            <View className="flex-row items-center">
              <Ionicons name="shield-outline" size={20} color="#8b5cf6" />
              <Text className="text-white ml-3">Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={20} color="#8b5cf6" />
              <Text className="text-white ml-3">Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Account */}
      <View className="px-6 mb-8">
        <Text className="text-xl font-bold text-white mb-4">Account</Text>
        
        <View className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <View className="p-4 border-b border-gray-700/50">
            <Text className="text-gray-300 text-sm">Member since</Text>
            <Text className="text-white">{user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center p-4"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-400 ml-3 font-medium">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View className="px-6 py-8 border-t border-gray-700/50">
        <Text className="text-gray-400 text-xs text-center">
          DreamerCloud Mobile v1.0.0
        </Text>
        <Text className="text-gray-400 text-xs text-center mt-1">
          Built with Bolt.new • RevenueCat Project ID: nwALEkrNSi94GUCOHmx2oDnY
        </Text>
      </View>
    </ScrollView>
  );
}