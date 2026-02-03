import { SolanaAdapter } from './blockchain/SolanaAdapter';
import { BaseAdapter } from './blockchain/BaseAdapter';
import { ZKProofGenerator, ZKProofInput } from './zk/ZKProofGenerator';
import { GossipNode, PoEBeacon } from './discovery/GossipNode';
import * as crypto from 'crypto';

export interface SovereignNodeConfig {
    solanaRpcUrl?: string;
    solanaPrivateKey?: string;
    baseRpcUrl?: string;
    basePrivateKey?: string;
    agentId: string;
    veracityScore?: number;
}

/**
 * SovereignNode - The primary entry point for a PDP-compliant agent node.
 * 
 * Logic:
 * 1. Execute task (external)
 * 2. Generate ZK Proof of execution
 * 3. Anchor proof commitment to Solana
 * 4. Broadcast PoE beacon to P2P network
 */
export class SovereignNode {
    private solana?: SolanaAdapter;
    private base?: BaseAdapter;
    private zk: ZKProofGenerator;
    private p2p: GossipNode;
    private config: SovereignNodeConfig;

    constructor(config: SovereignNodeConfig) {
        this.config = config;

        if (config.solanaRpcUrl && config.solanaPrivateKey) {
            this.solana = new SolanaAdapter(config.solanaRpcUrl, config.solanaPrivateKey);
        }

        if (config.baseRpcUrl && config.basePrivateKey) {
            this.base = new BaseAdapter(config.baseRpcUrl, config.basePrivateKey);
        }

        this.zk = new ZKProofGenerator();
        this.p2p = new GossipNode();
    }

    async bootstrap() {
        console.log(`[SOVEREIGN] Bootstrapping PDP Sovereign Node...`);
        await this.p2p.start();
        console.log(`[SOVEREIGN] Node Active. Public Key: ${this.solana.getPublicKey()}`);
    }

    /**
     * Primary flow: Anchors and Broadcasts a new Proof of Execution.
     */
    async testify(taskId: string, outputData: string, capabilities: string[]): Promise<PoEBeacon> {
        console.log(`[SOVEREIGN] Testifying for Task: ${taskId}`);

        // 1. Generate Poe Hash
        const poeHash = crypto.createHash('sha256').update(outputData).digest('hex');

        // 2. Generate ZK Proof
        const zkInput: ZKProofInput = {
            taskId,
            completedAt: new Date().toISOString(),
            slaDeadlineSeconds: 300,
            veracityScore: this.config.veracityScore || 0.7,
            outputHash: poeHash
        };
        const zkBundle = await this.zk.generateProof(zkInput);

        // 3. Anchoring
        let solanaTx: string | undefined;
        let baseTx: string | undefined;

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
        const beacon: PoEBeacon = {
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
    async verifyPeer(beacon: PoEBeacon): Promise<boolean> {
        console.log(`[SOVEREIGN] Verifying Peer: ${beacon.agentId}...`);

        // 1. Check ZK Proof
        if (beacon.zkProof) {
            const isZkValid = await this.zk.verifyProof({
                proof: beacon.zkProof,
                publicSignals: [], // In real impl, extracted from beacon
                verified: true,    // Simulating internal verification
                taskIdHash: '',
                timestamp: Date.now()
            });
            if (!isZkValid) return false;
        }

        // 2. In a real production hub, we'd check Solana/Base scan APIs here
        // For the prototype, we log the intent to "Gate" the transaction.
        console.log(`[SOVEREIGN] Verification Successful for ${beacon.agentId}`);
        return true;
    }

    onPeerDiscovered(callback: (peer: PoEBeacon) => void) {
        this.p2p.onDiscovery(callback);
    }

    async shutdown() {
        await this.p2p.stop();
    }
}
