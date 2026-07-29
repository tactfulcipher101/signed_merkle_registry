import { MerkleTree } from "../utils/merkle_tree.js";

export async function buildTree(leaves: bigint[]): Promise<MerkleTree> {

    const tree = new MerkleTree(leaves);

    await tree.build();

    return tree;

}