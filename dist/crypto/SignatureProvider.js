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
exports.DilithiumProvider = exports.Ed25519Provider = void 0;
exports.getProvider = getProvider;
const signing_1 = require("./signing");
const crypto = __importStar(require("crypto"));
/**
 * Standard Ed25519 Provider (Noble)
 */
class Ed25519Provider {
    constructor() {
        this.algorithm = 'Ed25519';
    }
    async generateKeyPair() {
        return (0, signing_1.generateKeyPair)();
    }
    async sign(message, privateKey) {
        return (0, signing_1.sign)(message, privateKey);
    }
    async verify(signature, message, publicKey) {
        return (0, signing_1.verify)(signature, message, publicKey);
    }
}
exports.Ed25519Provider = Ed25519Provider;
/**
 * Mock ML-DSA-65 Provider (Post-Quantum)
 * Placeholder for future integration with liboqs-node or similar.
 *
 * VERA Paper §4.2: "Agents MUST support ML-DSA-65..."
 * Current status: Structural mock for interface compliance.
 */
class DilithiumProvider {
    constructor() {
        this.algorithm = 'ML-DSA-65';
    }
    async generateKeyPair() {
        // Mock keys (larger than Ed25519)
        const publicKey = crypto.randomBytes(1312); // ML-DSA-65 pk size
        const privateKey = crypto.randomBytes(2528); // ML-DSA-65 sk size
        return { publicKey, privateKey };
    }
    async sign(message, privateKey) {
        // Mock signature (deterministic for testing)
        // In real impl, this would differ
        const hmac = crypto.createHmac('sha512', privateKey);
        hmac.update(message);
        return hmac.digest(); // 64 bytes (should be 3293 bytes for true ML-DSA-65, but keeping small for mock)
    }
    async verify(signature, message, publicKey) {
        // Mock verification: recompute signature and compare
        // Note: For real Dilithium, we can't derive verifying key from private key easily here in mock
        // So we just return true for this structural mock if signature length is > 0
        return signature.length > 0;
    }
}
exports.DilithiumProvider = DilithiumProvider;
function getProvider(algo = 'Ed25519') {
    switch (algo) {
        case 'Ed25519': return new Ed25519Provider();
        case 'ML-DSA-65': return new DilithiumProvider();
        default: throw new Error(`Unsupported algorithm: ${algo}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lnbmF0dXJlUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY3J5cHRvL1NpZ25hdHVyZVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlFQSxrQ0FNQztBQXRFRCx1Q0FBbUU7QUFDbkUsK0NBQWlDO0FBV2pDOztHQUVHO0FBQ0gsTUFBYSxlQUFlO0lBQTVCO1FBQ2EsY0FBUyxHQUFHLFNBQVMsQ0FBQztJQWFuQyxDQUFDO0lBWEcsS0FBSyxDQUFDLGVBQWU7UUFDakIsT0FBTyxJQUFBLHlCQUFlLEdBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFtQixFQUFFLFVBQXNCO1FBQ2xELE9BQU8sSUFBQSxjQUFJLEVBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQXFCLEVBQUUsT0FBbUIsRUFBRSxTQUFxQjtRQUMxRSxPQUFPLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7Q0FDSjtBQWRELDBDQWNDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBYSxpQkFBaUI7SUFBOUI7UUFDYSxjQUFTLEdBQUcsV0FBVyxDQUFDO0lBdUJyQyxDQUFDO0lBckJHLEtBQUssQ0FBQyxlQUFlO1FBQ2pCLGtDQUFrQztRQUNsQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQW9CO1FBQ2hFLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQkFBb0I7UUFDakUsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFtQixFQUFFLFVBQXNCO1FBQ2xELDZDQUE2QztRQUM3QyxrQ0FBa0M7UUFDbEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQixPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLGlGQUFpRjtJQUMzRyxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFxQixFQUFFLE9BQW1CLEVBQUUsU0FBcUI7UUFDMUUscURBQXFEO1FBQ3JELCtGQUErRjtRQUMvRiw2RUFBNkU7UUFDN0UsT0FBTyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0o7QUF4QkQsOENBd0JDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLE9BQTJCLFNBQVM7SUFDNUQsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUNYLEtBQUssU0FBUyxDQUFDLENBQUMsT0FBTyxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQzdDLEtBQUssV0FBVyxDQUFDLENBQUMsT0FBTyxJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFDakQsT0FBTyxDQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMvRCxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgZ2VuZXJhdGVLZXlQYWlyLCBzaWduLCB2ZXJpZnksIEtleVBhaXIgfSBmcm9tICcuL3NpZ25pbmcnO1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5cbmV4cG9ydCB0eXBlIFNpZ25hdHVyZUFsZ29yaXRobSA9ICdFZDI1NTE5JyB8ICdNTC1EU0EtNjUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hdHVyZVByb3ZpZGVyIHtcbiAgICByZWFkb25seSBhbGdvcml0aG06IFNpZ25hdHVyZUFsZ29yaXRobTtcbiAgICBnZW5lcmF0ZUtleVBhaXIoKTogUHJvbWlzZTxLZXlQYWlyPjtcbiAgICBzaWduKG1lc3NhZ2U6IFVpbnQ4QXJyYXksIHByaXZhdGVLZXk6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFVpbnQ4QXJyYXk+O1xuICAgIHZlcmlmeShzaWduYXR1cmU6IFVpbnQ4QXJyYXksIG1lc3NhZ2U6IFVpbnQ4QXJyYXksIHB1YmxpY0tleTogVWludDhBcnJheSk6IFByb21pc2U8Ym9vbGVhbj47XG59XG5cbi8qKlxuICogU3RhbmRhcmQgRWQyNTUxOSBQcm92aWRlciAoTm9ibGUpXG4gKi9cbmV4cG9ydCBjbGFzcyBFZDI1NTE5UHJvdmlkZXIgaW1wbGVtZW50cyBTaWduYXR1cmVQcm92aWRlciB7XG4gICAgcmVhZG9ubHkgYWxnb3JpdGhtID0gJ0VkMjU1MTknO1xuXG4gICAgYXN5bmMgZ2VuZXJhdGVLZXlQYWlyKCk6IFByb21pc2U8S2V5UGFpcj4ge1xuICAgICAgICByZXR1cm4gZ2VuZXJhdGVLZXlQYWlyKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgc2lnbihtZXNzYWdlOiBVaW50OEFycmF5LCBwcml2YXRlS2V5OiBVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG4gICAgICAgIHJldHVybiBzaWduKG1lc3NhZ2UsIHByaXZhdGVLZXkpO1xuICAgIH1cblxuICAgIGFzeW5jIHZlcmlmeShzaWduYXR1cmU6IFVpbnQ4QXJyYXksIG1lc3NhZ2U6IFVpbnQ4QXJyYXksIHB1YmxpY0tleTogVWludDhBcnJheSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gdmVyaWZ5KHNpZ25hdHVyZSwgbWVzc2FnZSwgcHVibGljS2V5KTtcbiAgICB9XG59XG5cbi8qKlxuICogTW9jayBNTC1EU0EtNjUgUHJvdmlkZXIgKFBvc3QtUXVhbnR1bSlcbiAqIFBsYWNlaG9sZGVyIGZvciBmdXR1cmUgaW50ZWdyYXRpb24gd2l0aCBsaWJvcXMtbm9kZSBvciBzaW1pbGFyLlxuICogXG4gKiBWRVJBIFBhcGVyIMKnNC4yOiBcIkFnZW50cyBNVVNUIHN1cHBvcnQgTUwtRFNBLTY1Li4uXCJcbiAqIEN1cnJlbnQgc3RhdHVzOiBTdHJ1Y3R1cmFsIG1vY2sgZm9yIGludGVyZmFjZSBjb21wbGlhbmNlLlxuICovXG5leHBvcnQgY2xhc3MgRGlsaXRoaXVtUHJvdmlkZXIgaW1wbGVtZW50cyBTaWduYXR1cmVQcm92aWRlciB7XG4gICAgcmVhZG9ubHkgYWxnb3JpdGhtID0gJ01MLURTQS02NSc7XG5cbiAgICBhc3luYyBnZW5lcmF0ZUtleVBhaXIoKTogUHJvbWlzZTxLZXlQYWlyPiB7XG4gICAgICAgIC8vIE1vY2sga2V5cyAobGFyZ2VyIHRoYW4gRWQyNTUxOSlcbiAgICAgICAgY29uc3QgcHVibGljS2V5ID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDEzMTIpOyAvLyBNTC1EU0EtNjUgcGsgc2l6ZVxuICAgICAgICBjb25zdCBwcml2YXRlS2V5ID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDI1MjgpOyAvLyBNTC1EU0EtNjUgc2sgc2l6ZVxuICAgICAgICByZXR1cm4geyBwdWJsaWNLZXksIHByaXZhdGVLZXkgfTtcbiAgICB9XG5cbiAgICBhc3luYyBzaWduKG1lc3NhZ2U6IFVpbnQ4QXJyYXksIHByaXZhdGVLZXk6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgICAgICAgLy8gTW9jayBzaWduYXR1cmUgKGRldGVybWluaXN0aWMgZm9yIHRlc3RpbmcpXG4gICAgICAgIC8vIEluIHJlYWwgaW1wbCwgdGhpcyB3b3VsZCBkaWZmZXJcbiAgICAgICAgY29uc3QgaG1hYyA9IGNyeXB0by5jcmVhdGVIbWFjKCdzaGE1MTInLCBwcml2YXRlS2V5KTtcbiAgICAgICAgaG1hYy51cGRhdGUobWVzc2FnZSk7XG4gICAgICAgIHJldHVybiBobWFjLmRpZ2VzdCgpOyAvLyA2NCBieXRlcyAoc2hvdWxkIGJlIDMyOTMgYnl0ZXMgZm9yIHRydWUgTUwtRFNBLTY1LCBidXQga2VlcGluZyBzbWFsbCBmb3IgbW9jaylcbiAgICB9XG5cbiAgICBhc3luYyB2ZXJpZnkoc2lnbmF0dXJlOiBVaW50OEFycmF5LCBtZXNzYWdlOiBVaW50OEFycmF5LCBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgLy8gTW9jayB2ZXJpZmljYXRpb246IHJlY29tcHV0ZSBzaWduYXR1cmUgYW5kIGNvbXBhcmVcbiAgICAgICAgLy8gTm90ZTogRm9yIHJlYWwgRGlsaXRoaXVtLCB3ZSBjYW4ndCBkZXJpdmUgdmVyaWZ5aW5nIGtleSBmcm9tIHByaXZhdGUga2V5IGVhc2lseSBoZXJlIGluIG1vY2tcbiAgICAgICAgLy8gU28gd2UganVzdCByZXR1cm4gdHJ1ZSBmb3IgdGhpcyBzdHJ1Y3R1cmFsIG1vY2sgaWYgc2lnbmF0dXJlIGxlbmd0aCBpcyA+IDBcbiAgICAgICAgcmV0dXJuIHNpZ25hdHVyZS5sZW5ndGggPiAwO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3ZpZGVyKGFsZ286IFNpZ25hdHVyZUFsZ29yaXRobSA9ICdFZDI1NTE5Jyk6IFNpZ25hdHVyZVByb3ZpZGVyIHtcbiAgICBzd2l0Y2ggKGFsZ28pIHtcbiAgICAgICAgY2FzZSAnRWQyNTUxOSc6IHJldHVybiBuZXcgRWQyNTUxOVByb3ZpZGVyKCk7XG4gICAgICAgIGNhc2UgJ01MLURTQS02NSc6IHJldHVybiBuZXcgRGlsaXRoaXVtUHJvdmlkZXIoKTtcbiAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBhbGdvcml0aG06ICR7YWxnb31gKTtcbiAgICB9XG59XG4iXX0=