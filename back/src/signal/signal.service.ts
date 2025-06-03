import { Injectable } from '@nestjs/common';
import { SignalGateway } from './signal.gateway';

@Injectable()
export class SignalService {
  constructor(private readonly signalGateway: SignalGateway) {}

  notifyClientJoined(room: string, socketId: string, peerId: string) {
    this.signalGateway.sendSignalExcept(room, socketId, 'peer-joined', peerId);
  }
}
