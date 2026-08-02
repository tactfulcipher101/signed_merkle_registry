import fs from "fs/promises";

export interface RegistryConfig {
    organizationName: string;
    registryName: string;
    description?: string;
}

const CONFIG_FILE = "registry.config.json";

export async function loadRegistryConfig(): Promise<RegistryConfig> {
    try {
        const raw = await fs.readFile(CONFIG_FILE, "utf8");
        const parsed = JSON.parse(raw);

        return {
            organizationName: String(parsed.organizationName ?? "Unknown Organization"),
            registryName: String(parsed.registryName ?? "Unnamed Registry"),
            description: parsed.description ? String(parsed.description) : undefined,
        };
    } catch {
        return {
            organizationName: "Unknown Organization",
            registryName: "Unnamed Registry",
        };
    }
}
