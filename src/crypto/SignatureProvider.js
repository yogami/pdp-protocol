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
