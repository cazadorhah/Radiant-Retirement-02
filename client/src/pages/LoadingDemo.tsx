import React, { useState } from 'react';
import LoadingAnimation from '../components/LoadingAnimation';
import SeniorThemeLoader from '../components/SeniorThemeLoader';
import ProgressLoader from '../components/ProgressLoader';

const LoadingDemo = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProgressComplete = () => {
    setShowSuccess(true);
    // Reset after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Senior-Friendly Loading Animations</h1>
        <p className="text-center text-lg mb-12 text-gray-600">
          Designed for clarity, visibility, and a touch of playfulness without being overwhelming
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Basic Loaders</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Small</h3>
                <LoadingAnimation size="small" text="Loading" />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Medium</h3>
                <LoadingAnimation size="medium" text="Loading" />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Large</h3>
                <LoadingAnimation size="large" text="Loading" />
              </div>
            </div>

            <h3 className="text-lg font-medium mt-8 mb-4">Color Variants</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Primary</h3>
                <LoadingAnimation size="small" variant="primary" text="Loading" />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Secondary</h3>
                <LoadingAnimation size="small" variant="secondary" text="Loading" />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Subtle</h3>
                <LoadingAnimation size="small" variant="subtle" text="Loading" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Themed Loaders</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Home Theme</h3>
                <SeniorThemeLoader 
                  size="small" 
                  theme="home" 
                  text="Finding homes" 
                />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Nature Theme</h3>
                <SeniorThemeLoader 
                  size="small" 
                  theme="nature" 
                  text="Checking amenities" 
                />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Community</h3>
                <SeniorThemeLoader 
                  size="small" 
                  theme="community" 
                  text="Finding neighbors" 
                />
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-8 mb-4">Medium Size Theme</h3>
            <div className="flex justify-center">
              <SeniorThemeLoader 
                size="medium"
                theme="home" 
                text="Finding your perfect senior living community..."
              />
            </div>
          </div>
        </div>

        <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Progress Indicators</h2>
          <p className="mb-6 text-gray-600">Progress indicators provide clear feedback to seniors about how long they need to wait. These are especially useful for tasks like form submissions or searches.</p>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Small Progress Bar (5 seconds)</h3>
              <ProgressLoader 
                size="small" 
                duration={5} 
                text="Finding facilities near you"
                completeText="Found 8 facilities!"
                onComplete={handleProgressComplete}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Medium Progress Bar (8 seconds)</h3>
              <ProgressLoader 
                size="medium" 
                duration={8} 
                text="Checking availability"
                completeText="5 facilities available!"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Large Progress Bar (10 seconds)</h3>
              <ProgressLoader 
                size="large" 
                duration={10} 
                text="Analyzing your preferences"
                completeText="Analysis complete!"
              />
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Success!</h2>
              <p className="text-gray-600 mb-4">Your request has been completed successfully.</p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingDemo;