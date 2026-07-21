import { writeFile, readFile } from "fs/promises";

export async function saveJson(path: string, data: unknown) {
    await writeFile(
        path,
        JSON.stringify(data, null, 2)
    );
}

export async function loadJson<T>(path: string): Promise<T> {
    const text = await readFile(path, "utf8");

    return JSON.parse(text) as T;
}