export function digestToField(digest: string): bigint {
    return BigInt("0x" + digest);
}