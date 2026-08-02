import fs from "fs/promises";

import { HashArtifact } from "../types/hash_artifact.js";
import { buildTree } from "./tree_service.js";

export async function buildMerkleTree() {

    const raw = await fs.readFile(
        "outputs/hashes/hashed_documents.json",
        "utf8"
    );

    const artifact: HashArtifact = JSON.parse(raw);

    const leaves = artifact.documents.map(doc =>
        BigInt(doc.leaf)
    );

    const tree = await buildTree(leaves);

    return {
        tree,
        leaves,
        registry: {
            organizationName: artifact.organizationName,
            registryName: artifact.registryName,
            description: artifact.description
        }
    };

}