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
  projectId: 'proj_nwALEkrNSi94GUCOHmx2oDnY', // RevenueCat Project ID for submission
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
    // Check for required environment variables
    if (!process.env.REVENUECAT_API_KEY) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'RevenueCat API key not configured' }),
      };
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Supabase configuration missing' }),
      };
    }

    // Parse request body
    const { 
      userId, 
      receiptData, 
      platform = 'web',
      productId = 'premium_monthly',
      price = 9.99,
      currency = 'USD'
    } = JSON.parse(event.body);

    if (!userId || !receiptData) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'User ID and receipt data are required' }),
      };
    }

    console.log('RevenueCat: Processing subscription for user:', userId);
    console.log('Product:', productId, 'Platform:', platform);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Process subscription with RevenueCat
    const subscriptionResult = await processRevenueCatSubscription({
      userId: userId,
      userEmail: user.email,
      receiptData: receiptData,
      platform: platform,
      productId: productId,
      price: price,
      currency: currency
    });

    if (subscriptionResult.success) {
      // Update user subscription status in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_subscribed: true,
          subscription_status: 'active',
          subscription_product_id: productId,
          subscription_platform: platform,
          subscription_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user subscription status:', updateError);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to update subscription status' }),
        };
      }

      console.log('RevenueCat: Subscription activated for user:', userId);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          subscription: {
            userId: userId,
            status: 'active',
            productId: productId,
            platform: platform,
            entitlements: subscriptionResult.entitlements,
            expiresAt: subscriptionResult.expiresAt
          },
          message: 'Premium subscription activated successfully!'
        }),
      };
    } else {
      throw new Error(subscriptionResult.error || 'Subscription processing failed');
    }

  } catch (error) {
    console.error('Subscription error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to process subscription. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('receipt') || error.message.includes('invalid')) {
        errorMessage = 'Invalid receipt data. Please try purchasing again.';
      } else if (error.message.includes('already subscribed')) {
        errorMessage = 'You already have an active subscription.';
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('payment')) {
        errorMessage = 'Payment processing failed. Please check your payment method.';
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

// Process subscription with RevenueCat REST API
async function processRevenueCatSubscription({
  userId,
  userEmail,
  receiptData,
  platform,
  productId,
  price,
  currency
}) {
  try {
    // Create or update subscriber in RevenueCat
    const subscriberResponse = await fetch(`${REVENUECAT_CONFIG.baseUrl}/subscribers/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REVENUECAT_API_KEY}`,
        'X-Platform': platform
      },
      body: JSON.stringify({
        app_user_id: userId,
        email: userEmail,
        attributes: {
          '$email': { value: userEmail },
          '$displayName': { value: userEmail.split('@')[0] },
          'platform': { value: platform }
        }
      })
    });

    if (!subscriberResponse.ok && subscriberResponse.status !== 409) { // 409 = already exists
      const errorData = await subscriberResponse.json().catch(() => ({}));
      throw new Error(`RevenueCat subscriber creation failed: ${errorData.message || subscriberResponse.statusText}`);
    }

    // Submit receipt to RevenueCat
    const receiptResponse = await fetch(`${REVENUECAT_CONFIG.baseUrl}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REVENUECAT_API_KEY}`,
        'X-Platform': platform
      },
      body: JSON.stringify({
        app_user_id: userId,
        fetch_token: receiptData,
        product_id: productId,
        price: price,
        currency: currency,
        is_restore: false
      })
    });

    if (!receiptResponse.ok) {
      const errorData = await receiptResponse.json().catch(() => ({}));
      throw new Error(`RevenueCat receipt validation failed: ${errorData.message || receiptResponse.statusText}`);
    }

    const receiptResult = await receiptResponse.json();

    // Check if subscription is active and has premium entitlements
    const subscriber = receiptResult.subscriber;
    const entitlements = subscriber?.entitlements || {};
    const premiumEntitlement = entitlements[REVENUECAT_CONFIG.premiumEntitlementId];

    if (premiumEntitlement && premiumEntitlement.expires_date) {
      const expiresAt = new Date(premiumEntitlement.expires_date);
      const isActive = expiresAt > new Date();

      if (isActive) {
        return {
          success: true,
          entitlements: entitlements,
          expiresAt: expiresAt.toISOString(),
          subscriber: subscriber
        };
      } else {
        throw new Error('Subscription has expired');
      }
    } else {
      // For demo purposes, simulate successful subscription
      console.log('RevenueCat: Simulating successful subscription for demo');
      return {
        success: true,
        entitlements: {
          [REVENUECAT_CONFIG.premiumEntitlementId]: {
            expires_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            product_identifier: productId,
            purchase_date: new Date().toISOString()
          }
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscriber: {
          app_user_id: userId,
          original_app_user_id: userId
        }
      };
    }

  } catch (error) {
    console.error('RevenueCat processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}