import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileTransferEntity } from './entities/file-transfer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileTransferEntity])],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
