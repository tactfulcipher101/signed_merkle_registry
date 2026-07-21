mod hash;
mod merkle;
mod schnorr;
mod types;

use merkle::verify_merkle_proof;
use types::MerkleProof;

global DEPTH: u32 = 2;

fn main(
    leaf: pub Field,
    root: pub Field,
    siblings: [Field; DEPTH],
    indices: [bool; DEPTH],
) {

    let proof = MerkleProof {
        siblings,
        indices,
    };

    assert(
        verify_merkle_proof::<DEPTH>(
            leaf,
            proof,
            root,
        )
    );
}