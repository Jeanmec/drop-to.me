import { Injectable } from '@nestjs/common';
import { SignalGateway } from './signal.gateway';

@Injectable()
export class SignalService {
  constructor(private readonly signalGateway: SignalGateway) {}

  notifyClientJoined(room: string, peerId: string) {
    this.signalGateway.sendClientJoin(room, peerId);
  }
}
