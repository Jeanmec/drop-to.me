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
// import { removeElementFromStringArray } from 'src/utils/array.utils';

import { getHashedIp } from 'src/utils/ip.utils';

interface SignalData {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  room: string;
  fileSize?: number;
}
@Injectable()
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
    const hashedIp = getHashedIp(socket.request);
    await socket.join(hashedIp);
    socket.emit('room', hashedIp);
  }

  async handleDisconnect(socket: Socket) {
    const hashedIp = getHashedIp(socket.request);

    await socket.leave(hashedIp);
    socket.emit('room', hashedIp);
  }

  @SubscribeMessage('signal')
  async handleSignal(
    @MessageBody() data: SignalData,
    @ConnectedSocket() socket: Socket,
  ) {
    this.server.to(data.room).except(socket.id).emit('signal', data);

    if (data.fileSize) {
      await this.statsService.addTransfer(data.fileSize);
    }
  }

  @SubscribeMessage('leave')
  async handleLeave(
    @MessageBody() data: { room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const hashedIp = getHashedIp(socket.request);

    await socket.leave(data.room);
    socket.emit('room', data.room);

    this.server.to(data.room).emit('peer-left', hashedIp);
  }
  async sendPeerClientsUpdate(room: string, peerId: string): Promise<void> {
    const peers = await this.redisService.getPeers(room);
    this.server.to(room).emit('peers', peers);
  }
}
