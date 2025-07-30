import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import Hero from './components/Hero';
import ExploreSection from './components/ExploreSection';
import HowItWorks from './components/HowItWorks';
import RemixGraph from './components/RemixGraph';
import Footer from './components/Footer';
import ExplorePage from './pages/ExplorePage';
import CreateIPPage from './pages/CreateIPPage';
import RemixPage from './pages/RemixPage';
import RemixGraphPage from './pages/RemixGraphPage';
import UserDashboard from './pages/UserDashboard';
import IPAnalyticsPage from './pages/IPAnalyticsPage';
import AITestPage from './components/AITestPage';
import UserProfile from './components/UserProfile';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum?.selectedAddress) {
        setAccount(window.ethereum.selectedAddress);
        setIsConnected(true);
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount('');
          setIsConnected(false);
        }
      });
    }
  }, []);

  const handleConnect = () => {
    if (window.ethereum?.selectedAddress) {
      setAccount(window.ethereum.selectedAddress);
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    setAccount('');
    setIsConnected(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-meme-white via-gray-50 via-pepe-green/5 to-dank-yellow/10">
        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Navbar />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav
            isConnected={isConnected}
            account={account}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </div>

        <Routes>
          {/* Home Page */}
          <Route path="/" element={
            <>
              <Hero />
              <ExploreSection />
              <HowItWorks />
              <RemixGraph />
              <Footer />
            </>
          } />
          
          {/* Explore Page */}
          <Route path="/explore" element={<ExplorePage />} />
          
          {/* Create IP Page */}
          <Route path="/create" element={<CreateIPPage />} />
          
          {/* Remix Graph Page */}
          <Route path="/graph" element={<RemixGraphPage />} />
          
          {/* Remix Page */}
          <Route path="/remix" element={<RemixPage />} />
          
          {/* User Dashboard */}
          <Route path="/dashboard" element={<UserDashboard />} />
          
          {/* IP Analytics Page */}
          <Route path="/analytics" element={<IPAnalyticsPage />} />
          
          {/* IP Details Page (for future use) */}
          <Route path="/ip/:id" element={<RemixPage />} />
          
          {/* AI Test Page */}
          <Route path="/ai-test" element={<AITestPage />} />
          
          {/* User Profile Page */}
          <Route path="/profile/:address" element={<UserProfile currentUserAddress={account} />} />
        </Routes>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    </Router>
  );
}

export default App;