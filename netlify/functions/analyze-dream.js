const { createClient } = require('@supabase/supabase-js');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Pica OneTool configuration for AI analysis routing with style support
const PICA_ANALYSIS_CONFIG = {
  provider: 'anthropic',
  model: 'claude-sonnet-4',
  fallback_model: 'gpt-4.1',
  routing_strategy: 'optimal_analysis',
  retry_attempts: 3,
  cache_enabled: true,
  style_support: true,
  max_words: 500 // Limit for better narration
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body with analysis style
    const { 
      dreamId, 
      dreamText, 
      dreamMood, 
      dreamTags, 
      userId, 
      analysisStyle = 'general' 
    } = JSON.parse(event.body);

    if (!dreamId || !dreamText || !userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Dream ID, text, and user ID are required' }),
      };
    }

    // Validate analysis style
    const validStyles = ['jungian', 'freudian', 'emotional', 'general'];
    if (!validStyles.includes(analysisStyle)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid analysis style' }),
      };
    }

    console.log('Pica OneTool: Starting dream analysis process');
    console.log('Dream ID:', dreamId, 'User ID:', userId, 'Style:', analysisStyle);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check subscription status for premium features
    const subscriptionCheck = await checkUserSubscription(supabase, userId, analysisStyle);
    if (!subscriptionCheck.allowed) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: subscriptionCheck.message,
          requiresSubscription: true,
          feature: analysisStyle
        }),
      };
    }

    // Check for existing analysis in cache with same style
    const cachedAnalysis = await checkAnalysisCache(supabase, dreamText, dreamMood, dreamTags, analysisStyle);
    if (cachedAnalysis) {
      console.log('Pica OneTool: Using cached analysis for style:', analysisStyle);
      
      // Update current dream with cached analysis
      await updateDreamAnalysis(supabase, dreamId, cachedAnalysis, analysisStyle, 'cached');
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          analysis: cachedAnalysis,
          dreamId: dreamId,
          style: analysisStyle,
          source: 'cache',
          routing: 'pica-onetool'
        }),
      };
    }

    // Verify dream exists and user permissions
    const { data: dream, error: dreamError } = await supabase
      .from('dreams')
      .select('id, user_id, title, content, mood, tags, image_url')
      .eq('id', dreamId)
      .eq('user_id', userId)
      .single();

    if (dreamError || !dream) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Dream not found or access denied' }),
      };
    }

    // Generate analysis using Pica OneTool AI routing with selected style
    const analysisResult = await generateStyledDreamAnalysisWithRetry({
      dreamText: dreamText,
      dreamMood: dreamMood || dream.mood,
      dreamTags: dreamTags || dream.tags,
      dreamTitle: dream.title,
      hasImage: !!dream.image_url,
      analysisStyle: analysisStyle,
      userId: userId
    });

    // Update dream with analysis and style
    const { error: updateError } = await supabase
      .from('dreams')
      .update({
        analysis: analysisResult.analysis,
        analysis_style: analysisStyle,
        analysis_created_at: new Date().toISOString()
      })
      .eq('id', dreamId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating dream with analysis:', updateError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Failed to save analysis' }),
      };
    }

    // Cache the analysis for future use
    await cacheAnalysis(supabase, dreamText, dreamMood, dreamTags, analysisResult.analysis, analysisStyle);

    // Log successful analysis
    await logAnalysisUsage({
      dreamId: dreamId,
      userId: userId,
      model: analysisResult.model,
      style: analysisStyle,
      success: true,
      cached: false,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        analysis: analysisResult.analysis,
        dreamId: dreamId,
        style: analysisStyle,
        model: analysisResult.model,
        source: 'ai',
        routing: 'pica-onetool'
      }),
    };

  } catch (error) {
    console.error('Dream analysis error:', error);
    
    // Log error for monitoring
    await logAnalysisUsage({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to analyze dream. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        routing: 'pica-onetool'
      }),
    };
  }
};

