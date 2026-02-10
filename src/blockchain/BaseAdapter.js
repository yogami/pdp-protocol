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
