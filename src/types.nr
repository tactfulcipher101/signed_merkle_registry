pub struct MerkleProof<let DEPTH: u32> {
    pub siblings: [Field; DEPTH],

    // false = sibling is on the right
    // true = sibling is on the left
    pub indices: [bool; DEPTH],
}

pub struct Bn254SchnorrSignature {
    pub public_key: Field,
    pub signature_r: Field,
    pub signature_s: Field,
}