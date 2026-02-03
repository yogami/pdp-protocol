# PoE-A2A: Proof of Execution for the Agentic Web 🔐🚀

[![PoE Verified](https://pdp-protocol-production.up.railway.app/.well-known/poe-badge.svg)](https://pdp-protocol-production.up.railway.app/.well-known/poe-claims.json)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://pdp-protocol-production.up.railway.app/.well-known/agent-card.json)
[![RFC Draft](https://img.shields.io/badge/RFC-draft--pdp--a2a--extension--00-blue)](./docs/draft-pdp-a2a-extension-00.txt)

> *"Don't just believe an agent. Verify its history."*

**📹 [Watch the 82s Overview](https://res.cloudinary.com/djol0rpn5/video/upload/v1770156402/poe_a2a_colosseum_presentation_2026.mp4)** | **🏆 [Colosseum Hackathon Submission](./COLOSSEUM_README.md)**

PoE-A2A is a lightweight, HTTP-first extension to the **Google A2A (Agent-to-Agent)** discovery protocol. It allows AI agents to prove their past performance and reliability through cryptographically signed execution claims—without the overhead of P2P gossip networks or mandatory blockchain fees.

## 🌟 Key Features

- **HTTP-First Discovery**: Works with any standard web host or $5/month VPS.
- **Google A2A Native**: Extends standard `agent-card.json` metadata.
- **Cryptographic Trust**: Claims are signed with Ed25519 using RFC 8785 (JCS).
- **Optional Anchoring**: High-value work can be archived on Solana or Base for long-term audit trails.
- **Sovereign Reputation**: You own your execution history. No central registry can delist your "reputation."

## 🛠️ The Stack

1. **Advertise**: Add the `poe_extension` field to your `/.well-known/agent-card.json`.
2. **Publish**: Serve your signed execution history at `/.well-known/poe-claims.json`.
3. **Verify**: Other agents fetch your claims and verify signatures locally in <5ms.
4. **Anchor (Optional)**: Commit proof hashes to a blockchain for enterprise-grade durability.

## 🚀 Quick Start

### 1. Update your AgentCard
Add the following to your `/.well-known/agent-card.json`:

```json
{
  "name": "MySovereignAgent",
  "poe_extension": {
    "version": "PoE-A2A/1.0",
    "signing_key": "ed25519:YOUR_PUBLIC_KEY",
    "claims_endpoint": "/.well-known/poe-claims.json",
    "proof_endpoint": "/.well-known/poe-proofs/{claim_id}"
  }
}
```

### 2. Host PoE Claims
Serve a list of signed claims at your endpoint:

```json
[
  {
    "id": "claim-001",
    "task_hash": "sha256:...",
    "output_hash": "sha256:...",
    "timestamp": 1707000000000,
    "signature": "ed25519:..."
  }
]
```

## 🛡️ "Verified Indie" Badge
Agents meeting minimum execution thresholds can display a live-updating SVG badge:

`![PoE Verified](https://agent.example.com/.well-known/poe-badge.svg)`

## 📖 Documentation
- [View the RFC Draft (Informational)](docs/draft-pdp-a2a-extension-00.txt)
- [Read the Indie Agent Manifesto](INDIE_MANIFESTO.md)

---
Built by **Berlin AI Labs** | Empowering the Sovereign Agent Economy
