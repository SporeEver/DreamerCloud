import React, { useState } from 'react';
import { Mic, MicOff, Save, Tag, Eye, EyeOff, Volume2, Loader2, Zap, Palette, Upload } from 'lucide-react';
import { Dream } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useElevenLabsSpeech } from '../../hooks/useElevenLabsSpeech';
import { usePicaOneTool } from '../../hooks/usePicaOneTool';
import PicaOneToolGenerator from '../AI/PicaOneToolGenerator';
import ImageUploader from '../AI/ImageUploader';

interface DreamFormProps {
  onSubmit: (dream: Omit<Dream, 'id' | 'createdAt' | 'likes' | 'comments'>) => void;
}

const DreamForm: React.FC<DreamFormProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Dream['mood']>('peaceful');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [activeImageTab, setActiveImageTab] = useState<'generate' | 'upload'>('generate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    isRecording,
    isProcessing,
    transcription,
    startRecording,
    stopRecording,
    clearTranscription,
  } = useElevenLabsSpeech({
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
    onTranscriptionComplete: (text) => {
      setContent(prev => prev ? `${prev} ${text}` : text);
      setError('');
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  });

  const {
    isGenerating,
    generatedImage,
    imagePrompt: currentImagePrompt,
    progress,
    routingInfo,
    error: generationError,
    generateArt,
    clearImage,
    regenerateArt,
    retryGeneration,
  } = usePicaOneTool({
    onImageGenerated: (imageUrl, prompt) => {
      console.log('Pica OneTool generated custom image:', imageUrl);
      setError(''); // Clear any previous errors
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  });

  const moods: Array<{ value: Dream['mood']; label: string; emoji: string }> = [
    { value: 'peaceful', label: 'Peaceful', emoji: '😌' },
    { value: 'exciting', label: 'Exciting', emoji: '🤩' },
    { value: 'scary', label: 'Scary', emoji: '😨' },
    { value: 'strange', label: 'Strange', emoji: '🤔' },
    { value: 'romantic', label: 'Romantic', emoji: '😍' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
  ];

  const handleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageSelect = (imageUrl: string, prompt: string) => {
    setGeneratedImageUrl(imageUrl);
    setImagePrompt(prompt);
  };

  const handleImageUpload = (processedImage: Blob, originalFile: File) => {
    const imageUrl = URL.createObjectURL(processedImage);
    setUploadedImageUrl(imageUrl);
    setError('');
  };

  const handleImageUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const getSelectedImageUrl = () => {
    if (activeImageTab === 'generate') {
      return generatedImageUrl;
    } else {
      return uploadedImageUrl;
    }
  };

  const getSelectedImagePrompt = () => {
    if (activeImageTab === 'generate') {
      return imagePrompt;
    } else {
      return 'User uploaded image';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;

    setIsSubmitting(true);
    setError('');

    try {
      const selectedImageUrl = getSelectedImageUrl();
      const selectedImagePrompt = getSelectedImagePrompt();

      // Auto-generate custom art if content exists but no image selected
      let finalImageUrl = selectedImageUrl;
      let finalImagePrompt = selectedImagePrompt;

      if (!selectedImageUrl && content.trim() && activeImageTab === 'generate') {
        try {
          console.log('Auto-generating custom art for dream submission...');
          await generateArt(content, mood, 'realistic', '16:9', 'png', true, undefined, user.id);
          
          // Wait a moment for the generation to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (generatedImage) {
            finalImageUrl = generatedImage;
            finalImagePrompt = currentImagePrompt;
          }
        } catch (artError) {
          console.warn('Auto custom art generation failed:', artError);
          // Continue with submission without image
        }
      }

      onSubmit({
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
        title: title.trim(),
        content: content.trim(),
        mood,
        tags,
        isPublic,
        generatedImage: finalImageUrl || undefined,
        imagePrompt: finalImagePrompt || undefined,
      });

      // Reset form
      setTitle('');
      setContent('');
      setMood('peaceful');
      setTags([]);
      setTagInput('');
      setIsPublic(true);
      setGeneratedImageUrl('');
      setImagePrompt('');
      setUploadedImageUrl('');
      clearTranscription();
      clearImage();
      setError('');
    } catch (error) {
      console.error('Dream submission error:', error);
      setError('Failed to save dream. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <h2 className="text-2xl font-bold text-white">Record Your Dream</h2>
          <div className="flex items-center space-x-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
            <Zap className="h-3 w-3" />
            <span>AI Powered</span>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dream Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your dream a title..."
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content with Voice Recording */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Dream Description
              </label>
              <div className="flex items-center space-x-2">
                {transcription && (
                  <button
                    type="button"
                    onClick={clearTranscription}
                    className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Clear transcription
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleVoiceRecording}
                  disabled={isProcessing}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    isRecording
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 animate-pulse shadow-lg shadow-red-500/20'
                      : isProcessing
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isRecording ? (
                    <>
                      <MicOff className="h-3 w-3" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3 w-3" />
                      <span>Voice Input</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your dream in detail... or use voice input to speak your dream naturally!"
              rows={6}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            />
            {isRecording && (
              <div className="mt-2 flex items-center space-x-2 text-red-400 text-sm animate-pulse">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
                <span>Recording... Speak clearly into your microphone</span>
                <Volume2 className="h-3 w-3 animate-pulse" />
              </div>
            )}
            {isProcessing && (
              <div className="mt-2 flex items-center space-x-2 text-yellow-400 text-sm">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Converting speech to text with ElevenLabs AI...</span>
              </div>
            )}
            {transcription && (
              <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="h-3 w-3 text-green-400" />
                  <span className="font-medium text-green-300 text-sm">AI Transcription:</span>
                </div>
                <p className="text-green-200 text-sm leading-relaxed">{transcription}</p>
              </div>
            )}
          </div>

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Dream Mood
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {moods.map((moodOption) => (
                <button
                  key={moodOption.value}
                  type="button"
                  onClick={() => setMood(moodOption.value)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                    mood === moodOption.value
                      ? 'bg-purple-500/30 border-purple-500 text-purple-300'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  <span className="text-lg">{moodOption.emoji}</span>
                  <span className="text-sm font-medium">{moodOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="flex items-center space-x-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Tag className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-purple-400 hover:text-purple-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">
              Share with Community
            </label>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                isPublic
                  ? 'bg-green-500/20 border-green-500 text-green-300'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300'
              }`}
            >
              {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>{isPublic ? 'Public' : 'Private'}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isRecording || isProcessing || isSubmitting || isGenerating}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Dream...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Dream</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ElevenLabs Attribution */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <Zap className="h-3 w-3 text-purple-400" />
            <span>Voice transcription powered by</span>
            <a
              href="https://elevenlabs.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              ElevenLabs AI
            </a>
          </div>
        </div>
      </div>

      {/* Custom Image Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Custom Dream Visuals</h3>
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setActiveImageTab('generate')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeImageTab === 'generate'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Palette className="h-3 w-3 inline mr-1" />
              Generate
            </button>
            <button
              onClick={() => setActiveImageTab('upload')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeImageTab === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Upload className="h-3 w-3 inline mr-1" />
              Upload
            </button>
          </div>
        </div>

        {activeImageTab === 'generate' ? (
          <PicaOneToolGenerator
            dreamDescription={content}
            dreamMood={mood}
            isGenerating={isGenerating}
            generatedImage={generatedImage}
            imagePrompt={currentImagePrompt}
            progress={progress}
            routingInfo={routingInfo}
            error={generationError}
            onGenerate={(style, aspectRatio, outputFormat, highQuality) => 
              generateArt(content, mood, style, aspectRatio, outputFormat, highQuality, undefined, user?.id)
            }
            onRegenerate={(style, aspectRatio, outputFormat, highQuality) => 
              regenerateArt(content, mood, style, aspectRatio, outputFormat, highQuality, undefined, user?.id)
            }
            onRetry={(style, aspectRatio, outputFormat, highQuality) => 
              retryGeneration(content, mood, style, aspectRatio, outputFormat, highQuality, undefined, user?.id)
            }
            onClear={clearImage}
            onImageSelect={handleImageSelect}
            userId={user?.id}
          />
        ) : (
          <ImageUploader
            onImageProcessed={handleImageUpload}
            onError={handleImageUploadError}
            maxFileSize={10}
            acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
          />
        )}
      </div>
    </div>
  );
};

export default DreamForm;