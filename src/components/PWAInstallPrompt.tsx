import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show the install prompt
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      // Hide the install prompt
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      // Log the install
      
      
      // Show success message
      alert('🎉 ForkYouDaddy has been installed! You can now access it from your home screen.');
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setShowInstallPrompt(false);
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check if already installed
    checkIfInstalled();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {

      } else {
        
      }
    } catch (error) {
      console.error('Error during install:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    
    // Remember that user dismissed the prompt
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if user recently dismissed
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  const dismissedRecently = dismissedTime && (Date.now() - parseInt(dismissedTime)) < 24 * 60 * 60 * 1000; // 24 hours

  if (!showInstallPrompt || dismissedRecently) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border-2 border-pepe-green rounded-lg shadow-lg p-4 z-50 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-pepe-green rounded-lg flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
          <div>
            <h3 className="font-bold text-black">Install ForkYouDaddy</h3>
            <p className="text-sm text-gray-600">
              Add to home screen for the best experience
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm"
          >
            Maybe Later
          </button>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="px-4 py-2 bg-pepe-green hover:bg-green-600 disabled:bg-gray-400 text-black font-bold rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt; 