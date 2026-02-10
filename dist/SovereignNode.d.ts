import { ProofOfExecution, ToolExecutionReceipt, TrustTier } from './vera/types';
import { SignatureAlgorithm } from './crypto/SignatureProvider';
export interface SovereignNodeConfig {
    solanaRpcUrl?: string;
    solanaPrivateKey?: string;
    baseRpcUrl?: string;
    basePrivateKey?: string;
    agentId: string;
    beaconRateLimitMs?: number;
    trustTier?: TrustTier;
    signatureAlgorithm?: SignatureAlgorithm;
}
/**
 * SovereignNode V2 (VERA Hardened)
 * - Implements VERA Paper §4.2 (Behavioral Proof)
 * - Implements §4.2.1a (Tool Execution Receipts)
 * - Manages Nonce Lifecycle via NonceManager
 * - Enforces Ed25519 signing and Anchor validation
 */
export declare class SovereignNode {
    private solana?;
    private base?;
    private zk;
    private p2p;
    private config;
    private keyPair?;
    private nonceCounter;
    private lastBroadcastTime;
    private nonceManager;
    private signer;
    constructor(config: SovereignNodeConfig);
    bootstrap(): Promise<void>;
    /**
     * Issue an authorization nonce for a tool execution.
     * Implements §4.2.1a: PEP issues nonce bound to decision.
     */
    issueAuthorizationNonce(actionId: string, toolId: string, requestHash: string): string;
    /**
     * Primary flow: Anchors and Broadcasts a new VERA Proof of Execution.
     */
    testify(actionId: string, taskId: string, outputData: string, capabilities: string[], receipt?: ToolExecutionReceipt): Promise<ProofOfExecution>;
    /**
     * VERA §4.2.1a: Tool Execution Receipt Verification
     * - Verifies tool signature (simulated)
     * - Verifies nonce binding via NonceManager
     * - Checks parameter integrity (requestHash match)
     */
    verifyToolReceipt(receipt: ToolExecutionReceipt): Promise<boolean>;
    /**
     * Legacy Peer Verification (Updated for VERA compatibility)
     */
    verifyPeer(beacon: any): Promise<boolean>;
    onPeerDiscovered(callback: (peer: any) => void): void;
    shutdown(): Promise<void>;
    getPublicKey(): Uint8Array | undefined;
}
