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
  tags?: string[];
  category?: string; // Optional - not stored in Supabase
  comment_count?: number;
}

export interface User {
  wallet_address: string;
  username?: string;
  created_at: string;
  total_ips: number;
  total_remixes: number;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
}

export interface Follow {
  id: string;
  follower_address: string;
  following_address: string;
  created_at: string;
}

export interface Comment {
  id: string;
  ip_id: string;
  author_address: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  like_count: number;
  reply_count: number;
  is_deleted: boolean;
  is_flagged: boolean;
  author_username?: string;
  author_avatar?: string;
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

      // Filter out fields that don't exist in Supabase table
      const supabaseData = {
        id: newIP.id,
        title: newIP.title,
        description: newIP.description,
        content: newIP.content,
        content_type: newIP.content_type,
        license: newIP.license,
        author_address: newIP.author_address,
        ipfs_hash: newIP.ipfs_hash,
        parent_id: newIP.parent_id,
        created_at: newIP.created_at,
        remix_count: newIP.remix_count,
        token_id: newIP.token_id,
        transaction_hash: newIP.transaction_hash,
        comment_count: newIP.comment_count
        // Note: tags and category fields are excluded as they don't exist in Supabase table
      };

      const { data, error } = await supabase
        .from('ips')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      // Also save to localStorage as backup (including category)
      const localIPs = JSON.parse(localStorage.getItem('ips') || '[]');
      localIPs.push(newIP);
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

      // First try to get existing user
      const { data: existingUser, error: getError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        return existingUser;
      }

