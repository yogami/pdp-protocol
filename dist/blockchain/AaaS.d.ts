import { AnchorResult } from './SolanaAdapter';
export interface AuthenticatedRequest {
    poeHash: string;
    agentId: string;
    agentSignature: string;
    agentPublicKey: string;
}
/**
 * Anchor-as-a-Service (AaaS) - Hardened Version
 * - In-Memory Persistence (Protects against replay within session)
 * - Agent Authentication (Prevents spoofing)
 * - HMAC Commitments (Prevents tampering)
 */
export declare class AaaS {
    private solana;
    private agentStateMap;
    constructor();
    private getAgentState;
    private saveAgentState;
    private verifyAuthorization;
    /**
     * managedAnchor - Anchors a hash with managed retries, fee handling, and ORDERING protection.
     */
    managedAnchor(req: AuthenticatedRequest): Promise<AnchorResult>;
    /**
     * verifyManagedAnchor - Verifies a managed anchor.
     */
    verifyManagedAnchor(signature: string, expectedHash: string): Promise<boolean>;
}
