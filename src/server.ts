/**
 * PDP VTA (Verifiable Trust Anchor) Node
 * 
 * VERA Reference Implementation (Phase 2)
 * Exposes PDP endpoints for Proof of Execution and Tool Execution Receipts.
 * 
 * NEW: Evidence persistence + dashboard query API (VERA Evidence Platform)
 */

import express from 'express';
import { SovereignNode } from './SovereignNode';
import { PDP_TOPICS } from './discovery/GossipNode';
import { capabilitiesMatch, generateEmbedding } from './SemanticMatcher';
import { AaaS } from './blockchain/AaaS';
import { EvidencePersistence } from './vera/persistence';

import { SignatureAlgorithm } from './crypto/SignatureProvider';

const app = express();
app.use(express.json());

// ─── CORS for Evidence Dashboard ───
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') { res.sendStatus(204); return; }
    next();
});

const PORT = process.env.PORT || 3000;
const NODE_ID = process.env.NODE_ID || 'pdp-sovereign-node';
const DB_PATH = process.env.EVIDENCE_DB_PATH || './vera-evidence.db';

// Initialize Evidence Persistence
const evidence = new EvidencePersistence(DB_PATH);
console.log(`[PDP] Evidence persistence initialized at ${DB_PATH}`);

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
            : 'bootstrapping',
        evidenceDb: DB_PATH
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
    const { actionId, taskId, outputData, capabilities, receipt, metadata } = req.body;

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

        // Persist to SQLite with SemaProof metadata
        try {
            evidence.store(poe, metadata);
        } catch (persistErr: any) {
            console.error('[PDP] Evidence persistence error (non-fatal):', persistErr.message);
        }

        res.json({ status: 'broadcasted', poe });
    } catch (error: any) {
        console.error('Testify error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── Evidence Ingest (SemaProof → PDP bridge) ───

app.post('/evidence/ingest', async (req, res) => {
    const { agentDid, classification, request: reqContext, sessionId } = req.body;

    if (!classification || !agentDid) {
        res.status(400).json({
            error: 'Missing required fields',
            required: ['agentDid', 'classification']
        });
        return;
    }

    try {
        const poe = await sovereignNode.testify(
            classification.actionId || `sema-${Date.now().toString(16)}`,
            `firewall-classify-${classification.label || 'UNKNOWN'}`,
            JSON.stringify({
                decision: classification.decision,
                label: classification.label,
                confidence: classification.confidence,
                layer: classification.layer,
                mitre: classification.mitre,
                eu_ai_act: classification.eu_ai_act
            }),
            ['firewall', 'semantic-classification', 'eu-ai-act-compliance']
        );

        // Persist with full SemaProof metadata
        evidence.store(poe, {
            decision: classification.decision,
            label: classification.label,
            confidence: classification.confidence,
            mitre: classification.mitre,
            eu_ai_act: classification.eu_ai_act,
            severity: classification.severity,
            latencyMs: classification.latencyMs
        });

        res.json({
            status: 'recorded',
            actionId: poe.actionId,
            sequenceNumber: poe.context.sequenceNumber,
            signature: poe.signature.substring(0, 32) + '...'
        });
    } catch (error: any) {
        console.error('[PDP] Evidence ingest error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── Evidence Query API (Dashboard) ───

// Get evidence chain with filtering
app.get('/poe/chain', (req, res) => {
    const options = {
        agentDid: req.query.agent as string,
        decision: req.query.decision as string,
        label: req.query.label as string,
        severity: req.query.severity as string,
        from: req.query.from as string,
        to: req.query.to as string,
        limit: parseInt(req.query.limit as string) || 100,
        offset: parseInt(req.query.offset as string) || 0,
    };

    try {
        const records = evidence.query(options);
        res.json({ count: records.length, records });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get single PoE by action ID
app.get('/poe/chain/:actionId', (req, res) => {
    try {
        const record = evidence.getByActionId(req.params.actionId);
        if (!record) {
            res.status(404).json({ error: 'PoE not found' });
            return;
        }
        res.json(record);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get aggregate stats for dashboard
app.get('/poe/stats', (_req, res) => {
    try {
        const stats = evidence.getStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Export evidence as CSV
app.get('/poe/export', (req, res) => {
    try {
        const records = evidence.query({
            agentDid: req.query.agent as string,
            from: req.query.from as string,
            to: req.query.to as string,
            limit: 10000
        });

        const csvHeader = 'Timestamp,Agent,Decision,Label,Confidence,MITRE,EU_AI_Act,Severity,Latency_ms,Action_ID,Signature\n';
        const csvRows = records.map((r: any) => {
            const m = r._meta || {};
            return [
                r.timestamp?.agentClock || '',
                r.agentDid || '',
                m.decision || '',
                m.label || '',
                m.confidence || '',
                m.mitre || '',
                m.eu_ai_act || '',
                m.severity || '',
                m.latencyMs || '',
                r.actionId || '',
                (r.signature || '').substring(0, 32)
            ].join(',');
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="vera-evidence-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvHeader + csvRows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ─── Compliance Report (Print-to-PDF HTML) ───

app.get('/poe/report', (req, res) => {
    try {
        const stats = evidence.getStats();
        const records = evidence.query({ limit: 10000 });
        const role = req.query.role as string || 'compliance';
        const now = new Date().toISOString();

        // Compute per-agent scores
        const agents: Record<string, { total: number; blocked: number; allowed: number }> = {};
        records.forEach((r: any) => {
            const did = r.agentDid || 'unknown';
            if (!agents[did]) agents[did] = { total: 0, blocked: 0, allowed: 0 };
            agents[did].total++;
            if (r._meta?.decision === 'BLOCK') agents[did].blocked++;
            else agents[did].allowed++;
        });

        const agentRows = Object.entries(agents).map(([did, d]) => {
            const score = d.total > 0 ? Math.round((d.allowed / d.total) * 100) : 100;
            const risk = d.blocked === 0 ? 'LOW' : (d.blocked / d.total > 0.1 ? 'HIGH' : 'MEDIUM');
            return `<tr><td>${did}</td><td>${score}%</td><td>${d.total}</td><td>${d.blocked}</td><td style="color:${risk === 'LOW' ? '#10b981' : '#ef4444'}">${risk}</td></tr>`;
        }).join('');

        const articleRows = Object.entries(stats.articleBreakdown).map(([article, count]) => {
            const status = count > 0 ? '<span style="color:#ef4444">⚠ VIOLATIONS</span>' : '<span style="color:#10b981">✓ COMPLIANT</span>';
            return `<tr><td>${article}</td><td>${count}</td><td>${status}</td></tr>`;
        }).join('');

        const threatRows = Object.entries(stats.threatBreakdown).sort(([, a], [, b]) => (b as number) - (a as number)).map(([label, count]) =>
            `<tr><td>${label.replace(/_/g, ' ')}</td><td>${count}</td></tr>`
        ).join('');

        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>VERA Compliance Report — ${new Date().toLocaleDateString()}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; line-height: 1.6; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 1.6rem; color: #0a0e17; border-bottom: 3px solid #3b82f6; padding-bottom: 8px; margin-bottom: 24px; }
  h2 { font-size: 1.1rem; color: #1e293b; margin: 24px 0 12px; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
  .meta { font-size: 0.8rem; color: #64748b; margin-bottom: 24px; }
  .meta span { margin-right: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 16px; }
  th { background: #f1f5f9; text-align: left; padding: 8px 12px; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
  td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #fafbfc; }
  .stat-row { display: flex; gap: 16px; margin-bottom: 24px; }
  .stat-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
  .stat-box .val { font-size: 2rem; font-weight: 800; color: #0a0e17; }
  .stat-box .lbl { font-size: 0.7rem; text-transform: uppercase; color: #64748b; margin-top: 4px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 0.7rem; color: #94a3b8; text-align: center; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style></head><body>
<button class="no-print" onclick="window.print()" style="position:fixed;top:16px;right:16px;padding:8px 20px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;">Print / Save PDF</button>

<h1>🛡️ VERA EU AI Act Compliance Report</h1>
<div class="meta">
  <span>Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} ${new Date().toLocaleTimeString('en-GB')}</span>
  <span>Period: All records</span>
  <span>Report ID: VERA-${Date.now().toString(36).toUpperCase()}</span>
</div>

<div class="stat-row">
  <div class="stat-box"><div class="val">${stats.totalRecords}</div><div class="lbl">Total Evidence Records</div></div>
  <div class="stat-box"><div class="val">${stats.totalAllowed}</div><div class="lbl">Allowed Actions</div></div>
  <div class="stat-box"><div class="val" style="color:#ef4444">${stats.totalBlocked}</div><div class="lbl">Blocked Actions</div></div>
  <div class="stat-box"><div class="val">${stats.uniqueAgents}</div><div class="lbl">Active Agents</div></div>
</div>

<h2>EU AI Act Article Compliance Status</h2>
<table>
  <tr><th>Article</th><th>Violations</th><th>Status</th></tr>
  <tr><td>Article 9 — Risk Management</td><td>${stats.articleBreakdown['Article 9'] || 0}</td><td>${(stats.articleBreakdown['Article 9'] || 0) > 0 ? '<span style="color:#ef4444">⚠ VIOLATIONS</span>' : '<span style="color:#10b981">✓ COMPLIANT</span>'}</td></tr>
  <tr><td>Article 10 — Data Governance</td><td>${stats.articleBreakdown['Article 10'] || 0}</td><td>${(stats.articleBreakdown['Article 10'] || 0) > 0 ? '<span style="color:#ef4444">⚠ VIOLATIONS</span>' : '<span style="color:#10b981">✓ COMPLIANT</span>'}</td></tr>
  <tr><td>Article 13 — Transparency</td><td>${stats.articleBreakdown['Article 13'] || 0}</td><td>${(stats.articleBreakdown['Article 13'] || 0) > 0 ? '<span style="color:#ef4444">⚠ VIOLATIONS</span>' : '<span style="color:#10b981">✓ COMPLIANT</span>'}</td></tr>
  <tr><td>Article 15 — Accuracy & Cybersecurity</td><td>${stats.articleBreakdown['Article 15'] || 0}</td><td>${(stats.articleBreakdown['Article 15'] || 0) > 0 ? '<span style="color:#ef4444">⚠ VIOLATIONS</span>' : '<span style="color:#10b981">✓ COMPLIANT</span>'}</td></tr>
  ${articleRows}
</table>

<h2>Agent Compliance Scores</h2>
<table>
  <tr><th>Agent DID</th><th>Score</th><th>Actions</th><th>Blocked</th><th>Risk</th></tr>
  ${agentRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8">No agent data recorded</td></tr>'}
</table>

<h2>Threat Activity Summary</h2>
<table>
  <tr><th>Threat Category</th><th>Incidents</th></tr>
  ${threatRows || '<tr><td colspan="2" style="text-align:center;color:#94a3b8">No threats detected</td></tr>'}
</table>

<h2>Evidence Chain Metadata</h2>
<table>
  <tr><th>Property</th><th>Value</th></tr>
  <tr><td>Chain Height</td><td>#${stats.latestSequenceNumber}</td></tr>
  <tr><td>Latest Record</td><td>${stats.latestTimestamp || 'N/A'}</td></tr>
  <tr><td>Signing Algorithm</td><td>Ed25519 (RFC 8032)</td></tr>
  <tr><td>Hash Chain</td><td>SHA-256 (RFC 6234)</td></tr>
  <tr><td>Canonicalization</td><td>JCS (RFC 8785)</td></tr>
  <tr><td>Storage</td><td>SQLite WAL (Local Sovereign)</td></tr>
</table>

<div class="footer">
  VERA Evidence Platform — Berlin AI Labs<br>
  This report was generated from cryptographically signed evidence records. Each record can be independently verified using the Ed25519 public key of the signing agent.
</div>
</body></html>`;

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ─── Compliance Scores API ───

app.get('/poe/scores', (_req, res) => {
    try {
        const records = evidence.query({ limit: 10000 });
        const agents: Record<string, { total: number; blocked: number; allowed: number; threats: string[] }> = {};

        records.forEach((r: any) => {
            const did = r.agentDid || 'unknown';
            if (!agents[did]) agents[did] = { total: 0, blocked: 0, allowed: 0, threats: [] };
            agents[did].total++;
            if (r._meta?.decision === 'BLOCK') {
                agents[did].blocked++;
                if (r._meta?.label) agents[did].threats.push(r._meta.label);
            } else {
                agents[did].allowed++;
            }
        });

        const scores = Object.entries(agents).map(([did, data]) => ({
            agentDid: did,
            complianceScore: data.total > 0 ? Math.round((data.allowed / data.total) * 100) : 100,
            totalActions: data.total,
            blocked: data.blocked,
            allowed: data.allowed,
            riskLevel: data.blocked === 0 ? 'LOW' : (data.blocked / data.total > 0.1 ? 'HIGH' : 'MEDIUM'),
            topThreats: [...new Set(data.threats)].slice(0, 5)
        }));

        res.json({ agents: scores });
    } catch (error: any) {
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
            capabilities: ['verification', 'anchoring', 'discovery', 'evidence-dashboard'],
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

// ─── Graceful Shutdown ───

process.on('SIGTERM', () => {
    console.log('[PDP] Shutting down, closing evidence DB...');
    evidence.close();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`[PDP] Sovereign Node running on port ${PORT}`);
    console.log(`[PDP] Node ID: ${NODE_ID}`);
    console.log(`[PDP] Evidence API: GET /poe/chain, /poe/stats, /poe/export`);
    console.log(`[PDP] Evidence Ingest: POST /evidence/ingest`);
});