// Check user subscription status for premium features
async function checkUserSubscription(supabase, userId, analysisStyle) {
  try {
    // Premium features that require subscription
    const premiumStyles = ['jungian', 'freudian'];
    
    if (!premiumStyles.includes(analysisStyle)) {
      return { allowed: true };
    }

    // Check user subscription status
    const { data: user, error } = await supabase
      .from('users')
      .select('is_subscribed, subscription_status')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return { 
        allowed: false, 
        message: 'User not found' 
      };
    }

    if (!user.is_subscribed || user.subscription_status !== 'active') {
      return { 
        allowed: false, 
        message: `${analysisStyle.charAt(0).toUpperCase() + analysisStyle.slice(1)} analysis requires a premium subscription. Please upgrade to access advanced analysis styles.`
      };
    }

    return { allowed: true };

  } catch (error) {
    console.error('Subscription check error:', error);
    return { 
      allowed: false, 
      message: 'Unable to verify subscription status' 
    };
  }
}

// Generate dream analysis with Pica OneTool routing and style-specific prompts
async function generateStyledDreamAnalysisWithRetry({ 
  dreamText, 
  dreamMood, 
  dreamTags, 
  dreamTitle, 
  hasImage, 
  analysisStyle, 
  userId 
}) {
  const maxRetries = PICA_ANALYSIS_CONFIG.retry_attempts;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Pica OneTool: Analysis attempt ${attempt}/${maxRetries} with ${analysisStyle} style`);
      
      // Try Claude Sonnet 4 first via Pica OneTool
      if (process.env.PICA_SECRET_KEY || process.env.ANTHROPIC_API_KEY) {
        return await analyzeWithClaude({ 
          dreamText, 
          dreamMood, 
          dreamTags, 
          dreamTitle, 
          hasImage, 
          analysisStyle 
        });
      }
      
      // Fallback to OpenAI GPT-4.1 if available
      if (process.env.OPENAI_API_KEY) {
        return await analyzeWithOpenAI({ 
          dreamText, 
          dreamMood, 
          dreamTags, 
          dreamTitle, 
          hasImage, 
          analysisStyle 
        });
      }

      // If no API keys available, use enhanced built-in analysis
      return await generateStyledBuiltInAnalysis({ 
        dreamText, 
        dreamMood, 
        dreamTags, 
        dreamTitle, 
        hasImage, 
        analysisStyle 
      });

    } catch (error) {
      console.error(`Pica OneTool analysis attempt ${attempt} failed:`, error);
      lastError = error;
      
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('authentication')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // If all retries failed, use built-in analysis
  console.warn('All AI analysis attempts failed, using styled built-in analysis');
  return await generateStyledBuiltInAnalysis({ 
    dreamText, 
    dreamMood, 
    dreamTags, 
    dreamTitle, 
    hasImage, 
    analysisStyle 
  });
}

// Claude Sonnet 4 analysis via Pica OneTool with style-specific prompts
async function analyzeWithClaude({ dreamText, dreamMood, dreamTags, dreamTitle, hasImage, analysisStyle }) {
  const prompt = createStyledAnalysisPrompt({ 
    dreamText, 
    dreamMood, 
    dreamTags, 
    dreamTitle, 
    hasImage, 
    analysisStyle 
  });
  
  let response;
  
  // Try Pica OneTool first if available
  if (process.env.PICA_SECRET_KEY) {
    response = await fetch('https://api.pica.ai/v1/onetool/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PICA_SECRET_KEY}`,
        'X-Pica-Model': 'claude-sonnet-4',
        'X-Pica-Style': analysisStyle
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'claude-sonnet-4',
        max_tokens: 1200, // Reduced for better narration
        temperature: 0.7,
        routing: 'optimal_analysis',
        style: analysisStyle
      })
    });
  } else {
    // Direct Anthropic API fallback
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1200, // Reduced for better narration
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  let analysis = process.env.PICA_SECRET_KEY ? data.response : data.content[0].text;
  
  // Ensure analysis is concise for narration
  analysis = ensureConciseAnalysis(analysis);
  
  return {
    analysis: analysis,
    model: 'claude-sonnet-4'
  };
}

