import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TagDisplay from '../components/TagDisplay';
import LicensePurchaseButton from '../components/LicensePurchaseButton';
import LicenseAccessVerifier from '../components/LicenseAccessVerifier';
import { getAllIPs } from '../services/ipService';
import { userService } from '../services/supabase';
import { CATEGORIES, POPULAR_TAGS, getTagColor } from '../constants/tags';
import { generateContentSuggestions } from '../services/aiService';

// Helper function to safely convert token ID to BigInt
const safeTokenIdToBigInt = (tokenId: string | undefined): bigint | undefined => {
  if (!tokenId) return undefined;
  
  try {
    // Remove any non-numeric characters and convert to BigInt
    const cleanTokenId = tokenId.replace(/[^0-9]/g, '');
    if (cleanTokenId) {
      return BigInt(cleanTokenId);
    }
    return undefined;
  } catch (error) {
    console.warn('Failed to convert token ID to BigInt:', tokenId, error);
    return undefined;
  }
};

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
  tags?: string[];
  category?: string;
  commentCount?: number;
  originTokenId?: string; // Token ID on Origin protocol
}

interface SearchFilters {
  searchTerm: string;
  contentType: string;
  license: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  dateRange: string;
  minRemixCount: number;
  authorFilter: string;
  isRemix: boolean | null;
  selectedTags: string[];
  selectedCategory: string;
}

