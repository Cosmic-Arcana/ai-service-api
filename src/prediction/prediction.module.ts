import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';
import {
  ANTHROPIC_CLIENT,
  AnthropicReadingAdapter,
  createAnthropicClient,
} from './anthropic-reading.adapter';
import { PredictionController } from './prediction.controller';
import { StubReadingAdapter } from './stub-reading.adapter';
import { READING_INTERPRETER } from './reading-interpreter.port';

@Module({
  controllers: [PredictionController],
  providers: [
    {
      provide: ANTHROPIC_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createAnthropicClient(config.getOrThrow<AppConfig['anthropic']>('anthropic').timeoutMs),
    },
    AnthropicReadingAdapter,
    StubReadingAdapter,
    {
      // Default is the stub: a developer, a test and an application level run all work with no key
      // and no billed call. `AI_INTERPRETER=anthropic` switches to the real model.
      provide: READING_INTERPRETER,
      inject: [ConfigService, StubReadingAdapter, AnthropicReadingAdapter],
      useFactory: (
        config: ConfigService,
        stub: StubReadingAdapter,
        anthropic: AnthropicReadingAdapter,
      ) =>
        config.getOrThrow<AppConfig['anthropic']>('anthropic').interpreter === 'anthropic'
          ? anthropic
          : stub,
    },
  ],
})
export class PredictionModule {}
