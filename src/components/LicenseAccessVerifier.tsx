import React, { useState, useEffect } from 'react';
import { checkUserAccess, isAccessExpired, getTimeUntilExpiry } from '../services/accessControlService';
import { useAuth } from '@campnetwork/origin/react';
import ErrorBoundary from './ErrorBoundary';

interface LicenseAccessVerifierProps {
  tokenId?: bigint;
  userAddress?: string;
  onAccessGranted: () => void;
  onAccessDenied: () => void;
  children: React.ReactNode;
  showAccessStatus?: boolean;
}

const LicenseAccessVerifier: React.FC<LicenseAccessVerifierProps> = ({
  tokenId,
  userAddress,
  onAccessGranted,
  onAccessDenied,
  children,
  showAccessStatus = false
}) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [expiry, setExpiry] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const auth = useAuth(); // May be undefined if Origin SDK not available

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkAccess = async () => {
      if (!tokenId || !auth?.origin) {
        // No Origin token ID or SDK not available, allow access
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Validate user address
      if (!userAddress || userAddress.length !== 42 || !userAddress.startsWith('0x')) {
        console.warn('Invalid user address for Origin SDK access check:', userAddress);
        // Allow access if no valid user address (user not connected)
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const accessStatus = await checkUserAccess(tokenId, userAddress, auth);
        
        setHasAccess(accessStatus.hasAccess);
        setExpiry(accessStatus.expiry);
        setError(accessStatus.error);

        if (accessStatus.hasAccess) {
          onAccessGranted();
        } else {
          onAccessDenied();
        }
      } catch (error) {
        console.error('Access verification failed:', error);
        setError(error instanceof Error ? error.message : 'Access check failed');
        onAccessDenied();
      } finally {
        setLoading(false);
      }
    };

    // Debounce the access check to prevent rapid calls
    timeoutId = setTimeout(checkAccess, 500);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [tokenId, userAddress, auth, onAccessGranted, onAccessDenied]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pepe-green"></div>
        <span className="ml-2 text-sm text-gray-600">
          Verifying access {auth?.origin ? '(Blockchain)' : '(Local)'}...
        </span>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-red-600">🔒</span>
          <div>
            <h4 className="text-sm font-medium text-red-800">Access Required</h4>
            <p className="text-xs text-red-600">
              You need to purchase a license to access this content.
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-1">Error: {error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (hasAccess === true && showAccessStatus && expiry) {
    const isExpired = isAccessExpired(expiry);
    const timeRemaining = getTimeUntilExpiry(expiry);

    return (
      <div className="space-y-2">
        {children}
        <div className={`p-3 rounded-lg text-sm ${
          isExpired 
            ? 'bg-red-50 border border-red-200 text-red-800' 
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{isExpired ? '⚠️' : '✅'}</span>
            <span className="font-medium">
              {isExpired ? 'Access Expired' : 'Access Active'}
            </span>
          </div>
          <p className="text-xs mt-1">{timeRemaining}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default LicenseAccessVerifier; 