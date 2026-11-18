import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

const TOKEN_LIFETIME_MS = 60 * 1000;

@Injectable()
export class RelayTokensService {
  private readonly secret = process.env.RELAY_AUTH_SECRET;

  // the relay accepts "<expiry in epoch milliseconds>.<base64url HMAC-SHA256 of that expiry under the shared secret>"
  issue(): string | null {
    if (!this.secret) {
      return null;
    }

    const expiresAt = String(Date.now() + TOKEN_LIFETIME_MS);
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(expiresAt)
      .digest('base64url');
    return `${expiresAt}.${signature}`;
  }
}
