import { poseidonHash } from "./poseidon.js";

export class MerkleTree {

    public readonly leaves: bigint[];

    public readonly levels: bigint[][];

    constructor(leaves: bigint[]) {

        this.leaves = leaves;

        this.levels = [];

    }

    async build(): Promise<void> {

        this.levels.push(this.leaves);

        let current = this.leaves;

        while (current.length > 1) {

            const next: bigint[] = [];

            for (let i = 0; i < current.length; i += 2) {

                const left = current[i];

                const right =
                    i + 1 < current.length
                        ? current[i + 1]
                        : left;

                next.push(
                    await poseidonHash([left, right])
                );

            }

            this.levels.push(next);

            current = next;

        }

    }

    root(): bigint {

        return this.levels.at(-1)![0];

    }

    toJSON() {
        return {
            leafCount: this.leaves.length,
            root: this.root().toString(),
            levels: this.levels.map(level =>
                level.map(hash => hash.toString())
            )
        };
    }

    generateProof(leafIndex: number): {
        siblings: bigint[];
        indices: boolean[];
    } {
        if (leafIndex < 0 || leafIndex >= this.leaves.length) {
            throw new Error(`Invalid leaf index: ${leafIndex}`);
        }

        const siblings: bigint[] = [];
        const indices: boolean[] = [];

        let currentIndex = leafIndex;

        for (let level = 0; level < this.levels.length - 1; level++) {
            const currentLevel = this.levels[level];
            const pairIndex = Math.floor(currentIndex / 2);
            const positionInPair = currentIndex % 2;
            const siblingIndex = positionInPair === 0 ? 2 * pairIndex + 1 : 2 * pairIndex;

            if (siblingIndex < currentLevel.length) {
                siblings.push(currentLevel[siblingIndex]);
            } else {
                // Sibling doesn't exist (odd level), duplicate the leaf
                siblings.push(currentLevel[siblingIndex - 1]);
            }

            // index = true if current is on the right (sibling on left)
            indices.push(positionInPair === 1);

            currentIndex = pairIndex;
        }

        return { siblings, indices };
    }

}