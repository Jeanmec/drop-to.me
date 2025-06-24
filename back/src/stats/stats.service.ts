import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileTransferEntity } from './entities/file-transfer.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(FileTransferEntity)
    private statsRepository: Repository<FileTransferEntity>,
  ) {}

  async addTransfer(fileSize: number) {
    const transfer = this.statsRepository.create({
      fileSize,
    });
    return this.statsRepository.save(transfer);
  }

  async getStats() {
    const count = await this.statsRepository.count();

    return {
      totalTransfers: count,
    };
  }
}
