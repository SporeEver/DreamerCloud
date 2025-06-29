import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await signup(username.trim(), email.trim(), password);
      if (!success) {
        Alert.alert('Error', 'Username or email already exists');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <Text className="text-gray-300 mt-2">Start your dream journey</Text>
          </View>

          {/* Signup Form */}
          <View className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <Text className="text-2xl font-bold text-white mb-6 text-center">Create Account</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-300 mb-2">Username</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Choose a username"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                />
              </View>

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
                    placeholder="Create a password"
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

              <View>
                <Text className="text-sm font-medium text-gray-300 mb-2">Confirm Password</Text>
                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showConfirmPassword}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white pr-12"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#9ca3af" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSignup}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg mt-6"
              >
                <View className="flex-row items-center justify-center">
                  {isLoading && (
                    <Ionicons name="refresh-outline" size={20} color="white" className="mr-2 animate-spin" />
                  )}
                  <Text className="text-white text-lg font-medium">
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="mt-6 text-center">
              <Text className="text-gray-400">
                Already have an account?{' '}
                <Text 
                  onPress={() => navigation.navigate('Login')}
                  className="text-purple-400 font-medium"
                >
                  Sign in
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}