# VERA PDP Protocol - Deployment Guide

## Railway Configuration

The `pdp-protocol` is designed to run on Railway (or any Docker/Node.js compatible PaaS).

### Build & Start
- **Build Command:** `npm run build` (Runs `tsc`)
- **Start Command:** `npm start` (Runs `node dist/server.js`)

### Environment Variables

| Variable | Required | Default | Description |
|:---|:---|:---|:---|
| `PORT` | No | 3000 | Port to listen on (Railway sets this automatically) |
| `NODE_ID` | No | pdp-sovereign-node | Unique ID for this node in the P2P network |
| `SIGNATURE_ALGO` | Yes | Ed25519 | VERA Crypto Agility. Options: `Ed25519`, `ML-DSA-65` |
| `TRUST_TIER` | No | T2 | VERA Trust Tier (T1=Low, T2=High, T3=Critical) |
| `SOLANA_RPC_URL` | Yes | - | URL for Solana RPC (e.g., Helius, Alchemy) |
| `SOLANA_PRIVATE_KEY` | Yes | - | Base58 private key for the Anchor wallet |
| `BASE_RPC_URL` | No | - | Optional Base L2 RPC URL |
| `BASE_PRIVATE_KEY` | No | - | Optional Base L2 private key |

### Post-Deployment Verification
1. Check logs for `[SOVEREIGN] Bootstrapping ...`
2. Verify identity: `GET /health` -> should return `nodeId` and `publicKey`.
3. Check VERA status: `GET /.well-known/agent.json` -> should show correct `poe_extension` details.
