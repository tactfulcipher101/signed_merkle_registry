use poseidon::poseidon2::Poseidon2;

pub fn hash_pair(left: Field, right: Field) -> Field {
    Poseidon2::hash([left, right], 2)
}

pub fn hash_triple(first: Field, second: Field, third: Field) -> Field {
    Poseidon2::hash([first, second, third], 3)
}