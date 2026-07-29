import fs from "fs/promises";
import path from "path";

import { derivePublicKey, generateKeyPair, sign, verify, publicKeyToNoirFormat, signatureToNoirFormat } from "../utils/schnorr.js";

const KEYS_DIR = ".keys";
const PRIVATE_KEY_FILE = path.join(KEYS_DIR, "private.hex");
const PUBLIC_KEY_FILE = path.join(KEYS_DIR, "public.hex");

// Load or generate keypair
async function getOrCreateKeyPair(): Promise<{
    privateKey: string;
    publicKey: string;
}> {
    try {
        const privateKey = (await fs.readFile(PRIVATE_KEY_FILE, "utf8")).trim();
        const publicKey = (await fs.readFile(PUBLIC_KEY_FILE, "utf8")).trim();

        if (publicKey === derivePublicKey(privateKey)) {
            return {
                privateKey,
                publicKey
            };
        }
    } catch {
        // fall through to a fresh keypair
    }

    const { privateKey, publicKey } = generateKeyPair();

    await fs.mkdir(KEYS_DIR, { recursive: true });
    await fs.writeFile(PRIVATE_KEY_FILE, privateKey);
    await fs.writeFile(PUBLIC_KEY_FILE, publicKey);

    console.log("Generated new keypair");

    return { privateKey, publicKey };
}

export async function signRoot(rootHash: bigint): Promise<{
    signature: string;
    publicKey: string;
    noirSignature: string[];
    noirPublicKey: string[];
}> {
    const { privateKey, publicKey } = await getOrCreateKeyPair();

    const signature = await sign(rootHash, privateKey);

    if (!(await verify(rootHash, publicKey, signature))) {
        throw new Error("Generated signature did not verify with public key");
    }

    const noirSignature = signatureToNoirFormat(signature);
    const noirPublicKey = publicKeyToNoirFormat(publicKey);

    return {
        signature: `${signature.r.toString(10)}:${signature.s.toString(10)}`,
        publicKey,
        noirSignature,
        noirPublicKey
    };
}

