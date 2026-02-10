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
/**
 * Initialize the Protobuf schema by loading the .proto file.
 * Must be called before encode/decode operations.
 */
export declare function initProto(): Promise<void>;
/**
 * Encode a PoEBeacon object to a compact binary buffer.
 */
export declare function encodeBeacon(beacon: PoEBeaconProto): Uint8Array;
/**
 * Decode a binary buffer to a PoEBeacon object.
 */
export declare function decodeBeacon(buffer: Uint8Array): PoEBeaconProto;
/**
 * Get the size of a beacon in bytes (for bandwidth estimation).
 */
export declare function getBeaconSize(beacon: PoEBeaconProto): number;
