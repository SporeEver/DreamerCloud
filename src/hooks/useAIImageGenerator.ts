import { useState, useCallback } from 'react';

interface UseAIImageGeneratorProps {
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
  onError?: (error: string) => void;
}

export const useAIImageGenerator = ({
  onImageGenerated,
  onError
}: UseAIImageGeneratorProps = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');

  const generateImage = useCallback(async (dreamDescription: string, dreamMood: string) => {
    if (!dreamDescription.trim()) {
      onError?.('Please provide a dream description to generate an image.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create an optimized prompt for image generation based on the dream
      const optimizedPrompt = createImagePrompt(dreamDescription, dreamMood);
      setImagePrompt(optimizedPrompt);

      // Since we can't actually call external AI image APIs in this environment,
      // we'll simulate the image generation with a placeholder service
      const imageUrl = await simulateImageGeneration(optimizedPrompt);
      
      setGeneratedImage(imageUrl);
      onImageGenerated?.(imageUrl, optimizedPrompt);
      
    } catch (error) {
      console.error('Error generating image:', error);
      onError?.('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [onImageGenerated, onError]);

  const createImagePrompt = (dreamDescription: string, mood: string): string => {
    // Extract key visual elements from the dream description
    const moodStyles = {
      peaceful: 'serene, calm, soft lighting, pastel colors, ethereal atmosphere',
      exciting: 'dynamic, vibrant colors, energetic composition, dramatic lighting',
      scary: 'dark, mysterious, dramatic shadows, gothic atmosphere, surreal elements',
      strange: 'surreal, abstract, impossible geometry, dreamlike distortions, vivid colors',
      romantic: 'warm lighting, soft focus, beautiful scenery, romantic atmosphere',
      sad: 'melancholic, muted colors, gentle lighting, emotional depth'
    };

    const basePrompt = `A dreamlike artistic interpretation of: ${dreamDescription}`;
    const stylePrompt = moodStyles[mood as keyof typeof moodStyles] || 'artistic, dreamlike';
    
    return `${basePrompt}. Style: ${stylePrompt}, digital art, high quality, detailed, fantasy art, dream sequence`;
  };

  const simulateImageGeneration = async (prompt: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Use a placeholder image service that generates images based on text
    // In a real implementation, you would call an actual AI image generation API
    const encodedPrompt = encodeURIComponent(prompt.substring(0, 100));
    
    // Using a combination of placeholder services for variety
    const imageServices = [
      `https://picsum.photos/800/600?random=${Date.now()}`,
      `https://source.unsplash.com/800x600/?dream,fantasy,${encodedPrompt.substring(0, 20)}`,
      `https://picsum.photos/800/600?blur=2&random=${Date.now() + 1}`,
    ];
    
    // Select a random service
    const selectedService = imageServices[Math.floor(Math.random() * imageServices.length)];
    
    return selectedService;
  };

  const clearImage = useCallback(() => {
    setGeneratedImage(null);
    setImagePrompt('');
  }, []);

  const regenerateImage = useCallback(async (dreamDescription: string, dreamMood: string) => {
    clearImage();
    await generateImage(dreamDescription, dreamMood);
  }, [generateImage, clearImage]);

  return {
    isGenerating,
    generatedImage,
    imagePrompt,
    generateImage,
    clearImage,
    regenerateImage,
  };
};