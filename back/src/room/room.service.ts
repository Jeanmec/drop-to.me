import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { getPeersFromClients, removePeerById } from 'src/utils/array.utils';

@Injectable()
export class RoomService {
  private readonly secret = process.env.IP_HASH_SECRET || 'default_salt';

  constructor(private readonly redisService: RedisService) {}

  async joinRoom(
    room: string,
    socketId: string,
    peerId: string,
  ): Promise<boolean> {
    return await this.redisService.addClient(room, socketId, peerId);
  }

  async getTargetPeers(room: string, socketId: string): Promise<string[]> {
    const targetPeerIds = await this.redisService.getPeerIdsExcept(
      room,
      socketId,
    );

    return targetPeerIds;
  }
}
