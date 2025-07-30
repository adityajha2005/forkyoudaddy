import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAllIPs } from '../services/ipService';
import { userService } from '../services/supabase';

interface IP {
  id: string;
  title: string;
  description: string;
  content: string;
  contentType: 'text' | 'image';
  license: string;
  author: string;
  createdAt: string;
  remixCount: number;
  cid: string;
  contentURI: string;
  parentId?: string;
}

interface UserStats {
  totalIPs: number;
  totalRemixes: number;
  totalViews: number;
  averageRemixCount: number;
  mostPopularIP?: IP;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userIPs, setUserIPs] = useState<IP[]>([]);
  const [userRemixes, setUserRemixes] = useState<IP[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalIPs: 0,
    totalRemixes: 0,
    totalViews: 0,
    averageRemixCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'created' | 'remixed' | 'stats'>('created');
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Get current wallet address
        const address = window.ethereum?.selectedAddress;
        if (!address) {
          alert('Please connect your wallet to view your dashboard');
          navigate('/explore');
          return;
        }
        
        setWalletAddress(address);
        
        // Load all IPs
        const allIPs = await getAllIPs();
        
        // Filter user's created IPs
        const createdIPs = allIPs.filter(ip => ip.author === address);
        setUserIPs(createdIPs);
        
        // Filter user's remixed IPs (IPs with parent_id that user created)
        const userCreatedIPIds = createdIPs.map(ip => ip.id);
        const remixedIPs = allIPs.filter(ip => 
          ip.parentId && userCreatedIPIds.includes(ip.parentId)
        );
        setUserRemixes(remixedIPs);
        
        // Calculate statistics
        const totalViews = createdIPs.reduce((sum, ip) => sum + (ip.remixCount || 0), 0);
        const averageRemixCount = createdIPs.length > 0 ? totalViews / createdIPs.length : 0;
        const mostPopularIP = createdIPs.reduce((max, ip) => 
          (ip.remixCount || 0) > (max?.remixCount || 0) ? ip : max
        , undefined as IP | undefined);
        
        setStats({
          totalIPs: createdIPs.length,
          totalRemixes: remixedIPs.length,
          totalViews,
          averageRemixCount,
          mostPopularIP
        });
        
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [navigate]);

  const handleViewIP = (ip: IP) => {
    navigate('/remix', { 
      state: { 
        originalIP: ip,
        mode: 'view'
      } 
    });
  };

  const handleRemixIP = (ip: IP) => {
    navigate('/remix', { 
      state: { 
        originalIP: ip,
        mode: 'remix'
      } 
    });
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const getLicenseColor = (license: string) => {
    switch (license) {
      case 'MIT':
        return 'bg-green-100 text-green-800';
      case 'CC-BY-SA':
        return 'bg-blue-100 text-blue-800';
      case 'CC-BY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pepe-green mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-black mb-4">
              👤 USER DASHBOARD
            </h1>
            <p className="text-lg text-gray-600">
              Manage your IPs and track your creative journey
            </p>
            <div className="mt-4 p-4 bg-white border-2 border-black rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Wallet:</strong> {shortenAddress(walletAddress)}
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-pepe-green mb-2">{stats.totalIPs}</div>
              <div className="text-sm text-gray-600">IPs Created</div>
            </div>
            <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalRemixes}</div>
              <div className="text-sm text-gray-600">IPs Remixed</div>
            </div>
            <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalViews}</div>
              <div className="text-sm text-gray-600">Total Remixes</div>
            </div>
            <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.averageRemixCount.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Remixes/IP</div>
            </div>
          </div>

          {/* Most Popular IP */}
          {stats.mostPopularIP && (
            <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-black mb-4">🏆 Most Popular IP</h3>
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{getContentTypeIcon(stats.mostPopularIP.contentType)}</span>
                <div className="flex-1">
                  <h4 className="text-lg font-bold">{stats.mostPopularIP.title}</h4>
                  <p className="text-gray-600 text-sm">{stats.mostPopularIP.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">
                      {new Date(stats.mostPopularIP.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-bold text-pepe-green">
                      🍴 {stats.mostPopularIP.remixCount} remixes
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleViewIP(stats.mostPopularIP!)}
                  className="bg-pepe-green hover:bg-green-600 text-black font-bold px-4 py-2 rounded border-2 border-black transition-colors"
                >
                  👁️ VIEW
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('created')}
                className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                  activeTab === 'created'
                    ? 'bg-pepe-green text-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📝 Created IPs ({userIPs.length})
              </button>
              <button
                onClick={() => setActiveTab('remixed')}
                className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                  activeTab === 'remixed'
                    ? 'bg-pepe-green text-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🍴 Remixed IPs ({userRemixes.length})
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                  activeTab === 'stats'
                    ? 'bg-pepe-green text-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📊 Statistics
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'created' && (
              <div>
                <h3 className="text-xl font-bold text-black mb-4">Your Created IPs</h3>
                {userIPs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📝</div>
                    <h4 className="text-lg font-bold text-gray-600 mb-2">No IPs Created Yet</h4>
                    <p className="text-gray-500 mb-4">Start creating amazing content!</p>
                    <button
                      onClick={() => navigate('/create')}
                      className="bg-pepe-green hover:bg-green-600 text-black font-bold px-6 py-3 rounded-lg border-2 border-black transition-colors"
                    >
                      🎨 CREATE YOUR FIRST IP
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userIPs.map((ip) => (
                      <div key={ip.id} className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getContentTypeIcon(ip.contentType)}</span>
                            <h4 className="text-lg font-bold line-clamp-2">{ip.title}</h4>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold rounded ${getLicenseColor(ip.license)}`}>
                            {ip.license}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ip.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            🍴 {ip.remixCount} remixes
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewIP(ip)}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded border transition-colors"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleRemixIP(ip)}
                              className="bg-pepe-green hover:bg-green-600 text-black text-xs font-bold px-3 py-1 rounded border transition-colors"
                            >
                              🍴
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'remixed' && (
              <div>
                <h3 className="text-xl font-bold text-black mb-4">IPs That Remixed Your Content</h3>
                {userRemixes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🍴</div>
                    <h4 className="text-lg font-bold text-gray-600 mb-2">No Remixes Yet</h4>
                    <p className="text-gray-500">When others remix your IPs, they'll appear here!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userRemixes.map((ip) => (
                      <div key={ip.id} className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getContentTypeIcon(ip.contentType)}</span>
                            <h4 className="text-lg font-bold line-clamp-2">{ip.title}</h4>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold rounded ${getLicenseColor(ip.license)}`}>
                            {ip.license}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ip.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            By {shortenAddress(ip.author)}
                          </span>
                          <button
                            onClick={() => handleViewIP(ip)}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded border transition-colors"
                          >
                            👁️ VIEW
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h3 className="text-xl font-bold text-black mb-4">Detailed Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                    <h4 className="text-lg font-bold mb-4">📊 Content Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Text IPs:</span>
                        <span className="font-bold">
                          {userIPs.filter(ip => ip.contentType === 'text').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Image IPs:</span>
                        <span className="font-bold">
                          {userIPs.filter(ip => ip.contentType === 'image').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Remixes:</span>
                        <span className="font-bold">{stats.totalViews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Remixes/IP:</span>
                        <span className="font-bold">{stats.averageRemixCount.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                    <h4 className="text-lg font-bold mb-4">🎯 Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Most Popular IP:</span>
                        <span className="font-bold">
                          {stats.mostPopularIP ? stats.mostPopularIP.remixCount : 0} remixes
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Since:</span>
                        <span className="font-bold">
                          {userIPs.length > 0 
                            ? new Date(userIPs[userIPs.length - 1].createdAt).toLocaleDateString()
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latest Activity:</span>
                        <span className="font-bold">
                          {userIPs.length > 0 
                            ? new Date(userIPs[0].createdAt).toLocaleDateString()
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 