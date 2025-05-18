import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileTransfer } from './stats.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(FileTransfer)
    private repo: Repository<FileTransfer>,
  ) {}

  async addTransfer(senderIp: string, receiverIp: string, fileSize: number) {
    const transfer = this.repo.create({ senderIp, receiverIp, fileSize });
    return this.repo.save(transfer);
  }

  async getStats() {
    const count = await this.repo.count();

    return {
      totalTransfers: count,
    };
  }
}
