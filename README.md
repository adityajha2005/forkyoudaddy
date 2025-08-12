## ForkYouDaddy

ForkYouDaddy is a Web3 application for creating, remixing, and licensing creative IP. Creators can register original works onchain, others can fork and build on them with attribution, and licenses define usage and monetization.

- Live app: `https://forkyoudaddy.vercel.app`
- Repository: `https://github.com/adityajha2005/forkyoudaddy`

### TL;DR for judges
- **Problem**: Creative works spread online without attribution, permission, or clear monetization. Remix culture is powerful but value does not flow back to original creators.
- **Solution**: Onchain IP registration and remixing with clear licensing. Content and provenance are recorded, remix graphs make derivations visible, and creators can sell access/licenses.
- **Why Camp**: We use Camp’s Origin SDK and BaseCAMP chain to anchor provenance, mint IP, and power licensing and access checks. This aligns with creator sovereignty and transparent AI-native IP.

### What it does
- **Onchain IP**: Register and fork IP via the Camp Origin SDK
- **Provenance**: Store content on IPFS and link to onchain token IDs
- **Licensing**: Purchase and verify licenses; Origin integration with graceful fallbacks
- **Discovery**: Explore with rich filters, tags, and AI-assisted search
- **Remix Graph**: Visualize derivations and remix relationships in real time
- **AI Assist**: Generate ideas and images to boost creator flow
- **PWA/UX**: Mobile-friendly, installable, with offline affordances

### Judge checklist (how we meet the rubric)
- **Strong, meaningful use case**: Focus on creator attribution, remix culture, and value flow; concrete licensing and access gating.
- **Integrates Camp’s Origin SDK**: Auth provider (`CampProvider`), onchain mint and fork flows in `src/services/campOrigin.ts`, wallet/chain orchestration in `Navbar`/`MobileNav`.
- **Demonstrates Camp’s IP + AI vision**: AI suggestion/image generation in `src/services/aiService.ts` and UI hooks on `CreateIPPage` and `ExplorePage`.
- **Deployed on BaseCAMP chain (L1)**: Network switching and metadata point to BaseCAMP (`chainId 123420001114`, RPC `https://rpc-campnetwork.xyz`, Blockscout explorer).
- **UX and adoption**: Guided creation flow, clear licensing UI, installable PWA, responsive design.
- **Aligns with creator sovereignty + transparent AI**: Onchain registration + IPFS + remix graph; licensing and access-check flows built around Origin APIs with fallbacks.

Note: Licensing writes use graceful fallbacks if SDK is unavailable or rate-limited in a judge’s environment. Onchain-first code paths are in place, with clearly labeled fallbacks.

## Quickstart (judge-friendly)

### Prerequisites
- Node.js 18+
- A browser wallet (MetaMask recommended)
- BaseCAMP network RPC reachable from your network

### Install and run
```bash
git clone https://github.com/adityajha2005/forkyoudaddy
cd forkyoudaddy
npm install
cp .env.example .env
# Fill the env values (see Configuration)
npm run dev
```

Open `http://localhost:5173` (default Vite port).

### Configuration
Create `.env` from `.env.example` and set:
```env
# Camp Origin SDK
VITE_CAMP_CLIENT_ID=

# IPFS / Pinata (JWT preferred; API key optional)
VITE_PINATA_JWT_TOKEN=
VITE_PINATA_API_KEY=

# Hugging Face (optional; enables AI helpers)
VITE_HUGGINGFACE_API_KEY=

# Supabase (optional; localStorage fallback if absent)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Notes:
- **Camp Client ID** is required to initialize Origin Auth via `CampProvider`.
- If Supabase is omitted, the app uses localStorage for IPs, comments, follows.
- Pinata JWT is recommended for faster IPFS uploads.

### BaseCAMP chain config
- Chain ID: `123420001114` (hex: `0x1cbc67c35a`)
- RPC: `https://rpc-campnetwork.xyz`
- Explorer: `https://basecamp.cloud.blockscout.com/`

The app will prompt to connect your wallet and add/switch to BaseCAMP.

