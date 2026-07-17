import { buildPoseidon } from "circomlibjs";

let poseidonInstance: Awaited<ReturnType<typeof buildPoseidon>> | null = null;

/**
 * Returns a singleton Poseidon instance.
 */
export async function getPoseidon() {
    if (!poseidonInstance) {
        poseidonInstance = await buildPoseidon();
    }

    return poseidonInstance;
}