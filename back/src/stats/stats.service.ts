import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileTransferEntity } from './entities/file-transfer.entity';
import { UserEntity } from './entities/user.entity';
import { MessageEntity } from './entities/message.entity';
import { TStatistics } from 'src/types/statistics.t';
import { SignalService } from 'src/signal/signal.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(FileTransferEntity)
    private readonly fileTransferRepository: Repository<FileTransferEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,

    @Inject(forwardRef(() => SignalService))
    private readonly signalService: SignalService,
  ) {}

  async addUser(): Promise<boolean> {
    try {
      const user = this.userRepository.create();
      await this.userRepository.save(user);
      const totalUsers = await this.getNumberUsers();
      this.signalService.notifyStatisticsUsersUpdated(totalUsers);
      return true;
    } catch (error) {
      this.logger.error('Error adding user', error);
      return false;
    }
  }

  async addMessage(): Promise<boolean> {
    try {
      const message = this.messageRepository.create();
      await this.messageRepository.save(message);
      return true;
    } catch (error) {
      this.logger.error('Error adding message', error);
      return false;
    }
  }

  async addTransfer(fileSize: number): Promise<boolean> {
    try {
      const transfer = this.fileTransferRepository.create({ fileSize });
      await this.fileTransferRepository.save(transfer);
      return true;
    } catch (error) {
      this.logger.error('Error adding transfer', error);
      return false;
    }
  }

  async getNumberUsers(): Promise<number> {
    return this.userRepository.count();
  }

  async getNumberMessagesSent(): Promise<number> {
    return this.messageRepository.count();
  }

  async getNumberFileTransfers(): Promise<number> {
    return this.fileTransferRepository.count();
  }

  async getSizeTransferred(): Promise<number> {
    const { totalSize } =
      (await this.fileTransferRepository
        .createQueryBuilder('transfer')
        .select('SUM(transfer.fileSize)', 'totalSize')
        .getRawOne<{ totalSize: number | null }>()) ?? {};

    return totalSize ?? 0;
  }

  async getStats(): Promise<TStatistics> {
    const [totalTransfers, sizeTransferred, users, messagesSent] =
      await Promise.all([
        this.getNumberFileTransfers(),
        this.getSizeTransferred(),
        this.getNumberUsers(),
        this.getNumberMessagesSent(),
      ]);

    return {
      totalTransfers,
      sizeTransferred,
      users,
      messagesSent,
    };
  }
}
