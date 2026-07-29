export interface MerkleProof {
    leaf: string;
    siblings: string[];
    indices: boolean[];
}

export interface ProofArtifact {
    generatedAt: string;
    rootHash: string;
    proofs: Array<{
        documentId: number;
        filename: string;
        relativePath: string;
        proof: MerkleProof;
    }>;
}
