import React from 'react';
import { Sparkles, RefreshCw, Download, X, Palette, Wand2, Zap } from 'lucide-react';

interface ReplicateImageGeneratorProps {
  dreamDescription: string;
  dreamMood: string;
  isGenerating: boolean;
  generatedImage: string | null;
  imagePrompt: string;
  progress: number;
  onGenerate: () => void;
  onRegenerate: () => void;
  onClear: () => void;
  onImageSelect: (imageUrl: string, prompt: string) => void;
}

const ReplicateImageGenerator: React.FC<ReplicateImageGeneratorProps> = ({
  dreamDescription,
  dreamMood,
  isGenerating,
  generatedImage,
  imagePrompt,
  progress,
  onGenerate,
  onRegenerate,
  onClear,
  onImageSelect,
}) => {
  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dream-art-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleUseImage = () => {
    if (generatedImage && imagePrompt) {
      onImageSelect(generatedImage, imagePrompt);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 rounded-lg flex items-center justify-center">
            <Palette className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Dream Art Generator</h3>
            <p className="text-sm text-gray-400">Transform your dream into stunning visual art</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-xs">
          <Zap className="h-3 w-3" />
          <span>Replicate AI</span>
        </div>
      </div>

      {!generatedImage && !isGenerating && (
        <div className="text-center py-8">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 mb-4">
            <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-3" />
            <h4 className="text-white font-medium mb-2">Create Dream Art</h4>
            <p className="text-gray-400 text-sm mb-4">
              Generate a unique artistic interpretation of your dream using Replicate's SDXL model
            </p>
            <button
              onClick={onGenerate}
              disabled={!dreamDescription.trim()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Art</span>
            </button>
          </div>
          {!dreamDescription.trim() && (
            <p className="text-gray-500 text-xs">
              Add a dream description above to generate art
            </p>
          )}
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Palette className="h-6 w-6 text-purple-400 animate-pulse" />
            </div>
          </div>
          <h4 className="text-white font-medium mb-2">Creating Your Dream Art</h4>
          <p className="text-gray-400 text-sm mb-4">
            Replicate AI is analyzing your dream and generating a unique artistic interpretation...
          </p>
          
          {/* Progress Bar */}
          {progress > 0 && (
            <div className="w-full max-w-xs mx-auto mb-4">
              <div className="bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% complete</p>
            </div>
          )}
          
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {generatedImage && (
        <div className="space-y-4">
          <div className="relative group">
            <img
              src={generatedImage}
              alt="Generated dream art"
              className="w-full h-64 object-cover rounded-lg border border-gray-600"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/800x600/4C1D95/FFFFFF?text=Dream+Art+Generated';
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
              <button
                onClick={handleDownload}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                title="Download image"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={onClear}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {imagePrompt && (
            <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Wand2 className="h-3 w-3 text-purple-400" />
                <span className="text-xs font-medium text-purple-300">AI Prompt Used:</span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">{imagePrompt}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleUseImage}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Sparkles className="h-4 w-4" />
              <span>Use This Art</span>
            </button>
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
          <Zap className="h-3 w-3 text-purple-400" />
          <span>AI art generation powered by</span>
          <a
            href="https://replicate.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Replicate
          </a>
          <span>•</span>
          <span>SDXL Model</span>
        </div>
      </div>
    </div>
  );
};

export default ReplicateImageGenerator;