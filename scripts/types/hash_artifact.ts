import { PublishedDocument } from "./published_document.js";

export interface HashArtifact {
    generatedAt: string;
    documentCount: number;
    documents: PublishedDocument[];
}