A playground for requesting and redeeming MetaMask Advanced Permissions (ERC-7715) on Sepolia. Users connect with Web3Auth, grant a periodic transfer permission via MetaMask Flask, and redeem it through a server-side session key (frontend never sees the key).

## Flow
1) Connect with Web3Auth (wagmi + Web3Auth modal) on Sepolia.
2) Backend derives the session account from `SESSION_PRIVATE_KEY` and exposes only address/balance; low-balance warnings are shown.
3) Request permission in MetaMask Flask, receiving `permissionsContext` and `delegationManager`.
4) Redeem via `/api/redeem`; backend signs with the session key and returns a clickable Sepolia Etherscan tx hash.

## Stack
- Next.js App Router, TypeScript, wagmi
- MetaMask Smart Accounts Kit (ERC-7715) with Flask
- Web3Auth modal for auth
- viem for RPC calls

## Requirements
- Node 18+
- MetaMask Flask 13.5.0+ (disable regular MetaMask)
- Sepolia network selected
- Some Sepolia ETH in the session account for gas

## Setup
```bash
git clone https://github.com/cadalt0/-ERC-7715-Dev-Playground.git
cd nextjs-app
npm install
```

Create `.env` (not committed):
```
SESSION_PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://<your-sepolia-rpc>          # optional, server-side preferred
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org # public endpoint for frontend reads
```

Notes on env:
- Do not place paid RPC keys in `NEXT_PUBLIC_*` (browser-exposed). Use public RPCs for frontend reads.
- `.env` is gitignored.

## Run locally
```bash
npm run dev
# open http://localhost:3000
```

## Key files
- Main UI: [app/page.tsx](app/page.tsx) and layout [app/layout.tsx](app/layout.tsx)
- Permission request flow: [components/PermissionRequest.tsx](components/PermissionRequest.tsx)
- Permission redeem flow: [components/PermissionRedeem.tsx](components/PermissionRedeem.tsx)
- Session account hook/API: [hooks/useSessionAccount.ts](hooks/useSessionAccount.ts), [app/api/session-account/route.ts](app/api/session-account/route.ts)
- Redeem API and server helper: [app/api/redeem/route.ts](app/api/redeem/route.ts) → [lib/redeem-server.ts](lib/redeem-server.ts)
- Web3Auth config: [lib/web3auth-config.ts](lib/web3auth-config.ts)
- 404 page: [app/not-found.tsx](app/not-found.tsx)

## Things to know
- Session key stays server-side only.
- Low-balance checks and RPC fallbacks are in `/api/session-account` and `/api/redeem`.
- Success messages include a clickable Sepolia Etherscan tx hash.

## Scripts
- `npm run dev` — start the dev server

## Troubleshooting
- Install/enable MetaMask Flask and disable regular MetaMask.
- Stay on Sepolia; if prompted, switch networks.
- If RPC calls timeout, set a reliable `SEPOLIA_RPC_URL` on the server and use a public RPC for `NEXT_PUBLIC_SEPOLIA_RPC_URL`.
