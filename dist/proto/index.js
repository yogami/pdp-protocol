"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProto = initProto;
exports.encodeBeacon = encodeBeacon;
exports.decodeBeacon = decodeBeacon;
exports.getBeaconSize = getBeaconSize;
const protobuf = __importStar(require("protobufjs"));
const path = __importStar(require("path"));
// The PoEBeacon type will be loaded dynamically from the .proto file
let PoEBeaconType = null;
/**
 * Initialize the Protobuf schema by loading the .proto file.
 * Must be called before encode/decode operations.
 */
async function initProto() {
    const protoPath = path.join(__dirname, 'pdp.proto');
    const root = await protobuf.load(protoPath);
    PoEBeaconType = root.lookupType('pdp.PoEBeacon');
}
/**
 * Encode a PoEBeacon object to a compact binary buffer.
 */
function encodeBeacon(beacon) {
    if (!PoEBeaconType) {
        throw new Error('Proto not initialized. Call initProto() first.');
    }
    const errMsg = PoEBeaconType.verify(beacon);
    if (errMsg)
        throw new Error(`Invalid beacon: ${errMsg}`);
    const message = PoEBeaconType.create(beacon);
    return PoEBeaconType.encode(message).finish();
}
/**
 * Decode a binary buffer to a PoEBeacon object.
 */
function decodeBeacon(buffer) {
    if (!PoEBeaconType) {
        throw new Error('Proto not initialized. Call initProto() first.');
    }
    const message = PoEBeaconType.decode(buffer);
    return PoEBeaconType.toObject(message, {
        longs: Number,
        bytes: Uint8Array
    });
}
/**
 * Get the size of a beacon in bytes (for bandwidth estimation).
 */
function getBeaconSize(beacon) {
    return encodeBeacon(beacon).length;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvdG8vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QkEsOEJBSUM7QUFLRCxvQ0FTQztBQUtELG9DQVNDO0FBS0Qsc0NBRUM7QUEvREQscURBQXVDO0FBQ3ZDLDJDQUE2QjtBQUU3QixxRUFBcUU7QUFDckUsSUFBSSxhQUFhLEdBQXlCLElBQUksQ0FBQztBQWdCL0M7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLFNBQVM7SUFDM0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDcEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVDLGFBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLFlBQVksQ0FBQyxNQUFzQjtJQUMvQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFDRCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLElBQUksTUFBTTtRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFFekQsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3QyxPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbEQsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsWUFBWSxDQUFDLE1BQWtCO0lBQzNDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUNELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDN0MsT0FBTyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtRQUNuQyxLQUFLLEVBQUUsTUFBTTtRQUNiLEtBQUssRUFBRSxVQUFVO0tBQ3BCLENBQW1CLENBQUM7QUFDekIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLE1BQXNCO0lBQ2hELE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUN2QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcHJvdG9idWYgZnJvbSAncHJvdG9idWZqcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBUaGUgUG9FQmVhY29uIHR5cGUgd2lsbCBiZSBsb2FkZWQgZHluYW1pY2FsbHkgZnJvbSB0aGUgLnByb3RvIGZpbGVcbmxldCBQb0VCZWFjb25UeXBlOiBwcm90b2J1Zi5UeXBlIHwgbnVsbCA9IG51bGw7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9FQmVhY29uUHJvdG8ge1xuICAgIG5vZGVJZDogc3RyaW5nO1xuICAgIHBlZXJJZDogVWludDhBcnJheTtcbiAgICBwb2VIYXNoOiBVaW50OEFycmF5O1xuICAgIHprUHJvb2ZSZWY6IFVpbnQ4QXJyYXk7XG4gICAgc29sYW5hVHg6IHN0cmluZztcbiAgICBiYXNlVHg6IHN0cmluZztcbiAgICBjYXBhYmlsaXRpZXM6IHN0cmluZ1tdO1xuICAgIHRpbWVzdGFtcDogbnVtYmVyO1xuICAgIG5vbmNlOiBudW1iZXI7XG4gICAgc2lnbmF0dXJlOiBVaW50OEFycmF5O1xuICAgIHZlcmFQYXlsb2FkPzogVWludDhBcnJheTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBQcm90b2J1ZiBzY2hlbWEgYnkgbG9hZGluZyB0aGUgLnByb3RvIGZpbGUuXG4gKiBNdXN0IGJlIGNhbGxlZCBiZWZvcmUgZW5jb2RlL2RlY29kZSBvcGVyYXRpb25zLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdFByb3RvKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHByb3RvUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdwZHAucHJvdG8nKTtcbiAgICBjb25zdCByb290ID0gYXdhaXQgcHJvdG9idWYubG9hZChwcm90b1BhdGgpO1xuICAgIFBvRUJlYWNvblR5cGUgPSByb290Lmxvb2t1cFR5cGUoJ3BkcC5Qb0VCZWFjb24nKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYSBQb0VCZWFjb24gb2JqZWN0IHRvIGEgY29tcGFjdCBiaW5hcnkgYnVmZmVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQmVhY29uKGJlYWNvbjogUG9FQmVhY29uUHJvdG8pOiBVaW50OEFycmF5IHtcbiAgICBpZiAoIVBvRUJlYWNvblR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm90byBub3QgaW5pdGlhbGl6ZWQuIENhbGwgaW5pdFByb3RvKCkgZmlyc3QuJyk7XG4gICAgfVxuICAgIGNvbnN0IGVyck1zZyA9IFBvRUJlYWNvblR5cGUudmVyaWZ5KGJlYWNvbik7XG4gICAgaWYgKGVyck1zZykgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGJlYWNvbjogJHtlcnJNc2d9YCk7XG5cbiAgICBjb25zdCBtZXNzYWdlID0gUG9FQmVhY29uVHlwZS5jcmVhdGUoYmVhY29uKTtcbiAgICByZXR1cm4gUG9FQmVhY29uVHlwZS5lbmNvZGUobWVzc2FnZSkuZmluaXNoKCk7XG59XG5cbi8qKlxuICogRGVjb2RlIGEgYmluYXJ5IGJ1ZmZlciB0byBhIFBvRUJlYWNvbiBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVCZWFjb24oYnVmZmVyOiBVaW50OEFycmF5KTogUG9FQmVhY29uUHJvdG8ge1xuICAgIGlmICghUG9FQmVhY29uVHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3RvIG5vdCBpbml0aWFsaXplZC4gQ2FsbCBpbml0UHJvdG8oKSBmaXJzdC4nKTtcbiAgICB9XG4gICAgY29uc3QgbWVzc2FnZSA9IFBvRUJlYWNvblR5cGUuZGVjb2RlKGJ1ZmZlcik7XG4gICAgcmV0dXJuIFBvRUJlYWNvblR5cGUudG9PYmplY3QobWVzc2FnZSwge1xuICAgICAgICBsb25nczogTnVtYmVyLFxuICAgICAgICBieXRlczogVWludDhBcnJheVxuICAgIH0pIGFzIFBvRUJlYWNvblByb3RvO1xufVxuXG4vKipcbiAqIEdldCB0aGUgc2l6ZSBvZiBhIGJlYWNvbiBpbiBieXRlcyAoZm9yIGJhbmR3aWR0aCBlc3RpbWF0aW9uKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJlYWNvblNpemUoYmVhY29uOiBQb0VCZWFjb25Qcm90byk6IG51bWJlciB7XG4gICAgcmV0dXJuIGVuY29kZUJlYWNvbihiZWFjb24pLmxlbmd0aDtcbn1cbiJdfQ==