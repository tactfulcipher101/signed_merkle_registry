import { glob } from "glob";

export async function loadDocuments(): Promise<string[]> {
    return await glob("documents/**/*.*");
}