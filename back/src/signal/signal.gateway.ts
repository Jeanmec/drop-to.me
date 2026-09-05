import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { StatsService } from '../stats/stats.service';
import { RedisService } from 'src/redis/redis.service';
import { getHashedIp, extractIp } from 'src/utils/ip.utils';
import { TAddStatPayload } from '../types/statistics.t';

interface SocketData {
  roomId?: string;
}

@Injectable()
@WebSocketGateway({
  path: '/socket.io',
  transports: ['websocket'],
})
export class SignalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SignalGateway.name);
  private server: Server;

  constructor(
    private redisService: RedisService,
    @Inject(forwardRef(() => StatsService))
    private statsService: StatsService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket) {
    try {
      const result = await this.statsService.updateStats('user');
      if (result) {
        this.server.emit('update-stat', result);
      }
    } catch (error) {
      this.logger.error(
        `handleConnection failed for ${client.id}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private getRoomId(socket: Socket, roomCode?: string): string {
    if (roomCode && roomCode.trim().length > 0) {
      return `room:${roomCode.trim().toUpperCase()}`;
    }
    return getHashedIp(socket.request);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: { peerId: string; roomCode?: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!data?.peerId || typeof data.peerId !== 'string') {
        this.logger.warn(`Invalid join-room payload from ${socket.id}`);
        return;
      }

      const peerId = data.peerId.slice(0, 64);
      const roomCode = data.roomCode;
      const roomId = this.getRoomId(socket, roomCode);

      (socket.data as SocketData).roomId = roomId;
      await socket.join(roomId);

      await this.redisService.addPeer(roomId, socket.id, peerId);

      const peersObj = await this.redisService.getClients(roomId);

      const activePeers = await this.cleanDeadPeers(roomId, peersObj);
      const targetPeers = activePeers.filter((p) => p !== peerId);

      this.alertPeerJoined(roomId, peerId);

      socket.emit('join-success', {
        peers: targetPeers,
        ip: extractIp(socket.request),
        roomCode: roomCode?.trim().toUpperCase() ?? null,
      });
    } catch (error) {
      this.logger.error(
        `handleJoinRoom failed for ${socket.id}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(@ConnectedSocket() socket: Socket) {
    try {
      const data = socket.data as SocketData;
      const roomId = data.roomId;
      if (!roomId) return;

      const peerId = await this.redisService.getClient(roomId, socket.id);
      await this.redisService.removeClient(roomId, socket.id);
      await socket.leave(roomId);
      data.roomId = undefined;

      if (peerId && !(await this.isPeerStillInRoom(roomId, peerId))) {
        this.sendClientLeave(roomId, peerId);
      }
    } catch (error) {
      this.logger.error(
        `handleLeaveRoom failed for ${socket.id}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async cleanDeadPeers(
    roomId: string,
    peersObj: Record<string, string>,
  ): Promise<string[]> {
    const activePeerIds: string[] = [];
    const socketsInRoom = await this.server.in(roomId).fetchSockets();
    const activeSocketIds = new Set(socketsInRoom.map((s) => s.id));

    const deadSocketIds: string[] = [];
    for (const [socketId, peerId] of Object.entries(peersObj)) {
      if (activeSocketIds.has(socketId)) {
        activePeerIds.push(peerId);
      } else {
        deadSocketIds.push(socketId);
      }
    }

    await Promise.all(
      deadSocketIds.map((id) => this.redisService.removeClient(roomId, id)),
    );

    return activePeerIds;
  }

  async handleDisconnect(socket: Socket) {
    try {
      const roomId =
        (socket.data as SocketData).roomId ?? getHashedIp(socket.request);
      const peerId = await this.redisService.getClient(roomId, socket.id);
      await this.redisService.removeClient(roomId, socket.id);
      if (peerId && !(await this.isPeerStillInRoom(roomId, peerId))) {
        this.sendClientLeave(roomId, peerId);
      }
    } catch (error) {
      this.logger.error(
        `handleDisconnect failed for ${socket.id}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async isPeerStillInRoom(
    roomId: string,
    peerId: string,
  ): Promise<boolean> {
    const clients = await this.redisService.getClients(roomId);
    return Object.values(clients).includes(peerId);
  }

  sendClientLeave(room: string, peerId: string): void {
    this.server.to(room).emit('peer-left', peerId);
  }

  alertPeerJoined(room: string, peerId: string): void {
    this.server.to(room).emit('peer-joined', peerId);
  }

  @SubscribeMessage('get-stat')
  async handleGetStat() {
    try {
      return await this.statsService.getStats();
    } catch (error) {
      this.logger.error(
        'handleGetStat failed',
        error instanceof Error ? error.stack : error,
      );
      return null;
    }
  }

  @SubscribeMessage('add-stat')
  async handleAddStat(@MessageBody() data: TAddStatPayload) {
    try {
      if (!data?.type) return;

      const { type, fileSize } = data;

      if (
        type === 'file' &&
        (typeof fileSize !== 'number' ||
          fileSize <= 0 ||
          !Number.isFinite(fileSize))
      ) {
        this.logger.warn(`Invalid fileSize in add-stat: ${fileSize}`);
        return;
      }

      const result = await this.statsService.updateStats(type, fileSize);

      if (result) {
        this.server.emit('update-stat', result);
      }
    } catch (error) {
      this.logger.error(
        'handleAddStat failed',
        error instanceof Error ? error.stack : error,
      );
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
