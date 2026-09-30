import type { DrawCardsPayload } from './contracts/draw-cards.contract';
import { findTarotCard } from './tarot-deck';
import { drawReading, getTarotCard } from './tarot-use-cases';

const GOLDEN_THREE_CARD_DRAW = ['seven-of-cups', 'the-empress', 'temperance'];

const payload: DrawCardsPayload = {
  userId: 'user-123',
  question: 'Will the new job suit me?',
  spreadId: 'three-card',
  askedAt: '2026-09-21T09:00:00.000Z',
};

describe('drawReading', () => {
  it('shuffles with fisher-yates unless the caller picks another option', () => {
    expect(drawReading(payload).shuffle).toBe('fisher-yates');
    expect(drawReading({ ...payload, shuffle: 'random-sort' }).shuffle).toBe('random-sort');
  });

  it('replays the same reading for the same payload', () => {
    expect(drawReading(payload)).toEqual(drawReading({ ...payload }));
  });

  it('returns the meaning that matches each card orientation', () => {
    for (const drawn of drawReading(payload).cards) {
      const card = findTarotCard(drawn.cardId);

      expect(drawn.meaning).toBe(drawn.reversed ? card?.reversed : card?.upright);
    }
  });

  it('deals the pinned golden cards regardless of user, question and day', () => {
    const golden = drawReading({ ...payload, shuffle: 'golden-seed' });
    const someoneElse = drawReading({
      userId: 'user-456',
      question: 'Should I move abroad?',
      spreadId: 'three-card',
      shuffle: 'golden-seed',
      askedAt: '2027-01-01T00:00:00.000Z',
    });

    expect(golden.cards.map((drawn) => drawn.cardId)).toEqual(GOLDEN_THREE_CARD_DRAW);
    expect(someoneElse.cards).toEqual(golden.cards);
  });
});

describe('getTarotCard', () => {
  it('returns the card for a known id', () => {
    expect(getTarotCard({ cardId: 'the-star' }).card?.name).toBe('The Star');
  });

  it('returns null for an unknown id', () => {
    expect(getTarotCard({ cardId: 'the-intern' }).card).toBeNull();
  });
});
