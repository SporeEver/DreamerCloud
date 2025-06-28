import { useState, useCallback, useRef } from 'react';

interface UseElevenLabsNarrationProps {
  onNarrationComplete?: () => void;
  onError?: (error: string) => void;
}

export const useElevenLabsNarration = ({
  onNarrationComplete,
  onError
}: UseElevenLabsNarrationProps = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateNarration = useCallback(async (
    text: string,
    voice: string = 'Rachel',
    userId?: string
  ) => {
    if (!text.trim()) {
      onError?.('No text provided for narration');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    try {
      console.log('ElevenLabs: Starting narration generation');
      
      const response = await fetch('/.netlify/functions/narrate-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: voice,
          model: 'eleven_multilingual_v2',
          userId: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle subscription-related errors
        if (errorData.requiresSubscription) {
          throw new Error(errorData.error || 'Premium subscription required for voice narration');
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.audioData) {
        // Convert base64 to blob and create URL
        const audioBlob = base64ToBlob(data.audioData, data.audioFormat || 'audio/mpeg');
        const url = URL.createObjectURL(audioBlob);
        
        setAudioUrl(url);
        console.log('ElevenLabs: Narration generated successfully');
        
        // Create audio element for playback
        const audio = new Audio(url);
        audioRef.current = audio;
        
        // Set up audio event listeners
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });
        
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(0);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          onNarrationComplete?.();
        });
        
        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          onError?.('Failed to play audio narration');
          setIsPlaying(false);
        });
        
      } else {
        throw new Error('Invalid response from narration service');
      }
      
    } catch (error) {
      console.error('ElevenLabs narration error:', error);
      
      let errorMessage = 'Failed to generate narration. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('subscription') || error.message.includes('premium')) {
          errorMessage = error.message;
        } else if (error.message.includes('API key')) {
          errorMessage = 'Audio service not configured. Please contact support.';
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('too long')) {
          errorMessage = 'Text is too long for narration. Please try with shorter content.';
        }
      }
      
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [onNarrationComplete, onError]);

  const playPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      
      // Update progress
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          const current = audioRef.current.currentTime;
          const total = audioRef.current.duration;
          setCurrentTime(current);
          setProgress(total > 0 ? (current / total) * 100 : 0);
        }
      }, 100);
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, []);

  const seek = useCallback((percentage: number) => {
    if (audioRef.current && duration > 0) {
      const newTime = (percentage / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percentage);
    }
  }, [duration]);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    setDuration(0);
  }, [audioUrl]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
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
  };
};

// Helper function to convert base64 to blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}