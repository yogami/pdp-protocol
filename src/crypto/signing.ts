import * as ed from '@noble/ed25519';
import * as crypto from 'crypto';

// Configure sha512 for synchronous operations
// @noble/ed25519 2.x uses different API
if (typeof globalThis.crypto === 'undefined') {
    // Node.js environment - provide sha512 implementation
    (ed as any).etc = (ed as any).etc || {};
    (ed as any).etc.sha512Sync = (...messages: Uint8Array[]) => {
        const hash = crypto.createHash('sha512');
        messages.forEach(msg => hash.update(msg));
        return new Uint8Array(hash.digest());
    };
}

export interface KeyPair {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
}

/**
 * Generate a new Ed25519 keypair for signing beacons.
 */
export async function generateKeyPair(): Promise<KeyPair> {
    const privateKey = crypto.randomBytes(32);
    const publicKey = await ed.getPublicKeyAsync(privateKey);
    return { privateKey: new Uint8Array(privateKey), publicKey };
}

/**
 * Sign a message (beacon payload) with an Ed25519 private key.
 */
export async function sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
    return await ed.signAsync(message, privateKey);
}

/**
 * Verify an Ed25519 signature against a message and public key.
 */
export async function verify(
    signature: Uint8Array,
    message: Uint8Array,
    publicKey: Uint8Array
): Promise<boolean> {
    try {
        return await ed.verifyAsync(signature, message, publicKey);
    } catch {
        return false;
    }
}

/**
 * Convert a public key to a hex string for display/storage.
 */
export function publicKeyToHex(pubKey: Uint8Array): string {
    return Buffer.from(pubKey).toString('hex');
}

/**
 * Convert a hex string back to a public key.
 */
export function hexToPublicKey(hex: string): Uint8Array {
    return new Uint8Array(Buffer.from(hex, 'hex'));
}
