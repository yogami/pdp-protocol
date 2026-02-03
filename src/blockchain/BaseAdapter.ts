import { ethers } from 'ethers';
import * as crypto from 'crypto';

export interface BaseAnchorResult {
    txHash: string;
    network: string;
    commitment: string;
    explorerUrl: string;
}

/**
 * BaseAdapter - Handles anchoring PoE commitments to the Base L2 (EVM).
 */
export class BaseAdapter {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;

    constructor(rpcUrl: string, privateKey: string) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
    }

    async anchorPoE(poeHash: string, agentId: string): Promise<BaseAnchorResult> {
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

        const data = ethers.hexlify(ethers.toUtf8Bytes(metadata));

        const tx = await this.wallet.sendTransaction({
            to: this.wallet.address,
            data: data
        });

        const receipt = await tx.wait();
        if (!receipt) throw new Error("Base anchoring failed: No receipt");

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

    getWalletAddress(): string {
        return this.wallet.address;
    }
}
