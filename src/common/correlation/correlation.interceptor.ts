import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { isValidCorrelationId } from './correlation.constants';
import { runWithCorrelationId } from './correlation.storage';
import type { MessageEnvelope } from '../messaging/message-envelope';

/**
 * TCP counterpart to CorrelationMiddleware. Middleware never runs on the microservice
 * transport, so RPC handlers pick the correlation id out of the message envelope instead.
 */
@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const payload = context.switchToRpc().getData<MessageEnvelope>();
    const incoming = payload?.meta?.correlationId;
    const correlationId = isValidCorrelationId(incoming) ? incoming : randomUUID();

    return new Observable((subscriber) =>
      runWithCorrelationId(correlationId, () => next.handle().subscribe(subscriber)),
    );
  }
}
