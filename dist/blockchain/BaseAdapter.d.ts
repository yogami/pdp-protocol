export interface BaseAnchorResult {
    txHash: string;
    network: string;
    commitment: string;
    explorerUrl: string;
}
/**
 * BaseAdapter - Handles anchoring PoE commitments to the Base L2 (EVM).
 */
export declare class BaseAdapter {
    private provider;
    private wallet;
    constructor(rpcUrl: string, privateKey: string);
    anchorPoE(poeHash: string, agentId: string): Promise<BaseAnchorResult>;
    getWalletAddress(): string;
}
