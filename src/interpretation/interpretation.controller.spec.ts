import { RpcException } from '@nestjs/microservices';
import { InterpretationController } from './interpretation.controller';
import { StubInterpreter } from './stub-interpreter';

const envelope = (data: unknown) => ({
  meta: { correlationId: 'corr-1234abcd', issuedAt: new Date().toISOString(), origin: 'test' },
  data,
});

const card = {
  positionKey: 'present',
  positionLabel: 'Where it stands',
  cardId: 'the-star',
  cardName: 'The Star',
  reversed: false,
  keywords: ['hope'],
  meaning: 'a clear night after a long one',
};

describe('InterpretationController', () => {
  const controller = new InterpretationController(new StubInterpreter());

  it('interprets a well formed message', async () => {
    const result = await controller.interpret(
      envelope({ question: 'will it hold?', cards: [card], cosmic: null }),
    );

    expect(result.interpreter).toBe('stub');
    expect(result.text).toContain('The Star');
    expect(result.cards).toEqual([card]);
  });

  it.each([
    ['a bare payload', { question: 'q', cards: [card] }],
    ['a message that is not an envelope', envelope({ question: 'q', cards: [card] }).data],
    ['cards that are not an array', envelope({ question: 'q', cards: 'the star' })],
    ['a card missing its name', envelope({ question: 'q', cards: [{ ...card, cardName: '' }] })],
    [
      'a card without an orientation',
      envelope({ question: 'q', cards: [{ ...card, reversed: 'no' }] }),
    ],
    [
      'a cosmic motif without a source',
      envelope({ question: 'q', cards: [card], cosmic: { motif: 'm' } }),
    ],
  ])('rejects %s', async (_case, message) => {
    await expect(controller.interpret(message)).rejects.toThrow(RpcException);
  });
});
