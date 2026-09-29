import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { CommonModule } from './common/common.module';
import { CorrelationMiddleware } from './common/correlation/correlation.middleware';
import { CorrelationInterceptor } from './common/correlation/correlation.interceptor';
import { IdempotencyMiddleware } from './common/idempotency/idempotency.middleware';
import { IdempotencyInterceptor } from './common/idempotency/idempotency.interceptor';
import { LoggingInterceptor } from './common/logging/logging.interceptor';
import { HealthModule } from './health/health.module';
import { TarotModule } from './tarot/tarot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: false, allowUnknown: true },
    }),
    CommonModule,
    HealthModule,
    TarotModule,
  ],
  providers: [
    // Order matters: correlation must be established before anything logs or dedupes.
    { provide: APP_INTERCEPTOR, useClass: CorrelationInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware, IdempotencyMiddleware).forRoutes('*');
  }
}
