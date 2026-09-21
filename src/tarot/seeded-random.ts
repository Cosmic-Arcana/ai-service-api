import { createHash } from 'node:crypto';

const UINT32_RANGE = 2 ** 32;

/**
 * Deterministic random source: the n-th value is derived from sha256(seed:n), so the same seed
 * always replays the same sequence. That is what makes a retried draw return the same cards.
 */
export class SeededRandom {
  private counter = 0;

  constructor(private readonly seed: string) {}

  nextInt(maxExclusive: number): number {
    if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > UINT32_RANGE) {
      throw new RangeError(
        `maxExclusive must be an integer between 1 and 2^32, got ${maxExclusive}`,
      );
    }

    // Rejection sampling: a plain modulo would favour low values whenever the range
    // does not divide 2^32 evenly.
    const limit = UINT32_RANGE - (UINT32_RANGE % maxExclusive);
    let value = this.nextUint32();
    while (value >= limit) {
      value = this.nextUint32();
    }

    return value % maxExclusive;
  }

  nextBoolean(): boolean {
    return this.nextInt(2) === 1;
  }

  private nextUint32(): number {
    const digest = createHash('sha256').update(`${this.seed}:${this.counter}`).digest();
    this.counter += 1;

    return digest.readUInt32BE(0);
  }
}
