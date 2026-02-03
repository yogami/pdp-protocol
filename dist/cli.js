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
 * PDP CLI Prototype - For the Solana / Hacker Pitch
 */
async function main() {
    console.log(`
    =========================================
      PDP SOVEREIGN NODE — PROTOTYPE V2
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
        veracityScore: 0.85
    });
    try {
        await node.bootstrap();
        console.log('\n🚀 Peer-to-Peer network active.');
        console.log('📡 Listening for discovery beacons...');
        node.onPeerDiscovered((peer) => {
            console.log(`\n🔔 DISCOVERED PEER: ${peer.agentId}`);
            console.log(`   └─ PoE Hash: ${peer.poeHash.substring(0, 20)}...`);
            console.log(`   └─ Solana Tx: ${peer.solanaTx}`);
            console.log(`   └─ Veracity: ${peer.veracity}`);
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
            await new Promise(r => setTimeout(r, 5000));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFnRDtBQUNoRCwrQ0FBaUM7QUFDakMsNkNBQTBDO0FBQzFDLGdEQUF3QjtBQUV4QixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFaEI7O0dBRUc7QUFDSCxLQUFLLFVBQVUsSUFBSTtJQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUM7Ozs7S0FJWCxDQUFDLENBQUM7SUFFSCxxREFBcUQ7SUFDckQsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztJQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHlFQUF5RSxDQUFDLENBQUM7UUFDdkYsTUFBTSxPQUFPLEdBQUcsaUJBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQyxNQUFNLEdBQUcsY0FBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELE1BQU0sSUFBSSxHQUFHLElBQUksNkJBQWEsQ0FBQztRQUMzQixZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksK0JBQStCO1FBQzNFLGdCQUFnQixFQUFFLE1BQU07UUFDeEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGVBQWUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUU7UUFDbEYsYUFBYSxFQUFFLElBQUk7S0FDdEIsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDO1FBQ0QsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25FLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO1FBRUgsa0RBQWtEO1FBQ2xELE1BQU0sU0FBUyxHQUFHO1lBQ2QsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDOUUsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSw2QkFBNkIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLEVBQUU7U0FDckYsQ0FBQztRQUVGLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxFQUFFLENBQUM7WUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkQsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUU1QyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7WUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsa0NBQWtDLE1BQU0sQ0FBQyxRQUFRLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRTVILE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkRBQTJELENBQUMsQ0FBQztRQUN6RSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRTFCLENBQUM7SUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1FBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztBQUNMLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNvdmVyZWlnbk5vZGUgfSBmcm9tICcuL1NvdmVyZWlnbk5vZGUnO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBLZXlwYWlyIH0gZnJvbSAnQHNvbGFuYS93ZWIzLmpzJztcbmltcG9ydCBiczU4IGZyb20gJ2JzNTgnO1xuXG5kb3RlbnYuY29uZmlnKCk7XG5cbi8qKlxuICogUERQIENMSSBQcm90b3R5cGUgLSBGb3IgdGhlIFNvbGFuYSAvIEhhY2tlciBQaXRjaFxuICovXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICAgIGNvbnNvbGUubG9nKGBcbiAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgUERQIFNPVkVSRUlHTiBOT0RFIOKAlCBQUk9UT1RZUEUgVjJcbiAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGApO1xuXG4gICAgLy8gR2VuZXJhdGUgYSB0ZW1wb3Jhcnkga2V5IGlmIG5vbmUgcHJvdmlkZWQgZm9yIGRlbW9cbiAgICBsZXQgcHJpS2V5ID0gcHJvY2Vzcy5lbnYuU09MQU5BX1BSSVZBVEVfS0VZO1xuICAgIGlmICghcHJpS2V5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfimqDvuI8gTm8gU09MQU5BX1BSSVZBVEVfS0VZIGZvdW5kIGluIC5lbnYuIEdlbmVyYXRpbmcgdGVtcCBrZXkgZm9yIGRlbW8uLi4nKTtcbiAgICAgICAgY29uc3QgdGVtcEtleSA9IEtleXBhaXIuZ2VuZXJhdGUoKTtcbiAgICAgICAgcHJpS2V5ID0gYnM1OC5lbmNvZGUodGVtcEtleS5zZWNyZXRLZXkpO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGUgPSBuZXcgU292ZXJlaWduTm9kZSh7XG4gICAgICAgIHNvbGFuYVJwY1VybDogcHJvY2Vzcy5lbnYuU09MQU5BX1JQQ19VUkwgfHwgJ2h0dHBzOi8vYXBpLmRldm5ldC5zb2xhbmEuY29tJyxcbiAgICAgICAgc29sYW5hUHJpdmF0ZUtleTogcHJpS2V5LFxuICAgICAgICBhZ2VudElkOiBwcm9jZXNzLmVudi5BR0VOVF9JRCB8fCBgcmViZWwtYWdlbnQtJHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwKX1gLFxuICAgICAgICB2ZXJhY2l0eVNjb3JlOiAwLjg1XG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBub2RlLmJvb3RzdHJhcCgpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG7wn5qAIFBlZXItdG8tUGVlciBuZXR3b3JrIGFjdGl2ZS4nKTtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfk6EgTGlzdGVuaW5nIGZvciBkaXNjb3ZlcnkgYmVhY29ucy4uLicpO1xuXG4gICAgICAgIG5vZGUub25QZWVyRGlzY292ZXJlZCgocGVlcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFxcbvCflJQgRElTQ09WRVJFRCBQRUVSOiAke3BlZXIuYWdlbnRJZH1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgICDilJTilIAgUG9FIEhhc2g6ICR7cGVlci5wb2VIYXNoLnN1YnN0cmluZygwLCAyMCl9Li4uYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgICAg4pSU4pSAIFNvbGFuYSBUeDogJHtwZWVyLnNvbGFuYVR4fWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCAgIOKUlOKUgCBWZXJhY2l0eTogJHtwZWVyLnZlcmFjaXR5fWApO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTaW11bGF0ZSBhIFwiV29yayBhbmQgVGVzdGlmeVwiIGxvb3AgZm9yIHRoZSBkZW1vXG4gICAgICAgIGNvbnN0IGRlbW9UYXNrcyA9IFtcbiAgICAgICAgICAgIHsgaWQ6ICdhdWRpdC0wMDEnLCBkYXRhOiAnU2VjdXJpdHkgQXVkaXQ6IFBhc3MnLCBjYXBzOiBbJ3NlY3VyaXR5JywgJ2F1ZGl0J10gfSxcbiAgICAgICAgICAgIHsgaWQ6ICdjb2RlLTAwMicsIGRhdGE6ICdSZWZhY3RvciBDb21wbGV0ZTogMTIgZmlsZXMnLCBjYXBzOiBbJ2RldicsICdyZWZhY3RvciddIH1cbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgZGVtb1Rhc2tzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXFxu8J+boO+4jyBFeGVjdXRpbmcgVGFzazogJHt0YXNrLmlkfS4uLmApO1xuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDIwMDApKTtcblxuICAgICAgICAgICAgY29uc3QgYmVhY29uID0gYXdhaXQgbm9kZS50ZXN0aWZ5KHRhc2suaWQsIHRhc2suZGF0YSwgdGFzay5jYXBzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfinIUgUHJvb2YgYnJvYWRjYXN0ZWQgYW5kIGFuY2hvcmVkLicpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYPCflJcgRXhwbG9yZXI6ICR7YmVhY29uLnNvbGFuYVR4ID8gYGh0dHBzOi8vZXhwbG9yZXIuc29sYW5hLmNvbS90eC8ke2JlYWNvbi5zb2xhbmFUeH0/Y2x1c3Rlcj1kZXZuZXRgIDogJ04vQSd9YCk7XG5cbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygnXFxu4pyoIERlbW8gY3ljbGUgY29tcGxldGUuIE5vZGUgd2lsbCByZW1haW4gb25saW5lIGZvciA2MHMuJyk7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA2MDAwMCkpO1xuICAgICAgICBhd2FpdCBub2RlLnNodXRkb3duKCk7XG5cbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignXFxu4p2MIEZBSUxFRCBUTyBTVEFSVCBOT0RFOicsIGUubWVzc2FnZSk7XG4gICAgfVxufVxuXG5tYWluKCk7XG4iXX0=