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
  console.log('Initializing Auth client with clientId:', clientId);
  
  // If auth client is already initialized, return it
  if (authClient) {
    console.log('Auth client already initialized, returning existing instance');
    return authClient;
  }
  
  if (!isOriginSDKAvailable()) {
    throw new Error('Origin SDK not available');
  }
  
  try {
    console.log('Creating Auth instance...');
    authClient = new Auth({
      clientId,
      redirectUri: window.location.href,
      allowAnalytics: true
    });
    
    console.log('Auth instance created, setting provider...');
    // Set the provider if ethereum is available
    if (typeof window !== 'undefined' && window.ethereum) {
      authClient.setProvider({
        provider: window.ethereum,
        info: { name: 'MetaMask', icon: 'https://metamask.io/images/metamask-fox.svg' }
      });
      console.log('Provider set successfully');
    } else {
      console.log('No ethereum provider available');
    }
    
    console.log('Auth client initialized successfully');
    return authClient;
  } catch (error) {
    console.error('Failed to initialize Auth client:', error);
    throw error;
  }
};

export const getAuthClient = async () => {
  if (!authClient) {
    console.log('Auth client not found, attempting to re-initialize...');
    
    // Try to re-initialize the auth client
    const clientId = import.meta.env.VITE_CAMP_CLIENT_ID;
    if (!clientId) {
      throw new Error('Auth client not initialized and no client ID available. Please connect your wallet first.');
    }
    
    try {
      await initializeAuthClient(clientId);
      console.log('Auth client re-initialized successfully');
    } catch (error) {
      console.error('Failed to re-initialize auth client:', error);
      throw new Error('Auth client not initialized. Please connect your wallet first to initialize the auth client.');
    }
  }
  return authClient;
};

// Connect user to Origin SDK
export const connectUser = async () => {
  try {
    console.log('Getting auth client...');
    const auth = await getAuthClient();
    if (!auth) {
      throw new Error('Auth client not available');
    }
    console.log('Auth client obtained, connecting user...');
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
    const auth = await getAuthClient();
    if (!auth) {
      throw new Error('Auth client not available');
    }
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
    const auth = await getAuthClient();
    if (!auth || !auth.origin) {
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
    const auth = await getAuthClient();
    if (!auth || !auth.origin) {
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
    const auth = await getAuthClient();
    if (!auth || !auth.origin) {
      throw new Error('Origin not available. User must be authenticated.');
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
    // TODO: Replace with actual SDK call: auth.origin.registerIP(metadata)
    console.log('IP registration with metadata:', metadata);
    console.log('Auth client available:', !!auth);
    console.log('Origin available:', !!auth.origin);
    
    return {
      success: true,
      message: 'IP registered successfully (with auth client)',
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
    const auth = await getAuthClient();
    if (!auth || !auth.origin) {
      throw new Error('Origin not available. User must be authenticated.');
    }
    
    // For now, return a mock result
    // TODO: Replace with actual SDK call: auth.origin.forkIP(parentId, params)
    console.log('Mock IP fork:', { parentId, ...params });
    console.log('Auth client available:', !!auth);
    console.log('Origin available:', !!auth.origin);
    
    return {
      success: true,
      message: 'IP forked successfully (with auth client)',
      data: { parentId, ...params }
    };
  } catch (error) {
    console.error('Failed to fork IP:', error);
    throw error;
  }
};

export { BASECAMP_CONFIG }; 