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
const SovereignNode_1 = require("./SovereignNode");
const dotenv = __importStar(require("dotenv"));
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
dotenv.config();
/**
 * PDP CLI Prototype V2 - Hardened for Solana / Hacker Pitch
 */
async function main() {
    console.log(`
    =========================================
      PDP SOVEREIGN NODE — HARDENED V2
    =========================================
    `);
    // Generate a temporary key if none provided for demo
    let priKey = process.env.SOLANA_PRIVATE_KEY;
    if (!priKey) {
        console.log('⚠️ No SOLANA_PRIVATE_KEY found in .env. Generating temp key for demo...');
        const tempKey = web3_js_1.Keypair.generate();
        priKey = bs58_1.default.encode(tempKey.secretKey);
    }
    const node = new SovereignNode_1.SovereignNode({
        solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        solanaPrivateKey: priKey,
        agentId: process.env.AGENT_ID || `rebel-agent-${Math.floor(Math.random() * 1000)}`,
        beaconRateLimitMs: 5000 // 5 seconds for demo (normally 5 minutes)
    });
    try {
        await node.bootstrap();
        console.log('\n🚀 Peer-to-Peer network active.');
        console.log('📡 Listening for discovery beacons...');
        node.onPeerDiscovered((peer) => {
            const poeHashHex = Buffer.from(peer.poeHash).toString('hex');
            console.log(`\n🔔 DISCOVERED PEER: ${peer.nodeId}`);
            console.log(`   └─ PoE Hash: ${poeHashHex.substring(0, 20)}...`);
            console.log(`   └─ Solana Tx: ${peer.solanaTx || 'N/A'}`);
            console.log(`   └─ Base Tx: ${peer.baseTx || 'N/A'}`);
            console.log(`   └─ Nonce: ${peer.nonce}`);
        });
        // Simulate a "Work and Testify" loop for the demo
        const demoTasks = [
            { id: 'audit-001', data: 'Security Audit: Pass', caps: ['security', 'audit'] },
            { id: 'code-002', data: 'Refactor Complete: 12 files', caps: ['dev', 'refactor'] }
        ];
        for (const task of demoTasks) {
            console.log(`\n🛠️ Executing Task: ${task.id}...`);
            await new Promise(r => setTimeout(r, 2000));
            const beacon = await node.testify(task.id, task.data, task.caps);
            console.log('✅ Proof broadcasted and anchored.');
            console.log(`🔗 Explorer: ${beacon.solanaTx ? `https://explorer.solana.com/tx/${beacon.solanaTx}?cluster=devnet` : 'N/A'}`);
            await new Promise(r => setTimeout(r, 6000)); // Wait past rate limit
        }
        console.log('\n✨ Demo cycle complete. Node will remain online for 60s.');
        await new Promise(r => setTimeout(r, 60000));
        await node.shutdown();
    }
    catch (e) {
        console.error('\n❌ FAILED TO START NODE:', e.message);
    }
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFnRDtBQUVoRCwrQ0FBaUM7QUFDakMsNkNBQTBDO0FBQzFDLGdEQUF3QjtBQUV4QixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFaEI7O0dBRUc7QUFDSCxLQUFLLFVBQVUsSUFBSTtJQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUM7Ozs7S0FJWCxDQUFDLENBQUM7SUFFSCxxREFBcUQ7SUFDckQsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztJQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHlFQUF5RSxDQUFDLENBQUM7UUFDdkYsTUFBTSxPQUFPLEdBQUcsaUJBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQyxNQUFNLEdBQUcsY0FBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELE1BQU0sSUFBSSxHQUFHLElBQUksNkJBQWEsQ0FBQztRQUMzQixZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksK0JBQStCO1FBQzNFLGdCQUFnQixFQUFFLE1BQU07UUFDeEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGVBQWUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUU7UUFDbEYsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLDBDQUEwQztLQUNyRSxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUM7UUFDRCxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUV2QixPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7UUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBRXJELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQW9CLEVBQUUsRUFBRTtZQUMzQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxrREFBa0Q7UUFDbEQsTUFBTSxTQUFTLEdBQUc7WUFDZCxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtZQUM5RSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLDZCQUE2QixFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsRUFBRTtTQUNyRixDQUFDO1FBRUYsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRCxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRTVDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztZQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxrQ0FBa0MsTUFBTSxDQUFDLFFBQVEsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFFNUgsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLHVCQUF1QjtRQUN4RSxDQUFDO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQywyREFBMkQsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDN0MsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFMUIsQ0FBQztJQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7UUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRCxDQUFDO0FBQ0wsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU292ZXJlaWduTm9kZSB9IGZyb20gJy4vU292ZXJlaWduTm9kZSc7XG5pbXBvcnQgeyBQb0VCZWFjb25Qcm90byB9IGZyb20gJy4vZGlzY292ZXJ5L0dvc3NpcE5vZGUnO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBLZXlwYWlyIH0gZnJvbSAnQHNvbGFuYS93ZWIzLmpzJztcbmltcG9ydCBiczU4IGZyb20gJ2JzNTgnO1xuXG5kb3RlbnYuY29uZmlnKCk7XG5cbi8qKlxuICogUERQIENMSSBQcm90b3R5cGUgVjIgLSBIYXJkZW5lZCBmb3IgU29sYW5hIC8gSGFja2VyIFBpdGNoXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4gICAgY29uc29sZS5sb2coYFxuICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICBQRFAgU09WRVJFSUdOIE5PREUg4oCUIEhBUkRFTkVEIFYyXG4gICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBgKTtcblxuICAgIC8vIEdlbmVyYXRlIGEgdGVtcG9yYXJ5IGtleSBpZiBub25lIHByb3ZpZGVkIGZvciBkZW1vXG4gICAgbGV0IHByaUtleSA9IHByb2Nlc3MuZW52LlNPTEFOQV9QUklWQVRFX0tFWTtcbiAgICBpZiAoIXByaUtleSkge1xuICAgICAgICBjb25zb2xlLmxvZygn4pqg77iPIE5vIFNPTEFOQV9QUklWQVRFX0tFWSBmb3VuZCBpbiAuZW52LiBHZW5lcmF0aW5nIHRlbXAga2V5IGZvciBkZW1vLi4uJyk7XG4gICAgICAgIGNvbnN0IHRlbXBLZXkgPSBLZXlwYWlyLmdlbmVyYXRlKCk7XG4gICAgICAgIHByaUtleSA9IGJzNTguZW5jb2RlKHRlbXBLZXkuc2VjcmV0S2V5KTtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlID0gbmV3IFNvdmVyZWlnbk5vZGUoe1xuICAgICAgICBzb2xhbmFScGNVcmw6IHByb2Nlc3MuZW52LlNPTEFOQV9SUENfVVJMIHx8ICdodHRwczovL2FwaS5kZXZuZXQuc29sYW5hLmNvbScsXG4gICAgICAgIHNvbGFuYVByaXZhdGVLZXk6IHByaUtleSxcbiAgICAgICAgYWdlbnRJZDogcHJvY2Vzcy5lbnYuQUdFTlRfSUQgfHwgYHJlYmVsLWFnZW50LSR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMCl9YCxcbiAgICAgICAgYmVhY29uUmF0ZUxpbWl0TXM6IDUwMDAgLy8gNSBzZWNvbmRzIGZvciBkZW1vIChub3JtYWxseSA1IG1pbnV0ZXMpXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBub2RlLmJvb3RzdHJhcCgpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG7wn5qAIFBlZXItdG8tUGVlciBuZXR3b3JrIGFjdGl2ZS4nKTtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfk6EgTGlzdGVuaW5nIGZvciBkaXNjb3ZlcnkgYmVhY29ucy4uLicpO1xuXG4gICAgICAgIG5vZGUub25QZWVyRGlzY292ZXJlZCgocGVlcjogUG9FQmVhY29uUHJvdG8pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvZUhhc2hIZXggPSBCdWZmZXIuZnJvbShwZWVyLnBvZUhhc2gpLnRvU3RyaW5nKCdoZXgnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBcXG7wn5SUIERJU0NPVkVSRUQgUEVFUjogJHtwZWVyLm5vZGVJZH1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgICDilJTilIAgUG9FIEhhc2g6ICR7cG9lSGFzaEhleC5zdWJzdHJpbmcoMCwgMjApfS4uLmApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCAgIOKUlOKUgCBTb2xhbmEgVHg6ICR7cGVlci5zb2xhbmFUeCB8fCAnTi9BJ31gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgICDilJTilIAgQmFzZSBUeDogJHtwZWVyLmJhc2VUeCB8fCAnTi9BJ31gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgICDilJTilIAgTm9uY2U6ICR7cGVlci5ub25jZX1gKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU2ltdWxhdGUgYSBcIldvcmsgYW5kIFRlc3RpZnlcIiBsb29wIGZvciB0aGUgZGVtb1xuICAgICAgICBjb25zdCBkZW1vVGFza3MgPSBbXG4gICAgICAgICAgICB7IGlkOiAnYXVkaXQtMDAxJywgZGF0YTogJ1NlY3VyaXR5IEF1ZGl0OiBQYXNzJywgY2FwczogWydzZWN1cml0eScsICdhdWRpdCddIH0sXG4gICAgICAgICAgICB7IGlkOiAnY29kZS0wMDInLCBkYXRhOiAnUmVmYWN0b3IgQ29tcGxldGU6IDEyIGZpbGVzJywgY2FwczogWydkZXYnLCAncmVmYWN0b3InXSB9XG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIGRlbW9UYXNrcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFxcbvCfm6DvuI8gRXhlY3V0aW5nIFRhc2s6ICR7dGFzay5pZH0uLi5gKTtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAyMDAwKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGJlYWNvbiA9IGF3YWl0IG5vZGUudGVzdGlmeSh0YXNrLmlkLCB0YXNrLmRhdGEsIHRhc2suY2Fwcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn4pyFIFByb29mIGJyb2FkY2FzdGVkIGFuZCBhbmNob3JlZC4nKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDwn5SXIEV4cGxvcmVyOiAke2JlYWNvbi5zb2xhbmFUeCA/IGBodHRwczovL2V4cGxvcmVyLnNvbGFuYS5jb20vdHgvJHtiZWFjb24uc29sYW5hVHh9P2NsdXN0ZXI9ZGV2bmV0YCA6ICdOL0EnfWApO1xuXG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNjAwMCkpOyAvLyBXYWl0IHBhc3QgcmF0ZSBsaW1pdFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1xcbuKcqCBEZW1vIGN5Y2xlIGNvbXBsZXRlLiBOb2RlIHdpbGwgcmVtYWluIG9ubGluZSBmb3IgNjBzLicpO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNjAwMDApKTtcbiAgICAgICAgYXdhaXQgbm9kZS5zaHV0ZG93bigpO1xuXG4gICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1xcbuKdjCBGQUlMRUQgVE8gU1RBUlQgTk9ERTonLCBlLm1lc3NhZ2UpO1xuICAgIH1cbn1cblxubWFpbigpO1xuIl19