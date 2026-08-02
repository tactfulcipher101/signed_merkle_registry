import { PublishedDocument } from "./published_document.js";

export interface HashArtifact {
    generatedAt: string;
    organizationName: string;
    registryName: string;
    description?: string;
    documentCount: number;
    documents: PublishedDocument[];
}