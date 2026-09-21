import { SeededRandom } from './seeded-random';

const sequence = (seed: string, length: number, max: number): number[] => {
  const random = new SeededRandom(seed);
  return Array.from({ length }, () => random.nextInt(max));
};

describe('SeededRandom', () => {
  it('replays the same sequence for the same seed', () => {
    expect(sequence('seed-a', 20, 78)).toEqual(sequence('seed-a', 20, 78));
  });

  it('produces a different sequence for a different seed', () => {
    expect(sequence('seed-a', 20, 78)).not.toEqual(sequence('seed-b', 20, 78));
  });

  it('spreads integers evenly across the requested range', () => {
    const counts = new Array<number>(6).fill(0);
    for (const value of sequence('uniformity', 6_000, 6)) {
      counts[value] += 1;
    }

    for (const count of counts) {
      expect(count).toBeGreaterThan(850);
      expect(count).toBeLessThan(1_150);
    }
  });

  it.each([0, -1, 1.5, 2 ** 32 + 1])('rejects %p as an upper bound', (max) => {
    expect(() => new SeededRandom('seed').nextInt(max)).toThrow(RangeError);
  });
});
