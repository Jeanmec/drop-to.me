import { Injectable } from '@nestjs/common';

const HELD_PLACE_TTL_MS = 5 * 60 * 1000;

interface HeldPlace {
  peerId: string;
  roomId: string;
  heldAt: number;
}

@Injectable()
export class HeldPlacesService {
  // insertion order is hold order
  private readonly places = new Map<string, HeldPlace>();

  hold(peerId: string, roomId: string): void {
    this.places.delete(peerId);
    this.places.set(peerId, { peerId, roomId, heldAt: Date.now() });
  }

  release(peerId: string): HeldPlace | undefined {
    const place = this.places.get(peerId);
    this.places.delete(peerId);
    return place;
  }

  listPeerIds(roomId: string): string[] {
    const deadline = Date.now() - HELD_PLACE_TTL_MS;
    return [...this.places.values()]
      .filter((place) => place.roomId === roomId && place.heldAt > deadline)
      .map((place) => place.peerId);
  }

  takeExpired(): HeldPlace[] {
    const deadline = Date.now() - HELD_PLACE_TTL_MS;
    const expired: HeldPlace[] = [];
    for (const place of this.places.values()) {
      if (place.heldAt > deadline) {
        break;
      }
      this.places.delete(place.peerId);
      expired.push(place);
    }
    return expired;
  }
}
