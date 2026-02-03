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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jcnlwdG8vc2lnbmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVCQSwwQ0FJQztBQUtELG9CQUVDO0FBS0Qsd0JBVUM7QUFLRCx3Q0FFQztBQUtELHdDQUVDO0FBL0RELG1EQUFxQztBQUNyQywrQ0FBaUM7QUFFakMsOENBQThDO0FBQzlDLHdDQUF3QztBQUN4QyxJQUFJLE9BQU8sVUFBVSxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUUsQ0FBQztJQUMzQyxzREFBc0Q7SUFDckQsRUFBVSxDQUFDLEdBQUcsR0FBSSxFQUFVLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQztJQUN2QyxFQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxDQUFDLEdBQUcsUUFBc0IsRUFBRSxFQUFFO1FBQ3ZELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQyxPQUFPLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQztBQUNOLENBQUM7QUFPRDs7R0FFRztBQUNJLEtBQUssVUFBVSxlQUFlO0lBQ2pDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDekQsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNqRSxDQUFDO0FBRUQ7O0dBRUc7QUFDSSxLQUFLLFVBQVUsSUFBSSxDQUFDLE9BQW1CLEVBQUUsVUFBc0I7SUFDbEUsT0FBTyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELENBQUM7QUFFRDs7R0FFRztBQUNJLEtBQUssVUFBVSxNQUFNLENBQ3hCLFNBQXFCLEVBQ3JCLE9BQW1CLEVBQ25CLFNBQXFCO0lBRXJCLElBQUksQ0FBQztRQUNELE9BQU8sTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNMLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7QUFDTCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixjQUFjLENBQUMsTUFBa0I7SUFDN0MsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixjQUFjLENBQUMsR0FBVztJQUN0QyxPQUFPLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGVkIGZyb20gJ0Bub2JsZS9lZDI1NTE5JztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG4vLyBDb25maWd1cmUgc2hhNTEyIGZvciBzeW5jaHJvbm91cyBvcGVyYXRpb25zXG4vLyBAbm9ibGUvZWQyNTUxOSAyLnggdXNlcyBkaWZmZXJlbnQgQVBJXG5pZiAodHlwZW9mIGdsb2JhbFRoaXMuY3J5cHRvID09PSAndW5kZWZpbmVkJykge1xuICAgIC8vIE5vZGUuanMgZW52aXJvbm1lbnQgLSBwcm92aWRlIHNoYTUxMiBpbXBsZW1lbnRhdGlvblxuICAgIChlZCBhcyBhbnkpLmV0YyA9IChlZCBhcyBhbnkpLmV0YyB8fCB7fTtcbiAgICAoZWQgYXMgYW55KS5ldGMuc2hhNTEyU3luYyA9ICguLi5tZXNzYWdlczogVWludDhBcnJheVtdKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhNTEyJyk7XG4gICAgICAgIG1lc3NhZ2VzLmZvckVhY2gobXNnID0+IGhhc2gudXBkYXRlKG1zZykpO1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoaGFzaC5kaWdlc3QoKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBLZXlQYWlyIHtcbiAgICBwcml2YXRlS2V5OiBVaW50OEFycmF5O1xuICAgIHB1YmxpY0tleTogVWludDhBcnJheTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhIG5ldyBFZDI1NTE5IGtleXBhaXIgZm9yIHNpZ25pbmcgYmVhY29ucy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlS2V5UGFpcigpOiBQcm9taXNlPEtleVBhaXI+IHtcbiAgICBjb25zdCBwcml2YXRlS2V5ID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKTtcbiAgICBjb25zdCBwdWJsaWNLZXkgPSBhd2FpdCBlZC5nZXRQdWJsaWNLZXlBc3luYyhwcml2YXRlS2V5KTtcbiAgICByZXR1cm4geyBwcml2YXRlS2V5OiBuZXcgVWludDhBcnJheShwcml2YXRlS2V5KSwgcHVibGljS2V5IH07XG59XG5cbi8qKlxuICogU2lnbiBhIG1lc3NhZ2UgKGJlYWNvbiBwYXlsb2FkKSB3aXRoIGFuIEVkMjU1MTkgcHJpdmF0ZSBrZXkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduKG1lc3NhZ2U6IFVpbnQ4QXJyYXksIHByaXZhdGVLZXk6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgICByZXR1cm4gYXdhaXQgZWQuc2lnbkFzeW5jKG1lc3NhZ2UsIHByaXZhdGVLZXkpO1xufVxuXG4vKipcbiAqIFZlcmlmeSBhbiBFZDI1NTE5IHNpZ25hdHVyZSBhZ2FpbnN0IGEgbWVzc2FnZSBhbmQgcHVibGljIGtleS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeShcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXksXG4gICAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXk6IFVpbnQ4QXJyYXlcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBlZC52ZXJpZnlBc3luYyhzaWduYXR1cmUsIG1lc3NhZ2UsIHB1YmxpY0tleSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogQ29udmVydCBhIHB1YmxpYyBrZXkgdG8gYSBoZXggc3RyaW5nIGZvciBkaXNwbGF5L3N0b3JhZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwdWJsaWNLZXlUb0hleChwdWJLZXk6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbShwdWJLZXkpLnRvU3RyaW5nKCdoZXgnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgaGV4IHN0cmluZyBiYWNrIHRvIGEgcHVibGljIGtleS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhleFRvUHVibGljS2V5KGhleDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KEJ1ZmZlci5mcm9tKGhleCwgJ2hleCcpKTtcbn1cbiJdfQ==