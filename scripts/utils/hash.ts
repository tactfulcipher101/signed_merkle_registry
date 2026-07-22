import { sha256 } from "./sha256";
import { digestToField } from "./field";
import { poseidonHash } from "./poseidon";

export async function hashLeaf(content: string): Promise<bigint> {
    // Step 1: SHA-256
    const digest = sha256(content);

    // Step 2: Convert digest to a field element
    const field = digestToField(digest);

    // Step 3: Poseidon hash
    return await poseidonHash([field]);
}