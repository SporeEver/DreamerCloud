import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Filter, Search, Calendar, Brain, Sparkles, ArrowLeft, Eye, RefreshCw, Clock, Tag, Palette } from 'lucide-react';
import { useDreams } from '../hooks/useDreams';
import { useAuth } from '../hooks/useAuth';
import { useDreamAnalysis } from '../hooks/useDreamAnalysis';
import { Dream } from '../types';

const History: React.FC = () => {
  const { user } = useAuth();
  const { getUserDreams, updateDream, loading } = useDreams();
  const [searchTerm, setSearchTerm] = useState('');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showAnalyzedOnly, setShowAnalyzedOnly] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [reanalysisStyle, setReanalysisStyle] = useState<string>('general');

  const userDreams = user ? getUserDreams(user.id) : [];

  const { isAnalyzing, analyzeDream } = useDreamAnalysis({
    onAnalysisComplete: (analysis) => {
      if (selectedDream) {
        updateDream(selectedDream.id, { 
          aiAnalysis: analysis,
          analysisStyle: reanalysisStyle as any,
          analysisCreatedAt: new Date().toISOString()
        });
        setSelectedDream(null);
      }
    },
    onError: (error) => {
      console.error('Re-analysis failed:', error);
    }
  });

  const analysisStyles = [
    { value: 'jungian', label: 'Jungian', color: 'text-purple-300', bgColor: 'bg-purple-500/20' },
    { value: 'freudian', label: 'Freudian', color: 'text-red-300', bgColor: 'bg-red-500/20' },
    { value: 'emotional', label: 'Emotional', color: 'text-green-300', bgColor: 'bg-green-500/20' },
    { value: 'general', label: 'General', color: 'text-blue-300', bgColor: 'bg-blue-500/20' }
  ];

  const filteredDreams = useMemo(() => {
    return userDreams.filter(dream => {
      // Search filter
      const matchesSearch = dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dream.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dream.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (dream.aiAnalysis && dream.aiAnalysis.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Style filter
      const matchesStyle = styleFilter === 'all' || dream.analysisStyle === styleFilter;
      
      // Date filter
      const dreamDate = new Date(dream.createdAt);
      const now = new Date();
      let matchesDate = true;
      
      if (dateFilter === 'today') {
        matchesDate = dreamDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = dreamDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = dreamDate >= monthAgo;
      }
      
      // Analysis filter
      const matchesAnalysis = !showAnalyzedOnly || dream.aiAnalysis;
      
      return matchesSearch && matchesStyle && matchesDate && matchesAnalysis;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [userDreams, searchTerm, styleFilter, dateFilter, showAnalyzedOnly]);

  const handleReanalyze = async (dream: Dream) => {
    if (!user) return;
    
    setSelectedDream(dream);
    try {
      await analyzeDream(
        dream.id,
        dream.content,
        dream.mood,
        dream.tags,
        user.id,
        reanalysisStyle
      );
    } catch (error) {
      setSelectedDream(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStyleInfo = (style?: string) => {
    return analysisStyles.find(s => s.value === style) || analysisStyles[3];
  };

  const getMoodColor = (mood: Dream['mood']) => {
    const colors = {
      peaceful: 'bg-green-500/20 text-green-300',
      exciting: 'bg-orange-500/20 text-orange-300',
      scary: 'bg-red-500/20 text-red-300',
      strange: 'bg-purple-500/20 text-purple-300',
      romantic: 'bg-pink-500/20 text-pink-300',
      sad: 'bg-blue-500/20 text-blue-300',
    };
    return colors[mood] || colors.peaceful;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-300">Loading dream history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <div className="flex items-center space-x-3">
            <HistoryIcon className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Dream Analysis History</h1>
              <p className="text-gray-300">
                View and re-analyze your past dreams with different styles
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <HistoryIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Dreams</p>
                <p className="text-2xl font-bold text-white">{userDreams.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Brain className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Analyzed</p>
                <p className="text-2xl font-bold text-white">
                  {userDreams.filter(d => d.aiAnalysis).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Palette className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">With Art</p>
                <p className="text-2xl font-bold text-white">
                  {userDreams.filter(d => d.generatedImage).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Sparkles className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">This Week</p>
                <p className="text-2xl font-bold text-white">
                  {userDreams.filter(d => {
                    const dreamDate = new Date(d.createdAt);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return dreamDate >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dreams, analysis, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Style Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Styles</option>
                {analysisStyles.map(style => (
                  <option key={style.value} value={style.value}>{style.label}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Analysis Filter */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showAnalyzedOnly}
                onChange={(e) => setShowAnalyzedOnly(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Analyzed only</span>
            </label>
          </div>
        </div>

        {/* Re-analysis Style Selection */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Re-analysis Style</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {analysisStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => setReanalysisStyle(style.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reanalysisStyle === style.value
                    ? `${style.bgColor} border-purple-500 text-white`
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className={`font-medium text-sm ${style.color}`}>
                  {style.label} Analysis
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {style.value === 'jungian' && 'Archetypal symbols'}
                  {style.value === 'freudian' && 'Unconscious desires'}
                  {style.value === 'emotional' && 'Feelings-based'}
                  {style.value === 'general' && 'Comprehensive'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dreams List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Dream History ({filteredDreams.length})
            </h2>
            <Link
              to="/record-dream"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Sparkles className="h-4 w-4" />
              <span>New Dream</span>
            </Link>
          </div>
          
          {filteredDreams.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 max-w-2xl mx-auto">
                <HistoryIcon className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No Dreams Found</h3>
                <p className="text-gray-300 mb-8">
                  {searchTerm || styleFilter !== 'all' || dateFilter !== 'all' || showAnalyzedOnly
                    ? 'No dreams match your current filters. Try adjusting your search criteria.'
                    : 'You haven\'t recorded any dreams yet. Start your dream journey today!'}
                </p>
                {(!searchTerm && styleFilter === 'all' && dateFilter === 'all' && !showAnalyzedOnly) && (
                  <Link
                    to="/record-dream"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Record Your First Dream</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredDreams.map((dream) => (
                <div
                  key={dream.id}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300"
                >
                  {/* Dream Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{dream.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(dream.createdAt)}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(dream.mood)}`}>
                          {dream.mood}
                        </div>
                        {dream.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Tag className="h-3 w-3" />
                            <span>{dream.tags.slice(0, 3).join(', ')}</span>
                            {dream.tags.length > 3 && <span>+{dream.tags.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {dream.generatedImage && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-xs">
                          <Palette className="h-3 w-3" />
                          <span>Art</span>
                        </div>
                      )}
                      {dream.aiAnalysis && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStyleInfo(dream.analysisStyle).bgColor} ${getStyleInfo(dream.analysisStyle).color}`}>
                          <Brain className="h-3 w-3" />
                          <span>{getStyleInfo(dream.analysisStyle).label}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dream Content */}
                  <div className="mb-4">
                    <p className="text-gray-300 leading-relaxed line-clamp-3">
                      {dream.content}
                    </p>
                  </div>

                  {/* Generated Image */}
                  {dream.generatedImage && (
                    <div className="mb-4">
                      <img
                        src={dream.generatedImage}
                        alt={`AI generated art for: ${dream.title}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-600"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/800x400/4C1D95/FFFFFF?text=Dream+Art';
                        }}
                      />
                    </div>
                  )}

                  {/* Analysis */}
                  {dream.aiAnalysis && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="h-4 w-4 text-purple-400" />
                        <span className="text-purple-300 font-medium text-sm">
                          {getStyleInfo(dream.analysisStyle).label} Analysis
                        </span>
                        {dream.analysisCreatedAt && (
                          <span className="text-gray-400 text-xs">
                            • {formatDate(dream.analysisCreatedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                        {dream.aiAnalysis}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Link
                        to={`/journal`}
                        className="flex items-center space-x-1 text-gray-400 hover:text-purple-400 transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Full</span>
                      </Link>
                    </div>
                    <button
                      onClick={() => handleReanalyze(dream)}
                      disabled={isAnalyzing && selectedDream?.id === dream.id}
                      className="flex items-center space-x-2 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-purple-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isAnalyzing && selectedDream?.id === dream.id ? (
                        <>
                          <div className="w-3 h-3 border border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          <span>Re-analyze as {getStyleInfo(reanalysisStyle).label}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Attribution */}
        <div className="mt-12 pt-8 border-t border-gray-700/50">
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
    </div>
  );
};

export default History;