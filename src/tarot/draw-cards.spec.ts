import { drawCards } from './draw-cards';
import { TAROT_DECK } from './tarot-deck';
import { TAROT_SPREADS, TarotSpread } from './tarot-spread';

const GOLDEN_THREE_CARD_DRAW = ['the-tower', 'knight-of-swords', 'two-of-cups'];

const cardIds = (spread: TarotSpread, seed: string): string[] =>
  drawCards(spread, seed).map((drawn) => drawn.card.id);

describe('drawCards', () => {
  it('draws one card per spread position, in position order', () => {
    const drawn = drawCards(TAROT_SPREADS['three-card'], 'seed');

    expect(drawn.map((card) => card.position.key)).toEqual(['past', 'present', 'future']);
  });

  it('replays the same draw for the same seed', () => {
    expect(drawCards(TAROT_SPREADS['three-card'], 'seed')).toEqual(
      drawCards(TAROT_SPREADS['three-card'], 'seed'),
    );
  });

  it('never draws the same card twice, even across the whole deck', () => {
    const wholeDeck: TarotSpread = {
      id: 'whole-deck',
      name: 'Whole deck',
      positions: TAROT_DECK.map((card) => ({
        key: card.id,
        label: card.name,
        meaning: card.name,
      })),
    };

    expect(new Set(cardIds(wholeDeck, 'seed')).size).toBe(78);
  });

  it('keeps historical seeds mapped to the same cards', () => {
    expect(cardIds(TAROT_SPREADS['three-card'], 'golden-seed')).toEqual(GOLDEN_THREE_CARD_DRAW);
  });

  it('gives every card a fair chance and reverses about half of them', () => {
    const draws = 7_800;
    const counts = new Map<string, number>();
    let reversed = 0;

    for (let index = 0; index < draws; index += 1) {
      const [drawn] = drawCards(TAROT_SPREADS.single, `fairness-${index}`);
      counts.set(drawn.card.id, (counts.get(drawn.card.id) ?? 0) + 1);
      reversed += drawn.reversed ? 1 : 0;
    }

    expect(counts.size).toBe(78);
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(50);
      expect(count).toBeLessThan(150);
    }
    expect(reversed / draws).toBeGreaterThan(0.45);
    expect(reversed / draws).toBeLessThan(0.55);
  });
});
