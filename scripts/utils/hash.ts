import { sha256 } from "./sha256.js";
import { digestToField } from "./field.js";
import { poseidonHash } from "./poseidon.js";

export async function hashLeaf(content: string): Promise<bigint> {
    // Step 1: SHA-256
    const digest = sha256(content);

    // Step 2: Convert digest to a field element
    const field = digestToField(digest);

    // Step 3: Poseidon hash
    return await poseidonHash([field]);
}