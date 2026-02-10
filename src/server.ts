/**
 * PDP VTA (Verifiable Trust Anchor) Node
 * 
 * VERA Reference Implementation (Phase 2)
 * Exposes PDP endpoints for Proof of Execution and Tool Execution Receipts.
 */

import express from 'express';
import { SovereignNode } from './SovereignNode';
import { PDP_TOPICS } from './discovery/GossipNode';
import { capabilitiesMatch, generateEmbedding } from './SemanticMatcher';
import { AaaS } from './blockchain/AaaS';

import { SignatureAlgorithm } from './crypto/SignatureProvider';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const NODE_ID = process.env.NODE_ID || 'pdp-sovereign-node';

// Initialize Sovereign Node (Hardened VERA Node)
const sovereignNode = new SovereignNode({
    agentId: NODE_ID,
    solanaRpcUrl: process.env.SOLANA_RPC_URL,
    solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY,
    signatureAlgorithm: (process.env.SIGNATURE_ALGO as SignatureAlgorithm) || 'Ed25519'
});

// Initialize Anchor Service
const aaas = new AaaS();

// Initialize Moltbook Signal Collector (Workstream 6)
import { MoltbookSignalCollector } from './vera/MoltbookSignalCollector';
if (process.env.MOLTBOOK_INTAKE_URL) {
    const collector = new MoltbookSignalCollector(
        sovereignNode,
        process.env.MOLTBOOK_INTAKE_URL
    );
    collector.start();
}

// Start the node
sovereignNode.bootstrap().catch(err => {
    console.error('Failed to bootstrap Sovereign Node:', err);
    process.exit(1);
});

// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        nodeId: NODE_ID,
        publicKey: sovereignNode.getPublicKey()
            ? Buffer.from(sovereignNode.getPublicKey()!).toString('hex')
            : 'bootstrapping'
    });
});

// ─── VERA §4.2.1a: Capability & Nonce Management ───

// Issue Authorization Nonce (PEP -> Tool)
app.post('/poe/issue-nonce', (req, res) => {
    const { actionId, toolId, requestHash } = req.body;

    if (!actionId || !toolId || !requestHash) {
        res.status(400).json({ error: 'Missing required fields: actionId, toolId, requestHash' });
        return;
    }

    try {
        const nonce = sovereignNode.issueAuthorizationNonce(actionId, toolId, requestHash);
        res.json({ nonce });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ─── VERA §4.2: Proof of Execution ───

// Testify (Broadcast PoE) with optional Receipt
app.post('/poe/testify', async (req, res) => {
    const { actionId, taskId, outputData, capabilities, receipt } = req.body;

    if (!actionId || !taskId || !outputData || !capabilities) {
        res.status(400).json({
            error: 'Missing required fields',
            required: ['actionId', 'taskId', 'outputData', 'capabilities']
        });
        return;
    }

    try {
        const poe = await sovereignNode.testify(
            actionId,
            taskId,
            outputData,
            capabilities,
            receipt // Optional ToolExecutionReceipt
        );
        res.json({ status: 'broadcasted', poe });
    } catch (error: any) {
        console.error('Testify error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── Legacy/Compatibility Endpoints (Mapped to VERA logic) ───

app.post('/beacon/start', async (_req, res) => {
    // Sovereign node starts automatically, but we acknowledge the request
    res.json({ status: 'started', topic: PDP_TOPICS.DISCOVERY });
});

app.post('/beacon/stop', async (_req, res) => {
    await sovereignNode.shutdown();
    res.json({ status: 'stopped' });
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

// A2A AgentCard with VERA PoE extension
app.get('/.well-known/agent.json', (_req, res) => {
    const pubKey = sovereignNode.getPublicKey();
    res.json({
        name: 'PDP Sovereign Node',
        protocol_version: 'PDP/2.0 (VERA)',
        poe_extension: {
            version: 'VERA/1.0',
            trust_tier: 'T2',
            capabilities: ['verification', 'anchoring', 'discovery'],
            gossip_topic: PDP_TOPICS.DISCOVERY,
            public_key: pubKey ? Buffer.from(pubKey).toString('hex') : null
        }
    });
});

// ─── Anchoring Service ───

app.post('/anchor', async (req, res) => {
    const { poeHash, agentId, agentSignature, agentPublicKey } = req.body;

    if (!poeHash || !agentId || !agentSignature || !agentPublicKey) {
        res.status(400).json({
            error: 'Missing required fields',
            required: ['poeHash', 'agentId', 'agentSignature', 'agentPublicKey']
        });
        return;
    }

    try {
        const result = await aaas.managedAnchor({
            poeHash,
            agentId,
            agentSignature,
            agentPublicKey
        });
        res.json(result);
    } catch (error: any) {
        res.status(403).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`[PDP] Sovereign Node running on port ${PORT}`);
    console.log(`[PDP] Node ID: ${NODE_ID}`);
});

