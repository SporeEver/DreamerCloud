import { useState, useCallback } from 'react';

interface UseDreamAnalysisProps {
  onAnalysisComplete?: (analysis: string, source?: 'ai' | 'cache') => void;
  onError?: (error: string) => void;
}

export const useDreamAnalysis = ({
  onAnalysisComplete,
  onError
}: UseDreamAnalysisProps = {}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<Record<string, { 
    analysis: string; 
    source: 'ai' | 'cache';
    style: string;
  }>>({});

  const analyzeDream = useCallback(async (
    dreamId: string,
    dreamText: string,
    dreamMood?: string,
    dreamTags?: string[],
    userId?: string,
    analysisStyle: string = 'general'
  ) => {
    if (!dreamId || !dreamText.trim()) {
      onError?.('Dream ID and text are required for analysis.');
      return;
    }

    if (!userId) {
      onError?.('User authentication required for dream analysis.');
      return;
    }

    // Validate analysis style
    const validStyles = ['jungian', 'freudian', 'emotional', 'general'];
    if (!validStyles.includes(analysisStyle)) {
      onError?.('Invalid analysis style selected.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log(`Starting Pica OneTool dream analysis with ${analysisStyle} style...`);
      
      const response = await fetch('/.netlify/functions/analyze-dream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamId,
          dreamText,
          dreamMood,
          dreamTags,
          userId,
          analysisStyle
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        const source = data.source || 'ai';
        const style = data.style || analysisStyle;
        
        setAnalysisResults(prev => ({
          ...prev,
          [dreamId]: { 
            analysis: data.analysis, 
            source: source as 'ai' | 'cache',
            style: style
          }
        }));
        
        console.log(`Pica OneTool ${style} analysis completed via ${source} (${data.model || 'unknown model'})`);
        onAnalysisComplete?.(data.analysis, source as 'ai' | 'cache');
        return data.analysis;
      } else {
        throw new Error('Invalid response from Pica OneTool analysis service');
      }
      
    } catch (error) {
      console.error('Pica OneTool dream analysis error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to analyze dream. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('authentication') || error.message.includes('401')) {
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Analysis timed out. Please try again with a shorter dream description.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('access denied')) {
          errorMessage = 'Access denied. You can only analyze your own dreams.';
        } else if (error.message.includes('Invalid analysis style')) {
          errorMessage = 'Invalid analysis style selected. Please choose a valid style.';
        }
      }
      
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete, onError]);

  const getAnalysis = useCallback((dreamId: string) => {
    const result = analysisResults[dreamId];
    return result ? result.analysis : null;
  }, [analysisResults]);

  const getAnalysisSource = useCallback((dreamId: string) => {
    const result = analysisResults[dreamId];
    return result ? result.source : null;
  }, [analysisResults]);

  const getAnalysisStyle = useCallback((dreamId: string) => {
    const result = analysisResults[dreamId];
    return result ? result.style : null;
  }, [analysisResults]);

  const clearAnalysis = useCallback((dreamId: string) => {
    setAnalysisResults(prev => {
      const updated = { ...prev };
      delete updated[dreamId];
      return updated;
    });
  }, []);

  const clearAllAnalyses = useCallback(() => {
    setAnalysisResults({});
  }, []);

  return {
    isAnalyzing,
    analyzeDream,
    getAnalysis,
    getAnalysisSource,
    getAnalysisStyle,
    clearAnalysis,
    clearAllAnalyses,
    analysisResults
  };
};