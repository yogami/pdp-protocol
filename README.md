# @openclaw/pdp

**PoE Discovery Protocol** — Trustless agent-to-agent discovery via cryptographic execution proofs.

[![npm version](https://badge.fury.io/js/%40openclaw%2Fpdp.svg)](https://www.npmjs.com/package/@openclaw/pdp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

PDP enables AI agents to discover each other through **proof-gated gossip**. Instead of trusting self-reported capabilities, agents verify peers via cryptographic hashes of completed work.

```
Agent A → Beacons PoE hash + capabilities
Agent B → Receives, validates proof, initiates collaboration
```

## Installation

```bash
npm install @openclaw/pdp
```

## Quick Start

```typescript
import { GossipBeacon, SemanticMatcher } from '@openclaw/pdp';

// Create a beacon
const beacon = new GossipBeacon('my-agent-id');
await beacon.start();

// Broadcast your PoE
await beacon.beacon(
  'sha256-hash-of-proof-bundle',
  ['code-refactor', 'security-audit']
);

// Listen for peers
beacon.onBeacon((peer) => {
  console.log(`Discovered: ${peer.nodeId} (veracity: ${peer.veracityScore})`);
  
  // Check capability match
  const match = SemanticMatcher.capabilitiesMatch(
    myCapabilities,
    peer.capabilities
  );
  
  if (match.similarity > 0.7) {
    console.log('Initiating collaboration...');
  }
});
```

## Features

- 🔐 **Trustless**: Verify proofs directly, no central authority
- 🧠 **Semantic Matching**: Find peers with complementary capabilities
- 🌐 **P2P Gossip**: libp2p-based decentralized broadcast
- ⛓️ **On-Chain Anchoring**: Optional Base L2 immutability
- 📜 **A2A Compatible**: Extends Google A2A AgentCard spec

## API

### GossipBeacon

```typescript
const beacon = new GossipBeacon(nodeId: string);
await beacon.start();
await beacon.beacon(poeHash: string, capabilities: string[]);
beacon.onBeacon(callback: (peer: PoEBeacon) => void);
await beacon.stop();
```

### SemanticMatcher

```typescript
const match = SemanticMatcher.capabilitiesMatch(caps1, caps2, threshold);
const peers = SemanticMatcher.findMatchingPeers(myCaps, peerList, threshold);
```

## A2A AgentCard Extension

Add PDP to your agent's well-known manifest:

```json
{
  "name": "My Agent",
  "poe_extension": {
    "version": "PDP/1.0",
    "veracity_score": 0.85,
    "last_proof_hash": "sha256...",
    "capabilities": ["task1", "task2"],
    "gossip_topic": "pdp/discovery/v1"
  }
}
```

## RFC Specification

See [draft-pdp-extension-00](./docs/draft-pdp-extension-00.txt) for the full IETF-style specification.

## License

MIT © Berlin AI Labs
