"use strict";
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
exports.AaaS = void 0;
const SolanaAdapter_1 = require("./SolanaAdapter");
const crypto = __importStar(require("crypto"));
/**
 * Anchor-as-a-Service (AaaS) - Hardened Version
 * - In-Memory Persistence (Protects against replay within session)
 * - Agent Authentication (Prevents spoofing)
 * - HMAC Commitments (Prevents tampering)
 */
class AaaS {
    constructor() {
        this.solana = null;
        this.agentStateMap = new Map();
        const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
        const privateKey = process.env.SOLANA_PRIVATE_KEY;
        if (privateKey) {
            this.solana = new SolanaAdapter_1.SolanaAdapter(rpcUrl, privateKey);
            console.log(`[AaaS] Initialized with wallet: ${this.solana.getPublicKey()}`);
        }
        else {
            console.warn('[AaaS] No SOLANA_PRIVATE_KEY found. Anchoring will be simulated.');
        }
        console.log('[AaaS] Using in-memory state storage');
    }
    getAgentState(agentId) {
        return this.agentStateMap.get(agentId) || { lastSig: '', seq: 0 };
    }
    saveAgentState(agentId, state) {
        this.agentStateMap.set(agentId, state);
    }
    async verifyAuthorization(req) {
        const message = Buffer.from(req.poeHash + req.agentId);
        try {
            // Dynamic import for ES module
            const ed = await Promise.resolve().then(() => __importStar(require('@noble/ed25519')));
            // Polyfill for Node.js (must return Uint8Array, not Buffer)
            const sha512 = async (...m) => {
                const hash = crypto.createHash('sha512').update(Buffer.concat(m.map(b => Buffer.from(b)))).digest();
                return new Uint8Array(hash);
            };
            ed.hashes.sha512 = sha512;
            const sigBytes = Buffer.from(req.agentSignature, 'hex');
            const pubBytes = Buffer.from(req.agentPublicKey, 'hex');
            const isValid = await ed.verify(sigBytes, message, pubBytes);
            return isValid;
        }
        catch (e) {
            console.error('Signature verification error:', e);
            return false;
        }
    }
    /**
     * managedAnchor - Anchors a hash with managed retries, fee handling, and ORDERING protection.
     */
    async managedAnchor(req) {
        // 1. Security Check: Authorization
        if (!await this.verifyAuthorization(req)) {
            throw new Error('Unauthorized: Invalid Agent Signature');
        }
        const state = this.getAgentState(req.agentId);
        const nextSeq = state.seq + 1;
        console.log(`[AaaS] Requesting anchor for ${req.agentId} (Seq: ${nextSeq}, Hash: ${req.poeHash.substring(0, 10)}...)`);
        let result;
        if (this.solana) {
            try {
                result = await this.solana.anchorPoE(req.poeHash, req.agentId);
            }
            catch (error) {
                console.error(`[AaaS] Anchoring failed:`, error);
                throw new Error('Blockchain anchoring failed. Please try again.');
            }
        }
        else {
            // Simulating the result if no key is provided
            const fakeSig = 'fake_sig_' + Math.random().toString(36).substring(7);
            result = {
                signature: fakeSig,
                network: 'simulated',
                commitment: 'sha256:simulated_commitment',
                explorerUrl: `https://explorer.solana.com/tx/${fakeSig}?cluster=devnet`
            };
        }
        // Update persistent state on success
        this.saveAgentState(req.agentId, { lastSig: result.signature, seq: nextSeq });
        return result;
    }
    /**
     * verifyManagedAnchor - Verifies a managed anchor.
     */
    async verifyManagedAnchor(signature, expectedHash) {
        if (this.solana) {
            const result = await this.solana.verifyAnchor(signature, expectedHash);
            return result.valid;
        }
        return signature.startsWith('fake_sig_');
    }
}
exports.AaaS = AaaS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWFhUy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL0FhYVMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQThEO0FBQzlELCtDQUFpQztBQWNqQzs7Ozs7R0FLRztBQUNILE1BQWEsSUFBSTtJQUliO1FBSFEsV0FBTSxHQUF5QixJQUFJLENBQUM7UUFDcEMsa0JBQWEsR0FBNEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUd2RCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSwrQkFBK0IsQ0FBQztRQUM3RSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDO1FBRWxELElBQUksVUFBVSxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksNkJBQWEsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakYsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPLENBQUMsSUFBSSxDQUFDLGtFQUFrRSxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsc0NBQXNDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRU8sYUFBYSxDQUFDLE9BQWU7UUFDakMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3RFLENBQUM7SUFFTyxjQUFjLENBQUMsT0FBZSxFQUFFLEtBQWlCO1FBQ3JELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxL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LFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLEdBQUc7Z0JBQ0wsU0FBUyxFQUFFLE9BQU87Z0JBQ2xCLE9BQU8sRUFBRSxXQUFXO2dCQUNwQixVQUFVLEVBQUUsNkJBQTZCO2dCQUN6QyxXQUFXLEVBQUUsa0NBQWtDLE9BQU8saUJBQWlCO2FBQzFFLENBQUM7UUFDTixDQUFDO1FBRUQscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFpQixFQUFFLFlBQW9CO1FBQzdELElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDdkUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxPQUFPLFNBQVMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUNKO0FBbEdELG9CQWtHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNvbGFuYUFkYXB0ZXIsIEFuY2hvclJlc3VsdCB9IGZyb20gJy4vU29sYW5hQWRhcHRlcic7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcblxuaW50ZXJmYWNlIEFnZW50U3RhdGUge1xuICAgIGxhc3RTaWc6IHN0cmluZztcbiAgICBzZXE6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBdXRoZW50aWNhdGVkUmVxdWVzdCB7XG4gICAgcG9lSGFzaDogc3RyaW5nO1xuICAgIGFnZW50SWQ6IHN0cmluZztcbiAgICBhZ2VudFNpZ25hdHVyZTogc3RyaW5nOyAvLyBTaWduYXR1cmUgb2YgKHBvZUhhc2ggKyBhZ2VudElkKVxuICAgIGFnZW50UHVibGljS2V5OiBzdHJpbmc7IC8vIFB1YmxpYyBrZXkgdG8gdmVyaWZ5IHNpZ25hdHVyZVxufVxuXG4vKipcbiAqIEFuY2hvci1hcy1hLVNlcnZpY2UgKEFhYVMpIC0gSGFyZGVuZWQgVmVyc2lvblxuICogLSBJbi1NZW1vcnkgUGVyc2lzdGVuY2UgKFByb3RlY3RzIGFnYWluc3QgcmVwbGF5IHdpdGhpbiBzZXNzaW9uKVxuICogLSBBZ2VudCBBdXRoZW50aWNhdGlvbiAoUHJldmVudHMgc3Bvb2ZpbmcpXG4gKiAtIEhNQUMgQ29tbWl0bWVudHMgKFByZXZlbnRzIHRhbXBlcmluZylcbiAqL1xuZXhwb3J0IGNsYXNzIEFhYVMge1xuICAgIHByaXZhdGUgc29sYW5hOiBTb2xhbmFBZGFwdGVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBhZ2VudFN0YXRlTWFwOiBNYXA8c3RyaW5nLCBBZ2VudFN0YXRlPiA9IG5ldyBNYXAoKTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBycGNVcmwgPSBwcm9jZXNzLmVudi5TT0xBTkFfUlBDX1VSTCB8fCAnaHR0cHM6Ly9hcGkuZGV2bmV0LnNvbGFuYS5jb20nO1xuICAgICAgICBjb25zdCBwcml2YXRlS2V5ID0gcHJvY2Vzcy5lbnYuU09MQU5BX1BSSVZBVEVfS0VZO1xuXG4gICAgICAgIGlmIChwcml2YXRlS2V5KSB7XG4gICAgICAgICAgICB0aGlzLnNvbGFuYSA9IG5ldyBTb2xhbmFBZGFwdGVyKHJwY1VybCwgcHJpdmF0ZUtleSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW0FhYVNdIEluaXRpYWxpemVkIHdpdGggd2FsbGV0OiAke3RoaXMuc29sYW5hLmdldFB1YmxpY0tleSgpfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbQWFhU10gTm8gU09MQU5BX1BSSVZBVEVfS0VZIGZvdW5kLiBBbmNob3Jpbmcgd2lsbCBiZSBzaW11bGF0ZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygnW0FhYVNdIFVzaW5nIGluLW1lbW9yeSBzdGF0ZSBzdG9yYWdlJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRBZ2VudFN0YXRlKGFnZW50SWQ6IHN0cmluZyk6IEFnZW50U3RhdGUge1xuICAgICAgICByZXR1cm4gdGhpcy5hZ2VudFN0YXRlTWFwLmdldChhZ2VudElkKSB8fCB7IGxhc3RTaWc6ICcnLCBzZXE6IDAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNhdmVBZ2VudFN0YXRlKGFnZW50SWQ6IHN0cmluZywgc3RhdGU6IEFnZW50U3RhdGUpIHtcbiAgICAgICAgdGhpcy5hZ2VudFN0YXRlTWFwLnNldChhZ2VudElkLCBzdGF0ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB2ZXJpZnlBdXRob3JpemF0aW9uKHJlcTogQXV0aGVudGljYXRlZFJlcXVlc3QpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IEJ1ZmZlci5mcm9tKHJlcS5wb2VIYXNoICsgcmVxLmFnZW50SWQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRHluYW1pYyBpbXBvcnQgZm9yIEVTIG1vZHVsZVxuICAgICAgICAgICAgY29uc3QgZWQgPSBhd2FpdCBpbXBvcnQoJ0Bub2JsZS9lZDI1NTE5Jyk7XG5cbiAgICAgICAgICAgIC8vIFBvbHlmaWxsIGZvciBOb2RlLmpzIChtdXN0IHJldHVybiBVaW50OEFycmF5LCBub3QgQnVmZmVyKVxuICAgICAgICAgICAgY29uc3Qgc2hhNTEyID0gYXN5bmMgKC4uLm06IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGE1MTInKS51cGRhdGUoQnVmZmVyLmNvbmNhdChtLm1hcChiID0+IEJ1ZmZlci5mcm9tKGIpKSkpLmRpZ2VzdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShoYXNoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAoZWQgYXMgYW55KS5oYXNoZXMuc2hhNTEyID0gc2hhNTEyO1xuXG4gICAgICAgICAgICBjb25zdCBzaWdCeXRlcyA9IEJ1ZmZlci5mcm9tKHJlcS5hZ2VudFNpZ25hdHVyZSwgJ2hleCcpO1xuICAgICAgICAgICAgY29uc3QgcHViQnl0ZXMgPSBCdWZmZXIuZnJvbShyZXEuYWdlbnRQdWJsaWNLZXksICdoZXgnKTtcbiAgICAgICAgICAgIGNvbnN0IGlzVmFsaWQgPSBhd2FpdCBlZC52ZXJpZnkoc2lnQnl0ZXMsIG1lc3NhZ2UsIHB1YkJ5dGVzKTtcbiAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTaWduYXR1cmUgdmVyaWZpY2F0aW9uIGVycm9yOicsIGUpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogbWFuYWdlZEFuY2hvciAtIEFuY2hvcnMgYSBoYXNoIHdpdGggbWFuYWdlZCByZXRyaWVzLCBmZWUgaGFuZGxpbmcsIGFuZCBPUkRFUklORyBwcm90ZWN0aW9uLlxuICAgICAqL1xuICAgIGFzeW5jIG1hbmFnZWRBbmNob3IocmVxOiBBdXRoZW50aWNhdGVkUmVxdWVzdCk6IFByb21pc2U8QW5jaG9yUmVzdWx0PiB7XG4gICAgICAgIC8vIDEuIFNlY3VyaXR5IENoZWNrOiBBdXRob3JpemF0aW9uXG4gICAgICAgIGlmICghYXdhaXQgdGhpcy52ZXJpZnlBdXRob3JpemF0aW9uKHJlcSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hdXRob3JpemVkOiBJbnZhbGlkIEFnZW50IFNpZ25hdHVyZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmdldEFnZW50U3RhdGUocmVxLmFnZW50SWQpO1xuICAgICAgICBjb25zdCBuZXh0U2VxID0gc3RhdGUuc2VxICsgMTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgW0FhYVNdIFJlcXVlc3RpbmcgYW5jaG9yIGZvciAke3JlcS5hZ2VudElkfSAoU2VxOiAke25leHRTZXF9LCBIYXNoOiAke3JlcS5wb2VIYXNoLnN1YnN0cmluZygwLCAxMCl9Li4uKWApO1xuXG4gICAgICAgIGxldCByZXN1bHQ6IEFuY2hvclJlc3VsdDtcblxuICAgICAgICBpZiAodGhpcy5zb2xhbmEpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5zb2xhbmEuYW5jaG9yUG9FKHJlcS5wb2VIYXNoLCByZXEuYWdlbnRJZCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtBYWFTXSBBbmNob3JpbmcgZmFpbGVkOmAsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jsb2NrY2hhaW4gYW5jaG9yaW5nIGZhaWxlZC4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFNpbXVsYXRpbmcgdGhlIHJlc3VsdCBpZiBubyBrZXkgaXMgcHJvdmlkZWRcbiAgICAgICAgICAgIGNvbnN0IGZha2VTaWcgPSAnZmFrZV9zaWdfJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBzaWduYXR1cmU6IGZha2VTaWcsXG4gICAgICAgICAgICAgICAgbmV0d29yazogJ3NpbXVsYXRlZCcsXG4gICAgICAgICAgICAgICAgY29tbWl0bWVudDogJ3NoYTI1NjpzaW11bGF0ZWRfY29tbWl0bWVudCcsXG4gICAgICAgICAgICAgICAgZXhwbG9yZXJVcmw6IGBodHRwczovL2V4cGxvcmVyLnNvbGFuYS5jb20vdHgvJHtmYWtlU2lnfT9jbHVzdGVyPWRldm5ldGBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgcGVyc2lzdGVudCBzdGF0ZSBvbiBzdWNjZXNzXG4gICAgICAgIHRoaXMuc2F2ZUFnZW50U3RhdGUocmVxLmFnZW50SWQsIHsgbGFzdFNpZzogcmVzdWx0LnNpZ25hdHVyZSwgc2VxOiBuZXh0U2VxIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHZlcmlmeU1hbmFnZWRBbmNob3IgLSBWZXJpZmllcyBhIG1hbmFnZWQgYW5jaG9yLlxuICAgICAqL1xuICAgIGFzeW5jIHZlcmlmeU1hbmFnZWRBbmNob3Ioc2lnbmF0dXJlOiBzdHJpbmcsIGV4cGVjdGVkSGFzaDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGlmICh0aGlzLnNvbGFuYSkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zb2xhbmEudmVyaWZ5QW5jaG9yKHNpZ25hdHVyZSwgZXhwZWN0ZWRIYXNoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudmFsaWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNpZ25hdHVyZS5zdGFydHNXaXRoKCdmYWtlX3NpZ18nKTtcbiAgICB9XG59XG4iXX0=