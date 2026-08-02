import fs from "fs/promises";
import path from "path";

import { sha256 } from "../utils/sha256.js";
import { hashLeaf } from "../utils/hash.js";
import { PublishedDocument } from "../types/published_document.js";

export async function hashDocument(
    file: string,
    id: number
): Promise<PublishedDocument> {

    const content = await fs.readFile(file);

    const digest = sha256(content);

    const leaf = await hashLeaf(content);

    return {
        id,
        filename: path.basename(file),
        relativePath: path.relative("documents", file),
        sha256: digest,
        leaf: leaf.toString(),
    };
}