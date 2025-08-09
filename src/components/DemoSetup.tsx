import React from 'react';
import { setupDemoData, setupDemoWallet, clearDemoData, isDemoMode } from '../utils/demoSetup';

const DemoSetup: React.FC = () => {
  const [isDemoActive, setIsDemoActive] = React.useState(isDemoMode());

  const handleSetupDemo = () => {
    setupDemoData();
    setupDemoWallet();
    setIsDemoActive(true);
    window.location.reload(); // Reload to apply demo data
  };

  const handleClearDemo = () => {
    clearDemoData();
    setIsDemoActive(false);
    window.location.reload(); // Reload to clear demo data
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-sm font-bold mb-2">🎭 Demo Mode</h3>
        <div className="space-y-2">
          {!isDemoActive ? (
            <button
              onClick={handleSetupDemo}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors"
            >
              Setup Demo Data
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-green-400">✅ Demo Active</div>
              <button
                onClick={handleClearDemo}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors"
              >
                Clear Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoSetup; 