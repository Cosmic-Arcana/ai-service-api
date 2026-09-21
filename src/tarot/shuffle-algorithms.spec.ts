import { SeededRandom } from './seeded-random';
import { shuffle, SHUFFLE_ALGORITHMS } from './shuffle-algorithms';

const DECK = Array.from({ length: 78 }, (_, index) => index);

describe.each(SHUFFLE_ALGORITHMS)('shuffle with %s', (algorithm) => {
  it('returns a permutation of the input without mutating it', () => {
    const input = [...DECK];

    const result = shuffle(input, algorithm, new SeededRandom('seed'));

    expect(input).toEqual(DECK);
    expect([...result].sort((left, right) => left - right)).toEqual(DECK);
  });

  it('replays the same order for the same seed', () => {
    expect(shuffle(DECK, algorithm, new SeededRandom('seed'))).toEqual(
      shuffle(DECK, algorithm, new SeededRandom('seed')),
    );
  });

  it('handles an empty input', () => {
    expect(shuffle([], algorithm, new SeededRandom('seed'))).toEqual([]);
  });
});

describe('random rotation', () => {
  it('keeps the cyclic order of the deck', () => {
    const result = shuffle(DECK, 'random-rotation', new SeededRandom('seed'));

    result.forEach((card, index) => {
      expect(result[(index + 1) % result.length]).toBe((card + 1) % DECK.length);
    });
  });
});
