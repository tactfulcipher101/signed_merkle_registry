import fs from "fs/promises";

import { buildMerkleTree } from "./services/tree_builder.js";

async function main() {

    const { tree, registry } = await buildMerkleTree();

    await fs.mkdir(
        "outputs/tree",
        { recursive: true }
    );

    await fs.writeFile(
        "outputs/tree/tree.json",
        JSON.stringify({
            generatedAt: new Date().toISOString(),
            organizationName: registry.organizationName,
            registryName: registry.registryName,
            description: registry.description,
            ...tree.toJSON()
        }, null, 2)
    );

    console.log("✓ Tree built successfully");

    console.log();

    console.log("Root:");

    console.log(tree.root().toString());

}

main();