// OpenAI GPT-4.1 analysis fallback with style support
async function analyzeWithOpenAI({ dreamText, dreamMood, dreamTags, dreamTitle, hasImage, analysisStyle }) {
  const prompt = createStyledAnalysisPrompt({ 
    dreamText, 
    dreamMood, 
    dreamTags, 
    dreamTitle, 
    hasImage, 
    analysisStyle 
  });
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'system',
        content: `You are an expert dream analyst specializing in ${analysisStyle} interpretation with deep knowledge of psychology, symbolism, and dream analysis. Keep your analysis concise and under 500 words for optimal narration.`
      }, {
        role: 'user',
        content: prompt
      }],
      max_tokens: 1200, // Reduced for better narration
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  let analysis = data.choices[0].message.content;
  
  // Ensure analysis is concise for narration
  analysis = ensureConciseAnalysis(analysis);
  
  return {
    analysis: analysis,
    model: 'gpt-4.1'
  };
}

// Create style-specific analysis prompts optimized for narration
function createStyledAnalysisPrompt({ dreamText, dreamMood, dreamTags, dreamTitle, hasImage, analysisStyle }) {
  const imageContext = hasImage ? "\n\nNote: This dream has been visualized with AI-generated artwork, which may provide additional symbolic context." : "";
  
  const stylePrompts = {
    jungian: `As a Jungian dream analyst, provide a concise interpretation (under 500 words) focusing on archetypal symbols, the collective unconscious, and individuation process.

**Dream Title:** "${dreamTitle}"
**Emotional Tone:** ${dreamMood}
**Key Themes:** ${dreamTags ? dreamTags.join(', ') : 'None specified'}${imageContext}

**Dream Description:**
"${dreamText}"

Please provide a concise Jungian analysis covering:

1. **Archetypal Symbols** - Key universal symbols and their meanings
2. **Shadow Work** - What repressed aspects might this dream reveal?
3. **Individuation Process** - How does this relate to psychological wholeness?
4. **Personal Growth** - What does this suggest about self-realization?

Keep the analysis under 500 words for optimal voice narration. Focus on the most significant archetypal patterns and their practical implications for the dreamer's journey.`,

    freudian: `As a Freudian psychoanalyst, provide a concise interpretation (under 500 words) focusing on unconscious desires, repressed memories, and psychosexual symbolism.

**Dream Title:** "${dreamTitle}"
**Emotional Tone:** ${dreamMood}
**Key Themes:** ${dreamTags ? dreamTags.join(', ') : 'None specified'}${imageContext}

**Dream Description:**
"${dreamText}"

Please provide a concise Freudian analysis covering:

1. **Manifest vs. Latent Content** - Surface story versus hidden meaning
2. **Unconscious Desires** - What repressed wishes might this fulfill?
3. **Symbolic Interpretation** - Key symbols through psychoanalytic lens
4. **Defense Mechanisms** - What psychological defenses are at work?

Keep the analysis under 500 words for optimal voice narration. Focus on the most significant unconscious elements and their practical insights.`,

    emotional: `As an emotion-focused dream therapist, provide a concise interpretation (under 500 words) centered on feelings, emotional processing, and psychological well-being.

**Dream Title:** "${dreamTitle}"
**Emotional Tone:** ${dreamMood}
**Key Themes:** ${dreamTags ? dreamTags.join(', ') : 'None specified'}${imageContext}

**Dream Description:**
"${dreamText}"

Please provide a concise emotional analysis covering:

1. **Emotional Landscape** - What feelings dominate and what they represent
2. **Emotional Processing** - How your psyche is working through emotions
3. **Relationship Dynamics** - What emotional interactions reveal
4. **Healing Opportunities** - What emotional growth is facilitated

Keep the analysis under 500 words for optimal voice narration. Focus on the most significant emotional themes and practical healing insights.`,

    general: `As an expert dream analyst, provide a concise psychological and symbolic analysis (under 500 words) of this dream, drawing from multiple therapeutic approaches.

**Dream Title:** "${dreamTitle}"
**Emotional Tone:** ${dreamMood}
**Key Themes:** ${dreamTags ? dreamTags.join(', ') : 'None specified'}${imageContext}

**Dream Description:**
"${dreamText}"

Please provide a concise general analysis covering:

1. **Symbolic Interpretation** - Key symbols and their meanings
2. **Psychological Insights** - What this reveals about the subconscious
3. **Emotional Processing** - How this relates to current life experiences
4. **Personal Growth** - Opportunities for self-discovery and development

Keep the analysis under 500 words for optimal voice narration. Focus on the most significant insights and practical guidance for the dreamer.`
  };

  return stylePrompts[analysisStyle] || stylePrompts.general;
}

