import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;

  onModuleInit() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  async addPeer(room: string, socketId: string): Promise<boolean> {
    const res = await this.redis.sadd(room, socketId);
    return res === 1;
  }

  async removePeer(room: string, socketId: string): Promise<boolean> {
    const res = await this.redis.srem(room, socketId);
    return res === 1;
  }

  async getPeers(room: string): Promise<string[]> {
    return await this.redis.smembers(room);
  }
}
