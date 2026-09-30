import Anthropic from '@anthropic-ai/sdk';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';
import { InterpretationRefusedError } from './interpretation-refused.error';
import type {
  InterpretationRequest,
  InterpretationResult,
  ReadingInterpreterPort,
} from './reading-interpreter.port';

const SYSTEM = [
  'You write fictional tarot-style interpretations for entertainment.',
  'They are not advice and not factual claims about the future.',
  'Reply with JSON only: {"interpretation":"<plain text>"}.',
  'Do not add other keys. Do not mention NASA as evidence that prediction works.',
].join(' ');

type AnthropicClient = {
  messages: {
    create: (body: Record<string, unknown>) => Promise<{
      stop_reason: string | null;
      content: Array<{ type: string; text?: string }>;
    }>;
  };
};

export const ANTHROPIC_CLIENT = Symbol('ANTHROPIC_CLIENT');

export const createAnthropicClient = (timeoutMs: number): AnthropicClient =>
  new Anthropic({ maxRetries: 0, timeout: timeoutMs }) as unknown as AnthropicClient;

const parseInterpretationJson = (text: string): string => {
  const parsed: unknown = JSON.parse(text);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as { interpretation?: unknown }).interpretation !== 'string' ||
    (parsed as { interpretation: string }).interpretation.trim() === ''
  ) {
    throw new Error('model returned invalid interpretation json');
  }
  return (parsed as { interpretation: string }).interpretation.trim();
};

@Injectable()
export class AnthropicReadingAdapter implements ReadingInterpreterPort {
  constructor(
    @Inject(ANTHROPIC_CLIENT) private readonly client: AnthropicClient,
    private readonly config: ConfigService,
  ) {}

  async interpret(request: InterpretationRequest): Promise<InterpretationResult> {
    const anthropic = this.config.getOrThrow<AppConfig['anthropic']>('anthropic');
    const message = await this.client.messages.create({
      model: anthropic.model,
      max_tokens: 1024,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            questionLength: request.question.length,
            question: request.question,
            cards: request.cards,
          }),
        },
      ],
    });

    if (message.stop_reason === 'refusal') {
      throw new InterpretationRefusedError();
    }

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock?.text) {
      throw new InterpretationRefusedError();
    }

    return {
      interpretation: parseInterpretationJson(textBlock.text),
      fictional: true,
    };
  }
}