      // If user doesn't exist, create new user
      const newUser: User = {
        wallet_address: walletAddress,
        created_at: new Date().toISOString(),
        total_ips: 0,
        total_remixes: 0,
        followers_count: 0,
        following_count: 0
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        // If creation fails, return a basic user object
        return newUser;
      }
      
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
          total_remixes: 0,
          followers_count: 0,
          following_count: 0
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
  },

  // Follow a user
  async followUser(followerAddress: string, followingAddress: string): Promise<void> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      // Check if already following
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_address', followerAddress)
        .eq('following_address', followingAddress)
        .single();

      if (existingFollow) {
        throw new Error('Already following this user');
      }

      // Create follow relationship
      const followData: Omit<Follow, 'id'> = {
        follower_address: followerAddress,
        following_address: followingAddress,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('follows')
        .insert([followData]);

      if (error) {
        console.error('Follow insert error:', error);
        // If RLS blocks the insert, fallback to localStorage
        throw error;
      }

      // Update follower counts
      const followingUser = await this.getUser(followingAddress);
      const followerUser = await this.getUser(followerAddress);
      
      await this.updateUserStats(followingAddress, { 
        followers_count: (followingUser.followers_count || 0) + 1 
      });
      await this.updateUserStats(followerAddress, { 
        following_count: (followerUser.following_count || 0) + 1 
      });

    } catch (error) {
      console.error('Failed to follow user in Supabase:', error);
      // Fallback to localStorage
      const localFollows = JSON.parse(localStorage.getItem('follows') || '[]');
      const newFollow = {
        id: `follow-${Date.now()}`,
        follower_address: followerAddress,
        following_address: followingAddress,
        created_at: new Date().toISOString()
      };
      localFollows.push(newFollow);
      localStorage.setItem('follows', JSON.stringify(localFollows));
      
      // Also update local user stats
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const followingIndex = localUsers.findIndex((u: User) => u.wallet_address === followingAddress);
      const followerIndex = localUsers.findIndex((u: User) => u.wallet_address === followerAddress);
      
      if (followingIndex !== -1) {
        localUsers[followingIndex].followers_count = (localUsers[followingIndex].followers_count || 0) + 1;
      }
      if (followerIndex !== -1) {
        localUsers[followerIndex].following_count = (localUsers[followerIndex].following_count || 0) + 1;
      }
      localStorage.setItem('users', JSON.stringify(localUsers));
    }
  },

  // Unfollow a user
  async unfollowUser(followerAddress: string, followingAddress: string): Promise<void> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_address', followerAddress)
        .eq('following_address', followingAddress);

      if (error) throw error;

      // Update follower counts
      const followingUser = await this.getUser(followingAddress);
      const followerUser = await this.getUser(followerAddress);
      
      await this.updateUserStats(followingAddress, { 
        followers_count: Math.max(0, (followingUser.followers_count || 0) - 1)
      });
      await this.updateUserStats(followerAddress, { 
        following_count: Math.max(0, (followerUser.following_count || 0) - 1)
      });

    } catch (error) {
      console.error('Failed to unfollow user in Supabase:', error);
      // Fallback to localStorage
      const localFollows = JSON.parse(localStorage.getItem('follows') || '[]');
      const index = localFollows.findIndex((follow: Follow) => 
        follow.follower_address === followerAddress && follow.following_address === followingAddress
      );
      if (index !== -1) {
        localFollows.splice(index, 1);
        localStorage.setItem('follows', JSON.stringify(localFollows));
      }
    }
  },

  // Check if user is following another user
  async isFollowing(followerAddress: string, followingAddress: string): Promise<boolean> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_address', followerAddress)
        .eq('following_address', followingAddress)
        .single();

      return !!data;
    } catch (error) {
      console.error('Failed to check follow status in Supabase:', error);
      // Fallback to localStorage
      const localFollows = JSON.parse(localStorage.getItem('follows') || '[]');
      return localFollows.some((follow: Follow) => 
        follow.follower_address === followerAddress && follow.following_address === followingAddress
      );
    }
  },

  // Get user's followers
  async getFollowers(userAddress: string): Promise<User[]> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data: follows, error } = await supabase
        .from('follows')
        .select('follower_address')
        .eq('following_address', userAddress);

      if (error) throw error;

      const followers = await Promise.all(
        follows.map(follow => this.getUser(follow.follower_address))
      );

      return followers;
    } catch (error) {
      console.error('Failed to get followers from Supabase:', error);
      // Fallback to localStorage
      const localFollows = JSON.parse(localStorage.getItem('follows') || '[]');
      const followerAddresses = localFollows
        .filter((follow: Follow) => follow.following_address === userAddress)
        .map((follow: Follow) => follow.follower_address);
      
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      return localUsers.filter((user: User) => followerAddresses.includes(user.wallet_address));
    }
  },

  // Get users that a user is following
  async getFollowing(userAddress: string): Promise<User[]> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data: follows, error } = await supabase
        .from('follows')
        .select('following_address')
        .eq('follower_address', userAddress);

      if (error) throw error;

      const following = await Promise.all(
        follows.map(follow => this.getUser(follow.following_address))
      );

      return following;
    } catch (error) {
      console.error('Failed to get following from Supabase:', error);
      // Fallback to localStorage
      const localFollows = JSON.parse(localStorage.getItem('follows') || '[]');
      const followingAddresses = localFollows
        .filter((follow: Follow) => follow.follower_address === userAddress)
        .map((follow: Follow) => follow.following_address);
      
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      return localUsers.filter((user: User) => followingAddresses.includes(user.wallet_address));
    }
  }
};

// Graph data operations
export const graphService = {
  // Get graph data for visualization
  async getGraphData(): Promise<{ nodes: any[]; links: any[] }> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('ips')
        .select('id, parent_id, author_address');

      if (error) throw error;

      const nodes = data?.map(ip => ({
        id: ip.id,
        author: ip.author_address
      })) || [];

      const links = data?.filter(ip => ip.parent_id).map(ip => ({
        source: ip.parent_id,
        target: ip.id
      })) || [];

      return { nodes, links };
    } catch (error) {
      console.error('Failed to fetch graph data from Supabase:', error);
      return { nodes: [], links: [] };
    }
  }
};

