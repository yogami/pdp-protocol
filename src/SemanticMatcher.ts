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
 * Predefined capability vocabulary for consistent embeddings
 */
const CAPABILITY_VOCAB = [
    'code-refactor', 'security-audit', 'vulnerability-scan', 'config-hardening',
    'test-generation', 'documentation', 'api-design', 'database-migration',
    'performance-optimization', 'compliance-check', 'translation', 'governance',
    'trust-verification', 'semantic-alignment', 'deadline-enforcement',
    'ml-inference', 'data-pipeline', 'devops', 'monitoring', 'alerting'
];

/**
 * Generate a capability embedding vector
 */
export function generateEmbedding(capabilities: string[]): CapabilityVector {
    // Simple one-hot encoding with vocab matching
    const vector = new Array(CAPABILITY_VOCAB.length).fill(0);

    capabilities.forEach(cap => {
        const normalizedCap = cap.toLowerCase().replace(/\s+/g, '-');
        const idx = CAPABILITY_VOCAB.indexOf(normalizedCap);
        if (idx !== -1) {
            vector[idx] = 1;
        } else {
            // Fuzzy match for partial capability names
            CAPABILITY_VOCAB.forEach((vocabCap, i) => {
                if (vocabCap.includes(normalizedCap) || normalizedCap.includes(vocabCap)) {
                    vector[i] = 0.5; // Partial match
                }
            });
        }
    });

    return vector;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: CapabilityVector, b: CapabilityVector): number {
    if (a.length !== b.length) throw new Error('Vectors must have same length');

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
}

/**
 * Check if two capability sets match above threshold
 */
export function capabilitiesMatch(
    caps1: string[],
    caps2: string[],
    threshold: number = 0.7
): { match: boolean; similarity: number } {
    const vec1 = generateEmbedding(caps1);
    const vec2 = generateEmbedding(caps2);
    const similarity = cosineSimilarity(vec1, vec2);

    return {
        match: similarity >= threshold,
        similarity: Math.round(similarity * 100) / 100
    };
}

/**
 * Find matching capabilities from a list of peers
 */
export function findMatchingPeers(
    myCapabilities: string[],
    peers: Array<{ nodeId: string; capabilities: string[] }>,
    threshold: number = 0.7
): Array<{ nodeId: string; similarity: number }> {
    const matches: Array<{ nodeId: string; similarity: number }> = [];
    const myVector = generateEmbedding(myCapabilities);

    peers.forEach(peer => {
        const peerVector = generateEmbedding(peer.capabilities);
        const similarity = cosineSimilarity(myVector, peerVector);

        if (similarity >= threshold) {
            matches.push({
                nodeId: peer.nodeId,
                similarity: Math.round(similarity * 100) / 100
            });
        }
    });

    return matches.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Encode vector to base64 for beacon payloads
 */
export function encodeVector(vector: CapabilityVector): string {
    return Buffer.from(JSON.stringify(vector)).toString('base64');
}

/**
 * Decode base64 vector from beacon payloads
 */
export function decodeVector(encoded: string): CapabilityVector {
    return JSON.parse(Buffer.from(encoded, 'base64').toString());
}
