import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PeerServer } from 'peer';

@Injectable()
export class PeerService implements OnModuleDestroy {
  private readonly logger = new Logger(PeerService.name);
  private peerServer: ReturnType<typeof PeerServer> | null = null;

  setupPeerServer(): void {
    const rawPort = process.env.PEERJS_PORT;
    if (!rawPort) {
      throw new Error('PEERJS_PORT is not defined in environment variables');
    }
    const peerPort = parseInt(rawPort, 10);
    if (Number.isNaN(peerPort)) {
      throw new Error(`Invalid PEERJS_PORT: ${rawPort}`);
    }

    const allowedOrigin = process.env.CORS_ACCEPTED_ORIGINS || '*';

    this.peerServer = PeerServer({
      port: peerPort,
      path: '/',
      allow_discovery: true,
      corsOptions: {
        origin: allowedOrigin,
        credentials: true,
      },
      key: 'peerjs',
    });

    this.peerServer.on(
      'connection',
      (client: { getId: () => string }): void => {
        this.logger.log(`Client connected: ${client.getId()}`);
      },
    );

    this.peerServer.on(
      'disconnect',
      (client: { getId: () => string }): void => {
        this.logger.log(`Client disconnected: ${client.getId()}`);
      },
    );

    this.logger.log(`PeerJS server running on port ${peerPort}`);
  }

  onModuleDestroy() {
    if (this.peerServer) {
      this.peerServer.removeAllListeners();
      this.peerServer = null;
    }
  }
}
