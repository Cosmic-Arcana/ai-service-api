import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AI_MESSAGE_PATTERNS } from '../common/messaging/ai-message-patterns';
import type { DrawCardsResult } from './contracts/draw-cards.contract';
import type { GetTarotCardResult } from './contracts/tarot-card.contract';
import { parseDrawCardsPayload, parseGetTarotCardPayload } from './tarot-rpc.payload';
import { drawReading, getTarotCard } from './tarot-use-cases';

@Controller()
export class TarotController {
  @MessagePattern(AI_MESSAGE_PATTERNS.drawCards)
  draw(@Payload() envelope: unknown): DrawCardsResult {
    return drawReading(parseDrawCardsPayload(envelope));
  }

  @MessagePattern(AI_MESSAGE_PATTERNS.tarotCard)
  card(@Payload() envelope: unknown): GetTarotCardResult {
    return getTarotCard(parseGetTarotCardPayload(envelope));
  }
}
