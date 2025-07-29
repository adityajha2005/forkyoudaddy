import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleCreateIP = () => {
    navigate('/create');
  };

  const handleExploreRemixes = () => {
    navigate('/explore');
  };

  const handleViewRemixGraph = () => {
    navigate('/graph');
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Trademark Background Text */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left Quadrant */}
        <div className="absolute top-10 left-8 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-12 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute top-32 left-1/4 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-8 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute top-64 left-1/6 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-45 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute top-96 left-1/3 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-15 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute top-128 left-1/2 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-22 select-none">FORK YOU DADDY</div>
        </div>
        
        {/* Top Right Quadrant */}
        <div className="absolute top-16 right-16 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-30 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute top-48 right-1/4 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-18 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute top-80 right-1/3 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-25 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute top-112 right-1/2 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-33 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute top-144 right-2/3 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-12 select-none">FORK YOU DADDY</div>
        </div>
        
        {/* Bottom Left Quadrant */}
        <div className="absolute bottom-32 left-8 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-28 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute bottom-64 left-1/4 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-20 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute bottom-96 left-1/3 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-15 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute bottom-128 left-1/2 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-35 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute bottom-160 left-2/3 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-40 select-none">FORK YOU DADDY</div>
        </div>
        
        {/* Bottom Right Quadrant */}
        <div className="absolute bottom-16 right-16 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-18 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute bottom-48 right-1/4 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-25 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute bottom-80 right-1/3 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-42 select-none">FORK YOU DADDY</div>
        </div>
        
        {/* Bottom Left Quadrant - Additional instances moved from bottom right */}
        <div className="absolute bottom-32 left-1/6 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-32 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute bottom-96 left-4/5 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-28 select-none">FORK YOU DADDY</div>
        </div>
        
        {/* Center Area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-38 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute top-1/3 left-1/3 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-22 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute top-2/3 right-1/3 opacity-3">
          <div className="text-sm font-black text-gray-300 transform rotate-30 select-none">FORK YOU DADDY</div>
        </div>
        <div className="absolute bottom-1/3 left-2/3 opacity-3">
          <div className="text-xs font-black text-gray-300 transform -rotate-32 select-none">FORK YOU DADDY</div>
        </div>
      </div>

      {/* Content Examples - Positioned to not interfere with text */}
      <div className="absolute inset-0 pointer-events-none">
        {/* AI Prompt Example - Top Right */}
        <div className="absolute top-20 right-8 max-w-lg">
          <div className="bg-pepe-green border-2 border-black rounded-lg p-4 shadow-lg">
            <div className="text-sm font-bold text-black mb-2">🎨 AI PROMPT</div>
            <div className="text-sm text-black mb-2">"A cyberpunk cat in neon city"</div>
            <img 
              src="https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg?auto=compress&cs=tinysrgb&w=150" 
              alt="AI Generated Cat"
              className="w-full h-32 object-cover rounded border border-black"
            />
            <div className="text-sm text-black mt-2">🍴 42 remixes</div>
          </div>
        </div>
          <div className="absolute bottom-60 right-40 max-w-2xl">
          <div className="bg-blue-400 border-2 border-black rounded-lg p-4 shadow-lg">
            <div className="text-sm font-bold text-black mb-2">📚 KNOWLEDGE</div>
            <div className="text-sm text-black mb-2">"DeFi Basics Guide"</div>
            <img 
              src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=150" 
              alt="Knowledge"
              className="w-full h-40 object-cover rounded border border-black"
            />
            <div className="text-sm text-black mt-2">🍴 73 remixes</div>
          </div>
        </div>

        <div className="absolute top-32 left-7 max-w-2xl transform rotate-[21deg]">
          <div className="bg-dank-yellow border-2 border-black rounded-lg p-4 shadow-lg">
            <div className="text-sm font-bold text-black mb-2">😂 MEME</div>
            <div className="text-sm text-black mb-2">"When Gas Fees Hit"</div>
            <img 
              src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=150" 
              alt="Meme"
              className="w-full h-40 object-cover rounded border border-black"
            />
            <div className="text-sm text-black mt-2">🍴 256 remixes</div>
          </div>
        </div>

        {/* Knowledge Example - Bottom Right */}
        {/* <div className="absolute bottom-20 right-8 max-w-xs">
          <div className="bg-blue-400 border-2 border-black rounded-lg p-3 shadow-lg">
            <div className="text-xs font-bold text-black mb-2">📚 KNOWLEDGE</div>
            <div className="text-xs text-black mb-2">"DeFi Basics Guide"</div>
            <img 
              src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=150" 
              alt="Knowledge"
              className="w-full h-20 object-cover rounded border border-black"
            />
            <div className="text-xs text-black mt-2">🍴 73 remixes</div>
          </div>
        </div> */}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Main Title with Animation */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-black mb-6 leading-tight">
            FORK<span className="text-pepe-green animate-pulse">ME</span>DADDY
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
            Because ideas deserve to be <span className="text-pepe-green">forked</span>. 🍴
          </p>
          
          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover the hottest remixable content, stake on your favorites, and watch them battle for the crown! 👑
          </p>

          {/* Content Type Showcase */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-gray-600 mb-6">What you can create & remix:</h3>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-pepe-green text-black px-4 py-2 rounded-full border-2 border-black font-bold">
                <span>🎨</span>
                <span>AI PROMPTS</span>
              </div>
              <div className="flex items-center space-x-2 bg-dank-yellow text-black px-4 py-2 rounded-full border-2 border-black font-bold">
                <span>😂</span>
                <span>MEMES</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-400 text-black px-4 py-2 rounded-full border-2 border-black font-bold">
                <span>📚</span>
                <span>KNOWLEDGE</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          {/* <div className="flex justify-center items-center space-x-8 mb-12 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <span>1,234 IPs Created</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🍴</span>
              <span>5,678 Remixes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👥</span>
              <span>890 Creators</span>
            </div>
          </div> */}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={handleCreateIP}
              className="group bg-pepe-green hover:bg-green-600 text-black font-bold px-8 py-4 rounded-lg border-2 border-black transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <span className="flex items-center space-x-2">
                <span>🎨</span>
                <span>CREATE IP</span>
              </span>
            </button>
            
            <button 
              onClick={handleExploreRemixes}
              className="group bg-dank-yellow hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-lg border-2 border-black transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <span className="flex items-center space-x-2">
                <span>🔍</span>
                <span>EXPLORE REMIXES</span>
              </span>
            </button>
            
            <button 
              onClick={handleViewRemixGraph}
              className="group bg-meme-white hover:bg-gray-50 text-black font-bold px-8 py-4 rounded-lg border-2 border-black transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <span className="flex items-center space-x-2">
                <span>📊</span>
                <span>VIEW REMIX GRAPH</span>
              </span>
            </button>
          </div>

          {/* Call to action text */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 font-medium">
              Join the remix revolution! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;