import { KeyPair } from './signing';
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
export declare class Ed25519Provider implements SignatureProvider {
    readonly algorithm = "Ed25519";
    generateKeyPair(): Promise<KeyPair>;
    sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
    verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): Promise<boolean>;
}
/**
 * Mock ML-DSA-65 Provider (Post-Quantum)
 * Placeholder for future integration with liboqs-node or similar.
 *
 * VERA Paper §4.2: "Agents MUST support ML-DSA-65..."
 * Current status: Structural mock for interface compliance.
 */
export declare class DilithiumProvider implements SignatureProvider {
    readonly algorithm = "ML-DSA-65";
    generateKeyPair(): Promise<KeyPair>;
    sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
    verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): Promise<boolean>;
}
export declare function getProvider(algo?: SignatureAlgorithm): SignatureProvider;
