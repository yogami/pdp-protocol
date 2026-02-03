import { PoEBeaconProto } from './discovery/GossipNode';
export interface SovereignNodeConfig {
    solanaRpcUrl?: string;
    solanaPrivateKey?: string;
    baseRpcUrl?: string;
    basePrivateKey?: string;
    agentId: string;
    beaconRateLimitMs?: number;
}
/**
 * SovereignNode V2 - Hardened PDP agent node with cryptographic identity.
 *
 * Improvements over V1:
 * - Ed25519 keypair for beacon signing
 * - Nonce-based replay protection
 * - Mandatory on-chain anchor validation
 * - Rate limiting for spam resistance
 */
export declare class SovereignNode {
    private solana?;
    private base?;
    private zk;
    private p2p;
    private config;
    private keyPair?;
    private nonce;
    private lastBroadcastTime;
    constructor(config: SovereignNodeConfig);
    bootstrap(): Promise<void>;
    /**
     * Primary flow: Anchors and Broadcasts a new Proof of Execution.
     */
    testify(taskId: string, outputData: string, capabilities: string[]): Promise<PoEBeaconProto>;
    /**
     * MANDATORY Peer Verification: Verify an external peer's proof before proceeding.
     * Returns false if:
     * - No blockchain anchor exists
     * - ZK proof reference is missing
     */
    verifyPeer(beacon: PoEBeaconProto): Promise<boolean>;
    onPeerDiscovered(callback: (peer: PoEBeaconProto) => void): void;
    shutdown(): Promise<void>;
    getPublicKey(): Uint8Array | undefined;
}
