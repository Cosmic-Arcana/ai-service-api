import { StubReadingAdapter } from './stub-reading.adapter';

const cards = [
  { positionKey: 'past', cardId: 'the-star', cardName: 'The Star', reversed: false },
  { positionKey: 'present', cardId: 'the-tower', cardName: 'The Tower', reversed: true },
];

describe('StubReadingAdapter', () => {
  const adapter = new StubReadingAdapter();

  it('names every drawn card once, with its position', async () => {
    const { interpretation } = await adapter.interpret({ question: 'will it hold?', cards });

    for (const card of cards) {
      expect(interpretation.split(card.cardName).length - 1).toBe(1);
      expect(interpretation).toContain(card.positionKey);
    }
  });

  it('marks a reversed card as reversed', async () => {
    const { interpretation } = await adapter.interpret({ question: 'will it hold?', cards });

    expect(interpretation).toContain('The Tower (reversed)');
    expect(interpretation).not.toContain('The Star (reversed)');
  });

  it('always declares the reading fictional', async () => {
    const result = await adapter.interpret({ question: 'will it hold?', cards });

    expect(result.fictional).toBe(true);
  });

  it('reads the same question the same way twice', async () => {
    const [first, second] = await Promise.all([
      adapter.interpret({ question: 'will it hold?', cards }),
      adapter.interpret({ question: 'will it hold?', cards }),
    ]);

    expect(first.interpretation).toBe(second.interpretation);
  });

  it('reads differently when the question changes', async () => {
    const first = await adapter.interpret({ question: 'will it hold?', cards });
    const second = await adapter.interpret({ question: 'should i let go?', cards });

    expect(first.interpretation).not.toBe(second.interpretation);
  });
});
