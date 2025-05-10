import React from 'react';

interface SeniorThemeLoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  theme?: 'home' | 'nature' | 'community';
}

const SeniorThemeLoader: React.FC<SeniorThemeLoaderProps> = ({
  size = 'medium',
  text = 'Finding your perfect home...',
  theme = 'home'
}) => {
  // Size mappings
  const sizeMap = {
    small: {
      container: 'w-24 h-24',
      icon: 'text-2xl',
      text: 'text-sm mt-2',
    },
    medium: {
      container: 'w-32 h-32',
      icon: 'text-4xl',
      text: 'text-base mt-3',
    },
    large: {
      container: 'w-40 h-40',
      icon: 'text-5xl',
      text: 'text-lg mt-4',
    },
  };

  // Theme settings
  const themeMap = {
    home: {
      icons: ['🏠', '🏡', '🏘️', '🌳'],
      backgroundColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    },
    nature: {
      icons: ['🌲', '🌳', '🌺', '🌼'],
      backgroundColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    },
    community: {
      icons: ['👵', '👴', '🧓', '👫'],
      backgroundColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    },
  };

  const { icons, backgroundColor, textColor, borderColor } = themeMap[theme];
  const { container, icon, text: textSize } = sizeMap[size];

  // When the component mounts, start the animation
  const [currentIconIndex, setCurrentIconIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prevIndex) => (prevIndex + 1) % icons.length);
    }, 1000); // Change icon every second - slow enough for senior visibility

    return () => clearInterval(interval);
  }, [icons.length]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`${container} ${backgroundColor} rounded-full border-2 ${borderColor} flex items-center justify-center relative animate-pulse`}
        style={{ animationDuration: '3s' }} // Slow, gentle pulsing
      >
        <span className={`${icon}`}>{icons[currentIconIndex]}</span>
        
        {/* Small decorative circles */}
        <div className="absolute w-4 h-4 rounded-full bg-white opacity-80 animate-orbit" style={{ 
          top: '10%', 
          left: '10%', 
          animationDuration: '10s',
          transform: 'translateX(-50%) translateY(-50%)'
        }}></div>
        
        <div className="absolute w-3 h-3 rounded-full bg-white opacity-60 animate-orbit" style={{ 
          bottom: '15%', 
          right: '15%', 
          animationDuration: '12s',
          animationDirection: 'reverse',
          transform: 'translateX(50%) translateY(50%)'
        }}></div>
      </div>
      
      {text && (
        <div className={`${textSize} ${textColor} font-medium text-center max-w-xs`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default SeniorThemeLoader;