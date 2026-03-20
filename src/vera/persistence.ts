/**
 * VERA Evidence Persistence — SQLite Storage for PoE Chain
 * 
 * Durably stores Proof of Execution records with query support
 * for the Evidence Dashboard. Uses better-sqlite3 for synchronous,
 * zero-config embedded storage.
 * 
 * @module vera/persistence
 */

import Database from 'better-sqlite3';
import { ProofOfExecution } from './types';

export interface EvidenceQueryOptions {
    /** Filter by agent DID */
    agentDid?: string;
    /** Filter by action type (e.g., 'classify', 'BLOCK', 'ALLOW') */
    decision?: string;
    /** Filter by threat label */
    label?: string;
    /** Filter by severity */
    severity?: string;
    /** Start of time range (ISO8601) */
    from?: string;
    /** End of time range (ISO8601) */
    to?: string;
    /** Limit results */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
}

export interface EvidenceStats {
    totalRecords: number;
    uniqueAgents: number;
    totalBlocked: number;
    totalAllowed: number;
    latestSequenceNumber: number;
    latestTimestamp: string | null;
    threatBreakdown: Record<string, number>;
    articleBreakdown: Record<string, number>;
}

export class EvidencePersistence {
    private db: Database.Database;

    constructor(dbPath: string = './vera-evidence.db') {
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        this.initialize();
    }

    /**
     * Create tables if they don't exist.
     */
    private initialize(): void {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS poe_records (
                action_id TEXT PRIMARY KEY,
                agent_did TEXT NOT NULL,
                signer_type TEXT NOT NULL,
                signature_algorithm TEXT NOT NULL,
                action_type TEXT NOT NULL,
                action_target TEXT NOT NULL,
                action_parameters TEXT NOT NULL,
                result_hash TEXT NOT NULL,
                session_id TEXT NOT NULL,
                sequence_number INTEGER NOT NULL,
                previous_proof_hash TEXT NOT NULL,
                parent_action_id TEXT,
                triggered_by TEXT NOT NULL,
                decision TEXT,
                label TEXT,
                confidence REAL,
                mitre TEXT,
                eu_ai_act TEXT,
                severity TEXT,
                latency_ms REAL,
                timestamp_agent TEXT NOT NULL,
                signature TEXT NOT NULL,
                key_id TEXT NOT NULL,
                receipt_hash TEXT,
                receipt_assurance TEXT,
                anchor_backend TEXT,
                anchor_id TEXT,
                anchor_timestamp TEXT,
                raw_json TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_poe_agent ON poe_records(agent_did);
            CREATE INDEX IF NOT EXISTS idx_poe_timestamp ON poe_records(timestamp_agent);
            CREATE INDEX IF NOT EXISTS idx_poe_decision ON poe_records(decision);
            CREATE INDEX IF NOT EXISTS idx_poe_label ON poe_records(label);
            CREATE INDEX IF NOT EXISTS idx_poe_sequence ON poe_records(sequence_number);
        `);
    }

    /**
     * Store a PoE record with optional SemaProof metadata.
     */
    store(poe: ProofOfExecution, metadata?: {
        decision?: string;
        label?: string;
        confidence?: number;
        mitre?: string;
        eu_ai_act?: string;
        severity?: string;
        latencyMs?: number;
    }): void {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO poe_records (
                action_id, agent_did, signer_type, signature_algorithm,
                action_type, action_target, action_parameters, result_hash,
                session_id, sequence_number, previous_proof_hash,
                parent_action_id, triggered_by,
                decision, label, confidence, mitre, eu_ai_act, severity, latency_ms,
                timestamp_agent, signature, key_id,
                receipt_hash, receipt_assurance,
                anchor_backend, anchor_id, anchor_timestamp,
                raw_json
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?
            )
        `);

        stmt.run(
            poe.actionId,
            poe.agentDid,
            poe.signerType,
            poe.signatureAlgorithm,
            poe.action.type,
            poe.action.target,
            JSON.stringify(poe.action.parameters),
            poe.action.resultHash,
            poe.context.sessionId,
            poe.context.sequenceNumber,
            poe.context.previousProofHash,
            poe.context.parentActionId || null,
            poe.context.triggeredBy,
            metadata?.decision || null,
            metadata?.label || null,
            metadata?.confidence || null,
            metadata?.mitre || null,
            metadata?.eu_ai_act || null,
            metadata?.severity || null,
            metadata?.latencyMs || null,
            poe.timestamp.agentClock,
            poe.signature,
            poe.keyId,
            poe.receiptHash || null,
            poe.receiptAssurance || null,
            poe.anchor?.backend || null,
            poe.anchor?.anchorId || null,
            poe.anchor?.anchorTimestamp || null,
            JSON.stringify(poe)
        );
    }

