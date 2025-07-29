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

// Mock function for registering IP (since we need to understand the exact SDK interface)
export const registerIP = async (params: {
  title: string;
  description: string;
  content: string;
  license: string;
}) => {
  try {
    const auth = getAuthClient();
    if (!auth.origin) {
      throw new Error('Origin not available. User must be authenticated.');
    }
    
    // For now, return a mock result until we understand the exact SDK interface
    console.log('Mock IP registration:', params);
    return {
      success: true,
      message: 'IP registered successfully (mock)',
      data: params
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
    const auth = getAuthClient();
    if (!auth.origin) {
      throw new Error('Origin not available. User must be authenticated.');
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