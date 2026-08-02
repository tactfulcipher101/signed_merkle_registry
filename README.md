# Signed Merkle Registry

A compact end-to-end prototype for proving that a document is included in a signed registry snapshot.

This project combines a TypeScript pipeline with a Noir circuit to:

- hash documents into leaves,
- build a Merkle tree,
- generate Merkle inclusion proofs,
- sign the tree root,
- and verify the proof and signature inside Noir.

The core idea is simple: a verifier can confirm that a document belongs to a registry snapshot and that the snapshot root was signed by a trusted key.

## What the circuit verifies

The Noir circuit in `src/main.nr` checks two things:

1. The provided document leaf is part of the Merkle tree rooted at the claimed root.
2. The root was signed with a valid Schnorr-style signature under the provided public key.

This makes the project useful as a cryptographic proof-of-inclusion workflow for document registries.

## Project structure

- `src/` — Noir circuit implementation
  - `main.nr` — circuit entry point
  - `hash.nr` — hashing helpers
  - `merkle.nr` — Merkle proof verification
  - `schnorr.nr` — signature verification
  - `types.nr` — proof-related types
- `scripts/` — TypeScript utilities for hashing, tree building, proof generation, signing, and Noir input export
- `documents/` — sample documents used as registry entries
- `outputs/` — generated hashes, proofs, signatures, tree data, and Noir inputs
- `ui/` — optional frontend interface

## Prerequisites

Before running the project, make sure you have:

- Node.js and npm installed
- Nargo / Noir installed on your machine
- WSL recommended if you are working from Windows

## Installation

From the project root:

```bash
npm install
```

## End-to-end workflow

Run the pipeline in this order:

```bash
npm run hash
npm run tree
npm run proofs
npm run sign
npm run export
```

These commands produce the artifacts needed by the Noir circuit.

## Generate prover input for a document

To generate `Prover.toml` for a specific document:

```bash
npm run prover -- --document-id 1
```

You can replace `1` with another document ID as needed.

## Run the Noir circuit

After the inputs are prepared, run:

```bash
nargo execute
```

If the proof and signature are valid, the circuit should execute successfully.

## Notes

- The generated prover input file is intentionally dynamic so you can reuse the same flow for different documents.
- The cryptographic logic is the main focus of this project; the UI is optional and not required for the core proof flow.

## Summary

This repository is a lightweight demonstration of a signed Merkle registry built around zero-knowledge proof verification. It shows how a document can be cryptographically proven to belong to a registry snapshot while preserving the integrity of the signed root.
