import { readFile } from "fs/promises";
import path from "path";

import { getDocumentFiles } from "./utils/files";
import { sha256 } from "./utils/sha256";
import { digestToField } from "./utils/field";
import { poseidonHash } from "./utils/poseidon";

async function main() {

    const files = await getDocumentFiles();

    console.log("\nHashing Documents\n");

    for (let i = 0; i < files.length; i++) {

        const file = files[i];

        const content = await readFile(file, "utf8");

        const digest = sha256(content);

        const field = digestToField(digest);

        const leaf = await poseidonHash([
            BigInt(i + 1),
            field
        ]);

        console.log(path.basename(file));

        console.log("SHA256 :", digest);

        console.log("Leaf   :", leaf.toString());

        console.log();
    }
}

main();