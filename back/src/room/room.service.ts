import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RoomService {
  constructor(private readonly redisService: RedisService) {}

  async joinRoom(
    room: string,
    socketId: string,
    peerId: string,
  ): Promise<boolean> {
    return await this.redisService.addPeer(room, socketId, peerId);
  }

  async getTargetPeers(room: string, socketId: string): Promise<string[]> {
    return await this.redisService.getPeerIdsExcept(room, socketId);
  }
}
