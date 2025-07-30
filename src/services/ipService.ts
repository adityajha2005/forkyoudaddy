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
  contentURI: supabaseIP.ipfs_hash || ''
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
  parent_id: undefined
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
      
      // Update cache
      cachedIPs = convertedIPs;
      lastLoadTime = now;
      
      console.log(`Loaded ${convertedIPs.length} IPs from Supabase`);
      return convertedIPs;
    } catch (supabaseError) {
      console.warn('Supabase fetch failed, falling back to localStorage:', supabaseError);
      
      // Fallback to localStorage
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
      
      // Update cache
      const existingIPs = await getAllIPs();
      cachedIPs = [convertedIP, ...existingIPs];
      lastLoadTime = Date.now();
      
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
    const ips = await getAllIPs();
    const updatedIPs = ips.map(ip => 
      ip.id === ipId 
        ? { ...ip, remixCount: ip.remixCount + 1 }
        : ip
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIPs));
    
    // Update cache
    cachedIPs = updatedIPs;
    lastLoadTime = Date.now();
    
    console.log('Updated remix count for IP:', ipId);
  } catch (error) {
    console.error('Error updating remix count:', error);
    throw error;
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