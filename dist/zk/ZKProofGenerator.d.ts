export interface ZKProofInput {
    taskId: string;
    completedAt: string;
    slaDeadlineSeconds: number;
    veracityScore: number;
    outputHash: string;
}
export interface ZKProofBundle {
    proof: string;
    publicSignals: string[];
    verified: boolean;
    taskIdHash: string;
    timestamp: number;
}
/**
 * ZKProofGenerator - Generates non-interactive zero-knowledge proofs for agent execution.
 *
 * Re-uses the Groth16 high-veracity mock pattern. In Phase 2, this will be
 * replaced with actual SnarkJS generation.
 */
export declare class ZKProofGenerator {
    generateProof(input: ZKProofInput): Promise<ZKProofBundle>;
    verifyProof(bundle: ZKProofBundle): Promise<boolean>;
}
