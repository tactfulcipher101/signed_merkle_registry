import { documents } from "../documents/sample_documents";
import { sha256 } from "./utils/sha256";

for (const document of documents) {
    console.log(document.name);
    console.log(sha256(document.content));
    console.log();
}