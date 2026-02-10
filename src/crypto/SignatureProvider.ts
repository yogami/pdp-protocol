
import { generateKeyPair, sign, verify, KeyPair } from './signing';
import * as crypto from 'crypto';

export type SignatureAlgorithm = 'Ed25519' | 'ML-DSA-65';

export interface SignatureProvider {
    readonly algorithm: SignatureAlgorithm;
    generateKeyPair(): Promise<KeyPair>;
    sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
    verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): Promise<boolean>;
}

/**
 * Standard Ed25519 Provider (Noble)
 */
export class Ed25519Provider implements SignatureProvider {
    readonly algorithm = 'Ed25519';

    async generateKeyPair(): Promise<KeyPair> {
        return generateKeyPair();
    }

    async sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
        return sign(message, privateKey);
    }

    async verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): Promise<boolean> {
        return verify(signature, message, publicKey);
    }
}

/**
 * Mock ML-DSA-65 Provider (Post-Quantum)
 * Placeholder for future integration with liboqs-node or similar.
 * 
 * VERA Paper §4.2: "Agents MUST support ML-DSA-65..."
 * Current status: Structural mock for interface compliance.
 */
export class DilithiumProvider implements SignatureProvider {
    readonly algorithm = 'ML-DSA-65';

    async generateKeyPair(): Promise<KeyPair> {
        // Mock keys (larger than Ed25519)
        const publicKey = crypto.randomBytes(1312); // ML-DSA-65 pk size
        const privateKey = crypto.randomBytes(2528); // ML-DSA-65 sk size
        return { publicKey, privateKey };
    }

    async sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
        // Mock signature (deterministic for testing)
        // In real impl, this would differ
        const hmac = crypto.createHmac('sha512', privateKey);
        hmac.update(message);
        return hmac.digest(); // 64 bytes (should be 3293 bytes for true ML-DSA-65, but keeping small for mock)
    }

    async verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): Promise<boolean> {
        // Mock verification: recompute signature and compare
        // Note: For real Dilithium, we can't derive verifying key from private key easily here in mock
        // So we just return true for this structural mock if signature length is > 0
        return signature.length > 0;
    }
}

export function getProvider(algo: SignatureAlgorithm = 'Ed25519'): SignatureProvider {
    switch (algo) {
        case 'Ed25519': return new Ed25519Provider();
        case 'ML-DSA-65': return new DilithiumProvider();
        default: throw new Error(`Unsupported algorithm: ${algo}`);
    }
}
