# Supabase Setup Guide

## 🎯 **Supabase Integration for ForkYouDaddy**

Supabase is a powerful open-source alternative to Firebase with PostgreSQL backend, real-time subscriptions, and excellent free tier.

## 📋 **Step 1: Create Supabase Account**

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub
4. Create a new organization (if needed)

## 📋 **Step 2: Create New Project**

1. Click "New Project"
2. Choose your organization
3. **Project Name**: `forkyoudaddy`
4. **Database Password**: Create a strong password (save it!)
5. **Region**: Choose closest to your users
6. Click "Create new project"

## 📋 **Step 3: Get API Credentials**

Once your project is created:

1. Go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://xyz.supabase.co`)
3. Copy your **anon public key** (starts with `eyJ...`)

## 📋 **Step 4: Create Database Tables**

Go to **SQL Editor** and run these commands:

### **Create IPs Table**
```sql
CREATE TABLE ips (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image')),
  license TEXT NOT NULL,
  author_address TEXT NOT NULL,
  ipfs_hash TEXT,
  parent_id TEXT REFERENCES ips(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  remix_count INTEGER DEFAULT 0,
  token_id TEXT,
  transaction_hash TEXT
);

-- Enable Row Level Security
ALTER TABLE ips ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo)
CREATE POLICY "Allow all operations" ON ips FOR ALL USING (true);
```

### **Create Users Table**
```sql
CREATE TABLE users (
  wallet_address TEXT PRIMARY KEY,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_ips INTEGER DEFAULT 0,
  total_remixes INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
```

## 📋 **Step 5: Update Environment Variables**

Add these to your `.env` file:

```env
# Your existing variables
VITE_CAMP_API_KEY=your_camp_api_key_here
VITE_CAMP_CLIENT_ID=your_camp_client_id_here
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_JWT_TOKEN=your_pinata_jwt_token_here

# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `your-project-id` with your actual project ID
- `your_anon_key_here` with your actual anon key

## 📋 **Step 6: Test the Integration**

1. Start your development server
2. Try creating a new IP
3. Check the browser console for Supabase logs
4. Verify data appears in your Supabase dashboard

## 🔧 **How It Works**

The Supabase integration:

✅ **Real-time database** - PostgreSQL backend  
✅ **Automatic fallback** - localStorage when Supabase fails  
✅ **Type-safe** - Full TypeScript support  
✅ **Real-time subscriptions** - Live updates  
✅ **Free tier** - 500MB database, 50MB file storage  

## 🧪 **Testing**

1. **Create an IP**: Should save to Supabase and localStorage
2. **View IPs**: Should load from Supabase first, then localStorage
3. **Fork an IP**: Should update remix counts in both places
4. **Search**: Should work with Supabase queries

## 🔍 **Troubleshooting**

### **Connection Issues**
- Check your project URL and anon key
- Ensure your project is active
- Check network connectivity

### **Database Issues**
- Verify tables are created correctly
- Check Row Level Security policies
- Ensure proper data types

### **Fallback Behavior**
- If Supabase fails, localStorage takes over
- Check browser console for error messages

## 📊 **Monitoring**

1. Go to your Supabase dashboard
2. Check "Table Editor" to see your data
3. Monitor "Logs" for any errors
4. Check "API" for usage statistics

## 🚀 **Benefits**

✅ **PostgreSQL** - Powerful, reliable database  
✅ **Real-time** - Live updates with subscriptions  
✅ **Type-safe** - Full TypeScript support  
✅ **Free tier** - Generous limits  
✅ **Open source** - No vendor lock-in  

## 🎯 **Next Steps**

1. Set up Supabase following this guide
2. Update your environment variables
3. Test the integration
4. Deploy to production with proper environment variables

The integration is designed to be **seamless** - your app will work with Supabase when available and fall back to localStorage when needed! 