import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAllIPs } from '../services/ipService';

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
}

const ExplorePage = () => {
  const navigate = useNavigate();
  const [ips, setIps] = useState<IP[]>([]);
  const [filteredIps, setFilteredIps] = useState<IP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [selectedLicense, setSelectedLicense] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load IPs with better error handling and caching
  const loadIPs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const realIPs = await getAllIPs();
      setIps(realIPs);
      setFilteredIps(realIPs);
    } catch (error) {
      console.error('Error loading IPs:', error);
      setError('Failed to load IPs. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load IPs on component mount
  useEffect(() => {
    loadIPs();
  }, [loadIPs]);

  // Filter IPs based on selected filters with debouncing
  useEffect(() => {
    const filterIPs = () => {
      let filtered = ips;

      // Filter by content type
      if (selectedContentType !== 'all') {
        filtered = filtered.filter(ip => ip.contentType === selectedContentType);
      }

      // Filter by license
      if (selectedLicense !== 'all') {
        filtered = filtered.filter(ip => ip.license === selectedLicense);
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(ip => 
          ip.title.toLowerCase().includes(searchLower) ||
          ip.description.toLowerCase().includes(searchLower) ||
          ip.author.toLowerCase().includes(searchLower)
        );
      }

      setFilteredIps(filtered);
    };

    // Debounce the filtering to avoid excessive re-renders
    const timeoutId = setTimeout(filterIPs, 150);
    return () => clearTimeout(timeoutId);
  }, [ips, selectedContentType, selectedLicense, searchTerm]);

  const handleRemix = (ip: IP) => {
    // Navigate to remix page with IP data
    navigate('/remix', { 
      state: { 
        originalIP: ip,
        mode: 'remix'
      } 
    });
  };

  const handleView = (ip: IP) => {
    // Navigate to remix page in view mode
    navigate('/remix', { 
      state: { 
        originalIP: ip,
        mode: 'view'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleRefresh = () => {
    loadIPs();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pepe-green mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading IPs...</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-black mb-4">
                  EXPLORE IPs
                </h1>
                <p className="text-lg text-gray-600">
                  Discover and remix the hottest content on the platform! 🍴
                </p>
              </div>
              {error && (
                <button
                  onClick={handleRefresh}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-black transition-colors duration-200"
                >
                  🔄 Retry
                </button>
              )}
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white border-2 border-black rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  SEARCH
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search IPs..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none"
                />
              </div>

              {/* Content Type Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  CONTENT TYPE
                </label>
                <select
                  value={selectedContentType}
                  onChange={(e) => setSelectedContentType(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                </select>
              </div>

              {/* License Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  LICENSE
                </label>
                <select
                  value={selectedLicense}
                  onChange={(e) => setSelectedLicense(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none"
                >
                  <option value="all">All Licenses</option>
                  <option value="MIT">MIT</option>
                  <option value="CC-BY-SA">CC-BY-SA</option>
                  <option value="CC-BY">CC-BY</option>
                </select>
              </div>

              {/* Results Count */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  RESULTS
                </label>
                <div className="px-4 py-2 bg-gray-100 rounded-lg text-center font-bold">
                  {filteredIps.length} IPs
                </div>
              </div>
            </div>
          </div>

          {/* IP Grid */}
          {filteredIps.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">No IPs Found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIps.map((ip) => (
                <div key={ip.id} className="bg-white border-2 border-black rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* IP Header */}
                  <div className="p-6 border-b-2 border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getContentTypeIcon(ip.contentType)}</span>
                        <h3 className="text-lg font-bold text-black line-clamp-2">
                          {ip.title}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${getLicenseColor(ip.license)}`}>
                        {ip.license}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {ip.description}
                    </p>

                    {/* Content Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">Content Preview:</div>
                      {ip.contentType === 'image' ? (
                        <div>
                          <img 
                            src={`https://ipfs.io/ipfs/${ip.cid}`}
                            alt={ip.title}
                            className="w-full h-32 object-cover rounded border border-gray-300"
                            onError={(e) => {
                              // Fallback to text if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden text-sm text-gray-700 font-mono mt-2 line-clamp-2">
                            {ip.content}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700 font-mono line-clamp-2">
                          {ip.content}
                        </div>
                      )}
                    </div>

                    {/* IP Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <a 
                          href={`https://explorer.campnetwork.xyz/address/${ip.author}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          By {shortenAddress(ip.author)}
                        </a>
                        <span>{formatDate(ip.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🍴</span>
                        <span className="font-bold">{ip.remixCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 bg-gray-50">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRemix(ip)}
                        className="flex-1 bg-pepe-green hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg border-2 border-black transition-colors duration-200"
                      >
                        🍴 REMIX
                      </button>
                      <button
                        onClick={() => handleView(ip)}
                        className="flex-1 bg-dank-yellow hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg border-2 border-black transition-colors duration-200"
                      >
                        👁️ VIEW
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage; 