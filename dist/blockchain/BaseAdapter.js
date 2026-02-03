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
exports.BaseAdapter = void 0;
const ethers_1 = require("ethers");
const crypto = __importStar(require("crypto"));
/**
 * BaseAdapter - Handles anchoring PoE commitments to the Base L2 (EVM).
 */
class BaseAdapter {
    constructor(rpcUrl, privateKey) {
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
    }
    async anchorPoE(poeHash, agentId) {
        const salt = crypto.randomBytes(16).toString('hex');
        const commitment = crypto.createHash('sha256')
            .update(poeHash + salt)
            .digest('hex');
        const metadata = JSON.stringify({
            c: commitment,
            a: agentId,
            v: "2",
            p: "pdp-v1"
        });
        const data = ethers_1.ethers.hexlify(ethers_1.ethers.toUtf8Bytes(metadata));
        const tx = await this.wallet.sendTransaction({
            to: this.wallet.address,
            data: data
        });
        const receipt = await tx.wait();
        if (!receipt)
            throw new Error("Base anchoring failed: No receipt");
        const network = await this.provider.getNetwork();
        const networkName = network.name;
        const isSepolia = networkName.includes('sepolia') || network.chainId === 84532n;
        const explorerBase = isSepolia
            ? 'https://sepolia.basescan.org/tx/'
            : 'https://basescan.org/tx/';
        return {
            txHash: receipt.hash,
            network: isSepolia ? 'base-sepolia' : 'base-mainnet',
            commitment,
            explorerUrl: `${explorerBase}${receipt.hash}`
        };
    }
    getWalletAddress() {
        return this.wallet.address;
    }
}
exports.BaseAdapter = BaseAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZUFkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmxvY2tjaGFpbi9CYXNlQWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBZ0M7QUFDaEMsK0NBQWlDO0FBU2pDOztHQUVHO0FBQ0gsTUFBYSxXQUFXO0lBSXBCLFlBQVksTUFBYyxFQUFFLFVBQWtCO1FBQzFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxlQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBZSxFQUFFLE9BQWU7UUFDNUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7YUFDekMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7YUFDdEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRW5CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDNUIsQ0FBQyxFQUFFLFVBQVU7WUFDYixDQUFDLEVBQUUsT0FBTztZQUNWLENBQUMsRUFBRSxHQUFHO1lBQ04sQ0FBQyxFQUFFLFFBQVE7U0FDZCxDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksR0FBRyxlQUFNLENBQUMsT0FBTyxDQUFDLGVBQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUUxRCxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDO1lBQ3pDLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87WUFDdkIsSUFBSSxFQUFFLElBQUk7U0FDYixDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsT0FBTztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUVuRSxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDakQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUNqQyxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDO1FBRWhGLE1BQU0sWUFBWSxHQUFHLFNBQVM7WUFDMUIsQ0FBQyxDQUFDLGtDQUFrQztZQUNwQyxDQUFDLENBQUMsMEJBQTBCLENBQUM7UUFFakMsT0FBTztZQUNILE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNwQixPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWM7WUFDcEQsVUFBVTtZQUNWLFdBQVcsRUFBRSxHQUFHLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFO1NBQ2hELENBQUM7SUFDTixDQUFDO0lBRUQsZ0JBQWdCO1FBQ1osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUMvQixDQUFDO0NBQ0o7QUFuREQsa0NBbURDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VBbmNob3JSZXN1bHQge1xuICAgIHR4SGFzaDogc3RyaW5nO1xuICAgIG5ldHdvcms6IHN0cmluZztcbiAgICBjb21taXRtZW50OiBzdHJpbmc7XG4gICAgZXhwbG9yZXJVcmw6IHN0cmluZztcbn1cblxuLyoqXG4gKiBCYXNlQWRhcHRlciAtIEhhbmRsZXMgYW5jaG9yaW5nIFBvRSBjb21taXRtZW50cyB0byB0aGUgQmFzZSBMMiAoRVZNKS5cbiAqL1xuZXhwb3J0IGNsYXNzIEJhc2VBZGFwdGVyIHtcbiAgICBwcml2YXRlIHByb3ZpZGVyOiBldGhlcnMuSnNvblJwY1Byb3ZpZGVyO1xuICAgIHByaXZhdGUgd2FsbGV0OiBldGhlcnMuV2FsbGV0O1xuXG4gICAgY29uc3RydWN0b3IocnBjVXJsOiBzdHJpbmcsIHByaXZhdGVLZXk6IHN0cmluZykge1xuICAgICAgICB0aGlzLnByb3ZpZGVyID0gbmV3IGV0aGVycy5Kc29uUnBjUHJvdmlkZXIocnBjVXJsKTtcbiAgICAgICAgdGhpcy53YWxsZXQgPSBuZXcgZXRoZXJzLldhbGxldChwcml2YXRlS2V5LCB0aGlzLnByb3ZpZGVyKTtcbiAgICB9XG5cbiAgICBhc3luYyBhbmNob3JQb0UocG9lSGFzaDogc3RyaW5nLCBhZ2VudElkOiBzdHJpbmcpOiBQcm9taXNlPEJhc2VBbmNob3JSZXN1bHQ+IHtcbiAgICAgICAgY29uc3Qgc2FsdCA9IGNyeXB0by5yYW5kb21CeXRlcygxNikudG9TdHJpbmcoJ2hleCcpO1xuICAgICAgICBjb25zdCBjb21taXRtZW50ID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpXG4gICAgICAgICAgICAudXBkYXRlKHBvZUhhc2ggKyBzYWx0KVxuICAgICAgICAgICAgLmRpZ2VzdCgnaGV4Jyk7XG5cbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBjOiBjb21taXRtZW50LFxuICAgICAgICAgICAgYTogYWdlbnRJZCxcbiAgICAgICAgICAgIHY6IFwiMlwiLFxuICAgICAgICAgICAgcDogXCJwZHAtdjFcIlxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBkYXRhID0gZXRoZXJzLmhleGxpZnkoZXRoZXJzLnRvVXRmOEJ5dGVzKG1ldGFkYXRhKSk7XG5cbiAgICAgICAgY29uc3QgdHggPSBhd2FpdCB0aGlzLndhbGxldC5zZW5kVHJhbnNhY3Rpb24oe1xuICAgICAgICAgICAgdG86IHRoaXMud2FsbGV0LmFkZHJlc3MsXG4gICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCB0eC53YWl0KCk7XG4gICAgICAgIGlmICghcmVjZWlwdCkgdGhyb3cgbmV3IEVycm9yKFwiQmFzZSBhbmNob3JpbmcgZmFpbGVkOiBObyByZWNlaXB0XCIpO1xuXG4gICAgICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCB0aGlzLnByb3ZpZGVyLmdldE5ldHdvcmsoKTtcbiAgICAgICAgY29uc3QgbmV0d29ya05hbWUgPSBuZXR3b3JrLm5hbWU7XG4gICAgICAgIGNvbnN0IGlzU2Vwb2xpYSA9IG5ldHdvcmtOYW1lLmluY2x1ZGVzKCdzZXBvbGlhJykgfHwgbmV0d29yay5jaGFpbklkID09PSA4NDUzMm47XG5cbiAgICAgICAgY29uc3QgZXhwbG9yZXJCYXNlID0gaXNTZXBvbGlhXG4gICAgICAgICAgICA/ICdodHRwczovL3NlcG9saWEuYmFzZXNjYW4ub3JnL3R4LydcbiAgICAgICAgICAgIDogJ2h0dHBzOi8vYmFzZXNjYW4ub3JnL3R4Lyc7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR4SGFzaDogcmVjZWlwdC5oYXNoLFxuICAgICAgICAgICAgbmV0d29yazogaXNTZXBvbGlhID8gJ2Jhc2Utc2Vwb2xpYScgOiAnYmFzZS1tYWlubmV0JyxcbiAgICAgICAgICAgIGNvbW1pdG1lbnQsXG4gICAgICAgICAgICBleHBsb3JlclVybDogYCR7ZXhwbG9yZXJCYXNlfSR7cmVjZWlwdC5oYXNofWBcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRXYWxsZXRBZGRyZXNzKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGxldC5hZGRyZXNzO1xuICAgIH1cbn1cbiJdfQ==