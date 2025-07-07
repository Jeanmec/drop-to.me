import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { StatsService } from '../stats/stats.service';
import { RedisService } from 'src/redis/redis.service';
import { getHashedIp } from 'src/utils/ip.utils';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_WEB_SOCKET_ORIGINS,
    credentials: true,
  },
})
export class SignalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;

  constructor(
    private redisService: RedisService,
    @Inject(forwardRef(() => StatsService))
    private statsService: StatsService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(socket: Socket) {
    console.log('Client connecté :', socket.id);

    await this.statsService.addUser();

    const hashedIp = getHashedIp(socket.request);
    await socket.join(hashedIp);
    socket.emit('room', hashedIp);
  }

  async handleDisconnect(socket: Socket) {
    const hashedIp = getHashedIp(socket.request);
    const peerId = await this.redisService.getClient(hashedIp, socket.id);
    await this.redisService.removeClient(hashedIp, socket.id);
    if (peerId) {
      this.sendClientLeave(hashedIp, peerId);
    }
  }

  sendClientLeave(room: string, peerId: string): void {
    this.server.to(room).emit('peer-left', peerId);
  }

  sendClientJoin(room: string, peerId: string): void {
    this.server.to(room).emit('peer-joined', peerId);
  }

  sendSignalExcept(
    room: string,
    socketIdToSkip: string,
    event: string,
    data: object | string | number | boolean,
  ): void {
    this.server.in(room).except(socketIdToSkip).emit(event, data);
  }

  sendSignalToAll(
    event: string,
    data: object | string | number | boolean,
  ): void {
    this.server.emit(event, data);
  }
}
