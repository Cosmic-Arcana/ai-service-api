import { RpcException } from '@nestjs/microservices';
import { AI_MESSAGE_PATTERNS } from '../common/messaging/ai-message-patterns';
import { TarotController } from './tarot.controller';

const envelope = (data: unknown) => ({
  meta: {
    correlationId: 'corr-s1',
    issuedAt: '2026-09-29T00:00:00.000Z',
    origin: 'test',
  },
  data,
});

describe('TarotController', () => {
  const controller = new TarotController();

  it('draws on ai.tarot.draw with a valid envelope', () => {
    const result = controller.draw(
      envelope({
        userId: 'user-123',
        question: 'Will the new job suit me?',
        spreadId: 'three-card',
        askedAt: '2026-09-21T09:00:00.000Z',
      }),
    );
    expect(result.spreadId).toBe('three-card');
    expect(result.cards).toHaveLength(3);
    expect(AI_MESSAGE_PATTERNS.drawCards).toBe('ai.tarot.draw');
  });

  it('looks up a card on ai.tarot.card', () => {
    expect(controller.card(envelope({ cardId: 'the-star' })).card?.name).toBe('The Star');
  });

  it('rejects an invalid draw payload as RpcException', () => {
    expect(() => controller.draw({ not: 'an envelope' })).toThrow(RpcException);
    expect(() =>
      controller.draw(
        envelope({
          userId: 'user-123',
          question: 'x',
          spreadId: 'celtic-cross',
          askedAt: '2026-09-21T09:00:00.000Z',
        }),
      ),
    ).toThrow(RpcException);
  });
});
