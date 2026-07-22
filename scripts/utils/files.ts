import { readdir, readFile } from "fs/promises";
import path from "path";

export async function getDocumentFiles(
    dir: string
): Promise<string[]> {

    const entries = await readdir(dir, {
        withFileTypes: true
    });

    let files: string[] = [];

    for (const entry of entries) {

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {

            files.push(
                ...(await getDocumentFiles(fullPath))
            );

        } else {

            files.push(fullPath);

        }
    }

    return files;
}

export async function readDocument(
    pathToFile: string
): Promise<string> {

    return readFile(pathToFile, "utf8");
}