import { StatsService } from './stats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileTransferEntity } from './entities/file-transfer.entity';
import { UserEntity } from './entities/user.entity';
import { MessageEntity } from './entities/message.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileTransferEntity, UserEntity, MessageEntity]),
  ],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
