import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExploreCard from './ExploreCard';
import FilterTabs, { FilterOption } from './FilterTabs';
import EmptyState from './EmptyState';

interface IPContent {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  remixCount: number;
  license: string;
  type: 'AI PROMPT' | 'MEME' | 'KNOWLEDGE';
  image: string;
  createdAt: string;
  isOwner?: boolean;
}

const ExplorePage = () => {
  const [activeFilter, setActiveFilter] = useState<'trending' | 'latest' | 'mine'>('trending');
  const navigate = useNavigate();

  const filterOptions: FilterOption[] = [
    { key: 'trending', label: 'TRENDING', icon: '🔥' },
    { key: 'latest', label: 'LATEST', icon: '⚡' },
    { key: 'mine', label: 'MINE', icon: '👤' }
  ];

  // Mock data - will be replaced with real onchain data
  const mockIPs: IPContent[] = [
    {
      id: "1",
      title: "AI PROMPT #1",
      subtitle: "Space Cats Adventure",
      author: "0xc4f3...8d92",
      remixCount: 42,
      license: "CC0",
      type: "AI PROMPT",
      image: "https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg?auto=compress&cs=tinysrgb&w=400",
      createdAt: "2024-01-15T10:30:00Z",
      isOwner: false
    },
    {
      id: "2",
      title: "MEME #5",
      subtitle: "Distracted Developer",
      author: "0xa1b2...c3d4",
      remixCount: 128,
      license: "MIT",
      type: "MEME",
      image: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400",
      createdAt: "2024-01-14T15:45:00Z",
      isOwner: true
    },
    {
      id: "3",
      title: "KNOWLEDGE #3",
      subtitle: "DeFi Basics Guide",
      author: "0xe5f6...g7h8",
      remixCount: 73,
      license: "CC BY",
      type: "KNOWLEDGE",
      image: "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400",
      createdAt: "2024-01-13T09:20:00Z",
      isOwner: false
    },
    {
      id: "4",
      title: "AI PROMPT #2",
      subtitle: "Cyberpunk Cityscape",
      author: "0xi9j0...k1l2",
      remixCount: 91,
      license: "CC0",
      type: "AI PROMPT",
      image: "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400",
      createdAt: "2024-01-12T14:15:00Z",
      isOwner: false
    },
    {
      id: "5",
      title: "MEME #1",
      subtitle: "When Gas Fees Hit",
      author: "0xm3n4...o5p6",
      remixCount: 256,
      license: "PUBLIC",
      type: "MEME",
      image: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400",
      createdAt: "2024-01-11T11:30:00Z",
      isOwner: false
    },
    {
      id: "6",
      title: "KNOWLEDGE #1",
      subtitle: "Smart Contracts 101",
      author: "0xq7r8...s9t0",
      remixCount: 34,
      license: "MIT",
      type: "KNOWLEDGE",
      image: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400",
      createdAt: "2024-01-10T16:45:00Z",
      isOwner: true
    }
  ];

  const getFilteredIPs = () => {
    switch (activeFilter) {
      case 'trending':
        return [...mockIPs].sort((a, b) => b.remixCount - a.remixCount);
      case 'latest':
        return [...mockIPs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'mine':
        return mockIPs.filter(ip => ip.isOwner);
      default:
        return mockIPs;
    }
  };

  const filteredIPs = getFilteredIPs();

  const handleCreateIP = () => {
    navigate('/create');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-black text-black mb-4">
          EXPLORE <span className="text-pepe-green">REMIXES</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Discover the hottest remixable content, stake on your favorites, and watch them battle for the crown! 👑
        </p>
      </div>

      {/* Filter Tabs */}
      <FilterTabs
        options={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={(filter) => setActiveFilter(filter as 'trending' | 'latest' | 'mine')}
      />

      {/* Results Count */}
      <div className="text-center mb-8">
        <p className="text-gray-600 font-medium">
          {filteredIPs.length} {activeFilter === 'mine' ? 'IPs created' : 'IPs found'}
        </p>
      </div>

      {/* IP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIPs.map((ip) => (
          <ExploreCard key={ip.id} {...ip} />
        ))}
      </div>

      {/* Empty State */}
      {filteredIPs.length === 0 && (
        <EmptyState
          icon="🤔"
          title={`No ${activeFilter === 'mine' ? 'IPs created' : 'IPs found'}`}
          description={
            activeFilter === 'mine' 
              ? 'Create your first IP to get started!' 
              : 'Be the first to create some amazing content!'
            }
          actionText="🎨 CREATE IP"
          onAction={handleCreateIP}
        />
      )}
    </div>
  );
};

export default ExplorePage; 