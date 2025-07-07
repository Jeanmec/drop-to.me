import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileTransferEntity } from './entities/file-transfer.entity';
import { UserEntity } from './entities/user.entity';
import { MessageEntity } from './entities/message.entity';
import { Module, forwardRef } from '@nestjs/common';
import { SignalModule } from 'src/signal/signal.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileTransferEntity, UserEntity, MessageEntity]),
    forwardRef(() => SignalModule),
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
