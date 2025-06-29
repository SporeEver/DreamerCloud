import React, { createContext, useContext, useState, useEffect } from 'react';
import Purchases, { PurchasesOffering } from 'react-native-purchases';
import { useAuth } from './useAuth';

const SubscriptionContext = createContext({});

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isSubscribed: false,
    status: 'inactive',
    entitlements: {
      premiumAnalysis: false,
      voiceNarration: false,
      jungianAnalysis: false,
      freudianAnalysis: false
    }
  });
  const [offerings, setOfferings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
      loadOfferings();
    }
  }, [user]);

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings);
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      // Check RevenueCat subscription status
      const customerInfo = await Purchases.getCustomerInfo();
      const premiumEntitlement = customerInfo.entitlements.active['premium_features'];
      
      const isSubscribed = !!premiumEntitlement;
      const status = isSubscribed ? 'active' : 'inactive';

      const newStatus = {
        isSubscribed,
        status,
        entitlements: {
          premiumAnalysis: isSubscribed,
          voiceNarration: isSubscribed,
          jungianAnalysis: isSubscribed,
          freudianAnalysis: isSubscribed
        }
      };

      setSubscriptionStatus(newStatus);

      // Update user object if subscription status changed
      if (user.isSubscribed !== isSubscribed) {
        await updateUser({
          isSubscribed,
          subscriptionStatus: status
        });
      }

    } catch (error) {
      console.error('Subscription check error:', error);
      // Use local user data as fallback
      setSubscriptionStatus({
        isSubscribed: user.isSubscribed || false,
        status: user.subscriptionStatus || 'inactive',
        entitlements: {
          premiumAnalysis: user.isSubscribed || false,
          voiceNarration: user.isSubscribed || false,
          jungianAnalysis: user.isSubscribed || false,
          freudianAnalysis: user.isSubscribed || false
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async (packageIdentifier = 'premium_monthly') => {
    if (!user || !offerings) {
      throw new Error('User not authenticated or offerings not loaded');
    }

    setIsSubscribing(true);

    try {
      const currentOffering = offerings.current;
      if (!currentOffering) {
        throw new Error('No current offering available');
      }

      const packageToSubscribe = currentOffering.availablePackages.find(
        pkg => pkg.identifier === packageIdentifier
      );

      if (!packageToSubscribe) {
        throw new Error(`Package ${packageIdentifier} not found`);
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToSubscribe);
      
      // Check if purchase was successful
      const premiumEntitlement = customerInfo.entitlements.active['premium_features'];
      
      if (premiumEntitlement) {
        // Update subscription status
        await checkSubscriptionStatus();
        
        // Update user in local storage
        await updateUser({
          isSubscribed: true,
          subscriptionStatus: 'active',
          subscriptionProductId: packageIdentifier,
          subscriptionPlatform: 'ios',
          subscriptionStartedAt: new Date().toISOString()
        });

        return true;
      } else {
        throw new Error('Purchase completed but entitlement not found');
      }

    } catch (error) {
      console.error('Subscription error:', error);
      
      if (error.userCancelled) {
        throw new Error('Purchase was cancelled');
      } else if (error.code === 'PURCHASE_NOT_ALLOWED_ERROR') {
        throw new Error('Purchases not allowed on this device');
      } else if (error.code === 'PAYMENT_PENDING_ERROR') {
        throw new Error('Payment is pending approval');
      } else {
        throw new Error(error.message || 'Subscription failed');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setIsLoading(true);
      const customerInfo = await Purchases.restorePurchases();
      
      // Check if any entitlements were restored
      const premiumEntitlement = customerInfo.entitlements.active['premium_features'];
      
      if (premiumEntitlement) {
        await checkSubscriptionStatus();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Restore purchases error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const hasEntitlement = (feature) => {
    return subscriptionStatus.entitlements[feature] || false;
  };

  const isPremiumFeature = (feature) => {
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
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionStatus,
        offerings,
        isLoading,
        isSubscribing,
        checkSubscriptionStatus,
        subscribe,
        restorePurchases,
        hasEntitlement,
        isPremiumFeature,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};