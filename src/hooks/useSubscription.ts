import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface SubscriptionStatus {
  isSubscribed: boolean;
  status: 'active' | 'inactive' | 'expired' | 'pending';
  startedAt?: string;
  entitlements: {
    premiumAnalysis: boolean;
    voiceNarration: boolean;
    jungianAnalysis: boolean;
    freudianAnalysis: boolean;
  };
  source?: 'revenuecat' | 'local';
}

interface UseSubscriptionProps {
  onSubscriptionChange?: (status: SubscriptionStatus) => void;
  onError?: (error: string) => void;
}

export const useSubscription = ({
  onSubscriptionChange,
  onError
}: UseSubscriptionProps = {}) => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    status: 'inactive',
    entitlements: {
      premiumAnalysis: false,
      voiceNarration: false,
      jungianAnalysis: false,
      freudianAnalysis: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus({
        isSubscribed: false,
        status: 'inactive',
        entitlements: {
          premiumAnalysis: false,
          voiceNarration: false,
          jungianAnalysis: false,
          freudianAnalysis: false
        }
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/.netlify/functions/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check subscription status');
      }

      const data = await response.json();
      
      if (data.success) {
        const newStatus = data.subscription;
        setSubscriptionStatus(newStatus);
        onSubscriptionChange?.(newStatus);
      } else {
        throw new Error('Invalid response from subscription service');
      }

    } catch (error) {
      console.error('Subscription check error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to check subscription');
    } finally {
      setIsLoading(false);
    }
  }, [user, onSubscriptionChange, onError]);

  const subscribe = useCallback(async (productId: string = 'premium_monthly') => {
    if (!user) {
      onError?.('User must be logged in to subscribe');
      return false;
    }

    setIsSubscribing(true);

    try {
      // For demo purposes, simulate a successful purchase
      // In a real app, this would integrate with your payment processor
      const mockReceiptData = generateMockReceiptData(productId, user.id);

      const response = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          receiptData: mockReceiptData,
          platform: 'web',
          productId: productId,
          price: productId === 'premium_yearly' ? 99.99 : 9.99,
          currency: 'USD'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Subscription failed');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local subscription status
        await checkSubscriptionStatus();
        return true;
      } else {
        throw new Error('Subscription processing failed');
      }

    } catch (error) {
      console.error('Subscription error:', error);
      onError?.(error instanceof Error ? error.message : 'Subscription failed');
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, [user, onError, checkSubscriptionStatus]);

  const hasEntitlement = useCallback((feature: keyof SubscriptionStatus['entitlements']) => {
    return subscriptionStatus.entitlements[feature];
  }, [subscriptionStatus]);

  const isPremiumFeature = useCallback((feature: 'jungian' | 'freudian' | 'narration') => {
    switch (feature) {
      case 'jungian':
        return !hasEntitlement('jungianAnalysis');
      case 'freudian':
        return !hasEntitlement('freudianAnalysis');
      case 'narration':
        return !hasEntitlement('voiceNarration');
      default:
        return false;
    }
  }, [hasEntitlement]);

  // Check subscription status on mount and when user changes
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  return {
    subscriptionStatus,
    isLoading,
    isSubscribing,
    checkSubscriptionStatus,
    subscribe,
    hasEntitlement,
    isPremiumFeature,
  };
};

// Generate mock receipt data for demo purposes
function generateMockReceiptData(productId: string, userId: string): string {
  const mockReceipt = {
    productId: productId,
    transactionId: `txn_${Date.now()}_${userId}`,
    purchaseDate: new Date().toISOString(),
    userId: userId,
    platform: 'web',
    amount: productId === 'premium_yearly' ? 99.99 : 9.99,
    currency: 'USD'
  };

  return btoa(JSON.stringify(mockReceipt));
}