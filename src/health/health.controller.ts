import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { AI_MESSAGE_PATTERNS } from '../common/messaging/ai-message-patterns';

const HEAP_LIMIT_BYTES = 512 * 1024 * 1024;

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  /** Liveness stays dependency-free: a failing dependency must not trigger a pod restart. */
  @Get('live')
  live(): { status: string } {
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this.health.check([() => this.memory.checkHeap('memory_heap', HEAP_LIMIT_BYTES)]);
  }

  @MessagePattern(AI_MESSAGE_PATTERNS.health)
  checkOverTcp(@Payload() _payload: unknown): { status: string } {
    return { status: 'ok' };
  }
}
