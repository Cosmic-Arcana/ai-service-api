import { Global, Module } from '@nestjs/common';
import { IdempotencyStore } from './idempotency/idempotency-store.service';

@Global()
@Module({
  providers: [IdempotencyStore],
  exports: [IdempotencyStore],
})
export class CommonModule {}
