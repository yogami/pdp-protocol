"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GossipNode = exports.PDP_TOPICS = void 0;
const libp2p_1 = require("libp2p");
const websockets_1 = require("@libp2p/websockets");
const noise_1 = require("@libp2p/noise");
const mplex_1 = require("@libp2p/mplex");
const gossipsub_1 = require("@libp2p/gossipsub");
const proto_1 = require("../proto");
const signing_1 = require("../crypto/signing");
exports.PDP_TOPICS = {
    DISCOVERY: 'pdp/discovery/v2', // V2 uses Protobuf
    PROOFS: 'pdp/proofs/v2'
};
/**
 * GossipNode V2 - Hardened libp2p implementation with Protobuf + Ed25519.
 */
class GossipNode {
    constructor() {
        this.seenNonces = new Map(); // peerId -> lastNonce
        this.protoInitialized = false;
    }
    async start() {
        // Initialize Protobuf schema
        if (!this.protoInitialized) {
            await (0, proto_1.initProto)();
            this.protoInitialized = true;
        }
        this.node = await (0, libp2p_1.createLibp2p)({
            transports: [(0, websockets_1.webSockets)()],
            connectionEncrypters: [(0, noise_1.noise)()],
            streamMuxers: [(0, mplex_1.mplex)()],
            services: {
                pubsub: (0, gossipsub_1.gossipsub)({
                    allowPublishToZeroTopicPeers: true,
                    emitSelf: false
                })
            }
        });
        await this.node.start();
        console.log(`[P2P] PDP Node V2 started with ID: ${this.node.peerId.toString()}`);
        this.node.services.pubsub.subscribe(exports.PDP_TOPICS.DISCOVERY);
        this.node.services.pubsub.addEventListener('message', async (evt) => {
            if (evt.detail.topic === exports.PDP_TOPICS.DISCOVERY) {
                try {
                    const beacon = (0, proto_1.decodeBeacon)(evt.detail.data);
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
                }
                catch (e) {
                    console.error('[P2P] Failed to decode/verify beacon:', e);
                }
            }
        });
    }
    /**
     * Verify the Ed25519 signature over the beacon payload.
     * VERA Upgrade: If veraPayload is present, verify matches that (JCS JSON).
     * Otherwise, verify matches the Protobuf encoding (Legacy).
     */
    async verifyBeaconSignature(beacon) {
        if (beacon.veraPayload && beacon.veraPayload.length > 0) {
            // VERA Mode: Signature is over the VERA JSON payload
            return await (0, signing_1.verify)(beacon.signature, beacon.veraPayload, beacon.peerId);
        }
        // Legacy Mode: Signature is over the Protobuf payload fields
        // Reconstruct the signed payload (all fields except signature)
        const payloadBeacon = { ...beacon, signature: new Uint8Array(0) };
        const payloadBytes = (0, proto_1.encodeBeacon)(payloadBeacon);
        return await (0, signing_1.verify)(beacon.signature, payloadBytes, beacon.peerId);
    }
    async broadcast(beacon) {
        if (!this.node)
            throw new Error('Node not started');
        const data = (0, proto_1.encodeBeacon)(beacon);
        await this.node.services.pubsub.publish(exports.PDP_TOPICS.DISCOVERY, data);
        console.log(`[P2P] Broadcasted PoE Beacon (${data.length} bytes)`);
    }
    onDiscovery(callback) {
        this.peerDiscoveryCallback = callback;
    }
    async stop() {
        if (this.node) {
            await this.node.stop();
        }
    }
    getPeerId() {
        return this.node?.peerId.toBytes() || null;
    }
    getPeerIdString() {
        return this.node?.peerId.toString() || '';
    }
}
exports.GossipNode = GossipNode;