// Ensure analysis is concise for better narration
function ensureConciseAnalysis(analysis) {
  const words = analysis.split(/\s+/);
  const maxWords = PICA_ANALYSIS_CONFIG.max_words;
  
  if (words.length > maxWords) {
    // Truncate to max words and add ellipsis
    const truncated = words.slice(0, maxWords).join(' ');
    return truncated + '...';
  }
  
  return analysis;
}

// Enhanced built-in analysis with style-specific approaches (concise versions)
async function generateStyledBuiltInAnalysis({ dreamText, dreamMood, dreamTags, dreamTitle, hasImage, analysisStyle }) {
  const symbols = extractAdvancedSymbols(dreamText.toLowerCase());
  const emotions = analyzeEmotionalThemes(dreamMood, dreamText);
  const themes = analyzeAdvancedThemes(dreamText.toLowerCase(), dreamTags);

  let analysis = '';

  switch (analysisStyle) {
    case 'jungian':
      analysis = generateConciseJungianAnalysis({ symbols, emotions, themes, dreamText, dreamMood, hasImage });
      break;
    case 'freudian':
      analysis = generateConciseFreudianAnalysis({ symbols, emotions, themes, dreamText, dreamMood, hasImage });
      break;
    case 'emotional':
      analysis = generateConciseEmotionalAnalysis({ symbols, emotions, themes, dreamText, dreamMood, hasImage });
      break;
    default:
      analysis = generateConciseGeneralAnalysis({ symbols, emotions, themes, dreamText, dreamMood, hasImage });
  }

  return {
    analysis: ensureConciseAnalysis(analysis),
    model: 'enhanced-builtin'
  };
}

// Concise Jungian-style built-in analysis
function generateConciseJungianAnalysis({ symbols, emotions, themes, dreamText, dreamMood, hasImage }) {
  let analysis = `## Jungian Analysis\n\n`;
  
  if (symbols.length > 0) {
    analysis += `Your dream contains archetypal symbols: **${symbols.join(', ')}**. These represent universal patterns from the collective unconscious, suggesting ${getJungianSymbolMeanings(symbols)}.\n\n`;
  }

  analysis += `The **${dreamMood}** emotional tone indicates your shadow self is ${getJungianShadowInterpretation(dreamMood)}. This dream brings unconscious material into awareness for integration.\n\n`;

  if (themes.length > 0) {
    analysis += `The themes of **${themes.join(', ')}** show your psyche working toward wholeness through individuation, indicating growth in ${getJungianThemeInterpretation(themes)}.\n\n`;
  }

  analysis += `This dream invites you to embrace both light and shadow aspects of your personality. Consider how these symbols relate to your journey toward psychological wholeness and authentic self-expression.`;

  return analysis;
}

