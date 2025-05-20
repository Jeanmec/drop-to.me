import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { removeElementFromStringArray } from 'src/utils/array.utils';

@Injectable()
export class RoomService {
  private readonly secret = process.env.IP_HASH_SECRET || 'default_salt';

  constructor(private readonly redisService: RedisService) {}

  async joinRoom(room: string, peerId: string): Promise<boolean> {
    return await this.redisService.addPeer(room, peerId);
  }

  async getPeers(room: string, peerId: string): Promise<string[]> {
    const peers = await this.redisService.getPeers(room);

    if (peers) {
      return removeElementFromStringArray(peers, peerId);
    }
    return [];
  }

  async addPeer(room: string, peerId: string): Promise<boolean> {
    const res = await this.redisService.addPeer(room, peerId);
    console.log({ res });
    return true;
    // if (res) {
    //   return true;
    // } else {
    //   return false;
    // }
  }
}
