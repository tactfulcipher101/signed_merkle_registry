use crate::hash::hash_pair;
use crate::types::MerkleProof;

pub fn verify_merkle_proof<let DEPTH: u32>(
    leaf: Field,
    proof: MerkleProof<DEPTH>,
    root: Field,
) -> bool {
    let mut current = leaf;

    for i in 0..DEPTH {
        let sibling = proof.siblings[i];

        if proof.indices[i] {
            // Sibling is on the left
            current = hash_pair(sibling, current);
        } else {
            // Sibling is on the right
            current = hash_pair(current, sibling);
        }
    }

    current == root
}