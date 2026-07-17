export function stringToBigInt(text: string): bigint {
    const hex = Buffer.from(text, "utf8").toString("hex");

    return BigInt("0x" + hex);
}