import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileTransferEntity } from './entities/file-transfer.entity';
import { UserEntity } from './entities/user.entity';
import { MessageEntity } from './entities/message.entity';
import {
  StatType,
  StatUpdateType,
  type TStatistics,
  type TStatUpdate,
} from '@droptome/shared';

const MAX_DECLARED_FILE_SIZE = 1024 ** 4;

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
  ) {}

  async addUser(): Promise<boolean> {
    try {
      const user = this.userRepository.create();
      await this.userRepository.save(user);
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

  async addTransfer(fileSize: number | undefined): Promise<boolean> {
    if (
      fileSize === undefined ||
      !Number.isInteger(fileSize) ||
      fileSize <= 0 ||
      fileSize > MAX_DECLARED_FILE_SIZE
    ) {
      this.logger.warn(`Invalid fileSize rejected: ${fileSize}`);
      return false;
    }

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
        .getRawOne<{ totalSize: string | null }>()) ?? {};

    return Number(totalSize ?? 0);
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

  async updateStats(
    type: StatType,
    fileSize?: number,
  ): Promise<TStatUpdate | null> {
    let success = false;

    switch (type) {
      case StatType.USER:
        success = await this.addUser();
        if (success) {
          const count = await this.getNumberUsers();
          return { type: StatUpdateType.USERS, count };
        }
        break;

      case StatType.MESSAGE:
        success = await this.addMessage();
        if (success) {
          const count = await this.getNumberMessagesSent();
          return { type: StatUpdateType.MESSAGES, count };
        }
        break;

      case StatType.FILE:
        success = await this.addTransfer(fileSize);
        if (success) {
          const count = await this.getNumberFileTransfers();
          const size = await this.getSizeTransferred();
          return { type: StatUpdateType.FILES, count, size };
        }
        break;

      default:
        this.logger.error(`Unknown stat type: ${String(type)}`);
        return null;
    }

    return null;
  }
}
