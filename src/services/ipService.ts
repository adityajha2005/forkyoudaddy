// IP Service for fetching and managing IPs
// This will eventually connect to your backend API

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

// For now, we'll store IPs in localStorage to persist them across sessions
const STORAGE_KEY = 'forkyoudaddy_ips';

// Cache for IPs to avoid repeated localStorage reads
let cachedIPs: IP[] | null = null;
let lastLoadTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Get all IPs with caching
export const getAllIPs = async (): Promise<IP[]> => {
  try {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (cachedIPs && (now - lastLoadTime) < CACHE_DURATION) {
      return cachedIPs;
    }

    // Try to get from localStorage
    const storedIPs = localStorage.getItem(STORAGE_KEY);
    if (storedIPs) {
      const ips = JSON.parse(storedIPs);
      cachedIPs = ips;
      lastLoadTime = now;
      console.log(`Loaded ${ips.length} IPs from localStorage`);
      return ips;
    }
    
    // If no stored IPs, return empty array
    cachedIPs = [];
    lastLoadTime = now;
    return [];
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

    // Get existing IPs
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
    
    console.log('Added new IP:', { title: newIP.title, id: newIP.id, parentId });
    return newIP;
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