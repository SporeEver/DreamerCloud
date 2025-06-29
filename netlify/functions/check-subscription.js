const { createClient } = require('@supabase/supabase-js');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// RevenueCat configuration
const REVENUECAT_CONFIG = {
  baseUrl: 'https://api.revenuecat.com/v1',
  premiumEntitlementId: 'premium_features'
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
    const { userId } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'User ID is required' }),
      };
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get user subscription status from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, is_subscribed, subscription_status, subscription_started_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Check with RevenueCat if API key is available
    let revenueCatStatus = null;
    if (process.env.REVENUECAT_API_KEY) {
      try {
        revenueCatStatus = await checkRevenueCatSubscription(userId);
      } catch (error) {
        console.warn('RevenueCat check failed, using local status:', error.message);
      }
    }

    // Determine final subscription status
    const isSubscribed = revenueCatStatus?.isActive ?? user.is_subscribed ?? false;
    const subscriptionStatus = revenueCatStatus?.status ?? user.subscription_status ?? 'inactive';

    // Update local status if RevenueCat provides different info
    if (revenueCatStatus && (revenueCatStatus.isActive !== user.is_subscribed)) {
      await supabase
        .from('users')
        .update({
          is_subscribed: revenueCatStatus.isActive,
          subscription_status: revenueCatStatus.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        subscription: {
          isSubscribed: isSubscribed,
          status: subscriptionStatus,
          startedAt: user.subscription_started_at,
          entitlements: {
            premiumAnalysis: isSubscribed,
            voiceNarration: isSubscribed,
            jungianAnalysis: isSubscribed,
            freudianAnalysis: isSubscribed
          },
          source: revenueCatStatus ? 'revenuecat' : 'local'
        }
      }),
    };

  } catch (error) {
    console.error('Subscription check error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to check subscription status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};

// Check subscription status with RevenueCat
async function checkRevenueCatSubscription(userId) {
  try {
    const response = await fetch(`${REVENUECAT_CONFIG.baseUrl}/subscribers/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.REVENUECAT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { isActive: false, status: 'inactive' };
      }
      throw new Error(`RevenueCat API error: ${response.status}`);
    }

    const data = await response.json();
    const subscriber = data.subscriber;
    const entitlements = subscriber?.entitlements || {};
    const premiumEntitlement = entitlements[REVENUECAT_CONFIG.premiumEntitlementId];

    if (premiumEntitlement && premiumEntitlement.expires_date) {
      const expiresAt = new Date(premiumEntitlement.expires_date);
      const isActive = expiresAt > new Date();
      
      return {
        isActive: isActive,
        status: isActive ? 'active' : 'expired',
        expiresAt: expiresAt.toISOString(),
        entitlements: entitlements
      };
    }

    return { isActive: false, status: 'inactive' };

  } catch (error) {
    console.error('RevenueCat subscription check failed:', error);
    throw error;
  }
}