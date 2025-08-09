import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExploreCard from './ExploreCard';
import FilterTabs, { FilterOption } from './FilterTabs';
import EmptyState from './EmptyState';
import { getTrendingIPs, getTopEarningIPs, isDemoMode } from '../utils/demoSetup';

interface IPContent {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  remixCount: number;
  license: string;
  type: 'AI PROMPT' | 'MEME' | 'KNOWLEDGE' | 'ART' | 'AUDIO' | 'VIDEO';
  image: string;
  createdAt: string;
  isOwner?: boolean;
  revenue?: string;
  trending?: boolean;
  views?: number;
  likes?: number;
  parentId?: string;
  originalIP?: {
    id: string;
    title: string;
    author: string;
    type: string;
  };
}

const ExplorePage = () => {
  const [activeFilter, setActiveFilter] = useState<'trending' | 'latest' | 'mine'>('trending');
  const [demoIPs, setDemoIPs] = useState<IPContent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const filterOptions: FilterOption[] = [
    { key: 'trending', label: 'TRENDING', icon: '🔥' },
    { key: 'latest', label: 'LATEST', icon: '⚡' },
    { key: 'mine', label: 'MINE', icon: '👤' }
  ];

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    try {
      setLoading(true);
      
      // Load demo IPs from localStorage
      const storedIPs = localStorage.getItem('forkyoudaddy_ips');
      if (storedIPs && isDemoMode()) {
        const ips = JSON.parse(storedIPs);
        const formattedIPs: IPContent[] = ips.map((ip: any) => {
          // Find original IP if this is a remix
          let originalIP = undefined;
          if (ip.parentId) {
            const original = ips.find((originalIp: any) => originalIp.id === ip.parentId);
            if (original) {
              originalIP = {
                id: original.id,
                title: original.title,
                author: original.author,
                type: getContentType(original.contentType)
              };
            }
          }

          return {
            id: ip.id,
            title: ip.title,
            subtitle: ip.description,
            author: ip.author,
            remixCount: ip.remixCount,
            license: ip.license,
            type: getContentType(ip.contentType),
            image: getImageForType(ip.contentType, ip.category),
            createdAt: ip.createdAt,
            isOwner: ip.author === '0xAlice1234567890abcdef',
            revenue: ip.revenue,
            trending: ip.trending,
            views: ip.views,
            likes: ip.likes,
            parentId: ip.parentId,
            originalIP
          };
        });
        setDemoIPs(formattedIPs);
      } else {
        // Fallback to mock data
        setDemoIPs(mockIPs);
      }
    } catch (error) {
      console.error('Error loading demo data:', error);
      setDemoIPs(mockIPs);
    } finally {
      setLoading(false);
    }
  };

  const getContentType = (contentType: string): IPContent['type'] => {
    switch (contentType) {
      case 'text':
        return 'KNOWLEDGE';
      case 'image':
        return 'ART';
      case 'audio':
        return 'AUDIO';
      case 'video':
        return 'VIDEO';
      default:
        return 'ART';
    }
  };

  const getImageForType = (contentType: string, category: string) => {
    const images = {
      'Art': "https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg?auto=compress&cs=tinysrgb&w=400",
      'Education': "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400",
      'Music': "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400",
      'default': "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400"
    };
    
    return images[category as keyof typeof images] || images.default;
  };

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
    const ips = demoIPs.length > 0 ? demoIPs : mockIPs;
    
    switch (activeFilter) {
      case 'trending':
        return [...ips].sort((a, b) => {
          // Sort by trending status first, then by remix count
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return b.remixCount - a.remixCount;
        });
      case 'latest':
        return [...ips].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'mine':
        return ips.filter(ip => ip.isOwner);
      default:
        return ips;
    }
  };

  const filteredIPs = getFilteredIPs();

  const handleCreateIP = () => {
    navigate('/create');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pepe-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amazing content...</p>
        </div>
      </div>
    );
  }

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

      {/* Live Stats Banner */}
      {isDemoMode() && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-4 rounded-lg border-2 border-black">
            <div className="flex items-center justify-center space-x-8 text-center">
              <div>
                <div className="text-2xl font-black">5.2 ETH</div>
                <div className="text-sm">Total Revenue</div>
              </div>
              <div>
                <div className="text-2xl font-black">479</div>
                <div className="text-sm">Total Remixes</div>
              </div>
              <div>
                <div className="text-2xl font-black">1,250</div>
                <div className="text-sm">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-black">8</div>
                <div className="text-sm">Trending IPs</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          {isDemoMode() && (
            <span className="ml-2 text-pepe-green font-bold">
              • Demo Mode Active
            </span>
          )}
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

      {/* Demo Mode Notice */}
      {isDemoMode() && (
        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 inline-block">
            <p className="text-yellow-800 font-medium">
              🧪 Demo Mode: Showing impressive demo data for hackathon presentation
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage; 