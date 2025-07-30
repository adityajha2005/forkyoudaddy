// Supabase Service for ForkYouDaddy
// Real-time database with PostgreSQL backend

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using localStorage fallback.');
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key'
);

export interface IP {
  id: string;
  title: string;
  description: string;
  content: string;
  content_type: 'text' | 'image';
  license: string;
  author_address: string;
  ipfs_hash?: string;
  parent_id?: string;
  created_at: string;
  remix_count: number;
  token_id?: string;
  transaction_hash?: string;
}

export interface User {
  wallet_address: string;
  username?: string;
  created_at: string;
  total_ips: number;
  total_remixes: number;
}

// IP Operations
export const ipService = {
  // Get all IPs
  async getAllIPs(): Promise<IP[]> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('ips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch IPs from Supabase:', error);
      // Fallback to localStorage
      const localIPs = JSON.parse(localStorage.getItem('ips') || '[]');
      return localIPs;
    }
  },

  // Get IP by ID
  async getIPById(id: string): Promise<IP | null> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('ips')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch IP from Supabase:', error);
      // Fallback to localStorage
      const localIPs = JSON.parse(localStorage.getItem('ips') || '[]');
      return localIPs.find((ip: IP) => ip.id === id) || null;
    }
  },

  // Create new IP
  async createIP(ipData: Omit<IP, 'id' | 'created_at' | 'remix_count'>): Promise<IP> {
    const newIP: IP = {
      ...ipData,
      id: `ip-${Date.now()}`,
      created_at: new Date().toISOString(),
      remix_count: 0,
    };

    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('ips')
        .insert([newIP])
        .select()
        .single();

      if (error) throw error;

      // Also save to localStorage as backup
      const localIPs = JSON.parse(localStorage.getItem('ips') || '[]');
      localIPs.push(data);
      localStorage.setItem('ips', JSON.stringify(localIPs));

      return data;
    } catch (error) {
      console.error('Failed to create IP in Supabase:', error);
      // Fallback to localStorage only
      const localIPs = JSON.parse(localStorage.getItem('ips') || '[]');
      localIPs.push(newIP);
      localStorage.setItem('ips', JSON.stringify(localIPs));
      return newIP;
    }
  },

  // Update IP (for remix count, etc.)
  async updateIP(id: string, updates: Partial<IP>): Promise<void> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('ips')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Also update localStorage
      const localIPs = JSON.parse(localStorage.getItem('ips') || '[]');
      const index = localIPs.findIndex((ip: IP) => ip.id === id);
      if (index !== -1) {
        localIPs[index] = { ...localIPs[index], ...updates };
        localStorage.setItem('ips', JSON.stringify(localIPs));
      }
    } catch (error) {
      console.error('Failed to update IP in Supabase:', error);
      // Fallback to localStorage only
      const localIPs = JSON.parse(localStorage.getItem('ips') || '[]');
      const index = localIPs.findIndex((ip: IP) => ip.id === id);
      if (index !== -1) {
        localIPs[index] = { ...localIPs[index], ...updates };
        localStorage.setItem('ips', JSON.stringify(localIPs));
      }
    }
  },

  // Get IPs by author
  async getIPsByAuthor(authorAddress: string): Promise<IP[]> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('ips')
        .select('*')
        .eq('author_address', authorAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch IPs by author from Supabase:', error);
      // Fallback to localStorage
      const localIPs = JSON.parse(localStorage.getItem('ips') || '[]');
      return localIPs.filter((ip: IP) => ip.author_address === authorAddress);
    }
  },

  // Get remixes of an IP
  async getRemixes(parentId: string): Promise<IP[]> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('ips')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch remixes from Supabase:', error);
      // Fallback to localStorage
      const localIPs = JSON.parse(localStorage.getItem('ips') || '[]');
      return localIPs.filter((ip: IP) => ip.parent_id === parentId);
    }
  },

  // Search IPs
  async searchIPs(query: string, filters?: { content_type?: string; license?: string }): Promise<IP[]> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      let queryBuilder = supabase
        .from('ips')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`);

      if (filters?.content_type) {
        queryBuilder = queryBuilder.eq('content_type', filters.content_type);
      }
      if (filters?.license) {
        queryBuilder = queryBuilder.eq('license', filters.license);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to search IPs in Supabase:', error);
      // Fallback to localStorage
      const localIPs = JSON.parse(localStorage.getItem('ips') || '[]');
      return localIPs.filter((ip: IP) => {
        const matchesQuery = ip.title.toLowerCase().includes(query.toLowerCase()) ||
                           ip.description.toLowerCase().includes(query.toLowerCase()) ||
                           ip.content.toLowerCase().includes(query.toLowerCase());
        
        const matchesType = !filters?.content_type || ip.content_type === filters.content_type;
        const matchesLicense = !filters?.license || ip.license === filters.license;
        
        return matchesQuery && matchesType && matchesLicense;
      });
    }
  }
};

// User Operations
export const userService = {
  // Get or create user
  async getUser(walletAddress: string): Promise<User> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      if (data) {
        return data;
      }

      // Create new user if not found
      const newUser: User = {
        wallet_address: walletAddress,
        created_at: new Date().toISOString(),
        total_ips: 0,
        total_remixes: 0
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (createError) throw createError;
      return createdUser;
    } catch (error) {
      console.error('Failed to get/create user in Supabase:', error);
      // Fallback to localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      let user = localUsers.find((u: User) => u.wallet_address === walletAddress);
      
      if (!user) {
        user = {
          wallet_address: walletAddress,
          created_at: new Date().toISOString(),
          total_ips: 0,
          total_remixes: 0
        };
        localUsers.push(user);
        localStorage.setItem('users', JSON.stringify(localUsers));
      }
      
      return user;
    }
  },

  // Update user stats
  async updateUserStats(walletAddress: string, updates: Partial<User>): Promise<void> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('wallet_address', walletAddress);

      if (error) throw error;

      // Also update localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const index = localUsers.findIndex((user: User) => user.wallet_address === walletAddress);
      if (index !== -1) {
        localUsers[index] = { ...localUsers[index], ...updates };
        localStorage.setItem('users', JSON.stringify(localUsers));
      }
    } catch (error) {
      console.error('Failed to update user stats in Supabase:', error);
      // Fallback to localStorage only
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const index = localUsers.findIndex((user: User) => user.wallet_address === walletAddress);
      if (index !== -1) {
        localUsers[index] = { ...localUsers[index], ...updates };
        localStorage.setItem('users', JSON.stringify(localUsers));
      }
    }
  }
};

// Graph data operations
export const graphService = {
  // Get graph data for visualization
  async getGraphData(): Promise<{ nodes: any[]; links: any[] }> {
    try {
      const ips = await ipService.getAllIPs();
      
      const nodes = ips.map(ip => ({
        id: ip.id,
        title: ip.title,
        author: ip.author_address,
        type: ip.content_type,
        license: ip.license,
        remixCount: ip.remix_count
      }));

      const links = ips
        .filter(ip => ip.parent_id)
        .map(ip => ({
          source: ip.parent_id,
          target: ip.id,
          type: 'remix'
        }));

      return { nodes, links };
    } catch (error) {
      console.error('Failed to get graph data:', error);
      return { nodes: [], links: [] };
    }
  }
};

export type { IP, User }; 