import { WebSocketServer } from 'ws';
import { acceptSocket } from './pairing';

const DEFAULT_PORT = 8080;
const MAX_FRAME_BYTES = 1024 * 1024;

const secret = process.env.RELAY_AUTH_SECRET;
if (!secret) {
  throw new Error('RELAY_AUTH_SECRET is not set');
}

const server = new WebSocketServer({
  host: process.env.HOST,
  port: Number(process.env.PORT ?? DEFAULT_PORT),
  perMessageDeflate: false,
  maxPayload: MAX_FRAME_BYTES,
});

server.on('connection', (socket) => acceptSocket(socket, secret));
