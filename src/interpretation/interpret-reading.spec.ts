import { RpcException } from '@nestjs/microservices';
import type { DrawnCardView } from '../tarot/contracts/draw-cards.contract';
import { FICTION_NOTICE, interpretReading } from './interpret-reading';
import { StubInterpreter } from './stub-interpreter';

const cards: DrawnCardView[] = [
  {
    positionKey: 'past',
    positionLabel: 'What shaped it',
    cardId: 'eight-of-pentacles',
    cardName: 'Eight of Pentacles',
    reversed: false,
    keywords: ['craft', 'repetition'],
    meaning: 'patient work that compounds',
  },
  {
    positionKey: 'present',
    positionLabel: 'Where it stands',
    cardId: 'the-chariot',
    cardName: 'The Chariot',
    reversed: true,
    keywords: ['drive', 'control'],
    meaning: 'forcing a pace that resists it',
  },
  {
    positionKey: 'future',
    positionLabel: 'Where it leans',
    cardId: 'ace-of-wands',
    cardName: 'Ace of Wands',
    reversed: false,
    keywords: ['spark', 'beginning'],
    meaning: 'a new thread worth pulling',
  },
];

const request = {
  question: 'should i take the job?',
  cards,
  cosmic: null,
};

const interpret = () => interpretReading(new StubInterpreter(), request);

describe('interpretReading', () => {
  it('names every drawn card exactly once, with its position', async () => {
    const { text } = await interpret();

    for (const card of cards) {
      const occurrences = text.split(card.cardName).length - 1;
      expect(occurrences).toBe(1);
      expect(text).toContain(card.positionLabel);
    }
  });

  it('closes every reading with the same fictional framing', async () => {
    const { text } = await interpret();

    expect(text.trimEnd().endsWith(FICTION_NOTICE)).toBe(true);
  });

  it('reads the same question and cards the same way twice', async () => {
    const [first, second] = await Promise.all([interpret(), interpret()]);

    expect(first.text).toBe(second.text);
  });

  it('reads differently when the question changes', async () => {
    const other = await interpretReading(new StubInterpreter(), {
      ...request,
      question: 'should i stay where i am?',
    });
    const original = await interpret();

    expect(other.text).not.toBe(original.text);
  });

  it('weaves a cosmic motif in without touching the cards', async () => {
    const cosmic = { motif: 'a waxing crescent over a quiet sea', source: 'fixture' };

    const { text, cards: returned } = await interpretReading(new StubInterpreter(), {
      ...request,
      cosmic,
    });

    expect(text).toContain(cosmic.motif);
    expect(returned).toEqual(cards);
  });

  it('refuses a reading with no cards instead of inventing one', async () => {
    await expect(
      interpretReading(new StubInterpreter(), { ...request, cards: [] }),
    ).rejects.toThrow(RpcException);
  });

  it('refuses a reading with no question', async () => {
    await expect(
      interpretReading(new StubInterpreter(), { ...request, question: '   ' }),
    ).rejects.toThrow(RpcException);
  });
});
