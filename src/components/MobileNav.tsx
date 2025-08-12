import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { initializeAuthClient, connectUser } from '../services/campOrigin';

interface MobileNavProps {
  isConnected: boolean;
  account: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({
  isConnected,
  account,
  onConnect,
  onDisconnect
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/explore', label: 'Explore', icon: '🔍' },
    { path: '/create', label: 'Create', icon: '➕' },
    { path: '/graph', label: 'Graph', icon: '📊' },
    { path: '/dashboard', label: 'Profile', icon: '👤' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this feature!');
      return;
    }

    try {
      setIsConnecting(true);
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        // Switch to Basecamp network
        await switchToBasecamp();
        
        // Initialize Origin SDK
        try {
          const clientId = import.meta.env.VITE_CAMP_CLIENT_ID;
          if (clientId) {
            await initializeAuthClient(clientId);
            await connectUser();
          }
        } catch (error) {
          console.error('Origin SDK error:', error);
        }
        
        onConnect();
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToBasecamp = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x1cbc67c35a',
          chainName: 'Basecamp',
          nativeCurrency: {
            name: 'CAMP',
            symbol: 'CAMP',
            decimals: 18
          },
          rpcUrls: ['https://rpc-campnetwork.xyz'],
          blockExplorerUrls: ['https://basecamp.cloud.blockscout.com/']
        }]
      });
    } catch (error) {
      if ((error as any).code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1cbc67c35a' }]
          });
        } catch (switchError) {
          console.error('Error switching to Basecamp:', switchError);
        }
      } else {
        console.error('Error adding Basecamp network:', error);
      }
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-40 md:hidden">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'text-pepe-green bg-pepe-green/10'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Wallet Connection Button (Floating) */}
      {!isConnected && (
        <div className="fixed top-4 right-4 z-50 md:hidden">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-pepe-green hover:bg-green-600 disabled:bg-gray-400 text-black font-bold py-2 px-4 rounded-lg border-2 border-black transition-colors disabled:cursor-not-allowed shadow-lg"
          >
            {isConnecting ? '🔄' : '🔗'} Connect
          </button>
        </div>
      )}

      {/* Connected Wallet Info (Floating) */}
      {isConnected && (
        <div className="fixed top-4 right-4 z-50 md:hidden">
          <div className="relative">
            <button
              onClick={() => setShowWalletDropdown(!showWalletDropdown)}
              className="bg-white hover:bg-gray-50 text-black font-bold py-2 px-4 rounded-lg border-2 border-pepe-green transition-colors shadow-lg flex items-center space-x-2"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm">{shortenAddress(account)}</span>
              <span className="text-xs">▼</span>
            </button>

            {showWalletDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-gray-200 rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-900">
                    Connected Wallet
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {account}
                  </div>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setShowWalletDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📊 Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onDisconnect();
                      setShowWalletDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    🚪 Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Spacer for Mobile */}
      <div className="h-20 md:hidden"></div>
    </>
  );
};

export default MobileNav; 