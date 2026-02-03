import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@libp2p/noise';
import { mplex } from '@libp2p/mplex';
import { gossipsub } from '@libp2p/gossipsub';
import { initProto, encodeBeacon, decodeBeacon, PoEBeaconProto } from '../proto';
import { verify } from '../crypto/signing';

export const PDP_TOPICS = {
    DISCOVERY: 'pdp/discovery/v2', // V2 uses Protobuf
    PROOFS: 'pdp/proofs/v2'
};

// Re-export the Protobuf beacon type for external use
export type { PoEBeaconProto };

// Legacy interface for backwards compatibility
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
export class GossipNode {
    private node: any;
    private peerDiscoveryCallback?: (peer: PoEBeaconProto) => void;
    private seenNonces: Map<string, number> = new Map(); // peerId -> lastNonce
    private protoInitialized = false;

    async start() {
        // Initialize Protobuf schema
        if (!this.protoInitialized) {
            await initProto();
            this.protoInitialized = true;
        }

        this.node = await createLibp2p({
            transports: [webSockets()],
            connectionEncrypters: [noise()],
            streamMuxers: [mplex()],
            services: {
                pubsub: gossipsub({
                    allowPublishToZeroTopicPeers: true,
                    emitSelf: false
                })
            }
        });

        await this.node.start();
        console.log(`[P2P] PDP Node V2 started with ID: ${this.node.peerId.toString()}`);

        this.node.services.pubsub.subscribe(PDP_TOPICS.DISCOVERY);

        this.node.services.pubsub.addEventListener('message', async (evt: any) => {
            if (evt.detail.topic === PDP_TOPICS.DISCOVERY) {
                try {
                    const beacon = decodeBeacon(evt.detail.data);

                    // SECURITY: Verify signature
                    const isValidSig = await this.verifyBeaconSignature(beacon);
                    if (!isValidSig) {
                        console.warn(`[P2P] Invalid signature from ${beacon.nodeId}, dropping beacon.`);
                        return;
                    }

                    // SECURITY: Replay protection via nonce
                    const peerIdHex = Buffer.from(beacon.peerId).toString('hex');
                    const lastNonce = this.seenNonces.get(peerIdHex) || 0;
                    if (beacon.nonce <= lastNonce) {
                        console.warn(`[P2P] Stale nonce from ${beacon.nodeId}, dropping beacon.`);
                        return;
                    }
                    this.seenNonces.set(peerIdHex, beacon.nonce);

                    // SECURITY: Timestamp freshness (24 hour window)
                    const ageMs = Date.now() - beacon.timestamp;
                    if (ageMs > 24 * 60 * 60 * 1000) {
                        console.warn(`[P2P] Expired beacon from ${beacon.nodeId}, dropping.`);
                        return;
                    }

                    if (this.peerDiscoveryCallback) {
                        this.peerDiscoveryCallback(beacon);
                    }
                } catch (e) {
                    console.error('[P2P] Failed to decode/verify beacon:', e);
                }
            }
        });
    }

    /**
     * Verify the Ed25519 signature over the beacon payload.
     */
    private async verifyBeaconSignature(beacon: PoEBeaconProto): Promise<boolean> {
        // Reconstruct the signed payload (all fields except signature)
        const payloadBeacon = { ...beacon, signature: new Uint8Array(0) };
        const payloadBytes = encodeBeacon(payloadBeacon);

        return await verify(beacon.signature, payloadBytes, beacon.peerId);
    }

    async broadcast(beacon: PoEBeaconProto) {
        if (!this.node) throw new Error('Node not started');
        const data = encodeBeacon(beacon);
        await this.node.services.pubsub.publish(PDP_TOPICS.DISCOVERY, data);
        console.log(`[P2P] Broadcasted PoE Beacon (${data.length} bytes)`);
    }

    onDiscovery(callback: (peer: PoEBeaconProto) => void) {
        this.peerDiscoveryCallback = callback;
    }

    async stop() {
        if (this.node) {
            await this.node.stop();
        }
    }

    getPeerId(): Uint8Array | null {
        return this.node?.peerId.toBytes() || null;
    }

    getPeerIdString(): string {
        return this.node?.peerId.toString() || '';
    }
}
