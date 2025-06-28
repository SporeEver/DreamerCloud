import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Cloud, Calendar, User, Tag, Palette, Brain, Eye, AlertCircle, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { Dream } from '../types';
import StarField from '../components/Layout/StarField';

interface SharedDreamData {
  dream: Dream;
  shareInfo: {
    shareToken: string;
    createdAt: string;
    expiresAt?: string;
    viewCount: number;
  };
}

const SharedDream: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [dreamData, setDreamData] = useState<SharedDreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSharedDream(token);
    }
  }, [token]);

  const fetchSharedDream = async (shareToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/.netlify/functions/get-shared-dream?token=${shareToken}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load shared dream');
      }

      if (data.success) {
        setDreamData(data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching shared dream:', err);
      setError(err instanceof Error ? err.message : 'Failed to load shared dream');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood: Dream['mood']) => {
    const colors = {
      peaceful: 'bg-green-500/20 text-green-300 border-green-500/30',
      exciting: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      scary: 'bg-red-500/20 text-red-300 border-red-500/30',
      strange: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      romantic: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      sad: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    };
    return colors[mood] || colors.peaceful;
  };

  const getAnalysisStyleInfo = (style?: string) => {
    const styles = {
      jungian: { label: 'Jungian', color: 'text-purple-300', bgColor: 'bg-purple-500/20' },
      freudian: { label: 'Freudian', color: 'text-red-300', bgColor: 'bg-red-500/20' },
      emotional: { label: 'Emotional', color: 'text-green-300', bgColor: 'bg-green-500/20' },
      general: { label: 'General', color: 'text-blue-300', bgColor: 'bg-blue-500/20' }
    };
    return styles[style as keyof typeof styles] || styles.general;
  };

  const formatAnalysisText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        const level = line.startsWith('## ') ? 'h3' : 'h4';
        const text = line.replace(/^#{2,3} /, '');
        const Component = level as keyof JSX.IntrinsicElements;
        return (
          <Component key={index} className="text-lg font-semibold text-white mt-4 mb-2 flex items-center space-x-2">
            <Brain className="h-4 w-4 text-purple-400" />
            <span>{text}</span>
          </Component>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="text-purple-300 font-medium mb-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return (
          <p key={index} className="text-gray-300 leading-relaxed mb-2">
            {line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').split('<strong').map((part, i) => {
              if (part.includes('</strong>')) {
                const [boldText, rest] = part.split('</strong>');
                const cleanBoldText = boldText.replace(' class="text-white">', '');
                return (
                  <React.Fragment key={i}>
                    <strong className="text-white">{cleanBoldText}</strong>
                    {rest}
                  </React.Fragment>
                );
              }
              return part;
            })}
          </p>
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden flex items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center">
          <Loader2 className="h-12 w-12 text-purple-400 mx-auto animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Shared Dream</h2>
          <p className="text-gray-300">Retrieving dream content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden flex items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-8 mb-6">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Dream Not Found</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go to DreamerCloud</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!dreamData) {
    return null;
  }

  const { dream, shareInfo } = dreamData;
  const styleInfo = getAnalysisStyleInfo(dream.analysisStyle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      <StarField />
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <Cloud className="h-8 w-8 text-purple-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            DreamerCloud
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
            <Eye className="h-3 w-3" />
            <span>{shareInfo.viewCount} views</span>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Explore DreamerCloud
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Shared Dream Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 rounded-full text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Shared Dream Experience</span>
          </div>
        </div>

        {/* Dream Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {dream.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{dream.username}</h3>
                <div className="flex items-center space-x-1 text-gray-400 text-sm">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(dream.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {dream.generatedImage && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-xs">
                  <Palette className="h-3 w-3" />
                  <span>AI Art</span>
                </div>
              )}
              {dream.aiAnalysis && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${styleInfo.bgColor} ${styleInfo.color}`}>
                  <Brain className="h-3 w-3" />
                  <span>{styleInfo.label}</span>
                </div>
              )}
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getMoodColor(dream.mood)}`}>
                {dream.mood}
              </div>
            </div>
          </div>

          {/* Generated Image */}
          {dream.generatedImage && !imageError && (
            <div className="mb-6">
              <img
                src={dream.generatedImage}
                alt={`AI generated art for: ${dream.title}`}
                className="w-full h-64 object-cover rounded-lg border border-gray-600"
                onError={() => setImageError(true)}
              />
              {dream.imagePrompt && (
                <div className="mt-2 p-2 bg-gray-700/30 border border-gray-600/50 rounded text-xs text-gray-400">
                  <div className="flex items-center space-x-1 mb-1">
                    <Palette className="h-3 w-3 text-purple-400" />
                    <span className="font-medium text-purple-300">AI Art Prompt:</span>
                  </div>
                  <p>{dream.imagePrompt}</p>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-4">{dream.title}</h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                {dream.content}
              </p>
            </div>
          </div>

          {/* Tags */}
          {dream.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {dream.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-full"
                >
                  <Tag className="h-3 w-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Dream Analysis */}
          {dream.aiAnalysis && (
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`bg-gradient-to-r from-purple-500 to-blue-500 w-8 h-8 rounded-lg flex items-center justify-center`}>
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{styleInfo.label} Dream Analysis</h4>
                  <p className="text-gray-400 text-sm">AI-powered psychological interpretation</p>
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed">
                  {formatAnalysisText(dream.aiAnalysis)}
                </div>
              </div>
            </div>
          )}

          {/* Share Info */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{shareInfo.viewCount} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Shared {formatDate(shareInfo.createdAt)}</span>
                </div>
                {shareInfo.expiresAt && (
                  <div className="flex items-center space-x-1">
                    <span>Expires {formatDate(shareInfo.expiresAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Start Your Own Dream Journey</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of dreamers who are capturing, analyzing, and sharing their nocturnal adventures with AI-powered insights.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              <span>Join DreamerCloud</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-sm py-8 border-t border-gray-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Cloud className="h-6 w-6 text-purple-400" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                DreamerCloud
              </span>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p className="mb-1">
                AI analysis powered by{' '}
                <a
                  href="https://pica.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Pica OneTool
                </a>
                {' • '}
                Art generation via{' '}
                <a
                  href="https://replicate.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Replicate FLUX.1
                </a>
              </p>
              <p>
                Built with{' '}
                <a
                  href="https://bolt.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Bolt.new
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SharedDream;