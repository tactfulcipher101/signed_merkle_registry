export interface SignatureArtifact {
    generatedAt: string;
    organizationName: string;
    registryName: string;
    description?: string;
    rootHash: string;
    publicKey: string;
    signature: string;
    noirPublicKey: string[];
    noirSignature: string[];
}
