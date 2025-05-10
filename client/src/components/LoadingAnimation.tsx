import React from 'react';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  variant?: 'primary' | 'secondary' | 'subtle';
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'medium',
  text = 'Loading...',
  variant = 'primary',
}) => {
  // Size mappings
  const sizeMap = {
    small: {
      outer: 'w-12 h-12',
      inner: 'w-8 h-8',
      text: 'text-sm',
    },
    medium: {
      outer: 'w-16 h-16',
      inner: 'w-10 h-10',
      text: 'text-base',
    },
    large: {
      outer: 'w-24 h-24',
      inner: 'w-16 h-16',
      text: 'text-lg',
    },
  };

  // Color mappings for different variants
  const colorMap = {
    primary: {
      outer: 'border-blue-300',
      inner: 'bg-blue-600',
      text: 'text-blue-700',
    },
    secondary: {
      outer: 'border-teal-300',
      inner: 'bg-teal-500',
      text: 'text-teal-700',
    },
    subtle: {
      outer: 'border-gray-200',
      inner: 'bg-gray-400',
      text: 'text-gray-600',
    },
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        {/* Outer circle that rotates slowly */}
        <div 
          className={`${sizeMap[size].outer} rounded-full border-4 ${colorMap[variant].outer} border-t-transparent animate-spin`}
          style={{ animationDuration: '3s' }}
        ></div>
        
        {/* Inner bouncing shape */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`${sizeMap[size].inner} rounded-lg ${colorMap[variant].inner} animate-bounce`}
            style={{ animationDuration: '2s' }}
          ></div>
        </div>
      </div>
      
      {text && (
        <div className={`mt-4 font-medium ${sizeMap[size].text} ${colorMap[variant].text}`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingAnimation;