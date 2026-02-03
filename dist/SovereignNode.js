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
        this.solana = new SolanaAdapter_1.SolanaAdapter(config.solanaRpcUrl, config.solanaPrivateKey);
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
            slaDeadlineSeconds: 300, // 5 minutes
            veracityScore: this.config.veracityScore || 0.7,
            outputHash: poeHash
        };
        const zkBundle = await this.zk.generateProof(zkInput);
        // 3. Anchor to Solana
        console.log(`[SOVEREIGN] Anchoring to Solana...`);
        const anchor = await this.solana.anchorPoE(poeHash, this.config.agentId);
        console.log(`[SOVEREIGN] Anchored at: ${anchor.signature}`);
        // 4. Build and Broadcast Beacon
        const beacon = {
            poeHash,
            agentId: this.config.agentId,
            veracity: this.config.veracityScore || 0.7,
            capabilities,
            solanaTx: anchor.signature,
            zkProof: zkBundle.proof,
            timestamp: Date.now()
        };
        await this.p2p.broadcast(beacon);
        return beacon;
    }
    onPeerDiscovered(callback) {
        this.p2p.onDiscovery(callback);
    }
    async shutdown() {
        await this.p2p.stop();
    }
}
exports.SovereignNode = SovereignNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU292ZXJlaWduTm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Tb3ZlcmVpZ25Ob2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhEQUEyRDtBQUMzRCw0REFBdUU7QUFDdkUsdURBQStEO0FBQy9ELCtDQUFpQztBQVNqQzs7Ozs7Ozs7R0FRRztBQUNILE1BQWEsYUFBYTtJQU10QixZQUFZLE1BQTJCO1FBQ25DLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSw2QkFBYSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLG1DQUFnQixFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVM7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7UUFDL0QsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBYyxFQUFFLFVBQWtCLEVBQUUsWUFBc0I7UUFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUUxRCx1QkFBdUI7UUFDdkIsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTdFLHVCQUF1QjtRQUN2QixNQUFNLE9BQU8sR0FBaUI7WUFDMUIsTUFBTTtZQUNOLFdBQVcsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtZQUNyQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsWUFBWTtZQUNyQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLElBQUksR0FBRztZQUMvQyxVQUFVLEVBQUUsT0FBTztTQUN0QixDQUFDO1FBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0RCxzQkFBc0I7UUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFFNUQsZ0NBQWdDO1FBQ2hDLE1BQU0sTUFBTSxHQUFjO1lBQ3RCLE9BQU87WUFDUCxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPO1lBQzVCLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsSUFBSSxHQUFHO1lBQzFDLFlBQVk7WUFDWixRQUFRLEVBQUUsTUFBTSxDQUFDLFNBQVM7WUFDMUIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1lBQ3ZCLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1NBQ3hCLENBQUM7UUFFRixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWpDLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxRQUFtQztRQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVE7UUFDVixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBbEVELHNDQWtFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNvbGFuYUFkYXB0ZXIgfSBmcm9tICcuL2Jsb2NrY2hhaW4vU29sYW5hQWRhcHRlcic7XG5pbXBvcnQgeyBaS1Byb29mR2VuZXJhdG9yLCBaS1Byb29mSW5wdXQgfSBmcm9tICcuL3prL1pLUHJvb2ZHZW5lcmF0b3InO1xuaW1wb3J0IHsgR29zc2lwTm9kZSwgUG9FQmVhY29uIH0gZnJvbSAnLi9kaXNjb3ZlcnkvR29zc2lwTm9kZSc7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcblxuZXhwb3J0IGludGVyZmFjZSBTb3ZlcmVpZ25Ob2RlQ29uZmlnIHtcbiAgICBzb2xhbmFScGNVcmw6IHN0cmluZztcbiAgICBzb2xhbmFQcml2YXRlS2V5OiBzdHJpbmc7XG4gICAgYWdlbnRJZDogc3RyaW5nO1xuICAgIHZlcmFjaXR5U2NvcmU/OiBudW1iZXI7XG59XG5cbi8qKlxuICogU292ZXJlaWduTm9kZSAtIFRoZSBwcmltYXJ5IGVudHJ5IHBvaW50IGZvciBhIFBEUC1jb21wbGlhbnQgYWdlbnQgbm9kZS5cbiAqIFxuICogTG9naWM6XG4gKiAxLiBFeGVjdXRlIHRhc2sgKGV4dGVybmFsKVxuICogMi4gR2VuZXJhdGUgWksgUHJvb2Ygb2YgZXhlY3V0aW9uXG4gKiAzLiBBbmNob3IgcHJvb2YgY29tbWl0bWVudCB0byBTb2xhbmFcbiAqIDQuIEJyb2FkY2FzdCBQb0UgYmVhY29uIHRvIFAyUCBuZXR3b3JrXG4gKi9cbmV4cG9ydCBjbGFzcyBTb3ZlcmVpZ25Ob2RlIHtcbiAgICBwcml2YXRlIHNvbGFuYTogU29sYW5hQWRhcHRlcjtcbiAgICBwcml2YXRlIHprOiBaS1Byb29mR2VuZXJhdG9yO1xuICAgIHByaXZhdGUgcDJwOiBHb3NzaXBOb2RlO1xuICAgIHByaXZhdGUgY29uZmlnOiBTb3ZlcmVpZ25Ob2RlQ29uZmlnO1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBTb3ZlcmVpZ25Ob2RlQ29uZmlnKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLnNvbGFuYSA9IG5ldyBTb2xhbmFBZGFwdGVyKGNvbmZpZy5zb2xhbmFScGNVcmwsIGNvbmZpZy5zb2xhbmFQcml2YXRlS2V5KTtcbiAgICAgICAgdGhpcy56ayA9IG5ldyBaS1Byb29mR2VuZXJhdG9yKCk7XG4gICAgICAgIHRoaXMucDJwID0gbmV3IEdvc3NpcE5vZGUoKTtcbiAgICB9XG5cbiAgICBhc3luYyBib290c3RyYXAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbU09WRVJFSUdOXSBCb290c3RyYXBwaW5nIFBEUCBTb3ZlcmVpZ24gTm9kZS4uLmApO1xuICAgICAgICBhd2FpdCB0aGlzLnAycC5zdGFydCgpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gTm9kZSBBY3RpdmUuIFB1YmxpYyBLZXk6ICR7dGhpcy5zb2xhbmEuZ2V0UHVibGljS2V5KCl9YCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJpbWFyeSBmbG93OiBBbmNob3JzIGFuZCBCcm9hZGNhc3RzIGEgbmV3IFByb29mIG9mIEV4ZWN1dGlvbi5cbiAgICAgKi9cbiAgICBhc3luYyB0ZXN0aWZ5KHRhc2tJZDogc3RyaW5nLCBvdXRwdXREYXRhOiBzdHJpbmcsIGNhcGFiaWxpdGllczogc3RyaW5nW10pOiBQcm9taXNlPFBvRUJlYWNvbj4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gVGVzdGlmeWluZyBmb3IgVGFzazogJHt0YXNrSWR9YCk7XG5cbiAgICAgICAgLy8gMS4gR2VuZXJhdGUgUG9lIEhhc2hcbiAgICAgICAgY29uc3QgcG9lSGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUob3V0cHV0RGF0YSkuZGlnZXN0KCdoZXgnKTtcblxuICAgICAgICAvLyAyLiBHZW5lcmF0ZSBaSyBQcm9vZlxuICAgICAgICBjb25zdCB6a0lucHV0OiBaS1Byb29mSW5wdXQgPSB7XG4gICAgICAgICAgICB0YXNrSWQsXG4gICAgICAgICAgICBjb21wbGV0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgc2xhRGVhZGxpbmVTZWNvbmRzOiAzMDAsIC8vIDUgbWludXRlc1xuICAgICAgICAgICAgdmVyYWNpdHlTY29yZTogdGhpcy5jb25maWcudmVyYWNpdHlTY29yZSB8fCAwLjcsXG4gICAgICAgICAgICBvdXRwdXRIYXNoOiBwb2VIYXNoXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHprQnVuZGxlID0gYXdhaXQgdGhpcy56ay5nZW5lcmF0ZVByb29mKHprSW5wdXQpO1xuXG4gICAgICAgIC8vIDMuIEFuY2hvciB0byBTb2xhbmFcbiAgICAgICAgY29uc29sZS5sb2coYFtTT1ZFUkVJR05dIEFuY2hvcmluZyB0byBTb2xhbmEuLi5gKTtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYXdhaXQgdGhpcy5zb2xhbmEuYW5jaG9yUG9FKHBvZUhhc2gsIHRoaXMuY29uZmlnLmFnZW50SWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW1NPVkVSRUlHTl0gQW5jaG9yZWQgYXQ6ICR7YW5jaG9yLnNpZ25hdHVyZX1gKTtcblxuICAgICAgICAvLyA0LiBCdWlsZCBhbmQgQnJvYWRjYXN0IEJlYWNvblxuICAgICAgICBjb25zdCBiZWFjb246IFBvRUJlYWNvbiA9IHtcbiAgICAgICAgICAgIHBvZUhhc2gsXG4gICAgICAgICAgICBhZ2VudElkOiB0aGlzLmNvbmZpZy5hZ2VudElkLFxuICAgICAgICAgICAgdmVyYWNpdHk6IHRoaXMuY29uZmlnLnZlcmFjaXR5U2NvcmUgfHwgMC43LFxuICAgICAgICAgICAgY2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgc29sYW5hVHg6IGFuY2hvci5zaWduYXR1cmUsXG4gICAgICAgICAgICB6a1Byb29mOiB6a0J1bmRsZS5wcm9vZixcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICB9O1xuXG4gICAgICAgIGF3YWl0IHRoaXMucDJwLmJyb2FkY2FzdChiZWFjb24pO1xuXG4gICAgICAgIHJldHVybiBiZWFjb247XG4gICAgfVxuXG4gICAgb25QZWVyRGlzY292ZXJlZChjYWxsYmFjazogKHBlZXI6IFBvRUJlYWNvbikgPT4gdm9pZCkge1xuICAgICAgICB0aGlzLnAycC5vbkRpc2NvdmVyeShjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgYXN5bmMgc2h1dGRvd24oKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucDJwLnN0b3AoKTtcbiAgICB9XG59XG4iXX0=