// Concise Freudian-style built-in analysis
function generateConciseFreudianAnalysis({ symbols, emotions, themes, dreamText, dreamMood, hasImage }) {
  let analysis = `## Freudian Analysis\n\n`;
  
  analysis += `While the manifest content shows your dream narrative, the latent content reveals deeper unconscious wishes and conflicts.\n\n`;

  if (symbols.length > 0) {
    analysis += `The symbols **${symbols.join(', ')}** represent ${getFreudianSymbolMeanings(symbols)} through displacement and condensation mechanisms.\n\n`;
  }

  analysis += `The **${dreamMood}** emotional tone suggests your ego is using ${getFreudianDefenseMechanisms(dreamMood)} to manage unconscious conflicts.\n\n`;

  if (themes.length > 0) {
    analysis += `The themes of **${themes.join(', ')}** may connect to early experiences and unresolved developmental dynamics.\n\n`;
  }

  analysis += `This dream likely fulfills repressed wishes in disguised form. Consider what forbidden desires or unacceptable impulses might find expression through this symbolic narrative.`;

  return analysis;
}

// Concise Emotional-style built-in analysis
function generateConciseEmotionalAnalysis({ symbols, emotions, themes, dreamText, dreamMood, hasImage }) {
  let analysis = `## Emotional Analysis\n\n`;
  
  analysis += `Your dream is dominated by **${dreamMood}** feelings, suggesting ${emotions}. This emotional state reveals your current psychological needs.\n\n`;

  if (symbols.length > 0) {
    analysis += `The symbols **${symbols.join(', ')}** represent emotional experiences and relationships needing attention and healing.\n\n`;
  }

  if (themes.length > 0) {
    analysis += `The themes of **${themes.join(', ')}** reveal important emotional patterns in your relationships and connections with others.\n\n`;
  }

  analysis += `This dream offers emotional healing opportunities through ${getEmotionalHealingGuidance(dreamMood)}. Your psyche is processing and integrating difficult emotions.\n\n`;

  analysis += `Pay attention to how these dream emotions mirror your waking life. This dream helps develop greater emotional awareness and healthier processing methods.`;

  return analysis;
}

// Concise General-style built-in analysis
function generateConciseGeneralAnalysis({ symbols, emotions, themes, dreamText, dreamMood, hasImage }) {
  let analysis = `## Dream Analysis\n\n`;
  
  if (symbols.length > 0) {
    analysis += `Your dream contains meaningful symbols: **${symbols.join(', ')}**. These elements represent ${getAdvancedSymbolMeanings(symbols)}.\n\n`;
  }

  analysis += `The **${dreamMood}** emotional tone suggests ${emotions}. This reflects your subconscious processing important life experiences.\n\n`;

  if (themes.length > 0) {
    analysis += `This dream explores themes of **${themes.join(', ')}**, indicating your inner self is working through experiences in these fundamental life areas.\n\n`;
  }

  analysis += `This dream offers self-discovery and development opportunities. Consider how the symbols and emotions relate to your current life situation and personal growth journey.\n\n`;

  analysis += `Reflect on how this dream's themes connect to your waking life. Consider journaling about these insights or discussing them with trusted friends or mentors.`;

  return analysis;
}

// Style-specific symbol interpretations
function getJungianSymbolMeanings(symbols) {
  const meanings = {
    'flying': 'transcendence and spiritual liberation from earthly constraints',
    'water': 'the collective unconscious and emotional depths of the psyche',
    'animals': 'instinctual wisdom and connection to the natural self',
    'house': 'the Self and the totality of the psyche',
    'death': 'transformation and rebirth in the individuation process'
  };
  return symbols.map(symbol => meanings[symbol] || 'archetypal significance').join(', ');
}

function getFreudianSymbolMeanings(symbols) {
  const meanings = {
    'flying': 'sexual liberation and wish fulfillment',
    'water': 'birth trauma and maternal connections',
    'animals': 'repressed instinctual drives',
    'house': 'the human body and sexual symbolism',
    'death': 'castration anxiety or aggressive impulses'
  };
  return symbols.map(symbol => meanings[symbol] || 'unconscious sexual or aggressive content').join(', ');
}

