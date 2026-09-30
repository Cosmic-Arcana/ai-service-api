import { Module } from '@nestjs/common';
import { TarotController } from './tarot.controller';

@Module({
  controllers: [TarotController],
})
export class TarotModule {}
