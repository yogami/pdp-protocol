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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9uY2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZlcmEvTm9uY2VNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7R0FXRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsK0NBQWlDO0FBR2pDLDZDQUE2QztBQUM3QyxNQUFNLGlCQUFpQixHQUE4QjtJQUNqRCxFQUFFLEVBQUUsS0FBTTtJQUNWLEVBQUUsRUFBRSxLQUFNO0lBQ1YsRUFBRSxFQUFFLEtBQU07SUFDVixFQUFFLEVBQUUsS0FBTTtDQUNiLENBQUM7QUFFRix5REFBeUQ7QUFDekQsTUFBTSxpQkFBaUIsR0FBRyxNQUFPLENBQUM7QUFFbEM7Ozs7Ozs7R0FPRztBQUNILE1BQWEsWUFBWTtJQUF6QjtRQUNZLFdBQU0sR0FBNkIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM3QyxtQkFBYyxHQUFhLEVBQUUsQ0FBQztJQWtJMUMsQ0FBQztJQWhJRzs7Ozs7Ozs7T0FRRztJQUNILFVBQVUsQ0FDTixRQUFnQixFQUNoQixNQUFjLEVBQ2QsV0FBbUIsRUFDbkIsT0FBa0IsSUFBSTtRQUV0Qiw2Q0FBNkM7UUFDN0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0QsTUFBTSxLQUFLLEdBQUcsR0FBRyxRQUFRLElBQUksV0FBVyxFQUFFLENBQUM7UUFFM0MsTUFBTSxNQUFNLEdBQWdCO1lBQ3hCLEtBQUs7WUFDTCxRQUFRO1lBQ1IsTUFBTTtZQUNOLFdBQVc7WUFDWCxRQUFRLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNwQixLQUFLLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1lBQzlCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUM7UUFFRixvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLGFBQWEs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RSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFMUUsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssYUFBYTtRQUNqQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLGlCQUFpQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzdFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFHLENBQUM7WUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQXBJRCxvQ0FvSUM7QUFFRDs7R0FFRztBQUNILE1BQWEsVUFBVyxTQUFRLEtBQUs7SUFDakMsWUFDb0IsSUFBK0YsRUFDL0csT0FBZTtRQUVmLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUhDLFNBQUksR0FBSixJQUFJLENBQTJGO1FBSS9HLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO0lBQzdCLENBQUM7Q0FDSjtBQVJELGdDQVFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBWRVJBIE5vbmNlIE1hbmFnZXIg4oCUIEF1dGhvcml6YXRpb24gTm9uY2UgTGlmZWN5Y2xlICjCpzQuMi4xYSlcbiAqIFxuICogSW1wbGVtZW50cyB0aGUgbm9ybWF0aXZlIG5vbmNlIHNwZWNpZmljYXRpb246XG4gKiAtIDEyOC1iaXQgbWluaW11bSBlbnRyb3B5LCBoZXgtZW5jb2RlZFxuICogLSBGb3JtYXQ6IHthY3Rpb25JZH06e3JhbmRvbV9ieXRlc19oZXh9XG4gKiAtIFRUTDogNjBzIGRlZmF1bHQsIDMwcyBmb3IgVDQgYWdlbnRzXG4gKiAtIFNpbmdsZS11c2UgZW5mb3JjZW1lbnQgdmlhIGJvdW5kZWQgTFJVIHNldFxuICogLSBSZXBsYXkgcHJvdGVjdGlvbiB3aXRoIGZ1bGwgYmluZGluZyBjaGVja3NcbiAqIFxuICogQHNlZSBWRVJBIFBhcGVyIMKnNC4yLjFhIOKAlCBOb25jZSBsaWZlY3ljbGUgKG5vcm1hdGl2ZSlcbiAqL1xuXG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcbmltcG9ydCB7IE5vbmNlUmVjb3JkLCBUcnVzdFRpZXIgfSBmcm9tICcuL3R5cGVzJztcblxuLyoqIE5vbmNlIFRUTCBieSB0cnVzdCB0aWVyIChtaWxsaXNlY29uZHMpICovXG5jb25zdCBOT05DRV9UVExfQllfVElFUjogUmVjb3JkPFRydXN0VGllciwgbnVtYmVyPiA9IHtcbiAgICBUMTogNjBfMDAwLFxuICAgIFQyOiA2MF8wMDAsXG4gICAgVDM6IDYwXzAwMCxcbiAgICBUNDogMzBfMDAwLFxufTtcblxuLyoqIE1heGltdW0gbm9uY2UgZW50cmllcyBwZXIgUEVQIGluc3RhbmNlIChMUlUgYm91bmQpICovXG5jb25zdCBNQVhfTk9OQ0VfRU5UUklFUyA9IDEwMF8wMDA7XG5cbi8qKlxuICogTm9uY2VNYW5hZ2VyIOKAlCBtYW5hZ2VzIGF1dGhvcml6YXRpb24gbm9uY2VzIGZvciBUb29sIEV4ZWN1dGlvbiBSZWNlaXB0cy5cbiAqIFxuICogVGhyZWFkLXNhZmV0eSBub3RlOiBUaGlzIGltcGxlbWVudGF0aW9uIHVzZXMgc3luY2hyb25vdXMgb3BlcmF0aW9uc1xuICogc3VpdGFibGUgZm9yIHNpbmdsZS10aHJlYWRlZCBOb2RlLmpzLiBGb3IgbXVsdGktaW5zdGFuY2UgUEVQIGRlcGxveW1lbnRzLFxuICogbm9uY2Ugc3RhdGUgc2hvdWxkIGJlIGJhY2tlZCBieSBhIHNoYXJlZCBzdG9yZSAoUmVkaXMsIGV0Yy4pIHdpdGhcbiAqIGRpc3RyaWJ1dGVkIGxvY2tpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBOb25jZU1hbmFnZXIge1xuICAgIHByaXZhdGUgbm9uY2VzOiBNYXA8c3RyaW5nLCBOb25jZVJlY29yZD4gPSBuZXcgTWFwKCk7XG4gICAgcHJpdmF0ZSBpbnNlcnRpb25PcmRlcjogc3RyaW5nW10gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIElzc3VlIGEgbmV3IG5vbmNlIGZvciBhIFBFUCBhdXRob3JpemF0aW9uIGRlY2lzaW9uLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhY3Rpb25JZCAtIFRoZSBQb0UgYWN0aW9uIElEIHRoaXMgbm9uY2UgaXMgYm91bmQgdG9cbiAgICAgKiBAcGFyYW0gdG9vbElkIC0gVGhlIHRvb2wgdGhhdCB3aWxsIHJlY2VpdmUgdGhpcyBub25jZVxuICAgICAqIEBwYXJhbSByZXF1ZXN0SGFzaCAtIFNIQS0yNTYgb2YgdGhlIGF1dGhvcml6ZWQgcmVxdWVzdCBwYXJhbWV0ZXJzXG4gICAgICogQHBhcmFtIHRpZXIgLSBBZ2VudCB0cnVzdCB0aWVyIChkZXRlcm1pbmVzIFRUTClcbiAgICAgKiBAcmV0dXJucyBUaGUgZ2VuZXJhdGVkIG5vbmNlIHN0cmluZ1xuICAgICAqL1xuICAgIGlzc3VlTm9uY2UoXG4gICAgICAgIGFjdGlvbklkOiBzdHJpbmcsXG4gICAgICAgIHRvb2xJZDogc3RyaW5nLFxuICAgICAgICByZXF1ZXN0SGFzaDogc3RyaW5nLFxuICAgICAgICB0aWVyOiBUcnVzdFRpZXIgPSAnVDInLFxuICAgICk6IHN0cmluZyB7XG4gICAgICAgIC8vIEdlbmVyYXRlIDEyOC1iaXQgKDE2IGJ5dGVzKSByYW5kb20gZW50cm9weVxuICAgICAgICBjb25zdCByYW5kb21CeXRlcyA9IGNyeXB0by5yYW5kb21CeXRlcygxNikudG9TdHJpbmcoJ2hleCcpO1xuICAgICAgICBjb25zdCBub25jZSA9IGAke2FjdGlvbklkfToke3JhbmRvbUJ5dGVzfWA7XG5cbiAgICAgICAgY29uc3QgcmVjb3JkOiBOb25jZVJlY29yZCA9IHtcbiAgICAgICAgICAgIG5vbmNlLFxuICAgICAgICAgICAgYWN0aW9uSWQsXG4gICAgICAgICAgICB0b29sSWQsXG4gICAgICAgICAgICByZXF1ZXN0SGFzaCxcbiAgICAgICAgICAgIGlzc3VlZEF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgdHRsTXM6IE5PTkNFX1RUTF9CWV9USUVSW3RpZXJdLFxuICAgICAgICAgICAgY29uc3VtZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEVuZm9yY2UgTFJVIGJvdW5kXG4gICAgICAgIHRoaXMuZXZpY3RJZk5lZWRlZCgpO1xuXG4gICAgICAgIHRoaXMubm9uY2VzLnNldChub25jZSwgcmVjb3JkKTtcbiAgICAgICAgdGhpcy5pbnNlcnRpb25PcmRlci5wdXNoKG5vbmNlKTtcblxuICAgICAgICByZXR1cm4gbm9uY2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29uc3VtZSBhIG5vbmNlIHdoZW4gdmVyaWZ5aW5nIGEgVG9vbCBFeGVjdXRpb24gUmVjZWlwdC5cbiAgICAgKiBcbiAgICAgKiBQZXJmb3JtcyBhbGwgbm9ybWF0aXZlIGNoZWNrczpcbiAgICAgKiAoYSkgbm9uY2UgZXhpc3RzIGluIHRoZSBpc3N1ZWQtbm9uY2Ugc2V0XG4gICAgICogKGIpIG5vbmNlIGhhcyBub3QgYmVlbiBjb25zdW1lZFxuICAgICAqIChjKSBub25jZSBUVEwgaGFzIG5vdCBleHBpcmVkXG4gICAgICogKGQpIHJlY2VpcHQgcmVzdWx0SGFzaCBpcyBib3VuZCB0byB0aGUgbm9uY2UncyBvcmlnaW5hbCByZXF1ZXN0SGFzaFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBub25jZSAtIFRoZSBub25jZSBmcm9tIHRoZSByZWNlaXB0XG4gICAgICogQHBhcmFtIHJlc3VsdEhhc2ggLSBUaGUgcmVzdWx0SGFzaCBmcm9tIHRoZSByZWNlaXB0IChmb3IgYmluZGluZyB2YWxpZGF0aW9uKVxuICAgICAqIEByZXR1cm5zIFRydWUgaWYgbm9uY2Ugd2FzIHZhbGlkIGFuZCBjb25zdW1lZDsgdGhyb3dzIG9uIGZhaWx1cmVcbiAgICAgKi9cbiAgICBjb25zdW1lTm9uY2Uobm9uY2U6IHN0cmluZywgcmVzdWx0SGFzaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHJlY29yZCA9IHRoaXMubm9uY2VzLmdldChub25jZSk7XG5cbiAgICAgICAgLy8gKGEpIE5vbmNlIG11c3QgZXhpc3RcbiAgICAgICAgaWYgKCFyZWNvcmQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBOb25jZUVycm9yKCdOT05DRV9OT1RfRk9VTkQnLCBgTm9uY2Ugbm90IGZvdW5kOiAke25vbmNlLnN1YnN0cmluZygwLCAyMCl9Li4uYCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAoYikgTm9uY2UgbXVzdCBub3QgYmUgY29uc3VtZWRcbiAgICAgICAgaWYgKHJlY29yZC5jb25zdW1lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE5vbmNlRXJyb3IoJ05PTkNFX0FMUkVBRFlfQ09OU1VNRUQnLCBgTm9uY2UgYWxyZWFkeSBjb25zdW1lZCBhdCAke3JlY29yZC5jb25zdW1lZEF0fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gKGMpIE5vbmNlIG11c3Qgbm90IGJlIGV4cGlyZWRcbiAgICAgICAgY29uc3QgZWxhcHNlZCA9IERhdGUubm93KCkgLSByZWNvcmQuaXNzdWVkQXQ7XG4gICAgICAgIGlmIChlbGFwc2VkID4gcmVjb3JkLnR0bE1zKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTm9uY2VFcnJvcignTk9OQ0VfRVhQSVJFRCcsIGBOb25jZSBleHBpcmVkICgke2VsYXBzZWR9bXMgPiAke3JlY29yZC50dGxNc31tcyBUVEwpYCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYXJrIGFzIGNvbnN1bWVkXG4gICAgICAgIHJlY29yZC5jb25zdW1lZCA9IHRydWU7XG4gICAgICAgIHJlY29yZC5jb25zdW1lZEF0ID0gRGF0ZS5ub3coKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb29rIHVwIGEgbm9uY2UgcmVjb3JkIChmb3IgdmVyaWZpY2F0aW9uIHdpdGhvdXQgY29uc3VtaW5nKS5cbiAgICAgKi9cbiAgICBnZXROb25jZShub25jZTogc3RyaW5nKTogTm9uY2VSZWNvcmQgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5ub25jZXMuZ2V0KG5vbmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGNvdW50IG9mIGFjdGl2ZSAobm9uLWNvbnN1bWVkLCBub24tZXhwaXJlZCkgbm9uY2VzLlxuICAgICAqL1xuICAgIGdldEFjdGl2ZUNvdW50KCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgcmVjb3JkIG9mIHRoaXMubm9uY2VzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBpZiAoIXJlY29yZC5jb25zdW1lZCAmJiAobm93IC0gcmVjb3JkLmlzc3VlZEF0KSA8PSByZWNvcmQudHRsTXMpIHtcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhbiB1cCBleHBpcmVkIG5vbmNlcy5cbiAgICAgKi9cbiAgICBwdXJnZUV4cGlyZWQoKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgbGV0IHB1cmdlZCA9IDA7XG5cbiAgICAgICAgZm9yIChjb25zdCBbbm9uY2UsIHJlY29yZF0gb2YgdGhpcy5ub25jZXMuZW50cmllcygpKSB7XG4gICAgICAgICAgICBpZiAoKG5vdyAtIHJlY29yZC5pc3N1ZWRBdCkgPiByZWNvcmQudHRsTXMgKiAyKSB7XG4gICAgICAgICAgICAgICAgLy8gS2VlcCBjb25zdW1lZCBub25jZXMgZm9yIDLDlyBUVEwgZm9yIGF1ZGl0IHRyYWlsXG4gICAgICAgICAgICAgICAgdGhpcy5ub25jZXMuZGVsZXRlKG5vbmNlKTtcbiAgICAgICAgICAgICAgICBwdXJnZWQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlYnVpbGQgaW5zZXJ0aW9uIG9yZGVyXG4gICAgICAgIHRoaXMuaW5zZXJ0aW9uT3JkZXIgPSB0aGlzLmluc2VydGlvbk9yZGVyLmZpbHRlcihuID0+IHRoaXMubm9uY2VzLmhhcyhuKSk7XG5cbiAgICAgICAgcmV0dXJuIHB1cmdlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmZvcmNlIExSVSBib3VuZCDigJQgZXZpY3Qgb2xkZXN0IG5vbmNlcyBpZiBhdCBjYXBhY2l0eS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGV2aWN0SWZOZWVkZWQoKTogdm9pZCB7XG4gICAgICAgIHdoaWxlICh0aGlzLm5vbmNlcy5zaXplID49IE1BWF9OT05DRV9FTlRSSUVTICYmIHRoaXMuaW5zZXJ0aW9uT3JkZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3Qgb2xkZXN0ID0gdGhpcy5pbnNlcnRpb25PcmRlci5zaGlmdCgpITtcbiAgICAgICAgICAgIHRoaXMubm9uY2VzLmRlbGV0ZShvbGRlc3QpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFR5cGVkIGVycm9yIGZvciBub25jZSBvcGVyYXRpb25zLlxuICovXG5leHBvcnQgY2xhc3MgTm9uY2VFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGNvZGU6ICdOT05DRV9OT1RfRk9VTkQnIHwgJ05PTkNFX0FMUkVBRFlfQ09OU1VNRUQnIHwgJ05PTkNFX0VYUElSRUQnIHwgJ05PTkNFX0JJTkRJTkdfTUlTTUFUQ0gnLFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnTm9uY2VFcnJvcic7XG4gICAgfVxufVxuIl19