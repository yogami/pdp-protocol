export interface KeyPair {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
}
/**
 * Generate a new Ed25519 keypair for signing beacons.
 */
export declare function generateKeyPair(): Promise<KeyPair>;
/**
 * Sign a message (beacon payload) with an Ed25519 private key.
 */
export declare function sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
/**
 * Verify an Ed25519 signature against a message and public key.
 */
export declare function verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): Promise<boolean>;
/**
 * Convert a public key to a hex string for display/storage.
 */
export declare function publicKeyToHex(pubKey: Uint8Array): string;
/**
 * Convert a hex string back to a public key.
 */
export declare function hexToPublicKey(hex: string): Uint8Array;
