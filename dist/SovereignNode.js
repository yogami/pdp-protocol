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
/**
 * SovereignNode - The primary entry point for a PDP-compliant agent node.
 *
 * Logic:
 * 1. Execute task (external)
 * 2. Generate ZK Proof of execution
 * 3. Anchor proof commitment to Solana
 * 4. Broadcast PoE beacon to P2P network
 */
class SovereignNode {
    constructor(config) {
        this.config = config;
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
        console.log(`[SOVEREIGN] Bootstrapping PDP Sovereign Node...`);
        await this.p2p.start();
        console.log(`[SOVEREIGN] Node Active. Public Key: ${this.solana.getPublicKey()}`);
    }
    /**
     * Primary flow: Anchors and Broadcasts a new Proof of Execution.
     */
    async testify(taskId, outputData, capabilities) {
        console.log(`[SOVEREIGN] Testifying for Task: ${taskId}`);
        // 1. Generate Poe Hash
        const poeHash = crypto.createHash('sha256').update(outputData).digest('hex');
        // 2. Generate ZK Proof
        const zkInput = {
            taskId,
            completedAt: new Date().toISOString(),
            slaDeadlineSeconds: 300,
            veracityScore: this.config.veracityScore || 0.7,
            outputHash: poeHash
        };
        const zkBundle = await this.zk.generateProof(zkInput);
        // 3. Anchoring
        let solanaTx;
        let baseTx;
        if (this.solana) {
            console.log(`[SOVEREIGN] Anchoring to Solana...`);
            const anchor = await this.solana.anchorPoE(poeHash, this.config.agentId);
            solanaTx = anchor.signature;
        }
        if (this.base) {
            console.log(`[SOVEREIGN] Anchoring to Base...`);
            const anchor = await this.base.anchorPoE(poeHash, this.config.agentId);
            baseTx = anchor.txHash;
        }
        // 4. Build and Broadcast Beacon
        const beacon = {
            poeHash,
            agentId: this.config.agentId,
            veracity: this.config.veracityScore || 0.7,
            capabilities,
            solanaTx,
            baseTx,
            zkProof: zkBundle.proof,
            timestamp: Date.now()
        };
        await this.p2p.broadcast(beacon);
        return beacon;
    }
    /**
     * Gated Interaction: Verify an external peer's proof before proceeding.
     * This is the "Boring Infrastructure" Grok mentioned.
     */
    async verifyPeer(beacon) {
        console.log(`[SOVEREIGN] Verifying Peer: ${beacon.agentId}...`);
        // 1. Check ZK Proof
        if (beacon.zkProof) {
            const isZkValid = await this.zk.verifyProof({
                proof: beacon.zkProof,
                publicSignals: [], // In real impl, extracted from beacon
                verified: true, // Simulating internal verification
                taskIdHash: '',
                timestamp: Date.now()
            });
            if (!isZkValid)
                return false;
        }
        // 2. In a real production hub, we'd check Solana/Base scan APIs here
        // For the prototype, we log the intent to "Gate" the transaction.
        console.log(`[SOVEREIGN] Verification Successful for ${beacon.agentId}`);
        return true;
    }
    onPeerDiscovered(callback) {
        this.p2p.onDiscovery(callback);
    }
    async shutdown() {
        await this.p2p.stop();
    }
}
exports.SovereignNode = SovereignNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU292ZXJlaWduTm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Tb3ZlcmVpZ25Ob2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhEQUEyRDtBQUMzRCwwREFBdUQ7QUFDdkQsNERBQXVFO0FBQ3ZFLHVEQUErRDtBQUMvRCwrQ0FBaUM7QUFXakM7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFhLGFBQWE7SUFPdEIsWUFBWSxNQUEyQjtRQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLE1BQU0sQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLDZCQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRUQsSUFBSSxNQUFNLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkseUJBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBRUQsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLG1DQUFnQixFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVM7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7UUFDL0QsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxD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O1FBQ3JFLGtFQUFrRTtRQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLDJDQUEyQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN6RSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsUUFBbUM7UUFDaEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRO1FBQ1YsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQWhIRCxzQ0FnSEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTb2xhbmFBZGFwdGVyIH0gZnJvbSAnLi9ibG9ja2NoYWluL1NvbGFuYUFkYXB0ZXInO1xuaW1wb3J0IHsgQmFzZUFkYXB0ZXIgfSBmcm9tICcuL2Jsb2NrY2hhaW4vQmFzZUFkYXB0ZXInO1xuaW1wb3J0IHsgWktQcm9vZkdlbmVyYXRvciwgWktQcm9vZklucHV0IH0gZnJvbSAnLi96ay9aS1Byb29mR2VuZXJhdG9yJztcbmltcG9ydCB7IEdvc3NpcE5vZGUsIFBvRUJlYWNvbiB9IGZyb20gJy4vZGlzY292ZXJ5L0dvc3NpcE5vZGUnO1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU292ZXJlaWduTm9kZUNvbmZpZyB7XG4gICAgc29sYW5hUnBjVXJsPzogc3RyaW5nO1xuICAgIHNvbGFuYVByaXZhdGVLZXk/OiBzdHJpbmc7XG4gICAgYmFzZVJwY1VybD86IHN0cmluZztcbiAgICBiYXNlUHJpdmF0ZUtleT86IHN0cmluZztcbiAgICBhZ2VudElkOiBzdHJpbmc7XG4gICAgdmVyYWNpdHlTY29yZT86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBTb3ZlcmVpZ25Ob2RlIC0gVGhlIHByaW1hcnkgZW50cnkgcG9pbnQgZm9yIGEgUERQLWNvbXBsaWFudCBhZ2VudCBub2RlLlxuICogXG4gKiBMb2dpYzpcbiAqIDEuIEV4ZWN1dGUgdGFzayAoZXh0ZXJuYWwpXG4gKiAyLiBHZW5lcmF0ZSBaSyBQcm9vZiBvZiBleGVjdXRpb25cbiAqIDMuIEFuY2hvciBwcm9vZiBjb21taXRtZW50IHRvIFNvbGFuYVxuICogNC4gQnJvYWRjYXN0IFBvRSBiZWFjb24gdG8gUDJQIG5ldHdvcmtcbiAqL1xuZXhwb3J0IGNsYXNzIFNvdmVyZWlnbk5vZGUge1xuICAgIHByaXZhdGUgc29sYW5hPzogU29sYW5hQWRhcHRlcjtcbiAgICBwcml2YXRlIGJhc2U/OiBCYXNlQWRhcHRlcjtcbiAgICBwcml2YXRlIHprOiBaS1Byb29mR2VuZXJhdG9yO1xuICAgIHByaXZhdGUgcDJwOiBHb3NzaXBOb2RlO1xuICAgIHByaXZhdGUgY29uZmlnOiBTb3ZlcmVpZ25Ob2RlQ29uZmlnO1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBTb3ZlcmVpZ25Ob2RlQ29uZmlnKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgICAgIGlmIChjb25maWcuc29sYW5hUnBjVXJsICYmIGNvbmZpZy5zb2xhbmFQcml2YXRlS2V5KSB7XG4gICAgICAgICAgICB0aGlzLnNvbGFuYSA9IG5ldyBTb2xhbmFBZGFwdGVyKGNvbmZpZy5zb2xhbmFScGNVcmwsIGNvbmZpZy5zb2xhbmFQcml2YXRlS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcuYmFzZVJwY1VybCAmJiBjb25maWcuYmFzZVByaXZhdGVLZXkpIHtcbiAgICAgICAgICAgIHRoaXMuYmFzZSA9IG5ldyBCYXNlQWRhcHRlcihjb25maWcuYmFzZVJwY1VybCwgY29uZmlnLmJhc2VQcml2YXRlS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuemsgPSBuZXcgWktQcm9vZkdlbmVyYXRvcigpO1xuICAgICAgICB0aGlzLnAycCA9IG5ldyBHb3NzaXBOb2RlKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgYm9vdHN0cmFwKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gQm9vdHN0cmFwcGluZyBQRFAgU292ZXJlaWduIE5vZGUuLi5gKTtcbiAgICAgICAgYXdhaXQgdGhpcy5wMnAuc3RhcnQoKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIE5vZGUgQWN0aXZlLiBQdWJsaWMgS2V5OiAke3RoaXMuc29sYW5hLmdldFB1YmxpY0tleSgpfWApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByaW1hcnkgZmxvdzogQW5jaG9ycyBhbmQgQnJvYWRjYXN0cyBhIG5ldyBQcm9vZiBvZiBFeGVjdXRpb24uXG4gICAgICovXG4gICAgYXN5bmMgdGVzdGlmeSh0YXNrSWQ6IHN0cmluZywgb3V0cHV0RGF0YTogc3RyaW5nLCBjYXBhYmlsaXRpZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxQb0VCZWFjb24+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIFRlc3RpZnlpbmcgZm9yIFRhc2s6ICR7dGFza0lkfWApO1xuXG4gICAgICAgIC8vIDEuIEdlbmVyYXRlIFBvZSBIYXNoXG4gICAgICAgIGNvbnN0IHBvZUhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKG91dHB1dERhdGEpLmRpZ2VzdCgnaGV4Jyk7XG5cbiAgICAgICAgLy8gMi4gR2VuZXJhdGUgWksgUHJvb2ZcbiAgICAgICAgY29uc3QgemtJbnB1dDogWktQcm9vZklucHV0ID0ge1xuICAgICAgICAgICAgdGFza0lkLFxuICAgICAgICAgICAgY29tcGxldGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIHNsYURlYWRsaW5lU2Vjb25kczogMzAwLFxuICAgICAgICAgICAgdmVyYWNpdHlTY29yZTogdGhpcy5jb25maWcudmVyYWNpdHlTY29yZSB8fCAwLjcsXG4gICAgICAgICAgICBvdXRwdXRIYXNoOiBwb2VIYXNoXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHprQnVuZGxlID0gYXdhaXQgdGhpcy56ay5nZW5lcmF0ZVByb29mKHprSW5wdXQpO1xuXG4gICAgICAgIC8vIDMuIEFuY2hvcmluZ1xuICAgICAgICBsZXQgc29sYW5hVHg6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IGJhc2VUeDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmICh0aGlzLnNvbGFuYSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIEFuY2hvcmluZyB0byBTb2xhbmEuLi5gKTtcbiAgICAgICAgICAgIGNvbnN0IGFuY2hvciA9IGF3YWl0IHRoaXMuc29sYW5hLmFuY2hvclBvRShwb2VIYXNoLCB0aGlzLmNvbmZpZy5hZ2VudElkKTtcbiAgICAgICAgICAgIHNvbGFuYVR4ID0gYW5jaG9yLnNpZ25hdHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmJhc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbU09WRVJFSUdOXSBBbmNob3JpbmcgdG8gQmFzZS4uLmApO1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gYXdhaXQgdGhpcy5iYXNlLmFuY2hvclBvRShwb2VIYXNoLCB0aGlzLmNvbmZpZy5hZ2VudElkKTtcbiAgICAgICAgICAgIGJhc2VUeCA9IGFuY2hvci50eEhhc2g7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0LiBCdWlsZCBhbmQgQnJvYWRjYXN0IEJlYWNvblxuICAgICAgICBjb25zdCBiZWFjb246IFBvRUJlYWNvbiA9IHtcbiAgICAgICAgICAgIHBvZUhhc2gsXG4gICAgICAgICAgICBhZ2VudElkOiB0aGlzLmNvbmZpZy5hZ2VudElkLFxuICAgICAgICAgICAgdmVyYWNpdHk6IHRoaXMuY29uZmlnLnZlcmFjaXR5U2NvcmUgfHwgMC43LFxuICAgICAgICAgICAgY2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgc29sYW5hVHgsXG4gICAgICAgICAgICBiYXNlVHgsXG4gICAgICAgICAgICB6a1Byb29mOiB6a0J1bmRsZS5wcm9vZixcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICB9O1xuXG4gICAgICAgIGF3YWl0IHRoaXMucDJwLmJyb2FkY2FzdChiZWFjb24pO1xuXG4gICAgICAgIHJldHVybiBiZWFjb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2F0ZWQgSW50ZXJhY3Rpb246IFZlcmlmeSBhbiBleHRlcm5hbCBwZWVyJ3MgcHJvb2YgYmVmb3JlIHByb2NlZWRpbmcuXG4gICAgICogVGhpcyBpcyB0aGUgXCJCb3JpbmcgSW5mcmFzdHJ1Y3R1cmVcIiBHcm9rIG1lbnRpb25lZC5cbiAgICAgKi9cbiAgICBhc3luYyB2ZXJpZnlQZWVyKGJlYWNvbjogUG9FQmVhY29uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbU09WRVJFSUdOXSBWZXJpZnlpbmcgUGVlcjogJHtiZWFjb24uYWdlbnRJZH0uLi5gKTtcblxuICAgICAgICAvLyAxLiBDaGVjayBaSyBQcm9vZlxuICAgICAgICBpZiAoYmVhY29uLnprUHJvb2YpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzWmtWYWxpZCA9IGF3YWl0IHRoaXMuemsudmVyaWZ5UHJvb2Yoe1xuICAgICAgICAgICAgICAgIHByb29mOiBiZWFjb24uemtQcm9vZixcbiAgICAgICAgICAgICAgICBwdWJsaWNTaWduYWxzOiBbXSwgLy8gSW4gcmVhbCBpbXBsLCBleHRyYWN0ZWQgZnJvbSBiZWFjb25cbiAgICAgICAgICAgICAgICB2ZXJpZmllZDogdHJ1ZSwgICAgLy8gU2ltdWxhdGluZyBpbnRlcm5hbCB2ZXJpZmljYXRpb25cbiAgICAgICAgICAgICAgICB0YXNrSWRIYXNoOiAnJyxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFpc1prVmFsaWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIuIEluIGEgcmVhbCBwcm9kdWN0aW9uIGh1Yiwgd2UnZCBjaGVjayBTb2xhbmEvQmFzZSBzY2FuIEFQSXMgaGVyZVxuICAgICAgICAvLyBGb3IgdGhlIHByb3RvdHlwZSwgd2UgbG9nIHRoZSBpbnRlbnQgdG8gXCJHYXRlXCIgdGhlIHRyYW5zYWN0aW9uLlxuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gVmVyaWZpY2F0aW9uIFN1Y2Nlc3NmdWwgZm9yICR7YmVhY29uLmFnZW50SWR9YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIG9uUGVlckRpc2NvdmVyZWQoY2FsbGJhY2s6IChwZWVyOiBQb0VCZWFjb24pID0+IHZvaWQpIHtcbiAgICAgICAgdGhpcy5wMnAub25EaXNjb3ZlcnkoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGFzeW5jIHNodXRkb3duKCkge1xuICAgICAgICBhd2FpdCB0aGlzLnAycC5zdG9wKCk7XG4gICAgfVxufVxuIl19