import { Injectable } from '@nestjs/common';
import { SignalGateway } from './signal.gateway';

@Injectable()
export class SignalService {
  constructor(private readonly signalGateway: SignalGateway) {}

  async notifyPeerJoined(room: string, peerId: string) {
    await this.signalGateway.sendPeerClientsUpdate(room, peerId);
  }
}
