import { Injectable } from '@nestjs/common';
import { SignalGateway } from './signal.gateway';
import { TUpdateStatPayload } from '../types/statistics.t';

@Injectable()
export class SignalService {
  constructor(private readonly signalGateway: SignalGateway) {}

  notifyClientJoined(room: string, socketId: string, peerId: string) {
    this.signalGateway.sendSignalExcept(room, socketId, 'peer-joined', peerId);
  }

  notifyStatisticsUsersUpdated(count: number) {
    const payload: TUpdateStatPayload = {
      type: 'users',
      count,
    };
    this.signalGateway.sendSignalToAll('update-stat', payload);
  }

  notifyStatisticsMessagesSentUpdated(count: number) {
    const payload: TUpdateStatPayload = {
      type: 'messages',
      count,
    };
    this.signalGateway.sendSignalToAll('update-stat', payload);
  }

  notifyStatisticsFileTransfersUpdated(count: number, size: number) {
    const payload: TUpdateStatPayload = {
      type: 'files',
      count,
      size,
    };
    this.signalGateway.sendSignalToAll('update-stat', payload);
  }
}
