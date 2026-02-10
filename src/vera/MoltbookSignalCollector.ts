
import { SovereignNode } from '../SovereignNode';
import { ProofOfExecution } from './types';
import axios from 'axios';

/**
 * Maps VERA ProofOfExecution to Distributional Safety PoEClaim
 * (Bridge between VERA Protocol and VeracityScoreService)
 */
function mapPoEToClaim(poe: ProofOfExecution): any {
    return {
        id: poe.actionId,
        agent_id: poe.agentDid.replace('did:web:', ''), // Extract ID
        task_hash: poe.action.target, // Mapping target to task_hash
        output_hash: poe.action.resultHash,
        timestamp: new Date(poe.timestamp.agentClock).getTime(),
        valid_until: new Date(poe.timestamp.agentClock).getTime() + (7 * 24 * 60 * 60 * 1000), // Default 7 days
        capabilities_used: poe.action.parameters?.capabilities || [],
        signature: poe.signature
    };
}

export class MoltbookSignalCollector {
    private processedIds = new Set<string>();

    constructor(
        private node: SovereignNode,
        private intakeUrl: string
    ) { }

    start() {
        console.log(`[MOLTBOOK-COLLECTOR] 📡 Listening for VERA signals to forward to ${this.intakeUrl}`);

        // Listen to verified peers (which implies valid signature)
        this.node.onPeerDiscovered(async (beacon) => {
            // Note: GossipNode exposes 'beacon', but for full PoE we might need to fetch data or parse payload
            // In VERA Phase 2, the beacon CONTAINS the payload if veraPayload is present.

            if (beacon.veraPayload && beacon.veraPayload.length > 0) {
                try {
                    const poeJson = Buffer.from(beacon.veraPayload).toString('utf-8');
                    const poe = JSON.parse(poeJson) as ProofOfExecution;

                    if (this.processedIds.has(poe.actionId)) return;
                    this.processedIds.add(poe.actionId);

                    const claim = mapPoEToClaim(poe);

                    console.log(`[MOLTBOOK-COLLECTOR] ⚡ Forwarding verified PoE: ${poe.actionId}`);

                    await axios.post(this.intakeUrl, claim, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 5000
                    });

                } catch (err: any) {
                    console.error(`[MOLTBOOK-COLLECTOR] ❌ Forward failed:`, err.message);
                }
            }
        });
    }
}
