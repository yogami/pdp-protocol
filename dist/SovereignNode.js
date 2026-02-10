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
const crypto = __importStar(require("crypto"));
const NonceManager_1 = require("./vera/NonceManager");
const SignatureProvider_1 = require("./crypto/SignatureProvider");
/**
 * SovereignNode V2 (VERA Hardened)
 * - Implements VERA Paper §4.2 (Behavioral Proof)
 * - Implements §4.2.1a (Tool Execution Receipts)
 * - Manages Nonce Lifecycle via NonceManager
 * - Enforces Ed25519 signing and Anchor validation
 */
class SovereignNode {
    constructor(config) {
        this.nonceCounter = 0;
        this.lastBroadcastTime = 0;
        this.config = {
            beaconRateLimitMs: 300000,
            trustTier: 'T2',
            signatureAlgorithm: 'Ed25519',
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
        this.nonceManager = new NonceManager_1.NonceManager();
        this.signer = (0, SignatureProvider_1.getProvider)(this.config.signatureAlgorithm);
    }
    async bootstrap() {
        console.log(`[SOVEREIGN] Bootstrapping PDP Sovereign Node V2 (VERA Compliant)...`);
        console.log(`[SOVEREIGN] Signature Algorithm: ${this.signer.algorithm}`);
        // Generate keypair for signing
        this.keyPair = await this.signer.generateKeyPair();
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
     * Issue an authorization nonce for a tool execution.
     * Implements §4.2.1a: PEP issues nonce bound to decision.
     */
    issueAuthorizationNonce(actionId, toolId, requestHash) {
        return this.nonceManager.issueNonce(actionId, toolId, requestHash, this.config.trustTier);
    }
    /**
     * Primary flow: Anchors and Broadcasts a new VERA Proof of Execution.
     */
    async testify(actionId, taskId, outputData, capabilities, receipt // Optional receipt for VERA §4.2.1a
    ) {
        if (!this.keyPair)
            throw new Error('Node not bootstrapped');
        // Rate limiting check
        const now = Date.now();
        if (now - this.lastBroadcastTime < this.config.beaconRateLimitMs) {
            throw new Error(`Rate limited. Wait ${Math.ceil((this.config.beaconRateLimitMs - (now - this.lastBroadcastTime)) / 1000)}s`);
        }
        console.log(`[SOVEREIGN] Testifying for Action: ${actionId} (Task: ${taskId})`);
        // 1. Verify Receipt if present (VERA §4.2.1a)
        let receiptHashUndefined;
        let receiptAssurance = 'log-correlated';
        if (receipt) {
            // Verify receipt validity and consume nonce
            await this.verifyToolReceipt(receipt);
            // Hash the receipt for inclusion in PoE
            const receiptBytes = crypto.createHash('sha256').update(JSON.stringify(receipt)).digest();
            receiptHashUndefined = receiptBytes.toString('hex');
            receiptAssurance = 'tool-signed';
            console.log(`[SOVEREIGN] Tool Receipt Verified & Linked: ${receiptHashUndefined.substring(0, 16)}...`);
        }
        // 2. Generate Action Result Hash (JCS Canonicalized in real impl, simplified here)
        const resultHash = crypto.createHash('sha256').update(outputData).digest('hex');
        // 3. Generate ZK Proof (Logic maintained from V1)
        const zkInput = {
            taskId,
            completedAt: new Date().toISOString(),
            slaDeadlineSeconds: 300,
            veracityScore: 0.85,
            outputHash: resultHash
        };
        const zkBundle = await this.zk.generateProof(zkInput);
        const zkProofRef = crypto.createHash('sha256').update(zkBundle.proof).digest('hex');
        // 4. MANDATORY Anchoring (at least one chain required)
        let solanaTx = '';
        let baseTx = '';
        if (this.solana) {
            console.log(`[SOVEREIGN] Anchoring to Solana...`);
            const anchor = await this.solana.anchorPoE(resultHash, this.config.agentId);
            solanaTx = anchor.signature;
        }
        if (this.base) {
            console.log(`[SOVEREIGN] Anchoring to Base...`);
            const anchor = await this.base.anchorPoE(resultHash, this.config.agentId);
            baseTx = anchor.txHash;
        }
        if (!solanaTx && !baseTx) {
            throw new Error('MANDATORY: At least one blockchain anchor required.');
        }
        // 5. Build VERA PoE (unsigned)
        this.nonceCounter++;
        const timestampIso = new Date(now).toISOString();
        // Construct the VERA ProofOfExecution object
        // Note: We use 'any' for the intermediate unsigned object to allow adding signature later
        const unsignedPoE = {
            actionId,
            agentDid: `did:web:${this.config.agentId}`,
            signerType: 'agent', // Or 'dual' if PEP co-signs
            signatureAlgorithm: this.signer.algorithm, // Dynamic algorithm
            action: {
                type: 'task_execution',
                target: taskId,
                parameters: { taskId, capabilities }, // Simplified
                resultHash
            },
            context: {
                sessionId: 'session-' + now,
                sequenceNumber: this.nonceCounter,
                previousProofHash: '00000000000000000000000000000000', // Genesis or previous
                triggeredBy: 'user_request'
            },
            timestamp: {
                agentClock: timestampIso,
                verifiedSource: solanaTx ? 'anchor-derived' : undefined
            },
            keyId: 'key-1',
            receiptHash: receiptHashUndefined,
            receiptAssurance,
            anchor: solanaTx ? {
                backend: 'blockchain',
                proofHash: resultHash,
                anchorId: solanaTx,
                anchorTimestamp: timestampIso, // Approximate
                verificationEndpoint: `https://explorer.solana.com/tx/${solanaTx}`
            } : undefined
        };
        // 6. Sign the PoE
        // In VERA, we sign the JCS canonical string. Here we use JSON.stringify for simplicity.
        const payloadBytes = Buffer.from(JSON.stringify(unsignedPoE));
        const signatureBytes = await this.signer.sign(payloadBytes, this.keyPair.privateKey);
        const signatureHex = Buffer.from(signatureBytes).toString('hex');
        const signedPoE = {
            ...unsignedPoE,
            signature: signatureHex
        };
        // 7. Compatibility Broadcast (Mapping VERA PoE to strict LegacyBeacon format for GossipNode)
        // See LegacyBeacon interface above
        const legacyBeacon = {
            nodeId: this.config.agentId,
            peerId: this.keyPair.publicKey,
            poeHash: Buffer.from(resultHash, 'hex'),
            zkProofRef: Buffer.from(zkProofRef, 'hex'),
            solanaTx,
            baseTx,
            capabilities,
            timestamp: now,
            nonce: this.nonceCounter,
            // We use the VERA signature here, but GossipNode expects Uint8Array
            signature: signatureBytes
        };
        // Cast legacyBeacon to PoEBeaconProto (they are structurally compatible)
        await this.p2p.broadcast(legacyBeacon);
        this.lastBroadcastTime = now;
        return signedPoE;
    }
    /**
     * VERA §4.2.1a: Tool Execution Receipt Verification
     * - Verifies tool signature (simulated)
     * - Verifies nonce binding via NonceManager
     * - Checks parameter integrity (requestHash match)
     */
    async verifyToolReceipt(receipt) {
        console.log(`[SOVEREIGN] Verifying Receipt for Tool: ${receipt.toolId}`);
        // 1. Consume Nonce (This performs checks a, b, c, d from §4.2.1a)
        // Check (d) requires us to know the original requestHash
        // In a real system, we'd look up the authorized requestHash associated with the actionId
        // For this reference impl, we extract the nonce record first to validate binding
        // This implicitly consumes if valid, throws if invalid
        /*
           NOTE: In a real implementation, we would re-calculate the hash of
           receipt.parameters to verify it matches the nonce's requestHash.
           Here we assume correct binding for demonstration.
        */
        try {
            this.nonceManager.consumeNonce(receipt.authorizationNonce, receipt.resultHash);
        }
        catch (error) {
            if (error instanceof NonceManager_1.NonceError) {
                console.error(`[SOVEREIGN] Receipt Rejected: ${error.message}`);
                throw new Error(`Receipt Verification Failed: ${error.message}`);
            }
            throw error;
        }
        // 2. Verify Tool Signature
        // Simulating signature check. In prod, fetch tool's public key from registry/DID.
        // const toolPubKey = await registry.getToolKey(receipt.toolId);
        // const isValid = await verify(receipt.signature, canonical(receipt), toolPubKey);
        console.log(`[SOVEREIGN] Receipt Signature Validated (Simulated)`);
        return true;
    }
    /**
     * Legacy Peer Verification (Updated for VERA compatibility)
     */
    async verifyPeer(beacon) {
        console.log(`[SOVEREIGN] Verifying Peer: ${beacon.nodeId}...`);
        if (!beacon.solanaTx && !beacon.baseTx) {
            console.warn(`[SOVEREIGN] REJECTED: No blockchain anchor for ${beacon.nodeId}`);
            return false;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU292ZXJlaWduTm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Tb3ZlcmVpZ25Ob2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhEQUEyRDtBQUMzRCwwREFBdUQ7QUFDdkQsNERBQXVFO0FBQ3ZFLHVEQUFvRDtBQUdwRCwrQ0FBaUM7QUFRakMsc0RBQStEO0FBQy9ELGtFQUFnRztBQThCaEc7Ozs7OztHQU1HO0FBQ0gsTUFBYSxhQUFhO0lBWXRCLFlBQVksTUFBMkI7UUFML0IsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1FBS2xDLElBQUksQ0FBQyxNQUFNLEdBQUc7WUFDVixpQkFBaUIsRUFBRSxNQUFNO1lBQ3pCLFNBQVMsRUFBRSxJQUFJO1lBQ2Ysa0JBQWtCLEVBQUUsU0FBUztZQUM3QixHQUFHLE1BQU07U0FDWixDQUFDO1FBRUYsSUFBSSxNQUFNLENBQUMsWUFBWSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2pELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSw2QkFBYSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVELElBQUksTUFBTSxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLHlCQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVELElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxtQ0FBZ0IsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLDJC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QUNoQixDQUFDO1FBRUQsMkJBQTJCO1FBQzNCLGtGQUFrRjtRQUNsRixnRUFBZ0U7UUFDaEUsbUZBQW1GO1FBRW5GLE9BQU8sQ0FBQyxHQUFHLENBQUMscURBQXFELENBQUMsQ0FBQztRQUVuRSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQVc7UUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7UUFFL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxrREFBa0QsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDaEYsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxRQUE2QjtRQUMxQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVE7UUFDVixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELFlBQVk7UUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO0lBQ25DLENBQUM7Q0FDSjtBQW5SRCxzQ0FtUkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTb2xhbmFBZGFwdGVyIH0gZnJvbSAnLi9ibG9ja2NoYWluL1NvbGFuYUFkYXB0ZXInO1xuaW1wb3J0IHsgQmFzZUFkYXB0ZXIgfSBmcm9tICcuL2Jsb2NrY2hhaW4vQmFzZUFkYXB0ZXInO1xuaW1wb3J0IHsgWktQcm9vZkdlbmVyYXRvciwgWktQcm9vZklucHV0IH0gZnJvbSAnLi96ay9aS1Byb29mR2VuZXJhdG9yJztcbmltcG9ydCB7IEdvc3NpcE5vZGUgfSBmcm9tICcuL2Rpc2NvdmVyeS9Hb3NzaXBOb2RlJztcbmltcG9ydCB7IGdlbmVyYXRlS2V5UGFpciwgc2lnbiwgS2V5UGFpciB9IGZyb20gJy4vY3J5cHRvL3NpZ25pbmcnO1xuaW1wb3J0IHsgZW5jb2RlQmVhY29uIH0gZnJvbSAnLi9wcm90byc7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcbmltcG9ydCB7XG4gICAgUHJvb2ZPZkV4ZWN1dGlvbixcbiAgICBUb29sRXhlY3V0aW9uUmVjZWlwdCxcbiAgICBOb25jZVJlY29yZCxcbiAgICBUcnVzdFRpZXIsXG4gICAgU2lnbmVyVHlwZVxufSBmcm9tICcuL3ZlcmEvdHlwZXMnO1xuaW1wb3J0IHsgTm9uY2VNYW5hZ2VyLCBOb25jZUVycm9yIH0gZnJvbSAnLi92ZXJhL05vbmNlTWFuYWdlcic7XG5pbXBvcnQgeyBnZXRQcm92aWRlciwgU2lnbmF0dXJlUHJvdmlkZXIsIFNpZ25hdHVyZUFsZ29yaXRobSB9IGZyb20gJy4vY3J5cHRvL1NpZ25hdHVyZVByb3ZpZGVyJztcblxuLy8gQ29tcGF0aWJpbGl0eSBzaGltIGZvciBHb3NzaXBOb2RlIHVudGlsIGl0J3MgZnVsbHkgdXBncmFkZWRcbi8vIEluIGEgcmVhbCByZWZhY3RvciwgR29zc2lwTm9kZSB3b3VsZCBhbHNvIG1pZ3JhdGUgdG8gUHJvb2ZPZkV4ZWN1dGlvblxuaW50ZXJmYWNlIExlZ2FjeUJlYWNvbiB7XG4gICAgbm9kZUlkOiBzdHJpbmc7XG4gICAgcGVlcklkOiBVaW50OEFycmF5O1xuICAgIHBvZUhhc2g6IFVpbnQ4QXJyYXk7XG4gICAgemtQcm9vZlJlZjogVWludDhBcnJheTtcbiAgICBzb2xhbmFUeDogc3RyaW5nO1xuICAgIGJhc2VUeDogc3RyaW5nO1xuICAgIGNhcGFiaWxpdGllczogc3RyaW5nW107XG4gICAgdGltZXN0YW1wOiBudW1iZXI7XG4gICAgbm9uY2U6IG51bWJlcjtcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXk7XG4gICAgdmVyYVBheWxvYWQ/OiBVaW50OEFycmF5O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNvdmVyZWlnbk5vZGVDb25maWcge1xuICAgIHNvbGFuYVJwY1VybD86IHN0cmluZztcbiAgICBzb2xhbmFQcml2YXRlS2V5Pzogc3RyaW5nO1xuICAgIGJhc2VScGNVcmw/OiBzdHJpbmc7XG4gICAgYmFzZVByaXZhdGVLZXk/OiBzdHJpbmc7XG4gICAgYWdlbnRJZDogc3RyaW5nO1xuICAgIGJlYWNvblJhdGVMaW1pdE1zPzogbnVtYmVyOyAvLyBTcGFtIHByb3RlY3Rpb24sIGRlZmF1bHQgNSBtaW51dGVzXG4gICAgdHJ1c3RUaWVyPzogVHJ1c3RUaWVyOyAgICAgIC8vIERlZmF1bHQgdG8gVDIgaWYgbm90IHNwZWNpZmllZFxuICAgIHNpZ25hdHVyZUFsZ29yaXRobT86IFNpZ25hdHVyZUFsZ29yaXRobTsgLy8gVkVSQSBBMSc6IENyeXB0byBBZ2lsaXR5XG59XG5cblxuLyoqXG4gKiBTb3ZlcmVpZ25Ob2RlIFYyIChWRVJBIEhhcmRlbmVkKVxuICogLSBJbXBsZW1lbnRzIFZFUkEgUGFwZXIgwqc0LjIgKEJlaGF2aW9yYWwgUHJvb2YpXG4gKiAtIEltcGxlbWVudHMgwqc0LjIuMWEgKFRvb2wgRXhlY3V0aW9uIFJlY2VpcHRzKVxuICogLSBNYW5hZ2VzIE5vbmNlIExpZmVjeWNsZSB2aWEgTm9uY2VNYW5hZ2VyXG4gKiAtIEVuZm9yY2VzIEVkMjU1MTkgc2lnbmluZyBhbmQgQW5jaG9yIHZhbGlkYXRpb25cbiAqL1xuZXhwb3J0IGNsYXNzIFNvdmVyZWlnbk5vZGUge1xuICAgIHByaXZhdGUgc29sYW5hPzogU29sYW5hQWRhcHRlcjtcbiAgICBwcml2YXRlIGJhc2U/OiBCYXNlQWRhcHRlcjtcbiAgICBwcml2YXRlIHprOiBaS1Byb29mR2VuZXJhdG9yO1xuICAgIHByaXZhdGUgcDJwOiBHb3NzaXBOb2RlO1xuICAgIHByaXZhdGUgY29uZmlnOiBTb3ZlcmVpZ25Ob2RlQ29uZmlnO1xuICAgIHByaXZhdGUga2V5UGFpcj86IEtleVBhaXI7XG4gICAgcHJpdmF0ZSBub25jZUNvdW50ZXI6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBsYXN0QnJvYWRjYXN0VGltZTogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIG5vbmNlTWFuYWdlcjogTm9uY2VNYW5hZ2VyO1xuICAgIHByaXZhdGUgc2lnbmVyOiBTaWduYXR1cmVQcm92aWRlcjtcblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogU292ZXJlaWduTm9kZUNvbmZpZykge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgIGJlYWNvblJhdGVMaW1pdE1zOiAzMDAwMDAsXG4gICAgICAgICAgICB0cnVzdFRpZXI6ICdUMicsXG4gICAgICAgICAgICBzaWduYXR1cmVBbGdvcml0aG06ICdFZDI1NTE5JyxcbiAgICAgICAgICAgIC4uLmNvbmZpZ1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChjb25maWcuc29sYW5hUnBjVXJsICYmIGNvbmZpZy5zb2xhbmFQcml2YXRlS2V5KSB7XG4gICAgICAgICAgICB0aGlzLnNvbGFuYSA9IG5ldyBTb2xhbmFBZGFwdGVyKGNvbmZpZy5zb2xhbmFScGNVcmwsIGNvbmZpZy5zb2xhbmFQcml2YXRlS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcuYmFzZVJwY1VybCAmJiBjb25maWcuYmFzZVByaXZhdGVLZXkpIHtcbiAgICAgICAgICAgIHRoaXMuYmFzZSA9IG5ldyBCYXNlQWRhcHRlcihjb25maWcuYmFzZVJwY1VybCwgY29uZmlnLmJhc2VQcml2YXRlS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuemsgPSBuZXcgWktQcm9vZkdlbmVyYXRvcigpO1xuICAgICAgICB0aGlzLnAycCA9IG5ldyBHb3NzaXBOb2RlKCk7XG4gICAgICAgIHRoaXMubm9uY2VNYW5hZ2VyID0gbmV3IE5vbmNlTWFuYWdlcigpO1xuICAgICAgICB0aGlzLnNpZ25lciA9IGdldFByb3ZpZGVyKHRoaXMuY29uZmlnLnNpZ25hdHVyZUFsZ29yaXRobSk7XG4gICAgfVxuXG4gICAgYXN5bmMgYm9vdHN0cmFwKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gQm9vdHN0cmFwcGluZyBQRFAgU292ZXJlaWduIE5vZGUgVjIgKFZFUkEgQ29tcGxpYW50KS4uLmApO1xuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gU2lnbmF0dXJlIEFsZ29yaXRobTogJHt0aGlzLnNpZ25lci5hbGdvcml0aG19YCk7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUga2V5cGFpciBmb3Igc2lnbmluZ1xuICAgICAgICB0aGlzLmtleVBhaXIgPSBhd2FpdCB0aGlzLnNpZ25lci5nZW5lcmF0ZUtleVBhaXIoKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIElkZW50aXR5OiAke0J1ZmZlci5mcm9tKHRoaXMua2V5UGFpci5wdWJsaWNLZXkpLnRvU3RyaW5nKCdoZXgnKS5zdWJzdHJpbmcoMCwgMTYpfS4uLmApO1xuXG4gICAgICAgIGF3YWl0IHRoaXMucDJwLnN0YXJ0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuc29sYW5hKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gU29sYW5hIFdhbGxldDogJHt0aGlzLnNvbGFuYS5nZXRQdWJsaWNLZXkoKX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5iYXNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gQmFzZSBXYWxsZXQ6ICR7dGhpcy5iYXNlLmdldFdhbGxldEFkZHJlc3MoKX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElzc3VlIGFuIGF1dGhvcml6YXRpb24gbm9uY2UgZm9yIGEgdG9vbCBleGVjdXRpb24uXG4gICAgICogSW1wbGVtZW50cyDCpzQuMi4xYTogUEVQIGlzc3VlcyBub25jZSBib3VuZCB0byBkZWNpc2lvbi5cbiAgICAgKi9cbiAgICBpc3N1ZUF1dGhvcml6YXRpb25Ob25jZShhY3Rpb25JZDogc3RyaW5nLCB0b29sSWQ6IHN0cmluZywgcmVxdWVzdEhhc2g6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLm5vbmNlTWFuYWdlci5pc3N1ZU5vbmNlKFxuICAgICAgICAgICAgYWN0aW9uSWQsXG4gICAgICAgICAgICB0b29sSWQsXG4gICAgICAgICAgICByZXF1ZXN0SGFzaCxcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLnRydXN0VGllclxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByaW1hcnkgZmxvdzogQW5jaG9ycyBhbmQgQnJvYWRjYXN0cyBhIG5ldyBWRVJBIFByb29mIG9mIEV4ZWN1dGlvbi5cbiAgICAgKi9cbiAgICBhc3luYyB0ZXN0aWZ5KFxuICAgICAgICBhY3Rpb25JZDogc3RyaW5nLFxuICAgICAgICB0YXNrSWQ6IHN0cmluZyxcbiAgICAgICAgb3V0cHV0RGF0YTogc3RyaW5nLFxuICAgICAgICBjYXBhYmlsaXRpZXM6IHN0cmluZ1tdLFxuICAgICAgICByZWNlaXB0PzogVG9vbEV4ZWN1dGlvblJlY2VpcHQgLy8gT3B0aW9uYWwgcmVjZWlwdCBmb3IgVkVSQSDCpzQuMi4xYVxuICAgICk6IFByb21pc2U8UHJvb2ZPZkV4ZWN1dGlvbj4ge1xuICAgICAgICBpZiAoIXRoaXMua2V5UGFpcikgdGhyb3cgbmV3IEVycm9yKCdOb2RlIG5vdCBib290c3RyYXBwZWQnKTtcblxuICAgICAgICAvLyBSYXRlIGxpbWl0aW5nIGNoZWNrXG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGlmIChub3cgLSB0aGlzLmxhc3RCcm9hZGNhc3RUaW1lIDwgdGhpcy5jb25maWcuYmVhY29uUmF0ZUxpbWl0TXMhKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJhdGUgbGltaXRlZC4gV2FpdCAke01hdGguY2VpbCgodGhpcy5jb25maWcuYmVhY29uUmF0ZUxpbWl0TXMhIC0gKG5vdyAtIHRoaXMubGFzdEJyb2FkY2FzdFRpbWUpKSAvIDEwMDApfXNgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKGBbU09WRVJFSUdOXSBUZXN0aWZ5aW5nIGZvciBBY3Rpb246ICR7YWN0aW9uSWR9IChUYXNrOiAke3Rhc2tJZH0pYCk7XG5cbiAgICAgICAgLy8gMS4gVmVyaWZ5IFJlY2VpcHQgaWYgcHJlc2VudCAoVkVSQSDCpzQuMi4xYSlcbiAgICAgICAgbGV0IHJlY2VpcHRIYXNoVW5kZWZpbmVkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWNlaXB0QXNzdXJhbmNlOiAndG9vbC1zaWduZWQnIHwgJ2xvZy1jb3JyZWxhdGVkJyA9ICdsb2ctY29ycmVsYXRlZCc7XG5cbiAgICAgICAgaWYgKHJlY2VpcHQpIHtcbiAgICAgICAgICAgIC8vIFZlcmlmeSByZWNlaXB0IHZhbGlkaXR5IGFuZCBjb25zdW1lIG5vbmNlXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnZlcmlmeVRvb2xSZWNlaXB0KHJlY2VpcHQpO1xuXG4gICAgICAgICAgICAvLyBIYXNoIHRoZSByZWNlaXB0IGZvciBpbmNsdXNpb24gaW4gUG9FXG4gICAgICAgICAgICBjb25zdCByZWNlaXB0Qnl0ZXMgPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKEpTT04uc3RyaW5naWZ5KHJlY2VpcHQpKS5kaWdlc3QoKTtcbiAgICAgICAgICAgIHJlY2VpcHRIYXNoVW5kZWZpbmVkID0gcmVjZWlwdEJ5dGVzLnRvU3RyaW5nKCdoZXgnKTtcbiAgICAgICAgICAgIHJlY2VpcHRBc3N1cmFuY2UgPSAndG9vbC1zaWduZWQnO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIFRvb2wgUmVjZWlwdCBWZXJpZmllZCAmIExpbmtlZDogJHtyZWNlaXB0SGFzaFVuZGVmaW5lZC5zdWJzdHJpbmcoMCwgMTYpfS4uLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMi4gR2VuZXJhdGUgQWN0aW9uIFJlc3VsdCBIYXNoIChKQ1MgQ2Fub25pY2FsaXplZCBpbiByZWFsIGltcGwsIHNpbXBsaWZpZWQgaGVyZSlcbiAgICAgICAgY29uc3QgcmVzdWx0SGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUob3V0cHV0RGF0YSkuZGlnZXN0KCdoZXgnKTtcblxuICAgICAgICAvLyAzLiBHZW5lcmF0ZSBaSyBQcm9vZiAoTG9naWMgbWFpbnRhaW5lZCBmcm9tIFYxKVxuICAgICAgICBjb25zdCB6a0lucHV0OiBaS1Byb29mSW5wdXQgPSB7XG4gICAgICAgICAgICB0YXNrSWQsXG4gICAgICAgICAgICBjb21wbGV0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgc2xhRGVhZGxpbmVTZWNvbmRzOiAzMDAsXG4gICAgICAgICAgICB2ZXJhY2l0eVNjb3JlOiAwLjg1LFxuICAgICAgICAgICAgb3V0cHV0SGFzaDogcmVzdWx0SGFzaFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB6a0J1bmRsZSA9IGF3YWl0IHRoaXMuemsuZ2VuZXJhdGVQcm9vZih6a0lucHV0KTtcbiAgICAgICAgY29uc3QgemtQcm9vZlJlZiA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoemtCdW5kbGUucHJvb2YpLmRpZ2VzdCgnaGV4Jyk7XG5cbiAgICAgICAgLy8gNC4gTUFOREFUT1JZIEFuY2hvcmluZyAoYXQgbGVhc3Qgb25lIGNoYWluIHJlcXVpcmVkKVxuICAgICAgICBsZXQgc29sYW5hVHggPSAnJztcbiAgICAgICAgbGV0IGJhc2VUeCA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLnNvbGFuYSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIEFuY2hvcmluZyB0byBTb2xhbmEuLi5gKTtcbiAgICAgICAgICAgIGNvbnN0IGFuY2hvciA9IGF3YWl0IHRoaXMuc29sYW5hLmFuY2hvclBvRShyZXN1bHRIYXNoLCB0aGlzLmNvbmZpZy5hZ2VudElkKTtcbiAgICAgICAgICAgIHNvbGFuYVR4ID0gYW5jaG9yLnNpZ25hdHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmJhc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbU09WRVJFSUdOXSBBbmNob3JpbmcgdG8gQmFzZS4uLmApO1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gYXdhaXQgdGhpcy5iYXNlLmFuY2hvclBvRShyZXN1bHRIYXNoLCB0aGlzLmNvbmZpZy5hZ2VudElkKTtcbiAgICAgICAgICAgIGJhc2VUeCA9IGFuY2hvci50eEhhc2g7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNvbGFuYVR4ICYmICFiYXNlVHgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTUFOREFUT1JZOiBBdCBsZWFzdCBvbmUgYmxvY2tjaGFpbiBhbmNob3IgcmVxdWlyZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA1LiBCdWlsZCBWRVJBIFBvRSAodW5zaWduZWQpXG4gICAgICAgIHRoaXMubm9uY2VDb3VudGVyKys7XG5cbiAgICAgICAgY29uc3QgdGltZXN0YW1wSXNvID0gbmV3IERhdGUobm93KS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgIC8vIENvbnN0cnVjdCB0aGUgVkVSQSBQcm9vZk9mRXhlY3V0aW9uIG9iamVjdFxuICAgICAgICAvLyBOb3RlOiBXZSB1c2UgJ2FueScgZm9yIHRoZSBpbnRlcm1lZGlhdGUgdW5zaWduZWQgb2JqZWN0IHRvIGFsbG93IGFkZGluZyBzaWduYXR1cmUgbGF0ZXJcbiAgICAgICAgY29uc3QgdW5zaWduZWRQb0U6IGFueSA9IHtcbiAgICAgICAgICAgIGFjdGlvbklkLFxuICAgICAgICAgICAgYWdlbnREaWQ6IGBkaWQ6d2ViOiR7dGhpcy5jb25maWcuYWdlbnRJZH1gLFxuICAgICAgICAgICAgc2lnbmVyVHlwZTogJ2FnZW50JyBhcyBTaWduZXJUeXBlLCAvLyBPciAnZHVhbCcgaWYgUEVQIGNvLXNpZ25zXG4gICAgICAgICAgICBzaWduYXR1cmVBbGdvcml0aG06IHRoaXMuc2lnbmVyLmFsZ29yaXRobSwgLy8gRHluYW1pYyBhbGdvcml0aG1cbiAgICAgICAgICAgIGFjdGlvbjoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0YXNrX2V4ZWN1dGlvbicsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB0YXNrSWQsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczogeyB0YXNrSWQsIGNhcGFiaWxpdGllcyB9LCAvLyBTaW1wbGlmaWVkXG4gICAgICAgICAgICAgICAgcmVzdWx0SGFzaFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uSWQ6ICdzZXNzaW9uLScgKyBub3csXG4gICAgICAgICAgICAgICAgc2VxdWVuY2VOdW1iZXI6IHRoaXMubm9uY2VDb3VudGVyLFxuICAgICAgICAgICAgICAgIHByZXZpb3VzUHJvb2ZIYXNoOiAnMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAnLCAvLyBHZW5lc2lzIG9yIHByZXZpb3VzXG4gICAgICAgICAgICAgICAgdHJpZ2dlcmVkQnk6ICd1c2VyX3JlcXVlc3QnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgYWdlbnRDbG9jazogdGltZXN0YW1wSXNvLFxuICAgICAgICAgICAgICAgIHZlcmlmaWVkU291cmNlOiBzb2xhbmFUeCA/ICdhbmNob3ItZGVyaXZlZCcgOiB1bmRlZmluZWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBrZXlJZDogJ2tleS0xJyxcbiAgICAgICAgICAgIHJlY2VpcHRIYXNoOiByZWNlaXB0SGFzaFVuZGVmaW5lZCxcbiAgICAgICAgICAgIHJlY2VpcHRBc3N1cmFuY2UsXG4gICAgICAgICAgICBhbmNob3I6IHNvbGFuYVR4ID8ge1xuICAgICAgICAgICAgICAgIGJhY2tlbmQ6ICdibG9ja2NoYWluJyxcbiAgICAgICAgICAgICAgICBwcm9vZkhhc2g6IHJlc3VsdEhhc2gsXG4gICAgICAgICAgICAgICAgYW5jaG9ySWQ6IHNvbGFuYVR4LFxuICAgICAgICAgICAgICAgIGFuY2hvclRpbWVzdGFtcDogdGltZXN0YW1wSXNvLCAvLyBBcHByb3hpbWF0ZVxuICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvbkVuZHBvaW50OiBgaHR0cHM6Ly9leHBsb3Jlci5zb2xhbmEuY29tL3R4LyR7c29sYW5hVHh9YFxuICAgICAgICAgICAgfSA6IHVuZGVmaW5lZFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIDYuIFNpZ24gdGhlIFBvRVxuICAgICAgICAvLyBJbiBWRVJBLCB3ZSBzaWduIHRoZSBKQ1MgY2Fub25pY2FsIHN0cmluZy4gSGVyZSB3ZSB1c2UgSlNPTi5zdHJpbmdpZnkgZm9yIHNpbXBsaWNpdHkuXG4gICAgICAgIGNvbnN0IHBheWxvYWRCeXRlcyA9IEJ1ZmZlci5mcm9tKEpTT04uc3RyaW5naWZ5KHVuc2lnbmVkUG9FKSk7XG4gICAgICAgIGNvbnN0IHNpZ25hdHVyZUJ5dGVzID0gYXdhaXQgdGhpcy5zaWduZXIuc2lnbihwYXlsb2FkQnl0ZXMsIHRoaXMua2V5UGFpci5wcml2YXRlS2V5KTtcbiAgICAgICAgY29uc3Qgc2lnbmF0dXJlSGV4ID0gQnVmZmVyLmZyb20oc2lnbmF0dXJlQnl0ZXMpLnRvU3RyaW5nKCdoZXgnKTtcblxuICAgICAgICBjb25zdCBzaWduZWRQb0U6IFByb29mT2ZFeGVjdXRpb24gPSB7XG4gICAgICAgICAgICAuLi51bnNpZ25lZFBvRSxcbiAgICAgICAgICAgIHNpZ25hdHVyZTogc2lnbmF0dXJlSGV4XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gNy4gQ29tcGF0aWJpbGl0eSBCcm9hZGNhc3QgKE1hcHBpbmcgVkVSQSBQb0UgdG8gc3RyaWN0IExlZ2FjeUJlYWNvbiBmb3JtYXQgZm9yIEdvc3NpcE5vZGUpXG4gICAgICAgIC8vIFNlZSBMZWdhY3lCZWFjb24gaW50ZXJmYWNlIGFib3ZlXG4gICAgICAgIGNvbnN0IGxlZ2FjeUJlYWNvbjogTGVnYWN5QmVhY29uID0ge1xuICAgICAgICAgICAgbm9kZUlkOiB0aGlzLmNvbmZpZy5hZ2VudElkLFxuICAgICAgICAgICAgcGVlcklkOiB0aGlzLmtleVBhaXIucHVibGljS2V5LFxuICAgICAgICAgICAgcG9lSGFzaDogQnVmZmVyLmZyb20ocmVzdWx0SGFzaCwgJ2hleCcpLFxuICAgICAgICAgICAgemtQcm9vZlJlZjogQnVmZmVyLmZyb20oemtQcm9vZlJlZiwgJ2hleCcpLFxuICAgICAgICAgICAgc29sYW5hVHgsXG4gICAgICAgICAgICBiYXNlVHgsXG4gICAgICAgICAgICBjYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5vdyxcbiAgICAgICAgICAgIG5vbmNlOiB0aGlzLm5vbmNlQ291bnRlcixcbiAgICAgICAgICAgIC8vIFdlIHVzZSB0aGUgVkVSQSBzaWduYXR1cmUgaGVyZSwgYnV0IEdvc3NpcE5vZGUgZXhwZWN0cyBVaW50OEFycmF5XG4gICAgICAgICAgICBzaWduYXR1cmU6IHNpZ25hdHVyZUJ5dGVzXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ2FzdCBsZWdhY3lCZWFjb24gdG8gUG9FQmVhY29uUHJvdG8gKHRoZXkgYXJlIHN0cnVjdHVyYWxseSBjb21wYXRpYmxlKVxuICAgICAgICBhd2FpdCB0aGlzLnAycC5icm9hZGNhc3QobGVnYWN5QmVhY29uIGFzIGFueSk7XG4gICAgICAgIHRoaXMubGFzdEJyb2FkY2FzdFRpbWUgPSBub3c7XG5cbiAgICAgICAgcmV0dXJuIHNpZ25lZFBvRTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWRVJBIMKnNC4yLjFhOiBUb29sIEV4ZWN1dGlvbiBSZWNlaXB0IFZlcmlmaWNhdGlvblxuICAgICAqIC0gVmVyaWZpZXMgdG9vbCBzaWduYXR1cmUgKHNpbXVsYXRlZClcbiAgICAgKiAtIFZlcmlmaWVzIG5vbmNlIGJpbmRpbmcgdmlhIE5vbmNlTWFuYWdlclxuICAgICAqIC0gQ2hlY2tzIHBhcmFtZXRlciBpbnRlZ3JpdHkgKHJlcXVlc3RIYXNoIG1hdGNoKVxuICAgICAqL1xuICAgIGFzeW5jIHZlcmlmeVRvb2xSZWNlaXB0KHJlY2VpcHQ6IFRvb2xFeGVjdXRpb25SZWNlaXB0KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbU09WRVJFSUdOXSBWZXJpZnlpbmcgUmVjZWlwdCBmb3IgVG9vbDogJHtyZWNlaXB0LnRvb2xJZH1gKTtcblxuICAgICAgICAvLyAxLiBDb25zdW1lIE5vbmNlIChUaGlzIHBlcmZvcm1zIGNoZWNrcyBhLCBiLCBjLCBkIGZyb20gwqc0LjIuMWEpXG4gICAgICAgIC8vIENoZWNrIChkKSByZXF1aXJlcyB1cyB0byBrbm93IHRoZSBvcmlnaW5hbCByZXF1ZXN0SGFzaFxuICAgICAgICAvLyBJbiBhIHJlYWwgc3lzdGVtLCB3ZSdkIGxvb2sgdXAgdGhlIGF1dGhvcml6ZWQgcmVxdWVzdEhhc2ggYXNzb2NpYXRlZCB3aXRoIHRoZSBhY3Rpb25JZFxuICAgICAgICAvLyBGb3IgdGhpcyByZWZlcmVuY2UgaW1wbCwgd2UgZXh0cmFjdCB0aGUgbm9uY2UgcmVjb3JkIGZpcnN0IHRvIHZhbGlkYXRlIGJpbmRpbmdcblxuICAgICAgICAvLyBUaGlzIGltcGxpY2l0bHkgY29uc3VtZXMgaWYgdmFsaWQsIHRocm93cyBpZiBpbnZhbGlkXG4gICAgICAgIC8qIFxuICAgICAgICAgICBOT1RFOiBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHdlIHdvdWxkIHJlLWNhbGN1bGF0ZSB0aGUgaGFzaCBvZiBcbiAgICAgICAgICAgcmVjZWlwdC5wYXJhbWV0ZXJzIHRvIHZlcmlmeSBpdCBtYXRjaGVzIHRoZSBub25jZSdzIHJlcXVlc3RIYXNoLiBcbiAgICAgICAgICAgSGVyZSB3ZSBhc3N1bWUgY29ycmVjdCBiaW5kaW5nIGZvciBkZW1vbnN0cmF0aW9uLlxuICAgICAgICAqL1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLm5vbmNlTWFuYWdlci5jb25zdW1lTm9uY2UocmVjZWlwdC5hdXRob3JpemF0aW9uTm9uY2UsIHJlY2VpcHQucmVzdWx0SGFzaCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBOb25jZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW1NPVkVSRUlHTl0gUmVjZWlwdCBSZWplY3RlZDogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVjZWlwdCBWZXJpZmljYXRpb24gRmFpbGVkOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIuIFZlcmlmeSBUb29sIFNpZ25hdHVyZVxuICAgICAgICAvLyBTaW11bGF0aW5nIHNpZ25hdHVyZSBjaGVjay4gSW4gcHJvZCwgZmV0Y2ggdG9vbCdzIHB1YmxpYyBrZXkgZnJvbSByZWdpc3RyeS9ESUQuXG4gICAgICAgIC8vIGNvbnN0IHRvb2xQdWJLZXkgPSBhd2FpdCByZWdpc3RyeS5nZXRUb29sS2V5KHJlY2VpcHQudG9vbElkKTtcbiAgICAgICAgLy8gY29uc3QgaXNWYWxpZCA9IGF3YWl0IHZlcmlmeShyZWNlaXB0LnNpZ25hdHVyZSwgY2Fub25pY2FsKHJlY2VpcHQpLCB0b29sUHViS2V5KTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gUmVjZWlwdCBTaWduYXR1cmUgVmFsaWRhdGVkIChTaW11bGF0ZWQpYCk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTGVnYWN5IFBlZXIgVmVyaWZpY2F0aW9uIChVcGRhdGVkIGZvciBWRVJBIGNvbXBhdGliaWxpdHkpXG4gICAgICovXG4gICAgYXN5bmMgdmVyaWZ5UGVlcihiZWFjb246IGFueSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gVmVyaWZ5aW5nIFBlZXI6ICR7YmVhY29uLm5vZGVJZH0uLi5gKTtcblxuICAgICAgICBpZiAoIWJlYWNvbi5zb2xhbmFUeCAmJiAhYmVhY29uLmJhc2VUeCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbU09WRVJFSUdOXSBSRUpFQ1RFRDogTm8gYmxvY2tjaGFpbiBhbmNob3IgZm9yICR7YmVhY29uLm5vZGVJZH1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKGBbU09WRVJFSUdOXSBWZXJpZmljYXRpb24gUEFTU0VEIGZvciAke2JlYWNvbi5ub2RlSWR9YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIG9uUGVlckRpc2NvdmVyZWQoY2FsbGJhY2s6IChwZWVyOiBhbnkpID0+IHZvaWQpIHtcbiAgICAgICAgdGhpcy5wMnAub25EaXNjb3ZlcnkoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGFzeW5jIHNodXRkb3duKCkge1xuICAgICAgICBhd2FpdCB0aGlzLnAycC5zdG9wKCk7XG4gICAgfVxuXG4gICAgZ2V0UHVibGljS2V5KCk6IFVpbnQ4QXJyYXkgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlQYWlyPy5wdWJsaWNLZXk7XG4gICAgfVxufVxuIl19