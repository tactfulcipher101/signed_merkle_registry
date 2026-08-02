export interface TreeArtifact {
    generatedAt: string;
    organizationName: string;
    registryName: string;
    description?: string;
    leafCount: number;
    root: string;
    levels: string[][];
}