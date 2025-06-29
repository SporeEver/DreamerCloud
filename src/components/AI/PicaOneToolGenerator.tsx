import React, { useState } from 'react';
import { Sparkles, RefreshCw, Download, X, Palette, Wand2, Zap, Settings, AlertCircle, RotateCcw, Sliders } from 'lucide-react';

interface PicaOneToolGeneratorProps {
  dreamDescription: string;
  dreamMood: string;
  isGenerating: boolean;
  generatedImage: string | null;
  imagePrompt: string;
  progress: number;
  routingInfo?: any;
  error?: { message: string; retryable: boolean } | null;
  onGenerate: (style?: string, aspectRatio?: string, outputFormat?: string, highQuality?: boolean, dreamId?: string, userId?: string) => void;
  onRegenerate: (style?: string, aspectRatio?: string, outputFormat?: string, highQuality?: boolean, dreamId?: string, userId?: string) => void;
  onRetry?: (style?: string, aspectRatio?: string, outputFormat?: string, highQuality?: boolean, dreamId?: string, userId?: string) => void;
  onClear: () => void;
  onImageSelect: (imageUrl: string, prompt: string) => void;
  dreamId?: string;
  userId?: string;
}

const PicaOneToolGenerator: React.FC<PicaOneToolGeneratorProps> = ({
  dreamDescription,
  dreamMood,
  isGenerating,
  generatedImage,
  imagePrompt,
  progress,
  routingInfo,
  error,
  onGenerate,
  onRegenerate,
  onRetry,
  onClear,
  onImageSelect,
  dreamId,
  userId,
}) => {
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [outputFormat, setOutputFormat] = useState('png');
  const [highQuality, setHighQuality] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const styles = [
    { value: 'realistic', label: 'Realistic', description: 'Photorealistic and lifelike', emoji: '📸', color: 'from-blue-500 to-cyan-500' },
    { value: 'surreal', label: 'Surreal', description: 'Dreamlike and fantastical', emoji: '🌙', color: 'from-purple-500 to-pink-500' },
    { value: 'cartoon', label: 'Cartoon', description: 'Animated and stylized', emoji: '🎨', color: 'from-orange-500 to-red-500' },
    { value: 'artistic', label: 'Artistic', description: 'Fine art and painterly', emoji: '🖼️', color: 'from-green-500 to-teal-500' },
    { value: 'vintage', label: 'Vintage', description: 'Retro and nostalgic', emoji: '📻', color: 'from-amber-500 to-orange-500' },
    { value: 'futuristic', label: 'Futuristic', description: 'Sci-fi and advanced', emoji: '🚀', color: 'from-indigo-500 to-purple-500' }
  ];

  const aspectRatios = [
    { value: '16:9', label: 'Landscape (16:9)', description: 'Wide format' },
    { value: '1:1', label: 'Square (1:1)', description: 'Perfect square' },
    { value: '9:16', label: 'Portrait (9:16)', description: 'Tall format' },
    { value: '4:3', label: 'Classic (4:3)', description: 'Traditional' }
  ];

  const outputFormats = [
    { value: 'png', label: 'PNG', description: 'High quality, transparent' },
    { value: 'webp', label: 'WebP', description: 'Modern, efficient' },
    { value: 'jpeg', label: 'JPEG', description: 'Standard, compatible' }
  ];

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dream-art-flux-${Date.now()}.${outputFormat}`;
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

  const handleGenerate = () => {
    onGenerate(selectedStyle, aspectRatio, outputFormat, highQuality, dreamId, userId);
  };

  const handleRegenerate = () => {
    onRegenerate(selectedStyle, aspectRatio, outputFormat, highQuality, dreamId, userId);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry(selectedStyle, aspectRatio, outputFormat, highQuality, dreamId, userId);
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
            <h3 className="text-lg font-semibold text-white">Custom Dream Art Generator</h3>
            <p className="text-sm text-gray-400">Powered by Pica OneTool & Replicate FLUX.1 with custom parameters</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-xs">
            <Zap className="h-3 w-3" />
            <span>FLUX.1</span>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-1 rounded transition-colors ${showAdvanced ? 'text-purple-400 bg-purple-500/20' : 'text-gray-400 hover:text-gray-300'}`}
            title="Advanced settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-300 font-medium mb-1">Generation Failed</h4>
              <p className="text-red-200 text-sm mb-3">{error.message}</p>
              {error.retryable && (
                <button
                  onClick={handleRetry}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-3 py-1 bg-red-600/30 hover:bg-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 rounded text-sm transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Art Style Selection */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
          <Palette className="h-4 w-4" />
          <span>Art Style</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {styles.map((style) => (
            <button
              key={style.value}
              onClick={() => setSelectedStyle(style.value)}
              className={`p-3 rounded-lg border text-left transition-all transform hover:scale-105 ${
                selectedStyle === style.value
                  ? `bg-gradient-to-r ${style.color} bg-opacity-30 border-purple-500 text-white shadow-lg`
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{style.emoji}</span>
                <span className="font-medium text-sm">{style.label}</span>
              </div>
              <div className="text-xs opacity-75">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="mb-6 p-4 bg-gray-700/30 border border-gray-600/50 rounded-lg space-y-4">
          <h4 className="text-white font-medium flex items-center space-x-2">
            <Sliders className="h-4 w-4" />
            <span>Advanced Parameters</span>
          </h4>
          
          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`p-2 rounded border text-xs transition-colors ${
                    aspectRatio === ratio.value
                      ? 'bg-purple-500/30 border-purple-500 text-purple-300'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium">{ratio.label}</div>
                  <div className="opacity-75">{ratio.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
            <div className="grid grid-cols-3 gap-2">
              {outputFormats.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setOutputFormat(format.value)}
                  className={`p-2 rounded border text-xs transition-colors ${
                    outputFormat === format.value
                      ? 'bg-blue-500/30 border-blue-500 text-blue-300'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium">{format.label}</div>
                  <div className="opacity-75">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Settings */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={highQuality}
                onChange={(e) => setHighQuality(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-300">High Quality Mode</span>
                <p className="text-xs text-gray-400">Enhanced detail and vibrant colors (slower generation)</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {!generatedImage && !isGenerating && (
        <div className="text-center py-8">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 mb-4">
            <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-3" />
            <h4 className="text-white font-medium mb-2">Create Custom Dream Art</h4>
            <p className="text-gray-400 text-sm mb-4">
              Generate stunning artwork with customizable parameters using Pica OneTool's intelligent routing to FLUX.1
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400 mb-4">
              <span className="bg-gray-700/50 px-2 py-1 rounded">Style: {selectedStyle}</span>
              <span className="bg-gray-700/50 px-2 py-1 rounded">Ratio: {aspectRatio}</span>
              <span className="bg-gray-700/50 px-2 py-1 rounded">Format: {outputFormat.toUpperCase()}</span>
              {highQuality && <span className="bg-purple-500/20 px-2 py-1 rounded text-purple-300">High Quality</span>}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!dreamDescription.trim()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Custom Art</span>
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
          <h4 className="text-white font-medium mb-2">Generating Custom Art</h4>
          <p className="text-gray-400 text-sm mb-4">
            Creating {selectedStyle} style art in {aspectRatio} format with {highQuality ? 'high' : 'standard'} quality...
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
              alt="Generated custom dream art via Pica OneTool"
              className="w-full h-64 object-cover rounded-lg border border-gray-600"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/800x600/4C1D95/FFFFFF?text=Custom+FLUX.1+Art';
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

          {/* Generation Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-gray-700/30 border border-gray-600/50 rounded p-2 text-center">
              <div className="text-gray-400">Style</div>
              <div className="text-white font-medium capitalize">{selectedStyle}</div>
            </div>
            <div className="bg-gray-700/30 border border-gray-600/50 rounded p-2 text-center">
              <div className="text-gray-400">Ratio</div>
              <div className="text-white font-medium">{aspectRatio}</div>
            </div>
            <div className="bg-gray-700/30 border border-gray-600/50 rounded p-2 text-center">
              <div className="text-gray-400">Format</div>
              <div className="text-white font-medium">{outputFormat.toUpperCase()}</div>
            </div>
            <div className="bg-gray-700/30 border border-gray-600/50 rounded p-2 text-center">
              <div className="text-gray-400">Quality</div>
              <div className="text-white font-medium">{highQuality ? 'High' : 'Standard'}</div>
            </div>
          </div>

          {/* Routing Info */}
          {routingInfo && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-3 w-3 text-blue-400" />
                <span className="text-xs font-medium text-blue-300">Pica OneTool Routing:</span>
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>Model: {routingInfo.model?.toUpperCase()}</div>
                <div>Provider: {routingInfo.provider}</div>
                <div>Routing: {routingInfo.routing}</div>
                {routingInfo.attempt && <div>Attempt: {routingInfo.attempt}</div>}
              </div>
            </div>
          )}

          {imagePrompt && (
            <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Wand2 className="h-3 w-3 text-purple-400" />
                <span className="text-xs font-medium text-purple-300">Optimized Prompt:</span>
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
              onClick={handleRegenerate}
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
          <span>Powered by</span>
          <a
            href="https://pica.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Pica OneTool
          </a>
          <span>•</span>
          <a
            href="https://replicate.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Replicate FLUX.1
          </a>
          <span>•</span>
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Built with Bolt.new
          </a>
        </div>
      </div>
    </div>
  );
};

export default PicaOneToolGenerator;