const ExplorePage = () => {
  const navigate = useNavigate();
  const [ips, setIps] = useState<IP[]>([]);
  const [filteredIps, setFilteredIps] = useState<IP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    contentType: 'all',
    license: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    dateRange: 'all',
    minRemixCount: 0,
    authorFilter: '',
    isRemix: null,
    selectedTags: [],
    selectedCategory: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [aiSearchSuggestions, setAiSearchSuggestions] = useState<string[]>([]);
  const [isGeneratingAISuggestions, setIsGeneratingAISuggestions] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [currentUserAddress, setCurrentUserAddress] = useState<string | undefined>('');

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

  // Load current user and following status
  useEffect(() => {
    const loadUserData = async () => {

      
      if (window.ethereum?.selectedAddress) {
        const address = window.ethereum.selectedAddress;

        setCurrentUserAddress(address);
        
        try {
          const following = await userService.getFollowing(address);
          const followingSet = new Set(following.map(user => user.wallet_address));
          setFollowingUsers(followingSet);
        } catch (error) {
          console.error('Error loading following users:', error);
        }
      } else {

        setCurrentUserAddress(undefined);
      }
    };
    
    loadUserData();
  }, []);

  // Advanced filtering and sorting
  useEffect(() => {
    const filterAndSortIPs = () => {
      let filtered = [...ips];

      // Filter by search term
      if (filters.searchTerm.trim()) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(ip => 
          ip.title.toLowerCase().includes(searchLower) ||
          ip.description.toLowerCase().includes(searchLower) ||
          ip.author.toLowerCase().includes(searchLower) ||
          ip.content.toLowerCase().includes(searchLower)
        );
      }

      // Filter by content type
      if (filters.contentType !== 'all') {
        filtered = filtered.filter(ip => ip.contentType === filters.contentType);
      }

      // Filter by license
      if (filters.license !== 'all') {
        filtered = filtered.filter(ip => ip.license === filters.license);
      }

      // Filter by author
      if (filters.authorFilter.trim()) {
        const authorLower = filters.authorFilter.toLowerCase();
        filtered = filtered.filter(ip => 
          ip.author.toLowerCase().includes(authorLower)
        );
      }

      // Filter by remix status
      if (filters.isRemix !== null) {
        if (filters.isRemix) {
          filtered = filtered.filter(ip => ip.parentId);
        } else {
          filtered = filtered.filter(ip => !ip.parentId);
        }
      }

      // Filter by minimum remix count
      if (filters.minRemixCount > 0) {
        filtered = filtered.filter(ip => ip.remixCount >= filters.minRemixCount);
      }

      // Filter by date range
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const cutoffDate = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            cutoffDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        filtered = filtered.filter(ip => new Date(ip.createdAt) >= cutoffDate);
      }

      // Filter by category
      if (filters.selectedCategory && filters.selectedCategory !== 'all') {
        filtered = filtered.filter(ip => ip.category === filters.selectedCategory);
      }

      // Filter by tags
      if (filters.selectedTags.length > 0) {
        filtered = filtered.filter(ip => {
          if (!ip.tags || ip.tags.length === 0) return false;
          return filters.selectedTags.some(selectedTag => 
            ip.tags!.includes(selectedTag)
          );
        });
      }

      // Sort results
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'author':
            aValue = a.author.toLowerCase();
            bValue = b.author.toLowerCase();
            break;
          case 'remixCount':
            aValue = a.remixCount;
            bValue = b.remixCount;
            break;
          case 'createdAt':
          default:
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
        }
        
        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setFilteredIps(filtered);
    };

    // Debounce the filtering to avoid excessive re-renders
    const timeoutId = setTimeout(filterAndSortIPs, 150);
    return () => clearTimeout(timeoutId);
  }, [ips, filters]);

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

  const handleAccessGranted = () => {
    // Access granted - user can proceed
    
  };

  const handleAccessDenied = () => {
    // Access denied - show purchase prompt
    
  };

  const handleFollow = async (authorAddress: string) => {
    if (!currentUserAddress) {
      alert('Please connect your wallet to follow users');
      return;
    }

    try {
      if (followingUsers.has(authorAddress)) {
        await userService.unfollowUser(currentUserAddress, authorAddress);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(authorAddress);
          return newSet;
        });
      } else {
        await userService.followUser(currentUserAddress, authorAddress);
        setFollowingUsers(prev => new Set([...prev, authorAddress]));
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      alert('Failed to follow/unfollow user');
    }
  };

  const handleViewProfile = (authorAddress: string) => {
    navigate(`/profile/${authorAddress}`);
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

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      contentType: 'all',
      license: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      dateRange: 'all',
      minRemixCount: 0,
      authorFilter: '',
      isRemix: null,
      selectedTags: [],
      selectedCategory: ''
    });
  };

  const handleSearch = (term: string) => {
    updateFilter('searchTerm', term);
    if (term.trim() && !searchHistory.includes(term)) {
      setSearchHistory(prev => [term, ...prev.slice(0, 4)]);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.contentType !== 'all') count++;
    if (filters.license !== 'all') count++;
    if (filters.authorFilter) count++;
    if (filters.isRemix !== null) count++;
    if (filters.minRemixCount > 0) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.selectedCategory && filters.selectedCategory !== 'all') count++;
    if (filters.selectedTags.length > 0) count++;
    return count;
  };

  // AI-powered search suggestions
  const generateAISearchSuggestions = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 3) {
      setAiSearchSuggestions([]);
      return;
    }

    setIsGeneratingAISuggestions(true);
    try {
      // Add ForkYouDaddy context to search
      const enhancedSearchTerm = `ForkYouDaddy platform search: ${searchTerm}`;
      const result = await generateContentSuggestions(enhancedSearchTerm, 'text');
      if (result.success && result.suggestions.length > 0) {
        // Extract search suggestions from AI content
        const suggestions = result.suggestions.map(suggestion => {
          const words = suggestion.content.split(' ');
          return words.slice(0, 3).join(' '); // Take first 3 words as suggestion
        }).filter(suggestion => suggestion.length > 0);
        
        setAiSearchSuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
      } else {
        setAiSearchSuggestions([]);
      }
    } catch (error) {
      console.error('AI search suggestions failed:', error);
      setAiSearchSuggestions([]);
    } finally {
      setIsGeneratingAISuggestions(false);
    }
  };

  // Generate AI suggestions when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateAISearchSuggestions(filters.searchTerm);
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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

          {/* Advanced Search & Filters */}
          <div className="bg-white border-2 border-black rounded-lg shadow-lg p-6 mb-8">
            {/* Search Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-bold text-black">🔍 ADVANCED SEARCH</h3>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-pepe-green text-black px-3 py-1 rounded-full text-sm font-bold">
                    {getActiveFiltersCount()} active filters
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="bg-gray-100 hover:bg-gray-200 text-black font-bold px-4 py-2 rounded-lg border-2 border-black transition-colors"
                >
                  {showAdvancedFilters ? '🔽' : '🔼'} ADVANCED
                </button>
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg border-2 border-black transition-colors"
                  >
                    🗑️ CLEAR
                  </button>
                )}
              </div>
            </div>

            {/* Main Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search IPs by title, description, content, or author..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none text-lg"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
              
              {/* Search History */}
              {searchHistory.length > 0 && filters.searchTerm === '' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(term)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm border transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}

              {/* AI Search Suggestions */}
              {aiSearchSuggestions.length > 0 && filters.searchTerm.length >= 3 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-600">🤖 AI Suggestions:</span>
                    {isGeneratingAISuggestions && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiSearchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(suggestion)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {/* Content Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">TYPE</label>
                <select
                  value={filters.contentType}
                  onChange={(e) => updateFilter('contentType', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="text">📝 Text</option>
                  <option value="image">🖼️ Image</option>
                </select>
              </div>

              {/* License */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">LICENSE</label>
                <select
                  value={filters.license}
                  onChange={(e) => updateFilter('license', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none text-sm"
                >
                  <option value="all">All Licenses</option>
                  <option value="MIT">MIT</option>
                  <option value="CC-BY-SA">CC-BY-SA</option>
                  <option value="CC-BY">CC-BY</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">SORT BY</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none text-sm"
                >
                  <option value="createdAt">Date</option>
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="remixCount">Popularity</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ORDER</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => updateFilter('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none text-sm"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">DATE</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilter('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Remix Status */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">STATUS</label>
                <select
                  value={filters.isRemix === null ? 'all' : filters.isRemix ? 'remix' : 'original'}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateFilter('isRemix', value === 'all' ? null : value === 'remix');
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none text-sm"
                >
                  <option value="all">All IPs</option>
                  <option value="original">Original Only</option>
                  <option value="remix">Remixes Only</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">CATEGORY</label>
                <select
                  value={filters.selectedCategory}
                  onChange={(e) => updateFilter('selectedCategory', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none text-sm"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="border-t-2 border-gray-200 pt-6">
                <h4 className="text-lg font-bold text-black mb-4">🔧 ADVANCED FILTERS</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Author Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">AUTHOR</label>
                    <input
                      type="text"
                      value={filters.authorFilter}
                      onChange={(e) => updateFilter('authorFilter', e.target.value)}
                      placeholder="Filter by author address..."
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none"
                    />
                  </div>

                  {/* Minimum Remix Count */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">MIN REMIXES</label>
                    <input
                      type="number"
                      value={filters.minRemixCount}
                      onChange={(e) => updateFilter('minRemixCount', parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="0"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none"
                    />
                  </div>

                  {/* Results Count */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">RESULTS</label>
                    <div className="px-4 py-2 bg-gray-100 rounded-lg text-center font-bold text-lg">
                      {filteredIps.length} IPs
                    </div>
                  </div>
                </div>

                {/* Tag Selection */}
                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">🏷️ TAGS</label>
                  
                  {/* Selected Tags */}
                  {filters.selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {filters.selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}
                        >
                          #{tag}
                          <button
                            onClick={() => {
                              const newTags = filters.selectedTags.filter(t => t !== tag);
                              updateFilter('selectedTags', newTags);
                            }}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Popular Tags */}
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.slice(0, 30).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (filters.selectedTags.includes(tag)) {
                            const newTags = filters.selectedTags.filter(t => t !== tag);
                            updateFilter('selectedTags', newTags);
                          } else {
                            updateFilter('selectedTags', [...filters.selectedTags, tag]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          filters.selectedTags.includes(tag)
                            ? `${getTagColor(tag)} ring-2 ring-pepe-green`
                            : `${getTagColor(tag)} hover:opacity-80`
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
                    <div className="flex items-center justify-between text-xs text-gray-500">
                     </div>
                    {/* Content Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">Content Preview:</div>
                      {ip.contentType === 'image' ? (
                        <div>
                          <img 
                            src={ip.content}
                            alt={ip.title}
                            className="w-full h-32 object-cover rounded border border-gray-300"
                            onError={(e) => {
                              // Fallback to IPFS if Supabase content fails
                              e.currentTarget.src = `https://ipfs.io/ipfs/${ip.cid}`;
                            }}
                          />
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
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`https://explorer.campnetwork.xyz/address/${ip.author}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            By {shortenAddress(ip.author)}
                          </a>
                          {currentUserAddress && currentUserAddress !== ip.author && (
                            <>
                              <button
                                onClick={() => handleViewProfile(ip.author)}
                                className="text-purple-600 hover:text-purple-800 underline"
                              >
                                👤 Profile
                              </button>
                              <button
                                onClick={() => handleFollow(ip.author)}
                                className={`px-2 py-1 rounded text-xs font-bold border ${
                                  followingUsers.has(ip.author)
                                    ? 'bg-gray-500 text-white border-gray-600'
                                    : 'bg-pepe-green text-black border-black hover:bg-green-600'
                                }`}
                              >
                                {followingUsers.has(ip.author) ? 'Unfollow' : 'Follow'}
                              </button>
                            </>
                          )}
                        </div>
                        <span>{formatDate(ip.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <span>🍴</span>
                          <span className="font-bold">{ip.remixCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>💬</span>
                          <span className="font-bold">{ip.commentCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags and Category */}
                    {(ip.tags && ip.tags.length > 0) || ip.category ? (
                      <div className="mt-4">
                        <TagDisplay
                          tags={ip.tags}
                          category={ip.category}
                          maxTags={3}
                          showCategory={true}
                          className="text-xs"
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 bg-gray-50">
                    <div className="flex space-x-2 mb-3">

                      <LicenseAccessVerifier
                        tokenId={safeTokenIdToBigInt(ip.originTokenId)}
                        userAddress={currentUserAddress}
                        onAccessGranted={handleAccessGranted}
                        onAccessDenied={handleAccessDenied}
                      >
                        <button
                          onClick={() => handleRemix(ip)}
                          className="flex-1 bg-pepe-green hover:bg-green-600 text-black font-bold py-2 px-3 rounded-lg border-2 border-black transition-colors duration-200 text-sm"
                        >
                          🍴 REMIX
                        </button>
                      </LicenseAccessVerifier>
                      
                      <LicenseAccessVerifier
                        tokenId={safeTokenIdToBigInt(ip.originTokenId)}
                        userAddress={currentUserAddress}
                        onAccessGranted={handleAccessGranted}
                        onAccessDenied={handleAccessDenied}
                      >
                        <button
                          onClick={() => handleView(ip)}
                          className="flex-1 bg-dank-yellow hover:bg-yellow-500 text-black font-bold py-2 px-3 rounded-lg border-2 border-black transition-colors duration-200 text-sm"
                        >
                          👁️ VIEW
                        </button>
                      </LicenseAccessVerifier>
                      
                      <button
                        onClick={() => navigate('/analytics', { state: { ip } })}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-3 rounded-lg border-2 border-black transition-colors duration-200 text-sm"
                      >
                        📊 ANALYTICS
                      </button>
                    </div>
                    
                    {/* License Purchase Button - Only show if not the owner */}
                    {currentUserAddress !== ip.author && (
                      <LicensePurchaseButton
                        ipId={ip.id}
                        ipTitle={ip.title}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      />
                    )}
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