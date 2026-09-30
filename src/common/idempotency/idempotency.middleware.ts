import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { IDEMPOTENCY_KEY_HEADER } from '../correlation/correlation.constants';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

/**
 * Rejects malformed traffic before it reaches a handler. Enforcement against the store
 * lives in IdempotencyInterceptor, which also covers the TCP transport where middleware
 * never runs.
 */
@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (!MUTATING_METHODS.has(req.method)) {
      return next();
    }

    const key = req.header(IDEMPOTENCY_KEY_HEADER);

    if (!key) {
      throw new BadRequestException({
        code: 'idempotency_key_missing',
        message: `${IDEMPOTENCY_KEY_HEADER} header is required for ${req.method} requests`,
      });
    }

    if (!IDEMPOTENCY_KEY_PATTERN.test(key)) {
      throw new BadRequestException({
        code: 'idempotency_key_malformed',
        message: `${IDEMPOTENCY_KEY_HEADER} must be 16-128 characters of [A-Za-z0-9_-]`,
      });
    }

    next();
  }
}
