mod hash;
mod merkle;
mod schnorr;
mod types;

use merkle::verify_merkle_proof;
use schnorr::verify_bn254_schnorr_signature;
use types::MerkleProof;

global DEPTH: u32 = 2;

fn main(
    // Merkle proof inputs (public)
    leaf: pub Field,
    root: pub Field,
    siblings: [Field; DEPTH],
    indices: [bool; DEPTH],

    // Signature inputs (public)
    public_key: pub Field,
    signature_r: pub Field,
    signature_s: pub Field,
) {
    // Verify the Merkle proof
    let proof = MerkleProof {
        siblings,
        indices,
    };

    assert(
        verify_merkle_proof::<DEPTH>(
            leaf,
            proof,
            root,
        ),
        "Merkle proof verification failed"
    );

    // Verify the BN254-field Schnorr-style signature on the root
    assert(
        verify_bn254_schnorr_signature(
            public_key,
            signature_r,
            signature_s,
            root,
        ),
        "Signature verification failed"
    );
}