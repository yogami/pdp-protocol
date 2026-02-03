export interface AnchorResult {
    signature: string;
    network: string;
    commitment: string;
    explorerUrl: string;
}
/**
 * SolanaAdapter - Handles anchoring PoE commitments to the Solana blockchain.
 */
export declare class SolanaAdapter {
    private connection;
    private keypair;
    private readonly MEMO_PROGRAM_ID;
    constructor(rpcUrl: string, privateKeyBase58: string);
    /**
     * Anchors a PoE commitment to Solana via the Memo Program.
     * Uses the Salted Hash Commitment pattern from the OpenClaw architecture.
     */
    anchorPoE(poeHash: string, agentId: string): Promise<AnchorResult>;
    /**
     * Verifies that a given signature exists on-chain and contains expected data.
     */
    verifyAnchor(signature: string, expectedHash: string): Promise<{
        valid: boolean;
        data?: string;
    }>;
    getPublicKey(): string;
}
