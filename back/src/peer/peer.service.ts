import { Injectable } from '@nestjs/common';
import { PeerServer } from 'peer';

@Injectable()
export class PeerService {
  setupPeerServer(): void {
    const peerPort = parseInt(process.env.PEERJS_PORT!, 10);
    const allowedOrigin = process.env.CORS_ACCEPTED_ORIGINS!;

    const peerServer = PeerServer({
      port: peerPort,
      path: '/',
      allow_discovery: true,
      corsOptions: {
        origin: allowedOrigin,
        credentials: true,
      },
    });

    peerServer.on('connection', (client: { getId: () => string }): void => {
      console.log(`[PeerJS] Client connected: ${client.getId()}`);
    });

    peerServer.on('disconnect', (client: { getId: () => string }): void => {
      console.log(`[PeerJS] Client disconnected: ${client.getId()}`);
    });

    console.log(`📡 PeerJS server running on port ${peerPort}`);
  }
}
