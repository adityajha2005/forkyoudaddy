import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { initializeAuthClient, connectUser, disconnectUser } from '../services/campOrigin';

// MetaMask type declarations
declare global {
  interface Window {
    ethereum?: any;
  }
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask to use this feature!');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Request accounts first
      const accounts = await window.ethereum!.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Switch to Basecamp network
        await switchToBasecamp();
        
        // Initialize Origin SDK after wallet is connected
        try {
          const clientId = import.meta.env.VITE_CAMP_CLIENT_ID;
          if (!clientId) {
            throw new Error('Camp Network Client ID not found in environment variables');
          }
          await initializeAuthClient(clientId);
          await connectUser();
  
        } catch (originError) {
          console.error('Origin SDK error:', originError);
          // Don't fail the entire connection if Origin SDK fails
          // User can still use the app without Origin SDK
  
        }
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
      await window.ethereum!.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x1cbc67c35a', // 123420001114 in hex
          chainName: 'Basecamp',
          nativeCurrency: {
            name: 'CAMP',
            symbol: 'CAMP',
            decimals: 18
          },
          rpcUrls: ['https://rpc-campnetwork.xyz'],
          blockExplorerUrls: ['https://explorer.campnetwork.xyz']
        }]
      });
    } catch (error) {
      if ((error as any).code === 4902) {
        try {
          await window.ethereum!.request({
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

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount('');
    setIsConnected(false);
    setShowWalletDropdown(false);
  };

  // Copy wallet address to clipboard
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account);
      alert('Address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy address:', error);
      alert('Failed to copy address');
    }
  };

  // Switch account (request new accounts)
  const switchAccount = async () => {
    try {
      const accounts = await window.ethereum!.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Ensure we're on Basecamp network
        await switchToBasecamp();
      }
    } catch (error) {
      console.error('Error switching account:', error);
      alert('Failed to switch account. Please try again.');
    }
  };

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled() && window.ethereum?.selectedAddress) {
        setAccount(window.ethereum.selectedAddress);
        setIsConnected(true);
      }
    };
    
    checkConnection();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showWalletDropdown && !target.closest('.wallet-dropdown')) {
        setShowWalletDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWalletDropdown]);

  const navLinks = [
    { href: '/explore', label: 'EXPLORE', icon: '📚' },
    { href: '/create', label: 'CREATE IP', icon: '⚒️' },
    { href: '/graph', label: 'REMIX GRAPH', icon: '🧬' },
    // { href: '/dashboard', label: 'DASHBOARD', icon: '👤' },
    { href: 'https://docs.camp.network', label: 'DOCS', icon: '📄', external: true }
  ];

  return (
    <nav className="bg-meme-white border-b-2 border-black sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 group"
              aria-label="ForkYouDaddy Home"
            >
              <img
                src="/logo.jpeg"
                alt="ForkYouDaddy logo"
                className="h-10 w-auto border-2 border-black rounded-md bg-white group-hover:brightness-110 transition"
                loading="eager"
                decoding="async"
              />
              <span className="text-xl font-black text-black group-hover:text-pepe-green transition-colors hidden sm:inline">
                ForkYouDaddy
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-pepe-green text-black shadow-lg'
                    : 'text-gray-600 hover:text-pepe-green hover:bg-gray-50'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Connect Wallet Button */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="relative flex items-center space-x-2">
                <button 
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="wallet-dropdown bg-pepe-green hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg border-2 border-black transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                >
                  <span>🔗</span>
                  <span className="text-xs font-mono">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <span className="text-xs">▼</span>
                </button>
                
                {/* Wallet Dropdown */}
                {showWalletDropdown && (
                  <div className="wallet-dropdown absolute top-full right-0 mt-2 w-48 bg-white border-2 border-black rounded-lg shadow-lg z-50">
                    <div className="p-2 space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setShowWalletDropdown(false)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <span>👤</span>
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/licenses"
                        onClick={() => setShowWalletDropdown(false)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <span>📄</span>
                        <span>My Licenses</span>
                      </Link>
                      <button
                        onClick={copyAddress}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <span>📋</span>
                        <span>Copy Address</span>
                      </button>
                      <button
                        onClick={switchAccount}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <span>🔄</span>
                        <span>Switch Account</span>
                      </button>
                      <div className="border-t border-gray-300 my-1"></div>
                      <button
                        onClick={disconnectWallet}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-red-100 text-red-600 rounded flex items-center space-x-2"
                      >
                        <span>🔌</span>
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-pepe-green hover:bg-green-600 disabled:bg-gray-400 text-black font-bold px-6 py-2 rounded-lg border-2 border-black transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
              >
                {isConnecting ? '🔄 CONNECTING...' : '🔗 CONNECT WALLET'}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border-2 border-black hover:bg-gray-50 transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
                <div className={`w-4 h-0.5 bg-black transition-all duration-200 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-4 h-0.5 bg-black transition-all duration-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-4 h-0.5 bg-black transition-all duration-200 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-2 border-black bg-meme-white">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-bold transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-pepe-green text-black shadow-lg'
                      : 'text-gray-600 hover:text-pepe-green hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;