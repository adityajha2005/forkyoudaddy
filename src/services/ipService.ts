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

// Get all IPs
export const getAllIPs = async (): Promise<IP[]> => {
  try {
    // Try to get from localStorage first
    const storedIPs = localStorage.getItem(STORAGE_KEY);
    if (storedIPs) {
      const ips = JSON.parse(storedIPs);
      console.log('Loaded IPs from localStorage:', ips.length);
      return ips;
    }
    
    // If no stored IPs, return empty array
    return [];
  } catch (error) {
    console.error('Error loading IPs:', error);
    return [];
  }
};

// Add a new IP
export const addIP = async (ip: Omit<IP, 'id' | 'createdAt' | 'remixCount'>): Promise<IP> => {
  try {
    const newIP: IP = {
      ...ip,
      id: `ip-${Date.now()}`,
      createdAt: new Date().toISOString(),
      remixCount: 0
    };

    // Get existing IPs
    const existingIPs = await getAllIPs();
    
    // Add new IP to the beginning
    const updatedIPs = [newIP, ...existingIPs];
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIPs));
    
    console.log('Added new IP:', newIP);
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