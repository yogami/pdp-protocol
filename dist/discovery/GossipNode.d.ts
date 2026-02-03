export declare const PDP_TOPICS: {
    DISCOVERY: string;
    PROOFS: string;
};
export interface PoEBeacon {
    poeHash: string;
    agentId: string;
    veracity: number;
    capabilities: string[];
    solanaTx?: string;
    zkProof?: string;
    timestamp: number;
}
/**
 * GossipNode - Real libp2p implementation for the PDP P2P network.
 */
export declare class GossipNode {
    private node;
    private peerDiscoveryCallback?;
    start(): Promise<void>;
    broadcast(beacon: PoEBeacon): Promise<void>;
    onDiscovery(callback: (peer: PoEBeacon) => void): void;
    stop(): Promise<void>;
    getPeerId(): any;
}
