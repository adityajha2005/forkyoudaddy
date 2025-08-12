import { Auth } from '@campnetwork/origin';

// Check if Origin SDK is available
const isOriginSDKAvailable = () => {
  try {
    return typeof Auth !== 'undefined';
  } catch {
    return false;
  }
};

// NOTE: API key not required client-side for current Origin SDK usage

// Basecamp testnet configuration
const BASECAMP_CONFIG = {
  chainId: 123420001114,
  rpcUrl: 'https://rpc-campnetwork.xyz',
  blockExplorer: 'https://basecamp.cloud.blockscout.com/'
};

// Hex chain id used by MetaMask switch
const BASECAMP_CHAIN_HEX = '0x1cbc67c35a'; // keep consistent with Navbar

// Ensure wallet is connected and on Basecamp network
const ensureWalletReady = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return;

  // Request accounts
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } catch (e) {
    console.warn('Failed to request accounts:', e);
  }

  // Ensure chain
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASECAMP_CHAIN_HEX }]
    });
  } catch (switchErr: any) {
    if (switchErr?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: BASECAMP_CHAIN_HEX,
            chainName: 'Basecamp',
            nativeCurrency: { name: 'CAMP', symbol: 'CAMP', decimals: 18 },
            rpcUrls: [BASECAMP_CONFIG.rpcUrl],
            blockExplorerUrls: [BASECAMP_CONFIG.blockExplorer]
          }]
        });
      } catch (addErr) {
        console.warn('Failed to add Basecamp network:', addErr);
      }
    } else {
      console.warn('Failed to switch chain:', switchErr);
    }
  }
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
      redirectUri: window.location.origin, // Use origin instead of full href
      allowAnalytics: true
    });
    
    console.log('Auth instance created, setting provider...');
    // Set the provider if ethereum is available
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
      authClient.setProvider({
        provider: window.ethereum,
        info: { name: 'MetaMask', icon: 'https://metamask.io/images/metamask-fox.svg' }
      });
      console.log('Provider set successfully');
      } catch (e) {
        console.warn('Failed to set provider on Auth client:', e);
      }
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
    // Ensure wallet ready and provider present
    await ensureWalletReady();
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

// Helper function to check authentication status
const checkAuthStatus = async (auth: any) => {
  try {
    // Check if we have a JWT token
    const jwt = await auth.origin.getJwt();
    console.log('🔍 JWT token available:', !!jwt);
    
    // Check if user is connected to wallet
    const walletAddress = window.ethereum?.selectedAddress;
    console.log('🔍 Wallet connected:', !!walletAddress);
    console.log('🔍 Wallet address:', walletAddress);
    
    return {
      hasJwt: !!jwt,
      hasWallet: !!walletAddress,
      walletAddress
    };
  } catch (error) {
    console.log('🔍 Auth status check failed:', (error as Error).message);
    return {
      hasJwt: false,
      hasWallet: false,
      walletAddress: null
    };
  }
};

