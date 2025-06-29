import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle } from 'lucide-react';
import { useImageProcessor } from '../../hooks/useImageProcessor';

interface ImageUploaderProps {
  onImageProcessed: (processedImage: Blob, originalFile: File) => void;
  onError: (error: string) => void;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageProcessed,
  onError,
  maxFileSize = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  
  const { processImage, processImageFallback } = useImageProcessor();

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      onError(`Unsupported file format. Please use: ${acceptedFormats.join(', ')}`);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      onError(`File too large. Maximum size is ${maxFileSize}MB`);
      return false;
    }

    return true;
  };

  const handleFileProcess = async (file: File) => {
    if (!validateFile(file)) return;

    setIsProcessing(true);
    
    try {
      let processedBlob: Blob;
      
      try {
        // Try using Pica first for high-quality processing
        processedBlob = await processImage(file, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.85,
          format: 'jpeg'
        });
      } catch (picaError) {
        console.warn('Pica processing failed, using fallback:', picaError);
        // Fallback to canvas-only processing
        processedBlob = await processImageFallback(file, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.85,
          format: 'jpeg'
        });
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(previewUrl);

      // Notify parent component
      onImageProcessed(processedBlob, file);
      
    } catch (error) {
      console.error('Image processing error:', error);
      onError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileProcess(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const clearImage = () => {
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
      setProcessedImage(null);
    }
  };

  return (
    <div className="space-y-4">
      {!processedImage && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-purple-400 mx-auto animate-spin" />
              <div>
                <h3 className="text-white font-medium mb-2">Processing Image</h3>
                <p className="text-gray-400 text-sm">
                  Optimizing your image for best quality and performance...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-white font-medium mb-2">Upload Dream Image</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Drag and drop an image or click to browse
                </p>
                <input
                  type="file"
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Choose Image</span>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Supports JPEG, PNG, WebP • Max {maxFileSize}MB • Auto-optimized for web
              </p>
            </div>
          )}
        </div>
      )}

      {processedImage && (
        <div className="relative">
          <img
            src={processedImage}
            alt="Processed dream image"
            className="w-full h-48 object-cover rounded-lg border border-gray-600"
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Optimized</span>
            </div>
            <button
              onClick={clearImage}
              className="p-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-full transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;