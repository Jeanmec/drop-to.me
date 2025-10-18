import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PeerService } from './peer/peer.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ACCEPTED_ORIGINS,
    credentials: true,
  });

  // Setup PeerJS on a separate port
  const peerService = app.get(PeerService);
  peerService.setupPeerServer();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