## Demo script (5–7 minutes)
1) **Create IP**: Go to Create → enter title/description → use AI Suggestions or upload an image → Register IP.
2) **IPFS + Onchain**: After submit, content is pinned to IPFS; IP is registered via Origin SDK (`mintFile`) when available.
3) **Explore + Provenance**: Open Explore → find your IP → view token/tx links to Blockscout where applicable.
4) **Remix**: Select any IP → Remix → change content/title → submit. Remix appears linked in the Remix Graph.
5) **License**: On an IP you don’t own → Purchase License → select license → confirm (SDK or fallback) → access verifier acknowledges.
6) **Graph**: Visit Remix Graph → observe parent→child relationships and interactivity.

## Feature highlights
- **Licensing**
  - License selection UI (`src/components/LicenseSelector.tsx`)
  - Purchase flow (`src/components/LicensePurchaseFlow.tsx`) integrates with `licensingService` and stores proof + status
  - Access verification wrapper (`src/components/LicenseAccessVerifier.tsx`) calls `accessControlService` which uses Origin checks when available
- **Onchain mint/fork (Camp Origin SDK)**
  - `CampProvider` wrapping app (`src/App.tsx`)
  - Mint/fork via `src/services/campOrigin.ts` using `auth.origin.mintFile`
  - Wallet + BaseCAMP switching in `Navbar`/`MobileNav` and `campOrigin.ts`
- **Provenance + IPFS**
  - Content pinned to IPFS via Pinata (`src/services/ipfs.ts`)
  - IPs cached via Supabase or localStorage (`src/services/ipService.ts`, `src/services/supabase.ts`)
- **AI Assist**
  - Text suggestions and image generation using Hugging Face models (`src/services/aiService.ts`)
  - Hooked into Create and Explore flows
- **Remix Graph**
  - D3 force-directed graph (`src/components/RemixGraph.tsx`) visualizing derivations and remix counts
- **PWA/UX**
  - Install prompt (`src/components/PWAInstallPrompt.tsx`), offline indicator (`src/components/OfflineIndicator.tsx`)

## Technical deep dive

### Camp Origin SDK integration
- Provider: `CampProvider` in `src/App.tsx` supplies auth/context to hooks like `useAuth`.
- Chain handling: `src/services/campOrigin.ts`, `src/components/Navbar.tsx`, and `src/components/MobileNav.tsx` switch/add BaseCAMP (`0x1cbc67c35a`).
- Minting/Forking: `registerIP` and `forkIP` in `src/services/campOrigin.ts` call `auth.origin.mintFile(...)` with metadata and license terms.

### Licensing and access control
- Purchase flow: `LicensePurchaseFlow` calls `licensingService` → attempts Origin `buyAccess` when available, otherwise performs a simulated fallback to keep UX unblocked for judges.
- Access checks: `LicenseAccessVerifier` → `accessControlService.checkUserAccess` → Origin `hasAccess` + `subscriptionExpiry` with caching and fallback.
- Data model: purchases stored locally with transaction hash and (when provided) `originTokenId`.

### Data and storage
- Supabase (optional) as primary DB; localStorage fallback for offline/demo.
- IPFS via Pinata for content addressing and provenance.

## Architecture
```
src/
├─ components/         # UI components (graph, licensing, comments, etc.)
├─ pages/              # Route-level pages
├─ services/           # Integrations and domain logic
│  ├─ campOrigin.ts    # Origin SDK auth and mint/fork flows
│  ├─ ipfs.ts          # IPFS uploads via Pinata
│  ├─ licensingService.ts
│  ├─ accessControlService.ts
│  ├─ supabase.ts      # DB access (optional) with local fallback
│  └─ ipService.ts     # IP aggregation + caching
└─ constants/, utils/  # Shared data and helpers
```

## Roadmap (post-hackathon hardening)
- Switch licensing to fully onchain by default; remove simulated fallbacks when SDK available and stable.
- Strengthen provenance by deriving `originTokenId` strictly from onchain mint responses; disallow fabricated IDs.
- Improve background sync to use IndexedDB instead of `localStorage` inside SW.
- Expand agent-based experiences (curation, remix suggestions, automated licensing reminders).
- Add subgraphs/analytics for onchain provenance and licensing revenue flows.

## Security and limitations
- Demo-quality app; production concerns like rate limiting, error handling, and secure secret management are partially implemented.
- Some Origin SDK calls have fallbacks for a smooth judge experience; toggling to strict onchain mode is straightforward in `licensingService.ts` and `accessControlService.ts`.

## Scripts
- `npm run dev` – start the dev server
- `npm run build` – build for production
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint

## License
MIT. See `LICENSE`.
