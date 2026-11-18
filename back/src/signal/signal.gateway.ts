import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import {
  SocketEvent,
  StatType,
  normalizeRoomCode,
  validateRoomCode,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type TAddStat,
  type TJoinRoom,
  type TSignalToPeer,
  type TStatistics,
  type TStatUpdate,
} from '@droptome/shared';
import { StatsService } from '../stats/stats.service';
import { PeerClaimsService } from './peer-claims.service';
import { RelayTokensService } from './relay-tokens.service';
import { getHashedIp, extractIp } from 'src/utils/ip.utils';

interface SocketData {
  roomId?: string;
  peerId?: string;
}

type RoomServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>;

type RoomSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>;

const IDENTIFIER_MAX_LENGTH = 64;

const isIdentifier = (value: unknown): boolean =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= IDENTIFIER_MAX_LENGTH;

const isValidJoin = ({ peerId, token, roomCode }: TJoinRoom): boolean =>
  isIdentifier(peerId) &&
  isIdentifier(token) &&
  (roomCode === undefined ||
    (typeof roomCode === 'string' &&
      validateRoomCode(normalizeRoomCode(roomCode))));

@Injectable()
@WebSocketGateway({
  path: '/socket.io',
  transports: ['websocket'],
  pingInterval: 10_000,
  pingTimeout: 10_000,
})
export class SignalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SignalGateway.name);
  private server: RoomServer;

  constructor(
    private readonly statsService: StatsService,
    private readonly peerClaims: PeerClaimsService,
    private readonly relayTokens: RelayTokensService,
  ) {}

  afterInit(server: RoomServer) {
    this.server = server;
  }

  async handleConnection(client: RoomSocket): Promise<void> {
    try {
      const result = await this.statsService.updateStats(StatType.USER);
      if (result) {
        this.broadcastStatUpdate(result);
      }
    } catch (error) {
      this.logger.error(
        `handleConnection failed for ${client.id}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @SubscribeMessage(SocketEvent.JOIN_ROOM)
  async handleJoinRoom(
    @MessageBody() data: TJoinRoom,
    @ConnectedSocket() socket: RoomSocket,
  ): Promise<void> {
    try {
      if (!data || !isValidJoin(data)) {
        this.logger.warn(`Invalid join-room payload from ${socket.id}`);
        return;
      }
      if (!this.claimPeerId(socket, data.peerId, data.token)) {
        this.logger.warn(`Peer id refused for ${socket.id}`);
        return;
      }

      const { peerId } = data;
      const roomCode =
        data.roomCode === undefined ? null : normalizeRoomCode(data.roomCode);
      const roomId = roomCode
        ? `room:${roomCode}`
        : getHashedIp(socket.request);

      await this.leaveCurrentRoom(socket);
      socket.data.roomId = roomId;
      await socket.join(roomId);

      const peerIds = await this.getPeerIds(roomId);
      this.server.to(roomId).emit(SocketEvent.PEER_JOINED, peerId);
      socket.emit(SocketEvent.JOIN_SUCCESS, {
        peers: peerIds.filter((id) => id !== peerId),
        ip: extractIp(socket.request),
        roomCode,
      });
    } catch (error) {
      this.logger.error(
        `handleJoinRoom failed for ${socket.id}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @SubscribeMessage(SocketEvent.SIGNAL)
  async handleSignal(
    @MessageBody() data: TSignalToPeer,
    @ConnectedSocket() socket: RoomSocket,
  ): Promise<void> {
    try {
      const { roomId, peerId } = socket.data;
      if (!roomId || !peerId || typeof data?.to !== 'string') {
        return;
      }

      const sockets = await this.server.in(roomId).fetchSockets();
      sockets
        .filter((target) => target.data.peerId === data.to)
        .forEach((target) => {
          target.emit(SocketEvent.SIGNAL, {
            from: peerId,
            signal: data.signal,
          });
        });
    } catch (error) {
      this.logger.error(
        `handleSignal failed for ${socket.id}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async handleDisconnect(socket: RoomSocket): Promise<void> {
    try {
      const { roomId, peerId } = socket.data;
      if (!peerId) {
        return;
      }

      this.peerClaims.release(peerId);
      if (roomId) {
        await this.announceIfPeerLeft(roomId, peerId);
      }
    } catch (error) {
      this.logger.error(
        `handleDisconnect failed for ${socket.id}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @SubscribeMessage(SocketEvent.GET_STAT)
  async handleGetStat(): Promise<TStatistics | null> {
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

  @SubscribeMessage(SocketEvent.ADD_STAT)
  async handleAddStat(@MessageBody() data: TAddStat): Promise<void> {
    try {
      if (!data?.type) {
        return;
      }

      const result = await this.statsService.updateStats(
        data.type,
        data.fileSize,
      );
      if (result) {
        this.broadcastStatUpdate(result);
      }
    } catch (error) {
      this.logger.error(
        'handleAddStat failed',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @SubscribeMessage(SocketEvent.GET_RELAY_TOKEN)
  handleGetRelayToken(@ConnectedSocket() socket: RoomSocket): string | null {
    return socket.data.roomId ? this.relayTokens.issue() : null;
  }

  private claimPeerId(
    socket: RoomSocket,
    peerId: string,
    token: string,
  ): boolean {
    if (socket.data.peerId !== undefined) {
      return socket.data.peerId === peerId;
    }
    if (!this.peerClaims.acquire(peerId, token)) {
      return false;
    }
    socket.data.peerId = peerId;
    return true;
  }

  private async leaveCurrentRoom(socket: RoomSocket): Promise<void> {
    const { roomId, peerId } = socket.data;
    if (!roomId || !peerId) {
      return;
    }

    await socket.leave(roomId);
    socket.data.roomId = undefined;
    await this.announceIfPeerLeft(roomId, peerId);
  }

  // a peer stays in the room while another of its sockets is there
  private async announceIfPeerLeft(
    roomId: string,
    peerId: string,
  ): Promise<void> {
    const remainingPeerIds = await this.getPeerIds(roomId);
    if (!remainingPeerIds.includes(peerId)) {
      this.server.to(roomId).emit(SocketEvent.PEER_LEFT, peerId);
    }
  }

  private async getPeerIds(roomId: string): Promise<string[]> {
    const sockets = await this.server.in(roomId).fetchSockets();
    const peerIds = sockets
      .map((socket) => socket.data.peerId)
      .filter((peerId) => peerId !== undefined);
    return [...new Set(peerIds)];
  }

  private broadcastStatUpdate(update: TStatUpdate): void {
    this.server.emit(SocketEvent.UPDATE_STAT, update);
  }
}