// Register IP with proper error handling and correct method calls
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
      // Attempt to set provider and connect once before failing
      if (auth && typeof (auth as any).setProvider === 'function' && typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          (auth as any).setProvider({
            provider: (window as any).ethereum,
            info: { name: 'MetaMask', icon: 'https://metamask.io/images/metamask-fox.svg' }
          });
        } catch {}
      }
      try {
        await (auth as any)?.connect?.();
      } catch {}
    if (!auth || !auth.origin) {
      throw new Error('Origin not available. User must be authenticated.');
      }
    }
    
    // Check authentication status
    const authStatus = await checkAuthStatus(auth);
    console.log('🔍 Authentication status:', authStatus);
    
    if (!authStatus.hasJwt || !authStatus.hasWallet) {
      throw new Error('User must be connected to wallet and authenticated with Origin SDK');
    }
    
    // Create metadata for IP registration
    const metadata = {
      name: params.title, // Use 'name' instead of 'title' for NFT metadata standard
      description: params.description,
      content: params.content,
      license: params.license,
      contentType: 'text',
      createdAt: new Date().toISOString(),
      author: authStatus.walletAddress || 'unknown'
    };
    
    console.log('📝 Registering IP:', { name: metadata.name, license: metadata.license });
    console.log('📝 Full metadata:', metadata);
    
    // Log available methods for debugging
    if (auth.origin) {
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(auth.origin));
      console.log('🔍 Available methods on auth.origin:', methods);
    }
    
    // Create a file from the content (fallback to contentURI if provided)
    const contentBlob = new Blob([
      params.contentURI ? `uri:${params.contentURI}` : params.content
    ], { type: 'text/plain' });
    const file = new File([contentBlob], 'ip-content.txt', { type: 'text/plain' });
    
    console.log('🔍 Created file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Create license terms using correct types based on Origin SDK
    const licenseTerms = {
      price: 0n, // BigInt
      duration: 0, // number (seconds)
      royaltyBps: 0,
      paymentToken: '0x0000000000000000000000000000000000000000' as `0x${string}`
    };
    
    console.log('🔍 License terms:', licenseTerms);
    
    // Prefer mintFile which accepts a File and LicenseTerms with duration:number
    if (typeof auth.origin.mintFile !== 'function') {
      throw new Error('auth.origin.mintFile is not available. Available methods: ' +
        Object.getOwnPropertyNames(Object.getPrototypeOf(auth.origin)).join(', '));
    }

    console.log('🚀 Using mintFile method...');
    let result: unknown;
    try {
      result = await auth.origin.mintFile(
        file,
        metadata,
        licenseTerms,
        undefined, // parentId (none for new IP)
        {
          progressCallback: (percent: number) => console.log(`Upload progress: ${percent}%`)
        }
      );
      console.log('✅ mintFile call successful:', result);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.warn('mintFile failed:', message);

      // Fallback path for signature errors: try upload + mintWithSignature if available
      if (message.includes('Failed to get signature')) {
        try {
          // Upload file first if supported
          let uploadUrl: string | undefined;
          if (typeof (auth.origin as any).uploadFile === 'function') {
            console.log('📤 Uploading file for signature-based mint...');
            const uploadRes: any = await (auth.origin as any).uploadFile(file);
            uploadUrl = uploadRes?.url || uploadRes?.uri || undefined;
            console.log('📤 Upload complete:', uploadRes);
          }

          // Get current account
          const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = accounts[0];

          // Build minimal signature payload
          const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
          const creatorContentHash = ('0x' + '0'.repeat(64)) as `0x${string}`; // placeholder 32-byte hash
          const signMessage = ('0x' + '0'.repeat(64)) as `0x${string}`; // placeholder hash for personal_sign
          console.log('🔏 Requesting personal_sign...');
          const signature: string = await window.ethereum.request({
            method: 'personal_sign',
            params: [signMessage, account]
          });

          if (typeof (auth.origin as any).mintWithSignature === 'function' && uploadUrl) {
            console.log('🚀 Falling back to mintWithSignature...');
            const sigRes: unknown = await (auth.origin as any).mintWithSignature(
              account,
              BigInt(0), // tokenId (new)
              BigInt(0), // parentId
              creatorContentHash,
              uploadUrl,
              licenseTerms,
              deadline,
              signature
            );
            result = sigRes;
            console.log('✅ mintWithSignature successful:', sigRes);
          } else {
            throw e;
          }
        } catch (fallbackErr) {
          console.error('Signature fallback failed:', fallbackErr);
          throw e; // keep original error context
        }
      } else {
        throw e;
      }
    }

    // Normalize possible return types (string tokenId or object)
    const normalized = typeof result === 'object' && result !== null ? (result as Record<string, unknown>) : {};
    const txHash = (normalized.transactionHash as string) || (normalized.hash as string) || undefined;
    const tokenId = (normalized.tokenId as unknown) ?? (typeof result === 'string' ? result : undefined);
    
    return {
      success: true,
        message: 'IP registered successfully using mintFile',
      data: {
        ...metadata,
        id: `ip-${Date.now()}`,
        cid: params.contentURI || 'blockchain-cid',
        transactionHash: txHash || 'pending',
        tokenId: tokenId as unknown as string
      }
    };
  } catch (error) {
    console.error('❌ Failed to register IP:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('User rejected')) {
        throw new Error('Transaction was rejected by user');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds for transaction');
      } else if (error.message.includes('network')) {
        throw new Error('Network error: Please check your connection and try again');
      } else {
        throw new Error(`Registration failed: ${error.message}`);
      }
    }
    
    throw new Error('Unknown error occurred while registering IP');
  }
};

