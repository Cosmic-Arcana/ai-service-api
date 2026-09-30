import type { SeededRandom } from './seeded-random';

export const SHUFFLE_ALGORITHMS = [
  'fisher-yates',
  'random-insertion',
  'random-sort',
  'random-rotation',
] as const;

export type ShuffleAlgorithm = (typeof SHUFFLE_ALGORITHMS)[number];

type Shuffle = <T>(items: readonly T[], random: SeededRandom) => T[];

const fisherYates: Shuffle = (items, random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = random.nextInt(index + 1);
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }

  return result;
};

const randomInsertion: Shuffle = (items, random) =>
  items.reduce<(typeof items)[number][]>((result, item) => {
    result.splice(random.nextInt(result.length + 1), 0, item);
    return result;
  }, []);

/**
 * Sorts by a random key per card instead of using a random comparator: a random comparator is
 * biased and its outcome depends on the engine's sort implementation, which would break replay.
 */
const randomSort: Shuffle = (items, random) =>
  items
    .map((item) => ({ item, key: random.nextUint32() }))
    .sort((left, right) => left.key - right.key)
    .map(({ item }) => item);

/** A single cut of the deck: the cyclic order survives, so consecutive cards stay neighbours. */
const randomRotation: Shuffle = (items, random) => {
  if (items.length === 0) {
    return [];
  }

  const offset = random.nextInt(items.length);
  return [...items.slice(offset), ...items.slice(0, offset)];
};

const SHUFFLES: Record<ShuffleAlgorithm, Shuffle> = {
  'fisher-yates': fisherYates,
  'random-insertion': randomInsertion,
  'random-sort': randomSort,
  'random-rotation': randomRotation,
};

export const shuffle = <T>(
  items: readonly T[],
  algorithm: ShuffleAlgorithm,
  random: SeededRandom,
): T[] => SHUFFLES[algorithm](items, random);
