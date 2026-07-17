import { DocumentRecord } from "./types/document";
import { stringToBigInt } from "./utils/encoding";
import { getPoseidon } from "./utils/poseidon";

export async function hashDocument(
    document: DocumentRecord
): Promise<bigint> {

    const poseidon = await getPoseidon();

    const content = stringToBigInt(document.content);

    const hash = poseidon([
        BigInt(document.id),
        BigInt(document.version),
        content
    ]);

    return poseidon.F.toObject(hash) as bigint;
}