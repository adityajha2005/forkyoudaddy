import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, ipService, type User, type IP } from '../services/supabase';

interface UserProfileProps {
  currentUserAddress?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUserAddress }) => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userIPs, setUserIPs] = useState<IP[]>([]);
  const [userRemixes, setUserRemixes] = useState<IP[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ips' | 'remixes' | 'followers' | 'following'>('ips');

  const userAddress = address || currentUserAddress;

  useEffect(() => {
    if (!userAddress) return;
    
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Load user data
        const userData = await userService.getUser(userAddress);
        setUser(userData);
        
        // Load user's IPs
        const ips = await ipService.getIPsByAuthor(userAddress);
        setUserIPs(ips.filter(ip => !ip.parent_id)); // Only original IPs, not remixes
        
        // Load user's remixes
        const allIPs = await ipService.getAllIPs();
        const remixes = allIPs.filter(ip => ip.author_address === userAddress && ip.parent_id);
        setUserRemixes(remixes);
        
        // Load followers and following
        const followersData = await userService.getFollowers(userAddress);
        const followingData = await userService.getFollowing(userAddress);
        setFollowers(followersData);
        setFollowing(followingData);
        
        // Check if current user is following this user
        if (currentUserAddress && currentUserAddress !== userAddress) {
          const followingStatus = await userService.isFollowing(currentUserAddress, userAddress);
          setIsFollowing(followingStatus);
        }
        
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [userAddress, currentUserAddress]);

  const handleFollow = async () => {
    if (!currentUserAddress || !userAddress) return;
    
    try {
      if (isFollowing) {
        await userService.unfollowUser(currentUserAddress, userAddress);
        setIsFollowing(false);
        // Update followers count
        setFollowers(prev => prev.filter(f => f.wallet_address !== currentUserAddress));
      } else {
        await userService.followUser(currentUserAddress, userAddress);
        setIsFollowing(true);
        // Add current user to followers
        const currentUser = await userService.getUser(currentUserAddress);
        setFollowers(prev => [currentUser, ...prev]);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      alert('Failed to follow/unfollow user');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pepe-green mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading user profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
              <p className="mt-2 text-gray-600">The user you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* User Header */}
          <div className="bg-white border-2 border-black rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-pepe-green to-dank-yellow rounded-full flex items-center justify-center text-2xl font-bold text-black">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                
                {/* User Info */}
                <div>
                  <h1 className="text-3xl font-black text-black mb-2">
                    {user.username || formatAddress(user.wallet_address)}
                  </h1>
                  <p className="text-gray-600 mb-2">
                    {formatAddress(user.wallet_address)}
                  </p>
                  {user.bio && (
                    <p className="text-gray-700 mb-4">{user.bio}</p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pepe-green">{user.total_ips}</div>
                      <div className="text-sm text-gray-600">IPs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-dank-yellow">{user.total_remixes}</div>
                      <div className="text-sm text-gray-600">Remixes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{followers.length}</div>
                      <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">{following.length}</div>
                      <div className="text-sm text-gray-600">Following</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Follow Button */}
              {currentUserAddress && currentUserAddress !== user.wallet_address && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-3 rounded-lg font-bold border-2 border-black transition-all duration-200 transform hover:scale-105 ${
                    isFollowing
                      ? 'bg-gray-500 hover:bg-gray-600 text-white'
                      : 'bg-pepe-green hover:bg-green-600 text-black'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-2 border-black rounded-lg shadow-lg mb-8">
            <div className="flex border-b-2 border-black">
              <button
                onClick={() => setActiveTab('ips')}
                className={`flex-1 py-4 px-6 font-bold transition-colors ${
                  activeTab === 'ips'
                    ? 'bg-pepe-green text-black'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                IPs ({userIPs.length})
              </button>
              <button
                onClick={() => setActiveTab('remixes')}
                className={`flex-1 py-4 px-6 font-bold transition-colors ${
                  activeTab === 'remixes'
                    ? 'bg-dank-yellow text-black'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Remixes ({userRemixes.length})
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 py-4 px-6 font-bold transition-colors ${
                  activeTab === 'followers'
                    ? 'bg-blue-400 text-black'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Followers ({followers.length})
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-4 px-6 font-bold transition-colors ${
                  activeTab === 'following'
                    ? 'bg-purple-400 text-black'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Following ({following.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'ips' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userIPs.map((ip) => (
                    <div key={ip.id} className="bg-gray-50 border-2 border-black rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/remix/${ip.id}`)}>
                      <h3 className="font-bold text-lg mb-2">{ip.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{ip.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="bg-pepe-green text-black px-2 py-1 rounded font-bold">
                          {ip.remix_count} remixes
                        </span>
                        <span className="text-gray-500">
                          {new Date(ip.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {userIPs.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No IPs created yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'remixes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userRemixes.map((remix) => (
                    <div key={remix.id} className="bg-gray-50 border-2 border-black rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/remix/${remix.id}`)}>
                      <h3 className="font-bold text-lg mb-2">{remix.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{remix.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="bg-dank-yellow text-black px-2 py-1 rounded font-bold">
                          Remix
                        </span>
                        <span className="text-gray-500">
                          {new Date(remix.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {userRemixes.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No remixes created yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'followers' && (
                <div className="space-y-4">
                  {followers.map((follower) => (
                    <div key={follower.wallet_address} className="flex items-center justify-between p-4 bg-gray-50 border-2 border-black rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pepe-green to-dank-yellow rounded-full flex items-center justify-center font-bold text-black">
                          {follower.username ? follower.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h3 className="font-bold">{follower.username || formatAddress(follower.wallet_address)}</h3>
                          <p className="text-sm text-gray-600">{formatAddress(follower.wallet_address)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/profile/${follower.wallet_address}`)}
                        className="bg-pepe-green hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg border-2 border-black transition-all duration-200"
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
                  {followers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No followers yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'following' && (
                <div className="space-y-4">
                  {following.map((followedUser) => (
                    <div key={followedUser.wallet_address} className="flex items-center justify-between p-4 bg-gray-50 border-2 border-black rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pepe-green to-dank-yellow rounded-full flex items-center justify-center font-bold text-black">
                          {followedUser.username ? followedUser.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h3 className="font-bold">{followedUser.username || formatAddress(followedUser.wallet_address)}</h3>
                          <p className="text-sm text-gray-600">{formatAddress(followedUser.wallet_address)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/profile/${followedUser.wallet_address}`)}
                        className="bg-dank-yellow hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg border-2 border-black transition-all duration-200"
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
                  {following.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Not following anyone yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 