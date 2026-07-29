import fs from "fs/promises";

import { HashArtifact } from "../types/hash_artifact.js";
import { ProofArtifact } from "../types/merkle_proof.js";
import { SignatureArtifact } from "../types/signature.js";

export interface NoirInput {
    // Merkle proof verification
    leaf: string;
    root: string;
    siblings: string[];
    indices: boolean[];

    // BN254-field Schnorr signature verification
    message: string; // The message that was signed (the root)
    publicKey: string;
    signature: string[];
}

export interface InputsArtifact {
    generatedAt: string;
    documentCount: number;
    depth: number;
    inputs: Array<{
        documentId: number;
        filename: string;
        noirInput: NoirInput;
    }>;
}

export async function exportNoirInputs(): Promise<InputsArtifact> {

    // Load all artifacts
    const hashRaw = await fs.readFile(
        "outputs/hashes/hashed_documents.json",
        "utf8"
    );
    const hashArtifact: HashArtifact = JSON.parse(hashRaw);

    const proofsRaw = await fs.readFile(
        "outputs/proofs/proofs.json",
        "utf8"
    );
    const proofsArtifact: ProofArtifact = JSON.parse(proofsRaw);

    const signatureRaw = await fs.readFile(
        "outputs/signatures/signature.json",
        "utf8"
    );
    const signatureArtifact: SignatureArtifact = JSON.parse(signatureRaw);

    // Calculate tree depth
    const depth = Math.ceil(Math.log2(hashArtifact.documentCount)) || 1;

    // Generate inputs for each document
    const inputs = hashArtifact.documents.map((doc, index) => {
        const proof = proofsArtifact.proofs[index];

        return {
            documentId: doc.id,
            filename: doc.filename,
            noirInput: {
                leaf: doc.leaf,
                root: proofsArtifact.rootHash,
                siblings: proof.proof.siblings,
                indices: proof.proof.indices,
                message: signatureArtifact.rootHash,
                publicKey: signatureArtifact.noirPublicKey[0],
                signature: signatureArtifact.noirSignature
            }
        };
    });

    return {
        generatedAt: new Date().toISOString(),
        documentCount: hashArtifact.documentCount,
        depth,
        inputs
    };

}
