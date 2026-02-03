import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@libp2p/noise';
import { mplex } from '@libp2p/mplex';
import { gossipsub } from '@libp2p/gossipsub';
import { bootstrap } from '@libp2p/bootstrap';
import { multiaddr } from '@multiformats/multiaddr';
import { pipe } from 'it-pipe';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';

export const PDP_TOPICS = {
    DISCOVERY: 'pdp/discovery/v1',
    PROOFS: 'pdp/proofs/v1'
};

export interface PoEBeacon {
    poeHash: string;
    agentId: string;
    veracity: number;
    capabilities: string[];
    solanaTx?: string;
    zkProof?: string;
    timestamp: number;
}

/**
 * GossipNode - Real libp2p implementation for the PDP P2P network.
 */
export class GossipNode {
    private node: any;
    private peerDiscoveryCallback?: (peer: PoEBeacon) => void;

    async start() {
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
        console.log(`[P2P] PDP Node started with ID: ${this.node.peerId.toString()}`);

        // Subscribe to discovery topic
        this.node.services.pubsub.subscribe(PDP_TOPICS.DISCOVERY);

        // Listen for messages
        this.node.services.pubsub.addEventListener('message', (evt: any) => {
            if (evt.detail.topic === PDP_TOPICS.DISCOVERY) {
                try {
                    const data = uint8ArrayToString(evt.detail.data);
                    const beacon: PoEBeacon = JSON.parse(data);
                    if (this.peerDiscoveryCallback) {
                        this.peerDiscoveryCallback(beacon);
                    }
                } catch (e) {
                    console.error('[P2P] Failed to parse beacon:', e);
                }
            }
        });
    }

    async broadcast(beacon: PoEBeacon) {
        if (!this.node) throw new Error('Node not started');
        const data = uint8ArrayFromString(JSON.stringify(beacon));
        await this.node.services.pubsub.publish(PDP_TOPICS.DISCOVERY, data);
        console.log(`[P2P] Broadcasted PoE Beacon: ${beacon.poeHash.substring(0, 10)}...`);
    }

    onDiscovery(callback: (peer: PoEBeacon) => void) {
        this.peerDiscoveryCallback = callback;
    }

    async stop() {
        if (this.node) {
            await this.node.stop();
        }
    }

    getPeerId() {
        return this.node?.peerId.toString();
    }
}
