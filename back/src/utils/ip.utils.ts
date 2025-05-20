import * as crypto from 'crypto';
import { IncomingMessage } from 'http';

const secret = process.env.IP_HASH_SECRET || 'default_salt';

export function getHashedIp(req: IncomingMessage): string {
  const ip = extractIp(req);
  return hashIp(ip);
}

export function extractIp(req: IncomingMessage): string {
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

export function hashIp(ip: string): string {
  return crypto.createHmac('sha256', secret).update(ip).digest('hex');
}
