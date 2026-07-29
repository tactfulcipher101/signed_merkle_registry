export interface SignatureArtifact {
    generatedAt: string;
    rootHash: string;
    publicKey: string;
    signature: string;
    noirPublicKey: string[];
    noirSignature: string[];
}
