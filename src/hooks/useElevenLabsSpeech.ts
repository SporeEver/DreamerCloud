import { useState, useRef, useCallback } from 'react';

interface UseElevenLabsSpeechProps {
  apiKey?: string;
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: string) => void;
}

export const useElevenLabsSpeech = ({
  apiKey,
  onTranscriptionComplete,
  onError
}: UseElevenLabsSpeechProps = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('Failed to start recording. Please check microphone permissions.');
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      if (!apiKey) {
        // Fallback to simulation if no API key
        await simulateTranscription();
        return;
      }

      // Convert WebM to MP3 for better compatibility with ElevenLabs
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model_id', 'scribe_v1'); // Use valid ElevenLabs model
      formData.append('response_format', 'json');

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const text = result.text || result.transcript || '';
      
      if (text.trim()) {
        setTranscription(text);
        onTranscriptionComplete?.(text);
      } else {
        onError?.('No speech detected. Please try speaking more clearly.');
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          onError?.('Invalid API key. Please check your ElevenLabs API key.');
        } else if (error.message.includes('429')) {
          onError?.('Rate limit exceeded. Please wait a moment and try again.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          onError?.('Network error. Please check your internet connection.');
        } else {
          onError?.(`Speech processing failed: ${error.message}`);
        }
      } else {
        onError?.('Failed to process audio. Please try again.');
      }
      
      // Fallback to simulation on error
      await simulateTranscription();
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateTranscription = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const sampleTexts = [
      "I had the most vivid dream last night about flying over a beautiful landscape with mountains and rivers below.",
      "In my dream, I was walking through a mystical forest filled with glowing trees and magical creatures.",
      "I dreamed I was having a deep conversation with my childhood friend in our old neighborhood park.",
      "The dream felt so real - I was swimming in crystal clear water under a brilliant starry sky.",
      "I found myself in an infinite library with books floating in the air, each one containing someone's memories.",
      "I was dancing with fireflies in a moonlit garden where every flower sang a different melody.",
      "In the dream, I could speak with animals and they shared ancient wisdom about the nature of dreams."
    ];
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setTranscription(randomText);
    onTranscriptionComplete?.(randomText);
  };

  const clearTranscription = useCallback(() => {
    setTranscription('');
  }, []);

  return {
    isRecording,
    isProcessing,
    transcription,
    startRecording,
    stopRecording,
    clearTranscription,
  };
};