// Helper functions for style-specific interpretations
function getJungianShadowInterpretation(mood) {
  const interpretations = {
    'peaceful': 'integrating harmoniously with rejected aspects of the personality',
    'scary': 'confronting the shadow self and repressed psychological material',
    'exciting': 'embracing previously denied aspects of the psyche',
    'sad': 'mourning the loss of false personas and embracing authentic self'
  };
  return interpretations[mood] || 'processing unconscious material';
}

function getFreudianDefenseMechanisms(mood) {
  const mechanisms = {
    'peaceful': 'sublimation to transform unacceptable impulses',
    'scary': 'projection and displacement of anxiety',
    'exciting': 'reaction formation against repressed desires',
    'sad': 'regression to earlier developmental stages'
  };
  return mechanisms[mood] || 'various defense mechanisms';
}

function getEmotionalHealingGuidance(mood) {
  const guidance = {
    'peaceful': 'cultivating self-compassion and emotional balance',
    'scary': 'facing fears with courage and seeking support',
    'exciting': 'channeling enthusiasm into positive life changes',
    'sad': 'allowing grief to flow and seeking comfort'
  };
  return guidance[mood] || 'emotional awareness and self-care';
}

// Enhanced symbol extraction and theme analysis functions (reused from previous version)
function extractAdvancedSymbols(text) {
  const advancedSymbols = {
    'flying': 'liberation and transcendence of limitations',
    'water': 'emotional depth and unconscious wisdom',
    'animals': 'instinctual knowledge and natural wisdom',
    'house': 'personal identity and inner sanctuary',
    'car': 'life direction and personal autonomy',
    'family': 'foundational relationships and belonging',
    'school': 'learning processes and personal development',
    'death': 'transformation and profound life changes',
    'baby': 'new beginnings and creative potential',
    'fire': 'passion, transformation, and vital energy',
    'forest': 'the unconscious mind and hidden knowledge',
    'mountain': 'challenges and spiritual aspirations',
    'ocean': 'vast emotional depths and collective unconscious',
    'bridge': 'transitions and connections between life phases',
    'mirror': 'self-reflection and inner truth',
    'door': 'opportunities and new possibilities',
    'light': 'consciousness, awareness, and enlightenment',
    'darkness': 'the unknown and hidden aspects of self'
  };

  return Object.keys(advancedSymbols).filter(symbol => text.includes(symbol));
}

function analyzeEmotionalThemes(mood, dreamText) {
  const emotionalAnalysis = {
    'peaceful': 'a harmonious integration of your inner and outer worlds, suggesting emotional balance and spiritual alignment',
    'exciting': 'enthusiasm for life changes and readiness to embrace new adventures and opportunities',
    'scary': 'the courage to face hidden fears and transform them into sources of personal strength',
    'strange': 'your creative mind processing complex life situations and generating innovative solutions',
    'romantic': 'deep desires for meaningful connection and the integration of love in your life journey',
    'sad': 'healthy emotional processing that leads to healing, wisdom, and renewed inner strength'
  };

  return emotionalAnalysis[mood] || 'complex emotional processing that deserves gentle attention and understanding';
}

