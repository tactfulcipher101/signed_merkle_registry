import { BarretenbergSync } from "@aztec/bb.js";
import { Fr } from "../../node_modules/@aztec/bb.js/dest/node/barretenberg/testing/fields.js";

let barretenberg: BarretenbergSync | null = null;

async function getBarretenberg() {
    if (!barretenberg) {
        barretenberg = await BarretenbergSync.initSingleton();
    }

    return barretenberg;
}

export async function poseidonHash(inputs: bigint[]): Promise<bigint> {
    const api = await getBarretenberg();
    const fieldInputs = inputs.map(input => {
        const reduced = input % Fr.MODULUS;
        return new Fr(reduced).toBuffer();
    });
    const response = api.poseidon2Hash({ inputs: fieldInputs });
    const hashBytes = Buffer.from(response.hash);

    return BigInt(`0x${hashBytes.toString("hex")}`);
}