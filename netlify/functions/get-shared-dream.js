const { createClient } = require('@supabase/supabase-js');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract share token from query parameters
    const shareToken = event.queryStringParameters?.token;

    if (!shareToken) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Share token is required' }),
      };
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get shared dream data
    const { data: shareData, error: shareError } = await supabase
      .from('shared_dreams')
      .select(`
        id,
        dream_id,
        share_token,
        created_at,
        expires_at,
        view_count,
        dreams (
          id,
          username,
          title,
          content,
          mood,
          tags,
          image_url,
          generated_image,
          image_prompt,
          analysis,
          analysis_style,
          created_at
        )
      `)
      .eq('share_token', shareToken)
      .single();

    if (shareError || !shareData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Shared dream not found' }),
      };
    }

    // Check if share has expired
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return {
        statusCode: 410,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Shared dream has expired' }),
      };
    }

    // Increment view count
    await supabase
      .from('shared_dreams')
      .update({ view_count: shareData.view_count + 1 })
      .eq('share_token', shareToken);

    // Return dream data
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        dream: shareData.dreams,
        shareInfo: {
          shareToken: shareData.share_token,
          createdAt: shareData.created_at,
          expiresAt: shareData.expires_at,
          viewCount: shareData.view_count + 1
        }
      }),
    };

  } catch (error) {
    console.error('Get shared dream error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to retrieve shared dream',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};