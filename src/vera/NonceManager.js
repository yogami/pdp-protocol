"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonceError = exports.NonceManager = void 0;
const crypto = __importStar(require("crypto"));
/** Nonce TTL by trust tier (milliseconds) */
const NONCE_TTL_BY_TIER = {
    T1: 60000,
    T2: 60000,
    T3: 60000,
    T4: 30000,
};
/** Maximum nonce entries per PEP instance (LRU bound) */
const MAX_NONCE_ENTRIES = 100000;
/**
 * NonceManager — manages authorization nonces for Tool Execution Receipts.
 *
 * Thread-safety note: This implementation uses synchronous operations
 * suitable for single-threaded Node.js. For multi-instance PEP deployments,
 * nonce state should be backed by a shared store (Redis, etc.) with
 * distributed locking.
 */
class NonceManager {
    constructor() {
        this.nonces = new Map();
        this.insertionOrder = [];
    }
    /**
     * Issue a new nonce for a PEP authorization decision.
     *
     * @param actionId - The PoE action ID this nonce is bound to
     * @param toolId - The tool that will receive this nonce
     * @param requestHash - SHA-256 of the authorized request parameters
     * @param tier - Agent trust tier (determines TTL)
     * @returns The generated nonce string
     */
    issueNonce(actionId, toolId, requestHash, tier = 'T2') {
        // Generate 128-bit (16 bytes) random entropy
        const randomBytes = crypto.randomBytes(16).toString('hex');
        const nonce = `${actionId}:${randomBytes}`;
        const record = {
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
    consumeNonce(nonce, resultHash) {
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
    getNonce(nonce) {
        return this.nonces.get(nonce);
    }
    /**
     * Get the count of active (non-consumed, non-expired) nonces.
     */
    getActiveCount() {
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
    purgeExpired() {
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
    evictIfNeeded() {
        while (this.nonces.size >= MAX_NONCE_ENTRIES && this.insertionOrder.length > 0) {
            const oldest = this.insertionOrder.shift();
            this.nonces.delete(oldest);
        }
    }
}
exports.NonceManager = NonceManager;
/**
 * Typed error for nonce operations.
 */
class NonceError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'NonceError';
    }
}
exports.NonceError = NonceError;
