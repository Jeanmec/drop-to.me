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
import { getHashedIp, extractIp } from 'src/utils/ip.utils';
import { Inject, forwardRef } from '@nestjs/common';
import { TAddStatPayload } from 'src/types/statistics.t';

@Injectable()
@WebSocketGateway({
  path: '/socket.io',
  transports: ['websocket'],
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

  async handleConnection() {
    const result = await this.statsService.updateStats('user');
    if (result) {
      this.server.emit('update-stat', result);
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: { peerId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { peerId } = data;
    const hashedIp = getHashedIp(socket.request);

    await socket.join(hashedIp);

    await this.redisService.addPeer(hashedIp, socket.id, peerId);

    const peersObj = await this.redisService.getClients(hashedIp);

    const activePeers = await this.cleanDeadPeers(hashedIp, peersObj);
    const targetPeers = activePeers.filter((p) => p !== peerId);

    this.alertPeerJoined(hashedIp, peerId);

    socket.emit('join-success', {
      peers: targetPeers,
      ip: extractIp(socket.request),
    });
  }

  private async cleanDeadPeers(
    hashedIp: string,
    peersObj: Record<string, string>,
  ): Promise<string[]> {
    const activePeerIds: string[] = [];
    const socketsInRoom = await this.server.in(hashedIp).fetchSockets();
    const activeSocketIds = new Set(socketsInRoom.map((s) => s.id));

    for (const [socketId, peerId] of Object.entries(peersObj)) {
      if (activeSocketIds.has(socketId)) {
        activePeerIds.push(peerId);
      } else {
        await this.redisService.removeClient(hashedIp, socketId);
      }
    }

    return activePeerIds;
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

  alertPeerJoined(room: string, peerId: string): void {
    this.server.to(room).emit('peer-joined', peerId);
  }

  @SubscribeMessage('get-stat')
  async handleGetStat() {
    const stats = await this.statsService.getStats();
    return stats;
  }

  @SubscribeMessage('add-stat')
  async handleAddStat(@MessageBody() data: TAddStatPayload) {
    const { type, fileSize } = data;
    const result = await this.statsService.updateStats(type, fileSize);

    if (result) {
      this.server.emit('update-stat', result);
    }
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
