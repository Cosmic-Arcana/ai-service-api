import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AI_MESSAGE_PATTERNS } from '../common/messaging/ai-message-patterns';
import type { InterpretReadingResult } from './interpretation.contract';
import { interpretReading } from './interpret-reading';
import { parseInterpretReadingPayload } from './interpretation-rpc.payload';
import { InterpreterPort } from './interpreter.port';

@Controller()
export class InterpretationController {
  constructor(private readonly interpreter: InterpreterPort) {}

  @MessagePattern(AI_MESSAGE_PATTERNS.interpretReading)
  async interpret(@Payload() envelope: unknown): Promise<InterpretReadingResult> {
    return interpretReading(this.interpreter, parseInterpretReadingPayload(envelope));
  }
}
