/**
 * @openclaw/pdp
 * PoE Discovery Protocol — Trustless agent-to-agent discovery
 *
 * @license MIT
 * @author Berlin AI Labs
 */
export { GossipBeacon, PoEBeacon, PDP_TOPICS } from './GossipBeacon';
export { generateEmbedding, cosineSimilarity, capabilitiesMatch, findMatchingPeers, encodeVector, decodeVector, CapabilityVector } from './SemanticMatcher';
import { GossipBeacon } from './GossipBeacon';
import * as SemanticMatcherNamespace from './SemanticMatcher';
export declare const SemanticMatcher: typeof SemanticMatcherNamespace;
declare const _default: {
    GossipBeacon: typeof GossipBeacon;
    SemanticMatcher: typeof SemanticMatcherNamespace;
};
export default _default;
