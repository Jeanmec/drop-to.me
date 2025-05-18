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

  async addClient(room: string, socketId: string) {
    await this.redis.sadd(`room:${room}`, socketId);
  }

  async removeClient(room: string, socketId: string) {
    await this.redis.srem(`room:${room}`, socketId);
  }

  async getClients(room: string): Promise<string[]> {
    return await this.redis.smembers(`room:${room}`);
  }
}