    /**
     * Query evidence records with filtering.
     */
    query(options: EvidenceQueryOptions = {}): ProofOfExecution[] {
        const conditions: string[] = [];
        const params: any[] = [];

        if (options.agentDid) {
            conditions.push('agent_did = ?');
            params.push(options.agentDid);
        }
        if (options.decision) {
            conditions.push('decision = ?');
            params.push(options.decision);
        }
        if (options.label) {
            conditions.push('label = ?');
            params.push(options.label);
        }
        if (options.severity) {
            conditions.push('severity = ?');
            params.push(options.severity);
        }
        if (options.from) {
            conditions.push('timestamp_agent >= ?');
            params.push(options.from);
        }
        if (options.to) {
            conditions.push('timestamp_agent <= ?');
            params.push(options.to);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limit = options.limit || 100;
        const offset = options.offset || 0;

        const stmt = this.db.prepare(
            `SELECT raw_json, decision, label, confidence, mitre, eu_ai_act, severity, latency_ms
             FROM poe_records ${where}
             ORDER BY sequence_number DESC
             LIMIT ? OFFSET ?`
        );

        const rows = stmt.all(...params, limit, offset) as any[];
        return rows.map(row => {
            const poe = JSON.parse(row.raw_json);
            // Attach SemaProof metadata for dashboard
            poe._meta = {
                decision: row.decision,
                label: row.label,
                confidence: row.confidence,
                mitre: row.mitre,
                eu_ai_act: row.eu_ai_act,
                severity: row.severity,
                latencyMs: row.latency_ms
            };
            return poe;
        });
    }

    /**
     * Get a single PoE by action ID.
     */
    getByActionId(actionId: string): ProofOfExecution | null {
        const stmt = this.db.prepare(
            `SELECT raw_json, decision, label, confidence, mitre, eu_ai_act, severity, latency_ms
             FROM poe_records WHERE action_id = ?`
        );
        const row = stmt.get(actionId) as any;
        if (!row) return null;

        const poe = JSON.parse(row.raw_json);
        poe._meta = {
            decision: row.decision,
            label: row.label,
            confidence: row.confidence,
            mitre: row.mitre,
            eu_ai_act: row.eu_ai_act,
            severity: row.severity,
            latencyMs: row.latency_ms
        };
        return poe;
    }

    /**
     * Get aggregate statistics for the dashboard.
     */
    getStats(): EvidenceStats {
        const total = (this.db.prepare('SELECT COUNT(*) as c FROM poe_records').get() as any).c;
        const agents = (this.db.prepare('SELECT COUNT(DISTINCT agent_did) as c FROM poe_records').get() as any).c;
        const blocked = (this.db.prepare("SELECT COUNT(*) as c FROM poe_records WHERE decision = 'BLOCK'").get() as any).c;
        const allowed = (this.db.prepare("SELECT COUNT(*) as c FROM poe_records WHERE decision = 'ALLOW'").get() as any).c;
        const latest = this.db.prepare('SELECT MAX(sequence_number) as seq, MAX(timestamp_agent) as ts FROM poe_records').get() as any;

        // Threat breakdown
        const threats = this.db.prepare(
            "SELECT label, COUNT(*) as c FROM poe_records WHERE label IS NOT NULL AND label != 'SAFE' GROUP BY label ORDER BY c DESC"
        ).all() as any[];
        const threatBreakdown: Record<string, number> = {};
        for (const t of threats) threatBreakdown[t.label] = t.c;

        // EU AI Act article breakdown
        const articles = this.db.prepare(
            "SELECT eu_ai_act, COUNT(*) as c FROM poe_records WHERE eu_ai_act IS NOT NULL GROUP BY eu_ai_act ORDER BY c DESC"
        ).all() as any[];
        const articleBreakdown: Record<string, number> = {};
        for (const a of articles) articleBreakdown[a.eu_ai_act] = a.c;

        return {
            totalRecords: total,
            uniqueAgents: agents,
            totalBlocked: blocked,
            totalAllowed: allowed,
            latestSequenceNumber: latest.seq || 0,
            latestTimestamp: latest.ts || null,
            threatBreakdown,
            articleBreakdown
        };
    }

    /**
     * Get chain state for ProofEngine restoration.
     */
    getChainState(): { sequenceNumber: number; previousProofHash: string } | null {
        const row = this.db.prepare(
            'SELECT sequence_number, previous_proof_hash FROM poe_records ORDER BY sequence_number DESC LIMIT 1'
        ).get() as any;

        if (!row) return null;
        return {
            sequenceNumber: row.sequence_number,
            previousProofHash: row.previous_proof_hash
        };
    }

    /**
     * Close the database connection.
     */
    close(): void {
        this.db.close();
    }
}
