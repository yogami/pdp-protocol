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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvdG8vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1QkEsOEJBSUM7QUFLRCxvQ0FTQztBQUtELG9DQVNDO0FBS0Qsc0NBRUM7QUE5REQscURBQXVDO0FBQ3ZDLDJDQUE2QjtBQUU3QixxRUFBcUU7QUFDckUsSUFBSSxhQUFhLEdBQXlCLElBQUksQ0FBQztBQWUvQzs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsU0FBUztJQUMzQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNwRCxNQUFNLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUMsYUFBYSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsWUFBWSxDQUFDLE1BQXNCO0lBQy9DLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUNELE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUMsSUFBSSxNQUFNO1FBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUV6RCxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdDLE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNsRCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixZQUFZLENBQUMsTUFBa0I7SUFDM0MsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3QyxPQUFPLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO1FBQ25DLEtBQUssRUFBRSxNQUFNO1FBQ2IsS0FBSyxFQUFFLFVBQVU7S0FDcEIsQ0FBbUIsQ0FBQztBQUN6QixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixhQUFhLENBQUMsTUFBc0I7SUFDaEQsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3ZDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwcm90b2J1ZiBmcm9tICdwcm90b2J1ZmpzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8vIFRoZSBQb0VCZWFjb24gdHlwZSB3aWxsIGJlIGxvYWRlZCBkeW5hbWljYWxseSBmcm9tIHRoZSAucHJvdG8gZmlsZVxubGV0IFBvRUJlYWNvblR5cGU6IHByb3RvYnVmLlR5cGUgfCBudWxsID0gbnVsbDtcblxuZXhwb3J0IGludGVyZmFjZSBQb0VCZWFjb25Qcm90byB7XG4gICAgbm9kZUlkOiBzdHJpbmc7XG4gICAgcGVlcklkOiBVaW50OEFycmF5O1xuICAgIHBvZUhhc2g6IFVpbnQ4QXJyYXk7XG4gICAgemtQcm9vZlJlZjogVWludDhBcnJheTtcbiAgICBzb2xhbmFUeDogc3RyaW5nO1xuICAgIGJhc2VUeDogc3RyaW5nO1xuICAgIGNhcGFiaWxpdGllczogc3RyaW5nW107XG4gICAgdGltZXN0YW1wOiBudW1iZXI7XG4gICAgbm9uY2U6IG51bWJlcjtcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXk7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgUHJvdG9idWYgc2NoZW1hIGJ5IGxvYWRpbmcgdGhlIC5wcm90byBmaWxlLlxuICogTXVzdCBiZSBjYWxsZWQgYmVmb3JlIGVuY29kZS9kZWNvZGUgb3BlcmF0aW9ucy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRQcm90bygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwcm90b1BhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAncGRwLnByb3RvJyk7XG4gICAgY29uc3Qgcm9vdCA9IGF3YWl0IHByb3RvYnVmLmxvYWQocHJvdG9QYXRoKTtcbiAgICBQb0VCZWFjb25UeXBlID0gcm9vdC5sb29rdXBUeXBlKCdwZHAuUG9FQmVhY29uJyk7XG59XG5cbi8qKlxuICogRW5jb2RlIGEgUG9FQmVhY29uIG9iamVjdCB0byBhIGNvbXBhY3QgYmluYXJ5IGJ1ZmZlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUJlYWNvbihiZWFjb246IFBvRUJlYWNvblByb3RvKTogVWludDhBcnJheSB7XG4gICAgaWYgKCFQb0VCZWFjb25UeXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvdG8gbm90IGluaXRpYWxpemVkLiBDYWxsIGluaXRQcm90bygpIGZpcnN0LicpO1xuICAgIH1cbiAgICBjb25zdCBlcnJNc2cgPSBQb0VCZWFjb25UeXBlLnZlcmlmeShiZWFjb24pO1xuICAgIGlmIChlcnJNc2cpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBiZWFjb246ICR7ZXJyTXNnfWApO1xuXG4gICAgY29uc3QgbWVzc2FnZSA9IFBvRUJlYWNvblR5cGUuY3JlYXRlKGJlYWNvbik7XG4gICAgcmV0dXJuIFBvRUJlYWNvblR5cGUuZW5jb2RlKG1lc3NhZ2UpLmZpbmlzaCgpO1xufVxuXG4vKipcbiAqIERlY29kZSBhIGJpbmFyeSBidWZmZXIgdG8gYSBQb0VCZWFjb24gb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQmVhY29uKGJ1ZmZlcjogVWludDhBcnJheSk6IFBvRUJlYWNvblByb3RvIHtcbiAgICBpZiAoIVBvRUJlYWNvblR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm90byBub3QgaW5pdGlhbGl6ZWQuIENhbGwgaW5pdFByb3RvKCkgZmlyc3QuJyk7XG4gICAgfVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBQb0VCZWFjb25UeXBlLmRlY29kZShidWZmZXIpO1xuICAgIHJldHVybiBQb0VCZWFjb25UeXBlLnRvT2JqZWN0KG1lc3NhZ2UsIHtcbiAgICAgICAgbG9uZ3M6IE51bWJlcixcbiAgICAgICAgYnl0ZXM6IFVpbnQ4QXJyYXlcbiAgICB9KSBhcyBQb0VCZWFjb25Qcm90bztcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHNpemUgb2YgYSBiZWFjb24gaW4gYnl0ZXMgKGZvciBiYW5kd2lkdGggZXN0aW1hdGlvbikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCZWFjb25TaXplKGJlYWNvbjogUG9FQmVhY29uUHJvdG8pOiBudW1iZXIge1xuICAgIHJldHVybiBlbmNvZGVCZWFjb24oYmVhY29uKS5sZW5ndGg7XG59XG4iXX0=