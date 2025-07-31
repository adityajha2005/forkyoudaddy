// IP Service for fetching and managing IPs
// Integrated with Supabase with localStorage fallback

import { ipService as supabaseIPService, type IP as SupabaseIP } from './supabase';

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
  tokenId?: string | null;
  transactionHash?: string | null;
  originTokenId?: string; // Token ID for Origin SDK integration
}

// For localStorage fallback
const STORAGE_KEY = 'forkyoudaddy_ips';

// Cache for IPs to avoid repeated API reads
let cachedIPs: IP[] | null = null;
let lastLoadTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Convert Supabase IP to local IP format
const convertSupabaseIPToLocal = (supabaseIP: SupabaseIP): IP => ({
  id: supabaseIP.id,
  title: supabaseIP.title,
  description: supabaseIP.description,
  content: supabaseIP.content,
  contentType: supabaseIP.content_type,
  license: supabaseIP.license,
  author: supabaseIP.author_address,
  createdAt: supabaseIP.created_at,
  remixCount: supabaseIP.remix_count,
  cid: supabaseIP.ipfs_hash || '',
  contentURI: supabaseIP.ipfs_hash || '',
  parentId: supabaseIP.parent_id,
  tags: [], // Tags not stored in Supabase
  category: undefined, // Category not stored in Supabase
  commentCount: supabaseIP.comment_count || 0,
  tokenId: supabaseIP.token_id || null,
  transactionHash: supabaseIP.transaction_hash || null,
  originTokenId: supabaseIP.token_id || undefined // Map token_id to originTokenId
});

// Convert local IP to Supabase format
const convertLocalIPToSupabase = (localIP: IP): Omit<SupabaseIP, 'id' | 'created_at' | 'remix_count'> => ({
  title: localIP.title,
  description: localIP.description,
  content: localIP.content,
  content_type: localIP.contentType,
  license: localIP.license,
  author_address: localIP.author,
  ipfs_hash: localIP.cid,
  parent_id: undefined,
  // Note: tags and category fields are excluded as they don't exist in Supabase table
  comment_count: localIP.commentCount || 0,
  token_id: localIP.tokenId || undefined,
  transaction_hash: localIP.transactionHash || undefined
});

// Get all IPs with caching
export const getAllIPs = async (): Promise<IP[]> => {
  try {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (cachedIPs && (now - lastLoadTime) < CACHE_DURATION) {
      return cachedIPs;
    }

    // Try to get from Supabase first
    try {
      const supabaseIPs = await supabaseIPService.getAllIPs();
      const convertedIPs = supabaseIPs.map(convertSupabaseIPToLocal);
      
      // Update cache with only Supabase data
      cachedIPs = convertedIPs;
      lastLoadTime = now;
      
      console.log(`Loaded ${convertedIPs.length} IPs from Supabase`);
      return convertedIPs;
    } catch (supabaseError) {
      console.warn('Supabase fetch failed, falling back to localStorage:', supabaseError);
      
      // Only use localStorage if Supabase completely fails
      const storedIPs = localStorage.getItem(STORAGE_KEY);
      if (storedIPs) {
        const ips = JSON.parse(storedIPs);
        cachedIPs = ips;
        lastLoadTime = now;
        console.log(`Loaded ${ips.length} IPs from localStorage (fallback)`);
        return ips;
      }
      
      // If no stored IPs, return empty array
      cachedIPs = [];
      lastLoadTime = now;
      return [];
    }
  } catch (error) {
    console.error('Error loading IPs:', error);
    return [];
  }
};

// Add a new IP
export const addIP = async (ip: Omit<IP, 'id' | 'createdAt' | 'remixCount'>, parentId?: string): Promise<IP> => {
  try {
    const newIP: IP = {
      ...ip,
      id: parentId ? `fork-${parentId}-${Date.now()}` : `ip-${Date.now()}`,
      createdAt: new Date().toISOString(),
      remixCount: 0
    };

    // Try to save to Supabase first
    try {
      const supabaseIPData = convertLocalIPToSupabase(newIP);
      if (parentId) {
        supabaseIPData.parent_id = parentId;
      }
      
      const savedSupabaseIP = await supabaseIPService.createIP(supabaseIPData);
      const convertedIP = convertSupabaseIPToLocal(savedSupabaseIP);
      
      // Update parent's remix count if this is a fork
      if (parentId) {
        const parentIP = await getIPById(parentId);
        const newRemixCount = (parentIP?.remixCount || 0) + 1;
        await supabaseIPService.updateIP(parentId, { 
          remix_count: newRemixCount
        });
      }
      
      // Clear cache to force fresh load from Supabase
      clearIPCache();
      
      console.log('Added new IP to Supabase:', { title: convertedIP.title, id: convertedIP.id, parentId });
      return convertedIP;
    } catch (supabaseError) {
      console.warn('Supabase save failed, falling back to localStorage:', supabaseError);
      
      // Fallback to localStorage
      const existingIPs = await getAllIPs();
      
      // If this is a fork, update the parent's remix count
      if (parentId) {
        const parentIP = existingIPs.find(p => p.id === parentId);
        if (parentIP) {
          parentIP.remixCount += 1;
        }
      }
      
      // Add new IP to the beginning
      const updatedIPs = [newIP, ...existingIPs];
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIPs));
      
      // Update cache
      cachedIPs = updatedIPs;
      lastLoadTime = Date.now();
      
      console.log('Added new IP to localStorage (fallback):', { title: newIP.title, id: newIP.id, parentId });
      return newIP;
    }
  } catch (error) {
    console.error('Error adding IP:', error);
    throw error;
  }
};

