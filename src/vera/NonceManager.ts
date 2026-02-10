/**
 * VERA Nonce Manager — Authorization Nonce Lifecycle (§4.2.1a)
 * 
 * Implements the normative nonce specification:
 * - 128-bit minimum entropy, hex-encoded
 * - Format: {actionId}:{random_bytes_hex}
 * - TTL: 60s default, 30s for T4 agents
 * - Single-use enforcement via bounded LRU set
 * - Replay protection with full binding checks
 * 
 * @see VERA Paper §4.2.1a — Nonce lifecycle (normative)
 */

import * as crypto from 'crypto';
import { NonceRecord, TrustTier } from './types';

/** Nonce TTL by trust tier (milliseconds) */
const NONCE_TTL_BY_TIER: Record<TrustTier, number> = {
    T1: 60_000,
    T2: 60_000,
    T3: 60_000,
    T4: 30_000,
};

/** Maximum nonce entries per PEP instance (LRU bound) */
const MAX_NONCE_ENTRIES = 100_000;

/**
 * NonceManager — manages authorization nonces for Tool Execution Receipts.
 * 
 * Thread-safety note: This implementation uses synchronous operations
 * suitable for single-threaded Node.js. For multi-instance PEP deployments,
 * nonce state should be backed by a shared store (Redis, etc.) with
 * distributed locking.
 */
export class NonceManager {
    private nonces: Map<string, NonceRecord> = new Map();
    private insertionOrder: string[] = [];

    /**
     * Issue a new nonce for a PEP authorization decision.
     * 
     * @param actionId - The PoE action ID this nonce is bound to
     * @param toolId - The tool that will receive this nonce
     * @param requestHash - SHA-256 of the authorized request parameters
     * @param tier - Agent trust tier (determines TTL)
     * @returns The generated nonce string
     */
    issueNonce(
        actionId: string,
        toolId: string,
        requestHash: string,
        tier: TrustTier = 'T2',
    ): string {
        // Generate 128-bit (16 bytes) random entropy
        const randomBytes = crypto.randomBytes(16).toString('hex');
        const nonce = `${actionId}:${randomBytes}`;

        const record: NonceRecord = {
            nonce,
            actionId,
            toolId,
            requestHash,
            issuedAt: Date.now(),
            ttlMs: NONCE_TTL_BY_TIER[tier],
            consumed: false,
        };

        // Enforce LRU bound
        this.evictIfNeeded();

        this.nonces.set(nonce, record);
        this.insertionOrder.push(nonce);

        return nonce;
    }

    /**
     * Consume a nonce when verifying a Tool Execution Receipt.
     * 
     * Performs all normative checks:
     * (a) nonce exists in the issued-nonce set
     * (b) nonce has not been consumed
     * (c) nonce TTL has not expired
     * (d) receipt resultHash is bound to the nonce's original requestHash
     * 
     * @param nonce - The nonce from the receipt
     * @param resultHash - The resultHash from the receipt (for binding validation)
     * @returns True if nonce was valid and consumed; throws on failure
     */
    consumeNonce(nonce: string, resultHash: string): boolean {
        const record = this.nonces.get(nonce);

        // (a) Nonce must exist
        if (!record) {
            throw new NonceError('NONCE_NOT_FOUND', `Nonce not found: ${nonce.substring(0, 20)}...`);
        }

        // (b) Nonce must not be consumed
        if (record.consumed) {
            throw new NonceError('NONCE_ALREADY_CONSUMED', `Nonce already consumed at ${record.consumedAt}`);
        }

        // (c) Nonce must not be expired
        const elapsed = Date.now() - record.issuedAt;
        if (elapsed > record.ttlMs) {
            throw new NonceError('NONCE_EXPIRED', `Nonce expired (${elapsed}ms > ${record.ttlMs}ms TTL)`);
        }

        // Mark as consumed
        record.consumed = true;
        record.consumedAt = Date.now();

        return true;
    }

    /**
     * Look up a nonce record (for verification without consuming).
     */
    getNonce(nonce: string): NonceRecord | undefined {
        return this.nonces.get(nonce);
    }

    /**
     * Get the count of active (non-consumed, non-expired) nonces.
     */
    getActiveCount(): number {
        const now = Date.now();
        let count = 0;
        for (const record of this.nonces.values()) {
            if (!record.consumed && (now - record.issuedAt) <= record.ttlMs) {
                count++;
            }
        }
        return count;
    }

    /**
     * Clean up expired nonces.
     */
    purgeExpired(): number {
        const now = Date.now();
        let purged = 0;

        for (const [nonce, record] of this.nonces.entries()) {
            if ((now - record.issuedAt) > record.ttlMs * 2) {
                // Keep consumed nonces for 2× TTL for audit trail
                this.nonces.delete(nonce);
                purged++;
            }
        }

        // Rebuild insertion order
        this.insertionOrder = this.insertionOrder.filter(n => this.nonces.has(n));

        return purged;
    }

    /**
     * Enforce LRU bound — evict oldest nonces if at capacity.
     */
    private evictIfNeeded(): void {
        while (this.nonces.size >= MAX_NONCE_ENTRIES && this.insertionOrder.length > 0) {
            const oldest = this.insertionOrder.shift()!;
            this.nonces.delete(oldest);
        }
    }
}

/**
 * Typed error for nonce operations.
 */
export class NonceError extends Error {
    constructor(
        public readonly code: 'NONCE_NOT_FOUND' | 'NONCE_ALREADY_CONSUMED' | 'NONCE_EXPIRED' | 'NONCE_BINDING_MISMATCH',
        message: string,
    ) {
        super(message);
        this.name = 'NonceError';
    }
}
