import fs from "fs/promises";

import { loadDocuments } from "./document_loader";
import { hashDocument } from "./document_hasher";

export async function publishHashes() {

    const files = await loadDocuments();

    const documents = [];

    let id = 1;

    for (const file of files) {

        documents.push(
            await hashDocument(file, id++)
        );

    }

    const artifact = {

        generatedAt: new Date().toISOString(),

        documentCount: documents.length,

        documents

    };

    await fs.mkdir("outputs/hashes", { recursive: true });

    await fs.writeFile(
        "outputs/hashes/hashed_documents.json",
        JSON.stringify(artifact, null, 2)
    );

    console.log(`Published ${documents.length} documents.`);
}