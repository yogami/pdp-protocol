/**
 * GossipNode — Graceful degradation stub
 * 
 * libp2p is ESM-only and crashes on Railway's Node 18 CJS environment.
 * This stub provides the same interface but logs a warning and no-ops
 * all P2P operations. The evidence pipeline works entirely via HTTP.
 */

export const PDP_TOPICS = {
    DISCOVERY: 'pdp/discovery/v2',
    PROOFS: 'pdp/proofs/v2'
};

export interface PoEBeaconProto {
    nodeId: string;
    peerId: Uint8Array;
    poeHash: Uint8Array;
    zkProofRef: Uint8Array;
    solanaTx: string;
    baseTx: string;
    capabilities: string[];
    timestamp: number;
    nonce: number;
    signature: Uint8Array;
    veraPayload?: Uint8Array;
}

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

let libp2pAvailable = false;
let realGossipImpl: any = null;

// Attempt dynamic import of libp2p at module load time
try {
    // This will work in ESM environments
    const { createLibp2p } = require('libp2p');
    libp2pAvailable = true;
} catch {
    console.warn('[P2P] libp2p not available (ESM/CJS incompatibility). Running in HTTP-only mode.');
}

export class GossipNode {
    private peerDiscoveryCallback?: (peer: PoEBeaconProto) => void;
    private started = false;

    async start() {
        if (!libp2pAvailable) {
            console.log('[P2P] GossipNode running in stub mode — evidence pipeline uses HTTP.');
            this.started = true;
            return;
        }
        // If libp2p is available, we'd start the real node here
        this.started = true;
    }

    async broadcast(beacon: PoEBeaconProto) {
        if (!libp2pAvailable) {
            // No-op in stub mode — evidence is persisted via HTTP
            return;
        }
    }

    onDiscovery(callback: (peer: PoEBeaconProto) => void) {
        this.peerDiscoveryCallback = callback;
    }

    async stop() {
        this.started = false;
    }

    getPeerId(): Uint8Array | null {
        return null;
    }

    getPeerIdString(): string {
        return 'stub-no-p2p';
    }
}
