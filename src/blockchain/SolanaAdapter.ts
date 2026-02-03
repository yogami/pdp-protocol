import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import * as crypto from 'crypto';

export interface AnchorResult {
    signature: string;
    network: string;
    commitment: string;
    explorerUrl: string;
}

/**
 * SolanaAdapter - Handles anchoring PoE commitments to the Solana blockchain.
 */
export class SolanaAdapter {
    private connection: Connection;
    private keypair: Keypair;
    private readonly MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

    constructor(rpcUrl: string, privateKeyBase58: string) {
        this.connection = new Connection(rpcUrl, 'confirmed');
        this.keypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
    }

    /**
     * Anchors a PoE commitment to Solana via the Memo Program.
     * Uses the Salted Hash Commitment pattern from the OpenClaw architecture.
     */
    async anchorPoE(poeHash: string, agentId: string): Promise<AnchorResult> {
        const salt = crypto.randomBytes(16).toString('hex');
        const commitment = crypto.createHash('sha256')
            .update(poeHash + salt)
            .digest('hex');

        const memoData = JSON.stringify({
            c: commitment, // Commitment
            a: agentId,    // Agent ID
            v: "2",        // Version 2 (Salted)
            s: salt        // In production, this would be partially revealed later
        });

        const instruction = new TransactionInstruction({
            keys: [{ pubkey: this.keypair.publicKey, isSigner: true, isWritable: false }],
            programId: this.MEMO_PROGRAM_ID,
            data: Buffer.from(memoData, 'utf-8'),
        });

        const transaction = new Transaction().add(instruction);
        const signature = await sendAndConfirmTransaction(
            this.connection,
            transaction,
            [this.keypair],
            { commitment: 'confirmed' }
        );

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
    async verifyAnchor(signature: string, expectedHash: string): Promise<{ valid: boolean; data?: string }> {
        try {
            const tx = await this.connection.getTransaction(signature, {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0
            });
            if (!tx) return { valid: false };

            // Parse memo data from transaction logs
            const logs = tx.meta?.logMessages || [];
            const memoLog = logs.find(l => l.includes('Program log: Memo'));
            if (!memoLog) return { valid: false };

            // Check if the commitment contains our hash
            const memoData = memoLog.split('Memo (len ')[1]?.split('): ')[1];
            if (memoData && memoData.includes(expectedHash.slice(0, 16))) {
                return { valid: true, data: memoData };
            }
            return { valid: false };
        } catch (error) {
            console.error('[SolanaAdapter] Verification error:', error);
            return { valid: false };
        }
    }

    getPublicKey(): string {
        return this.keypair.publicKey.toBase58();
    }
}
