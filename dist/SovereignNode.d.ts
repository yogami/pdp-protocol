import { PoEBeacon } from './discovery/GossipNode';
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
export declare class SovereignNode {
    private solana;
    private zk;
    private p2p;
    private config;
    constructor(config: SovereignNodeConfig);
    bootstrap(): Promise<void>;
    /**
     * Primary flow: Anchors and Broadcasts a new Proof of Execution.
     */
    testify(taskId: string, outputData: string, capabilities: string[]): Promise<PoEBeacon>;
    onPeerDiscovered(callback: (peer: PoEBeacon) => void): void;
    shutdown(): Promise<void>;
}
