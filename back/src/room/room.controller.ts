import { Controller, Req, Post, Body } from '@nestjs/common';
import { Request } from 'express';
import { RoomService } from './room.service';
import { SignalService } from 'src/signal/signal.service';

@Controller('room')
export class RoomController {
  constructor(
    private readonly RoomService: RoomService,
    private readonly signalService: SignalService,
  ) {}

  @Post('/join/local')
  async joinLocalRoom(
    @Req() req: Request,
    @Body('peerId') peerId: string,
  ): Promise<{ peers: string[] }> {
    const room = this.RoomService.getHashedIp(req);
    const roomJoined = await this.RoomService.joinRoom(room, peerId);
    if (roomJoined) {
      this.signalService.sendPeerJoinedNotification(room, peerId);

      const peers = await this.RoomService.getPeers(room, peerId);
      return { peers };
    }
    return { peers: [] };
  }
}
