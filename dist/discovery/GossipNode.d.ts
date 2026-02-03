import { PoEBeaconProto } from '../proto';
export declare const PDP_TOPICS: {
    DISCOVERY: string;
    PROOFS: string;
};
export type { PoEBeaconProto };
export interface PoEBeacon {
    poeHash: string;
    agentId: string;
    veracity: number;
    capabilities: string[];
    solanaTx?: string;
    baseTx?: string;
    zkProof?: string;
    timestamp: number;
}
/**
 * GossipNode V2 - Hardened libp2p implementation with Protobuf + Ed25519.
 */
export declare class GossipNode {
    private node;
    private peerDiscoveryCallback?;
    private seenNonces;
    private protoInitialized;
    start(): Promise<void>;
    /**
     * Verify the Ed25519 signature over the beacon payload.
     */
    private verifyBeaconSignature;
    broadcast(beacon: PoEBeaconProto): Promise<void>;
    onDiscovery(callback: (peer: PoEBeaconProto) => void): void;
    stop(): Promise<void>;
    getPeerId(): Uint8Array | null;
    getPeerIdString(): string;
}
