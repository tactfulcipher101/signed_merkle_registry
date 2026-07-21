import { readFile } from "fs/promises";
import { saveJson } from "./utils/json";

import { getDocumentFiles } from "./utils/files";
import { sha256 } from "./utils/sha256";
import { digestToField } from "./utils/field";
import { poseidonHash } from "./utils/poseidon";
import { MerkleTree } from "./utils/merkle";

async function main() {

    const files = await getDocumentFiles();

    const leaves: bigint[] = [];

    for (let i = 0; i < files.length; i++) {

        const content = await readFile(files[i], "utf8");

        const digest = sha256(content);

        const field = digestToField(digest);

        const leaf = await poseidonHash([
            BigInt(i + 1),
            field
        ]);

        leaves.push(leaf);
    }

    const tree = new MerkleTree(leaves);

    await tree.build();

    await saveJson(
    "outputs/tree/tree.json",
    tree.toJSON()
);

console.log("Tree saved successfully.");

    const proof = tree.getProof(0);

console.log("Root:");
console.log(tree.root().toString());

console.log();

console.log("Proof:");

console.log(proof);


    console.log();

    console.log("Merkle Root:");

    console.log(tree.root().toString());

    console.log();
}

main();