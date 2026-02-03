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
exports.ZKProofGenerator = void 0;
const crypto = __importStar(require("crypto"));
/**
 * ZKProofGenerator - Generates non-interactive zero-knowledge proofs for agent execution.
 *
 * Re-uses the Groth16 high-veracity mock pattern. In Phase 2, this will be
 * replaced with actual SnarkJS generation.
 */
class ZKProofGenerator {
    async generateProof(input) {
        const taskIdHash = crypto.createHash('sha256').update(input.taskId).digest('hex');
        const completionTimestamp = Math.floor(new Date(input.completedAt).getTime() / 1000);
        const slaDeadline = completionTimestamp + input.slaDeadlineSeconds;
        // Logic check (simulating circuit constraints)
        const timeValid = completionTimestamp <= slaDeadline;
        const veracityValid = input.veracityScore >= 0.7;
        const allValid = timeValid && veracityValid;
        // Mock Groth16 pi_a, pi_b, pi_c
        const mockProof = {
            pi_a: [crypto.randomBytes(32).toString('hex'), '1'],
            pi_b: [[crypto.randomBytes(32).toString('hex')], ['1']],
            pi_c: [crypto.randomBytes(32).toString('hex')],
            protocol: 'groth16',
            curve: 'bn128'
        };
        const proofStr = JSON.stringify(mockProof);
        const proofBase64 = Buffer.from(proofStr).toString('base64');
        return {
            proof: proofBase64,
            publicSignals: [
                taskIdHash.substring(0, 16),
                slaDeadline.toString(),
                input.veracityScore.toString(),
                '1'
            ],
            verified: allValid,
            taskIdHash: taskIdHash,
            timestamp: Date.now()
        };
    }
    async verifyProof(bundle) {
        // In this phase, we rely on the internal verification flag
        // Actual verification would check the proof against the public signals
        return bundle.verified;
    }
}
exports.ZKProofGenerator = ZKProofGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWktQcm9vZkdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy96ay9aS1Byb29mR2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUFpQztBQWtCakM7Ozs7O0dBS0c7QUFDSCxNQUFhLGdCQUFnQjtJQUV6QixLQUFLLENBQUMsYUFBYSxDQUFDLEtBQW1CO1FBQ25DLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEYsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNyRixNQUFNLFdBQVcsR0FBRyxtQkFBbUIsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUM7UUFFbkUsK0NBQStDO1FBQy9DLE1BQU0sU0FBUyxHQUFHLG1CQUFtQixJQUFJLFdBQVcsQ0FBQztRQUNyRCxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxJQUFJLEdBQUcsQ0FBQztRQUNqRCxNQUFNLFFBQVEsR0FBRyxTQUFTLElBQUksYUFBYSxDQUFDO1FBRTVDLGdDQUFnQztRQUNoQyxNQUFNLFNBQVMsR0FBRztZQUNkLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNuRCxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2RCxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxRQUFRLEVBQUUsU0FBUztZQUNuQixLQUFLLEVBQUUsT0FBTztTQUNqQixDQUFDO1FBRUYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3RCxPQUFPO1lBQ0gsS0FBSyxFQUFFLFdBQVc7WUFDbEIsYUFBYSxFQUFFO2dCQUNYLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDM0IsV0FBVyxDQUFDLFFBQVEsRUFBRTtnQkFDdEIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUU7Z0JBQzlCLEdBQUc7YUFDTjtZQUNELFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1NBQ3hCLENBQUM7SUFDTixDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFxQjtRQUNuQywyREFBMkQ7UUFDM0QsdUVBQXVFO1FBQ3ZFLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUMzQixDQUFDO0NBQ0o7QUEzQ0QsNENBMkNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgWktQcm9vZklucHV0IHtcbiAgICB0YXNrSWQ6IHN0cmluZztcbiAgICBjb21wbGV0ZWRBdDogc3RyaW5nO1xuICAgIHNsYURlYWRsaW5lU2Vjb25kczogbnVtYmVyO1xuICAgIHZlcmFjaXR5U2NvcmU6IG51bWJlcjtcbiAgICBvdXRwdXRIYXNoOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgWktQcm9vZkJ1bmRsZSB7XG4gICAgcHJvb2Y6IHN0cmluZztcbiAgICBwdWJsaWNTaWduYWxzOiBzdHJpbmdbXTtcbiAgICB2ZXJpZmllZDogYm9vbGVhbjtcbiAgICB0YXNrSWRIYXNoOiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBudW1iZXI7XG59XG5cbi8qKlxuICogWktQcm9vZkdlbmVyYXRvciAtIEdlbmVyYXRlcyBub24taW50ZXJhY3RpdmUgemVyby1rbm93bGVkZ2UgcHJvb2ZzIGZvciBhZ2VudCBleGVjdXRpb24uXG4gKiBcbiAqIFJlLXVzZXMgdGhlIEdyb3RoMTYgaGlnaC12ZXJhY2l0eSBtb2NrIHBhdHRlcm4uIEluIFBoYXNlIDIsIHRoaXMgd2lsbCBiZVxuICogcmVwbGFjZWQgd2l0aCBhY3R1YWwgU25hcmtKUyBnZW5lcmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgWktQcm9vZkdlbmVyYXRvciB7XG5cbiAgICBhc3luYyBnZW5lcmF0ZVByb29mKGlucHV0OiBaS1Byb29mSW5wdXQpOiBQcm9taXNlPFpLUHJvb2ZCdW5kbGU+IHtcbiAgICAgICAgY29uc3QgdGFza0lkSGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoaW5wdXQudGFza0lkKS5kaWdlc3QoJ2hleCcpO1xuICAgICAgICBjb25zdCBjb21wbGV0aW9uVGltZXN0YW1wID0gTWF0aC5mbG9vcihuZXcgRGF0ZShpbnB1dC5jb21wbGV0ZWRBdCkuZ2V0VGltZSgpIC8gMTAwMCk7XG4gICAgICAgIGNvbnN0IHNsYURlYWRsaW5lID0gY29tcGxldGlvblRpbWVzdGFtcCArIGlucHV0LnNsYURlYWRsaW5lU2Vjb25kcztcblxuICAgICAgICAvLyBMb2dpYyBjaGVjayAoc2ltdWxhdGluZyBjaXJjdWl0IGNvbnN0cmFpbnRzKVxuICAgICAgICBjb25zdCB0aW1lVmFsaWQgPSBjb21wbGV0aW9uVGltZXN0YW1wIDw9IHNsYURlYWRsaW5lO1xuICAgICAgICBjb25zdCB2ZXJhY2l0eVZhbGlkID0gaW5wdXQudmVyYWNpdHlTY29yZSA+PSAwLjc7XG4gICAgICAgIGNvbnN0IGFsbFZhbGlkID0gdGltZVZhbGlkICYmIHZlcmFjaXR5VmFsaWQ7XG5cbiAgICAgICAgLy8gTW9jayBHcm90aDE2IHBpX2EsIHBpX2IsIHBpX2NcbiAgICAgICAgY29uc3QgbW9ja1Byb29mID0ge1xuICAgICAgICAgICAgcGlfYTogW2NyeXB0by5yYW5kb21CeXRlcygzMikudG9TdHJpbmcoJ2hleCcpLCAnMSddLFxuICAgICAgICAgICAgcGlfYjogW1tjcnlwdG8ucmFuZG9tQnl0ZXMoMzIpLnRvU3RyaW5nKCdoZXgnKV0sIFsnMSddXSxcbiAgICAgICAgICAgIHBpX2M6IFtjcnlwdG8ucmFuZG9tQnl0ZXMoMzIpLnRvU3RyaW5nKCdoZXgnKV0sXG4gICAgICAgICAgICBwcm90b2NvbDogJ2dyb3RoMTYnLFxuICAgICAgICAgICAgY3VydmU6ICdibjEyOCdcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBwcm9vZlN0ciA9IEpTT04uc3RyaW5naWZ5KG1vY2tQcm9vZik7XG4gICAgICAgIGNvbnN0IHByb29mQmFzZTY0ID0gQnVmZmVyLmZyb20ocHJvb2ZTdHIpLnRvU3RyaW5nKCdiYXNlNjQnKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcHJvb2Y6IHByb29mQmFzZTY0LFxuICAgICAgICAgICAgcHVibGljU2lnbmFsczogW1xuICAgICAgICAgICAgICAgIHRhc2tJZEhhc2guc3Vic3RyaW5nKDAsIDE2KSxcbiAgICAgICAgICAgICAgICBzbGFEZWFkbGluZS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGlucHV0LnZlcmFjaXR5U2NvcmUudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAnMSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB2ZXJpZmllZDogYWxsVmFsaWQsXG4gICAgICAgICAgICB0YXNrSWRIYXNoOiB0YXNrSWRIYXNoLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMgdmVyaWZ5UHJvb2YoYnVuZGxlOiBaS1Byb29mQnVuZGxlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIC8vIEluIHRoaXMgcGhhc2UsIHdlIHJlbHkgb24gdGhlIGludGVybmFsIHZlcmlmaWNhdGlvbiBmbGFnXG4gICAgICAgIC8vIEFjdHVhbCB2ZXJpZmljYXRpb24gd291bGQgY2hlY2sgdGhlIHByb29mIGFnYWluc3QgdGhlIHB1YmxpYyBzaWduYWxzXG4gICAgICAgIHJldHVybiBidW5kbGUudmVyaWZpZWQ7XG4gICAgfVxufVxuIl19