// Update IP remix count
export const updateIPRemixCount = async (ipId: string): Promise<void> => {
  try {
    // Get current IP
    const currentIP = await getIPById(ipId);
    if (!currentIP) return;

    // Update remix count
    const newRemixCount = (currentIP.remixCount || 0) + 1;
    
    // Update in Supabase
    try {
      await supabaseIPService.updateIP(ipId, { remix_count: newRemixCount });
    } catch (error) {
      console.warn('Failed to update remix count in Supabase:', error);
    }

    // Update in localStorage
    const storedIPs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = storedIPs.findIndex((ip: IP) => ip.id === ipId);
    if (index !== -1) {
      storedIPs[index].remixCount = newRemixCount;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedIPs));
    }

    // Clear cache to ensure fresh data
    clearIPCache();
  } catch (error) {
    console.error('Error updating IP remix count:', error);
  }
};

// Update IP comment count
export const updateIPCommentCount = async (ipId: string): Promise<void> => {
  try {
    // Get current IP
    const currentIP = await getIPById(ipId);
    if (!currentIP) return;

    // Get comment count from comment service
    const { commentService } = await import('./supabase');
    const comments = await commentService.getComments(ipId);
    const commentCount = comments.length;

    // Update in Supabase
    try {
      await supabaseIPService.updateIP(ipId, { comment_count: commentCount });
    } catch (error) {
      console.warn('Failed to update comment count in Supabase:', error);
    }

    // Update in localStorage
    const storedIPs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = storedIPs.findIndex((ip: IP) => ip.id === ipId);
    if (index !== -1) {
      storedIPs[index].commentCount = commentCount;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedIPs));
    }

    // Clear cache to ensure fresh data
    clearIPCache();
  } catch (error) {
    console.error('Error updating IP comment count:', error);
  }
};

// Get IP by ID
export const getIPById = async (id: string): Promise<IP | null> => {
  try {
    const ips = await getAllIPs();
    return ips.find(ip => ip.id === id) || null;
  } catch (error) {
    console.error('Error getting IP by ID:', error);
    return null;
  }
};

// Clear cache (useful for testing or when you need fresh data)
export const clearIPCache = (): void => {
  cachedIPs = null;
  lastLoadTime = 0;
};

// Assign Origin token ID to an IP
export const assignOriginTokenId = async (ipId: string, originTokenId: string): Promise<boolean> => {
  try {
    // Update in Supabase (using token_id field for now)
    try {
      await supabaseIPService.updateIP(ipId, { token_id: originTokenId });
      console.log(`Assigned Origin token ID ${originTokenId} to IP ${ipId}`);
    } catch (error) {
      console.warn('Failed to update Origin token ID in Supabase:', error);
    }

    // Update in localStorage
    const storedIPs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = storedIPs.findIndex((ip: IP) => ip.id === ipId);
    if (index !== -1) {
      storedIPs[index].originTokenId = originTokenId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedIPs));
    }

    // Clear cache to ensure fresh data
    clearIPCache();
    return true;
  } catch (error) {
    console.error('Error assigning Origin token ID:', error);
    return false;
  }
};

// Generate a unique Origin token ID
export const generateOriginTokenId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}${random}`; // Remove underscore for BigInt compatibility
};

// Assign Origin token IDs to all IPs that don't have one
export const assignOriginTokenIdsToAllIPs = async (): Promise<void> => {
  try {
    const allIPs = await getAllIPs();
    const ipsWithoutOriginTokenId = allIPs.filter(ip => !ip.originTokenId);
    
    console.log(`Found ${ipsWithoutOriginTokenId.length} IPs without Origin token IDs`);
    
    for (const ip of ipsWithoutOriginTokenId) {
      const originTokenId = generateOriginTokenId();
      await assignOriginTokenId(ip.id, originTokenId);
      console.log(`Assigned Origin token ID ${originTokenId} to IP: ${ip.title}`);
    }
    
    console.log('Finished assigning Origin token IDs to all IPs');
  } catch (error) {
    console.error('Error assigning Origin token IDs to all IPs:', error);
  }
}; 