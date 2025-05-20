import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { StatsService } from '../stats/stats.service';
import { RoomService } from 'src/room/room.service';
import { RedisService } from 'src/redis/redis.service';

interface SignalData {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  room: string;
  fileSize?: number;
}

@WebSocketGateway({ cors: true })
export class SignalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;

  constructor(
    private redisService: RedisService,
    private statsService: StatsService,
    private RoomService: RoomService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(socket: Socket) {
    const ip = this.RoomService.extractIp(socket.request);
    const hashedIp = this.RoomService.hashIp(ip);

    await socket.join(hashedIp);
    socket.emit('room', hashedIp);
  }

  async handleDisconnect(socket: Socket) {
    const ip = this.RoomService.extractIp(socket.request);
    const hashedIp = this.RoomService.hashIp(ip);

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

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: { room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const ip = this.RoomService.extractIp(socket.request);
    const hashedIp = this.RoomService.hashIp(ip);

    await socket.join(data.room);
    socket.emit('room', data.room);

    const peers = await this.redisService.getPeers(data.room);
    socket.emit('peers', peers);

    this.server.to(data.room).emit('peer-joined', hashedIp);
  }
  @SubscribeMessage('leave')
  async handleLeave(
    @MessageBody() data: { room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const ip = this.RoomService.extractIp(socket.request);
    const hashedIp = this.RoomService.hashIp(ip);

    await socket.leave(data.room);
    socket.emit('room', data.room);

    this.server.to(data.room).emit('peer-left', hashedIp);
  }
  @SubscribeMessage('getPeers')
  async handleGetPeers(
    @MessageBody() data: { room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const peers = await this.redisService.getPeers(data.room);
    socket.emit('peers', peers);
  }
}
