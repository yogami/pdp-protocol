/**
 * PDP Demo Server
 * Exposes PDP beacon and discovery endpoints
 */

import express from 'express';
import { GossipBeacon, PDP_TOPICS } from './GossipBeacon';
import { capabilitiesMatch, generateEmbedding } from './SemanticMatcher';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const NODE_ID = process.env.NODE_ID || 'pdp-demo-node';

// Initialize beacon
const beacon = new GossipBeacon(NODE_ID);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', nodeId: NODE_ID, veracity: beacon.getVeracity() });
});

// Start beacon
app.post('/beacon/start', async (_req, res) => {
    await beacon.start();
    res.json({ status: 'started', topic: PDP_TOPICS.DISCOVERY });
});

// Broadcast PoE
app.post('/beacon/broadcast', async (req, res) => {
    const { poeHash, capabilities, metadata } = req.body;
    if (!poeHash || !capabilities) {
        res.status(400).json({ error: 'poeHash and capabilities required' });
        return;
    }
    const result = await beacon.beacon(poeHash, capabilities, metadata);
    res.json({ status: 'broadcasted', beacon: result });
});

// Check capability match
app.post('/match', (req, res) => {
    const { myCaps, peerCaps, threshold } = req.body;
    const result = capabilitiesMatch(myCaps, peerCaps, threshold || 0.7);
    res.json(result);
});

// Generate embedding
app.post('/embed', (req, res) => {
    const { capabilities } = req.body;
    const vector = generateEmbedding(capabilities);
    res.json({ capabilities, vector });
});

// A2A AgentCard with PoE extension
app.get('/.well-known/agent.json', (_req, res) => {
    res.json({
        name: 'PDP Demo Node',
        protocol_version: 'PDP/1.0',
        poe_extension: {
            version: 'PDP/1.0',
            veracity_score: beacon.getVeracity(),
            capabilities: ['beacon', 'discovery', 'semantic-match'],
            gossip_topic: PDP_TOPICS.DISCOVERY,
            beacon_interval_ms: 300000
        }
    });
});

// Stop beacon
app.post('/beacon/stop', async (_req, res) => {
    await beacon.stop();
    res.json({ status: 'stopped' });
});

// =========== PoE-A2A EXTENSION ENDPOINTS ===========

// A2A AgentCard with PoE extension (updated for RFC spec)
app.get('/.well-known/agent-card.json', (_req, res) => {
    res.json({
        name: 'Berlin-Sovereign-Validator',
        description: 'PoE-A2A reference implementation for Colosseum Agent Hackathon',
        protocol_version: 'A2A/1.0',
        capabilities: ['verification', 'anchoring', 'discovery'],
        poe_extension: {
            version: 'PoE-A2A/1.0',
            signing_key: 'ed25519:' + (process.env.POE_SIGNING_KEY || 'demo-key'),
            claims_count: 1,
            claims_endpoint: '/.well-known/poe-claims.json',
            proof_endpoint: '/.well-known/poe-proofs/{claim_id}',
            authorized_anchors: [process.env.SOLANA_WALLET || 'devnet-wallet'],
            anchors: { solana: 'optional' }
        }
    });
});

// PoE Claims Endpoint
app.get('/.well-known/poe-claims.json', (_req, res) => {
    res.json([
        {
            id: 'claim-colosseum-001',
            key_id: 'v1',
            task_hash: 'sha256:hackathon-submission-feb-2026',
            output_hash: 'sha256:poe-a2a-sovereign-trust-layer',
            timestamp: Date.now(),
            valid_until: Date.now() + 30 * 24 * 60 * 60 * 1000,
            capabilities_used: ['verification', 'discovery'],
            signature: 'ed25519:demo-signature-pending-real-key'
        }
    ]);
});

// PoE Badge (dynamic SVG)
app.get('/.well-known/poe-badge.svg', (_req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(`
        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="20">
            <rect width="140" height="20" rx="3" fill="#1a1a1a"/>
            <rect x="0" width="50" height="20" rx="3" fill="#4CAF50"/>
            <text x="25" y="14" fill="#fff" font-family="Arial" font-size="11" text-anchor="middle">PoE</text>
            <text x="95" y="14" fill="#fff" font-family="Arial" font-size="11" text-anchor="middle">Verified</text>
        </svg>
    `);
});

app.listen(PORT, () => {
    console.log(`[PDP] Demo server running on port ${PORT}`);
    console.log(`[PDP] Node ID: ${NODE_ID}`);
});
