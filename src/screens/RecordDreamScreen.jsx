import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export default function RecordDreamScreen({ navigation }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('peaceful');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    { value: 'peaceful', label: 'Peaceful', emoji: '😌', color: 'bg-green-500' },
    { value: 'exciting', label: 'Exciting', emoji: '🤩', color: 'bg-orange-500' },
    { value: 'scary', label: 'Scary', emoji: '😨', color: 'bg-red-500' },
    { value: 'strange', label: 'Strange', emoji: '🤔', color: 'bg-purple-500' },
    { value: 'romantic', label: 'Romantic', emoji: '😍', color: 'bg-pink-500' },
    { value: 'sad', label: 'Sad', emoji: '😢', color: 'bg-blue-500' },
  ];

  const handleVoiceRecording = () => {
    // Placeholder for voice recording functionality
    setIsRecording(!isRecording);
    if (!isRecording) {
      Alert.alert('Voice Recording', 'Voice recording feature will be implemented with ElevenLabs integration');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and description');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate dream submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success', 
        'Your dream has been recorded!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save dream. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="px-6 py-6">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Ionicons name="book-outline" size={32} color="#8b5cf6" />
          <View className="ml-3">
            <Text className="text-2xl font-bold text-white">Record New Dream</Text>
            <Text className="text-gray-300">Capture your dream with AI-powered features</Text>
          </View>
        </View>

        {/* Form */}
        <View className="space-y-6">
          {/* Title */}
          <View>
            <Text className="text-sm font-medium text-gray-300 mb-2">Dream Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Give your dream a title..."
              placeholderTextColor="#9ca3af"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
            />
          </View>

          {/* Content with Voice Recording */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-300">Dream Description</Text>
              <TouchableOpacity
                onPress={handleVoiceRecording}
                className={`flex-row items-center px-3 py-1 rounded-full ${
                  isRecording 
                    ? 'bg-red-500/20 border border-red-500/50' 
                    : 'bg-purple-500/20 border border-purple-500/50'
                }`}
              >
                <Ionicons 
                  name={isRecording ? 'mic-off-outline' : 'mic-outline'} 
                  size={16} 
                  color={isRecording ? '#ef4444' : '#8b5cf6'} 
                />
                <Text className={`ml-1 text-xs font-medium ${
                  isRecording ? 'text-red-300' : 'text-purple-300'
                }`}>
                  {isRecording ? 'Stop' : 'Voice'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Describe your dream in detail... or use voice input!"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
            />
            {isRecording && (
              <View className="flex-row items-center mt-2">
                <View className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2" />
                <Text className="text-red-400 text-sm">Recording... Speak clearly</Text>
              </View>
            )}
          </View>

          {/* Mood Selection */}
          <View>
            <Text className="text-sm font-medium text-gray-300 mb-3">Dream Mood</Text>
            <View className="flex-row flex-wrap">
              {moods.map((moodOption) => (
                <TouchableOpacity
                  key={moodOption.value}
                  onPress={() => setMood(moodOption.value)}
                  className={`flex-row items-center px-4 py-3 rounded-lg border mr-3 mb-3 ${
                    mood === moodOption.value
                      ? 'bg-purple-500/30 border-purple-500'
                      : 'bg-gray-700/50 border-gray-600'
                  }`}
                >
                  <Text className="text-lg mr-2">{moodOption.emoji}</Text>
                  <Text className={`text-sm font-medium ${
                    mood === moodOption.value ? 'text-purple-300' : 'text-gray-300'
                  }`}>
                    {moodOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View>
            <Text className="text-sm font-medium text-gray-300 mb-2">Tags</Text>
            <View className="flex-row space-x-2 mb-3">
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add a tag..."
                placeholderTextColor="#9ca3af"
                className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                onSubmitEditing={addTag}
              />
              <TouchableOpacity
                onPress={addTag}
                className="bg-purple-600 px-4 py-2 rounded-lg flex-row items-center"
              >
                <Ionicons name="add-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
            {tags.length > 0 && (
              <View className="flex-row flex-wrap">
                {tags.map((tag, index) => (
                  <View key={index} className="bg-purple-500/20 px-3 py-1 rounded-full mr-2 mb-2 flex-row items-center">
                    <Text className="text-purple-300 text-sm mr-1">{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Ionicons name="close-outline" size={16} color="#a855f7" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Privacy Setting */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-300">Share with Community</Text>
            <TouchableOpacity
              onPress={() => setIsPublic(!isPublic)}
              className={`flex-row items-center px-4 py-2 rounded-lg border ${
                isPublic
                  ? 'bg-green-500/20 border-green-500'
                  : 'bg-gray-700/50 border-gray-600'
              }`}
            >
              <Ionicons 
                name={isPublic ? 'eye-outline' : 'eye-off-outline'} 
                size={20} 
                color={isPublic ? '#10b981' : '#9ca3af'} 
              />
              <Text className={`ml-2 font-medium ${
                isPublic ? 'text-green-300' : 'text-gray-300'
              }`}>
                {isPublic ? 'Public' : 'Private'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || isRecording}
            className="bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-lg"
          >
            <View className="flex-row items-center justify-center">
              {isSubmitting && (
                <Ionicons name="refresh-outline" size={20} color="white" className="mr-2 animate-spin" />
              )}
              <Text className="text-white text-lg font-medium">
                {isSubmitting ? 'Saving Dream...' : 'Save Dream'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Attribution */}
        <View className="mt-8 pt-6 border-t border-gray-700/50">
          <Text className="text-gray-400 text-xs text-center">
            Voice transcription powered by ElevenLabs AI
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}