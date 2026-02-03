# PoE-A2A: Sovereign Trust Layer

**Colosseum Agent Hackathon Submission** | Feb 2-12, 2026

📹 **[Watch the Presentation Video (82s)](https://res.cloudinary.com/djol0rpn5/video/upload/v1770156402/poe_a2a_colosseum_presentation_2026.mp4)**

> *"Verify agent performance. No gatekeepers required."*

## 🏆 What We Built

**PoE-A2A** is an HTTP-first verification layer for the emerging Agent-to-Agent (A2A) web. It enables AI agents to:

1. **Publish cryptographically signed execution claims** at `/.well-known/poe-claims.json`
2. **Anchor high-value proofs** to the **Solana Memo Program** for immutable audit trails
3. **Display verification badges** for human-in-the-loop discovery

This creates a **sovereign reputation layer** where agents own their history—independent of centralized registries.

## 🔗 Solana Integration

We chose Solana for its:
- **Sub-second finality** — Proofs are anchored in real-time
- **Low fees** — $0.0001 per anchor makes verification accessible
- **Memo Program** — Native text storage ideal for proof hashes

### How It Works

```typescript
// Anchor a PoE commitment to Solana
const result = await solanaAdapter.anchorPoE(poeHash, agentId);
// Returns: { signature, explorerUrl }

// Verify an existing anchor
const verification = await solanaAdapter.verifyAnchor(signature, expectedHash);
// Returns: { valid: true, data: "..." }
```

## 🌐 Live Endpoints

When deployed, the agent exposes:

| Endpoint | Description |
|----------|-------------|
| `/.well-known/agent-card.json` | A2A-compatible AgentCard with PoE extension |
| `/.well-known/poe-claims.json` | Signed execution history |
| `/.well-known/poe-badge.svg` | Dynamic verification badge |

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/yogami/pdp-protocol
cd pdp-protocol
npm install

# Build and run
npm run build
npm start
```

## 📄 Technical Specification

See the full RFC: [draft-pdp-a2a-extension-00.txt](docs/draft-pdp-a2a-extension-00.txt)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Agent Runtime                        │
├─────────────────────────────────────────────────────────┤
│  PoE Claim Generator  →  Ed25519 Signer  →  Anchor?    │
│         ↓                      ↓                ↓       │
│  poe-claims.json       Signature Store     Solana TX   │
└─────────────────────────────────────────────────────────┘
```

## 🏆 Why This Matters

In the 2026 agentic web, **trust is the bottleneck**. PoE-A2A provides:

- **For Developers**: Add one field to your AgentCard, get verifiable reputation
- **For Enterprises**: Audit trails without vendor lock-in
- **For Solana**: Expand beyond DeFi into AI infrastructure

---

Built by **Berlin AI Labs** for the Colosseum Agent Hackathon 🏛️
