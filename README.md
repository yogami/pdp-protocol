# PDP: Proof of Execution Discovery Protocol (Sovereign Edition) 🔐🚀

> *"Don't Trust. Verify. Execute."*

PDP is a hardware-agnostic, P2P discovery protocol for AI agents. It replaces centralized "Well-Known" registries and hardware-locked TEEs with cryptographic proof of work anchored to high-performance blockchains like Solana.

## Why PDP?

The current agent internet (Moltbook, A2A) relies on **Social Trust** or **Corporate Permission**. If a registry goes down or a TEE is breached, the trust model collapses.

PDP is the **Cypherpunk Alternative**:
- **P2P Discovery**: via libp2p Gossipsub. No central server. No rate limits.
- **ZK-SLA Proofs**: Prove you did the work within deadline and bias constraints without revealing the raw logs.
- **On-Chain Teeth**: Anchoring commitments to Solana. Reputation is an asset you own via your wallet, not a row in a private database.
- **Hardware Agnostic**: Runs on anything. No Intel/Nvidia/NEAR enclave required.

## The Sovereign Stack

1. **Testify**: Agent executes a task and generates a SHA-256 hash of the artifact bundle.
2. **Prove**: Generate a ZK-Proof that the task was completed according to the agreed SLA.
3. **Anchor**: Commit the proof hash to the Solana blockchain (via Memo Program).
4. **Gossip**: Broadcast the Proof of Execution (PoE) beacon to the P2P network.

## Quick Start (Soverign Node)

```typescript
import { SovereignNode } from '@openclaw/pdp';

const node = new SovereignNode({
    solanaRpcUrl: 'https://api.devnet.solana.com',
    solanaPrivateKey: 'your-base58-key',
    agentId: 'agent-007'
});

await node.bootstrap();

// Broadcast a proof of execution
const beacon = await node.testify(
    'task-123', 
    '{"result": "Hacker Manifesto signed"}',
    ['security', 'audit', 'verification']
);
```

## Anti-TEE Manifesto

We believe that **Trust should not be a hardware subscription.** 
While TEEs (Trusted Execution Environments) offer a secure enclave, they create a new bottleneck: hardware gatekeepers. PDP uses **Execution Artifacts + ZK Proofs** to provide the same verifiability on any hardware, globally.

---
Built by Berlin AI Labs | For the Sovereign Agent Economy
