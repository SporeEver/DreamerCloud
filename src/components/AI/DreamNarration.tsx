import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Loader2, AlertCircle, Headphones, Lock } from 'lucide-react';
import { useElevenLabsNarration } from '../../hooks/useElevenLabsNarration';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import PaywallModal from '../Subscription/PaywallModal';
import PremiumBadge from '../Subscription/PremiumBadge';

interface DreamNarrationProps {
  analysisText: string;
  analysisStyle?: string;
  onError?: (error: string) => void;
}

const DreamNarration: React.FC<DreamNarrationProps> = ({
  analysisText,
  analysisStyle = 'general',
  onError
}) => {
  const { user } = useAuth();
  const { isPremiumFeature } = useSubscription();
  const [selectedVoice, setSelectedVoice] = useState('Rachel');
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const isLocked = isPremiumFeature('narration');

  const {
    isGenerating,
    isPlaying,
    audioUrl,
    progress,
    duration,
    currentTime,
    generateNarration,
    playPause,
    stop,
    seek,
    cleanup,
    formatTime,
  } = useElevenLabsNarration({
    onNarrationComplete: () => {
      console.log('Narration completed');
    },
    onError: (errorMessage) => {
      setError(errorMessage);
      onError?.(errorMessage);
      
      // Check if error is subscription-related
      if (errorMessage.includes('subscription') || errorMessage.includes('premium')) {
        setShowPaywall(true);
      }
    }
  });

  const voices = [
    { id: 'Rachel', name: 'Rachel', description: 'Calm and clear' },
    { id: 'Drew', name: 'Drew', description: 'Warm and friendly' },
    { id: 'Paul', name: 'Paul', description: 'Deep and authoritative' },
    { id: 'Sarah', name: 'Sarah', description: 'Gentle and soothing' },
    { id: 'Antoni', name: 'Antoni', description: 'Professional and clear' },
    { id: 'Emily', name: 'Emily', description: 'Bright and engaging' }
  ];

  const handleGenerateNarration = async () => {
    if (isLocked) {
      setShowPaywall(true);
      return;
    }

    setError(null);
    
    if (!analysisText.trim()) {
      setError('No analysis text available for narration');
      return;
    }

    // Clean up analysis text for better narration
    const cleanText = cleanAnalysisForNarration(analysisText);
    await generateNarration(cleanText, selectedVoice, user?.id);
  };

  const cleanAnalysisForNarration = (text: string): string => {
    return text
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic markdown
      .replace(/\*(.*?)\*/g, '$1')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Add natural pauses
      .replace(/\n\n/g, '. ')
      .replace(/\n/g, ' ')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Note: Volume control would need to be implemented in the audio element
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Note: Mute control would need to be implemented in the audio element
  };

  const getStyleColor = (style: string) => {
    const colors = {
      jungian: 'from-purple-500 to-indigo-500',
      freudian: 'from-red-500 to-pink-500',
      emotional: 'from-green-500 to-emerald-500',
      general: 'from-blue-500 to-cyan-500'
    };
    return colors[style as keyof typeof colors] || colors.general;
  };

  const getStyleLabel = (style: string) => {
    const labels = {
      jungian: 'Jungian',
      freudian: 'Freudian',
      emotional: 'Emotional',
      general: 'General'
    };
    return labels[style as keyof typeof labels] || 'General';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${isLocked ? 'relative' : ''}`}>
      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Premium Feature</h3>
            <p className="text-gray-300 text-sm mb-4">Voice narration requires a premium subscription</p>
            <button
              onClick={() => setShowPaywall(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}

      <div className={isLocked ? 'opacity-30 pointer-events-none' : ''}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`bg-gradient-to-r ${getStyleColor(analysisStyle)} w-8 h-8 rounded-lg flex items-center justify-center`}>
              <Headphones className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <span>Dream Analysis Narration</span>
                <PremiumBadge variant="small" />
              </h3>
              <p className="text-sm text-gray-400">
                Listen to your {getStyleLabel(analysisStyle).toLowerCase()} analysis with AI voice
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-full text-xs">
            <Volume2 className="h-3 w-3" />
            <span>ElevenLabs AI</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-300 font-medium text-sm">Narration Failed</h4>
                <p className="text-red-200 text-xs mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Selection */}
        {!audioUrl && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Generate Button */}
        {!audioUrl && (
          <div className="text-center">
            <button
              onClick={handleGenerateNarration}
              disabled={isGenerating || !analysisText.trim() || isLocked}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 mx-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Audio...</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span>Generate Narration</span>
                </>
              )}
            </button>
            {!analysisText.trim() && (
              <p className="text-gray-500 text-xs mt-2">
                No analysis available for narration
              </p>
            )}
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="relative">
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={playPause}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full transition-all duration-200"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </button>
                
                <button
                  onClick={stop}
                  className="flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors"
                >
                  <Square className="h-4 w-4" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Regenerate Button */}
              <button
                onClick={() => {
                  cleanup();
                  handleGenerateNarration();
                }}
                disabled={isGenerating}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg text-sm transition-colors"
              >
                <Volume2 className="h-3 w-3" />
                <span>Regenerate</span>
              </button>
            </div>

            {/* Voice Info */}
            <div className="text-center">
              <p className="text-xs text-gray-400">
                Narrated by <span className="text-purple-300 font-medium">{selectedVoice}</span> voice
              </p>
            </div>
          </div>
        )}

        {/* Attribution */}
        <div className="mt-4 pt-3 border-t border-gray-700/50">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <Volume2 className="h-3 w-3 text-purple-400" />
            <span>Voice narration powered by</span>
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

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          isOpen={true}
          onClose={() => setShowPaywall(false)}
          feature="narration"
          onSubscribeSuccess={() => {
            setShowPaywall(false);
            // The component will re-render with updated subscription status
          }}
        />
      )}
    </div>
  );
};

export default DreamNarration;