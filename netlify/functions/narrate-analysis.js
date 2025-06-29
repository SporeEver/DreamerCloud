const { createClient } = require('@supabase/supabase-js');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    // Check for ElevenLabs API key
    if (!process.env.ELEVENLABS_API_KEY) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'ElevenLabs API key not configured' }),
      };
    }

    // Parse request body
    const { text, voice = 'Rachel', model = 'eleven_multilingual_v2', userId } = JSON.parse(event.body);

    if (!text || !text.trim()) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Text is required for narration' }),
      };
    }

    // Check subscription status for voice narration (premium feature)
    if (userId) {
      const subscriptionCheck = await checkUserSubscription(userId);
      if (!subscriptionCheck.allowed) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: subscriptionCheck.message,
            requiresSubscription: true,
            feature: 'narration'
          }),
        };
      }
    }

    // Limit text length for better performance and cost control
    const maxLength = 2000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

    console.log('ElevenLabs: Starting text-to-speech generation');
    console.log('Text length:', truncatedText.length);
    console.log('Voice:', voice);
    console.log('Model:', model);

    // Call ElevenLabs Text-to-Speech API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${getVoiceId(voice)}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: truncatedText,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text().catch(() => '');
      console.error('ElevenLabs API error:', response.status, response.statusText, errorData);
      
      let errorMessage = 'Failed to generate audio narration';
      if (response.status === 401) {
        errorMessage = 'Invalid ElevenLabs API key';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (response.status === 422) {
        errorMessage = 'Text content is invalid or too long';
      }
      
      throw new Error(errorMessage);
    }

    // Get audio data as buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 for transmission
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    
    console.log('ElevenLabs: Audio generated successfully');
    console.log('Audio size:', audioBuffer.byteLength, 'bytes');

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        audioData: audioBase64,
        audioFormat: 'audio/mpeg',
        textLength: truncatedText.length,
        voice: voice,
        model: model
      }),
    };

  } catch (error) {
    console.error('Narration error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to generate audio narration. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Audio service not configured. Please contact support.';
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('invalid') || error.message.includes('422')) {
        errorMessage = 'Text content is too long or contains invalid characters.';
      }
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};

// Check user subscription status for voice narration (premium feature)
async function checkUserSubscription(userId) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // If Supabase is not configured, allow access for demo purposes
      return { allowed: true };
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

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
        message: 'Voice narration requires a premium subscription. Please upgrade to access AI voice features.'
      };
    }

    return { allowed: true };

  } catch (error) {
    console.error('Subscription check error:', error);
    // Allow access if subscription check fails (graceful degradation)
    return { allowed: true };
  }
}

// Map voice names to ElevenLabs voice IDs
function getVoiceId(voiceName) {
  const voiceMap = {
    'Rachel': '21m00Tcm4TlvDq8ikWAM',
    'Drew': '29vD33N1CtxCmqQRPOHJ',
    'Clyde': '2EiwWnXFnvU5JabPnv8n',
    'Paul': '5Q0t7uMcjvnagumLfvZi',
    'Domi': 'AZnzlk1XvdvUeBnXmlld',
    'Dave': 'CYw3kZ02Hs0563khs1Fj',
    'Fin': 'D38z5RcWu1voky8WS1ja',
    'Sarah': 'EXAVITQu4vr4xnSDxMaL',
    'Antoni': 'ErXwobaYiN019PkySvjV',
    'Thomas': 'GBv7mTt0atIp3Br8iCZE',
    'Charlie': 'IKne3meq5aSn9XLyUdCD',
    'George': 'JBFqnCBsd6RMkjVDRZzb',
    'Emily': 'LcfcDJNUP1GQjkzn1xUU',
    'Elli': 'MF3mGyEYCl7XYWbV9V6O',
    'Callum': 'N2lVS1w4EtoT3dr4eOWO',
    'Patrick': 'ODq5zmih8GrVes37Dizd',
    'Harry': 'SOYHLrjzK2X1ezoPC6cr',
    'Liam': 'TX3LPaxmHKxFdv7VOQHJ',
    'Dorothy': 'ThT5KcBeYPX3keUQqHPh',
    'Josh': 'TxGEqnHWrfWFTfGW9XjX',
    'Arnold': 'VR6AewLTigWG4xSOukaG',
    'Adam': 'pNInz6obpgDQGcFmaJgB',
    'Sam': 'yoZ06aMxZJJ28mfd3POQ'
  };
  
  return voiceMap[voiceName] || voiceMap['Rachel']; // Default to Rachel
}