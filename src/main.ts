import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { LogLevel } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';
import { StructuredLogger } from './common/logging/structured-logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get(ConfigService);
  const serviceName = config.getOrThrow<string>('serviceName');
  const logger = new StructuredLogger(serviceName, config.getOrThrow<LogLevel>('logLevel'));
  app.useLogger(logger);

  const tcp = config.getOrThrow<AppConfig['tcp']>('tcp');
  const http = config.getOrThrow<AppConfig['http']>('http');

  // inheritAppConfig shares the global interceptors with the TCP transport, so correlation,
  // logging and idempotency apply to message handlers as well as HTTP routes.
  app.connectMicroservice<MicroserviceOptions>(
    { transport: Transport.TCP, options: { host: tcp.host, port: tcp.port } },
    { inheritAppConfig: true },
  );

  app.enableShutdownHooks();

  await app.startAllMicroservices();
  await app.listen(http.port);

  logger.log('service started', {
    context: 'Bootstrap',
    httpPort: http.port,
    tcpPort: tcp.port,
    nodeEnv: config.getOrThrow<string>('nodeEnv'),
  });

  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      logger.log('shutdown signal received', { context: 'Bootstrap', signal });
    });
  }
}

void bootstrap();
