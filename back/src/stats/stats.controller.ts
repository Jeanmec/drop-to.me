import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SignalService } from '../signal/signal.service';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly signalService: SignalService,
  ) {}

  @Get()
  getStats() {
    return this.statsService.getStats();
  }

  @Post('/message')
  async sendMessage() {
    const request = await this.statsService.addMessage();
    if (request) {
      const messagesSent = await this.statsService.getNumberMessagesSent();
      this.signalService.notifyStatisticsMessagesSentUpdated(messagesSent);
    }
  }

  @Post('/file')
  async addTransfer(@Req() req: Request, @Body('fileSize') fileSize: number) {
    const request = await this.statsService.addTransfer(fileSize);
    if (request) {
      const totalFilesSize = await this.statsService.getSizeTransferred();
      const fileTransfers = await this.statsService.getNumberFileTransfers();
      this.signalService.notifyStatisticsFileTransfersUpdated(
        fileTransfers,
        totalFilesSize,
      );
    }
  }
}
