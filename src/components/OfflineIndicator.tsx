import React, { useState, useEffect } from 'react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
      isOnline ? 'bg-green-500' : 'bg-red-500'
    }`}>
      <div className="flex items-center justify-center text-white font-bold">
        <span className="mr-2">
          {isOnline ? '🟢' : '🔴'}
        </span>
        <span>
          {isOnline ? 'Back Online' : 'You\'re Offline - Some features may be limited'}
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator; 