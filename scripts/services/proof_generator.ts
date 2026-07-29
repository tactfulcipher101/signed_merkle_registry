import fs from "fs/promises";

import { HashArtifact } from "../types/hash_artifact.js";
import { ProofArtifact } from "../types/merkle_proof.js";
import { buildTree } from "./tree_service.js";

export async function generateProofs(): Promise<ProofArtifact> {

    // Load hashed documents
    const hashRaw = await fs.readFile(
        "outputs/hashes/hashed_documents.json",
        "utf8"
    );

    const hashArtifact: HashArtifact = JSON.parse(hashRaw);

    const leaves = hashArtifact.documents.map(doc =>
        BigInt(doc.leaf)
    );

    // Build tree
    const tree = await buildTree(leaves);

    // Generate proofs for each document
    const proofs = hashArtifact.documents.map((doc, index) => {
        const { siblings, indices } = tree.generateProof(index);

        return {
            documentId: doc.id,
            filename: doc.filename,
            relativePath: doc.relativePath,
            proof: {
                leaf: doc.leaf,
                siblings: siblings.map(s => s.toString()),
                indices
            }
        };
    });

    return {
        generatedAt: new Date().toISOString(),
        rootHash: tree.root().toString(),
        proofs
    };

}
