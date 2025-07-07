import { Injectable } from '@nestjs/common';
import { SignalGateway } from './signal.gateway';

@Injectable()
export class SignalService {
  constructor(private readonly signalGateway: SignalGateway) {}

  notifyClientJoined(room: string, socketId: string, peerId: string) {
    this.signalGateway.sendSignalExcept(room, socketId, 'peer-joined', peerId);
  }

  notifyStatisticsUsersUpdated(count: number) {
    this.signalGateway.sendSignalToAll('statistics-users-updated', count);
  }

  notifyStatisticsMessagesSentUpdated(count: number) {
    this.signalGateway.sendSignalToAll(
      'statistics-messages-sent-updated',
      count,
    );
  }

  notifyStatisticsFileTransfersUpdated(count: number, size: number) {
    console.log({
      count,
      size,
    });
    this.signalGateway.sendSignalToAll('statistics-file-transfers-updated', {
      count,
      size,
    });
  }
}
