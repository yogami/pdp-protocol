import { SolanaAdapter } from './blockchain/SolanaAdapter';
import { ZKProofGenerator, ZKProofInput } from './zk/ZKProofGenerator';
import { GossipNode, PoEBeacon } from './discovery/GossipNode';
import * as crypto from 'crypto';

export interface SovereignNodeConfig {
    solanaRpcUrl: string;
    solanaPrivateKey: string;
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
    private solana: SolanaAdapter;
    private zk: ZKProofGenerator;
    private p2p: GossipNode;
    private config: SovereignNodeConfig;

    constructor(config: SovereignNodeConfig) {
        this.config = config;
        this.solana = new SolanaAdapter(config.solanaRpcUrl, config.solanaPrivateKey);
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
        const beacon: PoEBeacon = {
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

    onPeerDiscovered(callback: (peer: PoEBeacon) => void) {
        this.p2p.onDiscovery(callback);
    }

    async shutdown() {
        await this.p2p.stop();
    }
}
