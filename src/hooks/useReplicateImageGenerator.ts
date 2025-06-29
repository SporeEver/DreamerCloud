import { useState, useCallback } from 'react';

interface UseReplicateImageGeneratorProps {
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
  onError?: (error: string) => void;
}

export const useReplicateImageGenerator = ({
  onImageGenerated,
  onError
}: UseReplicateImageGeneratorProps = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const generateImage = useCallback(async (dreamDescription: string, dreamMood: string) => {
    if (!dreamDescription.trim()) {
      onError?.('Please provide a dream description to generate an image.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Create an optimized prompt for image generation based on the dream
      const optimizedPrompt = createImagePrompt(dreamDescription, dreamMood);
      setImagePrompt(optimizedPrompt);

      // Call Replicate API through our Netlify function
      const response = await fetch('/.netlify/functions/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: optimizedPrompt,
          dreamText: dreamDescription,
          mood: dreamMood
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        onImageGenerated?.(data.imageUrl, optimizedPrompt);
      } else if (data.predictionId) {
        // Poll for completion if we get a prediction ID
        await pollForCompletion(data.predictionId, optimizedPrompt);
      } else {
        throw new Error('Invalid response from image generation service');
      }
      
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [onImageGenerated, onError]);

  const pollForCompletion = async (predictionId: string, prompt: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/.netlify/functions/check-image-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ predictionId }),
        });

        if (!response.ok) {
          throw new Error('Failed to check image status');
        }

        const data = await response.json();
        
        if (data.status === 'succeeded' && data.imageUrl) {
          setGeneratedImage(data.imageUrl);
          onImageGenerated?.(data.imageUrl, prompt);
          return;
        } else if (data.status === 'failed') {
          throw new Error(data.error || 'Image generation failed');
        }

        // Update progress
        setProgress(Math.min(90, (attempts / maxAttempts) * 100));
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
        
      } catch (error) {
        console.error('Error polling for image completion:', error);
        throw error;
      }
    }

    throw new Error('Image generation timed out');
  };

  const createImagePrompt = (dreamDescription: string, mood: string): string => {
    // Extract key visual elements from the dream description
    const moodStyles = {
      peaceful: 'serene, calm, soft lighting, pastel colors, ethereal atmosphere, peaceful, tranquil',
      exciting: 'dynamic, vibrant colors, energetic composition, dramatic lighting, action-packed',
      scary: 'dark, mysterious, dramatic shadows, gothic atmosphere, surreal elements, horror',
      strange: 'surreal, abstract, impossible geometry, dreamlike distortions, vivid colors, bizarre',
      romantic: 'warm lighting, soft focus, beautiful scenery, romantic atmosphere, love, tender',
      sad: 'melancholic, muted colors, gentle lighting, emotional depth, somber, reflective'
    };

    const basePrompt = `A dreamlike artistic interpretation of: ${dreamDescription}`;
    const stylePrompt = moodStyles[mood as keyof typeof moodStyles] || 'artistic, dreamlike';
    
    return `${basePrompt}. Style: ${stylePrompt}, digital art, high quality, detailed, fantasy art, dream sequence, cinematic, 8k resolution, masterpiece`;
  };

  const clearImage = useCallback(() => {
    setGeneratedImage(null);
    setImagePrompt('');
    setProgress(0);
  }, []);

  const regenerateImage = useCallback(async (dreamDescription: string, dreamMood: string) => {
    clearImage();
    await generateImage(dreamDescription, dreamMood);
  }, [generateImage, clearImage]);

  return {
    isGenerating,
    generatedImage,
    imagePrompt,
    progress,
    generateImage,
    clearImage,
    regenerateImage,
  };
};