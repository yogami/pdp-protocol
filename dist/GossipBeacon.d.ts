/**
 * GossipBeacon Module — PoE Discovery Protocol (PDP) Phase 1
 *
 * Implements P2P broadcast of PoE hashes for peer discovery.
 * Currently in simulation mode; live libp2p integration planned for Phase 2.
 *
 * @see PoE Skill: /gitprojects/.agent/skills/proof_of_execution/SKILL.md
 */
/**
 * Beacon payload structure for PoE broadcast
 */
export interface PoEBeacon {
    nodeId: string;
    poeHash: string;
    veracityScore: number;
    capabilities: string[];
    capabilityVector?: string;
    taskCategory: string;
    timestamp: string;
    metadata?: {
        tier: 1 | 2 | 3;
        success: boolean;
        duration_s?: number;
    };
}
/**
 * Topic channels for PoE discovery
 */
export declare const PDP_TOPICS: {
    readonly DISCOVERY: "pdp/discovery/v1";
    readonly HIGH_STAKES: "pdp/high-stakes/v1";
    readonly SEMANTICS: "pdp/semantics/v1";
};
/**
 * GossipBeacon — P2P PoE broadcasting
 *
 * Note: Full libp2p integration requires ESM module resolution.
 * This implementation provides the interface for simulation mode,
 * with live P2P to be enabled when module system is configured.
 */
export declare class GossipBeacon {
    private nodeId;
    private veracityScore;
    private isRunning;
    private subscribers;
    constructor(nodeId?: string);
    /**
     * Start the beacon (simulation mode for now)
     */
    start(): Promise<void>;
    /**
     * Beacon a PoE hash to the network
     */
    beacon(poeHash: string, capabilities: string[], metadata?: PoEBeacon['metadata']): Promise<PoEBeacon>;
    /**
     * Subscribe to incoming beacons (simulation mode)
     */
    onBeacon(callback: (beacon: PoEBeacon) => void): void;
    /**
     * Simulate receiving a beacon from a peer
     */
    simulateIncomingBeacon(beacon: PoEBeacon): void;
    /**
     * Update veracity score (called after Moltbook sync)
     */
    updateVeracity(delta: number): void;
    /**
     * Get current veracity score
     */
    getVeracity(): number;
    /**
     * Stop the beacon
     */
    stop(): Promise<void>;
}
