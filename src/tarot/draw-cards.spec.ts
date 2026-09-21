import { drawCards } from './draw-cards';
import { SHUFFLE_ALGORITHMS } from './shuffle-algorithms';
import { TAROT_DECK } from './tarot-deck';
import { TAROT_SPREADS, TarotSpread } from './tarot-spread';

const WHOLE_DECK: TarotSpread = {
  id: 'whole-deck',
  name: 'Whole deck',
  positions: TAROT_DECK.map((card) => ({ key: card.id, label: card.name, meaning: card.name })),
};

describe.each(SHUFFLE_ALGORITHMS)('drawCards with %s', (algorithm) => {
  it('draws one card per spread position, in position order', () => {
    const drawn = drawCards(TAROT_SPREADS['three-card'], 'seed', algorithm);

    expect(drawn.map((card) => card.position.key)).toEqual(['past', 'present', 'future']);
  });

  it('replays the same draw for the same seed', () => {
    expect(drawCards(TAROT_SPREADS['three-card'], 'seed', algorithm)).toEqual(
      drawCards(TAROT_SPREADS['three-card'], 'seed', algorithm),
    );
  });

  it('never draws the same card twice, even across the whole deck', () => {
    const ids = drawCards(WHOLE_DECK, 'seed', algorithm).map((drawn) => drawn.card.id);

    expect(new Set(ids).size).toBe(78);
  });
});
