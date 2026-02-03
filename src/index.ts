/**
 * @openclaw/pdp
 * PoE Discovery Protocol — Trustless agent-to-agent discovery
 * 
 * @license MIT
 * @author Berlin AI Labs
 */

export { GossipBeacon, PoEBeacon, PDP_TOPICS } from './GossipBeacon';
export {
    SemanticMatcher,
    generateEmbedding,
    cosineSimilarity,
    capabilitiesMatch,
    findMatchingPeers,
    encodeVector,
    decodeVector,
    CapabilityVector
} from './SemanticMatcher';

// Re-export for convenience
import { GossipBeacon } from './GossipBeacon';
import * as SemanticMatcher from './SemanticMatcher';

export default {
    GossipBeacon,
    SemanticMatcher
};
