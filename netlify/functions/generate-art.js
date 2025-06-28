const Replicate = require('replicate');
const { createClient } = require('@supabase/supabase-js');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Pica OneTool configuration for optimal routing with custom parameters
const PICA_ONETOOL_CONFIG = {
  provider: 'replicate',
  model: 'flux.1',
  routing_strategy: 'optimal_quality',
  fallback_enabled: true,
  retry_attempts: 3,
  custom_parameters: {
    aspect_ratio: '16:9',
    output_format: 'png',
    high_quality: true
  }
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
    // Validate environment variables
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('Missing REPLICATE_API_TOKEN environment variable');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Replicate API token not configured' }),
      };
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Supabase configuration missing' }),
      };
    }

    // Parse request body with custom parameters
    const { 
      prompt, 
      dreamText, 
      mood, 
      style = 'realistic',
      aspectRatio = '16:9',
      outputFormat = 'png',
      highQuality = true,
      dreamId, 
      userId 
    } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    console.log('Pica OneTool: Starting custom art generation process');
    console.log('Parameters:', { style, aspectRatio, outputFormat, highQuality });
    console.log('Dream ID:', dreamId);
    console.log('User ID:', userId);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Generate image with custom parameters and retry logic
    const result = await generateImageWithCustomParams({
      prompt,
      dreamText,
      mood,
      style,
      aspectRatio,
      outputFormat,
      highQuality,
      dreamId,
      userId,
      supabase
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Pica OneTool routing error:', error);
    
    // Log error for monitoring
    await logPicaOneToolUsage({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    // Handle specific error types
    let errorMessage = 'Failed to generate art. Please try again.';
    let statusCode = 500;

    if (error.message.includes('authentication') || error.message.includes('401')) {
      errorMessage = 'Invalid Replicate API token';
      statusCode = 401;
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Image generation timed out. Please try again.';
      statusCode = 408;
    } else if (error.message.includes('quota') || error.message.includes('billing')) {
      errorMessage = 'Service temporarily unavailable. Please try again later.';
      statusCode = 503;
    }

    return {
      statusCode: statusCode,
      headers: corsHeaders,
      body: JSON.stringify({
        error: errorMessage,
        routing: 'pica-onetool',
        model: 'flux.1',
        retryable: statusCode >= 500 || statusCode === 429,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};

// Enhanced image generation with custom parameters and retry logic
async function generateImageWithCustomParams({ 
  prompt, 
  dreamText, 
  mood, 
  style, 
  aspectRatio, 
  outputFormat, 
  highQuality, 
  dreamId, 
  userId, 
  supabase 
}) {
  const maxRetries = PICA_ONETOOL_CONFIG.retry_attempts;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Pica OneTool: Attempt ${attempt}/${maxRetries}`);
      
      // Initialize Replicate with timeout
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      // Pica OneTool: Route to optimal model with custom parameters
      const modelResult = await routeToOptimalModelWithParams(
        replicate, 
        prompt, 
        mood, 
        style, 
        aspectRatio, 
        outputFormat, 
        highQuality
      );
      
      if (!modelResult.imageUrl) {
        throw new Error('No image URL returned from model');
      }

      console.log('Pica OneTool: Custom image generated successfully');

      // Save image to Supabase storage if dreamId and userId provided
      let storedImageUrl = modelResult.imageUrl;
      if (dreamId && userId && supabase) {
        try {
          storedImageUrl = await saveImageToSupabase(supabase, modelResult.imageUrl, dreamId, userId);
          
          // Update dream record with image URL
          await updateDreamWithImage(supabase, dreamId, storedImageUrl, modelResult.prompt);
          
          console.log('Custom image saved to Supabase storage:', storedImageUrl);
        } catch (storageError) {
          console.warn('Failed to save to Supabase, using original URL:', storageError);
          // Continue with original URL if storage fails
        }
      }

      // Log successful generation with custom parameters
      await logPicaOneToolUsage({
        model: modelResult.model,
        prompt_length: prompt.length,
        mood: mood,
        style: style,
        aspect_ratio: aspectRatio,
        output_format: outputFormat,
        high_quality: highQuality,
        success: true,
        attempt: attempt,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        imageUrl: storedImageUrl,
        prompt: modelResult.prompt,
        model: modelResult.model,
        routing: 'pica-onetool',
        provider: 'replicate',
        attempt: attempt,
        parameters: {
          style,
          aspectRatio,
          outputFormat,
          highQuality
        }
      };

    } catch (error) {
      console.error(`Pica OneTool attempt ${attempt} failed:`, error);
      lastError = error;
      
      // Don't retry on authentication or validation errors
      if (error.message.includes('authentication') || 
          error.message.includes('401') || 
          error.message.includes('invalid')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        // Exponential backoff: wait 2^attempt seconds
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  throw lastError || new Error('All retry attempts failed');
}

// Pica OneTool: Route to optimal model with custom parameters
async function routeToOptimalModelWithParams(
  replicate, 
  prompt, 
  mood, 
  style, 
  aspectRatio, 
  outputFormat, 
  highQuality
) {
  // Pica OneTool routing logic with custom parameters
  const models = [
    {
      name: 'flux.1',
      id: 'black-forest-labs/flux-schnell',
      config: {
        prompt: optimizePromptForFlux(prompt, mood, style, highQuality),
        num_outputs: 1,
        aspect_ratio: aspectRatio,
        output_format: outputFormat.toLowerCase(),
        output_quality: highQuality ? 95 : 80,
        seed: Math.floor(Math.random() * 1000000)
      }
    },
    {
      name: 'stable-diffusion-xl',
      id: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      config: {
        prompt: optimizePromptForSDXL(prompt, mood, style, highQuality),
        negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature, low resolution",
        width: getWidthFromAspectRatio(aspectRatio),
        height: getHeightFromAspectRatio(aspectRatio),
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: highQuality ? 50 : 30,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000)
      }
    }
  ];

  for (const model of models) {
    try {
      console.log(`Pica OneTool: Trying ${model.name} with custom parameters`);
      
      const output = await Promise.race([
        replicate.run(model.id, { input: model.config }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Model timeout')), 90000) // Increased timeout for high quality
        )
      ]);

      // Extract image URL from output
      let imageUrl;
      if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0];
      } else if (typeof output === 'string') {
        imageUrl = output;
      } else {
        throw new Error('Unexpected output format');
      }

      return {
        imageUrl,
        prompt: model.config.prompt,
        model: model.name
      };

    } catch (error) {
      console.warn(`Pica OneTool: ${model.name} failed:`, error.message);
      if (model === models[models.length - 1]) {
        throw error; // Last model failed, propagate error
      }
    }
  }
}

// FLUX.1 specific prompt optimization with custom style parameters
function optimizePromptForFlux(originalPrompt, mood, style, highQuality) {
  const styleOptimizations = {
    realistic: 'photorealistic, detailed, lifelike, professional photography, sharp focus',
    surreal: 'surreal, dreamlike, impossible, fantastical, otherworldly, abstract',
    cartoon: 'cartoon style, animated, colorful, stylized, illustration, digital art',
    artistic: 'artistic, painterly, expressive, creative, fine art, masterpiece',
    vintage: 'vintage, retro, nostalgic, classic, aged, timeless aesthetic',
    futuristic: 'futuristic, sci-fi, advanced, technological, cyberpunk, modern'
  };

  const moodEnhancements = {
    peaceful: 'serene, tranquil, soft lighting, ethereal, calm atmosphere, gentle',
    exciting: 'dynamic, vibrant, energetic, dramatic lighting, action-packed, intense',
    scary: 'dark, ominous, mysterious, dramatic shadows, horror atmosphere, eerie',
    strange: 'surreal, bizarre, abstract, impossible geometry, dreamlike, unusual',
    romantic: 'romantic, warm lighting, soft focus, beautiful, tender, loving',
    sad: 'melancholic, somber, muted colors, emotional, reflective, poignant'
  };

  const qualityEnhancements = highQuality 
    ? 'high detail, ultra-detailed, 8k resolution, masterpiece, professional quality, crisp, sharp'
    : 'detailed, good quality, clear';

  const styleKeywords = styleOptimizations[style] || styleOptimizations.realistic;
  const moodKeywords = moodEnhancements[mood] || 'artistic, creative';
  
  return `${originalPrompt}, ${styleKeywords}, ${moodKeywords}, ${qualityEnhancements}, vibrant colors, excellent composition`;
}

// SDXL specific prompt optimization with custom parameters
function optimizePromptForSDXL(originalPrompt, mood, style, highQuality) {
  const styleMap = {
    realistic: 'photorealistic, detailed photography, lifelike',
    surreal: 'surreal art, dreamlike, fantastical, abstract',
    cartoon: 'cartoon illustration, animated style, colorful',
    artistic: 'fine art, painterly, artistic masterpiece',
    vintage: 'vintage photography, retro style, classic',
    futuristic: 'futuristic art, sci-fi, cyberpunk'
  };

  const qualityKeywords = highQuality 
    ? 'ultra detailed, 8k, masterpiece, professional, high resolution'
    : 'detailed, good quality';

  const styleKeywords = styleMap[style] || styleMap.realistic;
  
  return `${originalPrompt}, ${styleKeywords}, ${qualityKeywords}, vibrant colors, excellent composition, digital art`;
}

// Helper functions for aspect ratio conversion
function getWidthFromAspectRatio(aspectRatio) {
  const ratioMap = {
    '16:9': 1024,
    '1:1': 1024,
    '9:16': 576,
    '4:3': 1024,
    '3:4': 768
  };
  return ratioMap[aspectRatio] || 1024;
}

function getHeightFromAspectRatio(aspectRatio) {
  const ratioMap = {
    '16:9': 576,
    '1:1': 1024,
    '9:16': 1024,
    '4:3': 768,
    '3:4': 1024
  };
  return ratioMap[aspectRatio] || 576;
}

// Save generated image to Supabase storage
async function saveImageToSupabase(supabase, imageUrl, dreamId, userId) {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const fileName = `dream-art-${dreamId}-${Date.now()}.png`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('dream-art')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get signed URL for the uploaded image
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('dream-art')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

    if (signedUrlError) {
      throw signedUrlError;
    }

    return signedUrlData.signedUrl;

  } catch (error) {
    console.error('Supabase storage error:', error);
    throw new Error(`Failed to save image to storage: ${error.message}`);
  }
}

// Update dream record with generated image
async function updateDreamWithImage(supabase, dreamId, imageUrl, prompt) {
  try {
    const { error } = await supabase
      .from('dreams')
      .update({
        image_url: imageUrl,
        generated_image: imageUrl, // For backward compatibility
        image_prompt: prompt,
        updated_at: new Date().toISOString()
      })
      .eq('id', dreamId);

    if (error) {
      throw error;
    }

    console.log('Dream updated with custom image URL');
  } catch (error) {
    console.error('Failed to update dream with image:', error);
    throw error;
  }
}

// Pica OneTool: Usage analytics and monitoring
async function logPicaOneToolUsage(data) {
  try {
    console.log('Pica OneTool Custom Usage Analytics:', {
      timestamp: data.timestamp || new Date().toISOString(),
      routing_config: PICA_ONETOOL_CONFIG,
      custom_parameters: data.custom_parameters || {},
      ...data
    });
    
    // In production, this could send to analytics service
    // await sendToAnalytics(data);
  } catch (error) {
    console.warn('Failed to log Pica OneTool usage:', error);
  }
}