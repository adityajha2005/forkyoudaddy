// Access Control Service
// Handles license access verification using Origin SDK

import { checkAccessWithOrigin, renewAccessWithOrigin } from './licensingService';

export interface AccessStatus {
  hasAccess: boolean;
  expiry?: number;
  error?: string;
}

export interface RenewalResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// Check if user has access to an IP
export const checkUserAccess = async (
  tokenId: bigint,
  userAddress: string,
  auth: any
): Promise<AccessStatus> => {
  try {
    // Use Origin SDK to check access
    const result = await checkAccessWithOrigin(tokenId, userAddress, auth);
    
    return {
      hasAccess: result.hasAccess,
      expiry: result.expiry,
      error: result.error
    };
  } catch (error) {
    console.error('Access check error:', error);
    return {
      hasAccess: false,
      error: error instanceof Error ? error.message : 'Access check failed'
    };
  }
};

// Renew user access to an IP
export const renewUserAccess = async (
  tokenId: bigint,
  periods: number,
  auth: any
): Promise<RenewalResult> => {
  try {
    // Use Origin SDK to renew access
    const result = await renewAccessWithOrigin(tokenId, periods, auth);
    
    return {
      success: result.success,
      transactionHash: result.transactionHash,
      error: result.error
    };
  } catch (error) {
    console.error('Access renewal error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Access renewal failed'
    };
  }
};

// Check if access is expired
export const isAccessExpired = (expiry?: number): boolean => {
  if (!expiry) return false;
  return Date.now() > expiry * 1000; // Convert seconds to milliseconds
};

// Get time until expiry
export const getTimeUntilExpiry = (expiry?: number): string => {
  if (!expiry) return 'No expiry';
  
  const now = Date.now();
  const expiryMs = expiry * 1000;
  const diff = expiryMs - now;
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

// Format expiry date
export const formatExpiryDate = (expiry?: number): string => {
  if (!expiry) return 'No expiry';
  
  const date = new Date(expiry * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 