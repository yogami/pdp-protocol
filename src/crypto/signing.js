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
exports.generateKeyPair = generateKeyPair;
exports.sign = sign;
exports.verify = verify;
exports.publicKeyToHex = publicKeyToHex;
exports.hexToPublicKey = hexToPublicKey;
const ed = __importStar(require("@noble/ed25519"));
const crypto = __importStar(require("crypto"));
// Configure sha512 for synchronous operations
// @noble/ed25519 2.x uses different API
if (typeof globalThis.crypto === 'undefined') {
    // Node.js environment - provide sha512 implementation
    ed.etc = ed.etc || {};
    ed.etc.sha512Sync = (...messages) => {
        const hash = crypto.createHash('sha512');
        messages.forEach(msg => hash.update(msg));
        return new Uint8Array(hash.digest());
    };
}
/**
 * Generate a new Ed25519 keypair for signing beacons.
 */
async function generateKeyPair() {
    const privateKey = crypto.randomBytes(32);
    const publicKey = await ed.getPublicKeyAsync(privateKey);
    return { privateKey: new Uint8Array(privateKey), publicKey };
}
/**
 * Sign a message (beacon payload) with an Ed25519 private key.
 */
async function sign(message, privateKey) {
    return await ed.signAsync(message, privateKey);
}
/**
 * Verify an Ed25519 signature against a message and public key.
 */
async function verify(signature, message, publicKey) {
    try {
        return await ed.verifyAsync(signature, message, publicKey);
    }
    catch {
        return false;
    }
}
/**
 * Convert a public key to a hex string for display/storage.
 */
function publicKeyToHex(pubKey) {
    return Buffer.from(pubKey).toString('hex');
}
/**
 * Convert a hex string back to a public key.
 */
function hexToPublicKey(hex) {
    return new Uint8Array(Buffer.from(hex, 'hex'));
}
