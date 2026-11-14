import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ACCEPTED_ORIGINS;
  if (!corsOrigin) {
    logger.warn(
      'CORS_ACCEPTED_ORIGINS is not set — CORS will reject all origins',
    );
  }

  app.enableCors({
    origin: corsOrigin || false,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap().catch((error: unknown) => {
  logger.error(
    'Failed to start application',
    error instanceof Error ? error.stack : error,
  );
  process.exit(1);
});
