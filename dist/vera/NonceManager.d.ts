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
import { NonceRecord, TrustTier } from './types';
/**
 * NonceManager — manages authorization nonces for Tool Execution Receipts.
 *
 * Thread-safety note: This implementation uses synchronous operations
 * suitable for single-threaded Node.js. For multi-instance PEP deployments,
 * nonce state should be backed by a shared store (Redis, etc.) with
 * distributed locking.
 */
export declare class NonceManager {
    private nonces;
    private insertionOrder;
    /**
     * Issue a new nonce for a PEP authorization decision.
     *
     * @param actionId - The PoE action ID this nonce is bound to
     * @param toolId - The tool that will receive this nonce
     * @param requestHash - SHA-256 of the authorized request parameters
     * @param tier - Agent trust tier (determines TTL)
     * @returns The generated nonce string
     */
    issueNonce(actionId: string, toolId: string, requestHash: string, tier?: TrustTier): string;
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
    consumeNonce(nonce: string, resultHash: string): boolean;
    /**
     * Look up a nonce record (for verification without consuming).
     */
    getNonce(nonce: string): NonceRecord | undefined;
    /**
     * Get the count of active (non-consumed, non-expired) nonces.
     */
    getActiveCount(): number;
    /**
     * Clean up expired nonces.
     */
    purgeExpired(): number;
    /**
     * Enforce LRU bound — evict oldest nonces if at capacity.
     */
    private evictIfNeeded;
}
/**
 * Typed error for nonce operations.
 */
export declare class NonceError extends Error {
    readonly code: 'NONCE_NOT_FOUND' | 'NONCE_ALREADY_CONSUMED' | 'NONCE_EXPIRED' | 'NONCE_BINDING_MISMATCH';
    constructor(code: 'NONCE_NOT_FOUND' | 'NONCE_ALREADY_CONSUMED' | 'NONCE_EXPIRED' | 'NONCE_BINDING_MISMATCH', message: string);
}
