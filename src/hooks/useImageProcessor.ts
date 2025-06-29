import { useCallback } from 'react';

// Import Pica with proper ES module syntax
let Pica: any;

const loadPica = async () => {
  if (!Pica) {
    try {
      // Dynamic import for Pica to handle module loading
      const picaModule = await import('pica');
      Pica = picaModule.default || picaModule;
    } catch (error) {
      console.error('Failed to load Pica:', error);
      throw new Error('Image processing library not available');
    }
  }
  return Pica;
};

interface UseImageProcessorOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export const useImageProcessor = () => {
  const processImage = useCallback(async (
    file: File | Blob,
    options: UseImageProcessorOptions = {}
  ): Promise<Blob> => {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.85,
      format = 'jpeg'
    } = options;

    try {
      // Load Pica dynamically
      const PicaClass = await loadPica();
      const pica = new PicaClass();

      // Create image element
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Load image
      const imageUrl = URL.createObjectURL(file);
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            // Calculate new dimensions while maintaining aspect ratio
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
              const aspectRatio = width / height;
              
              if (width > height) {
                width = maxWidth;
                height = width / aspectRatio;
              } else {
                height = maxHeight;
                width = height * aspectRatio;
              }
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Use Pica for high-quality resizing
            const resizedCanvas = await pica.resize(img, canvas, {
              unsharpAmount: 80,
              unsharpRadius: 0.6,
              unsharpThreshold: 2
            });

            // Convert to blob with specified format and quality
            const blob = await pica.toBlob(resizedCanvas, `image/${format}`, quality);
            
            URL.revokeObjectURL(imageUrl);
            resolve(blob);
          } catch (error) {
            URL.revokeObjectURL(imageUrl);
            reject(error);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Failed to load image'));
        };

        img.src = imageUrl;
      });
    } catch (error) {
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const createThumbnail = useCallback(async (
    file: File | Blob,
    size: number = 200
  ): Promise<Blob> => {
    return processImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.8,
      format: 'jpeg'
    });
  }, [processImage]);

  const optimizeForWeb = useCallback(async (
    file: File | Blob
  ): Promise<Blob> => {
    return processImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85,
      format: 'webp'
    });
  }, [processImage]);

  // Fallback image processing without Pica
  const processImageFallback = useCallback(async (
    file: File | Blob,
    options: UseImageProcessorOptions = {}
  ): Promise<Blob> => {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.85,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const imageUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }

          // Set canvas dimensions and draw image
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(imageUrl);
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  }, []);

  return {
    processImage,
    createThumbnail,
    optimizeForWeb,
    processImageFallback
  };
};