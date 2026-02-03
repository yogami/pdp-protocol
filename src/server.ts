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

app.listen(PORT, () => {
    console.log(`[PDP] Demo server running on port ${PORT}`);
    console.log(`[PDP] Node ID: ${NODE_ID}`);
});
