import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

interface PremiumBadgeProps {
  variant?: 'default' | 'small' | 'large';
  showIcon?: boolean;
  className?: string;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  variant = 'default',
  showIcon = true,
  className = ''
}) => {
  const variants = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    default: 'h-3 w-3',
    large: 'h-4 w-4'
  };

  return (
    <div className={`
      inline-flex items-center space-x-1 
      bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
      border border-yellow-500/30 
      text-yellow-300 
      rounded-full font-medium
      ${variants[variant]}
      ${className}
    `}>
      {showIcon && <Crown className={iconSizes[variant]} />}
      <span>Premium</span>
    </div>
  );
};

export default PremiumBadge;