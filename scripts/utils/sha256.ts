import { createHash } from "crypto";

export function sha256(data: string | Uint8Array | Buffer): string {
    const hash = createHash("sha256");

    if (typeof data === "string") {
        hash.update(data, "utf8");
    } else {
        hash.update(data);
    }

    return hash.digest("hex");
}