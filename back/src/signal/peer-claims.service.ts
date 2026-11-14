import { Injectable } from '@nestjs/common';

const RELEASED_CLAIM_TTL_MS = 60 * 60 * 1000;

interface PeerClaim {
  token: string;
  holderCount: number;
}

@Injectable()
export class PeerClaimsService {
  private readonly claims = new Map<string, PeerClaim>();
  // insertion order is release order
  private readonly releaseTimes = new Map<string, number>();

  acquire(peerId: string, token: string): boolean {
    this.forgetExpiredClaims();

    const claim = this.claims.get(peerId);
    if (!claim) {
      this.claims.set(peerId, { token, holderCount: 1 });
      return true;
    }
    if (claim.token !== token) {
      return false;
    }
    claim.holderCount += 1;
    this.releaseTimes.delete(peerId);
    return true;
  }

  release(peerId: string): void {
    const claim = this.claims.get(peerId);
    if (!claim) {
      return;
    }
    claim.holderCount -= 1;
    if (claim.holderCount === 0) {
      this.releaseTimes.set(peerId, Date.now());
    }
  }

  private forgetExpiredClaims(): void {
    const deadline = Date.now() - RELEASED_CLAIM_TTL_MS;
    for (const [peerId, releasedAt] of this.releaseTimes) {
      if (releasedAt > deadline) {
        return;
      }
      this.releaseTimes.delete(peerId);
      this.claims.delete(peerId);
    }
  }
}
