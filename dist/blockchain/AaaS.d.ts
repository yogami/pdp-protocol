import { AnchorResult } from './SolanaAdapter';
/**
 * Anchor-as-a-Service (AaaS)
 * Provides a managed interface for anchoring PoE claims to the blockchain.
 */
export declare class AaaS {
    private solana;
    constructor();
    /**
     * managedAnchor - Anchors a hash with managed retries and fee handling.
     */
    managedAnchor(poeHash: string, agentId: string): Promise<AnchorResult>;
    /**
     * verifyManagedAnchor - Verifies a managed anchor.
     */
    verifyManagedAnchor(signature: string, expectedHash: string): Promise<boolean>;
}
