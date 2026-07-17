import { DocumentRecord } from "./document";

export interface HashedDocument {
    document: DocumentRecord;
    digest: string;
    leaf: bigint;
}