import fs from "fs/promises";

import { buildMerkleTree } from "./services/tree_builder.js";
import { signRoot } from "./services/signer.js";
import { loadRegistryConfig } from "./registry_config.js";
import { SignatureArtifact } from "./types/signature.js";

async function main() {

    // Load tree to get root
    const { tree } = await buildMerkleTree();

    const root = tree.root();

    // Sign the root
    const { signature, publicKey, noirSignature, noirPublicKey } = await signRoot(root);

    // Create artifact
    const registryConfig = await loadRegistryConfig();

    const artifact: SignatureArtifact = {
        generatedAt: new Date().toISOString(),
        organizationName: registryConfig.organizationName,
        registryName: registryConfig.registryName,
        description: registryConfig.description,
        rootHash: root.toString(),
        publicKey,
        signature,
        noirPublicKey,
        noirSignature
    };

    // Save to file
    await fs.mkdir("outputs/signatures", { recursive: true });

    await fs.writeFile(
        "outputs/signatures/signature.json",
        JSON.stringify(artifact, null, 2)
    );

    console.log("✓ Root signed successfully");

    console.log();

    console.log("Root Hash:");

    console.log(root.toString());

    console.log();

    console.log("Public Key:");

    console.log(publicKey);

    console.log();

    console.log("Signature:");

    console.log(signature);

}

main().catch(err => {
    console.error("Error signing root:", err);
    process.exit(1);
});
