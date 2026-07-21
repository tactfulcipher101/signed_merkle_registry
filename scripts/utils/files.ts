import fg from "fast-glob";

export async function getDocumentFiles(): Promise<string[]> {
    return await fg("documents/**/*.txt");
}