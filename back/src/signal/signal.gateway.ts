import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { StatsService } from '../stats/stats.service';

interface SignalData {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: any;
  candidate?: any;
  target: string;
  sender: string;
  room: string;
  fileSize?: number;
}

@WebSocketGateway({ cors: true })
export class SignalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;

  constructor(
    private redisService: RedisService,
    private statsService: StatsService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(socket: Socket) {
    const ip = (socket.handshake.headers['x-forwarded-for'] ||
      socket.handshake.address) as string;
    await socket.join(ip);
    await this.redisService.addClient(ip, socket.id);

    const clients = (await this.redisService.getClients(ip)).filter(
      (id) => id !== socket.id,
    );
    this.server.to(ip).emit('clients', clients);
  }

  async handleDisconnect(socket: Socket) {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        await this.redisService.removeClient(room, socket.id);
        const clients = (await this.redisService.getClients(room)).filter(
          (id) => id !== socket.id,
        );
        this.server.to(room).emit('clients', clients);
      }
    }
  }

  @SubscribeMessage('signal')
  async handleSignal(@MessageBody() data: SignalData) {
    this.server.to(data.target).emit('signal', data);
    console.log(`📡 ${data.sender} -> ${data.target} (${data.type})`);

    if (data.fileSize) {
      await this.statsService.addTransfer(
        data.sender,
        data.target,
        data.fileSize,
      );
    }
  }
}
