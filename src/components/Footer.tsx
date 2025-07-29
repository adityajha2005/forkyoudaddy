import React from 'react';
import { Github, Twitter, FileText } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-black mb-2">FORKMEDADDY</h3>
            <p className="text-gray-400">
              Built for Camp ✕ Wizz Bounty 🏆
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-pepe-green transition-colors font-medium">
              <Github className="w-5 h-5" />
              GITHUB
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-pepe-green transition-colors font-medium">
              <FileText className="w-5 h-5" />
              CAMP DOCS
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-pepe-green transition-colors font-medium">
              <Twitter className="w-5 h-5" />
              X ACCOUNT
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>© 2025 ForkMeDaddy. All rights reserved. Fork responsibly. 🍴</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;