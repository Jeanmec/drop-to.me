import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { PeerService } from './peer/peer.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
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

  const peerService = app.get(PeerService);
  peerService.setupPeerServer();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
