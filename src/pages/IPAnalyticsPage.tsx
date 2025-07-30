import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllIPs } from '../services/ipService';
import { ipService } from '../services/supabase';
// import {} from '../services/supabase'
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

interface AnalyticsData {
  totalRemixes: number;
  remixChain: IP[];
  popularityTrend: { date: string; count: number }[];
  topRemixers: { author: string; count: number }[];
  averageRemixInterval: number;
  engagementScore: number;
  reachScore: number;
  viralCoefficient: number;
}

const IPAnalyticsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [targetIP, setTargetIP] = useState<IP | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get IP from location state or URL params
        const ipFromState = location.state?.ip;
        if (!ipFromState) {
          setError('No IP data provided');
          return;
        }

        setTargetIP(ipFromState);

        // Load all IPs to calculate analytics
        const allIPs = await getAllIPs();
        
        // Calculate analytics data
        const analyticsData = calculateAnalytics(ipFromState, allIPs);
        setAnalytics(analyticsData);

      } catch (error) {
        console.error('Error loading analytics:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [location.state, timeRange]);

  const calculateAnalytics = (targetIP: IP, allIPs: IP[]): AnalyticsData => {
    // Find all remixes of this IP
    const remixes = allIPs.filter(ip => ip.parentId === targetIP.id);
    
    // Build remix chain (recursive)
    const buildRemixChain = (ipId: string, visited: Set<string> = new Set()): IP[] => {
      if (visited.has(ipId)) return [];
      visited.add(ipId);
      
      const directRemixes = allIPs.filter(ip => ip.parentId === ipId);
      const chain = [targetIP];
      
      directRemixes.forEach(remix => {
        chain.push(...buildRemixChain(remix.id, visited));
      });
      
      return chain;
    };

    const remixChain = buildRemixChain(targetIP.id);

    // Calculate popularity trend (simplified - in real app would use actual timestamps)
    const popularityTrend = generatePopularityTrend(targetIP, remixes, timeRange);

    // Calculate top remixers
    const remixerCounts = remixes.reduce((acc, ip) => {
      acc[ip.author] = (acc[ip.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topRemixers = Object.entries(remixerCounts)
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate engagement metrics
    const totalRemixes = remixes.length;
    const averageRemixInterval = totalRemixes > 0 ? 
      (new Date().getTime() - new Date(targetIP.createdAt).getTime()) / (totalRemixes * 24 * 60 * 60 * 1000) : 0;
    
    const engagementScore = Math.min(100, (totalRemixes / 10) * 100);
    const reachScore = Math.min(100, (remixChain.length / 20) * 100);
    const viralCoefficient = totalRemixes > 0 ? (remixChain.length / totalRemixes) : 0;

    return {
      totalRemixes,
      remixChain,
      popularityTrend,
      topRemixers,
      averageRemixInterval,
      engagementScore,
      reachScore,
      viralCoefficient
    };
  };

  const generatePopularityTrend = (targetIP: IP, remixes: IP[], timeRange: string) => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const trend = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayRemixes = remixes.filter(remix => {
        const remixDate = new Date(remix.createdAt);
        return remixDate.toDateString() === date.toDateString();
      }).length;
      
      trend.push({
        date: date.toISOString().split('T')[0],
        count: dayRemixes
      });
    }
    
    return trend;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pepe-green mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !targetIP || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Analytics Not Available</h3>
              <p className="text-gray-500 mb-4">{error || 'Unable to load analytics data'}</p>
              <button
                onClick={() => navigate('/explore')}
                className="bg-pepe-green hover:bg-green-600 text-black font-bold px-6 py-3 rounded-lg border-2 border-black transition-colors"
              >
                ← BACK TO EXPLORE
              </button>
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
                  📊 IP ANALYTICS
                </h1>
                <p className="text-lg text-gray-600">
                  Deep insights into your IP's performance and reach
                </p>
              </div>
              <button
                onClick={() => navigate('/remix', { 
                  state: { 
                    originalIP: targetIP,
                    mode: 'view'
                  } 
                })}
                className="bg-pepe-green hover:bg-green-600 text-black font-bold px-6 py-3 rounded-lg border-2 border-black transition-colors"
              >
                👁️ VIEW IP
              </button>
            </div>
          </div>

          {/* IP Overview */}
          <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <span className="text-4xl">{getContentTypeIcon(targetIP.contentType)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black">{targetIP.title}</h2>
                  <span className={`px-3 py-1 text-sm font-bold rounded ${getLicenseColor(targetIP.license)}`}>
                    {targetIP.license}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{targetIP.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>By {shortenAddress(targetIP.author)}</span>
                  <span>Created {formatDate(targetIP.createdAt)}</span>
                  <span>🍴 {analytics.totalRemixes} remixes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-pepe-green mb-2">{analytics.totalRemixes}</div>
              <div className="text-sm text-gray-600">Total Remixes</div>
            </div>
            <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.remixChain.length}</div>
              <div className="text-sm text-gray-600">Chain Length</div>
            </div>
            <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {analytics.averageRemixInterval.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Days/Remix</div>
            </div>
            <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {analytics.viralCoefficient.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Viral Coefficient</div>
            </div>
          </div>

          {/* Performance Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h3 className="text-lg font-bold text-black mb-4">🎯 Engagement Score</h3>
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(analytics.engagementScore)}`}>
                  {analytics.engagementScore.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 mb-4">{getScoreLabel(analytics.engagementScore)}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-pepe-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analytics.engagementScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h3 className="text-lg font-bold text-black mb-4">📈 Reach Score</h3>
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(analytics.reachScore)}`}>
                  {analytics.reachScore.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 mb-4">{getScoreLabel(analytics.reachScore)}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analytics.reachScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h3 className="text-lg font-bold text-black mb-4">⏱️ Time Range</h3>
              <div className="space-y-2">
                {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`w-full px-3 py-2 rounded text-sm font-bold transition-colors ${
                      timeRange === range
                        ? 'bg-pepe-green text-black'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : 
                     range === '30d' ? '30 Days' : 
                     range === '90d' ? '90 Days' : '1 Year'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popularity Trend Chart */}
          <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-black mb-4">📈 Popularity Trend ({timeRange})</h3>
            <div className="h-64 flex items-end justify-between space-x-1">
              {analytics.popularityTrend.map((point, index) => {
                const maxCount = Math.max(...analytics.popularityTrend.map(p => p.count));
                const height = maxCount > 0 ? (point.count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-pepe-green rounded-t transition-all duration-300 hover:bg-green-600"
                      style={{ height: `${height}%` }}
                      title={`${point.date}: ${point.count} remixes`}
                    ></div>
                    {index % 7 === 0 && (
                      <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                        {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Remixers */}
          <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-black mb-4">👥 Top Remixers</h3>
            {analytics.topRemixers.length > 0 ? (
              <div className="space-y-3">
                {analytics.topRemixers.map((remixer, index) => (
                  <div key={remixer.author} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-pepe-green rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-black">{shortenAddress(remixer.author)}</div>
                        <div className="text-sm text-gray-500">{remixer.count} remixes</div>
                      </div>
                    </div>
                    <a 
                      href={`https://explorer.campnetwork.xyz/address/${remixer.author}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View Profile →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-gray-500">No remixes yet</p>
              </div>
            )}
          </div>

          {/* Remix Chain Visualization */}
          <div className="bg-white border-2 border-black rounded-lg p-6">
            <h3 className="text-xl font-bold text-black mb-4">🧬 Remix Chain</h3>
            {analytics.remixChain.length > 1 ? (
              <div className="space-y-4">
                {analytics.remixChain.map((ip, index) => (
                  <div key={ip.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-pepe-green rounded-full flex items-center justify-center text-black font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getContentTypeIcon(ip.contentType)}</span>
                        <h4 className="font-bold text-black">{ip.title}</h4>
                        <span className={`px-2 py-1 text-xs font-bold rounded ${getLicenseColor(ip.license)}`}>
                          {ip.license}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {shortenAddress(ip.author)}</span>
                        <span>{formatDate(ip.createdAt)}</span>
                        <span>🍴 {ip.remixCount} remixes</span>
                      </div>
                    </div>
                    {index < analytics.remixChain.length - 1 && (
                      <div className="flex-shrink-0 text-2xl text-gray-400">↓</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🧬</div>
                <p className="text-gray-500">No remix chain yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPAnalyticsPage; 