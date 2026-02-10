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
