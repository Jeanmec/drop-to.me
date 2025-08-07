import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in environment variables');
    }

    this.redis = new Redis(redisUrl);
  }

  async addPeer(
    room: string,
    socketId: string,
    peerId: string,
  ): Promise<boolean> {
    const alreadyExists = await this.redis.hexists(room, socketId);
    if (alreadyExists) {
      return false;
    }
    const res = await this.redis.hset(room, socketId, peerId);
    return res === 1;
  }

  async removeClient(room: string, socketId: string): Promise<boolean> {
    const res = await this.redis.hdel(room, socketId);
    return res === 1;
  }

  async getClients(room: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(room);
  }

  async getClient(room: string, socketId: string): Promise<string | null> {
    return await this.redis.hget(room, socketId);
  }

  async getPeerIdsExcept(
    room: string,
    socketIdToExclude: string,
  ): Promise<string[]> {
    const clients = await this.redis.hgetall(room);
    return Object.entries(clients)
      .filter(([socketId]) => socketId !== socketIdToExclude)
      .map(([, peerId]) => peerId);
  }
}