// Comment Operations
export const commentService = {
  // Get comments for an IP
  async getComments(ipId: string): Promise<Comment[]> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('ip_id', ipId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch comments from Supabase:', error);
      // Fallback to localStorage
      const localComments = JSON.parse(localStorage.getItem(`comments_${ipId}`) || '[]');
      return localComments.filter((comment: Comment) => !comment.is_deleted);
    }
  },

  // Create a new comment
  async createComment(commentData: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'like_count' | 'reply_count' | 'is_deleted' | 'is_flagged'>): Promise<Comment> {
    const newComment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      like_count: 0,
      reply_count: 0,
      is_deleted: false,
      is_flagged: false
    };

    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([newComment])
        .select()
        .single();

      if (error) throw error;

      // Also save to localStorage
      const localComments = JSON.parse(localStorage.getItem(`comments_${commentData.ip_id}`) || '[]');
      localComments.push(data);
      localStorage.setItem(`comments_${commentData.ip_id}`, JSON.stringify(localComments));

      return data;
    } catch (error) {
      console.error('Failed to create comment in Supabase:', error);
      // Fallback to localStorage only
      const localComments = JSON.parse(localStorage.getItem(`comments_${commentData.ip_id}`) || '[]');
      localComments.push(newComment);
      localStorage.setItem(`comments_${commentData.ip_id}`, JSON.stringify(localComments));
      return newComment;
    }
  },

  // Update a comment
  async updateComment(commentId: string, updates: Partial<Comment>): Promise<void> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('comments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;

      // Also update localStorage
      const allComments = JSON.parse(localStorage.getItem('all_comments') || '[]');
      const index = allComments.findIndex((comment: Comment) => comment.id === commentId);
      if (index !== -1) {
        allComments[index] = { ...allComments[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem('all_comments', JSON.stringify(allComments));
      }
    } catch (error) {
      console.error('Failed to update comment in Supabase:', error);
      // Fallback to localStorage only
      const allComments = JSON.parse(localStorage.getItem('all_comments') || '[]');
      const index = allComments.findIndex((comment: Comment) => comment.id === commentId);
      if (index !== -1) {
        allComments[index] = { ...allComments[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem('all_comments', JSON.stringify(allComments));
      }
    }
  },

  // Delete a comment (soft delete)
  async deleteComment(commentId: string): Promise<void> {
    await this.updateComment(commentId, { is_deleted: true });
  },

  // Like/unlike a comment
  async toggleLike(commentId: string, userAddress: string): Promise<void> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      // Get current comment
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('like_count')
        .eq('id', commentId)
        .single();

      if (fetchError) throw fetchError;

      // Check if user already liked (this would need a likes table in production)
      const likedComments = JSON.parse(localStorage.getItem(`liked_comments_${userAddress}`) || '[]');
      const isLiked = likedComments.includes(commentId);

      if (isLiked) {
        // Unlike
        await this.updateComment(commentId, { like_count: Math.max(0, comment.like_count - 1) });
        const newLikedComments = likedComments.filter((id: string) => id !== commentId);
        localStorage.setItem(`liked_comments_${userAddress}`, JSON.stringify(newLikedComments));
      } else {
        // Like
        await this.updateComment(commentId, { like_count: comment.like_count + 1 });
        likedComments.push(commentId);
        localStorage.setItem(`liked_comments_${userAddress}`, JSON.stringify(likedComments));
      }
    } catch (error) {
      console.error('Failed to toggle like in Supabase:', error);
      // Fallback to localStorage only
      const allComments = JSON.parse(localStorage.getItem('all_comments') || '[]');
      const index = allComments.findIndex((comment: Comment) => comment.id === commentId);
      if (index !== -1) {
        const likedComments = JSON.parse(localStorage.getItem(`liked_comments_${userAddress}`) || '[]');
        const isLiked = likedComments.includes(commentId);
        
        if (isLiked) {
          allComments[index].like_count = Math.max(0, allComments[index].like_count - 1);
          const newLikedComments = likedComments.filter((id: string) => id !== commentId);
          localStorage.setItem(`liked_comments_${userAddress}`, JSON.stringify(newLikedComments));
        } else {
          allComments[index].like_count = allComments[index].like_count + 1;
          likedComments.push(commentId);
          localStorage.setItem(`liked_comments_${userAddress}`, JSON.stringify(likedComments));
        }
        
        localStorage.setItem('all_comments', JSON.stringify(allComments));
      }
    }
  }
}; 