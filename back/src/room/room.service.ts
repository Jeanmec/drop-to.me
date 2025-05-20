import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { IncomingMessage } from 'http';
import { RedisService } from 'src/redis/redis.service';
import { SignalGateway } from 'src/signal/signal.gateway';

@Injectable()
export class RoomService {
  private readonly secret = process.env.IP_HASH_SECRET || 'default_salt';

  constructor(
    private readonly redisService: RedisService,
    private readonly signalGateway: SignalGateway,
  ) {}

  async joinRoom(room: string, peerId: string): Promise<boolean> {
    const res = await this.redisService.addPeer(room, peerId);
    if (res) {
      this.signalGateway.sendPeerJoinedNotification(room, peerId);
    }
  }

  async getPeers(room: string, peerId: string): Promise<string[]> {
    const peers = await this.redisService.getPeers(room);

    if (peers) {
      return peers.flatMap((peer) => (peer && peer !== peerId ? [peer] : []));
    }
    return [];
  }

  getHashedIp(req: Request): string {
    return this.hashIp(this.extractIp(req));
  }

  extractIp(req: IncomingMessage): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }

    const ip = req.socket?.remoteAddress || '';
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }

    return ip;
  }

  hashIp(ip: string): string {
    return crypto.createHmac('sha256', this.secret).update(ip).digest('hex');
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
