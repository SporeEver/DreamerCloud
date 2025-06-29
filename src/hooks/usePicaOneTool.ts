import { useState, useCallback } from 'react';

interface UsePicaOneToolProps {
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
  onError?: (error: string) => void;
}

interface GenerationError {
  message: string;
  retryable: boolean;
  statusCode?: number;
}

export const usePicaOneTool = ({
  onImageGenerated,
  onError
}: UsePicaOneToolProps = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [routingInfo, setRoutingInfo] = useState<any>(null);
  const [error, setError] = useState<GenerationError | null>(null);

  const generateArt = useCallback(async (
    dreamDescription: string, 
    dreamMood: string, 
    style: string = 'realistic',
    aspectRatio: string = '16:9',
    outputFormat: string = 'png',
    highQuality: boolean = true,
    dreamId?: string,
    userId?: string
  ) => {
    if (!dreamDescription.trim()) {
      const errorMsg = 'Please provide a dream description to generate art.';
      setError({ message: errorMsg, retryable: false });
      onError?.(errorMsg);
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setRoutingInfo(null);
    setError(null);
    
    try {
      // Create an optimized prompt for FLUX.1 via Pica OneTool with custom parameters
      const optimizedPrompt = createCustomFluxPrompt(dreamDescription, dreamMood, style, highQuality);
      setImagePrompt(optimizedPrompt);

      console.log('Pica OneTool: Starting custom art generation');
      console.log('Parameters:', { style, aspectRatio, outputFormat, highQuality });
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return Math.min(newProgress, 85);
        });
      }, 1000);

      // Call Pica OneTool endpoint that routes to Replicate with custom parameters
      const response = await fetch('/.netlify/functions/generate-art', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: optimizedPrompt,
          dreamText: dreamDescription,
          mood: dreamMood,
          style: style,
          aspectRatio: aspectRatio,
          outputFormat: outputFormat,
          highQuality: highQuality,
          dreamId: dreamId,
          userId: userId
        }),
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        const error: GenerationError = {
          message: data.error || `HTTP ${response.status}: ${response.statusText}`,
          retryable: data.retryable || false,
          statusCode: response.status
        };
        throw error;
      }
      
      if (data.success && data.imageUrl) {
        setProgress(100);
        setGeneratedImage(data.imageUrl);
        setRoutingInfo({
          model: data.model,
          routing: data.routing,
          provider: data.provider,
          attempt: data.attempt,
          parameters: data.parameters
        });
        onImageGenerated?.(data.imageUrl, data.prompt);
        console.log('Pica OneTool: Successfully generated custom image via', data.model);
      } else {
        throw new Error('Invalid response from Pica OneTool routing service');
      }
      
    } catch (error) {
      console.error('Pica OneTool custom routing error:', error);
      
      let errorMessage = 'Failed to generate custom art. Please try again.';
      let retryable = true;

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Handle specific error types
      if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        retryable = (error as any).retryable || false;
        
        switch (statusCode) {
          case 401:
            errorMessage = 'Authentication failed. Please check your API configuration.';
            retryable = false;
            break;
          case 429:
            errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
            retryable = true;
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            retryable = true;
            break;
          case 408:
            errorMessage = 'Request timed out. Please try again.';
            retryable = true;
            break;
        }
      }

      const errorObj: GenerationError = {
        message: errorMessage,
        retryable: retryable
      };

      setError(errorObj);
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [onImageGenerated, onError]);

  const createCustomFluxPrompt = (dreamDescription: string, mood: string, style: string, highQuality: boolean): string => {
    // Pica OneTool: Enhanced FLUX.1 prompt engineering with custom parameters
    const styleEnhancements = {
      realistic: 'photorealistic, detailed, lifelike, professional photography, sharp focus, natural lighting',
      surreal: 'surreal, dreamlike, impossible, fantastical, otherworldly, abstract, mind-bending',
      cartoon: 'cartoon style, animated, colorful, stylized, illustration, digital art, vibrant',
      artistic: 'artistic, painterly, expressive, creative, fine art, masterpiece, brushstrokes',
      vintage: 'vintage, retro, nostalgic, classic, aged, timeless aesthetic, film grain',
      futuristic: 'futuristic, sci-fi, advanced, technological, cyberpunk, modern, neon'
    };

    const moodKeywords = {
      peaceful: 'serene, tranquil, soft lighting, ethereal, calm atmosphere, gentle, harmonious',
      exciting: 'dynamic, energetic, vibrant, dramatic lighting, action-packed, intense, thrilling',
      scary: 'dark, ominous, mysterious, dramatic shadows, horror atmosphere, eerie, haunting',
      strange: 'surreal, bizarre, abstract, impossible geometry, dreamlike, unusual, weird',
      romantic: 'romantic, warm lighting, soft focus, beautiful, tender, loving, intimate',
      sad: 'melancholic, somber, muted colors, emotional, reflective, poignant, wistful'
    };

    const qualityEnhancements = highQuality 
      ? 'ultra-detailed, 8k resolution, masterpiece, professional quality, crisp, sharp, high detail, perfect composition'
      : 'detailed, good quality, clear, well-composed';

    const basePrompt = dreamDescription;
    const styleKeywords = styleEnhancements[style as keyof typeof styleEnhancements] || styleEnhancements.realistic;
    const moodKeywords_ = moodKeywords[mood as keyof typeof moodKeywords] || 'artistic, creative';
    
    // FLUX.1 optimized structure via Pica OneTool with custom parameters
    return `${basePrompt}, ${styleKeywords}, ${moodKeywords_}, ${qualityEnhancements}, vibrant colors, excellent composition, cinematic lighting`;
  };

  const clearImage = useCallback(() => {
    setGeneratedImage(null);
    setImagePrompt('');
    setProgress(0);
    setRoutingInfo(null);
    setError(null);
  }, []);

  const regenerateArt = useCallback(async (
    dreamDescription: string, 
    dreamMood: string, 
    style: string = 'realistic',
    aspectRatio: string = '16:9',
    outputFormat: string = 'png',
    highQuality: boolean = true,
    dreamId?: string,
    userId?: string
  ) => {
    clearImage();
    await generateArt(dreamDescription, dreamMood, style, aspectRatio, outputFormat, highQuality, dreamId, userId);
  }, [generateArt, clearImage]);

  const retryGeneration = useCallback(async (
    dreamDescription: string, 
    dreamMood: string, 
    style: string = 'realistic',
    aspectRatio: string = '16:9',
    outputFormat: string = 'png',
    highQuality: boolean = true,
    dreamId?: string,
    userId?: string
  ) => {
    if (error?.retryable) {
      await generateArt(dreamDescription, dreamMood, style, aspectRatio, outputFormat, highQuality, dreamId, userId);
    }
  }, [generateArt, error]);

  return {
    isGenerating,
    generatedImage,
    imagePrompt,
    progress,
    routingInfo,
    error,
    generateArt,
    clearImage,
    regenerateArt,
    retryGeneration,
  };
};