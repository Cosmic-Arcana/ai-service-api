import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AI_MESSAGE_PATTERNS } from '../common/messaging/ai-message-patterns';
import { parseDrawCardsPayload, unwrapEnvelope } from '../tarot/tarot-rpc.payload';
import { createPrediction } from './create-prediction.use-case';
import { InterpretationRefusedError } from './interpretation-refused.error';
import { READING_INTERPRETER, type ReadingInterpreterPort } from './reading-interpreter.port';

@Controller()
export class PredictionController {
  constructor(@Inject(READING_INTERPRETER) private readonly interpreter: ReadingInterpreterPort) {}

  @MessagePattern(AI_MESSAGE_PATTERNS.createPrediction)
  async create(@Payload() envelope: unknown) {
    try {
      return await createPrediction(parseDrawCardsPayload(envelope), this.interpreter);
    } catch (error) {
      if (error instanceof InterpretationRefusedError) {
        throw new RpcException({ code: error.code, message: error.message });
      }
      throw error;
    }
  }

  @MessagePattern(AI_MESSAGE_PATTERNS.interpretReading)
  async interpret(@Payload() envelope: unknown) {
    const data = unwrapEnvelope(envelope).data as {
      question?: unknown;
      cards?: unknown;
    };
    if (typeof data.question !== 'string' || !Array.isArray(data.cards)) {
      throw new RpcException({
        code: 'invalid_payload',
        message: 'question and cards are required',
      });
    }
    try {
      return await this.interpreter.interpret({
        question: data.question,
        cards: data.cards,
      });
    } catch (error) {
      if (error instanceof InterpretationRefusedError) {
        throw new RpcException({ code: error.code, message: error.message });
      }
      throw error;
    }
  }
}
