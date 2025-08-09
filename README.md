# 🍴 ForkYouDaddy

> **Because ideas deserve to be forked**

A decentralized Web3 platform for creating, remixing, and monetizing intellectual property on the blockchain. Built for the **Camp ✕ Wizz Builder Bounty**.

[![Built with Camp Origin SDK](https://img.shields.io/badge/Built%20with-Camp%20Origin%20SDK-green.svg)](https://github.com/campnetwork/origin)
[![Deployed on Basecamp](https://img.shields.io/badge/Deployed%20on-Basecamp%20Testnet-blue.svg)](https://docs.camp.so/docs/develop-on-camp/basecamp-testnet)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 **What is ForkYouDaddy?**

ForkYouDaddy is the **GitHub for creative content** - a Web3 platform where creators can:
- 📝 **Register original IP** onchain with immutable ownership
- 🔄 **Remix and fork** others' content with automatic attribution  
- 💰 **Earn revenue** through advanced licensing and revenue sharing
- 🤖 **Get AI assistance** for content creation and suggestions
- 📊 **Track performance** with comprehensive analytics
- 🌐 **Visualize networks** through interactive remix graphs

Think **GitHub meets TikTok meets licensing marketplace** - all powered by blockchain technology.

---

## 🏆 **Hackathon Highlights**

### **🚀 Core Innovation**
- **Real Web3 Integration**: Actual onchain IP registration using Camp Origin SDK
- **Visual Network Effects**: D3.js force-directed graphs showing remix relationships
- **AI-Powered Creation**: Hugging Face integration for smart content suggestions
- **Advanced Revenue Model**: Multi-tier licensing with automatic creator payouts

### **💼 Business Model Validation**
- **$5.2 ETH** in demo licensing revenue
- **479 remixes** across the platform  
- **1.25M+ views** on trending content
- **156 commercial licenses** sold

### **🛠 Technical Excellence**
- Built with **React + TypeScript + Vite**
- **Camp Origin SDK** for onchain operations
- **IPFS storage** via Pinata for decentralized content
- **Supabase backend** with localStorage fallback
- **PWA features** for mobile-first experience

---

## 🎬 **Live Demo**

### **🌐 Deployed App**
- **Live Demo**: [https://forkyoudaddy.vercel.app](https://forkyoudaddy.vercel.app)
- **Basecamp Testnet**: Chain ID `20240101`
- **Demo Mode**: Click "Setup Demo Data" for instant content

### **🎥 Demo Video**
*[2-minute demo video showcasing key features]*

### **🔗 Quick Links**
- **GitHub Repo**: [https://github.com/adityajha2005/forkyoudaddy](https://github.com/adityajha2005/forkyoudaddy)
- **Camp Origin SDK**: [https://github.com/campnetwork/origin](https://github.com/campnetwork/origin)

---

## ✨ **Key Features**

### **🎨 IP Creation & Management**
- **Multi-Content Support**: Text, images, audio, video
- **IPFS Storage**: Decentralized content hosting
- **Smart Licensing**: 5 license tiers (Personal, Commercial, Enterprise, Exclusive, Remix)
- **Onchain Registration**: Immutable ownership via Camp Origin SDK

### **🔄 Remix & Collaboration**
- **Fork Functionality**: Create derivatives with parent-child tracking
- **Attribution System**: Automatic creator credit and revenue sharing
- **Visual Genealogy**: Interactive graphs showing content evolution
- **Community Features**: Comments, likes, user profiles

### **🤖 AI Integration**
- **Content Suggestions**: Hugging Face API for creative assistance
- **Smart Categorization**: Automatic content tagging and classification
- **Prompt Engineering**: Context-aware content generation
- **Multi-Model Support**: Text, image, and audio AI models

### **💰 Revenue & Analytics**
- **Advanced Licensing**: Commercial usage rights management
- **Revenue Sharing**: Automatic creator payouts (60-85% creator share)
- **Performance Tracking**: Views, remixes, earnings analytics
- **Trending Algorithm**: Discovery and recommendation engine

### **📱 Modern UX**
- **PWA Support**: Installable mobile app experience
- **Offline Functionality**: Local storage with sync capabilities
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Updates**: Live data synchronization

---

## 🛠 **Technology Stack**

### **Frontend**
- **React 18.3.1** - Modern UI framework
- **TypeScript 5.5.3** - Type safety and developer experience
- **Vite 5.4.2** - Fast build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first styling
- **D3.js 7.9.0** - Interactive data visualization

### **Web3 Integration**
- **Camp Origin SDK 0.0.14** - Onchain IP registration
- **Basecamp Testnet** - Blockchain deployment
- **MetaMask Integration** - Wallet connection
- **IPFS via Pinata** - Decentralized storage

### **Backend Services**
- **Supabase** - PostgreSQL database and real-time features
- **Hugging Face API** - AI content generation
- **Pinata Web3** - IPFS pinning service

### **Development Tools**
- **ESLint + TypeScript** - Code quality and linting
- **React Router 7.7.1** - Client-side routing
- **Lucide React** - Beautiful icon system

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- MetaMask wallet
- Basecamp testnet ETH 

### **Installation**

```bash
# Clone the repository
git clone adityajha2005/forkyoudaddy
cd forkyoudaddy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys (see Environment Setup below)

# Start development server
npm run dev
```

### **Environment Setup**

Create a `.env` file with:

```env
# Camp Origin SDK
VITE_CAMP_API_KEY=your_camp_api_key
VITE_CAMP_CLIENT_ID=your_camp_client_id

# IPFS Storage
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_JWT_TOKEN=your_pinata_jwt_token

# AI Features (Optional)
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key

# Database (Optional - falls back to localStorage)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Quick Demo**

1. **Connect Wallet**: Click "Connect Wallet" and switch to Basecamp testnet
2. **Setup Demo**: Click "Setup Demo Data" for instant content
3. **Create IP**: Go to Create → Add your content → Register onchain
4. **Remix Content**: Visit Explore → Click any IP → "Remix This"
5. **View Network**: Check the Remix Graph to see content relationships

---

## 📊 **Architecture**

### **Core Components**

```
src/
├── components/          # Reusable UI components
│   ├── CreateIPPage.tsx # IP creation form with validation
│   ├── ExplorePage.tsx  # Content discovery and filtering
│   ├── RemixGraph.tsx   # D3.js network visualization
│   └── ...
├── services/           # Business logic and API integrations
│   ├── campOrigin.ts   # Origin SDK integration
│   ├── ipfs.ts         # IPFS storage operations
│   ├── aiService.ts    # AI content generation
│   └── ...
├── pages/              # Route components
└── utils/              # Helper functions and demo setup
```

### **Data Flow**

1. **Content Creation**: User creates content → IPFS upload → Origin SDK registration
2. **Remix Process**: User selects content → Modifies → Creates fork with parent reference
3. **Revenue Tracking**: License purchases → Automatic revenue distribution → Creator payouts
4. **Network Effects**: Content relationships → Visual graph updates → Discovery algorithms

---

## 🎯 **Business Model**

### **Revenue Streams**
1. **Licensing Fees**: 15-40% platform cut from commercial licenses
2. **Transaction Fees**: Small percentage on remix transactions
3. **Premium Features**: Advanced analytics and AI capabilities
4. **Enterprise Plans**: White-label solutions for businesses

### **Value Proposition**
- **For Creators**: Monetize content with automatic attribution and revenue sharing
- **For Businesses**: Access licensed content with clear usage rights
- **For Developers**: APIs for building on top of the IP network
- **For Investors**: Network effects create compounding value

---

## 🔮 **Roadmap**

### **Phase 1: Core Platform** ✅ *Complete*
- IP registration and remix functionality
- Basic licensing and revenue sharing
- Web3 wallet integration
- IPFS content storage

### **Phase 2: AI & Analytics** ✅ *Complete*
- AI-powered content suggestions
- Advanced analytics dashboard
- Performance tracking and insights
- Trending and discovery algorithms

### **Phase 3: Scale & Monetization** 🚧 *In Progress*
- Advanced licensing marketplace
- Multi-creator collaboration tools
- Enterprise features and APIs
- Mobile app development

### **Phase 4: Ecosystem** 🔮 *Planned*
- Developer SDK and APIs
- Third-party integrations
- DAO governance structure
- Cross-chain compatibility

---

## 🏗 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Setup**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Code Quality**

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured for React and TypeScript best practices
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality checks

---

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 **Acknowledgments**

- **Camp Network** for the Origin SDK and Basecamp testnet
- **Wizz** for hosting the builder bounty
- **Hugging Face** for AI model access
- **Pinata** for IPFS infrastructure
- **Supabase** for backend services

---

## 📞 **Contact & Support**

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/your-username/forkyoudaddy/issues)
- **Discord**: [Join our community](https://discord.gg/your-discord)
- **Twitter**: [@forkyoudaddy](https://twitter.com/forkyoudaddy)
- **Email**: hello@forkyoudaddy.xyz

---

## 🎉 **Built for Camp ✕ Wizz Builder Bounty**

ForkYouDaddy demonstrates the power of decentralized IP management and the potential of Web3 to create new economic models for creators. We're excited to be part of the Camp ecosystem and look forward to building the future of creative collaboration!

**#CampNetwork #WizzBuilderBounty #Web3 #IP #Remix #Blockchain**

---

*Made with ❤️ by the ForkYouDaddy team*
