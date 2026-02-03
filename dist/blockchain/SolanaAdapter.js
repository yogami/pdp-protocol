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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaAdapter = void 0;
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const crypto = __importStar(require("crypto"));
/**
 * SolanaAdapter - Handles anchoring PoE commitments to the Solana blockchain.
 */
class SolanaAdapter {
    constructor(rpcUrl, privateKeyBase58) {
        this.MEMO_PROGRAM_ID = new web3_js_1.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
        this.connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
        this.keypair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(privateKeyBase58));
    }
    /**
     * Anchors a PoE commitment to Solana via the Memo Program.
     * Uses the Salted Hash Commitment pattern from the OpenClaw architecture.
     */
    async anchorPoE(poeHash, agentId) {
        const salt = crypto.randomBytes(16).toString('hex');
        const commitment = crypto.createHash('sha256')
            .update(poeHash + salt)
            .digest('hex');
        const memoData = JSON.stringify({
            c: commitment, // Commitment
            a: agentId, // Agent ID
            v: "2", // Version 2 (Salted)
            s: salt // In production, this would be partially revealed later
        });
        const instruction = new web3_js_1.TransactionInstruction({
            keys: [{ pubkey: this.keypair.publicKey, isSigner: true, isWritable: false }],
            programId: this.MEMO_PROGRAM_ID,
            data: Buffer.from(memoData, 'utf-8'),
        });
        const transaction = new web3_js_1.Transaction().add(instruction);
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.connection, transaction, [this.keypair], { commitment: 'confirmed' });
        const network = this.connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet-beta';
        return {
            signature,
            network,
            commitment,
            explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${network}`
        };
    }
    getPublicKey() {
        return this.keypair.publicKey.toBase58();
    }
}
exports.SolanaAdapter = SolanaAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU29sYW5hQWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL1NvbGFuYUFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBT3lCO0FBQ3pCLGdEQUF3QjtBQUN4QiwrQ0FBaUM7QUFTakM7O0dBRUc7QUFDSCxNQUFhLGFBQWE7SUFLdEIsWUFBWSxNQUFjLEVBQUUsZ0JBQXdCO1FBRm5DLG9CQUFlLEdBQUcsSUFBSSxtQkFBUyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFHNUYsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLEdBQUcsaUJBQU8sQ0FBQyxhQUFhLENBQUMsY0FBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBZSxFQUFFLE9BQWU7UUFDNUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7YUFDekMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7YUFDdEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRW5CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDNUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxhQUFhO1lBQzVCLENBQUMsRUFBRSxPQUFPLEVBQUssV0FBVztZQUMxQixDQUFDLEVBQUUsR0FBRyxFQUFTLHFCQUFxQjtZQUNwQyxDQUFDLEVBQUUsSUFBSSxDQUFRLHdEQUF3RDtTQUMxRSxDQUFDLENBQUM7UUFFSCxNQUFNLFdBQVcsR0FBRyxJQUFJLGdDQUFzQixDQUFDO1lBQzNDLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQzdFLFNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZTtZQUMvQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDO1NBQ3ZDLENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLElBQUkscUJBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2RCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsbUNBQXlCLEVBQzdDLElBQUksQ0FBQyxVQUFVLEVBQ2YsV0FBVyxFQUNYLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUNkLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxDQUM5QixDQUFDO1FBRUYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUUzRixPQUFPO1lBQ0gsU0FBUztZQUNULE9BQU87WUFDUCxVQUFVO1lBQ1YsV0FBVyxFQUFFLGtDQUFrQyxTQUFTLFlBQVksT0FBTyxFQUFFO1NBQ2hGLENBQUM7SUFDTixDQUFDO0lBRUQsWUFBWTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0MsQ0FBQztDQUNKO0FBdERELHNDQXNEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ29ubmVjdGlvbixcbiAgICBLZXlwYWlyLFxuICAgIFB1YmxpY0tleSxcbiAgICBUcmFuc2FjdGlvbixcbiAgICBUcmFuc2FjdGlvbkluc3RydWN0aW9uLFxuICAgIHNlbmRBbmRDb25maXJtVHJhbnNhY3Rpb24sXG59IGZyb20gJ0Bzb2xhbmEvd2ViMy5qcyc7XG5pbXBvcnQgYnM1OCBmcm9tICdiczU4JztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuY2hvclJlc3VsdCB7XG4gICAgc2lnbmF0dXJlOiBzdHJpbmc7XG4gICAgbmV0d29yazogc3RyaW5nO1xuICAgIGNvbW1pdG1lbnQ6IHN0cmluZztcbiAgICBleHBsb3JlclVybDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFNvbGFuYUFkYXB0ZXIgLSBIYW5kbGVzIGFuY2hvcmluZyBQb0UgY29tbWl0bWVudHMgdG8gdGhlIFNvbGFuYSBibG9ja2NoYWluLlxuICovXG5leHBvcnQgY2xhc3MgU29sYW5hQWRhcHRlciB7XG4gICAgcHJpdmF0ZSBjb25uZWN0aW9uOiBDb25uZWN0aW9uO1xuICAgIHByaXZhdGUga2V5cGFpcjogS2V5cGFpcjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IE1FTU9fUFJPR1JBTV9JRCA9IG5ldyBQdWJsaWNLZXkoJ01lbW9TcTRncUFCQVhLYjk2cW5IOFR5c05jV3hNeVdDcVhnRExHbWZjSHInKTtcblxuICAgIGNvbnN0cnVjdG9yKHJwY1VybDogc3RyaW5nLCBwcml2YXRlS2V5QmFzZTU4OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uID0gbmV3IENvbm5lY3Rpb24ocnBjVXJsLCAnY29uZmlybWVkJyk7XG4gICAgICAgIHRoaXMua2V5cGFpciA9IEtleXBhaXIuZnJvbVNlY3JldEtleShiczU4LmRlY29kZShwcml2YXRlS2V5QmFzZTU4KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW5jaG9ycyBhIFBvRSBjb21taXRtZW50IHRvIFNvbGFuYSB2aWEgdGhlIE1lbW8gUHJvZ3JhbS5cbiAgICAgKiBVc2VzIHRoZSBTYWx0ZWQgSGFzaCBDb21taXRtZW50IHBhdHRlcm4gZnJvbSB0aGUgT3BlbkNsYXcgYXJjaGl0ZWN0dXJlLlxuICAgICAqL1xuICAgIGFzeW5jIGFuY2hvclBvRShwb2VIYXNoOiBzdHJpbmcsIGFnZW50SWQ6IHN0cmluZyk6IFByb21pc2U8QW5jaG9yUmVzdWx0PiB7XG4gICAgICAgIGNvbnN0IHNhbHQgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoMTYpLnRvU3RyaW5nKCdoZXgnKTtcbiAgICAgICAgY29uc3QgY29tbWl0bWVudCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKVxuICAgICAgICAgICAgLnVwZGF0ZShwb2VIYXNoICsgc2FsdClcbiAgICAgICAgICAgIC5kaWdlc3QoJ2hleCcpO1xuXG4gICAgICAgIGNvbnN0IG1lbW9EYXRhID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgYzogY29tbWl0bWVudCwgLy8gQ29tbWl0bWVudFxuICAgICAgICAgICAgYTogYWdlbnRJZCwgICAgLy8gQWdlbnQgSURcbiAgICAgICAgICAgIHY6IFwiMlwiLCAgICAgICAgLy8gVmVyc2lvbiAyIChTYWx0ZWQpXG4gICAgICAgICAgICBzOiBzYWx0ICAgICAgICAvLyBJbiBwcm9kdWN0aW9uLCB0aGlzIHdvdWxkIGJlIHBhcnRpYWxseSByZXZlYWxlZCBsYXRlclxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBpbnN0cnVjdGlvbiA9IG5ldyBUcmFuc2FjdGlvbkluc3RydWN0aW9uKHtcbiAgICAgICAgICAgIGtleXM6IFt7IHB1YmtleTogdGhpcy5rZXlwYWlyLnB1YmxpY0tleSwgaXNTaWduZXI6IHRydWUsIGlzV3JpdGFibGU6IGZhbHNlIH1dLFxuICAgICAgICAgICAgcHJvZ3JhbUlkOiB0aGlzLk1FTU9fUFJPR1JBTV9JRCxcbiAgICAgICAgICAgIGRhdGE6IEJ1ZmZlci5mcm9tKG1lbW9EYXRhLCAndXRmLTgnKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSBuZXcgVHJhbnNhY3Rpb24oKS5hZGQoaW5zdHJ1Y3Rpb24pO1xuICAgICAgICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBzZW5kQW5kQ29uZmlybVRyYW5zYWN0aW9uKFxuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uLFxuICAgICAgICAgICAgdHJhbnNhY3Rpb24sXG4gICAgICAgICAgICBbdGhpcy5rZXlwYWlyXSxcbiAgICAgICAgICAgIHsgY29tbWl0bWVudDogJ2NvbmZpcm1lZCcgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IG5ldHdvcmsgPSB0aGlzLmNvbm5lY3Rpb24ucnBjRW5kcG9pbnQuaW5jbHVkZXMoJ2Rldm5ldCcpID8gJ2Rldm5ldCcgOiAnbWFpbm5ldC1iZXRhJztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2lnbmF0dXJlLFxuICAgICAgICAgICAgbmV0d29yayxcbiAgICAgICAgICAgIGNvbW1pdG1lbnQsXG4gICAgICAgICAgICBleHBsb3JlclVybDogYGh0dHBzOi8vZXhwbG9yZXIuc29sYW5hLmNvbS90eC8ke3NpZ25hdHVyZX0/Y2x1c3Rlcj0ke25ldHdvcmt9YFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldFB1YmxpY0tleSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlwYWlyLnB1YmxpY0tleS50b0Jhc2U1OCgpO1xuICAgIH1cbn1cbiJdfQ==