// Fork IP using SDK with improved error handling
export const forkIP = async (parentId: string, params: {
  title: string;
  description: string;
  content: string;
  license: string;
}) => {
  try {
    // First, ensure wallet is connected
    if (!window.ethereum?.selectedAddress) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    
    await ensureWalletReady();
    const auth = await getAuthClient();
    if (!auth || !auth.origin) {
      // Attempt to set provider and connect once before failing
      if (auth && typeof (auth as any).setProvider === 'function' && typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          (auth as any).setProvider({
            provider: (window as any).ethereum,
            info: { name: 'MetaMask', icon: 'https://metamask.io/images/metamask-fox.svg' }
          });
        } catch {}
      }
      try {
        await (auth as any)?.connect?.();
      } catch {}
    if (!auth || !auth.origin) {
      throw new Error('Origin not available. User must be authenticated.');
      }
    }
    
    // Check authentication status
    const authStatus = await checkAuthStatus(auth);
    console.log('🔍 Authentication status for forking:', authStatus);
    
    if (!authStatus.hasJwt || !authStatus.hasWallet) {
      throw new Error('User must be connected to wallet and authenticated with Origin SDK');
    }
    
    console.log('🍴 Forking IP:', { parentId, title: params.title });
      
      // Create metadata for the fork
      const forkMetadata = {
      name: params.title,
        description: params.description,
        content: params.content,
        license: params.license,
        parentId: parentId,
        isRemix: true,
      createdAt: new Date().toISOString(),
      author: authStatus.walletAddress
    };
    
    // Create a file from the content
    const contentBlob = new Blob([
      params.content
    ], { type: 'text/plain' });
    const file = new File([contentBlob], 'fork-content.txt', { type: 'text/plain' });
    
    // Create license terms (duration should be a number for SDK types)
    const licenseTerms = {
      price: 0n,
      duration: 0,
      royaltyBps: 0,
      paymentToken: '0x0000000000000000000000000000000000000000' as `0x${string}`
    };
    
    // Convert parentId to BigInt (extract numeric part)
    const parentTokenId = BigInt(parentId.replace(/[^0-9]/g, '') || '0');
    
    // Variables kept for potential future extensions
    // let result: any;
    // let method = 'unknown';
    
    // Only support mintFile for forking to keep types correct
    if (typeof auth.origin.mintFile !== 'function') {
      throw new Error('auth.origin.mintFile is not available for forking. Available methods: ' +
        Object.getOwnPropertyNames(Object.getPrototypeOf(auth.origin)).join(', '));
    }

    console.log('🚀 Forking using mintFile method...');
    const forkResult: unknown = await auth.origin.mintFile(
      file,
      forkMetadata,
      licenseTerms,
      parentTokenId, // parentId for forking
      {
        progressCallback: (percent: number) => console.log(`Upload progress: ${percent}%`)
      }
    );

    console.log('✅ Fork mintFile call successful:', forkResult);

    const forkNormalized = typeof forkResult === 'object' && forkResult !== null ? (forkResult as Record<string, unknown>) : {};
    const forkTxHash = (forkNormalized.transactionHash as string) || (forkNormalized.hash as string) || undefined;
    const forkTokenId = (forkNormalized.tokenId as unknown) ?? (typeof forkResult === 'string' ? forkResult : undefined);
    
    return {
      success: true,
      message: 'IP forked successfully using mintFile',
      data: { 
        parentId, 
        ...params,
        transactionHash: forkTxHash || 'pending',
        tokenId: forkTokenId as unknown as string
      }
    };
  } catch (error) {
    console.error('❌ Failed to fork IP:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('User rejected')) {
        throw new Error('Transaction was rejected by user');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds for transaction');
      } else if (error.message.includes('network')) {
        throw new Error('Network error: Please check your connection and try again');
      } else {
        throw new Error(`Fork failed: ${error.message}`);
      }
    }
    
    throw new Error('Unknown error occurred while forking IP');
  }
};

export { BASECAMP_CONFIG };
