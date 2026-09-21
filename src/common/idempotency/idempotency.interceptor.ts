import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Observable, of, tap, throwError } from 'rxjs';
import type { Request, Response } from 'express';
import {
  IDEMPOTENCY_KEY_HEADER,
  IDEMPOTENCY_REPLAYED_HEADER,
} from '../correlation/correlation.constants';
import type { MessageEnvelope } from '../messaging/message-envelope';
import { fingerprintOf, IdempotencyStore } from './idempotency-store.service';

interface RequestIdentity {
  key: string;
  fingerprint: string;
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(private readonly store: IdempotencyStore) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const identity = this.identify(context);
    if (!identity) {
      return next.handle();
    }

    const { key, fingerprint } = identity;
    const reservation = this.store.reserve(key, fingerprint);

    if (!reservation.reserved) {
      return this.handleDuplicate(context, key, fingerprint, reservation.existing);
    }

    return next.handle().pipe(
      tap({
        next: (body) => this.store.complete(key, this.statusCodeOf(context), body),
        error: () => this.store.release(key),
      }),
    );
  }

  private handleDuplicate(
    context: ExecutionContext,
    key: string,
    fingerprint: string,
    existing: { state: string; fingerprint: string; statusCode?: number; body?: unknown },
  ): Observable<unknown> {
    if (existing.fingerprint !== fingerprint) {
      this.logger.warn('idempotency key reused with a different payload', {
        idempotencyKey: key,
        outcome: 'rejected',
      });
      return throwError(
        () =>
          new UnprocessableEntityException({
            code: 'idempotency_key_reuse',
            message: `${IDEMPOTENCY_KEY_HEADER} was already used with a different request payload`,
          }),
      );
    }

    if (existing.state === 'in_flight') {
      this.logger.warn('duplicate request rejected while original is in flight', {
        idempotencyKey: key,
        outcome: 'rejected',
      });
      return throwError(
        () =>
          new ConflictException({
            code: 'idempotency_key_in_flight',
            message: 'a request with this idempotency key is still being processed',
          }),
      );
    }

    this.logger.log('replaying stored idempotent response', {
      idempotencyKey: key,
      outcome: 'replayed',
    });

    if (context.getType() === 'http') {
      const response = context.switchToHttp().getResponse<Response>();
      response.setHeader(IDEMPOTENCY_REPLAYED_HEADER, 'true');
      if (existing.statusCode) {
        response.status(existing.statusCode);
      }
    }

    return of(existing.body);
  }

  private statusCodeOf(context: ExecutionContext): number {
    if (context.getType() !== 'http') {
      return 200;
    }
    return context.switchToHttp().getResponse<Response>().statusCode;
  }

  private identify(context: ExecutionContext): RequestIdentity | null {
    if (context.getType() === 'rpc') {
      const payload = context.switchToRpc().getData<MessageEnvelope>();
      const key = payload?.meta?.idempotencyKey;
      if (!key) {
        return null;
      }
      return {
        key,
        fingerprint: fingerprintOf([context.getHandler().name, payload.data]),
      };
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = request.header(IDEMPOTENCY_KEY_HEADER);
    if (!key) {
      return null;
    }

    return {
      key,
      fingerprint: fingerprintOf([
        request.method,
        request.route?.path ?? request.path,
        request.body,
      ]),
    };
  }
}
