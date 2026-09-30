import { TAROT_SUITS } from './tarot-card';
import { findTarotCard, TAROT_DECK } from './tarot-deck';

describe('TAROT_DECK', () => {
  it('holds 78 cards with unique ids', () => {
    expect(TAROT_DECK).toHaveLength(78);
    expect(new Set(TAROT_DECK.map((card) => card.id)).size).toBe(78);
  });

  it('numbers the 22 major arcana from The Fool (0) to The World (21)', () => {
    const majors = TAROT_DECK.filter((card) => card.arcana === 'major');

    expect(majors.map((card) => card.number)).toEqual(
      Array.from({ length: 22 }, (_, index) => index),
    );
    expect(majors[0].name).toBe('The Fool');
    expect(majors[21].name).toBe('The World');
  });

  it.each(TAROT_SUITS)('holds Ace to King of %s with the suit element', (suit) => {
    const cards = TAROT_DECK.filter((card) => card.arcana === 'minor' && card.suit === suit);
    const elements = new Set(cards.map((card) => (card.arcana === 'minor' ? card.element : null)));

    expect(cards.map((card) => card.number)).toEqual(
      Array.from({ length: 14 }, (_, index) => index + 1),
    );
    expect(cards[0].id).toBe(`ace-of-${suit}`);
    expect(cards[13].id).toBe(`king-of-${suit}`);
    expect(elements.size).toBe(1);
  });

  it('gives every card keywords and both orientations', () => {
    for (const card of TAROT_DECK) {
      expect(card.keywords.length).toBeGreaterThan(0);
      expect(card.upright).not.toBe('');
      expect(card.reversed).not.toBe('');
    }
  });
});

describe('findTarotCard', () => {
  it('finds a card by id', () => {
    expect(findTarotCard('the-tower')).toMatchObject({
      name: 'The Tower',
      astrology: 'Mars',
    });
  });

  it('returns undefined for an unknown id', () => {
    expect(findTarotCard('the-intern')).toBeUndefined();
  });
});