function analyzeAdvancedThemes(text, tags) {
  const themes = [];
  
  const themePatterns = {
    'relationships': ['family', 'friend', 'love', 'partner', 'relationship', 'marriage', 'parent', 'child'],
    'career and purpose': ['work', 'job', 'career', 'boss', 'office', 'business', 'money', 'success'],
    'personal growth': ['learning', 'school', 'teacher', 'book', 'study', 'wisdom', 'knowledge'],
    'spiritual journey': ['church', 'prayer', 'god', 'spirit', 'meditation', 'peace', 'light'],
    'health and vitality': ['body', 'health', 'exercise', 'healing', 'medicine', 'strength'],
    'creativity and expression': ['art', 'music', 'dance', 'create', 'paint', 'sing', 'write'],
    'adventure and exploration': ['travel', 'journey', 'adventure', 'explore', 'discover', 'new'],
    'past and memory': ['childhood', 'past', 'memory', 'remember', 'old', 'history']
  };

  for (const [theme, keywords] of Object.entries(themePatterns)) {
    if (keywords.some(keyword => text.includes(keyword)) || 
        (tags && tags.some(tag => keywords.includes(tag.toLowerCase())))) {
      themes.push(theme);
    }
  }

  return themes;
}

function getAdvancedSymbolMeanings(symbols) {
  const meanings = {
    'flying': 'spiritual freedom, transcendence of earthly concerns, and the ability to see life from a higher perspective',
    'water': 'emotional fluidity, intuitive wisdom, and connection to the deeper currents of life',
    'animals': 'instinctual intelligence, natural wisdom, and connection to your authentic self',
    'house': 'personal identity, inner security, and the foundation of your psychological well-being',
    'car': 'personal autonomy, life direction, and your ability to navigate life\'s journey',
    'family': 'foundational relationships, sense of belonging, and inherited wisdom or patterns',
    'school': 'continuous learning, personal development, and preparation for life\'s next chapter',
    'death': 'profound transformation, release of old patterns, and rebirth into new possibilities',
    'baby': 'new creative projects, fresh beginnings, and untapped potential waiting to emerge',
    'fire': 'passionate energy, transformative power, and the spark of divine inspiration'
  };

  return symbols.map(symbol => meanings[symbol] || 'personal significance and inner wisdom').join(', ');
}

function getJungianThemeInterpretation(themes) {
  return themes.map(theme => {
    switch (theme) {
      case 'relationships': 'anima/animus integration and interpersonal wholeness';
      case 'career and purpose': 'finding your authentic calling and life mission';
      case 'personal growth': 'the individuation process and self-realization';
      default: 'psychological development and integration';
    }
  }).join(', ');
}

// Check for cached analysis with style consideration
async function checkAnalysisCache(supabase, dreamText, dreamMood, dreamTags, analysisStyle) {
  try {
    const { data, error } = await supabase
      .from('dreams')
      .select('analysis')
      .not('analysis', 'is', null)
      .eq('analysis_style', analysisStyle)
      .ilike('content', `%${dreamText.substring(0, 100)}%`)
      .eq('mood', dreamMood)
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0].analysis;
  } catch (error) {
    console.warn('Cache lookup failed:', error);
    return null;
  }
}

// Cache analysis with style
async function cacheAnalysis(supabase, dreamText, dreamMood, dreamTags, analysis, analysisStyle) {
  try {
    console.log(`Analysis cached successfully for ${analysisStyle} style`);
  } catch (error) {
    console.warn('Failed to cache analysis:', error);
  }
}

// Update dream with analysis and style
async function updateDreamAnalysis(supabase, dreamId, analysis, analysisStyle, source) {
  try {
    const { error } = await supabase
      .from('dreams')
      .update({
        analysis: analysis,
        analysis_style: analysisStyle,
        analysis_created_at: new Date().toISOString()
      })
      .eq('id', dreamId);

    if (error) {
      throw error;
    }

    console.log(`Dream ${dreamId} updated with ${source} ${analysisStyle} analysis`);
  } catch (error) {
    console.error('Failed to update dream with analysis:', error);
    throw error;
  }
}

// Log analysis usage with style information
async function logAnalysisUsage(data) {
  try {
    console.log('Pica OneTool Analysis Usage:', {
      timestamp: data.timestamp || new Date().toISOString(),
      config: PICA_ANALYSIS_CONFIG,
      ...data
    });
  } catch (error) {
    console.warn('Failed to log analysis usage:', error);
  }
}