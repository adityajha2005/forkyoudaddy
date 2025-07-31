import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllIPs } from '../services/ipService';
import { userService, type User } from '../services/supabase';
import { getPurchasesByBuyer, getPurchasesBySeller, type LicensePurchase } from '../services/licensingService';

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
  totalLicensesPurchased: number;
  totalRevenue: number;
  totalLicenseSales: number;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userIPs, setUserIPs] = useState<IP[]>([]);
  const [userRemixes, setUserRemixes] = useState<IP[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalIPs: 0,
    totalRemixes: 0,
    totalViews: 0,
    averageRemixCount: 0,
    totalLicensesPurchased: 0,
    totalRevenue: 0,
    totalLicenseSales: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'created' | 'remixed' | 'stats' | 'revenue' | 'licenses'>('profile');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [userLicenses, setUserLicenses] = useState<LicensePurchase[]>([]);

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
        
        // Load user profile data
        const profile = await userService.getUser(address);
        setUserProfile(profile);
        
        // Load followers and following
        const followersData = await userService.getFollowers(address);
        const followingData = await userService.getFollowing(address);
        setFollowers(followersData);
        setFollowing(followingData);
        
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
        
        // Calculate revenue from license sales
        const userLicenseSales = getPurchasesBySeller(address);
        const totalRevenue = userLicenseSales.reduce((sum: number, purchase: LicensePurchase) => {
          if (purchase.status === 'completed') {
            return sum + purchase.price;
          }
          return sum;
        }, 0);
        
        const completedSales = userLicenseSales.filter((p: LicensePurchase) => p.status === 'completed');
        
        // Load user's purchased licenses
        const purchasedLicenses = getPurchasesByBuyer(address);
        setUserLicenses(purchasedLicenses);
        
        // Switch to licenses tab if user has licenses
        if (purchasedLicenses.length > 0) {
          setActiveTab('licenses');
        }
        
        setStats({
          totalIPs: createdIPs.length,
          totalRemixes: remixedIPs.length,
          totalViews,
          averageRemixCount,
          mostPopularIP,
          totalLicensesPurchased: purchasedLicenses.length,
          totalRevenue,
          totalLicenseSales: completedSales.length
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

  const getLicenseName = (licenseId: string) => {
    switch (licenseId) {
      case 'personal':
        return 'Personal License';
      case 'commercial':
        return 'Commercial License';
      case 'enterprise':
        return 'Enterprise License';
      case 'exclusive':
        return 'Exclusive License';
      case 'remix':
        return 'Remix License';
      default:
        return licenseId;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-pepe-green text-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                👤 Profile
              </button>
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
              <button
                onClick={() => setActiveTab('revenue')}
                className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                  activeTab === 'revenue'
                    ? 'bg-pepe-green text-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                💰 Revenue
              </button>

              <button
                onClick={() => setActiveTab('licenses')}
                className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                  activeTab === 'licenses'
                    ? 'bg-pepe-green text-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📜 My Licenses ({userLicenses.length})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && userProfile && (
              <div>
                <h3 className="text-xl font-bold text-black mb-6">Your Profile</h3>
                
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-pepe-green to-dank-yellow border-2 border-black rounded-lg p-6 mb-6">
                  <div className="flex items-center space-x-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-black border-4 border-white shadow-lg">
                      {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    
                    {/* Profile Info */}
                    <div className="flex-1">
                      <h2 className="text-3xl font-black text-black mb-2">
                        {userProfile.username || shortenAddress(userProfile.wallet_address)}
                      </h2>
                      <p className="text-gray-700 mb-2">
                        {shortenAddress(userProfile.wallet_address)}
                      </p>
                      {userProfile.bio && (
                        <p className="text-gray-600 italic">"{userProfile.bio}"</p>
                      )}
                    </div>
                    
                    {/* Edit Profile Button */}
                    <button
                      onClick={() => alert('Profile editing coming soon!')}
                      className="bg-white hover:bg-gray-100 text-black font-bold px-6 py-3 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white border-2 border-black rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-pepe-green mb-1">{userProfile.total_ips}</div>
                    <div className="text-sm text-gray-600">IPs Created</div>
                  </div>
                  <div className="bg-white border-2 border-black rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-dank-yellow mb-1">{userProfile.total_remixes}</div>
                    <div className="text-sm text-gray-600">Remixes Made</div>
                  </div>
                  <div className="bg-white border-2 border-black rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500 mb-1">{followers.length}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="bg-white border-2 border-black rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-500 mb-1">{following.length}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>

                {/* Followers and Following */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Followers */}
                  <div className="bg-white border-2 border-black rounded-lg p-4">
                    <h4 className="text-lg font-bold text-black mb-4">👥 Followers ({followers.length})</h4>
                    {followers.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No followers yet. Create great content to attract followers!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {followers.slice(0, 5).map((follower) => (
                          <div key={follower.wallet_address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-pepe-green to-dank-yellow rounded-full flex items-center justify-center text-sm font-bold text-black">
                                {follower.username ? follower.username.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{follower.username || shortenAddress(follower.wallet_address)}</p>
                                <p className="text-xs text-gray-500">{shortenAddress(follower.wallet_address)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/profile/${follower.wallet_address}`)}
                              className="bg-pepe-green hover:bg-green-600 text-black text-xs font-bold px-3 py-1 rounded border transition-colors"
                            >
                              View
                            </button>
                          </div>
                        ))}
                        {followers.length > 5 && (
                          <p className="text-center text-sm text-gray-500">
                            +{followers.length - 5} more followers
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Following */}
                  <div className="bg-white border-2 border-black rounded-lg p-4">
                    <h4 className="text-lg font-bold text-black mb-4">👤 Following ({following.length})</h4>
                    {following.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500">Not following anyone yet. Discover creators to follow!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {following.slice(0, 5).map((followedUser) => (
                          <div key={followedUser.wallet_address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-pepe-green to-dank-yellow rounded-full flex items-center justify-center text-sm font-bold text-black">
                                {followedUser.username ? followedUser.username.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{followedUser.username || shortenAddress(followedUser.wallet_address)}</p>
                                <p className="text-xs text-gray-500">{shortenAddress(followedUser.wallet_address)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/profile/${followedUser.wallet_address}`)}
                              className="bg-dank-yellow hover:bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded border transition-colors"
                            >
                              View
                            </button>
                          </div>
                        ))}
                        {following.length > 5 && (
                          <p className="text-center text-sm text-gray-500">
                            +{following.length - 5} more following
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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

            {activeTab === 'revenue' && (
              <div>
                <h3 className="text-xl font-bold text-black mb-4">💰 Revenue Analytics</h3>
                
                {/* Revenue Overview */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-bold text-green-800 mb-4">Revenue Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border-2 border-green-300 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {stats.totalRevenue.toFixed(3)} CAMP
                      </div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                    <div className="bg-white border-2 border-green-300 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {stats.totalLicenseSales}
                      </div>
                      <div className="text-sm text-gray-600">License Sales</div>
                    </div>
                    <div className="bg-white border-2 border-green-300 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {stats.totalIPs > 0 ? (stats.totalRevenue / stats.totalIPs).toFixed(3) : '0.000'} CAMP
                      </div>
                      <div className="text-sm text-gray-600">Avg Revenue/IP</div>
                    </div>
                  </div>
                </div>

                {/* Revenue by IP */}
                <div className="bg-white border-2 border-black rounded-lg p-6">
                  <h4 className="text-lg font-bold text-black mb-4">Revenue by IP</h4>
                  {userIPs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">💰</div>
                      <h4 className="text-lg font-bold text-gray-600 mb-2">No IPs Created Yet</h4>
                      <p className="text-gray-500">Create IPs to start earning revenue from license sales!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userIPs.map((ip) => {
                        const ipSales = getPurchasesBySeller(walletAddress).filter(
                          (purchase: LicensePurchase) => purchase.ipId === ip.id && purchase.status === 'completed'
                        );
                        const ipRevenue = ipSales.reduce((sum: number, purchase: LicensePurchase) => sum + purchase.price, 0);
                        
                        return (
                          <div key={ip.id} className="border-2 border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getContentTypeIcon(ip.contentType)}</span>
                                <div>
                                  <h5 className="font-bold text-lg">{ip.title}</h5>
                                  <p className="text-sm text-gray-600">{ip.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {ipRevenue.toFixed(3)} CAMP
                                </div>
                                <div className="text-sm text-gray-500">
                                  {ipSales.length} sales
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>License: {ip.license}</span>
                              <span>Created: {new Date(ip.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'licenses' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-black">📜 My Purchased Licenses</h3>
                  <button
                    onClick={() => navigate('/licenses')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg border-2 border-black transition-colors"
                  >
                    📋 View All Licenses
                  </button>
                </div>
                
                {userLicenses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📜</div>
                    <h4 className="text-lg font-bold text-gray-600 mb-2">No Licenses Purchased Yet</h4>
                    <p className="text-gray-500 mb-4">Purchase licenses from the Explore page to access premium content!</p>
                    <button
                      onClick={() => navigate('/explore')}
                      className="bg-pepe-green hover:bg-green-600 text-black font-bold px-6 py-3 rounded-lg border-2 border-black transition-colors"
                    >
                      🛒 Browse IPs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userLicenses.map((license) => (
                      <div key={license.id} className="bg-white border-2 border-black rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-pepe-green rounded-lg flex items-center justify-center text-2xl">
                              📜
                            </div>
                            <div>
                              <h5 className="font-bold text-lg">License #{license.id.slice(-8)}</h5>
                              <p className="text-sm text-gray-600">IP: {license.ipId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {license.price.toFixed(3)} CAMP
                            </div>
                            <div className={`text-sm px-2 py-1 rounded-full ${
                              license.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {license.status}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">License Type:</span>
                            <div className="font-medium">{getLicenseName(license.licenseId)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Purchase Date:</span>
                            <div className="font-medium">{new Date(license.purchaseDate).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Usage Count:</span>
                            <div className="font-medium">{license.usageCount}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Transaction:</span>
                            <div className="font-medium text-xs">
                              {license.transactionHash ? 
                                `${license.transactionHash.slice(0, 6)}...${license.transactionHash.slice(-4)}` : 
                                'N/A'
                              }
                            </div>
                          </div>
                        </div>
                        
                        {license.expiryDate && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm text-blue-800">
                              <strong>Expires:</strong> {new Date(license.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 