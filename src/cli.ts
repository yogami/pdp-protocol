import { SovereignNode } from './SovereignNode';
import * as dotenv from 'dotenv';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

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
        const tempKey = Keypair.generate();
        priKey = bs58.encode(tempKey.secretKey);
    }

    const node = new SovereignNode({
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

    } catch (e: any) {
        console.error('\n❌ FAILED TO START NODE:', e.message);
    }
}

main();
