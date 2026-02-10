/**
 * VERA Types — Verifiable Enforcement for Runtime Agents
 * 
 * Schema definitions aligned with VERA Paper §4.2 (Behavioral Proof).
 * These types implement the canonical PoE, Tool Execution Receipt,
 * Anchor Record, and PDP Decision Token interfaces.
 * 
 * @see VERA Paper — Berlin AI Labs (2026)
 */

// ─── ISO8601 timestamp alias ───
export type ISO8601 = string;

// ─── Signature Algorithm (Crypto Agility per A1') ───
export type SignatureAlgorithm = 'Ed25519' | 'ECDSA-P256' | 'ML-DSA-65';

// ─── Signer Type ───
export type SignerType = 'enforcer' | 'agent' | 'dual';

// ─── Anchor Backend ───
export type AnchorBackend =
    | 'blockchain'
    | 'transparency-log'
    | 'hash-chain-anchored'
    | 'worm'
    | 'rfc3161';

// ─── Receipt Assurance Level (§4.2.1a) ───
export type ReceiptAssurance =
    | 'tool-signed'       // Level 1: Full end-to-end verifiability
    | 'gateway-observed'  // Level 2: Proxy attestation
    | 'log-correlated';   // Level 3: No cryptographic binding

// ─── Trust Tier (§6) ───
export type TrustTier = 'T1' | 'T2' | 'T3' | 'T4';

// ─── Anchor Record (§4.2.2) ───
export interface AnchorRecord {
    /** Anchor backend type */
    backend: AnchorBackend;
    /** SHA-256 of the PoE being anchored */
    proofHash: string;
    /** Backend-specific reference (tx hash, Rekor UUID, etc.) */
    anchorId: string;
    /** Timestamp from the anchor backend */
    anchorTimestamp: ISO8601;
    /** URL to verify the anchor independently */
    verificationEndpoint?: string;
}

// ─── Proof of Execution (§4.2.1) ───
export interface ProofOfExecution {
    /** UUID v7 (time-ordered) */
    actionId: string;
    /** Agent DID:web identifier */
    agentDid: string;
    /** Who signed this PoE */
    signerType: SignerType;
    /** Crypto agility — algorithm used for signature */
    signatureAlgorithm: SignatureAlgorithm;
    /** Action details */
    action: {
        /** Tool invocation, API call, data access */
        type: string;
        /** Resource identifier */
        target: string;
        /** Sanitized parameters (minimized per §4.2.1b) */
        parameters: Record<string, unknown>;
        /** SHA-256 of JCS-canonicalized action result */
        resultHash: string;
    };
    /** Chain context */
    context: {
        sessionId: string;
        /** Monotonic, gap-detectable */
        sequenceNumber: number;
        /** SHA-256 of previous PoE (chain link) */
        previousProofHash: string;
        /** For action chains / delegation */
        parentActionId?: string;
        /** User request, scheduled, agent-initiated */
        triggeredBy: string;
    };
    /** PDP Decision Token (§4.2.1) — decision audit trail */
    decisionProvenance?: {
        /** Correlates to PDP evaluation log */
        pdpDecisionId: string;
        /** SHA-256 of OPA bundle version in effect */
        policyBundleHash: string;
        /** Obligations PEP enforced */
        obligationsApplied: string[];
    };
    /** Timestamps */
    timestamp: {
        agentClock: ISO8601;
        verifiedSource?: 'rfc3161' | 'ntp-attested' | 'anchor-derived';
    };
    /** Ed25519/ECDSA/ML-DSA signature over JCS-canonicalized PoE (excluding this field) */
    signature: string;
    /** Key identifier for verifier key discovery */
    keyId: string;
    /** SHA-256 of ToolExecutionReceipt (if available) */
    receiptHash?: string;
    /** Receipt assurance level (§4.2.1a) */
    receiptAssurance?: ReceiptAssurance;
    /** Pluggable anchor record (§4.2.2) */
    anchor?: AnchorRecord;
}

