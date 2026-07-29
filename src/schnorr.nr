use crate::hash::hash_triple;

pub fn verify_bn254_schnorr_signature(
    public_key: Field,
    signature_r: Field,
    signature_s: Field,
    message: Field,
) -> bool {
    let generator: Field = 7;
    let challenge = hash_triple(message, signature_r, public_key);
    let expected_r = (signature_s * generator) - (challenge * public_key);

    signature_r == expected_r
}