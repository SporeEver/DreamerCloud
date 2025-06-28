import React from 'react';
import { X, Crown, Check, Sparkles, Brain, Volume2, Zap, Star } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'jungian' | 'freudian' | 'narration';
  onSubscribeSuccess?: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  feature,
  onSubscribeSuccess
}) => {
  const { subscribe, isSubscribing } = useSubscription({
    onSubscriptionChange: (status) => {
      if (status.isSubscribed) {
        onSubscribeSuccess?.();
        onClose();
      }
    }
  });

  if (!isOpen) return null;

  const featureInfo = {
    jungian: {
      title: 'Jungian Dream Analysis',
      description: 'Unlock deep archetypal insights and symbolic interpretations',
      icon: Brain,
      color: 'from-purple-500 to-indigo-500'
    },
    freudian: {
      title: 'Freudian Dream Analysis',
      description: 'Explore unconscious desires and psychoanalytic interpretations',
      icon: Brain,
      color: 'from-red-500 to-pink-500'
    },
    narration: {
      title: 'Voice Narration',
      description: 'Listen to your dream analyses with AI-powered voice narration',
      icon: Volume2,
      color: 'from-green-500 to-emerald-500'
    }
  };

  const currentFeature = featureInfo[feature];
  const FeatureIcon = currentFeature.icon;

  const premiumFeatures = [
    { icon: Brain, text: 'Jungian & Freudian Analysis Styles' },
    { icon: Volume2, text: 'AI Voice Narration with Multiple Voices' },
    { icon: Sparkles, text: 'Priority AI Processing' },
    { icon: Crown, text: 'Premium Support' },
    { icon: Star, text: 'Early Access to New Features' },
    { icon: Zap, text: 'Unlimited Dream Analysis' }
  ];

  const handleSubscribe = async (productId: string) => {
    const success = await subscribe(productId);
    if (success) {
      // Success is handled by the subscription hook callback
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`bg-gradient-to-r ${currentFeature.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
              <FeatureIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Unlock Premium Features</h2>
              <p className="text-gray-400 text-sm">{currentFeature.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Feature Highlight */}
          <div className={`bg-gradient-to-r ${currentFeature.color} bg-opacity-20 border border-purple-500/30 rounded-xl p-6 mb-6`}>
            <div className="flex items-center space-x-4 mb-4">
              <div className={`bg-gradient-to-r ${currentFeature.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <FeatureIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{currentFeature.title}</h3>
                <p className="text-gray-300 text-sm">{currentFeature.description}</p>
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <p className="text-white text-sm leading-relaxed">
                {feature === 'jungian' && "Dive deep into archetypal symbols, the collective unconscious, and your individuation process with expert Jungian analysis powered by advanced AI."}
                {feature === 'freudian' && "Explore the hidden meanings in your dreams through psychoanalytic interpretation, uncovering unconscious desires and symbolic representations."}
                {feature === 'narration' && "Transform your written dream analyses into immersive audio experiences with high-quality AI voices from ElevenLabs."}
              </p>
            </div>
          </div>

          {/* Premium Features List */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <Crown className="h-4 w-4 text-yellow-400" />
              <span>Premium Features Included</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-center mb-4">Choose Your Plan</h4>
            
            {/* Monthly Plan */}
            <div className="border border-gray-600 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-white font-semibold">Premium Monthly</h5>
                  <p className="text-gray-400 text-sm">Perfect for trying premium features</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">$9.99</div>
                  <div className="text-gray-400 text-sm">per month</div>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe('premium_monthly')}
                disabled={isSubscribing}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
              >
                {isSubscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    <span>Subscribe Monthly</span>
                  </>
                )}
              </button>
            </div>

            {/* Yearly Plan */}
            <div className="border-2 border-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                BEST VALUE
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-white font-semibold">Premium Yearly</h5>
                  <p className="text-gray-400 text-sm">Save 17% with annual billing</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">$99.99</div>
                  <div className="text-gray-400 text-sm">per year</div>
                  <div className="text-green-400 text-xs">Save $20</div>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe('premium_yearly')}
                disabled={isSubscribing}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
              >
                {isSubscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" />
                    <span>Subscribe Yearly</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-green-300 font-medium text-sm">30-Day Money Back Guarantee</span>
            </div>
            <p className="text-green-200 text-xs">
              Try premium features risk-free. Cancel anytime within 30 days for a full refund.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              Secure payment processing • Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;