import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

import { StatsService } from '../stats/stats.service';
import { RedisService } from 'src/redis/redis.service';

import { getHashedIp } from 'src/utils/ip.utils';

interface SignalData {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  room: string;
  fileSize?: number;
}
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
    private statsService: StatsService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(socket: Socket) {
    console.log('Client connecté :', socket.id);

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

  @SubscribeMessage('peer/send')
  async handleSignal(
    @MessageBody() data: SignalData,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('Signal data received:', data);
    // this.server.to(data.room).except(socket.id).emit('signal', data);

    if (data.fileSize) {
      await this.statsService.addTransfer(data.fileSize);
    }
  }
  sendClientLeave(room: string, peerId: string): void {
    this.server.to(room).emit('peer-left', peerId);
  }

  sendClientJoin(room: string, peerId: string): void {
    this.server.to(room).emit('peer-joined', peerId);
  }
}
