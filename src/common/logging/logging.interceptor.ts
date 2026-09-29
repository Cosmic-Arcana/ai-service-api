import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';
import type { MessageEnvelope } from '../messaging/message-envelope';

function expressRoutePath(request: Request): string {
  const route = request.route as { path?: unknown } | undefined;
  return typeof route?.path === 'string' ? route.path : request.path;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = process.hrtime.bigint();
    const base = this.describe(context);

    return next.handle().pipe(
      tap({
        next: () =>
          this.logger.log('inbound handled', {
            ...base,
            ...this.timing(startedAt),
            outcome: 'success',
          }),
        error: (error: Error) =>
          this.logger.error('inbound failed', {
            ...base,
            ...this.timing(startedAt),
            outcome: 'error',
            errorName: error.name,
            errorMessage: error.message,
          }),
      }),
    );
  }

  private timing(startedAt: bigint): { durationMs: number } {
    return { durationMs: Number(process.hrtime.bigint() - startedAt) / 1_000_000 };
  }

  private describe(context: ExecutionContext): Record<string, unknown> {
    if (context.getType() === 'rpc') {
      const payload = context.switchToRpc().getData<MessageEnvelope>();
      return {
        transport: 'tcp',
        messagePattern: context.getHandler().name,
        origin: payload?.meta?.origin ?? null,
      };
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    return {
      transport: 'http',
      method: request.method,
      route: expressRoutePath(request),
      statusCode: response.statusCode,
    };
  }
}
