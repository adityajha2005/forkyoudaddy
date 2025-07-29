import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { href: '/explore', label: 'EXPLORE', icon: '📚' },
    { href: '/create', label: 'CREATE IP', icon: '⚒️' },
    { href: '/graph', label: 'REMIX GRAPH', icon: '🧬' },
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
              className="text-2xl font-black text-black hover:text-pepe-green transition-colors duration-200 flex items-center space-x-2"
            >
              {/* <span>🧠</span> */}
              <span className="hidden sm:inline">FORKMEDADDY</span>
              <span className="sm:hidden">FMD</span>
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
            <button className="bg-pepe-green hover:bg-green-600 text-black font-bold px-6 py-2 rounded-lg border-2 border-black transition-all duration-200 shadow-sm hover:shadow-md">
              🔗 CONNECT WALLET
            </button>

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