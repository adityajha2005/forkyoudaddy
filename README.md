## ForkYouDaddy

ForkYouDaddy is a Web3 application for creating, remixing, and licensing creative IP. Creators can register original works onchain, others can fork and build on them with attribution, and licenses define usage and monetization.

- Live app: https://forkyoudaddy.vercel.app
- Repository: https://github.com/adityajha2005/forkyoudaddy

### What it does
- Register and fork IP using the Camp Origin SDK
- Store content on IPFS via Pinata
- Discover and filter IPs with rich search and tags
- Purchase and verify licenses with local persistence and Origin-integration stubs
- Visualize remix relationships and view basic analytics

## Getting started

### Prerequisites
- Node.js 18+
- A browser wallet (MetaMask recommended)

### Install and run
```bash
git clone https://github.com/adityajha2005/forkyoudaddy
cd forkyoudaddy
npm install
cp .env.example .env
npm run dev
```

The app will prompt your wallet to connect and may request a network switch to the Basecamp network when performing onchain actions.

## Configuration

Create `.env` from `.env.example` and set the following:

```env
# Camp Origin SDK
VITE_CAMP_CLIENT_ID=

# IPFS / Pinata (use JWT if available; API key optional)
VITE_PINATA_JWT_TOKEN=
VITE_PINATA_API_KEY=

# Hugging Face (optional; enables AI helpers)
VITE_HUGGINGFACE_API_KEY=

# Supabase (optional; falls back to localStorage if absent)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Notes:
- The client uses `VITE_CAMP_CLIENT_ID` for Origin Auth initialization. No client-side API key is required for the current usage.
- If Supabase variables are not provided, the app uses localStorage as a fallback for data.
- Pinata JWT is preferred for uploads; API key is supported as a fallback.

## Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS
- React Router
- D3 (graph visualization)
- Camp Origin SDK (Auth, minting/forking flows)
- IPFS via Pinata
- Supabase (optional; with localStorage fallback)

## Key packages and scripts

Scripts:
- `npm run dev` – start the dev server
- `npm run build` – build for production
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint

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

Implementation details:
- Web3: origin auth is initialized via `VITE_CAMP_CLIENT_ID` and a browser wallet provider. Certain methods attempt graceful fallbacks if the full Origin SDK flow is unavailable.
- Data: when Supabase is not configured or unavailable, the app uses localStorage for IPs, comments, and follows.
- IPFS: uploads are done via Pinata. If credentials are missing, uploads will fail until configured.

## Contributing

Please read `CONTRIBUTING.md` for branching, commit style, and review expectations. In brief:
- Open an issue before large changes
- Keep PRs focused and small
- Add or update documentation when behavior changes

## Security and limitations

- This is a demo-quality application. Production hardening (rate limiting, robust error handling, secure secrets handling, and comprehensive access checks) is not complete.
- Some Origin SDK flows are stubbed with fallbacks in `licensingService.ts` and `accessControlService.ts`.

## License

MIT. See `LICENSE`.
