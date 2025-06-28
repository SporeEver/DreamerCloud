import React, { useState } from 'react';
import { Brain, Loader2, Sparkles, Eye, EyeOff, RefreshCw, Zap, BookOpen, Lightbulb, Heart, Settings, User, Compass, Palette, Lock } from 'lucide-react';
import { useDreamAnalysis } from '../../hooks/useDreamAnalysis';
import { useSubscription } from '../../hooks/useSubscription';
import DreamNarration from '../AI/DreamNarration';
import PaywallModal from '../Subscription/PaywallModal';
import PremiumBadge from '../Subscription/PremiumBadge';

interface DreamAnalysisProps {
  dreamId: string;
  dreamText: string;
  dreamMood?: string;
  dreamTags?: string[];
  existingAnalysis?: string;
  existingAnalysisStyle?: string;
  onAnalysisUpdate?: (analysis: string) => void;
  userId?: string;
}

const DreamAnalysis: React.FC<DreamAnalysisProps> = ({
  dreamId,
  dreamText,
  dreamMood,
  dreamTags,
  existingAnalysis,
  existingAnalysisStyle,
  onAnalysisUpdate,
  userId
}) => {
  const [showAnalysis, setShowAnalysis] = useState(!!existingAnalysis);
  const [showNarration, setShowNarration] = useState(false);
  const [error, setError] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState(existingAnalysis || '');
  const [currentAnalysisStyle, setCurrentAnalysisStyle] = useState(existingAnalysisStyle || 'general');
  const [selectedStyle, setSelectedStyle] = useState<string>('general');
  const [analysisSource, setAnalysisSource] = useState<'ai' | 'cache' | null>(null);
  const [paywallFeature, setPaywallFeature] = useState<'jungian' | 'freudian' | 'narration' | null>(null);

  const { subscriptionStatus, isPremiumFeature } = useSubscription();

  const analysisStyles = [
    {
      value: 'jungian',
      label: 'Jungian',
      description: 'Archetypal symbols and collective unconscious',
      icon: Compass,
      color: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-300',
      isPremium: true
    },
    {
      value: 'freudian',
      label: 'Freudian',
      description: 'Unconscious desires and psychoanalytic interpretation',
      icon: Brain,
      color: 'from-red-500 to-pink-500',
      textColor: 'text-red-300',
      isPremium: true
    },
    {
      value: 'emotional',
      label: 'Emotional',
      description: 'Feelings-based analysis and emotional processing',
      icon: Heart,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-300',
      isPremium: false
    },
    {
      value: 'general',
      label: 'General',
      description: 'Comprehensive psychological and symbolic analysis',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-300',
      isPremium: false
    }
  ];

  const { isAnalyzing, analyzeDream } = useDreamAnalysis({
    onAnalysisComplete: (analysis, source) => {
      setCurrentAnalysis(analysis);
      setCurrentAnalysisStyle(selectedStyle);
      setShowAnalysis(true);
      setError('');
      setAnalysisSource(source || 'ai');
      onAnalysisUpdate?.(analysis);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  });

  const handleAnalyze = async () => {
    // Check if selected style requires premium subscription
    if ((selectedStyle === 'jungian' || selectedStyle === 'freudian') && isPremiumFeature(selectedStyle as 'jungian' | 'freudian')) {
      setPaywallFeature(selectedStyle as 'jungian' | 'freudian');
      return;
    }

    setError('');
    try {
      await analyzeDream(dreamId, dreamText, dreamMood, dreamTags, userId, selectedStyle);
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  const handleReanalyze = async () => {
    setCurrentAnalysis('');
    setAnalysisSource(null);
    await handleAnalyze();
  };

  const toggleAnalysisVisibility = () => {
    setShowAnalysis(!showAnalysis);
  };

  const toggleNarration = () => {
    // Check if narration requires premium subscription
    if (isPremiumFeature('narration')) {
      setPaywallFeature('narration');
      return;
    }
    setShowNarration(!showNarration);
  };

  const handleStyleSelect = (styleValue: string) => {
    const style = analysisStyles.find(s => s.value === styleValue);
    if (style?.isPremium && isPremiumFeature(styleValue as 'jungian' | 'freudian')) {
      setPaywallFeature(styleValue as 'jungian' | 'freudian');
      return;
    }
    setSelectedStyle(styleValue);
  };

  const formatAnalysisText = (text: string) => {
    // Convert markdown-style formatting to JSX
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        const level = line.startsWith('## ') ? 'h3' : 'h4';
        const text = line.replace(/^#{2,3} /, '');
        const Component = level as keyof JSX.IntrinsicElements;
        return (
          <Component key={index} className="text-lg font-semibold text-white mt-4 mb-2 flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 text-purple-400" />
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

  const getStyleInfo = (styleValue: string) => {
    return analysisStyles.find(style => style.value === styleValue) || analysisStyles[3];
  };

  const currentStyleInfo = getStyleInfo(currentAnalysisStyle);

  return (
    <div className="space-y-4">
      {/* Subscription Status Display */}
      {subscriptionStatus.isSubscribed && (
        <div className="flex items-center justify-center mb-4">
          <PremiumBadge variant="default" />
        </div>
      )}

      {/* Analysis Style Selection */}
      {!currentAnalysis && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Analysis Style</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysisStyles.map((style) => {
              const IconComponent = style.icon;
              const isLocked = style.isPremium && isPremiumFeature(style.value as 'jungian' | 'freudian');
              
              return (
                <button
                  key={style.value}
                  onClick={() => handleStyleSelect(style.value)}
                  className={`p-4 rounded-lg border text-left transition-all transform hover:scale-105 relative ${
                    selectedStyle === style.value
                      ? `bg-gradient-to-r ${style.color} bg-opacity-20 border-purple-500 shadow-lg`
                      : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                  } ${isLocked ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${style.color} relative`}>
                      <IconComponent className="h-4 w-4 text-white" />
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <Lock className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium flex items-center space-x-2 ${selectedStyle === style.value ? 'text-white' : 'text-gray-300'}`}>
                        <span>{style.label} Analysis</span>
                        {style.isPremium && <PremiumBadge variant="small" />}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm ${selectedStyle === style.value ? 'text-gray-200' : 'text-gray-400'}`}>
                    {style.description}
                  </div>
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                        Premium Required
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {!currentAnalysis ? (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  <span>Analyze Dream</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleAnalysisVisibility}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
              >
                {showAnalysis ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Hide Analysis</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Show Analysis</span>
                  </>
                )}
              </button>
              <button
                onClick={handleReanalyze}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-purple-300 rounded-lg font-medium transition-colors"
                title="Generate new analysis"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {currentAnalysis && (
          <div className="flex items-center space-x-2">
            {analysisSource === 'cache' && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full text-xs">
                <Zap className="h-3 w-3" />
                <span>Cached</span>
              </div>
            )}
            <div className={`flex items-center space-x-1 px-2 py-1 bg-gradient-to-r ${currentStyleInfo.color} bg-opacity-20 ${currentStyleInfo.textColor} rounded-full text-xs`}>
              <currentStyleInfo.icon className="h-3 w-3" />
              <span>{currentStyleInfo.label}</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-full text-xs">
              <Sparkles className="h-3 w-3" />
              <span>AI Analyzed</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-red-500/30 p-2 rounded-lg">
              <Brain className="h-4 w-4 text-red-300" />
            </div>
            <div className="flex-1">
              <h4 className="text-red-300 font-medium mb-1">Analysis Failed</h4>
              <p className="text-red-200 text-sm mb-3">{error}</p>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 px-3 py-1 bg-red-600/30 hover:bg-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 rounded text-sm transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <Brain className="absolute inset-0 m-auto h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h4 className="text-white font-medium">Analyzing Your Dream</h4>
              <p className="text-gray-400 text-sm">
                Generating {getStyleInfo(selectedStyle).label.toLowerCase()} analysis with Pica OneTool AI routing...
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
              <BookOpen className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-purple-300 text-sm font-medium">Symbolic Analysis</div>
              <div className="text-purple-200 text-xs">Interpreting dream symbols</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <Brain className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-blue-300 text-sm font-medium">Psychological Insights</div>
              <div className="text-blue-200 text-xs">Understanding patterns</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <Heart className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-green-300 text-sm font-medium">Personal Growth</div>
              <div className="text-green-200 text-xs">Identifying opportunities</div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Analysis Display */}
      {currentAnalysis && showAnalysis && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`bg-gradient-to-r ${currentStyleInfo.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                  <currentStyleInfo.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold flex items-center space-x-2">
                    <span>{currentStyleInfo.label} Dream Analysis</span>
                    {currentStyleInfo.value === 'jungian' || currentStyleInfo.value === 'freudian' ? (
                      <PremiumBadge variant="small" />
                    ) : null}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {analysisSource === 'cache' ? 'Cached analysis' : 'Fresh AI-powered interpretation'} • {currentStyleInfo.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {analysisSource === 'cache' && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                    <Zap className="h-3 w-3" />
                    <span>Instant</span>
                  </div>
                )}
                <button
                  onClick={toggleNarration}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isPremiumFeature('narration') 
                      ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-500/30'
                      : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300'
                  }`}
                >
                  {isPremiumFeature('narration') && <Lock className="h-3 w-3" />}
                  <span>{showNarration ? 'Hide' : 'Show'} Narration</span>
                  {isPremiumFeature('narration') && <PremiumBadge variant="small" showIcon={false} />}
                </button>
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed">
                {formatAnalysisText(currentAnalysis)}
              </div>
            </div>

            {/* Analysis Metrics */}
            <div className="mt-6 pt-4 border-t border-gray-700/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-purple-400 text-lg font-bold">{dreamText.split(' ').length}</div>
                  <div className="text-gray-400 text-xs">Words Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 text-lg font-bold">{dreamTags?.length || 0}</div>
                  <div className="text-gray-400 text-xs">Themes Identified</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 text-lg font-bold capitalize">{dreamMood}</div>
                  <div className="text-gray-400 text-xs">Emotional Tone</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${currentStyleInfo.textColor}`}>{currentStyleInfo.label}</div>
                  <div className="text-gray-400 text-xs">Analysis Style</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span>Dream analysis powered by</span>
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

          {/* Dream Narration Component */}
          {showNarration && !isPremiumFeature('narration') && (
            <DreamNarration
              analysisText={currentAnalysis}
              analysisStyle={currentAnalysisStyle}
              onError={(error) => setError(error)}
            />
          )}
        </div>
      )}

      {/* Paywall Modal */}
      {paywallFeature && (
        <PaywallModal
          isOpen={true}
          onClose={() => setPaywallFeature(null)}
          feature={paywallFeature}
          onSubscribeSuccess={() => {
            // Refresh subscription status and continue with the action
            if (paywallFeature === 'narration') {
              setShowNarration(true);
            } else {
              setSelectedStyle(paywallFeature);
            }
            setPaywallFeature(null);
          }}
        />
      )}
    </div>
  );
};

export default DreamAnalysis;