import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';
import {
  ANTHROPIC_CLIENT,
  AnthropicReadingAdapter,
  createAnthropicClient,
} from './anthropic-reading.adapter';
import { PredictionController } from './prediction.controller';
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
    { provide: READING_INTERPRETER, useClass: AnthropicReadingAdapter },
  ],
})
export class PredictionModule {}
