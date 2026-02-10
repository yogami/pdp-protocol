import * as protobuf from 'protobufjs';
import * as path from 'path';

// The PoEBeacon type will be loaded dynamically from the .proto file
let PoEBeaconType: protobuf.Type | null = null;

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
export async function initProto(): Promise<void> {
    const protoPath = path.join(__dirname, 'pdp.proto');
    const root = await protobuf.load(protoPath);
    PoEBeaconType = root.lookupType('pdp.PoEBeacon');
}

/**
 * Encode a PoEBeacon object to a compact binary buffer.
 */
export function encodeBeacon(beacon: PoEBeaconProto): Uint8Array {
    if (!PoEBeaconType) {
        throw new Error('Proto not initialized. Call initProto() first.');
    }
    const errMsg = PoEBeaconType.verify(beacon);
    if (errMsg) throw new Error(`Invalid beacon: ${errMsg}`);

    const message = PoEBeaconType.create(beacon);
    return PoEBeaconType.encode(message).finish();
}

/**
 * Decode a binary buffer to a PoEBeacon object.
 */
export function decodeBeacon(buffer: Uint8Array): PoEBeaconProto {
    if (!PoEBeaconType) {
        throw new Error('Proto not initialized. Call initProto() first.');
    }
    const message = PoEBeaconType.decode(buffer);
    return PoEBeaconType.toObject(message, {
        longs: Number,
        bytes: Uint8Array
    }) as PoEBeaconProto;
}

/**
 * Get the size of a beacon in bytes (for bandwidth estimation).
 */
export function getBeaconSize(beacon: PoEBeaconProto): number {
    return encodeBeacon(beacon).length;
}
