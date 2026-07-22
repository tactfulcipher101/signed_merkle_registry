import fs from "fs/promises";
import path from "path";

import { sha256 } from "../utils/sha256";
import { hashLeaf } from "../utils/hash";
import { PublishedDocument } from "../types/published_document";

export async function hashDocument(
    file: string,
    id: number
): Promise<PublishedDocument> {

    const content = await fs.readFile(file, "utf8");

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