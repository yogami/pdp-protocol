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
    /**
     * Verifies that a given signature exists on-chain and contains expected data.
     */
    async verifyAnchor(signature, expectedHash) {
        try {
            const tx = await this.connection.getTransaction(signature, {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0
            });
            if (!tx)
                return { valid: false };
            // Parse memo data from transaction logs
            const logs = tx.meta?.logMessages || [];
            const memoLog = logs.find(l => l.includes('Program log: Memo'));
            if (!memoLog)
                return { valid: false };
            // Check if the commitment contains our hash
            const memoData = memoLog.split('Memo (len ')[1]?.split('): ')[1];
            if (memoData && memoData.includes(expectedHash.slice(0, 16))) {
                return { valid: true, data: memoData };
            }
            return { valid: false };
        }
        catch (error) {
            console.error('[SolanaAdapter] Verification error:', error);
            return { valid: false };
        }
    }
    getPublicKey() {
        return this.keypair.publicKey.toBase58();
    }
}
exports.SolanaAdapter = SolanaAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU29sYW5hQWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL1NvbGFuYUFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBT3lCO0FBQ3pCLGdEQUF3QjtBQUN4QiwrQ0FBaUM7QUFTakM7O0dBRUc7QUFDSCxNQUFhLGFBQWE7SUFLdEIsWUFBWSxNQUFjLEVBQUUsZ0JBQXdCO1FBRm5DLG9CQUFlLEdBQUcsSUFBSSxtQkFBUyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFHNUYsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLEdBQUcsaUJBQU8sQ0FBQyxhQUFhLENBQUMsY0FBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBZSxFQUFFLE9BQWU7UUFDNUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7YUFDekMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7YUFDdEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRW5CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDNUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxhQUFhO1lBQzVCLENBQUMsRUFBRSxPQUFPLEVBQUssV0FBVztZQUMxQixDQUFDLEVBQUUsR0FBRyxFQUFTLHFCQUFxQjtZQUNwQyxDQUFDLEVBQUUsSUFBSSxDQUFRLHdEQUF3RDtT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bm5lY3Rpb24sXG4gICAgS2V5cGFpcixcbiAgICBQdWJsaWNLZXksXG4gICAgVHJhbnNhY3Rpb24sXG4gICAgVHJhbnNhY3Rpb25JbnN0cnVjdGlvbixcbiAgICBzZW5kQW5kQ29uZmlybVRyYW5zYWN0aW9uLFxufSBmcm9tICdAc29sYW5hL3dlYjMuanMnO1xuaW1wb3J0IGJzNTggZnJvbSAnYnM1OCc7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcblxuZXhwb3J0IGludGVyZmFjZSBBbmNob3JSZXN1bHQge1xuICAgIHNpZ25hdHVyZTogc3RyaW5nO1xuICAgIG5ldHdvcms6IHN0cmluZztcbiAgICBjb21taXRtZW50OiBzdHJpbmc7XG4gICAgZXhwbG9yZXJVcmw6IHN0cmluZztcbn1cblxuLyoqXG4gKiBTb2xhbmFBZGFwdGVyIC0gSGFuZGxlcyBhbmNob3JpbmcgUG9FIGNvbW1pdG1lbnRzIHRvIHRoZSBTb2xhbmEgYmxvY2tjaGFpbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFNvbGFuYUFkYXB0ZXIge1xuICAgIHByaXZhdGUgY29ubmVjdGlvbjogQ29ubmVjdGlvbjtcbiAgICBwcml2YXRlIGtleXBhaXI6IEtleXBhaXI7XG4gICAgcHJpdmF0ZSByZWFkb25seSBNRU1PX1BST0dSQU1fSUQgPSBuZXcgUHVibGljS2V5KCdNZW1vU3E0Z3FBQkFYS2I5NnFuSDhUeXNOY1d4TXlXQ3FYZ0RMR21mY0hyJyk7XG5cbiAgICBjb25zdHJ1Y3RvcihycGNVcmw6IHN0cmluZywgcHJpdmF0ZUtleUJhc2U1ODogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbiA9IG5ldyBDb25uZWN0aW9uKHJwY1VybCwgJ2NvbmZpcm1lZCcpO1xuICAgICAgICB0aGlzLmtleXBhaXIgPSBLZXlwYWlyLmZyb21TZWNyZXRLZXkoYnM1OC5kZWNvZGUocHJpdmF0ZUtleUJhc2U1OCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuY2hvcnMgYSBQb0UgY29tbWl0bWVudCB0byBTb2xhbmEgdmlhIHRoZSBNZW1vIFByb2dyYW0uXG4gICAgICogVXNlcyB0aGUgU2FsdGVkIEhhc2ggQ29tbWl0bWVudCBwYXR0ZXJuIGZyb20gdGhlIE9wZW5DbGF3IGFyY2hpdGVjdHVyZS5cbiAgICAgKi9cbiAgICBhc3luYyBhbmNob3JQb0UocG9lSGFzaDogc3RyaW5nLCBhZ2VudElkOiBzdHJpbmcpOiBQcm9taXNlPEFuY2hvclJlc3VsdD4ge1xuICAgICAgICBjb25zdCBzYWx0ID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDE2KS50b1N0cmluZygnaGV4Jyk7XG4gICAgICAgIGNvbnN0IGNvbW1pdG1lbnQgPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2JylcbiAgICAgICAgICAgIC51cGRhdGUocG9lSGFzaCArIHNhbHQpXG4gICAgICAgICAgICAuZGlnZXN0KCdoZXgnKTtcblxuICAgICAgICBjb25zdCBtZW1vRGF0YSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGM6IGNvbW1pdG1lbnQsIC8vIENvbW1pdG1lbnRcbiAgICAgICAgICAgIGE6IGFnZW50SWQsICAgIC8vIEFnZW50IElEXG4gICAgICAgICAgICB2OiBcIjJcIiwgICAgICAgIC8vIFZlcnNpb24gMiAoU2FsdGVkKVxuICAgICAgICAgICAgczogc2FsdCAgICAgICAgLy8gSW4gcHJvZHVjdGlvbiwgdGhpcyB3b3VsZCBiZSBwYXJ0aWFsbHkgcmV2ZWFsZWQgbGF0ZXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb24gPSBuZXcgVHJhbnNhY3Rpb25JbnN0cnVjdGlvbih7XG4gICAgICAgICAgICBrZXlzOiBbeyBwdWJrZXk6IHRoaXMua2V5cGFpci5wdWJsaWNLZXksIGlzU2lnbmVyOiB0cnVlLCBpc1dyaXRhYmxlOiBmYWxzZSB9XSxcbiAgICAgICAgICAgIHByb2dyYW1JZDogdGhpcy5NRU1PX1BST0dSQU1fSUQsXG4gICAgICAgICAgICBkYXRhOiBCdWZmZXIuZnJvbShtZW1vRGF0YSwgJ3V0Zi04JyksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKCkuYWRkKGluc3RydWN0aW9uKTtcbiAgICAgICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2VuZEFuZENvbmZpcm1UcmFuc2FjdGlvbihcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbixcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uLFxuICAgICAgICAgICAgW3RoaXMua2V5cGFpcl0sXG4gICAgICAgICAgICB7IGNvbW1pdG1lbnQ6ICdjb25maXJtZWQnIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBuZXR3b3JrID0gdGhpcy5jb25uZWN0aW9uLnJwY0VuZHBvaW50LmluY2x1ZGVzKCdkZXZuZXQnKSA/ICdkZXZuZXQnIDogJ21haW5uZXQtYmV0YSc7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNpZ25hdHVyZSxcbiAgICAgICAgICAgIG5ldHdvcmssXG4gICAgICAgICAgICBjb21taXRtZW50LFxuICAgICAgICAgICAgZXhwbG9yZXJVcmw6IGBodHRwczovL2V4cGxvcmVyLnNvbGFuYS5jb20vdHgvJHtzaWduYXR1cmV9P2NsdXN0ZXI9JHtuZXR3b3JrfWBcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWZXJpZmllcyB0aGF0IGEgZ2l2ZW4gc2lnbmF0dXJlIGV4aXN0cyBvbi1jaGFpbiBhbmQgY29udGFpbnMgZXhwZWN0ZWQgZGF0YS5cbiAgICAgKi9cbiAgICBhc3luYyB2ZXJpZnlBbmNob3Ioc2lnbmF0dXJlOiBzdHJpbmcsIGV4cGVjdGVkSGFzaDogc3RyaW5nKTogUHJvbWlzZTx7IHZhbGlkOiBib29sZWFuOyBkYXRhPzogc3RyaW5nIH0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHR4ID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmdldFRyYW5zYWN0aW9uKHNpZ25hdHVyZSwge1xuICAgICAgICAgICAgICAgIGNvbW1pdG1lbnQ6ICdjb25maXJtZWQnLFxuICAgICAgICAgICAgICAgIG1heFN1cHBvcnRlZFRyYW5zYWN0aW9uVmVyc2lvbjogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXR4KSByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcblxuICAgICAgICAgICAgLy8gUGFyc2UgbWVtbyBkYXRhIGZyb20gdHJhbnNhY3Rpb24gbG9nc1xuICAgICAgICAgICAgY29uc3QgbG9ncyA9IHR4Lm1ldGE/LmxvZ01lc3NhZ2VzIHx8IFtdO1xuICAgICAgICAgICAgY29uc3QgbWVtb0xvZyA9IGxvZ3MuZmluZChsID0+IGwuaW5jbHVkZXMoJ1Byb2dyYW0gbG9nOiBNZW1vJykpO1xuICAgICAgICAgICAgaWYgKCFtZW1vTG9nKSByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGNvbW1pdG1lbnQgY29udGFpbnMgb3VyIGhhc2hcbiAgICAgICAgICAgIGNvbnN0IG1lbW9EYXRhID0gbWVtb0xvZy5zcGxpdCgnTWVtbyAobGVuICcpWzFdPy5zcGxpdCgnKTogJylbMV07XG4gICAgICAgICAgICBpZiAobWVtb0RhdGEgJiYgbWVtb0RhdGEuaW5jbHVkZXMoZXhwZWN0ZWRIYXNoLnNsaWNlKDAsIDE2KSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogbWVtb0RhdGEgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1NvbGFuYUFkYXB0ZXJdIFZlcmlmaWNhdGlvbiBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFB1YmxpY0tleSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlwYWlyLnB1YmxpY0tleS50b0Jhc2U1OCgpO1xuICAgIH1cbn1cbiJdfQ==