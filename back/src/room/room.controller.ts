import { Controller, Req, Post, Body } from '@nestjs/common';
import { Request } from 'express';
import { RoomService } from './room.service';
import { SignalService } from 'src/signal/signal.service';
import { getHashedIp } from 'src/utils/ip.utils';

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly signalService: SignalService,
  ) {}

  @Post('/join/local')
  async joinLocalRoom(
    @Req() req: Request,
    @Body('peerId') peerId: string,
    @Body('socketId') socketId: string,
  ): Promise<{ peers: string[] }> {
    const room = getHashedIp(req);
    const roomJoined = await this.roomService.joinRoom(room, socketId, peerId);
    if (roomJoined) {
      await this.signalService.notifyClientJoined(room, peerId);
      const peers = await this.roomService.getTargetPeers(room, socketId);
      return { peers };
    }
    return { peers: [] };
  }
}
