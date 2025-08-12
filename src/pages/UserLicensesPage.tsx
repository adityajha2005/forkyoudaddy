import React, { useState, useEffect } from 'react';
import { getPurchasesByBuyer, getLicenseById, isLicenseExpired, isUsageLimitExceeded } from '../services/licensingService';
import { checkUserAccess, getTimeUntilExpiry } from '../services/accessControlService';
import { getIPById } from '../services/ipService';
import { useAuth } from '@campnetwork/origin/react';

interface UserLicensesPageProps {
  userAddress?: string;
}

const UserLicensesPage: React.FC<UserLicensesPageProps> = ({ userAddress }) => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [accessStatuses, setAccessStatuses] = useState<Record<string, any>>({});
  const auth = useAuth(); // Get Origin SDK auth instance (may be undefined if not available)

  useEffect(() => {
    const loadPurchases = async () => {
      if (!userAddress) {
        setLoading(false);
        return;
      }

      try {
        const userPurchases = getPurchasesByBuyer(userAddress);
        
        // Load IP data for each purchase
        const purchasesWithIPData = await Promise.all(
          userPurchases.map(async (purchase) => {
            try {
              const ipData = await getIPById(purchase.ipId);
              const licenseData = getLicenseById(purchase.licenseId);
              return {
                ...purchase,
                ipData,
                licenseData
              };
            } catch (error) {
              console.error('Failed to load IP data for purchase:', purchase.id);
              return purchase;
            }
          })
        );

        setPurchases(purchasesWithIPData);
        
        // Check access status for purchases with Origin token IDs
        if (auth?.origin) {
          const accessChecks = await Promise.all(
            purchasesWithIPData
              .filter(purchase => purchase.originTokenId)
              .map(async (purchase) => {
                try {
                  const accessStatus = await checkUserAccess(
                    BigInt(purchase.originTokenId!),
                    userAddress,
                    auth
                  );
                  return { purchaseId: purchase.id, accessStatus };
                } catch (error) {
                  console.error('Access check failed for purchase:', purchase.id);
                  return { purchaseId: purchase.id, accessStatus: { hasAccess: false, error: 'Check failed' } };
                }
              })
          );
          
          const accessMap = accessChecks.reduce((acc, { purchaseId, accessStatus }) => {
            acc[purchaseId] = accessStatus;
            return acc;
          }, {} as Record<string, any>);
          
          setAccessStatuses(accessMap);
        }
      } catch (error) {
        console.error('Failed to load purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [userAddress]);

  const filteredPurchases = purchases.filter(purchase => {
    if (filter === 'active') {
      return !isLicenseExpired(purchase) && purchase.status === 'completed';
    }
    if (filter === 'expired') {
      return isLicenseExpired(purchase) || purchase.status === 'expired';
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(3)} CAMP`;
  };

  const getStatusBadge = (purchase: any) => {
    if (purchase.status === 'pending') {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
    }
    if (purchase.status === 'completed') {
      if (isLicenseExpired(purchase)) {
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Expired</span>;
      }
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>;
    }
    if (purchase.status === 'expired') {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Expired</span>;
    }
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{purchase.status}</span>;
  };

  const getUsageStatus = (purchase: any) => {
    if (!purchase.licenseData?.maxUsage) {
      return <span className="text-green-600 text-sm">Unlimited usage</span>;
    }
    
    const isExceeded = isUsageLimitExceeded(purchase, purchase.licenseData);
    const usageText = `${purchase.usageCount}/${purchase.licenseData.maxUsage} uses`;
    
    return (
      <span className={`text-sm ${isExceeded ? 'text-red-600' : 'text-green-600'}`}>
        {usageText} {isExceeded && '(Limit exceeded)'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-meme-white via-gray-50 via-pepe-green/5 to-dank-yellow/10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pepe-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your licenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-meme-white via-gray-50 via-pepe-green/5 to-dank-yellow/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black mb-4">My Licenses</h1>
          <p className="text-gray-600">
            Manage and track all your purchased IP licenses
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            {[
              { key: 'all', label: 'All Licenses', count: purchases.length },
              { key: 'active', label: 'Active', count: purchases.filter(p => !isLicenseExpired(p) && p.status === 'completed').length },
              { key: 'expired', label: 'Expired', count: purchases.filter(p => isLicenseExpired(p) || p.status === 'expired').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
                  filter === tab.key
                    ? 'border-pepe-green text-pepe-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Licenses Grid */}
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No licenses found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't purchased any licenses yet."
                : `No ${filter} licenses found.`
              }
            </p>
            <button
              onClick={() => window.location.href = '/explore'}
              className="bg-pepe-green hover:bg-green-600 text-black font-bold py-3 px-6 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105"
            >
              Browse IPs to Purchase
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {/* IP Image */}
                {purchase.ipData?.contentType === 'image' && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={purchase.ipData.content}
                      alt={purchase.ipData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* IP Title */}
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {purchase.ipData?.title || 'Unknown IP'}
                  </h3>

                  {/* License Type */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {purchase.licenseData?.name || 'Unknown License'}
                    </span>
                    {getStatusBadge(purchase)}
                  </div>

                  {/* Purchase Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{formatPrice(purchase.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Purchased:</span>
                      <span className="font-medium">{formatDate(purchase.purchaseDate)}</span>
                    </div>
                    {purchase.expiryDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-medium">{formatDate(purchase.expiryDate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage:</span>
                      <span className="font-medium">{getUsageStatus(purchase)}</span>
                    </div>
                    
                    {/* Origin Access Status */}
                    {purchase.originTokenId && accessStatuses[purchase.id] && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-800 font-medium">Origin Access:</span>
                          <span className={`font-bold ${
                            accessStatuses[purchase.id].hasAccess 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {accessStatuses[purchase.id].hasAccess ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </div>
                        {accessStatuses[purchase.id].expiry && (
                          <div className="mt-2 text-xs text-blue-700">
                            {getTimeUntilExpiry(accessStatuses[purchase.id].expiry)}
                          </div>
                        )}
                        {accessStatuses[purchase.id].error && (
                          <div className="mt-2 text-xs text-red-600">
                            Error: {accessStatuses[purchase.id].error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* License Benefits */}
                  {purchase.licenseData?.benefits && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits:</h4>
                      <ul className="space-y-1">
                        {purchase.licenseData.benefits.slice(0, 3).map((benefit: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="w-1 h-1 bg-pepe-green rounded-full"></span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/ip/${purchase.ipId}`, '_blank')}
                      className="flex-1 bg-pepe-green hover:bg-green-600 text-black font-bold py-2 px-3 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 text-sm"
                    >
                      View IP
                    </button>
                    {purchase.transactionHash && (
                      <button
                        onClick={() => window.open(`https://basecamp.cloud.blockscout.com/tx/${purchase.transactionHash}`, '_blank')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded-lg border-2 border-gray-300 transition-colors duration-200 text-sm"
                      >
                        View TX
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLicensesPage; 