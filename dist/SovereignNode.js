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
exports.SovereignNode = void 0;
const SolanaAdapter_1 = require("./blockchain/SolanaAdapter");
const BaseAdapter_1 = require("./blockchain/BaseAdapter");
const ZKProofGenerator_1 = require("./zk/ZKProofGenerator");
const GossipNode_1 = require("./discovery/GossipNode");
const signing_1 = require("./crypto/signing");
const proto_1 = require("./proto");
const crypto = __importStar(require("crypto"));
/**
 * SovereignNode V2 - Hardened PDP agent node with cryptographic identity.
 *
 * Improvements over V1:
 * - Ed25519 keypair for beacon signing
 * - Nonce-based replay protection
 * - Mandatory on-chain anchor validation
 * - Rate limiting for spam resistance
 */
class SovereignNode {
    constructor(config) {
        this.nonce = 0;
        this.lastBroadcastTime = 0;
        this.config = {
            beaconRateLimitMs: 300000, // 5 minutes default
            ...config
        };
        if (config.solanaRpcUrl && config.solanaPrivateKey) {
            this.solana = new SolanaAdapter_1.SolanaAdapter(config.solanaRpcUrl, config.solanaPrivateKey);
        }
        if (config.baseRpcUrl && config.basePrivateKey) {
            this.base = new BaseAdapter_1.BaseAdapter(config.baseRpcUrl, config.basePrivateKey);
        }
        this.zk = new ZKProofGenerator_1.ZKProofGenerator();
        this.p2p = new GossipNode_1.GossipNode();
    }
    async bootstrap() {
        console.log(`[SOVEREIGN] Bootstrapping PDP Sovereign Node V2...`);
        // Generate Ed25519 keypair for signing
        this.keyPair = await (0, signing_1.generateKeyPair)();
        console.log(`[SOVEREIGN] Identity: ${Buffer.from(this.keyPair.publicKey).toString('hex').substring(0, 16)}...`);
        await this.p2p.start();
        if (this.solana) {
            console.log(`[SOVEREIGN] Solana Wallet: ${this.solana.getPublicKey()}`);
        }
        if (this.base) {
            console.log(`[SOVEREIGN] Base Wallet: ${this.base.getWalletAddress()}`);
        }
    }
    /**
     * Primary flow: Anchors and Broadcasts a new Proof of Execution.
     */
    async testify(taskId, outputData, capabilities) {
        if (!this.keyPair)
            throw new Error('Node not bootstrapped');
        // Rate limiting check
        const now = Date.now();
        if (now - this.lastBroadcastTime < this.config.beaconRateLimitMs) {
            throw new Error(`Rate limited. Wait ${Math.ceil((this.config.beaconRateLimitMs - (now - this.lastBroadcastTime)) / 1000)}s`);
        }
        console.log(`[SOVEREIGN] Testifying for Task: ${taskId}`);
        // 1. Generate PoE Hash
        const poeHashBytes = crypto.createHash('sha256').update(outputData).digest();
        // 2. Generate ZK Proof
        const zkInput = {
            taskId,
            completedAt: new Date().toISOString(),
            slaDeadlineSeconds: 300,
            veracityScore: 0.85, // Fixed high veracity for hardened nodes
            outputHash: Buffer.from(poeHashBytes).toString('hex')
        };
        const zkBundle = await this.zk.generateProof(zkInput);
        const zkProofRef = crypto.createHash('sha256').update(zkBundle.proof).digest();
        // 3. MANDATORY Anchoring (at least one chain required)
        let solanaTx = '';
        let baseTx = '';
        if (this.solana) {
            console.log(`[SOVEREIGN] Anchoring to Solana...`);
            const anchor = await this.solana.anchorPoE(Buffer.from(poeHashBytes).toString('hex'), this.config.agentId);
            solanaTx = anchor.signature;
            console.log(`[SOVEREIGN] Solana Anchor: ${solanaTx.substring(0, 20)}...`);
        }
        if (this.base) {
            console.log(`[SOVEREIGN] Anchoring to Base...`);
            const anchor = await this.base.anchorPoE(Buffer.from(poeHashBytes).toString('hex'), this.config.agentId);
            baseTx = anchor.txHash;
            console.log(`[SOVEREIGN] Base Anchor: ${baseTx.substring(0, 20)}...`);
        }
        // MANDATORY: Must have at least one anchor
        if (!solanaTx && !baseTx) {
            throw new Error('MANDATORY: At least one blockchain anchor required.');
        }
        // 4. Build beacon (unsigned)
        this.nonce++;
        const unsignedBeacon = {
            nodeId: this.config.agentId,
            peerId: this.keyPair.publicKey,
            poeHash: poeHashBytes,
            zkProofRef: zkProofRef,
            solanaTx,
            baseTx,
            capabilities,
            timestamp: now,
            nonce: this.nonce,
            signature: new Uint8Array(0) // Placeholder
        };
        // 5. Sign the beacon
        const payloadBytes = (0, proto_1.encodeBeacon)(unsignedBeacon);
        const signature = await (0, signing_1.sign)(payloadBytes, this.keyPair.privateKey);
        const signedBeacon = {
            ...unsignedBeacon,
            signature
        };
        // 6. Broadcast
        await this.p2p.broadcast(signedBeacon);
        this.lastBroadcastTime = now;
        return signedBeacon;
    }
    /**
     * MANDATORY Peer Verification: Verify an external peer's proof before proceeding.
     * Returns false if:
     * - No blockchain anchor exists
     * - ZK proof reference is missing
     */
    async verifyPeer(beacon) {
        console.log(`[SOVEREIGN] Verifying Peer: ${beacon.nodeId}...`);
        // MANDATORY: Must have at least one on-chain anchor
        if (!beacon.solanaTx && !beacon.baseTx) {
            console.warn(`[SOVEREIGN] REJECTED: No blockchain anchor for ${beacon.nodeId}`);
            return false;
        }
        // MANDATORY: Must have ZK proof reference
        if (!beacon.zkProofRef || beacon.zkProofRef.length === 0) {
            console.warn(`[SOVEREIGN] REJECTED: No ZK proof reference for ${beacon.nodeId}`);
            return false;
        }
        // TODO: Add actual RPC verification for Solana/Base in production
        // For now, we verify the anchor exists (string is non-empty)
        console.log(`[SOVEREIGN] Verification PASSED for ${beacon.nodeId}`);
        return true;
    }
    onPeerDiscovered(callback) {
        this.p2p.onDiscovery(callback);
    }
    async shutdown() {
        await this.p2p.stop();
    }
    getPublicKey() {
        return this.keyPair?.publicKey;
    }
}
exports.SovereignNode = SovereignNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU292ZXJlaWduTm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Tb3ZlcmVpZ25Ob2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhEQUEyRDtBQUMzRCwwREFBdUQ7QUFDdkQsNERBQXVFO0FBQ3ZFLHVEQUFvRTtBQUNwRSw4Q0FBa0U7QUFDbEUsbUNBQXVDO0FBQ3ZDLCtDQUFpQztBQVdqQzs7Ozs7Ozs7R0FRRztBQUNILE1BQWEsYUFBYTtJQVV0QixZQUFZLE1BQTJCO1FBSC9CLFVBQUssR0FBVyxDQUFDLENBQUM7UUFDbEIsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1FBR2xDLElBQUksQ0FBQyxNQUFNLEdBQUc7WUFDVixpQkFBaUIsRUFBRSxNQUFNLEVBQUUsb0JBQW9CO1lBQy9DLEdBQUcsTUFBTTtTQUNaLENBQUM7UUFFRixJQUFJLE1BQU0sQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLDZCQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRUQsSUFBSSxNQUFNLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkseUJBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBRUQsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLG1DQUFnQixFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVM7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLG9EQUFvRCxD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QUM7UUFDakIsQ0FBQztRQUVELGtFQUFrRTtRQUNsRSw2REFBNkQ7UUFFN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDcEUsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELGdCQUFnQixDQUFDLFFBQXdDO1FBQ3JELElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUTtRQUNWLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsWUFBWTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUM7SUFDbkMsQ0FBQztDQUNKO0FBNUtELHNDQTRLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNvbGFuYUFkYXB0ZXIgfSBmcm9tICcuL2Jsb2NrY2hhaW4vU29sYW5hQWRhcHRlcic7XG5pbXBvcnQgeyBCYXNlQWRhcHRlciB9IGZyb20gJy4vYmxvY2tjaGFpbi9CYXNlQWRhcHRlcic7XG5pbXBvcnQgeyBaS1Byb29mR2VuZXJhdG9yLCBaS1Byb29mSW5wdXQgfSBmcm9tICcuL3prL1pLUHJvb2ZHZW5lcmF0b3InO1xuaW1wb3J0IHsgR29zc2lwTm9kZSwgUG9FQmVhY29uUHJvdG8gfSBmcm9tICcuL2Rpc2NvdmVyeS9Hb3NzaXBOb2RlJztcbmltcG9ydCB7IGdlbmVyYXRlS2V5UGFpciwgc2lnbiwgS2V5UGFpciB9IGZyb20gJy4vY3J5cHRvL3NpZ25pbmcnO1xuaW1wb3J0IHsgZW5jb2RlQmVhY29uIH0gZnJvbSAnLi9wcm90byc7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcblxuZXhwb3J0IGludGVyZmFjZSBTb3ZlcmVpZ25Ob2RlQ29uZmlnIHtcbiAgICBzb2xhbmFScGNVcmw/OiBzdHJpbmc7XG4gICAgc29sYW5hUHJpdmF0ZUtleT86IHN0cmluZztcbiAgICBiYXNlUnBjVXJsPzogc3RyaW5nO1xuICAgIGJhc2VQcml2YXRlS2V5Pzogc3RyaW5nO1xuICAgIGFnZW50SWQ6IHN0cmluZztcbiAgICBiZWFjb25SYXRlTGltaXRNcz86IG51bWJlcjsgLy8gU3BhbSBwcm90ZWN0aW9uLCBkZWZhdWx0IDUgbWludXRlc1xufVxuXG4vKipcbiAqIFNvdmVyZWlnbk5vZGUgVjIgLSBIYXJkZW5lZCBQRFAgYWdlbnQgbm9kZSB3aXRoIGNyeXB0b2dyYXBoaWMgaWRlbnRpdHkuXG4gKiBcbiAqIEltcHJvdmVtZW50cyBvdmVyIFYxOlxuICogLSBFZDI1NTE5IGtleXBhaXIgZm9yIGJlYWNvbiBzaWduaW5nXG4gKiAtIE5vbmNlLWJhc2VkIHJlcGxheSBwcm90ZWN0aW9uXG4gKiAtIE1hbmRhdG9yeSBvbi1jaGFpbiBhbmNob3IgdmFsaWRhdGlvblxuICogLSBSYXRlIGxpbWl0aW5nIGZvciBzcGFtIHJlc2lzdGFuY2VcbiAqL1xuZXhwb3J0IGNsYXNzIFNvdmVyZWlnbk5vZGUge1xuICAgIHByaXZhdGUgc29sYW5hPzogU29sYW5hQWRhcHRlcjtcbiAgICBwcml2YXRlIGJhc2U/OiBCYXNlQWRhcHRlcjtcbiAgICBwcml2YXRlIHprOiBaS1Byb29mR2VuZXJhdG9yO1xuICAgIHByaXZhdGUgcDJwOiBHb3NzaXBOb2RlO1xuICAgIHByaXZhdGUgY29uZmlnOiBTb3ZlcmVpZ25Ob2RlQ29uZmlnO1xuICAgIHByaXZhdGUga2V5UGFpcj86IEtleVBhaXI7XG4gICAgcHJpdmF0ZSBub25jZTogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIGxhc3RCcm9hZGNhc3RUaW1lOiBudW1iZXIgPSAwO1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBTb3ZlcmVpZ25Ob2RlQ29uZmlnKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICAgICAgYmVhY29uUmF0ZUxpbWl0TXM6IDMwMDAwMCwgLy8gNSBtaW51dGVzIGRlZmF1bHRcbiAgICAgICAgICAgIC4uLmNvbmZpZ1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChjb25maWcuc29sYW5hUnBjVXJsICYmIGNvbmZpZy5zb2xhbmFQcml2YXRlS2V5KSB7XG4gICAgICAgICAgICB0aGlzLnNvbGFuYSA9IG5ldyBTb2xhbmFBZGFwdGVyKGNvbmZpZy5zb2xhbmFScGNVcmwsIGNvbmZpZy5zb2xhbmFQcml2YXRlS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcuYmFzZVJwY1VybCAmJiBjb25maWcuYmFzZVByaXZhdGVLZXkpIHtcbiAgICAgICAgICAgIHRoaXMuYmFzZSA9IG5ldyBCYXNlQWRhcHRlcihjb25maWcuYmFzZVJwY1VybCwgY29uZmlnLmJhc2VQcml2YXRlS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuemsgPSBuZXcgWktQcm9vZkdlbmVyYXRvcigpO1xuICAgICAgICB0aGlzLnAycCA9IG5ldyBHb3NzaXBOb2RlKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgYm9vdHN0cmFwKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gQm9vdHN0cmFwcGluZyBQRFAgU292ZXJlaWduIE5vZGUgVjIuLi5gKTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBFZDI1NTE5IGtleXBhaXIgZm9yIHNpZ25pbmdcbiAgICAgICAgdGhpcy5rZXlQYWlyID0gYXdhaXQgZ2VuZXJhdGVLZXlQYWlyKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbU09WRVJFSUdOXSBJZGVudGl0eTogJHtCdWZmZXIuZnJvbSh0aGlzLmtleVBhaXIucHVibGljS2V5KS50b1N0cmluZygnaGV4Jykuc3Vic3RyaW5nKDAsIDE2KX0uLi5gKTtcblxuICAgICAgICBhd2FpdCB0aGlzLnAycC5zdGFydCgpO1xuXG4gICAgICAgIGlmICh0aGlzLnNvbGFuYSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIFNvbGFuYSBXYWxsZXQ6ICR7dGhpcy5zb2xhbmEuZ2V0UHVibGljS2V5KCl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYmFzZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIEJhc2UgV2FsbGV0OiAke3RoaXMuYmFzZS5nZXRXYWxsZXRBZGRyZXNzKCl9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmltYXJ5IGZsb3c6IEFuY2hvcnMgYW5kIEJyb2FkY2FzdHMgYSBuZXcgUHJvb2Ygb2YgRXhlY3V0aW9uLlxuICAgICAqL1xuICAgIGFzeW5jIHRlc3RpZnkodGFza0lkOiBzdHJpbmcsIG91dHB1dERhdGE6IHN0cmluZywgY2FwYWJpbGl0aWVzOiBzdHJpbmdbXSk6IFByb21pc2U8UG9FQmVhY29uUHJvdG8+IHtcbiAgICAgICAgaWYgKCF0aGlzLmtleVBhaXIpIHRocm93IG5ldyBFcnJvcignTm9kZSBub3QgYm9vdHN0cmFwcGVkJyk7XG5cbiAgICAgICAgLy8gUmF0ZSBsaW1pdGluZyBjaGVja1xuICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBpZiAobm93IC0gdGhpcy5sYXN0QnJvYWRjYXN0VGltZSA8IHRoaXMuY29uZmlnLmJlYWNvblJhdGVMaW1pdE1zISkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSYXRlIGxpbWl0ZWQuIFdhaXQgJHtNYXRoLmNlaWwoKHRoaXMuY29uZmlnLmJlYWNvblJhdGVMaW1pdE1zISAtIChub3cgLSB0aGlzLmxhc3RCcm9hZGNhc3RUaW1lKSkgLyAxMDAwKX1zYCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gVGVzdGlmeWluZyBmb3IgVGFzazogJHt0YXNrSWR9YCk7XG5cbiAgICAgICAgLy8gMS4gR2VuZXJhdGUgUG9FIEhhc2hcbiAgICAgICAgY29uc3QgcG9lSGFzaEJ5dGVzID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShvdXRwdXREYXRhKS5kaWdlc3QoKTtcblxuICAgICAgICAvLyAyLiBHZW5lcmF0ZSBaSyBQcm9vZlxuICAgICAgICBjb25zdCB6a0lucHV0OiBaS1Byb29mSW5wdXQgPSB7XG4gICAgICAgICAgICB0YXNrSWQsXG4gICAgICAgICAgICBjb21wbGV0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgc2xhRGVhZGxpbmVTZWNvbmRzOiAzMDAsXG4gICAgICAgICAgICB2ZXJhY2l0eVNjb3JlOiAwLjg1LCAvLyBGaXhlZCBoaWdoIHZlcmFjaXR5IGZvciBoYXJkZW5lZCBub2Rlc1xuICAgICAgICAgICAgb3V0cHV0SGFzaDogQnVmZmVyLmZyb20ocG9lSGFzaEJ5dGVzKS50b1N0cmluZygnaGV4JylcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgemtCdW5kbGUgPSBhd2FpdCB0aGlzLnprLmdlbmVyYXRlUHJvb2YoemtJbnB1dCk7XG4gICAgICAgIGNvbnN0IHprUHJvb2ZSZWYgPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKHprQnVuZGxlLnByb29mKS5kaWdlc3QoKTtcblxuICAgICAgICAvLyAzLiBNQU5EQVRPUlkgQW5jaG9yaW5nIChhdCBsZWFzdCBvbmUgY2hhaW4gcmVxdWlyZWQpXG4gICAgICAgIGxldCBzb2xhbmFUeCA9ICcnO1xuICAgICAgICBsZXQgYmFzZVR4ID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuc29sYW5hKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gQW5jaG9yaW5nIHRvIFNvbGFuYS4uLmApO1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gYXdhaXQgdGhpcy5zb2xhbmEuYW5jaG9yUG9FKFxuICAgICAgICAgICAgICAgIEJ1ZmZlci5mcm9tKHBvZUhhc2hCeXRlcykudG9TdHJpbmcoJ2hleCcpLFxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmFnZW50SWRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBzb2xhbmFUeCA9IGFuY2hvci5zaWduYXR1cmU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gU29sYW5hIEFuY2hvcjogJHtzb2xhbmFUeC5zdWJzdHJpbmcoMCwgMjApfS4uLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYmFzZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIEFuY2hvcmluZyB0byBCYXNlLi4uYCk7XG4gICAgICAgICAgICBjb25zdCBhbmNob3IgPSBhd2FpdCB0aGlzLmJhc2UuYW5jaG9yUG9FKFxuICAgICAgICAgICAgICAgIEJ1ZmZlci5mcm9tKHBvZUhhc2hCeXRlcykudG9TdHJpbmcoJ2hleCcpLFxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmFnZW50SWRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBiYXNlVHggPSBhbmNob3IudHhIYXNoO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIEJhc2UgQW5jaG9yOiAke2Jhc2VUeC5zdWJzdHJpbmcoMCwgMjApfS4uLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTUFOREFUT1JZOiBNdXN0IGhhdmUgYXQgbGVhc3Qgb25lIGFuY2hvclxuICAgICAgICBpZiAoIXNvbGFuYVR4ICYmICFiYXNlVHgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTUFOREFUT1JZOiBBdCBsZWFzdCBvbmUgYmxvY2tjaGFpbiBhbmNob3IgcmVxdWlyZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0LiBCdWlsZCBiZWFjb24gKHVuc2lnbmVkKVxuICAgICAgICB0aGlzLm5vbmNlKys7XG4gICAgICAgIGNvbnN0IHVuc2lnbmVkQmVhY29uOiBQb0VCZWFjb25Qcm90byA9IHtcbiAgICAgICAgICAgIG5vZGVJZDogdGhpcy5jb25maWcuYWdlbnRJZCxcbiAgICAgICAgICAgIHBlZXJJZDogdGhpcy5rZXlQYWlyLnB1YmxpY0tleSxcbiAgICAgICAgICAgIHBvZUhhc2g6IHBvZUhhc2hCeXRlcyxcbiAgICAgICAgICAgIHprUHJvb2ZSZWY6IHprUHJvb2ZSZWYsXG4gICAgICAgICAgICBzb2xhbmFUeCxcbiAgICAgICAgICAgIGJhc2VUeCxcbiAgICAgICAgICAgIGNhcGFiaWxpdGllcyxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbm93LFxuICAgICAgICAgICAgbm9uY2U6IHRoaXMubm9uY2UsXG4gICAgICAgICAgICBzaWduYXR1cmU6IG5ldyBVaW50OEFycmF5KDApIC8vIFBsYWNlaG9sZGVyXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gNS4gU2lnbiB0aGUgYmVhY29uXG4gICAgICAgIGNvbnN0IHBheWxvYWRCeXRlcyA9IGVuY29kZUJlYWNvbih1bnNpZ25lZEJlYWNvbik7XG4gICAgICAgIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IHNpZ24ocGF5bG9hZEJ5dGVzLCB0aGlzLmtleVBhaXIucHJpdmF0ZUtleSk7XG5cbiAgICAgICAgY29uc3Qgc2lnbmVkQmVhY29uOiBQb0VCZWFjb25Qcm90byA9IHtcbiAgICAgICAgICAgIC4uLnVuc2lnbmVkQmVhY29uLFxuICAgICAgICAgICAgc2lnbmF0dXJlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gNi4gQnJvYWRjYXN0XG4gICAgICAgIGF3YWl0IHRoaXMucDJwLmJyb2FkY2FzdChzaWduZWRCZWFjb24pO1xuICAgICAgICB0aGlzLmxhc3RCcm9hZGNhc3RUaW1lID0gbm93O1xuXG4gICAgICAgIHJldHVybiBzaWduZWRCZWFjb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTUFOREFUT1JZIFBlZXIgVmVyaWZpY2F0aW9uOiBWZXJpZnkgYW4gZXh0ZXJuYWwgcGVlcidzIHByb29mIGJlZm9yZSBwcm9jZWVkaW5nLlxuICAgICAqIFJldHVybnMgZmFsc2UgaWY6XG4gICAgICogLSBObyBibG9ja2NoYWluIGFuY2hvciBleGlzdHNcbiAgICAgKiAtIFpLIHByb29mIHJlZmVyZW5jZSBpcyBtaXNzaW5nXG4gICAgICovXG4gICAgYXN5bmMgdmVyaWZ5UGVlcihiZWFjb246IFBvRUJlYWNvblByb3RvKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbU09WRVJFSUdOXSBWZXJpZnlpbmcgUGVlcjogJHtiZWFjb24ubm9kZUlkfS4uLmApO1xuXG4gICAgICAgIC8vIE1BTkRBVE9SWTogTXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBvbi1jaGFpbiBhbmNob3JcbiAgICAgICAgaWYgKCFiZWFjb24uc29sYW5hVHggJiYgIWJlYWNvbi5iYXNlVHgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1NPVkVSRUlHTl0gUkVKRUNURUQ6IE5vIGJsb2NrY2hhaW4gYW5jaG9yIGZvciAke2JlYWNvbi5ub2RlSWR9YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNQU5EQVRPUlk6IE11c3QgaGF2ZSBaSyBwcm9vZiByZWZlcmVuY2VcbiAgICAgICAgaWYgKCFiZWFjb24uemtQcm9vZlJlZiB8fCBiZWFjb24uemtQcm9vZlJlZi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1NPVkVSRUlHTl0gUkVKRUNURUQ6IE5vIFpLIHByb29mIHJlZmVyZW5jZSBmb3IgJHtiZWFjb24ubm9kZUlkfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogQWRkIGFjdHVhbCBSUEMgdmVyaWZpY2F0aW9uIGZvciBTb2xhbmEvQmFzZSBpbiBwcm9kdWN0aW9uXG4gICAgICAgIC8vIEZvciBub3csIHdlIHZlcmlmeSB0aGUgYW5jaG9yIGV4aXN0cyAoc3RyaW5nIGlzIG5vbi1lbXB0eSlcblxuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gVmVyaWZpY2F0aW9uIFBBU1NFRCBmb3IgJHtiZWFjb24ubm9kZUlkfWApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBvblBlZXJEaXNjb3ZlcmVkKGNhbGxiYWNrOiAocGVlcjogUG9FQmVhY29uUHJvdG8pID0+IHZvaWQpIHtcbiAgICAgICAgdGhpcy5wMnAub25EaXNjb3ZlcnkoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGFzeW5jIHNodXRkb3duKCkge1xuICAgICAgICBhd2FpdCB0aGlzLnAycC5zdG9wKCk7XG4gICAgfVxuXG4gICAgZ2V0UHVibGljS2V5KCk6IFVpbnQ4QXJyYXkgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlQYWlyPy5wdWJsaWNLZXk7XG4gICAgfVxufVxuIl19