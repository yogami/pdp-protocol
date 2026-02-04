"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AaaS = void 0;
const SolanaAdapter_1 = require("./SolanaAdapter");
/**
 * Anchor-as-a-Service (AaaS)
 * Provides a managed interface for anchoring PoE claims to the blockchain.
 */
class AaaS {
    constructor() {
        this.solana = null;
        const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
        const privateKey = process.env.SOLANA_PRIVATE_KEY;
        if (privateKey) {
            this.solana = new SolanaAdapter_1.SolanaAdapter(rpcUrl, privateKey);
            console.log(`[AaaS] Initialized with wallet: ${this.solana.getPublicKey()}`);
        }
        else {
            console.warn('[AaaS] No SOLANA_PRIVATE_KEY found. Anchoring will be simulated.');
        }
    }
    /**
     * managedAnchor - Anchors a hash with managed retries and fee handling.
     */
    async managedAnchor(poeHash, agentId) {
        console.log(`[AaaS] Requesting anchor for ${agentId} (Hash: ${poeHash.substring(0, 10)}...)`);
        if (this.solana) {
            try {
                return await this.solana.anchorPoE(poeHash, agentId);
            }
            catch (error) {
                console.error(`[AaaS] Anchoring failed:`, error);
                throw new Error('Blockchain anchoring failed. Please try again.');
            }
        }
        // Simulating the result if no key is provided
        console.log(`[AaaS] SIMULATION: Anchoring ${poeHash} for ${agentId}`);
        const fakeSig = 'fake_sig_' + Math.random().toString(36).substring(7);
        return {
            signature: fakeSig,
            network: 'simulated',
            commitment: 'sha256:simulated_commitment',
            explorerUrl: `https://explorer.solana.com/tx/${fakeSig}?cluster=devnet`
        };
    }
    /**
     * verifyManagedAnchor - Verifies a managed anchor.
     */
    async verifyManagedAnchor(signature, expectedHash) {
        if (this.solana) {
            const result = await this.solana.verifyAnchor(signature, expectedHash);
            return result.valid;
        }
        return signature.startsWith('fake_sig_');
    }
}
exports.AaaS = AaaS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWFhUy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL0FhYVMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbURBQThEO0FBRTlEOzs7R0FHRztBQUNILE1BQWEsSUFBSTtJQUdiO1FBRlEsV0FBTSxHQUF5QixJQUFJLENBQUM7UUFHeEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksK0JBQStCLENBQUM7UUFDN0UsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztRQUVsRCxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLDZCQUFhLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7YUFBTSxDQUFDO1lBQ0osT0FBTyxDQUFDLElBQUksQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQWUsRUFBRSxPQUFlO1FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLE9BQU8sV0FBVyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFOUYsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUM7Z0JBQ0QsT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN6RCxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7WUFDdEUsQ0FBQztRQUNMLENBQUM7UUFFRCw4Q0FBOEM7UUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsT0FBTyxRQUFRLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDdEUsTUFBTSxPQUFPLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLE9BQU87WUFDSCxTQUFTLEVBQUUsT0FBTztZQUNsQixPQUFPLEVBQUUsV0FBVztZQUNwQixVQUFVLEVBQUUsNkJBQTZCO1lBQ3pDLFdBQVcsRUFBRSxrQ0FBa0MsT0FBTyxpQkFBaUI7U0FDMUUsQ0FBQztJQUNOLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFpQixFQUFFLFlBQW9CO1FBQzdELElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDdkUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxPQUFPLFNBQVMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUNKO0FBbkRELG9CQW1EQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNvbGFuYUFkYXB0ZXIsIEFuY2hvclJlc3VsdCB9IGZyb20gJy4vU29sYW5hQWRhcHRlcic7XG5cbi8qKlxuICogQW5jaG9yLWFzLWEtU2VydmljZSAoQWFhUylcbiAqIFByb3ZpZGVzIGEgbWFuYWdlZCBpbnRlcmZhY2UgZm9yIGFuY2hvcmluZyBQb0UgY2xhaW1zIHRvIHRoZSBibG9ja2NoYWluLlxuICovXG5leHBvcnQgY2xhc3MgQWFhUyB7XG4gICAgcHJpdmF0ZSBzb2xhbmE6IFNvbGFuYUFkYXB0ZXIgfCBudWxsID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBycGNVcmwgPSBwcm9jZXNzLmVudi5TT0xBTkFfUlBDX1VSTCB8fCAnaHR0cHM6Ly9hcGkuZGV2bmV0LnNvbGFuYS5jb20nO1xuICAgICAgICBjb25zdCBwcml2YXRlS2V5ID0gcHJvY2Vzcy5lbnYuU09MQU5BX1BSSVZBVEVfS0VZO1xuXG4gICAgICAgIGlmIChwcml2YXRlS2V5KSB7XG4gICAgICAgICAgICB0aGlzLnNvbGFuYSA9IG5ldyBTb2xhbmFBZGFwdGVyKHJwY1VybCwgcHJpdmF0ZUtleSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW0FhYVNdIEluaXRpYWxpemVkIHdpdGggd2FsbGV0OiAke3RoaXMuc29sYW5hLmdldFB1YmxpY0tleSgpfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbQWFhU10gTm8gU09MQU5BX1BSSVZBVEVfS0VZIGZvdW5kLiBBbmNob3Jpbmcgd2lsbCBiZSBzaW11bGF0ZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBtYW5hZ2VkQW5jaG9yIC0gQW5jaG9ycyBhIGhhc2ggd2l0aCBtYW5hZ2VkIHJldHJpZXMgYW5kIGZlZSBoYW5kbGluZy5cbiAgICAgKi9cbiAgICBhc3luYyBtYW5hZ2VkQW5jaG9yKHBvZUhhc2g6IHN0cmluZywgYWdlbnRJZDogc3RyaW5nKTogUHJvbWlzZTxBbmNob3JSZXN1bHQ+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFtBYWFTXSBSZXF1ZXN0aW5nIGFuY2hvciBmb3IgJHthZ2VudElkfSAoSGFzaDogJHtwb2VIYXNoLnN1YnN0cmluZygwLCAxMCl9Li4uKWApO1xuXG4gICAgICAgIGlmICh0aGlzLnNvbGFuYSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zb2xhbmEuYW5jaG9yUG9FKHBvZUhhc2gsIGFnZW50SWQpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbQWFhU10gQW5jaG9yaW5nIGZhaWxlZDpgLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCbG9ja2NoYWluIGFuY2hvcmluZyBmYWlsZWQuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTaW11bGF0aW5nIHRoZSByZXN1bHQgaWYgbm8ga2V5IGlzIHByb3ZpZGVkXG4gICAgICAgIGNvbnNvbGUubG9nKGBbQWFhU10gU0lNVUxBVElPTjogQW5jaG9yaW5nICR7cG9lSGFzaH0gZm9yICR7YWdlbnRJZH1gKTtcbiAgICAgICAgY29uc3QgZmFrZVNpZyA9ICdmYWtlX3NpZ18nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2lnbmF0dXJlOiBmYWtlU2lnLFxuICAgICAgICAgICAgbmV0d29yazogJ3NpbXVsYXRlZCcsXG4gICAgICAgICAgICBjb21taXRtZW50OiAnc2hhMjU2OnNpbXVsYXRlZF9jb21taXRtZW50JyxcbiAgICAgICAgICAgIGV4cGxvcmVyVXJsOiBgaHR0cHM6Ly9leHBsb3Jlci5zb2xhbmEuY29tL3R4LyR7ZmFrZVNpZ30/Y2x1c3Rlcj1kZXZuZXRgXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdmVyaWZ5TWFuYWdlZEFuY2hvciAtIFZlcmlmaWVzIGEgbWFuYWdlZCBhbmNob3IuXG4gICAgICovXG4gICAgYXN5bmMgdmVyaWZ5TWFuYWdlZEFuY2hvcihzaWduYXR1cmU6IHN0cmluZywgZXhwZWN0ZWRIYXNoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgaWYgKHRoaXMuc29sYW5hKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnNvbGFuYS52ZXJpZnlBbmNob3Ioc2lnbmF0dXJlLCBleHBlY3RlZEhhc2gpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC52YWxpZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2lnbmF0dXJlLnN0YXJ0c1dpdGgoJ2Zha2Vfc2lnXycpO1xuICAgIH1cbn1cbiJdfQ==