import fs from "fs/promises";

import { exportNoirInputs } from "./services/inputs_exporter.js";

async function main() {

    const artifact = await exportNoirInputs();

    // Create directory for individual inputs
    await fs.mkdir("outputs/inputs", { recursive: true });

    // Save combined artifact
    await fs.writeFile(
        "outputs/inputs/all.json",
        JSON.stringify(artifact, null, 2)
    );

    // Save individual inputs for each document
    for (const input of artifact.inputs) {
        await fs.writeFile(
            `outputs/inputs/document_${input.documentId}.json`,
            JSON.stringify({
                generatedAt: artifact.generatedAt,
                documentId: input.documentId,
                filename: input.filename,
                ...input.noirInput
            }, null, 2)
        );
    }

    console.log("✓ Noir inputs exported successfully");

    console.log();

    console.log(`Exported ${artifact.documentCount} documents`);

    console.log(`Tree depth: ${artifact.depth}`);

    console.log();

    console.log("Files created:");

    console.log("  - outputs/inputs/all.json");

    console.log(`  - outputs/inputs/document_*.json (${artifact.documentCount} files)`);

}

main().catch(err => {
    console.error("Error exporting inputs:", err);
    process.exit(1);
});
