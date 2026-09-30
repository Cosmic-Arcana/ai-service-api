import { InterpretationRefusedError } from './interpretation-refused.error';
import { AnthropicReadingAdapter } from './anthropic-reading.adapter';

describe('AnthropicReadingAdapter', () => {
  const config = {
    getOrThrow: () => ({ model: 'claude-opus-5', effort: 'high', timeoutMs: 60_000 }),
  };

  it('returns a fictional interpretation from model JSON', async () => {
    const create = jest.fn().mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: '{"interpretation":"a fictional path opens"}' }],
    });
    const adapter = new AnthropicReadingAdapter({ messages: { create } }, config as never);
    const result = await adapter.interpret({
      question: 'Will the new job suit me?',
      cards: [{ positionKey: 'focus', cardId: 'the-star', cardName: 'The Star', reversed: false }],
    });
    expect(result).toEqual({ interpretation: 'a fictional path opens', fictional: true });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-opus-5',
        system: [expect.objectContaining({ cache_control: { type: 'ephemeral' } })],
      }),
    );
  });

  it('maps a model refusal to InterpretationRefusedError', async () => {
    const adapter = new AnthropicReadingAdapter(
      {
        messages: {
          create: jest.fn().mockResolvedValue({ stop_reason: 'refusal', content: [] }),
        },
      },
      config as never,
    );
    await expect(adapter.interpret({ question: 'x', cards: [] })).rejects.toBeInstanceOf(
      InterpretationRefusedError,
    );
  });
});
