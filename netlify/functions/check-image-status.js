const Replicate = require('replicate');

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
    // Check for Replicate API token
    if (!process.env.REPLICATE_API_TOKEN) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Replicate API token not configured' }),
      };
    }

    // Parse request body
    const { predictionId } = JSON.parse(event.body);

    if (!predictionId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Prediction ID is required' }),
      };
    }

    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Get prediction status
    const prediction = await replicate.predictions.get(predictionId);

    let response = {
      status: prediction.status,
      predictionId: predictionId
    };

    if (prediction.status === 'succeeded') {
      // Extract image URL from output
      let imageUrl;
      if (Array.isArray(prediction.output) && prediction.output.length > 0) {
        imageUrl = prediction.output[0];
      } else if (typeof prediction.output === 'string') {
        imageUrl = prediction.output;
      }

      response.imageUrl = imageUrl;
    } else if (prediction.status === 'failed') {
      response.error = prediction.error || 'Image generation failed';
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Status check error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to check image status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};