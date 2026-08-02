import fs from "fs/promises";
import path from "path";

const BN254_FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

function parseArgs(argv: string[]) {
  const options: { documentId?: number; inputPath?: string } = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--document-id") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --document-id");
      }
      options.documentId = Number(value);
      index += 1;
    } else if (arg === "--input") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --input");
      }
      options.inputPath = value;
      index += 1;
    }
  }

  return options;
}

function normalizeField(value: string): string {
  return (BigInt(value) % BN254_FIELD_MODULUS).toString();
}

function tomlArray(values: string[]): string {
  return `[${values.join(", ")}]`;
}

function buildProverToml(input: {
  leaf: string;
  root: string;
  siblings: string[];
  indices: boolean[];
  publicKey: string;
  signature: string[];
}): string {
  const lines = [
    `indices = ${tomlArray(input.indices.map(value => (value ? "true" : "false")))}`,
    `leaf = "${normalizeField(input.leaf)}"`,
    `root = "${normalizeField(input.root)}"`,
    `siblings = ${tomlArray(input.siblings.map(value => `"${normalizeField(value)}"`))}`,
    `public_key = "${normalizeField(input.publicKey)}"`,
    `signature_r = "${normalizeField(input.signature[0])}"`,
    `signature_s = "${normalizeField(input.signature[1])}"`,
  ];

  return `${lines.join("\n")}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = options.inputPath ?? path.join("outputs", "inputs", "all.json");
  const raw = await fs.readFile(inputPath, "utf8");
  const artifact = JSON.parse(raw) as {
    inputs: Array<{
      documentId: number;
      filename: string;
      noirInput: {
        leaf: string;
        root: string;
        siblings: string[];
        indices: boolean[];
        publicKey: string;
        signature: string[];
      };
    }>;
  };

  const target = artifact.inputs.find(entry => entry.documentId === options.documentId)
    ?? artifact.inputs[0];

  if (!target) {
    throw new Error("No Noir input entries were found");
  }

  const content = buildProverToml({
    leaf: target.noirInput.leaf,
    root: target.noirInput.root,
    siblings: target.noirInput.siblings,
    indices: target.noirInput.indices,
    publicKey: target.noirInput.publicKey,
    signature: target.noirInput.signature,
  });

  await fs.writeFile("Prover.toml", content);

  console.log(`Wrote Prover.toml for document ${target.documentId} (${target.filename})`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
