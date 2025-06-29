import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email.trim(), password);
      if (!success) {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@dreamercloud.com');
    setPassword('demo123');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-900"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          {/* Logo */}
          <View className="items-center mb-8">
            <View className="flex-row items-center">
              <Ionicons name="cloud-outline" size={48} color="#8b5cf6" />
              <Text className="text-3xl font-bold text-white ml-2">DreamerCloud</Text>
            </View>
            <Text className="text-gray-300 mt-2">Welcome back, dreamer</Text>
          </View>

          {/* Login Form */}
          <View className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <Text className="text-2xl font-bold text-white mb-6 text-center">Sign In</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-300 mb-2">Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-300 mb-2">Password</Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white pr-12"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#9ca3af" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg mt-6"
              >
                <View className="flex-row items-center justify-center">
                  {isLoading && (
                    <Ionicons name="refresh-outline" size={20} color="white" className="mr-2 animate-spin" />
                  )}
                  <Text className="text-white text-lg font-medium">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="mt-6 text-center">
              <Text className="text-gray-400">
                Don't have an account?{' '}
                <Text 
                  onPress={() => navigation.navigate('Signup')}
                  className="text-purple-400 font-medium"
                >
                  Sign up
                </Text>
              </Text>
            </View>

            {/* Demo Account */}
            <View className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <Text className="text-blue-300 text-sm text-center mb-3">
                <Text className="font-bold">Demo Mode:</Text> Use any email/password combination to explore
              </Text>
              <TouchableOpacity
                onPress={handleDemoLogin}
                className="w-full bg-blue-600/30 border border-blue-500/50 py-2 rounded-lg"
              >
                <Text className="text-blue-200 text-sm text-center">Fill Demo Credentials</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}