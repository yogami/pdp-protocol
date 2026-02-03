/**
 * Semantic Matcher — PDP Week 2
 *
 * Provides embedding generation and similarity matching for capability vectors.
 * Enables agents to find peers with matching capabilities.
 *
 * Note: Uses simplified TF-IDF-style embeddings for local-first operation.
 * For production, integrate with SentenceTransformers or Gemini embeddings.
 */
/**
 * Capability embedding (simplified vector representation)
 */
export type CapabilityVector = number[];
/**
 * Generate a capability embedding vector
 */
export declare function generateEmbedding(capabilities: string[]): CapabilityVector;
/**
 * Calculate cosine similarity between two vectors
 */
export declare function cosineSimilarity(a: CapabilityVector, b: CapabilityVector): number;
/**
 * Check if two capability sets match above threshold
 */
export declare function capabilitiesMatch(caps1: string[], caps2: string[], threshold?: number): {
    match: boolean;
    similarity: number;
};
/**
 * Find matching capabilities from a list of peers
 */
export declare function findMatchingPeers(myCapabilities: string[], peers: Array<{
    nodeId: string;
    capabilities: string[];
}>, threshold?: number): Array<{
    nodeId: string;
    similarity: number;
}>;
/**
 * Encode vector to base64 for beacon payloads
 */
export declare function encodeVector(vector: CapabilityVector): string;
/**
 * Decode base64 vector from beacon payloads
 */
export declare function decodeVector(encoded: string): CapabilityVector;
