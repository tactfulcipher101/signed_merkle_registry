import fs from "fs/promises";

import { generateProofs } from "./services/proof_generator.js";

async function main() {

    const artifact = await generateProofs();

    await fs.mkdir(
        "outputs/proofs",
        { recursive: true }
    );

    await fs.writeFile(
        "outputs/proofs/proofs.json",
        JSON.stringify(artifact, null, 2)
    );

    console.log("✓ Proofs generated successfully");

    console.log();

    console.log(`Generated ${artifact.proofs.length} proofs`);

    console.log();

    console.log("Root Hash:");

    console.log(artifact.rootHash);

}

main().catch(err => {
    console.error("Error generating proofs:", err);
    process.exit(1);
});