// ─── Tool Execution Receipt (§4.2.1a) ───
export interface ToolExecutionReceipt {
    /** Matches PoE actionId */
    actionId: string;
    /** Tool's SPIFFE ID or DID */
    toolId: string;
    /** Nonce issued by PEP at authorization time (128-bit min entropy, hex) */
    authorizationNonce: string;
    /** Canonical parameters received (minimized per §4.2.1b) */
    parameters: Record<string, unknown>;
    /** SHA-256 of JCS-canonicalized result */
    resultHash: string;
    /** Execution timestamp */
    timestamp: ISO8601;
    /** Tool's key signature (anchored in org PKI/SPIFFE) */
    signature: string;
}

// ─── Nonce Lifecycle (§4.2.1a normative) ───
export interface NonceRecord {
    /** The nonce value: {actionId}:{random_bytes_hex} */
    nonce: string;
    /** Action ID this nonce was issued for */
    actionId: string;
    /** Tool ID this nonce was issued for */
    toolId: string;
    /** SHA-256 of the authorized request parameters */
    requestHash: string;
    /** When the nonce was issued */
    issuedAt: number;
    /** TTL in milliseconds (default 60000, T4: 30000) */
    ttlMs: number;
    /** Whether this nonce has been consumed */
    consumed: boolean;
    /** When consumed (if applicable) */
    consumedAt?: number;
}

// ─── PDP Decision Token ───
export interface PDPDecisionToken {
    /** Unique decision identifier */
    decisionId: string;
    /** Agent DID requesting the action */
    agentDid: string;
    /** Action being evaluated */
    action: {
        type: string;
        target: string;
        parametersHash: string;
    };
    /** Decision result */
    decision: 'allow' | 'deny' | 'allow-with-obligations';
    /** Obligations PEP must enforce if decision is allow-with-obligations */
    obligations?: string[];
    /** SHA-256 of the OPA policy bundle in effect */
    policyBundleHash: string;
    /** Evaluation timestamp */
    evaluatedAt: ISO8601;
    /** Agent trust tier at evaluation time */
    agentTier: TrustTier;
    /** PDP instance identifier */
    pdpInstanceId: string;
}

// ─── PoE Chain Verification Result ───
export interface PoEChainVerificationResult {
    /** Whether the chain is valid */
    valid: boolean;
    /** Total number of PoE records in the chain */
    chainLength: number;
    /** Number of records with tool-signed receipts */
    attestedCount: number;
    /** Number of unattested records (log-correlated only) */
    unattestedCount: number;
    /** Detected gaps in sequence numbers */
    gaps: number[];
    /** Anchor verification results */
    anchorsVerified: number;
    /** Errors encountered during verification */
    errors: string[];
}

// ─── VERA Agent Identity (§4.1) ───
export type AgentPurpose =
    | 'data_analysis'
    | 'customer_service'
    | 'infrastructure_management'
    | 'security_monitoring'
    | 'content_generation'
    | 'financial_operations';

export interface VeraAgentIdentity {
    /** DID:web identifier */
    did: string;
    /** Ed25519 public key (hex) */
    publicKey: string;
    /** Owner binding */
    owner: {
        did: string;
        /** Owner's Ed25519 signature over agent DID */
        signature: string;
    };
    /** Typed purpose enum */
    purpose: AgentPurpose;
    /** Signed capability manifest */
    capabilities: SignedCapabilityManifest;
    /** Runtime attestation */
    runtimeAttestation?: {
        method: 'spiffe' | 'sgx' | 'container-identity';
        attestationToken: string;
    };
    issuedAt: ISO8601;
    expiresAt: ISO8601;
    revocationEndpoint: string;
}

export interface SignedCapabilityManifest {
    version: string;
    tools: ToolCapability[];
    dataAccess: DataScope[];
    networkAccess: NetworkScope[];
    /** Ed25519 over JCS-canonicalized manifest */
    signature: string;
}

export interface ToolCapability {
    toolId: string;
    name: string;
    description: string;
    /** Parameter fields included in PoE (allow-list per §4.2.1b) */
    poeParameterAllowList: string[];
    /** Assurance level the tool supports */
    receiptSupport: ReceiptAssurance;
}

export interface DataScope {
    resource: string;
    operations: ('read' | 'write' | 'delete')[];
    classification: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface NetworkScope {
    endpoint: string;
    protocol: 'https' | 'grpc' | 'ws';
    direction: 'inbound' | 'outbound' | 'bidirectional';
}
