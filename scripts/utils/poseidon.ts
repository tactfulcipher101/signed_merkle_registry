import { buildPoseidon } from "circomlibjs";

let poseidon: Awaited<ReturnType<typeof buildPoseidon>> | null = null;

export async function getPoseidon() {
    if (!poseidon) {
        poseidon = await buildPoseidon();
    }

    return poseidon;
}

export async function poseidonHash(inputs: bigint[]): Promise<bigint> {
    const p = await getPoseidon();

    const hash = p(inputs);

    return p.F.toObject(hash) as bigint;
}