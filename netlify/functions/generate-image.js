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
    const { prompt, dreamText, mood } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Use SDXL model for high-quality image generation
    const model = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
    
    console.log('Generating image with prompt:', prompt);

    // Generate image
    const output = await replicate.run(model, {
      input: {
        prompt: prompt,
        negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature",
        width: 1024,
        height: 1024,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000)
      }
    });

    // Extract image URL from output
    let imageUrl;
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    console.log('Image generated successfully:', imageUrl);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        prompt: prompt
      }),
    };

  } catch (error) {
    console.error('Image generation error:', error);
    
    // Handle specific Replicate errors
    let errorMessage = 'Failed to generate image';
    if (error.message.includes('authentication')) {
      errorMessage = 'Invalid Replicate API token';
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Image generation timed out. Please try again.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
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