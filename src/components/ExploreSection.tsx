import React from 'react';
import ExploreCard from './ExploreCard';

const ExploreSection = () => {
  const exploreCards = [
    {
      id: 1,
      title: "AI PROMPT #1",
      subtitle: "Space Cats Adventure",
      author: "0xc4f3...8d92",
      remixCount: 42,
      license: "CC0",
      type: "AI PROMPT",
      image: "https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      title: "MEME #5",
      subtitle: "Distracted Developer",
      author: "0xa1b2...c3d4",
      remixCount: 128,
      license: "MIT",
      type: "MEME",
      image: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 3,
      title: "KNOWLEDGE #3",
      subtitle: "DeFi Basics Guide",
      author: "0xe5f6...g7h8",
      remixCount: 73,
      license: "CC BY",
      type: "KNOWLEDGE",
      image: "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 4,
      title: "AI PROMPT #2",
      subtitle: "Cyberpunk Cityscape",
      author: "0xi9j0...k1l2",
      remixCount: 91,
      license: "CC0",
      type: "AI PROMPT",
      image: "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 5,
      title: "MEME #1",
      subtitle: "When Gas Fees Hit",
      author: "0xm3n4...o5p6",
      remixCount: 256,
      license: "PUBLIC",
      type: "MEME",
      image: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 6,
      title: "KNOWLEDGE #1",
      subtitle: "Smart Contracts 101",
      author: "0xq7r8...s9t0",
      remixCount: 34,
      license: "MIT",
      type: "KNOWLEDGE",
      image: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
          EXPLORE <span className="text-pepe-green">REMIXES</span>
        </h2>
        <p className="text-lg text-gray-500">
          Discover the hottest remixable content, stake on your favorites, and watch them battle for the crown! 👑
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exploreCards.map((card) => (
          <ExploreCard key={card.id} {...card} />
        ))}
      </div>
    </div>
  );
};

export default ExploreSection;