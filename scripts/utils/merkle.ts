import { poseidonHash } from "./poseidon";

export interface MerkleProof {
    siblings: bigint[];
    indices: boolean[];
}

export class MerkleTree {

    public levels: bigint[][] = [];

    constructor(private readonly leaves: bigint[]) {

        this.levels.push(leaves);
    }

    async build(): Promise<void> {

        while (this.levels[this.levels.length - 1].length > 1) {

            const current = this.levels[this.levels.length - 1];

            const next: bigint[] = [];

            for (let i = 0; i < current.length; i += 2) {

                const left = current[i];

                const right =
                    i + 1 < current.length
                        ? current[i + 1]
                        : current[i];

                next.push(
                    await poseidonHash([left, right])
                );
            }

            this.levels.push(next);
        }
    }

    root(): bigint {
        return this.levels[this.levels.length - 1][0];
    }

    getProof(index: number): MerkleProof {

    const siblings: bigint[] = [];

    const indices: boolean[] = [];

    let currentIndex = index;

    for (let level = 0; level < this.levels.length - 1; level++) {

        const currentLevel = this.levels[level];

        const isRightNode = currentIndex % 2 === 1;

        let siblingIndex =
            isRightNode
                ? currentIndex - 1
                : currentIndex + 1;

        if (siblingIndex >= currentLevel.length) {
            siblingIndex = currentIndex;
        }

        siblings.push(currentLevel[siblingIndex]);

        indices.push(isRightNode);

        currentIndex = Math.floor(currentIndex / 2);
    }

    return {
        siblings,
        indices
    };
}

getSerializableProof(index: number) {

    const proof = this.getProof(index);

    return {

        leaf: this.levels[0][index].toString(),

        siblings: proof.siblings.map(x => x.toString()),

        indices: proof.indices

    };
}

toJSON() {
    return {
        leaves: this.levels[0].map(leaf => leaf.toString()),

        levels: this.levels.map(level =>
            level.map(node => node.toString())
        ),

        root: this.root().toString()
    };
}
}