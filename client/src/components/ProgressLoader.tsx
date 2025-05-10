import React, { useState, useEffect } from 'react';

interface ProgressLoaderProps {
  duration?: number; // Duration in seconds
  text?: string;
  completeText?: string;
  size?: 'small' | 'medium' | 'large';
  onComplete?: () => void;
}

const ProgressLoader: React.FC<ProgressLoaderProps> = ({
  duration = 5, // Default 5 seconds
  text = 'Loading your results',
  completeText = 'Ready!',
  size = 'medium',
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Size mappings
  const sizeMap = {
    small: {
      container: 'max-w-xs',
      progressBar: 'h-2',
      text: 'text-sm',
    },
    medium: {
      container: 'max-w-sm',
      progressBar: 'h-3',
      text: 'text-base',
    },
    large: {
      container: 'max-w-md',
      progressBar: 'h-4',
      text: 'text-lg',
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + (100 / (duration * 10));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          if (onComplete) onComplete();
          return 100;
        }
        
        return newProgress;
      });
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className={`${sizeMap[size].container} w-full text-center`}>
      <div className="mb-3">
        <div className="relative pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className={`${sizeMap[size].text} font-semibold inline-block text-blue-600`}>
                {isComplete ? completeText : text}
              </span>
            </div>
            <div className="text-right">
              <span className={`${sizeMap[size].text} inline-block text-blue-600 font-semibold`}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          
          <div className={`overflow-hidden ${sizeMap[size].progressBar} mb-4 text-xs flex rounded-full bg-blue-200`}>
            <div 
              style={{ width: `${progress}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300 ease-in-out"
            >
              {progress > 30 && size === 'large' && (
                <span className="text-xs font-semibold">Loading...</span>
              )}
            </div>
          </div>
          
          {/* Visual indicators for seniors */}
          <div className="flex justify-between px-1">
            <div className="text-left">
              <span className="text-xs text-gray-500">Starting</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500">Halfway</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Almost done</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reassuring message */}
      <p className="text-gray-600 text-sm mt-2">
        {isComplete 
          ? "Thank you for your patience!" 
          : "We're finding the best options for you..."}
      </p>
      
      {/* Visual animation */}
      {!isComplete && (
        <div className="flex justify-center mt-3 space-x-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" 
              style={{ 
                animationDelay: `${i * 0.3}s`,
                animationDuration: '1.5s'
              }}
            ></div>
          ))}
        </div>
      )}
      
      {/* Success check mark */}
      {isComplete && (
        <div className="flex justify-center mt-4">
          <div className="rounded-full bg-green-100 p-2">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressLoader;