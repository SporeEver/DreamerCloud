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
    // Parse request body
    const { dreamId, userId, expiresInDays } = JSON.parse(event.body);

    if (!dreamId || !userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Dream ID and user ID are required' }),
      };
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify dream exists and user owns it
    const { data: dream, error: dreamError } = await supabase
      .from('dreams')
      .select('id, user_id, title, content, mood, tags, image_url, analysis, analysis_style, created_at')
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

    // Check if share already exists
    const { data: existingShare } = await supabase
      .from('shared_dreams')
      .select('share_token')
      .eq('dream_id', dreamId)
      .single();

    if (existingShare) {
      // Return existing share token
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          shareToken: existingShare.share_token,
          shareUrl: `${getBaseUrl(event)}/shared/${existingShare.share_token}`,
          existing: true
        }),
      };
    }

    // Calculate expiration date if specified
    let expiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
    }

    // Create new share
    const { data: shareData, error: shareError } = await supabase
      .from('shared_dreams')
      .insert({
        dream_id: dreamId,
        expires_at: expiresAt
      })
      .select('share_token')
      .single();

    if (shareError) {
      console.error('Error creating share:', shareError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Failed to create share' }),
      };
    }

    const shareUrl = `${getBaseUrl(event)}/shared/${shareData.share_token}`;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        shareToken: shareData.share_token,
        shareUrl: shareUrl,
        expiresAt: expiresAt,
        existing: false
      }),
    };

  } catch (error) {
    console.error('Share creation error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to create share',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};

function getBaseUrl(event) {
  const headers = event.headers;
  const protocol = headers['x-forwarded-proto'] || 'https';
  const host = headers.host || headers['x-forwarded-host'];
  return `${protocol}://${host}`;
}