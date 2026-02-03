/**
 * @openclaw/pdp
 * PoE Discovery Protocol — Trustless agent-to-agent discovery
 * 
 * @license MIT
 * @author Berlin AI Labs
 */

export { GossipBeacon, PoEBeacon, PDP_TOPICS } from './GossipBeacon';
export {
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
import * as SemanticMatcherNamespace from './SemanticMatcher';

export const SemanticMatcher = SemanticMatcherNamespace;

export default {
    GossipBeacon,
    SemanticMatcher: SemanticMatcherNamespace
};
