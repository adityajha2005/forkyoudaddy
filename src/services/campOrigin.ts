import { Auth } from '@campnetwork/origin';

// Check if Origin SDK is available
const isOriginSDKAvailable = () => {
  try {
    return typeof Auth !== 'undefined';
  } catch {
    return false;
  }
};

// Get API key from environment
const getApiKey = () => {
  return import.meta.env.VITE_CAMP_API_KEY;
};

// Basecamp testnet configuration
const BASECAMP_CONFIG = {
  chainId: 123420001114,
  rpcUrl: 'https://rpc-campnetwork.xyz',
  blockExplorer: 'https://explorer.campnetwork.xyz'
};

// Initialize Auth client
let authClient: Auth | null = null;

export const initializeAuthClient = async (clientId: string) => {
  if (!isOriginSDKAvailable()) {
    throw new Error('Origin SDK not available');
  }
  
  try {
    authClient = new Auth({
      clientId,
      redirectUri: window.location.href,
      allowAnalytics: true
    });
    
    // Set the provider if ethereum is available
    if (typeof window !== 'undefined' && window.ethereum) {
      authClient.setProvider({
        provider: window.ethereum,
        info: { name: 'MetaMask', icon: 'https://metamask.io/images/metamask-fox.svg' }
      });
    }
    
    console.log('Auth client initialized successfully');
    return authClient;
  } catch (error) {
    console.error('Failed to initialize Auth client:', error);
    throw error;
  }
};

export const getAuthClient = () => {
  if (!authClient) {
    throw new Error('Auth client not initialized. Call initializeAuthClient first.');
  }
  return authClient;
};

// Connect user to Origin SDK
export const connectUser = async () => {
  try {
    const auth = getAuthClient();
    await auth.connect();
    console.log('User connected to Origin SDK');
  } catch (error) {
    console.error('Failed to connect user:', error);
    throw error;
  }
};

// Disconnect user from Origin SDK
export const disconnectUser = async () => {
  try {
    const auth = getAuthClient();
    await auth.disconnect();
    console.log('User disconnected from Origin SDK');
  } catch (error) {
    console.error('Failed to disconnect user:', error);
    throw error;
  }
};

// Get user's Origin uploads
export const getUserUploads = async () => {
  try {
    const auth = getAuthClient();
    if (!auth.origin) {
      throw new Error('Origin not available. User must be authenticated.');
    }
    const result = await auth.origin.getOriginUploads();
    return result;
  } catch (error) {
    console.error('Failed to get user uploads:', error);
    throw error;
  }
};

// Get user's Origin usage stats
export const getUserStats = async () => {
  try {
    const auth = getAuthClient();
    if (!auth.origin) {
      throw new Error('Origin not available. User must be authenticated.');
    }
    const result = await auth.origin.getOriginUsage();
    return result;
  } catch (error) {
    console.error('Failed to get user stats:', error);
    throw error;
  }
};

// Register IP with proper metadata
export const registerIP = async (params: {
  title: string;
  description: string;
  content: string;
  license: string;
  contentURI?: string;
}) => {
  try {
    // For now, we'll work without requiring auth client to be initialized
    // since this is a mock implementation
    let auth = null;
    try {
      auth = getAuthClient();
    } catch (error) {
      console.log('Auth client not initialized, using mock registration');
    }
    
    // Create metadata for IP registration
    const metadata = {
      title: params.title,
      description: params.description,
      content: params.content,
      license: params.license,
      contentType: 'text',
      createdAt: new Date().toISOString(),
      author: 'user' // Will be replaced with actual user info when SDK is fully integrated
    };
    
    // For now, return a mock result until we understand the exact SDK interface
    console.log('IP registration with metadata:', metadata);
    return {
      success: true,
      message: 'IP registered successfully (mock)',
      data: {
        ...metadata,
        id: `ip-${Date.now()}`,
        cid: params.contentURI || 'mock-cid',
        transactionHash: 'mock-tx-hash'
      }
    };
  } catch (error) {
    console.error('Failed to register IP:', error);
    throw error;
  }
};

// Mock function for forking IP
export const forkIP = async (parentId: string, params: {
  title: string;
  description: string;
  content: string;
  license: string;
}) => {
  try {
    // For now, we'll work without requiring auth client to be initialized
    // since this is a mock implementation
    let auth = null;
    try {
      auth = getAuthClient();
    } catch (error) {
      console.log('Auth client not initialized, using mock fork');
    }
    
    // For now, return a mock result
    console.log('Mock IP fork:', { parentId, ...params });
    return {
      success: true,
      message: 'IP forked successfully (mock)',
      data: { parentId, ...params }
    };
  } catch (error) {
    console.error('Failed to fork IP:', error);
    throw error;
  }
};

export { BASECAMP_CONFIG }; 