import crypto from "crypto";

import { poseidonHash } from "./poseidon.js";

const GENERATOR: bigint = 7n;

function bytesToFieldElement(bytes: Uint8Array): bigint {
    const hex = Buffer.from(bytes).toString("hex") || "0";
    return BigInt(`0x${hex}`);
}

function fieldToDecimalString(value: bigint): string {
    return value.toString(10);
}

function parseScalar(value: string): bigint {
    const trimmed = value.trim();

    if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
        return BigInt(trimmed);
    }

    if (/^[0-9]+$/.test(trimmed)) {
        return BigInt(trimmed);
    }

    if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0) {
        return BigInt(`0x${trimmed}`);
    }

    return BigInt(trimmed);
}

export function derivePublicKey(privateKeyHex: string): string {
    const privateKeyScalar = parseScalar(privateKeyHex);
    return fieldToDecimalString(privateKeyScalar * GENERATOR);
}

// Generate a deterministic BN254-field Schnorr-style keypair from a seed.
export function generateKeyPair(seed: Buffer = crypto.randomBytes(32)) {
    const privateKeyScalar = bytesToFieldElement(seed);
    const publicKeyScalar = privateKeyScalar * GENERATOR;

    return {
        privateKey: fieldToDecimalString(privateKeyScalar),
        publicKey: fieldToDecimalString(publicKeyScalar)
    };
}

// Sign the message hash with a BN254-field Schnorr-style scheme.
export async function sign(
    messageHash: bigint,
    privateKeyHex: string
): Promise<{ r: bigint; s: bigint; publicKey: bigint }> {
    const privateKeyScalar = parseScalar(privateKeyHex);
    const publicKeyScalar = privateKeyScalar * GENERATOR;

    const ephemeralScalar = bytesToFieldElement(
        crypto.createHash("sha256")
            .update(`${messageHash.toString(10)}:${privateKeyScalar.toString(10)}`)
            .digest()
    );
    const r = ephemeralScalar * GENERATOR;
    const challenge = await poseidonHash([messageHash, r, publicKeyScalar]);
    const s = ephemeralScalar + (challenge * privateKeyScalar);

    return { r, s, publicKey: publicKeyScalar };
}

// Verify the BN254-field Schnorr-style signature.
export async function verify(
    messageHash: bigint,
    publicKeyHex: string,
    signature: { r: bigint; s: bigint }
): Promise<boolean> {
    const publicKeyScalar = parseScalar(publicKeyHex);
    const challenge = await poseidonHash([messageHash, signature.r, publicKeyScalar]);
    const expectedR = (signature.s * GENERATOR) - (challenge * publicKeyScalar);

    return expectedR === signature.r;
}

// Convert signature to Noir format: [Field; 2]
export function signatureToNoirFormat(sig: { r: bigint; s: bigint }): string[] {
    return [sig.r.toString(10), sig.s.toString(10)];
}

// Convert public key to Noir format: [Field; 1]
export function publicKeyToNoirFormat(pk: string): string[] {
    return [pk];
}
