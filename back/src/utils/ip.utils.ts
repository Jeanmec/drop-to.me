import * as crypto from 'crypto';
import { IncomingMessage } from 'http';

const secret = process.env.IP_HASH_SECRET;
if (!secret) {
  console.warn(
    'IP_HASH_SECRET is not set — using a random secret (will change on restart)',
  );
}
const resolvedSecret = secret || crypto.randomBytes(32).toString('hex');

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
  return crypto.createHmac('sha256', resolvedSecret).update(ip).digest('hex');
}
