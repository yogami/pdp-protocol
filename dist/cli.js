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
            // Action ID, Task ID, Data, Capabilities
            const beacon = await node.testify(task.id, task.id, task.data, task.caps);
            console.log('✅ Proof broadcasted and anchored.');
            const tx = beacon.anchor?.anchorId;
            console.log(`🔗 Explorer: ${tx ? `https://explorer.solana.com/tx/${tx}?cluster=devnet` : 'N/A'}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFnRDtBQUVoRCwrQ0FBaUM7QUFDakMsNkNBQTBDO0FBQzFDLGdEQUF3QjtBQUV4QixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFaEI7O0dBRUc7QUFDSCxLQUFLLFVBQVUsSUFBSTtJQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUM7Ozs7S0FJWCxDQUFDLENBQUM7SUFFSCxxREFBcUQ7SUFDckQsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztJQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHlFQUF5RSxDQUFDLENBQUM7UUFDdkYsTUFBTSxPQUFPLEdBQUcsaUJBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQyxNQUFNLEdBQUcsY0FBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELE1BQU0sSUFBSSxHQUFHLElBQUksNkJBQWEsQ0FBQztRQUMzQixZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksK0JBQStCO1FBQzNFLGdCQUFnQixFQUFFLE1BQU07UUFDeEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGVBQWUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUU7UUFDbEYsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLDBDQUEwQztLQUNyRSxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUM7UUFDRCxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUV2QixPQUFPLENBQUMsR0FBRyxDQUFDLG1D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cm9tICcuL1NvdmVyZWlnbk5vZGUnO1xuaW1wb3J0IHsgUG9FQmVhY29uUHJvdG8gfSBmcm9tICcuL2Rpc2NvdmVyeS9Hb3NzaXBOb2RlJztcbmltcG9ydCAqIGFzIGRvdGVudiBmcm9tICdkb3RlbnYnO1xuaW1wb3J0IHsgS2V5cGFpciB9IGZyb20gJ0Bzb2xhbmEvd2ViMy5qcyc7XG5pbXBvcnQgYnM1OCBmcm9tICdiczU4JztcblxuZG90ZW52LmNvbmZpZygpO1xuXG4vKipcbiAqIFBEUCBDTEkgUHJvdG90eXBlIFYyIC0gSGFyZGVuZWQgZm9yIFNvbGFuYSAvIEhhY2tlciBQaXRjaFxuICovXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICAgIGNvbnNvbGUubG9nKGBcbiAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgUERQIFNPVkVSRUlHTiBOT0RFIOKAlCBIQVJERU5FRCBWMlxuICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgYCk7XG5cbiAgICAvLyBHZW5lcmF0ZSBhIHRlbXBvcmFyeSBrZXkgaWYgbm9uZSBwcm92aWRlZCBmb3IgZGVtb1xuICAgIGxldCBwcmlLZXkgPSBwcm9jZXNzLmVudi5TT0xBTkFfUFJJVkFURV9LRVk7XG4gICAgaWYgKCFwcmlLZXkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+KaoO+4jyBObyBTT0xBTkFfUFJJVkFURV9LRVkgZm91bmQgaW4gLmVudi4gR2VuZXJhdGluZyB0ZW1wIGtleSBmb3IgZGVtby4uLicpO1xuICAgICAgICBjb25zdCB0ZW1wS2V5ID0gS2V5cGFpci5nZW5lcmF0ZSgpO1xuICAgICAgICBwcmlLZXkgPSBiczU4LmVuY29kZSh0ZW1wS2V5LnNlY3JldEtleSk7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IG5ldyBTb3ZlcmVpZ25Ob2RlKHtcbiAgICAgICAgc29sYW5hUnBjVXJsOiBwcm9jZXNzLmVudi5TT0xBTkFfUlBDX1VSTCB8fCAnaHR0cHM6Ly9hcGkuZGV2bmV0LnNvbGFuYS5jb20nLFxuICAgICAgICBzb2xhbmFQcml2YXRlS2V5OiBwcmlLZXksXG4gICAgICAgIGFnZW50SWQ6IHByb2Nlc3MuZW52LkFHRU5UX0lEIHx8IGByZWJlbC1hZ2VudC0ke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDApfWAsXG4gICAgICAgIGJlYWNvblJhdGVMaW1pdE1zOiA1MDAwIC8vIDUgc2Vjb25kcyBmb3IgZGVtbyAobm9ybWFsbHkgNSBtaW51dGVzKVxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbm9kZS5ib290c3RyYXAoKTtcblxuICAgICAgICBjb25zb2xlLmxvZygnXFxu8J+agCBQZWVyLXRvLVBlZXIgbmV0d29yayBhY3RpdmUuJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5OhIExpc3RlbmluZyBmb3IgZGlzY292ZXJ5IGJlYWNvbnMuLi4nKTtcblxuICAgICAgICBub2RlLm9uUGVlckRpc2NvdmVyZWQoKHBlZXI6IFBvRUJlYWNvblByb3RvKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb2VIYXNoSGV4ID0gQnVmZmVyLmZyb20ocGVlci5wb2VIYXNoKS50b1N0cmluZygnaGV4Jyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXFxu8J+UlCBESVNDT1ZFUkVEIFBFRVI6ICR7cGVlci5ub2RlSWR9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgICAg4pSU4pSAIFBvRSBIYXNoOiAke3BvZUhhc2hIZXguc3Vic3RyaW5nKDAsIDIwKX0uLi5gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgICDilJTilIAgU29sYW5hIFR4OiAke3BlZXIuc29sYW5hVHggfHwgJ04vQSd9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgICAg4pSU4pSAIEJhc2UgVHg6ICR7cGVlci5iYXNlVHggfHwgJ04vQSd9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgICAg4pSU4pSAIE5vbmNlOiAke3BlZXIubm9uY2V9YCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNpbXVsYXRlIGEgXCJXb3JrIGFuZCBUZXN0aWZ5XCIgbG9vcCBmb3IgdGhlIGRlbW9cbiAgICAgICAgY29uc3QgZGVtb1Rhc2tzID0gW1xuICAgICAgICAgICAgeyBpZDogJ2F1ZGl0LTAwMScsIGRhdGE6ICdTZWN1cml0eSBBdWRpdDogUGFzcycsIGNhcHM6IFsnc2VjdXJpdHknLCAnYXVkaXQnXSB9LFxuICAgICAgICAgICAgeyBpZDogJ2NvZGUtMDAyJywgZGF0YTogJ1JlZmFjdG9yIENvbXBsZXRlOiAxMiBmaWxlcycsIGNhcHM6IFsnZGV2JywgJ3JlZmFjdG9yJ10gfVxuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGFzayBvZiBkZW1vVGFza3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBcXG7wn5ug77iPIEV4ZWN1dGluZyBUYXNrOiAke3Rhc2suaWR9Li4uYCk7XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMjAwMCkpO1xuXG4gICAgICAgICAgICAvLyBBY3Rpb24gSUQsIFRhc2sgSUQsIERhdGEsIENhcGFiaWxpdGllc1xuICAgICAgICAgICAgY29uc3QgYmVhY29uID0gYXdhaXQgbm9kZS50ZXN0aWZ5KHRhc2suaWQsIHRhc2suaWQsIHRhc2suZGF0YSwgdGFzay5jYXBzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfinIUgUHJvb2YgYnJvYWRjYXN0ZWQgYW5kIGFuY2hvcmVkLicpO1xuICAgICAgICAgICAgY29uc3QgdHggPSBiZWFjb24uYW5jaG9yPy5hbmNob3JJZDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDwn5SXIEV4cGxvcmVyOiAke3R4ID8gYGh0dHBzOi8vZXhwbG9yZXIuc29sYW5hLmNvbS90eC8ke3R4fT9jbHVzdGVyPWRldm5ldGAgOiAnTi9BJ31gKTtcblxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDYwMDApKTsgLy8gV2FpdCBwYXN0IHJhdGUgbGltaXRcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG7inKggRGVtbyBjeWNsZSBjb21wbGV0ZS4gTm9kZSB3aWxsIHJlbWFpbiBvbmxpbmUgZm9yIDYwcy4nKTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDYwMDAwKSk7XG4gICAgICAgIGF3YWl0IG5vZGUuc2h1dGRvd24oKTtcblxuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdcXG7inYwgRkFJTEVEIFRPIFNUQVJUIE5PREU6JywgZS5tZXNzYWdlKTtcbiAgICB9XG59XG5cbm1haW4oKTtcbiJdfQ==