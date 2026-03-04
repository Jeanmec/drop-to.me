import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

const ROOM_TTL_SECONDS = 3600;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in environment variables');
    }

    this.redis = new Redis(redisUrl);

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
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
    await this.redis.expire(room, ROOM_TTL_SECONDS);
    return res === 1;
  }

  async removeClient(room: string, socketId: string): Promise<boolean> {
    const res = await this.redis.hdel(room, socketId);
    const remaining = await this.redis.hlen(room);
    if (remaining === 0) {
      await this.redis.del(room);
    }
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
