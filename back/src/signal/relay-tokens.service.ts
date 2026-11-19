import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

const TOKEN_LIFETIME_MS = 60 * 1000;

const readSecret = (): string => {
  const secret = process.env.RELAY_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'RELAY_AUTH_SECRET is not defined in environment variables',
    );
  }
  return secret;
};

@Injectable()
export class RelayTokensService {
  private readonly secret = readSecret();

  // the relay accepts "<expiry in epoch milliseconds>.<base64url HMAC-SHA256 of that expiry under the shared secret>"
  issue(): string {
    const expiresAt = String(Date.now() + TOKEN_LIFETIME_MS);
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(expiresAt)
      .digest('base64url');
    return `${expiresAt}.${signature}`;
  }
}
